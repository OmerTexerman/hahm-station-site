"use client";

import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  HOME_SPOTLIGHT_BOOTSTRAP_STYLE_ID,
  HOME_SPOTLIGHT_STYLE_STORAGE_KEY,
} from "@/lib/homeIntro";
import { clamp, roundTo } from "@/lib/math";
import { readSessionItem, writeSessionItem } from "@/lib/sessionStorage";

const SPOTLIGHT_WIDTH_FACTOR = 1.14;
const SPOTLIGHT_HEIGHT_FACTOR = 1.72;
const SPOTLIGHT_PADDING_PX = 18;
const SPOTLIGHT_SIZE_OFFSET_PX = -84;
const SPOTLIGHT_SIZE_SCALE = 0.8;
const SPOTLIGHT_VERTICAL_BIAS = 0.48;
const INTRO_MEASURE_MS = 1500;
const SPOTLIGHT_KEYBOARD_STEP_PX = 28;

type StoredSpotlightState = {
  left: string;
  top: string;
  size: string;
  offsetX?: number;
  offsetY?: number;
};

type SpotlightStyle = CSSProperties & {
  "--spotlight-left"?: string;
  "--spotlight-top"?: string;
  "--spotlight-size"?: string;
  "--spotlight-offset-x"?: string;
  "--spotlight-offset-y"?: string;
};

let cachedStoredSpotlightRaw: string | null | undefined;
let cachedStoredSpotlightState: StoredSpotlightState | null = null;

function buildSpotlightStyle(state: Pick<StoredSpotlightState, "left" | "top" | "size">) {
  return {
    "--spotlight-left": state.left,
    "--spotlight-top": state.top,
    "--spotlight-size": state.size,
  } satisfies SpotlightStyle;
}

function readStoredSpotlightState() {
  const rawState = readSessionItem(HOME_SPOTLIGHT_STYLE_STORAGE_KEY);

  if (rawState === cachedStoredSpotlightRaw) {
    return cachedStoredSpotlightState;
  }

  cachedStoredSpotlightRaw = rawState;

  if (!rawState) {
    cachedStoredSpotlightState = null;
    return null;
  }

  try {
    const parsed = JSON.parse(rawState) as StoredSpotlightState;

    if (
      typeof parsed?.left !== "string" ||
      typeof parsed?.top !== "string" ||
      typeof parsed?.size !== "string"
    ) {
      cachedStoredSpotlightState = null;
      return null;
    }

    cachedStoredSpotlightState = {
      left: parsed.left,
      top: parsed.top,
      size: parsed.size,
      offsetX: Number.isFinite(parsed.offsetX) ? parsed.offsetX : 0,
      offsetY: Number.isFinite(parsed.offsetY) ? parsed.offsetY : 0,
    };
    return cachedStoredSpotlightState;
  } catch {
    cachedStoredSpotlightState = null;
    return null;
  }
}

function isEditableElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(
      'input, textarea, select, [contenteditable="true"], [role="textbox"]'
    )
  );
}

function getOffsetBounds({
  centerX,
  centerY,
  size,
  viewportWidth,
  viewportHeight,
}: {
  centerX: number;
  centerY: number;
  size: number;
  viewportWidth: number;
  viewportHeight: number;
}) {
  const radius = size / 2;
  const minCenterX = radius;
  const maxCenterX = viewportWidth - radius;
  const minCenterY = radius;
  const maxCenterY = viewportHeight - radius;

  return {
    minX:
      maxCenterX < minCenterX ? viewportWidth / 2 - centerX : minCenterX - centerX,
    maxX:
      maxCenterX < minCenterX ? viewportWidth / 2 - centerX : maxCenterX - centerX,
    minY:
      maxCenterY < minCenterY ? viewportHeight / 2 - centerY : minCenterY - centerY,
    maxY:
      maxCenterY < minCenterY ? viewportHeight / 2 - centerY : maxCenterY - centerY,
  };
}

function subscribeToSessionSnapshot() {
  return () => {};
}

