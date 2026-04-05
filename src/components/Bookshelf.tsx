import Link from "next/link";
import {
  findSectionConfig,
  getNavItems,
  type SectionConfig,
  type SiteSettings,
} from "@/lib/site";
import BookCover from "./BookCover";
import Metronome from "./Metronome";
import PlantPot from "./PlantPot";
import ShelfDecor from "./ShelfDecor";

type ShelfBook =
  | { kind: "decorative"; key: string }
  | { kind: "section"; key: string; section: SectionConfig };

function Shelf({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center">
      <div
        data-wall-art-blocker="true"
        data-spotlight-target="true"
        className="pointer-events-auto inline-flex flex-col items-stretch"
      >
        <div className="flex items-end gap-[2px] px-4 sm:gap-[3px] sm:px-6">
          {children}
        </div>
        <div className="theme-shelf-board h-5" />
        <div className="theme-shelf-lip mx-2 h-3 rounded-b-sm" />
      </div>
    </div>
  );
}

function chunkSections(sections: SectionConfig[], size: number) {
  const chunks: SectionConfig[][] = [];

  for (let index = 0; index < sections.length; index += size) {
    chunks.push(sections.slice(index, index + size));
  }

  return chunks;
}

function withDecorativeBook(row: SectionConfig[], rowIndex: number): ShelfBook[] {
  if (row.length === 0) {
    return [];
  }

  const books = row.map((section) => ({
    kind: "section" as const,
    key: section.slug,
    section,
  }));

  if (rowIndex !== 0) {
    return books;
  }

  const insertAt = Math.min(2, books.length);

  return [
    ...books.slice(0, insertAt),
    { kind: "decorative" as const, key: "decorative-home-book" },
    ...books.slice(insertAt),
  ];
}

function renderShelfBook(book: ShelfBook, animationIndex: number) {
  if (book.kind === "decorative") {
    return (
      <BookCover
        key={book.key}
        decorative
        index={animationIndex}
        color="var(--theme-decorative-primary)"
        accentColor="var(--theme-decorative-accent-soft)"
      />
    );
  }

  return (
    <BookCover
      key={book.key}
      title={book.section.bookTitle}
      subtitle={book.section.bookSubtitle}
      href={`/${book.section.slug}`}
      color={book.section.color}
      accentColor={book.section.accentColor}
      index={animationIndex}
    />
  );
}

function resolveDecorHref(
  sections: SectionConfig[],
  slug: string | null
) {
  const section = slug ? findSectionConfig(sections, slug) : null;
  return section ? { href: `/${section.slug}`, label: section.title } : null;
}

export default function Bookshelf({
  sections,
  settings,
}: {
  sections: SectionConfig[];
  settings: SiteSettings;
}) {
  const navItems = getNavItems(sections);
  const desktopRows = chunkSections(sections, 4);
  const mobileRows = chunkSections(sections, 2);
  const metronomeLink = resolveDecorHref(sections, settings.metronomeCategorySlug);
  const vinylLink = resolveDecorHref(sections, settings.vinylCategorySlug);
  const plantLink = resolveDecorHref(sections, settings.plantCategorySlug);
  const metronomeLabel = settings.metronomeTooltip ?? metronomeLink?.label ?? null;
  const vinylLabel = settings.vinylTooltip ?? vinylLink?.label ?? null;
  const plantLabel = settings.plantTooltip ?? plantLink?.label ?? null;

  return (
    <div className="pointer-events-none mx-auto w-full animate-slide-up">
      <div className="hidden md:block space-y-6">
        {desktopRows.map((row, rowIndex) => {
          const books = withDecorativeBook(row, rowIndex);

          return (
            <Shelf key={`desktop-row-${rowIndex}`}>
              {rowIndex === 0 ? (
                <Metronome href={metronomeLink?.href} label={metronomeLabel} />
              ) : null}
              {books.map((book, bookIndex) =>
                renderShelfBook(book, rowIndex * 6 + bookIndex)
              )}
              {rowIndex === 0 ? (
                <>
                  <ShelfDecor href={vinylLink?.href} label={vinylLabel} />
                  <PlantPot href={plantLink?.href} label={plantLabel} />
                </>
              ) : null}
            </Shelf>
          );
        })}
      </div>

      <div className="space-y-6 md:hidden">
        {mobileRows.map((row, rowIndex) => {
          const books = withDecorativeBook(row, rowIndex);

          return (
            <Shelf key={`mobile-row-${rowIndex}`}>
              {books.map((book, bookIndex) =>
                renderShelfBook(book, rowIndex * 4 + bookIndex)
              )}
            </Shelf>
          );
        })}

        <Shelf>
          <Metronome href={metronomeLink?.href} label={metronomeLabel} />
          <ShelfDecor href={vinylLink?.href} label={vinylLabel} />
          <PlantPot href={plantLink?.href} label={plantLabel} />
        </Shelf>
      </div>

      <div
        data-wall-art-blocker="true"
        className="pointer-events-auto mt-4 flex justify-center"
      >
        <nav
          aria-label="Home sections"
          className="theme-nav-pill inline-flex flex-wrap items-center justify-center gap-4 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] backdrop-blur-[1px] sm:gap-6 sm:text-sm"
          style={{ textShadow: "none" }}
        >
          {navItems.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              className="theme-nav-pill-link theme-focus-ring transition-colors"
            >
              {item.shortLabel}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
