"use client";

import Image from "next/image";
import { clamp, roundTo } from "@/lib/math";
import type { WallArtPiece } from "@/sanity/types";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
  type TransitionEvent,
} from "react";

type Attachment = "pushpin" | "washi" | "none";
type PieceMode = "mounted" | "falling" | "loose" | "dragging" | "removed";
type MountedPosition = { xPercent: number; yPercent: number };
type LoosePosition = { xPx: number; yPx: number };
type BlockerRect = { minX: number; maxX: number; minY: number; maxY: number };
type WallPieceStyle = CSSProperties & {
  "--wall-art-rotation"?: string;
  "--wall-art-transform-origin"?: string;
};
type DragState = { pointerId: number; offsetX: number; offsetY: number };
type PressState = {
  pointerId: number;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
};

const DRAG_THRESHOLD_PX = 8;
const BLOCKER_GUTTER_PX = 10;

/**
 * Only the most-recently-dropped piece needs an elevated z-index.
 * When a new piece is dropped, we demote the previous one back to baseline.
 * Z-index stays bounded: pieces are either at their seed value (1–6) or at TOP_Z (10).
 */
const TOP_Z = 10;
let demotePrevious: (() => void) | null = null;

const MOBILE_BREAKPOINT_PX = 768;
const WALL_EDGE_PADDING_PX = 28;
const PIECE_GUTTER_PX = 20;
const MAX_PIECES_DESKTOP = 12;
const MAX_PIECES_MOBILE = 6;
const MAX_PLACEMENT_ATTEMPTS = 80;
const RESIZE_BUCKET_PX = 200;
const RESIZE_DEBOUNCE_MS = 200;

const ART_SIZES_DESKTOP = {
  small: { w: 90, h: 110 },
  medium: { w: 120, h: 150 },
  large: { w: 150, h: 190 },
} as const;

const ART_SIZES_MOBILE = {
  small: { w: 60, h: 74 },
  medium: { w: 80, h: 100 },
  large: { w: 100, h: 127 },
} as const;

const FALLBACK_ART_SIZES_DESKTOP = [
  { w: 112, h: 144 },
  { w: 128, h: 128 },
  { w: 96, h: 96 },
  { w: 120, h: 160 },
  { w: 96, h: 128 },
  { w: 80, h: 112 },
  { w: 128, h: 80 },
  { w: 100, h: 100 },
  { w: 90, h: 120 },
  { w: 110, h: 140 },
];

const FALLBACK_ART_SIZES_MOBILE = [
  { w: 75, h: 96 },
  { w: 85, h: 85 },
  { w: 64, h: 64 },
  { w: 80, h: 107 },
  { w: 64, h: 85 },
  { w: 53, h: 75 },
  { w: 85, h: 53 },
  { w: 67, h: 67 },
  { w: 60, h: 80 },
  { w: 73, h: 93 },
];

const PUSH_PIN_COLORS = [
  "var(--theme-wall-art-pin-red)",
  "var(--theme-wall-art-pin-yellow)",
  "var(--theme-wall-art-pin-green)",
  "var(--theme-wall-art-pin-blue)",
];

function hashString(value: string) {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getRelativePosition(
  element: HTMLElement,
  container: HTMLElement
): LoosePosition {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return {
    xPx: elementRect.left - containerRect.left,
    yPx: elementRect.top - containerRect.top,
  };
}

function toPercent(px: number, total: number) {
  return total <= 0 ? 0 : (px / total) * 100;
}

function getWallAxisBounds(containerSize: number, pieceSize: number) {
  const maxOffset = Math.max(0, containerSize - pieceSize);
  const min = Math.min(WALL_EDGE_PADDING_PX, maxOffset / 2);
  const max = Math.max(min, maxOffset - WALL_EDGE_PADDING_PX);

  return { min, max };
}

function getBlockerRects(container: HTMLElement): BlockerRect[] {
  const containerRect = container.getBoundingClientRect();

  return Array.from(
    document.querySelectorAll<HTMLElement>("[data-wall-art-blocker='true']")
  )
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.height > 0)
    .filter(
      (rect) =>
        rect.right > containerRect.left &&
        rect.left < containerRect.right &&
        rect.bottom > containerRect.top &&
        rect.top < containerRect.bottom
    )
    .map((rect) => ({
      minX: rect.left - containerRect.left - BLOCKER_GUTTER_PX,
      maxX: rect.right - containerRect.left + BLOCKER_GUTTER_PX,
      minY: rect.top - containerRect.top - BLOCKER_GUTTER_PX,
      maxY: rect.bottom - containerRect.top + BLOCKER_GUTTER_PX,
    }));
}

function expandBlockerRects(blockers: BlockerRect[], amount: number) {
  return blockers.map((blocker) => ({
    minX: blocker.minX - amount,
    maxX: blocker.maxX + amount,
    minY: blocker.minY - amount,
    maxY: blocker.maxY + amount,
  }));
}

type PiecePlacement = {
  xPercent: number;
  yPercent: number;
  width: number;
  height: number;
} | null;

function rectsOverlap(a: BlockerRect, b: BlockerRect) {
  return a.maxX > b.minX && a.minX < b.maxX && a.maxY > b.minY && a.minY < b.maxY;
}

function rangesOverlap(minA: number, maxA: number, minB: number, maxB: number) {
  return maxA > minB && minA < maxB;
}

