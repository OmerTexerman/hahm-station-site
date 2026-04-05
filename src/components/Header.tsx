import Link from "next/link";

function StackedBook({
  title,
  spineColor,
  coverColor,
  coverLight,
  pageColor = "var(--theme-book-page)",
  showPageLines = true,
  svgWidth,
  svgHeight,
  className,
}: {
  title: string;
  spineColor: string;
  coverColor: string;
  coverLight: string;
  pageColor?: string;
  showPageLines?: boolean;
  svgWidth: number;
  svgHeight: number;
  className?: string;
}) {
  const depth = 14;
  const spineW = svgWidth - depth;
  const spineH = svgHeight - depth;
  const spineRound = 6;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon
        points={`
          ${spineW},${depth}
          ${svgWidth},0
          ${svgWidth},${spineH}
          ${spineW},${svgHeight}
        `}
        fill={pageColor}
      />
      {showPageLines
        ? Array.from({ length: 8 }).map((_, index) => {
            const y1 = depth + ((spineH - depth) / 9) * (index + 1);
            const y2 = y1 - depth * ((spineH - y1) / spineH);

            return (
              <line
                key={index}
                x1={spineW + 1}
                y1={y1}
                x2={svgWidth - 1}
                y2={y2 + depth * 0.15}
                stroke="var(--theme-decorative-accent-soft)"
                strokeWidth={index % 2 === 0 ? "0.7" : "0.4"}
                opacity={index % 3 === 0 ? "0.6" : "0.35"}
              />
            );
          })
        : null}
      <polygon
        points={`
          ${spineW},${depth}
          ${svgWidth},0
          ${svgWidth},${3}
          ${spineW},${depth + 3}
        `}
        fill={coverColor}
        opacity="0.7"
      />
      <polygon
        points={`
          ${spineW},${svgHeight - 3}
          ${svgWidth},${spineH - 3}
          ${svgWidth},${spineH}
          ${spineW},${svgHeight}
        `}
        fill={coverColor}
        opacity="0.5"
      />

      <polygon
        points={`
          ${spineRound},${depth}
          ${spineRound + depth},0
          ${svgWidth},0
          ${spineW},${depth}
        `}
        fill={coverLight}
      />
      <line
        x1={spineRound}
        y1={depth}
        x2={spineW}
        y2={depth}
        stroke="var(--theme-foreground)"
        strokeWidth="0.5"
        opacity="0.15"
      />

      <rect
        x={0}
        y={depth}
        width={spineW}
        height={spineH}
        rx={spineRound}
        ry={2}
        fill={spineColor}
      />
      <rect
        x={0}
        y={depth}
        width={spineW * 0.6}
        height={3}
        rx={1}
        fill={coverLight}
        opacity="0.2"
      />

      <text
        x={spineW / 2}
        y={depth + spineH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--theme-foreground)"
        fontFamily="var(--font-display), serif"
        fontWeight="900"
        fontSize={spineH * 0.38}
        letterSpacing="0.15em"
        opacity="0.95"
      >
        {title}
      </text>
    </svg>
  );
}

export default function Header({
  siteTitle,
  headerTop,
  headerBottom,
}: {
  siteTitle: string;
  headerTop: string;
  headerBottom: string;
}) {
  return (
    <header className="pointer-events-none mx-auto w-full max-w-4xl px-4">
      <div className="flex justify-center">
        <div
          data-wall-art-blocker="true"
          data-spotlight-target="true"
          className="pointer-events-auto relative inline-flex flex-col items-center"
        >
          <Link
            href="/"
            aria-label={`${siteTitle} home`}
            className="group relative inline-flex flex-col items-center"
          >
            <div className="flex flex-col items-center">
              <div className="motion-hover-shift-left relative z-20 animate-slide-left transition-transform duration-500 group-hover:-translate-x-2">
                <StackedBook
                  title={headerTop}
                  spineColor="var(--theme-header-top-spine)"
                  coverColor="var(--theme-header-top-cover)"
                  coverLight="var(--theme-header-top-cover)"
                  showPageLines={false}
                  className="h-auto w-64 sm:w-80 md:w-[26rem] lg:w-[30rem]"
                  svgWidth={380}
                  svgHeight={80}
                />
              </div>

              <div className="motion-hover-shift-right relative z-10 -mt-3 animate-slide-right transition-transform duration-500 group-hover:translate-x-2">
                <StackedBook
                  title={headerBottom}
                  spineColor="var(--theme-header-bottom-spine)"
                  coverColor="var(--theme-header-bottom-cover)"
                  coverLight="var(--theme-header-bottom-cover)"
                  showPageLines={false}
                  className="h-auto w-72 sm:w-[22rem] md:w-[30rem] lg:w-[34rem]"
                  svgWidth={440}
                  svgHeight={80}
                />
              </div>
            </div>
          </Link>

          <div className="relative -mt-1 w-[calc(100%+2rem)]">
            <div
              aria-hidden
              className="absolute left-[12%] right-[12%] top-[2px] h-2 rounded-full blur-sm"
              style={{ backgroundColor: "color-mix(in srgb, var(--theme-background) 35%, black)" }}
            />
            <div
              className="relative h-4"
              style={{
                background:
                  "linear-gradient(to bottom, var(--theme-shelf-top), var(--theme-shelf-bottom))",
                boxShadow: "0 2px 4px var(--theme-shelf-shadow)",
              }}
            />
            <div className="theme-shelf-lip mx-6 h-2 rounded-b-sm" />
          </div>
        </div>
      </div>
    </header>
  );
}
