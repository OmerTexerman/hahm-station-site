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
    <div
      data-wall-art-blocker="true"
      data-spotlight-target="true"
      className="pointer-events-auto overflow-x-auto scrollbar-hide snap-x snap-proximity xl:snap-none [overscroll-behavior-x:contain]"
    >
      <div className="inline-flex min-w-full flex-col items-stretch">
        <div className="flex items-end gap-[2px] px-4 [justify-content:safe_center] sm:gap-[3px] sm:px-6">
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
  for (let i = 0; i < sections.length; i += size) {
    chunks.push(sections.slice(i, i + size));
  }
  return chunks;
}

function buildShelfBooks(sections: SectionConfig[]): ShelfBook[] {
  const books: ShelfBook[] = sections.map((section) => ({
    kind: "section" as const,
    key: section.slug,
    section,
  }));

  const insertAt = Math.min(2, books.length);

  return [
    ...books.slice(0, insertAt),
    { kind: "decorative" as const, key: "decorative-home-book" },
    ...books.slice(insertAt),
  ];
}

function renderShelfBook(book: ShelfBook, index: number) {
  if (book.kind === "decorative") {
    return (
      <BookCover
        key={book.key}
        decorative
        index={index}
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
      index={index}
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
  const allBooks = buildShelfBooks(sections);
  const mobileRows = chunkSections(sections, 2);
  const metronomeLink = resolveDecorHref(sections, settings.metronomeCategorySlug);
  const vinylLink = resolveDecorHref(sections, settings.vinylCategorySlug);
  const plantLink = resolveDecorHref(sections, settings.plantCategorySlug);
  const metronomeLabel = settings.metronomeTooltip ?? metronomeLink?.label ?? null;
  const vinylLabel = settings.vinylTooltip ?? vinylLink?.label ?? null;
  const plantLabel = settings.plantTooltip ?? plantLink?.label ?? null;

  return (
    <div className="pointer-events-none mx-auto w-full animate-slide-up">
      {/* Desktop: single shelf, all items inline */}
      <div className="hidden xl:block">
        <Shelf>
          <Metronome href={metronomeLink?.href} label={metronomeLabel} />
          {allBooks.map((book, index) => renderShelfBook(book, index))}
          <ShelfDecor href={vinylLink?.href} label={vinylLabel} />
          <PlantPot href={plantLink?.href} label={plantLabel} />
        </Shelf>
      </div>

      {/* Mobile/tablet: multiple shelves, decorations integrated */}
      <div className="space-y-6 xl:hidden">
        {mobileRows.map((row, rowIndex) => {
          const books = row.map((section) => ({
            kind: "section" as const,
            key: section.slug,
            section,
          }));
          const isFirstRow = rowIndex === 0;
          const isLastRow = rowIndex === mobileRows.length - 1;
          const decorativeBook: ShelfBook = {
            kind: "decorative" as const,
            key: "decorative-home-book",
          };

          return (
            <Shelf key={`mobile-row-${rowIndex}`}>
              {isFirstRow && (
                <Metronome href={metronomeLink?.href} label={metronomeLabel} />
              )}
              {books.map((book, bookIndex) =>
                renderShelfBook(book, rowIndex * 3 + bookIndex)
              )}
              {isFirstRow && renderShelfBook(decorativeBook, books.length)}
              {isLastRow && (
                <>
                  <ShelfDecor href={vinylLink?.href} label={vinylLabel} />
                  <PlantPot href={plantLink?.href} label={plantLabel} />
                </>
              )}
            </Shelf>
          );
        })}
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