function computePieceLayout({
  containerWidth,
  containerHeight,
  blockerRects,
  pieceSizes,
  maxCount,
  seed,
}: {
  containerWidth: number;
  containerHeight: number;
  blockerRects: BlockerRect[];
  pieceSizes: Array<{ w: number; h: number }>;
  maxCount: number;
  seed: number;
}): PiecePlacement[] {
  const placements: PiecePlacement[] = [];
  const placedRects: BlockerRect[] = [];

  // Divide container into a grid for even spatial distribution
  const cols = Math.max(3, Math.floor(containerWidth / 250));
  const rows = Math.max(2, Math.floor(containerHeight / 250));
  const cellW = containerWidth / cols;
  const cellH = containerHeight / rows;

  // Build cell list and shuffle with seeded random
  const cells: Array<{ col: number; row: number }> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ col: c, row: r });
    }
  }
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i * 31) * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  let cellCursor = 0;

  for (let i = 0; i < maxCount; i++) {
    const { w, h } = pieceSizes[i % pieceSizes.length];
    const xBounds = getWallAxisBounds(containerWidth, w);
    const yBounds = getWallAxisBounds(containerHeight, h);

    if (
      w + WALL_EDGE_PADDING_PX * 2 > containerWidth ||
      h + WALL_EDGE_PADDING_PX * 2 > containerHeight
    ) {
      placements.push(null);
      continue;
    }

    let placed = false;

    // Try each cell starting from cursor, wrapping around
    for (let c = 0; c < cells.length && !placed; c++) {
      const cell = cells[(cellCursor + c) % cells.length];
      const cellLeft = cell.col * cellW;
      const cellTop = cell.row * cellH;

      // Try random positions within this cell
      for (let attempt = 0; attempt < 10; attempt++) {
        const localSeed = seed + i * 1000 + c * 100 + attempt * 7;
        const xPx = clamp(
          cellLeft + seededRandom(localSeed) * (cellW - w),
          xBounds.min,
          xBounds.max
        );
        const yPx = clamp(
          cellTop + seededRandom(localSeed + 3) * (cellH - h),
          yBounds.min,
          yBounds.max
        );

        const candidateRect: BlockerRect = {
          minX: xPx - PIECE_GUTTER_PX,
          maxX: xPx + w + PIECE_GUTTER_PX,
          minY: yPx - PIECE_GUTTER_PX,
          maxY: yPx + h + PIECE_GUTTER_PX,
        };

        if (
          blockerRects.some((b) => rectsOverlap(candidateRect, b)) ||
          placedRects.some((p) => rectsOverlap(candidateRect, p))
        ) {
          continue;
        }

        placedRects.push(candidateRect);
        placements.push({
          xPercent: roundTo(toPercent(xPx, containerWidth), 4),
          yPercent: roundTo(toPercent(yPx, containerHeight), 4),
          width: w,
          height: h,
        });
        placed = true;
        cellCursor = (cellCursor + c + 1) % cells.length;
        break;
      }
    }

    if (!placed) {
      placements.push(null);
    }
  }

  return placements;
}

function overlapsBlocker(
  position: LoosePosition,
  pieceWidth: number,
  pieceHeight: number,
  blocker: BlockerRect
) {
  return (
    position.xPx < blocker.maxX &&
    position.xPx + pieceWidth > blocker.minX &&
    position.yPx < blocker.maxY &&
    position.yPx + pieceHeight > blocker.minY
  );
}

function projectOutsideBlockers(
  position: LoosePosition,
  containerWidth: number,
  containerHeight: number,
  pieceWidth: number,
  pieceHeight: number,
  blockers: BlockerRect[]
) {
  const xBounds = getWallAxisBounds(containerWidth, pieceWidth);
  const yBounds = getWallAxisBounds(containerHeight, pieceHeight);
  let projected = {
    xPx: clamp(position.xPx, xBounds.min, xBounds.max),
    yPx: clamp(position.yPx, yBounds.min, yBounds.max),
  };

  for (let i = 0; i < blockers.length * 2; i += 1) {
    const overlappingBlocker = blockers.find((blocker) =>
      overlapsBlocker(projected, pieceWidth, pieceHeight, blocker)
    );

    if (!overlappingBlocker) {
      return projected;
    }

    const candidates = [
      {
        xPx: clamp(overlappingBlocker.minX - pieceWidth, xBounds.min, xBounds.max),
        yPx: projected.yPx,
      },
      {
        xPx: clamp(overlappingBlocker.maxX, xBounds.min, xBounds.max),
        yPx: projected.yPx,
      },
      {
        xPx: projected.xPx,
        yPx: clamp(overlappingBlocker.minY - pieceHeight, yBounds.min, yBounds.max),
      },
      {
        xPx: projected.xPx,
        yPx: clamp(overlappingBlocker.maxY, yBounds.min, yBounds.max),
      },
    ];

    projected = candidates.reduce((bestCandidate, candidate) => {
      const bestDistance =
        (bestCandidate.xPx - position.xPx) ** 2 +
        (bestCandidate.yPx - position.yPx) ** 2;
      const candidateDistance =
        (candidate.xPx - position.xPx) ** 2 +
        (candidate.yPx - position.yPx) ** 2;

      return candidateDistance < bestDistance ? candidate : bestCandidate;
    });
  }

  return projected;
}

function resolveHorizontalDrag(
  position: LoosePosition,
  targetX: number,
  minX: number,
  maxX: number,
  pieceWidth: number,
  pieceHeight: number,
  blockers: BlockerRect[]
) {
  let resolvedX = clamp(targetX, minX, maxX);

  if (resolvedX === position.xPx) {
    return resolvedX;
  }

  const movingRight = resolvedX > position.xPx;

  for (const blocker of blockers) {
    if (
      !rangesOverlap(
        position.yPx,
        position.yPx + pieceHeight,
        blocker.minY,
        blocker.maxY
      )
    ) {
      continue;
    }

    if (movingRight) {
      const stopX = blocker.minX - pieceWidth;
      if (position.xPx <= stopX && resolvedX > stopX) {
        resolvedX = Math.min(resolvedX, stopX);
      }
      continue;
    }

    const stopX = blocker.maxX;
    if (position.xPx >= stopX && resolvedX < stopX) {
      resolvedX = Math.max(resolvedX, stopX);
    }
  }

  return clamp(resolvedX, minX, maxX);
}

