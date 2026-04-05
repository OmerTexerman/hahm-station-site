import Link from "next/link";
import { getResolvedSiteContent } from "@/lib/content";
import { getNavItems, type CategorySlug } from "@/lib/site";

export default async function SectionNav({
  currentSection,
  backHref,
  backLabel,
  isChildPage = false,
}: {
  currentSection?: CategorySlug;
  backHref?: string;
  backLabel?: string;
  isChildPage?: boolean;
}) {
  const { sections, settings } = await getResolvedSiteContent();
  const navItems = getNavItems(sections);

  return (
    <nav
      aria-label="Site sections"
      className="theme-page border-b px-6 py-4"
      style={{ borderColor: "var(--theme-border)" }}
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4">
        <Link
          href="/"
          className="theme-text-foreground theme-focus-ring font-[family-name:var(--font-display)] text-lg font-black tracking-tight"
        >
          {settings.siteTitle}
        </Link>

        {backHref && backLabel ? (
          <Link
            href={backHref}
            className="theme-text-muted theme-focus-ring theme-hover-foreground text-sm transition-colors"
          >
            &larr; {backLabel}
          </Link>
        ) : null}

        <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
          {navItems.map((item) => {
            const isCurrent = item.slug === currentSection;

            return (
              <Link
                key={item.slug}
                href={item.href}
                aria-current={isCurrent ? (isChildPage ? "true" : "page") : undefined}
                className={`rounded-full px-3 py-1 transition-colors ${
                  isCurrent
                    ? "theme-nav-pill-active theme-focus-ring"
                    : "theme-text-muted theme-focus-ring theme-hover-foreground"
                }`}
                style={isCurrent ? undefined : { backgroundColor: "transparent" }}
              >
                {item.shortLabel}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
