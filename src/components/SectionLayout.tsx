import type { CategorySlug } from "@/lib/site";
import SectionNav from "./SectionNav";

export default function SectionLayout({
  currentSection,
  title,
  description,
  children,
}: {
  currentSection: CategorySlug;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div id="content" className="theme-page min-h-screen">
      <SectionNav currentSection={currentSection} />
      <header className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="theme-text-foreground text-4xl font-black tracking-tight font-[family-name:var(--font-display)]">
            {title}
          </h1>
          {description ? (
            <p className="theme-text-muted mt-3 max-w-2xl text-lg">
              {description}
            </p>
          ) : null}
        </div>
      </header>
      <main className="px-6 pb-16">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