function resolveVerticalDrag(
  position: LoosePosition,
  targetY: number,
  minY: number,
  maxY: number,
  pieceWidth: number,
  pieceHeight: number,
  blockers: BlockerRect[]
) {
  let resolvedY = clamp(targetY, minY, maxY);

  if (resolvedY === position.yPx) {
    return resolvedY;
  }

  const movingDown = resolvedY > position.yPx;

  for (const blocker of blockers) {
    if (
      !rangesOverlap(
        position.xPx,
        position.xPx + pieceWidth,
        blocker.minX,
        blocker.maxX
      )
    ) {
      continue;
    }

    if (movingDown) {
      const stopY = blocker.minY - pieceHeight;
      if (position.yPx <= stopY && resolvedY > stopY) {
        resolvedY = Math.min(resolvedY, stopY);
      }
      continue;
    }

    const stopY = blocker.maxY;
    if (position.yPx >= stopY && resolvedY < stopY) {
      resolvedY = Math.max(resolvedY, stopY);
    }
  }

  return clamp(resolvedY, minY, maxY);
}

function resolveDragPath(
  currentPosition: LoosePosition,
  targetPosition: LoosePosition,
  containerWidth: number,
  containerHeight: number,
  pieceWidth: number,
  pieceHeight: number,
  blockers: BlockerRect[]
) {
  const xBounds = getWallAxisBounds(containerWidth, pieceWidth);
  const yBounds = getWallAxisBounds(containerHeight, pieceHeight);
  const clampedTarget = {
    xPx: clamp(targetPosition.xPx, xBounds.min, xBounds.max),
    yPx: clamp(targetPosition.yPx, yBounds.min, yBounds.max),
  };
  const startPosition = projectOutsideBlockers(
    currentPosition,
    containerWidth,
    containerHeight,
    pieceWidth,
    pieceHeight,
    blockers
  );

  const horizontalFirst = () => {
    const afterX = {
      xPx: resolveHorizontalDrag(
        startPosition,
        clampedTarget.xPx,
        xBounds.min,
        xBounds.max,
        pieceWidth,
        pieceHeight,
        blockers
      ),
      yPx: startPosition.yPx,
    };

    return {
      xPx: afterX.xPx,
      yPx: resolveVerticalDrag(
        afterX,
        clampedTarget.yPx,
        yBounds.min,
        yBounds.max,
        pieceWidth,
        pieceHeight,
        blockers
      ),
    };
  };

  const verticalFirst = () => {
    const afterY = {
      xPx: startPosition.xPx,
      yPx: resolveVerticalDrag(
        startPosition,
        clampedTarget.yPx,
        yBounds.min,
        yBounds.max,
        pieceWidth,
        pieceHeight,
        blockers
      ),
    };

    return {
      xPx: resolveHorizontalDrag(
        afterY,
        clampedTarget.xPx,
        xBounds.min,
        xBounds.max,
        pieceWidth,
        pieceHeight,
        blockers
      ),
      yPx: afterY.yPx,
    };
  };

  const xThenY = horizontalFirst();
  const yThenX = verticalFirst();
  const xThenYDistance =
    (xThenY.xPx - clampedTarget.xPx) ** 2 +
    (xThenY.yPx - clampedTarget.yPx) ** 2;
  const yThenXDistance =
    (yThenX.xPx - clampedTarget.xPx) ** 2 +
    (yThenX.yPx - clampedTarget.yPx) ** 2;

  return projectOutsideBlockers(
    yThenXDistance < xThenYDistance ? yThenX : xThenY,
    containerWidth,
    containerHeight,
    pieceWidth,
    pieceHeight,
    blockers
  );
}

function projectToWall(
  position: LoosePosition,
  currentPosition: LoosePosition | null,
  container: HTMLElement,
  containerWidth: number,
  containerHeight: number,
  pieceWidth: number,
  pieceHeight: number
) {
  const blockers = expandBlockerRects(getBlockerRects(container), PIECE_GUTTER_PX);

  return currentPosition
    ? resolveDragPath(
        currentPosition,
        position,
        containerWidth,
        containerHeight,
        pieceWidth,
        pieceHeight,
        blockers
      )
    : projectOutsideBlockers(
        position,
        containerWidth,
        containerHeight,
        pieceWidth,
        pieceHeight,
        blockers
      );
}

function Pushpin({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 24 32"
      className="pointer-events-none absolute -top-3 left-1/2 z-10 h-6 w-5 -translate-x-1/2"
      style={{ filter: "drop-shadow(1px 2px 2px rgba(0,0,0,0.4))" }}
    >
      <line
        x1="12"
        y1="18"
        x2="12"
        y2="30"
        stroke="var(--theme-border-strong)"
        strokeWidth="1"
        opacity="0.6"
      />
      <circle cx="12" cy="11" r="7" fill={color} />
      <circle
        cx="12"
        cy="11"
        r="7"
        fill="none"
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="1"
      />
      <ellipse cx="10" cy="9" rx="3.5" ry="2.5" fill="white" opacity="0.35" />
      <circle cx="9" cy="8" r="1.2" fill="white" opacity="0.5" />
    </svg>
  );
}

