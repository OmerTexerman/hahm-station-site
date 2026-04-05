import {
  DEFAULT_SITE_THEME,
  resolveTheme,
  type SiteTheme,
  type SiteThemeSource,
} from "@/lib/site-theme";
import { sanityColorToCss, type SanityColorSource } from "@/sanity/color";

export const REVALIDATE_SECONDS = 300;

export type CategorySlug = string;

export interface SectionConfig {
  slug: CategorySlug;
  title: string;
  shortLabel: string;
  description: string;
  emptyState: string;
  bookTitle: string;
  bookSubtitle: string;
  postFallbackExcerpt: string;
  color: string;
  accentColor: string;
  order: number;
}

export interface CategoryContentSource {
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  navigationLabel?: string | null;
  bookTitle?: string | null;
  bookSubtitle?: string | null;
  emptyState?: string | null;
  postFallbackExcerpt?: string | null;
  color?: SanityColorSource;
  accentColor?: SanityColorSource;
  orderRank?: number | null;
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  homeHeaderTop: string;
  homeHeaderBottom: string;
  homeSceneTitle: string;
  homeSceneDescription: string;
  homeFooter: string;
  wallArtLabel: string;
  wallArtQuote: string;
  notFoundTitle: string;
  notFoundDescription: string;
  notFoundLinkLabel: string;
  metronomeTooltip: string | null;
  vinylTooltip: string | null;
  plantTooltip: string | null;
  metronomeCategorySlug: string | null;
  vinylCategorySlug: string | null;
  plantCategorySlug: string | null;
  theme: SiteTheme;
}

export interface SiteSettingsSource {
  siteTitle?: string | null;
  siteDescription?: string | null;
  homeHeaderTop?: string | null;
  homeHeaderBottom?: string | null;
  homeSceneTitle?: string | null;
  homeSceneDescription?: string | null;
  homeFooter?: string | null;
  wallArtLabel?: string | null;
  wallArtQuote?: string | null;
  notFoundTitle?: string | null;
  notFoundDescription?: string | null;
  notFoundLinkLabel?: string | null;
  metronomeTooltip?: string | null;
  vinylTooltip?: string | null;
  plantTooltip?: string | null;
  metronomeCategorySlug?: string | null;
  vinylCategorySlug?: string | null;
  plantCategorySlug?: string | null;
  theme?: SiteThemeSource | null;
}

const SECTION_COLOR_FALLBACKS = [
  { color: "#8B4513", accentColor: "#D4A056" },
  { color: "#2F4F4F", accentColor: "#5F9F9F" },
  { color: "#1A1A2E", accentColor: "#6366F1" },
  { color: "#1A5C3A", accentColor: "#4CAF50" },
  { color: "#5C4033", accentColor: "#8B7355" },
] as const;

const DEFAULT_SECTION_ORDER = [
  "music-review",
  "life-updates",
  "my-music",
  "literature-review",
] as const;

