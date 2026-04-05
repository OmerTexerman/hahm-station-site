import Link from "next/link";

function PlantPotGraphic({ label }: { label?: string | null }) {
  return (
    <div className="motion-hover-lift relative transition-transform duration-300 group-hover:-translate-y-2">
      {label ? (
        <span className="theme-tooltip absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] tracking-[0.18em] uppercase opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {label}
        </span>
      ) : null}
      <svg
        viewBox="0 0 80 107"
        className="block h-[150px] w-28"
      >
        <g
          className="plant-leaf"
          style={{ transformOrigin: "35px 68px", animation: "leafSway 4s ease-in-out infinite" }}
        >
          <path
            d="M35,68 Q12,40 25,8"
            fill="none"
            stroke="var(--theme-decorative-tertiary)"
            strokeWidth="2"
          />
          <path
            d="M35,68 Q12,40 25,8 Q28,35 33,55"
            fill="var(--theme-decorative-tertiary)"
            opacity="0.6"
          />
          <path d="M28,25 Q20,22 16,17" fill="none" stroke="var(--theme-decorative-accent-soft)" strokeWidth="1" opacity="0.4" />
          <path d="M30,40 Q22,38 17,31" fill="none" stroke="var(--theme-decorative-accent-soft)" strokeWidth="1" opacity="0.4" />
        </g>

        <g
          className="plant-leaf"
          style={{ transformOrigin: "45px 68px", animation: "leafSway 4s ease-in-out infinite 2s" }}
        >
          <path
            d="M45,68 Q68,38 53,3"
            fill="none"
            stroke="var(--theme-decorative-secondary)"
            strokeWidth="2"
          />
          <path
            d="M45,68 Q68,38 53,3 Q50,32 46,55"
            fill="var(--theme-decorative-tertiary)"
            opacity="0.6"
          />
          <path d="M56,20 Q62,16 66,10" fill="none" stroke="var(--theme-decorative-accent-soft)" strokeWidth="1" opacity="0.4" />
          <path d="M54,35 Q60,32 64,25" fill="none" stroke="var(--theme-decorative-accent-soft)" strokeWidth="1" opacity="0.4" />
        </g>

        <path
          d="M40,72 Q40,45 38,10"
          fill="none"
          stroke="var(--theme-decorative-secondary)"
          strokeWidth="2.5"
        />

        <rect x="22" y="68" width="36" height="7" rx="2" fill="var(--theme-decorative-accent)" />
        <polygon points="24,75 56,75 52,107 28,107" fill="var(--theme-decorative-primary)" />
        <polygon points="40,75 56,75 52,107 40,107" fill="var(--theme-decorative-secondary)" />
      </svg>
    </div>
  );
}

export default function PlantPot({
  href,
  label,
}: {
  href?: string | null;
  label?: string | null;
}) {
  const className =
    "theme-focus-ring group flex flex-shrink-0 self-end items-end";

  if (!href || !label) {
    return (
      <div aria-hidden="true" className={className}>
        <PlantPotGraphic label={label} />
      </div>
    );
  }

  return (
    <Link href={href} aria-label={label} className={className}>
      <PlantPotGraphic label={label} />
    </Link>
  );
}