function WashiTape({ seed }: { seed: number }) {
  const isLeft = seededRandom(seed * 777) > 0.5;
  const rotation = (seededRandom(seed * 333) - 0.5) * 30;

  return (
    <div
      className="pointer-events-none absolute z-10 overflow-hidden"
      style={{
        width: "44px",
        height: "16px",
        transform: `rotate(${rotation}deg)`,
        top: "-6px",
        ...(isLeft ? { left: "-10px" } : { right: "-10px" }),
        borderRadius: "1px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        background: `
          repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px),
          linear-gradient(180deg, rgba(220,205,175,0.6) 0%, rgba(200,185,155,0.5) 100%)
        `,
      }}
    >
      <div
        className="absolute inset-y-0 left-0 w-[2px] opacity-30"
        style={{ borderLeft: "1px dashed rgba(180,160,130,0.4)" }}
      />
      <div
        className="absolute inset-y-0 right-0 w-[2px] opacity-30"
        style={{ borderRight: "1px dashed rgba(180,160,130,0.4)" }}
      />
    </div>
  );
}

function FallbackArt({
  index,
  label,
  quote,
}: {
  index: number;
  label: string;
  quote: string;
}) {
  const arts = [
    <svg key="a1" viewBox="0 0 100 130" className="h-full w-full">
      <rect width="100" height="130" fill="var(--theme-wall-art-ink)" />
      <circle
        cx="50"
        cy="50"
        r="30"
        fill="none"
        stroke="var(--theme-wall-art-accent)"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <circle cx="50" cy="50" r="18" fill="var(--theme-wall-art-accent)" opacity="0.15" />
      <circle cx="50" cy="50" r="5" fill="var(--theme-wall-art-accent)" opacity="0.5" />
      <rect x="20" y="100" width="60" height="1" fill="var(--theme-foreground)" opacity="0.1" />
    </svg>,
    <svg key="a2" viewBox="0 0 100 100" className="h-full w-full">
      <rect width="100" height="100" fill="var(--theme-decorative-secondary)" />
      <polygon points="0,75 35,30 65,75" fill="var(--theme-decorative-tertiary)" opacity="0.5" />
      <polygon points="35,75 65,20 100,75" fill="var(--theme-decorative-tertiary)" opacity="0.6" />
      <circle cx="78" cy="18" r="10" fill="var(--theme-decorative-accent)" opacity="0.35" />
      <rect x="0" y="73" width="100" height="27" fill="var(--theme-decorative-secondary)" opacity="0.8" />
    </svg>,
    <svg key="a3" viewBox="0 0 80 80" className="h-full w-full">
      <rect width="80" height="80" fill="var(--theme-decorative-secondary)" />
      <rect x="10" y="10" width="25" height="60" rx="1" fill="var(--theme-decorative-primary)" opacity="0.6" />
      <rect x="40" y="20" width="25" height="50" rx="1" fill="var(--theme-decorative-accent)" opacity="0.4" />
      <circle cx="55" cy="25" r="8" fill="var(--theme-accent)" opacity="0.3" />
    </svg>,
    <svg key="a4" viewBox="0 0 100 135" className="h-full w-full">
      <rect width="100" height="135" fill="var(--theme-wall-art-ink)" />
      <circle cx="50" cy="55" r="35" fill="none" stroke="var(--theme-border)" strokeWidth="0.5" />
      <circle cx="50" cy="55" r="28" fill="none" stroke="var(--theme-border)" strokeWidth="0.5" />
      <circle cx="50" cy="55" r="21" fill="none" stroke="var(--theme-border)" strokeWidth="0.5" />
      <circle cx="50" cy="55" r="38" fill="none" stroke="var(--theme-border-strong)" strokeWidth="1" />
      <circle cx="50" cy="55" r="7" fill="var(--theme-wall-art-accent)" />
      <circle cx="50" cy="55" r="2" fill="var(--theme-wall-art-ink)" />
      <text
        x="50"
        y="110"
        textAnchor="middle"
        fill="var(--theme-foreground)"
        fontSize="5"
        opacity="0.4"
        fontFamily="sans-serif"
        letterSpacing="3"
      >
        {label}
      </text>
    </svg>,
    <svg key="a5" viewBox="0 0 80 110" className="h-full w-full">
      <rect width="80" height="110" fill="var(--theme-wall-art-ink)" />
      <line x1="15" y1="20" x2="65" y2="20" stroke="var(--theme-wall-art-accent)" strokeWidth="1" opacity="0.5" />
      <line x1="20" y1="35" x2="60" y2="35" stroke="var(--theme-wall-art-accent)" strokeWidth="1" opacity="0.4" />
      <line x1="25" y1="50" x2="55" y2="50" stroke="var(--theme-wall-art-accent)" strokeWidth="1" opacity="0.3" />
      <line x1="30" y1="65" x2="50" y2="65" stroke="var(--theme-wall-art-accent)" strokeWidth="1" opacity="0.2" />
      <circle cx="40" cy="85" r="3" fill="var(--theme-wall-art-accent)" opacity="0.4" />
    </svg>,
    <svg key="a6" viewBox="0 0 70 100" className="h-full w-full">
      <rect width="70" height="100" fill="var(--theme-wall-art-ink)" />
      <rect x="10" y="10" width="50" height="30" rx="1" fill="var(--theme-decorative-tertiary)" opacity="0.5" />
      <rect x="10" y="45" width="50" height="15" rx="1" fill="var(--theme-decorative-primary)" opacity="0.5" />
      <rect x="10" y="65" width="50" height="25" rx="1" fill="var(--theme-decorative-secondary)" opacity="0.5" />
    </svg>,
    <svg key="a7" viewBox="0 0 130 80" className="h-full w-full">
      <rect width="130" height="80" fill="var(--theme-wall-art-ink)" />
      <text
        x="65"
        y="38"
        textAnchor="middle"
        fill="var(--theme-foreground)"
        fontSize="8"
        opacity="0.25"
        fontFamily="serif"
        fontStyle="italic"
      >
        {quote}
      </text>
      <rect x="40" y="50" width="50" height="0.5" fill="var(--theme-foreground)" opacity="0.1" />
    </svg>,
    <svg key="a8" viewBox="0 0 80 80" className="h-full w-full">
      <rect width="80" height="80" fill="var(--theme-wall-art-ink)" />
      <polygon
        points="40,10 70,65 10,65"
        fill="none"
        stroke="var(--theme-wall-art-accent)"
        strokeWidth="1"
        opacity="0.4"
      />
      <polygon
        points="40,25 58,58 22,58"
        fill="none"
        stroke="var(--theme-wall-art-accent)"
        strokeWidth="0.5"
        opacity="0.3"
      />
      <circle cx="40" cy="48" r="4" fill="var(--theme-wall-art-accent)" opacity="0.3" />
    </svg>,
    <svg key="a9" viewBox="0 0 100 100" className="h-full w-full">
      <rect width="100" height="100" fill="var(--theme-border)" />
      <circle cx="55" cy="30" r="15" fill="var(--theme-accent)" opacity="0.5" />
      <rect x="0" y="55" width="100" height="45" fill="var(--theme-surface-elevated)" />
      <rect x="15" y="50" width="16" height="30" rx="1" fill="var(--theme-decorative-primary)" />
      <rect x="38" y="42" width="13" height="38" rx="1" fill="var(--theme-decorative-secondary)" />
      <rect x="58" y="48" width="13" height="32" rx="1" fill="var(--theme-decorative-tertiary)" />
    </svg>,
    <svg key="a10" viewBox="0 0 75 100" className="h-full w-full">
      <rect width="75" height="100" fill="var(--theme-wall-art-ink)" />
      <circle
        cx="37"
        cy="35"
        r="20"
        fill="none"
        stroke="var(--theme-decorative-accent-soft)"
        strokeWidth="1"
        opacity="0.5"
      />
      <circle
        cx="37"
        cy="35"
        r="12"
        fill="none"
        stroke="var(--theme-decorative-accent-soft)"
        strokeWidth="0.5"
        opacity="0.3"
      />
      <rect x="15" y="70" width="45" height="2" rx="1" fill="var(--theme-decorative-accent-soft)" opacity="0.3" />
      <rect x="20" y="78" width="35" height="2" rx="1" fill="var(--theme-decorative-accent-soft)" opacity="0.2" />
    </svg>,
  ];

  return arts[index % arts.length];
}

function getSafeWallArtHref(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsedUrl = new URL(value);

    return ["http:", "https:"].includes(parsedUrl.protocol)
      ? parsedUrl.toString()
      : null;
  } catch {
    return null;
  }
}

function CmsArtPiece({
  piece,
  width,
  href,
}: {
  piece: WallArtPiece;
  width: number;
  href: string | null;
}) {
  if (!piece.imageUrl) {
    return null;
  }

  const style = piece.style || "poster";
  const imageSizes = `${width}px`;

  const linkBadge = href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${piece.title}`}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      className="theme-tooltip theme-focus-ring absolute right-1.5 top-1.5 z-20 rounded-full px-2 py-1 text-[9px] font-medium uppercase tracking-[0.18em] transition-colors hover:brightness-110"
    >
      Link
    </a>
  ) : null;

  if (style === "polaroid") {
    return (
      <div
        className="relative h-full w-full rounded-sm p-2 pb-6 shadow-inner"
        style={{ backgroundColor: "var(--theme-wall-art-paper)" }}
      >
        {linkBadge}
        <div className="relative h-full w-full overflow-hidden rounded-[1px]">
          <Image
            src={piece.imageUrl}
            alt={piece.image?.alt || piece.title}
            fill
            sizes={imageSizes}
            className="object-cover"
            draggable={false}
          />
        </div>
        {piece.caption ? (
          <span className="theme-text-muted absolute bottom-1.5 left-0 right-0 text-center text-[10px] font-medium">
            {piece.caption}
          </span>
        ) : null}
      </div>
    );
  }

  if (style === "framed") {
    return (
      <div
        className="h-full w-full rounded-sm border-2 p-1"
        style={{
          borderColor: "var(--theme-border-strong)",
          backgroundColor: "var(--theme-surface)",
        }}
      >
        {linkBadge}
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src={piece.imageUrl}
            alt={piece.image?.alt || piece.title}
            fill
            sizes={imageSizes}
            className="object-cover"
            draggable={false}
          />
        </div>
      </div>
    );
  }

  if (style === "frameless") {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-sm">
        {linkBadge}
        <Image
          src={piece.imageUrl}
          alt={piece.image?.alt || piece.title}
          fill
          sizes={imageSizes}
          className="object-cover"
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      className="h-full w-full overflow-hidden rounded-sm border p-1"
      style={{
        borderColor: "color-mix(in srgb, var(--theme-border) 70%, transparent)",
        backgroundColor: "var(--theme-surface-elevated)",
      }}
    >
      {linkBadge}
      <div className="relative h-full w-full overflow-hidden rounded-[1px]">
        <Image
          src={piece.imageUrl}
          alt={piece.image?.alt || piece.title}
          fill
          sizes={imageSizes}
          className="object-cover"
          draggable={false}
        />
      </div>
    </div>
  );
}