const KNOWN_SECTION_DEFAULTS: Record<string, SectionConfig> = {
  "music-review": {
    slug: "music-review",
    title: "Music Review",
    shortLabel: "Music",
    description:
      "Albums, singles, and production details worth sitting with for a little longer.",
    emptyState: "No music reviews have been published yet.",
    bookTitle: "Music\nReview",
    bookSubtitle: "Albums, singles, and production notes",
    postFallbackExcerpt: "Album notes, singles, and production observations.",
    color: "#8B4513",
    accentColor: "#D4A056",
    order: 0,
  },
  "life-updates": {
    slug: "life-updates",
    title: "Life Updates",
    shortLabel: "Life",
    description:
      "Process notes, studio thoughts, and the quieter parts around the work.",
    emptyState: "No life updates have been published yet.",
    bookTitle: "Life\nUpdates",
    bookSubtitle: "Process notes and everything else",
    postFallbackExcerpt: "Process notes, reflections, and the rest of life.",
    color: "#2F4F4F",
    accentColor: "#5F9F9F",
    order: 1,
  },
  "my-music": {
    slug: "my-music",
    title: "My Music",
    shortLabel: "My Music",
    description:
      "Releases, sketches, and behind-the-track notes from the work in progress.",
    emptyState: "No music releases or notes have been published yet.",
    bookTitle: "My\nMusic",
    bookSubtitle: "Releases, demos, and process notes",
    postFallbackExcerpt: "Original releases, sketches, and studio notes.",
    color: "#1A1A2E",
    accentColor: "#6366F1",
    order: 2,
  },
  "literature-review": {
    slug: "literature-review",
    title: "Literature Review",
    shortLabel: "Books",
    description:
      "Reading notes, close looks, and books that stay in the room after the last page.",
    emptyState: "No literature reviews have been published yet.",
    bookTitle: "Literature\nReview",
    bookSubtitle: "Books worth rereading",
    postFallbackExcerpt:
      "Reading notes and close looks at books worth revisiting.",
    color: "#1A5C3A",
    accentColor: "#4CAF50",
    order: 3,
  },
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: "HAHM Station",
  siteDescription:
    "A quiet listening room for music reviews, literature notes, original releases, and life updates.",
  homeHeaderTop: "HAHM",
  homeHeaderBottom: "STATION",
  homeSceneTitle: "HAHM Station",
  homeSceneDescription:
    "A quiet listening room for music reviews, literature notes, original releases, and life updates.",
  homeFooter: "Music, literature, process, and life.",
  wallArtLabel: "HAHM STATION",
  wallArtQuote: '"Keep something worth looking at nearby."',
  notFoundTitle: "Page not found",
  notFoundDescription:
    "The page you tried to open does not exist, or the link points to an older draft.",
  notFoundLinkLabel: "Return home",
  metronomeTooltip: null,
  vinylTooltip: null,
  plantTooltip: null,
  metronomeCategorySlug: "my-music",
  vinylCategorySlug: "my-music",
  plantCategorySlug: "life-updates",
  theme: DEFAULT_SITE_THEME,
};