export default function SceneSpotlight({
  children,
  skipIntro = false,
}: {
  children: ReactNode;
  skipIntro?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const readyTimeoutRef = useRef<number | null>(null);
  const hasRevealedRef = useRef(false);
  const latestMeasurementRef = useRef("");
  const storedSpotlightState = useSyncExternalStore(
    subscribeToSessionSnapshot,
    readStoredSpotlightState,
    () => null
  );
  const [spotlightStyle, setSpotlightStyle] = useState<SpotlightStyle>({});
  const [spotlightOffset, setSpotlightOffset] = useState({ x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);

  const persistSpotlightState = useEffectEvent((state?: StoredSpotlightState) => {
    if (typeof window === "undefined") {
      return;
    }

    const storedState =
      state ??
      (() => {
        const left = String(spotlightStyle["--spotlight-left"] ?? "");
        const top = String(spotlightStyle["--spotlight-top"] ?? "");
        const size = String(spotlightStyle["--spotlight-size"] ?? "");

        if (!left || !top || !size) {
          return null;
        }

        return {
          left,
          top,
          size,
          offsetX: roundTo(spotlightOffset.x, 2),
          offsetY: roundTo(spotlightOffset.y, 2),
        } satisfies StoredSpotlightState;
      })();

    if (!storedState) {
      return;
    }

    writeSessionItem(
      HOME_SPOTLIGHT_STYLE_STORAGE_KEY,
      JSON.stringify(storedState)
    );
  });

  const resolvedSpotlightStyle =
    spotlightStyle["--spotlight-left"] || !storedSpotlightState
      ? spotlightStyle
      : buildSpotlightStyle(storedSpotlightState);
  const resolvedSpotlightOffset =
    spotlightStyle["--spotlight-left"] || !storedSpotlightState
      ? spotlightOffset
      : {
          x: storedSpotlightState.offsetX ?? 0,
          y: storedSpotlightState.offsetY ?? 0,
        };

  const nudgeSpotlight = useEffectEvent((deltaX: number, deltaY: number) => {
    const left = Number.parseFloat(
      String(resolvedSpotlightStyle["--spotlight-left"] ?? "")
    );
    const top = Number.parseFloat(
      String(resolvedSpotlightStyle["--spotlight-top"] ?? "")
    );
    const size = Number.parseFloat(
      String(resolvedSpotlightStyle["--spotlight-size"] ?? "")
    );

    if (!Number.isFinite(left) || !Number.isFinite(top) || !Number.isFinite(size)) {
      return;
    }

    const bounds = getOffsetBounds({
      centerX: left,
      centerY: top,
      size,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });

    const nextOffset = {
      x: clamp(resolvedSpotlightOffset.x + deltaX, bounds.minX, bounds.maxX),
      y: clamp(resolvedSpotlightOffset.y + deltaY, bounds.minY, bounds.maxY),
    };

    if (
      roundTo(nextOffset.x, 2) === roundTo(resolvedSpotlightOffset.x, 2) &&
      roundTo(nextOffset.y, 2) === roundTo(resolvedSpotlightOffset.y, 2)
    ) {
      return;
    }

    setSpotlightOffset(nextOffset);

    persistSpotlightState({
      left: `${left}px`,
      top: `${top}px`,
      size: `${size}px`,
      offsetX: roundTo(nextOffset.x, 2),
      offsetY: roundTo(nextOffset.y, 2),
    });
  });

  const measureSpotlight = useEffectEvent(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }
    const targets = Array.from(
      root.querySelectorAll<HTMLElement>("[data-spotlight-target='true']")
    )
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0);

    if (targets.length === 0) {
      return;
    }

    const union = targets.reduce(
      (acc, rect) => ({
        minX: Math.min(acc.minX, rect.left),
        maxX: Math.max(acc.maxX, rect.right),
        minY: Math.min(acc.minY, rect.top),
        maxY: Math.max(acc.maxY, rect.bottom),
      }),
      {
        minX: targets[0].left,
        maxX: targets[0].right,
        minY: targets[0].top,
        maxY: targets[0].bottom,
      }
    );

    const unionWidth = union.maxX - union.minX;
    const unionHeight = union.maxY - union.minY;
    const spotlightSize = Math.max(
      240,
      Math.max(
        unionWidth * SPOTLIGHT_WIDTH_FACTOR,
        unionHeight * SPOTLIGHT_HEIGHT_FACTOR
      ) +
        SPOTLIGHT_PADDING_PX * 2 +
        SPOTLIGHT_SIZE_OFFSET_PX
    ) * SPOTLIGHT_SIZE_SCALE;

    const nextState = {
      left: `${roundTo(union.minX + unionWidth / 2, 2)}px`,
      top: `${roundTo(union.minY + unionHeight * SPOTLIGHT_VERTICAL_BIAS, 2)}px`,
      size: `${roundTo(spotlightSize, 2)}px`,
    } satisfies StoredSpotlightState;

    const bounds = getOffsetBounds({
      centerX: Number.parseFloat(nextState.left),
      centerY: Number.parseFloat(nextState.top),
      size: Number.parseFloat(nextState.size),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });

    const nextOffset = {
      x: clamp(resolvedSpotlightOffset.x, bounds.minX, bounds.maxX),
      y: clamp(resolvedSpotlightOffset.y, bounds.minY, bounds.maxY),
    };

    const measurementKey = JSON.stringify({
      left: nextState.left,
      top: nextState.top,
      size: nextState.size,
      offsetX: roundTo(nextOffset.x, 2),
      offsetY: roundTo(nextOffset.y, 2),
    });

    if (latestMeasurementRef.current !== measurementKey) {
      latestMeasurementRef.current = measurementKey;
      setSpotlightStyle(buildSpotlightStyle(nextState));
      setSpotlightOffset(nextOffset);
    }

    persistSpotlightState({
      ...nextState,
      offsetX: roundTo(nextOffset.x, 2),
      offsetY: roundTo(nextOffset.y, 2),
    });

    if (skipIntro) {
      hasRevealedRef.current = true;

      if (readyTimeoutRef.current !== null) {
        window.clearTimeout(readyTimeoutRef.current);
        readyTimeoutRef.current = null;
      }

      return;
    }

    if (hasRevealedRef.current) {
      return;
    }

    if (readyTimeoutRef.current !== null) {
      window.clearTimeout(readyTimeoutRef.current);
    }

    readyTimeoutRef.current = window.setTimeout(() => {
      hasRevealedRef.current = true;
      setIsReady(true);
      readyTimeoutRef.current = null;
    }, 120);
  });

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    if (storedSpotlightState && skipIntro) {
      hasRevealedRef.current = true;
      latestMeasurementRef.current = JSON.stringify({
        left: storedSpotlightState.left,
        top: storedSpotlightState.top,
        size: storedSpotlightState.size,
        offsetX: roundTo(storedSpotlightState.offsetX ?? 0, 2),
        offsetY: roundTo(storedSpotlightState.offsetY ?? 0, 2),
      });
    }

    const observer = new ResizeObserver(() => {
      measureSpotlight();
    });

    observer.observe(root);

    const targets = Array.from(
      root.querySelectorAll<HTMLElement>("[data-spotlight-target='true']")
    );

    targets.forEach((target) => observer.observe(target));

    const frameId = window.requestAnimationFrame(() => {
      measureSpotlight();
    });
    const start = performance.now();
    let introFrameId = 0;

    const trackIntroLayout = (timestamp: number) => {
      measureSpotlight();

      if (timestamp - start < INTRO_MEASURE_MS) {
        introFrameId = window.requestAnimationFrame(trackIntroLayout);
      }
    };

    introFrameId = window.requestAnimationFrame(trackIntroLayout);

    window.addEventListener("resize", measureSpotlight);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(introFrameId);
      if (readyTimeoutRef.current !== null) {
        window.clearTimeout(readyTimeoutRef.current);
      }
      window.removeEventListener("resize", measureSpotlight);
      observer.disconnect();
    };
  }, [storedSpotlightState]);

  useEffect(() => {
    persistSpotlightState();
  }, [spotlightOffset, spotlightStyle]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (isEditableElement(event.target)) {
        return;
      }

      const activeElement = document.activeElement;
      const root = rootRef.current;

      if (
        activeElement &&
        activeElement !== document.body &&
        activeElement !== document.documentElement &&
        (!root || !root.contains(activeElement))
      ) {
        return;
      }

      let deltaX = 0;
      let deltaY = 0;

      switch (event.key) {
        case "ArrowLeft":
          deltaX = -SPOTLIGHT_KEYBOARD_STEP_PX;
          break;
        case "ArrowRight":
          deltaX = SPOTLIGHT_KEYBOARD_STEP_PX;
          break;
        case "ArrowUp":
          deltaY = -SPOTLIGHT_KEYBOARD_STEP_PX;
          break;
        case "ArrowDown":
          deltaY = SPOTLIGHT_KEYBOARD_STEP_PX;
          break;
        default:
          return;
      }

      event.preventDefault();
      nudgeSpotlight(deltaX, deltaY);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!spotlightStyle["--spotlight-left"]) {
      return;
    }

    const cleanupFrameId = window.requestAnimationFrame(() => {
      document.getElementById(HOME_SPOTLIGHT_BOOTSTRAP_STYLE_ID)?.remove();
    });

    return () => {
      window.cancelAnimationFrame(cleanupFrameId);
    };
  }, [spotlightStyle]);

  const sceneStyle: SpotlightStyle = {
    ...resolvedSpotlightStyle,
    "--spotlight-offset-x": `${resolvedSpotlightOffset.x}px`,
    "--spotlight-offset-y": `${resolvedSpotlightOffset.y}px`,
  };
  const hasEffectiveSpotlight = Boolean(resolvedSpotlightStyle["--spotlight-left"]);
  const spotlightMode =
    skipIntro && hasEffectiveSpotlight ? "settled" : "intro";
  const spotlightReady = isReady || (skipIntro && hasEffectiveSpotlight);

  return (
    <div
      ref={rootRef}
      data-spotlight-mode={spotlightMode}
      data-spotlight-ready={spotlightReady ? "true" : "false"}
      className="scene-spotlight pointer-events-none relative z-10 isolate flex w-full flex-col items-center py-8"
      style={sceneStyle}
    >
      <div aria-hidden className="scene-spotlight__shadow" />
      <div aria-hidden className="scene-spotlight__cutout" />
      <div aria-hidden className="scene-spotlight__circle" />
      <div className="scene-spotlight__content relative z-10 flex w-full flex-col items-center">
        {children}
      </div>
    </div>
  );
}
