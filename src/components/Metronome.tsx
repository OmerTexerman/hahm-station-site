import Link from "next/link";

function MetronomeGraphic({ label }: { label?: string | null }) {
  return (
    <div className="motion-hover-lift relative flex items-end transition-transform duration-300 group-hover:-translate-y-2">
      {label ? (
        <span className="theme-tooltip absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] tracking-[0.18em] uppercase opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {label}
        </span>
      ) : null}
      <svg
        viewBox="0 0 80 160"
        className="block h-48 w-24 overflow-visible"
      >
        <polygon
          points="40,8 12,144 68,144"
          fill="var(--theme-decorative-primary)"
          stroke="var(--theme-decorative-secondary)"
          strokeWidth="1.5"
        />
        <polygon points="40,8 12,144 40,144" fill="var(--theme-decorative-secondary)" />
        <polygon
          points="40,28 24,132 56,132"
          fill="var(--theme-decorative-primary)"
          opacity="0.4"
        />
        <g
          className="metronome-pendulum origin-[40px_128px]"
          style={{
            animation: "metronome 1.5s ease-in-out infinite",
            animationDelay: "1.5s",
            animationFillMode: "both",
          }}
        >
            <line
              x1="40"
              y1="122"
              x2="50"
              y2="34"
              stroke="var(--theme-decorative-accent-soft)"
              strokeWidth="2"
            />
            <circle
              cx="50"
              cy="34"
              r="5"
              fill="var(--theme-decorative-accent)"
              stroke="var(--theme-decorative-primary)"
              strokeWidth="1"
            />
          </g>
        <circle cx="40" cy="122" r="3" fill="var(--theme-decorative-secondary)" />
        <rect x="14" y="140" width="52" height="8" rx="2" fill="var(--theme-decorative-primary)" />
        <rect x="8" y="148" width="64" height="12" rx="2" fill="var(--theme-decorative-secondary)" />
      </svg>
    </div>
  );
}

export default function Metronome({
  href,
  label,
}: {
  href?: string | null;
  label?: string | null;
}) {
  const className =
    "theme-focus-ring group -ml-1 flex flex-shrink-0 self-end items-end pr-3";

  if (!href || !label) {
    return (
      <div aria-hidden="true" className={className}>
        <MetronomeGraphic label={label} />
      </div>
    );
  }

  return (
    <Link href={href} aria-label={label} className={className}>
      <MetronomeGraphic label={label} />
    </Link>
  );
}