const serverMediaSnapshot = () => false;

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query]
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query]
  );

  return useSyncExternalStore(subscribe, getSnapshot, serverMediaSnapshot);
}

function WallPiece({
  index,
  width,
  height,
  rotation,
  zIndex,
  attachment,
  pinColor,
  seed,
  initialMountedPosition,
  playIntro,
  reducedMotion,
  decorative,
  containerRef,
  children,
}: {
  index: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  attachment: Attachment;
  pinColor: string;
  seed: number;
  initialMountedPosition: MountedPosition;
  playIntro: boolean;
  reducedMotion: boolean;
  decorative: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const pieceRef = useRef<HTMLDivElement>(null);
  const fallFrameRef = useRef<number | null>(null);
  const pressStateRef = useRef<PressState | null>(null);
  const [mode, setMode] = useState<PieceMode>("mounted");
  const [mountedPosition, setMountedPosition] =
    useState<MountedPosition>(initialMountedPosition);
  const [loosePosition, setLoosePosition] = useState<LoosePosition | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [effectiveZIndex, setEffectiveZIndex] = useState(zIndex);
  const [hasEntered, setHasEntered] = useState(false);
  const shouldSkipIntro = reducedMotion || !playIntro;

  useEffect(() => {
    if (shouldSkipIntro) {
      const frameId = window.requestAnimationFrame(() => {
        setHasEntered(true);
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    const timeoutId = window.setTimeout(
      () => setHasEntered(true),
      180 + index * 70
    );

    return () => window.clearTimeout(timeoutId);
  }, [index, shouldSkipIntro]);

  useEffect(() => {
    return () => {
      if (fallFrameRef.current !== null) {
        window.cancelAnimationFrame(fallFrameRef.current);
      }
    };
  }, []);

  const getMetrics = () => {
    const container = containerRef.current;
    const element = pieceRef.current;

    if (!container || !element) {
      return null;
    }

    const containerRect = container.getBoundingClientRect();

    return {
      container,
      element,
      containerRect,
      maxX: Math.max(0, containerRect.width - width),
      maxY: Math.max(0, containerRect.height - height),
    };
  };

  const getLoosePositionFromPointer = (
    clientX: number,
    clientY: number,
    offsetX: number,
    offsetY: number
  ) => {
    const metrics = getMetrics();

    if (!metrics) {
      return null;
    }

    const currentPosition =
      loosePosition ?? getRelativePosition(metrics.element, metrics.container);

    return projectToWall(
      {
        xPx: clientX - metrics.containerRect.left - offsetX,
        yPx: clientY - metrics.containerRect.top - offsetY,
      },
      currentPosition,
      metrics.container,
      metrics.containerRect.width,
      metrics.containerRect.height,
      width,
      height
    );
  };

  const pinLoosePosition = (position: LoosePosition) => {
    const metrics = getMetrics();

    if (!metrics) {
      return;
    }

    const currentPosition =
      loosePosition ?? getRelativePosition(metrics.element, metrics.container);
    const clampedPosition = projectToWall(
      position,
      currentPosition,
      metrics.container,
      metrics.containerRect.width,
      metrics.containerRect.height,
      width,
      height
    );

    setMountedPosition({
      xPercent: clamp(
        toPercent(clampedPosition.xPx, metrics.containerRect.width),
        0,
        100
      ),
      yPercent: clamp(
        toPercent(clampedPosition.yPx, metrics.containerRect.height),
        0,
        100
      ),
    });
    setLoosePosition(null);
    demotePrevious?.();
    demotePrevious = () => setEffectiveZIndex(zIndex);
    setEffectiveZIndex(TOP_Z);
    setMode("mounted");
  };

  const dropPiece = () => {
    if (mode !== "mounted") {
      return;
    }

    const metrics = getMetrics();

    if (!metrics) {
      return;
    }

    const startPosition = getRelativePosition(metrics.element, metrics.container);
    const driftX = (seededRandom(seed * 97) - 0.5) * 48;
    const exitOffset = 48 + seededRandom(seed * 149) * 64;
    const targetPosition = {
      xPx: clamp(startPosition.xPx + driftX, 0, metrics.maxX),
      yPx: metrics.containerRect.height + exitOffset,
    };

    if (fallFrameRef.current !== null) {
      window.cancelAnimationFrame(fallFrameRef.current);
    }

    if (reducedMotion) {
      setLoosePosition(null);
      setMode("removed");
      return;
    }

    setLoosePosition(startPosition);
    setMode("falling");
    fallFrameRef.current = window.requestAnimationFrame(() => {
      setLoosePosition(targetPosition);
      fallFrameRef.current = null;
    });
  };

  const updateDraggedPosition = (
    pointerId: number,
    clientX: number,
    clientY: number
  ) => {
    if (!dragState || pointerId !== dragState.pointerId) {
      return;
    }

    const nextPosition = getLoosePositionFromPointer(
      clientX,
      clientY,
      dragState.offsetX,
      dragState.offsetY
    );

    if (!nextPosition) {
      return;
    }

    setLoosePosition(nextPosition);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    if (mode === "falling") {
      return;
    }

    const metrics = getMetrics();

    if (!metrics) {
      return;
    }

    const elementRect = metrics.element.getBoundingClientRect();

    if (mode === "mounted") {
      event.preventDefault();
      metrics.element.setPointerCapture(event.pointerId);
      pressStateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        offsetX: event.clientX - elementRect.left,
        offsetY: event.clientY - elementRect.top,
      };
      return;
    }

    if (!loosePosition) {
      return;
    }

    event.preventDefault();
    metrics.element.setPointerCapture(event.pointerId);

    setDragState({
      pointerId: event.pointerId,
      offsetX: event.clientX - elementRect.left,
      offsetY: event.clientY - elementRect.top,
    });
    setMode("dragging");
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragState && event.pointerId === dragState.pointerId) {
      updateDraggedPosition(event.pointerId, event.clientX, event.clientY);
      return;
    }

    const pressState = pressStateRef.current;

    if (!pressState || event.pointerId !== pressState.pointerId || mode !== "mounted") {
      return;
    }

    const distance = Math.hypot(
      event.clientX - pressState.startX,
      event.clientY - pressState.startY
    );

    if (distance < DRAG_THRESHOLD_PX) {
      return;
    }

    const metrics = getMetrics();

    if (!metrics) {
      return;
    }

    pressStateRef.current = null;
    const nextPosition =
      getLoosePositionFromPointer(
        event.clientX,
        event.clientY,
        pressState.offsetX,
        pressState.offsetY
      ) ?? getRelativePosition(metrics.element, metrics.container);

    setLoosePosition(nextPosition);
    setDragState({
      pointerId: pressState.pointerId,
      offsetX: pressState.offsetX,
      offsetY: pressState.offsetY,
    });
    setMode("dragging");
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pressState = pressStateRef.current;

    if (pressState && event.pointerId === pressState.pointerId) {
      const element = pieceRef.current;

      if (element?.hasPointerCapture(pressState.pointerId)) {
        element.releasePointerCapture(pressState.pointerId);
      }

      pressStateRef.current = null;
      dropPiece();
      return;
    }

    if (!dragState || event.pointerId !== dragState.pointerId) {
      return;
    }

    const element = pieceRef.current;

    if (element?.hasPointerCapture(dragState.pointerId)) {
      element.releasePointerCapture(dragState.pointerId);
    }

    const finalPosition =
      getLoosePositionFromPointer(
        event.clientX,
        event.clientY,
        dragState.offsetX,
        dragState.offsetY
      ) ?? loosePosition;

    setDragState(null);

    if (finalPosition) {
      pinLoosePosition(finalPosition);
      return;
    }

    setMode("loose");
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pressState = pressStateRef.current;

    if (pressState && event.pointerId === pressState.pointerId) {
      const element = pieceRef.current;

      if (element?.hasPointerCapture(pressState.pointerId)) {
        element.releasePointerCapture(pressState.pointerId);
      }

      pressStateRef.current = null;
    }

    if (!dragState || event.pointerId !== dragState.pointerId) {
      return;
    }

    const element = pieceRef.current;

    if (element?.hasPointerCapture(dragState.pointerId)) {
      element.releasePointerCapture(dragState.pointerId);
    }

    setDragState(null);
    setMode(loosePosition ? "loose" : "mounted");
  };

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (mode === "falling" && event.propertyName === "top") {
      setLoosePosition(null);
      setMode("removed");
    }
  };

  if (mode === "removed") {
    return null;
  }

  const isMounted = mode === "mounted";
  const isDragging = mode === "dragging";
  const isLoose = mode === "loose" || mode === "falling" || mode === "dragging";
  const isEntered = hasEntered;
  const tapeAnchors = seededRandom(seed * 223) > 0.5 ? "18% 6%" : "82% 6%";
  const transformOrigin =
    attachment === "washi"
      ? tapeAnchors
      : attachment === "pushpin"
        ? "50% 7%"
        : "50% 0%";
  const fallRotation = roundTo(
    rotation + (seededRandom(seed * 211) - 0.5) * 54, 4
  );

  const outerStyle: CSSProperties = {
    left: isMounted
      ? `${roundTo(mountedPosition.xPercent, 4)}%`
      : `${loosePosition?.xPx ?? 0}px`,
    top: isMounted
      ? `${roundTo(mountedPosition.yPercent, 4)}%`
      : `${loosePosition?.yPx ?? 0}px`,
    width: `${width}px`,
    height: `${height}px`,
    zIndex: isDragging ? 30 : effectiveZIndex,
    transition: reducedMotion
      ? undefined
      : mode === "falling"
        ? "left 760ms cubic-bezier(0.22, 0.72, 0.18, 1), top 860ms cubic-bezier(0.12, 0.88, 0.2, 1)"
        : mode === "mounted"
          ? "left 220ms ease-out, top 220ms ease-out"
          : undefined,
    touchAction: isLoose ? "none" : "manipulation",
  };

  const innerStyle: WallPieceStyle = {
    "--wall-art-rotation": `${rotation}deg`,
    "--wall-art-transform-origin": transformOrigin,
    opacity: !isEntered ? 0 : mode === "falling" ? 0.35 : 1,
    transform: !isEntered
      ? "translateY(16px) scale(0.92) rotate(var(--wall-art-rotation))"
      : isMounted
        ? "rotate(var(--wall-art-rotation))"
        : mode === "falling"
          ? `translateY(14px) rotate(${fallRotation}deg) scale(0.96)`
        : isDragging
          ? `rotate(${rotation * 0.2}deg) scale(1.02)`
          : `rotate(${rotation * 0.55}deg)`,
    boxShadow: isDragging
      ? "0 18px 36px rgba(0,0,0,0.42)"
      : mode === "falling"
        ? "0 22px 40px rgba(0,0,0,0.22)"
      : isLoose
        ? "0 12px 22px rgba(0,0,0,0.32)"
        : "0 10px 24px rgba(0,0,0,0.3)",
    transformOrigin: "var(--wall-art-transform-origin)",
    transition: reducedMotion
      ? undefined
      : mode === "falling"
        ? "transform 760ms cubic-bezier(0.18, 0.7, 0.2, 1), opacity 760ms ease-out, box-shadow 220ms ease"
        : "transform 220ms ease, opacity 320ms ease, box-shadow 180ms ease",
  };

  return (
    <div
      ref={pieceRef}
      aria-hidden={decorative ? "true" : undefined}
      className="wall-art-piece absolute pointer-events-auto select-none"
      style={outerStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onTransitionEnd={handleTransitionEnd}
    >
      <div
        className={`wall-art-piece__inner relative h-full w-full rounded-sm ${
          isMounted ? "cursor-pointer" : isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={innerStyle}
      >
        {isMounted && attachment === "pushpin" ? <Pushpin color={pinColor} /> : null}
        {isMounted && attachment === "washi" ? <WashiTape seed={seed} /> : null}
        {children}
      </div>
    </div>
  );
}

type LayoutState = {
  placements: PiecePlacement[];
  containerWidth: number;
};

function usePieceLayout(
  containerRef: RefObject<HTMLDivElement | null>,
  pieces: WallArtPiece[] | undefined,
  layoutSeed: number
): LayoutState | null {
  const [layout, setLayout] = useState<LayoutState | null>(null);
  const lastBucketRef = useRef("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let debounceTimer: number | null = null;

    const compute = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      const isMobile = width < MOBILE_BREAKPOINT_PX;
      const maxCount = isMobile ? MAX_PIECES_MOBILE : MAX_PIECES_DESKTOP;
      const artSizes = isMobile ? ART_SIZES_MOBILE : ART_SIZES_DESKTOP;
      const fallbackSizes = isMobile
        ? FALLBACK_ART_SIZES_MOBILE
        : FALLBACK_ART_SIZES_DESKTOP;
      const blockerRects = getBlockerRects(container);

      const pieceSizes: Array<{ w: number; h: number }> = [];
      for (let i = 0; i < maxCount; i++) {
        const piece = pieces?.length ? pieces[i % pieces.length] : undefined;
        if (piece) {
          pieceSizes.push(artSizes[piece.size || "medium"]);
        } else {
          const pieceSeed =
            hashString(`fallback:${i}`) + layoutSeed;
          pieceSizes.push(
            fallbackSizes[
              Math.floor(seededRandom(pieceSeed + 157) * fallbackSizes.length)
            ]
          );
        }
      }

      setLayout({
        placements: computePieceLayout({
          containerWidth: width,
          containerHeight: height,
          blockerRects,
          pieceSizes,
          maxCount,
          seed: layoutSeed,
        }),
        containerWidth: width,
      });
    };

    const onResize = () => {
      const { width, height } = container.getBoundingClientRect();
      const bucketKey = `${Math.floor(width / RESIZE_BUCKET_PX)}:${Math.floor(height / RESIZE_BUCKET_PX)}`;
      if (bucketKey === lastBucketRef.current) return;
      lastBucketRef.current = bucketKey;

      if (debounceTimer !== null) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(compute, RESIZE_DEBOUNCE_MS);
    };

    const initialTimer = window.setTimeout(() => {
      compute();
      const { width, height } = container.getBoundingClientRect();
      lastBucketRef.current = `${Math.floor(width / RESIZE_BUCKET_PX)}:${Math.floor(height / RESIZE_BUCKET_PX)}`;
    }, 50);

    const observer = new ResizeObserver(onResize);
    observer.observe(container);

    return () => {
      window.clearTimeout(initialTimer);
      if (debounceTimer !== null) window.clearTimeout(debounceTimer);
      observer.disconnect();
    };
  }, [containerRef, pieces, layoutSeed]);

  return layout;
}

export default function WallArt({
  pieces,
  playIntro = true,
  label,
  quote,
}: {
  pieces?: WallArtPiece[];
  playIntro?: boolean;
  label: string;
  quote: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionSeedRef = useRef(Math.floor(Math.random() * 100000));
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const layoutSeed =
    hashString(
      pieces?.map((piece) => piece._id).join("|") || "fallback-wall-art"
    ) + sessionSeedRef.current;
  const hasInteractivePieces = (pieces ?? []).some((piece) =>
    Boolean(getSafeWallArtHref(piece.link))
  );
  const layout = usePieceLayout(containerRef, pieces, layoutSeed);
  const widthBucket = layout
    ? Math.floor(layout.containerWidth / RESIZE_BUCKET_PX)
    : 0;

  return (
    <div
      ref={containerRef}
      aria-hidden={hasInteractivePieces ? undefined : "true"}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {layout?.placements.map((placement, index) => {
        if (!placement) return null;

        const piece = pieces?.length ? pieces[index % pieces.length] : undefined;
        const safeHref = piece ? getSafeWallArtHref(piece.link) : null;
        const seed =
          hashString(piece ? `${piece._id}:${index}` : `fallback:${index}`) +
          layoutSeed;
        const rotation = roundTo((seededRandom(seed + 47) - 0.5) * 24, 4);
        const zIndex = 1 + Math.floor(seededRandom(seed + 71) * 6);
        const attachmentRoll = seededRandom(seed + 107);
        const attachment: Attachment =
          attachmentRoll < 0.5 ? "pushpin" : attachmentRoll < 0.8 ? "washi" : "none";
        const pinColor =
          PUSH_PIN_COLORS[
            Math.floor(seededRandom(seed + 131) * PUSH_PIN_COLORS.length)
          ];

        const content =
          piece && piece.imageUrl ? (
            <CmsArtPiece piece={piece} width={placement.width} href={safeHref} />
          ) : (
            <div
              className="h-full w-full overflow-hidden rounded-sm border"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--theme-border) 60%, transparent)",
                backgroundColor: "var(--theme-surface)",
              }}
            >
              <FallbackArt
                index={Math.floor(seededRandom(seed + 181) * 10)}
                label={label}
                quote={quote}
              />
            </div>
          );

        return (
          <WallPiece
            key={`b${widthBucket}-${piece ? piece._id : "fb"}-${index}`}
            index={index}
            width={placement.width}
            height={placement.height}
            rotation={rotation}
            zIndex={zIndex}
            attachment={attachment}
            pinColor={pinColor}
            seed={seed}
            initialMountedPosition={{
              xPercent: placement.xPercent,
              yPercent: placement.yPercent,
            }}
            playIntro={playIntro}
            reducedMotion={prefersReducedMotion}
            decorative={!safeHref}
            containerRef={containerRef}
          >
            {content}
          </WallPiece>
        );
      })}
    </div>
  );
}