function titleFromSlug(slug: string) {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function shortLabelFromTitle(title: string) {
  return title.split(/\s+/).slice(0, 2).join(" ");
}

function bookTitleFromTitle(title: string) {
  const words = title.split(/\s+/).filter(Boolean);

  if (words.length <= 1) {
    return title;
  }

  const midpoint = Math.ceil(words.length / 2);
  return `${words.slice(0, midpoint).join(" ")}\n${words.slice(midpoint).join(" ")}`;
}

function colorFallback(index: number) {
  return SECTION_COLOR_FALLBACKS[index % SECTION_COLOR_FALLBACKS.length];
}

function readColorToken(
  value: SanityColorSource,
  fallback: string
) {
  return sanityColorToCss(value, fallback);
}

function readOptionalText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function buildGenericSectionConfig(slug: string, index = 0): SectionConfig {
  const title = titleFromSlug(slug);
  const colors = colorFallback(index);

  return {
    slug,
    title,
    shortLabel: shortLabelFromTitle(title),
    description: `Writing and updates collected under ${title}.`,
    emptyState: `No ${title.toLowerCase()} posts have been published yet.`,
    bookTitle: bookTitleFromTitle(title),
    bookSubtitle: `Open ${title}`,
    postFallbackExcerpt: `Read the latest posts in ${title}.`,
    color: colors.color,
    accentColor: colors.accentColor,
    order: index,
  };
}

export function getSectionConfig(slug: CategorySlug): SectionConfig {
  return KNOWN_SECTION_DEFAULTS[slug] ?? buildGenericSectionConfig(slug);
}

export function resolveSectionConfig(
  source: CategoryContentSource,
  index = 0
): SectionConfig | null {
  const slug = source.slug?.trim();

  if (!slug) {
    return null;
  }

  const defaults =
    KNOWN_SECTION_DEFAULTS[slug] ?? buildGenericSectionConfig(slug, index);

  return {
    ...defaults,
    slug,
    title: source.title?.trim() || defaults.title,
    shortLabel: source.navigationLabel?.trim() || defaults.shortLabel,
    description: source.description?.trim() || defaults.description,
    emptyState: source.emptyState?.trim() || defaults.emptyState,
    bookTitle: source.bookTitle?.trim() || defaults.bookTitle,
    bookSubtitle: source.bookSubtitle?.trim() || defaults.bookSubtitle,
    postFallbackExcerpt:
      source.postFallbackExcerpt?.trim() || defaults.postFallbackExcerpt,
    color: readColorToken(source.color, defaults.color),
    accentColor: readColorToken(source.accentColor, defaults.accentColor),
    order:
      typeof source.orderRank === "number" && Number.isFinite(source.orderRank)
        ? source.orderRank
        : defaults.order,
  };
}

export function resolveSections(
  sources: CategoryContentSource[] | null | undefined
): SectionConfig[] {
  const normalizedSources = (sources ?? [])
    .map((source, index) => resolveSectionConfig(source, index))
    .filter((section): section is SectionConfig => Boolean(section))
    .sort(
      (left, right) =>
        left.order - right.order || left.title.localeCompare(right.title)
    );

  if (normalizedSources.length > 0) {
    return normalizedSources;
  }

  return DEFAULT_SECTION_ORDER.map((slug, index) => {
    const section = KNOWN_SECTION_DEFAULTS[slug];
    return { ...section, order: index };
  });
}

export function findSectionConfig(
  sections: SectionConfig[],
  slug: CategorySlug
): SectionConfig | null {
  return sections.find((section) => section.slug === slug) ?? null;
}

export function getNavItems(sections: SectionConfig[]) {
  return sections.map((section) => ({
    slug: section.slug,
    href: `/${section.slug}` as const,
    label: section.title,
    shortLabel: section.shortLabel,
  }));
}

export function resolveSiteSettings(
  source?: SiteSettingsSource | null
): SiteSettings {
  return {
    siteTitle: source?.siteTitle?.trim() || DEFAULT_SITE_SETTINGS.siteTitle,
    siteDescription:
      source?.siteDescription?.trim() || DEFAULT_SITE_SETTINGS.siteDescription,
    homeHeaderTop:
      source?.homeHeaderTop?.trim() || DEFAULT_SITE_SETTINGS.homeHeaderTop,
    homeHeaderBottom:
      source?.homeHeaderBottom?.trim() || DEFAULT_SITE_SETTINGS.homeHeaderBottom,
    homeSceneTitle:
      source?.homeSceneTitle?.trim() || DEFAULT_SITE_SETTINGS.homeSceneTitle,
    homeSceneDescription:
      source?.homeSceneDescription?.trim() ||
      DEFAULT_SITE_SETTINGS.homeSceneDescription,
    homeFooter: source?.homeFooter?.trim() || DEFAULT_SITE_SETTINGS.homeFooter,
    wallArtLabel:
      source?.wallArtLabel?.trim() || DEFAULT_SITE_SETTINGS.wallArtLabel,
    wallArtQuote:
      source?.wallArtQuote?.trim() || DEFAULT_SITE_SETTINGS.wallArtQuote,
    notFoundTitle:
      source?.notFoundTitle?.trim() || DEFAULT_SITE_SETTINGS.notFoundTitle,
    notFoundDescription:
      source?.notFoundDescription?.trim() ||
      DEFAULT_SITE_SETTINGS.notFoundDescription,
    notFoundLinkLabel:
      source?.notFoundLinkLabel?.trim() ||
      DEFAULT_SITE_SETTINGS.notFoundLinkLabel,
    metronomeTooltip: readOptionalText(source?.metronomeTooltip),
    vinylTooltip: readOptionalText(source?.vinylTooltip),
    plantTooltip: readOptionalText(source?.plantTooltip),
    metronomeCategorySlug:
      readOptionalText(source?.metronomeCategorySlug) ||
      DEFAULT_SITE_SETTINGS.metronomeCategorySlug,
    vinylCategorySlug:
      readOptionalText(source?.vinylCategorySlug) ||
      DEFAULT_SITE_SETTINGS.vinylCategorySlug,
    plantCategorySlug:
      readOptionalText(source?.plantCategorySlug) ||
      DEFAULT_SITE_SETTINGS.plantCategorySlug,
    theme: resolveTheme(source?.theme),
  };
}

const dateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function formatPublishedDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
}
