import Link from "next/link";

function ShelfDecorGraphic({
  label,
  interactive,
}: {
  label?: string | null;
  interactive: boolean;
}) {
  return (
    <div className="relative">
      {interactive && label ? (
        <span className="theme-tooltip absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] tracking-[0.18em] uppercase opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {label}
        </span>
      ) : null}
      <svg
        viewBox="0 0 70 70"
        className={`block h-24 w-24 overflow-visible ${
          interactive
            ? "motion-hover-tilt transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-[-5deg]"
            : ""
        }`}
      >
        <g
          className="vinyl-spin"
          style={{ transformOrigin: "35px 35px", animation: "vinylSpin 8s linear infinite" }}
        >
          <path
            d="M35 35m-34 0a34 34 0 1 0 68 0a34 34 0 1 0-68 0M35 35m-3 0a3 3 0 1 1 6 0a3 3 0 1 1-6 0"
            fill="var(--theme-decorative-secondary)"
            fillRule="evenodd"
          />
          <circle cx="35" cy="35" r="34" fill="none" stroke="var(--theme-border-strong)" strokeWidth="1" />
          <circle cx="35" cy="35" r="27" fill="none" stroke="var(--theme-border)" strokeWidth="0.5" />
          <circle cx="35" cy="35" r="21" fill="none" stroke="var(--theme-border)" strokeWidth="0.5" />
          <circle cx="35" cy="35" r="15" fill="none" stroke="var(--theme-border-strong)" strokeWidth="0.5" />
          <path
            d="M35 35m-8.5 0a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0-17 0M35 35m-3 0a3 3 0 1 1 6 0a3 3 0 1 1-6 0"
            fill="var(--theme-decorative-accent)"
            fillRule="evenodd"
          />
        </g>
      </svg>
    </div>
  );
}

export default function ShelfDecor({
  href,
  label,
}: {
  href?: string | null;
  label?: string | null;
}) {
  const resolvedHref = href ?? null;
  const resolvedLabel = label ?? null;
  const isLinked = Boolean(resolvedHref && resolvedLabel);

  return (
    <div className="flex items-end gap-2 ml-3 self-end">
      {isLinked ? (
        <Link
          href={resolvedHref!}
          aria-label={resolvedLabel!}
          className="theme-focus-ring group flex self-end items-end"
        >
          <ShelfDecorGraphic label={resolvedLabel!} interactive />
        </Link>
      ) : (
        <div aria-hidden="true" className="flex self-end items-end">
          <ShelfDecorGraphic label={null} interactive={false} />
        </div>
      )}
    </div>
  );
}
