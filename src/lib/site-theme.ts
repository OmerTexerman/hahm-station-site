import { sanityColorToCss, type SanityColorSource } from "@/sanity/color";

export type ThemeFieldset =
  | "base"
  | "navigation"
  | "home"
  | "decorative"
  | "wallArt";

export const THEME_FIELDSET_TITLES: Record<ThemeFieldset, string> = {
  base: "Base UI",
  navigation: "Navigation and Cards",
  home: "Home Scene",
  decorative: "Decorative Objects",
  wallArt: "Wall Art",
};

export const THEME_FIELD_DEFINITIONS = [
  {
    name: "background",
    title: "Background",
    description: "Main page background color.",
    fieldset: "base",
    cssVar: "--theme-background",
    allowAlpha: false,
  },
  {
    name: "foreground",
    title: "Foreground",
    description: "Primary heading and body text color.",
    fieldset: "base",
    cssVar: "--theme-foreground",
    allowAlpha: false,
  },
  {
    name: "mutedForeground",
    title: "Muted Text",
    description: "Secondary body and metadata text color.",
    fieldset: "base",
    cssVar: "--theme-muted-foreground",
    allowAlpha: false,
  },
  {
    name: "softForeground",
    title: "Soft Text",
    description: "Subtle text used for footer and quiet copy.",
    fieldset: "base",
    cssVar: "--theme-soft-foreground",
    allowAlpha: false,
  },
  {
    name: "accent",
    title: "Accent",
    description: "Primary brand accent color.",
    fieldset: "base",
    cssVar: "--theme-accent",
    allowAlpha: false,
  },
  {
    name: "accentHover",
    title: "Accent Hover",
    description: "Accent hover color for links and active UI.",
    fieldset: "base",
    cssVar: "--theme-accent-hover",
    allowAlpha: false,
  },
  {
    name: "accentSoft",
    title: "Accent Soft",
    description: "Soft accent background tint.",
    fieldset: "base",
    cssVar: "--theme-accent-soft",
    allowAlpha: true,
  },
  {
    name: "focusRing",
    title: "Focus Ring",
    description: "Keyboard focus outline color.",
    fieldset: "base",
    cssVar: "--theme-focus-ring",
    allowAlpha: false,
  },
  {
    name: "surface",
    title: "Surface",
    description: "Default section and page surface color.",
    fieldset: "base",
    cssVar: "--theme-surface",
    allowAlpha: false,
  },
  {
    name: "surfaceElevated",
    title: "Elevated Surface",
    description: "Cards and elevated panel background color.",
    fieldset: "base",
    cssVar: "--theme-surface-elevated",
    allowAlpha: false,
  },
  {
    name: "surfaceOverlay",
    title: "Overlay Surface",
    description: "Overlay and tinted surface background color.",
    fieldset: "base",
    cssVar: "--theme-surface-overlay",
    allowAlpha: true,
  },
  {
    name: "border",
    title: "Border",
    description: "Default border color.",
    fieldset: "base",
    cssVar: "--theme-border",
    allowAlpha: false,
  },
  {
    name: "borderStrong",
    title: "Strong Border",
    description: "Hover and emphasized border color.",
    fieldset: "base",
    cssVar: "--theme-border-strong",
    allowAlpha: false,
  },
  {
    name: "navPillBackground",
    title: "Nav Pill Background",
    description: "Background for navigation pills.",
    fieldset: "navigation",
    cssVar: "--theme-nav-pill-background",
    allowAlpha: true,
  },
  {
    name: "navPillText",
    title: "Nav Pill Text",
    description: "Text color for navigation pills.",
    fieldset: "navigation",
    cssVar: "--theme-nav-pill-text",
    allowAlpha: false,
  },
  {
    name: "navPillActiveBackground",
    title: "Nav Pill Active Background",
    description: "Active navigation pill background.",
    fieldset: "navigation",
    cssVar: "--theme-nav-pill-active-background",
    allowAlpha: false,
  },
  {
    name: "navPillActiveText",
    title: "Nav Pill Active Text",
    description: "Active navigation pill text color.",
    fieldset: "navigation",
    cssVar: "--theme-nav-pill-active-text",
    allowAlpha: false,
  },
  {
    name: "tooltipBackground",
    title: "Tooltip Background",
    description: "Tooltip and hover-label background color.",
    fieldset: "navigation",
    cssVar: "--theme-tooltip-background",
    allowAlpha: true,
  },
  {
    name: "tooltipText",
    title: "Tooltip Text",
    description: "Tooltip and hover-label text color.",
    fieldset: "navigation",
    cssVar: "--theme-tooltip-text",
    allowAlpha: false,
  },
  {
    name: "shelfTop",
    title: "Shelf Top",
    description: "Top tone of the wooden shelf.",
    fieldset: "home",
    cssVar: "--theme-shelf-top",
    allowAlpha: false,
  },
  {
    name: "shelfBottom",
    title: "Shelf Bottom",
    description: "Bottom tone of the wooden shelf.",
    fieldset: "home",
    cssVar: "--theme-shelf-bottom",
    allowAlpha: false,
  },
  {
    name: "shelfLip",
    title: "Shelf Lip",
    description: "Lower shelf support color.",
    fieldset: "home",
    cssVar: "--theme-shelf-lip",
    allowAlpha: false,
  },
  {
    name: "shelfShadow",
    title: "Shelf Shadow",
    description: "Shadow color cast by the shelf.",
    fieldset: "home",
    cssVar: "--theme-shelf-shadow",
    allowAlpha: true,
  },
  {
    name: "headerTopSpine",
    title: "Top Header Book Spine",
    description: "Front or spine color of the top header book.",
    fieldset: "home",
    cssVar: "--theme-header-top-spine",
    allowAlpha: false,
  },
  {
    name: "headerTopCover",
    title: "Top Header Book Cover",
    description: "Top or cover plane color of the top header book.",
    fieldset: "home",
    cssVar: "--theme-header-top-cover",
    allowAlpha: false,
  },
  {
    name: "headerBottomSpine",
    title: "Bottom Header Book Spine",
    description: "Front or spine color of the bottom header book.",
    fieldset: "home",
    cssVar: "--theme-header-bottom-spine",
    allowAlpha: false,
  },
  {
    name: "headerBottomCover",
    title: "Bottom Header Book Cover",
    description: "Top or cover plane color of the bottom header book.",
    fieldset: "home",
    cssVar: "--theme-header-bottom-cover",
    allowAlpha: false,
  },
  {
    name: "bookPage",
    title: "Book Page Color",
    description: "Page-edge color for the stacked header books.",
    fieldset: "home",
    cssVar: "--theme-book-page",
    allowAlpha: false,
  },
  {
    name: "spotlightFill",
    title: "Spotlight Fill",
    description: "Fill color inside the spotlight circle.",
    fieldset: "home",
    cssVar: "--theme-spotlight-fill",
    allowAlpha: true,
  },
  {
    name: "spotlightShadow",
    title: "Spotlight Shadow",
    description: "Shadow cast outside the spotlight circle.",
    fieldset: "home",
    cssVar: "--theme-spotlight-shadow",
    allowAlpha: true,
  },
  {
    name: "decorativePrimary",
    title: "Decorative Primary",
    description: "Primary decorative object color.",
    fieldset: "decorative",
    cssVar: "--theme-decorative-primary",
    allowAlpha: false,
  },
  {
    name: "decorativeSecondary",
    title: "Decorative Secondary",
    description: "Secondary decorative object color.",
    fieldset: "decorative",
    cssVar: "--theme-decorative-secondary",
    allowAlpha: false,
  },
  {
    name: "decorativeTertiary",
    title: "Decorative Tertiary",
    description: "Third decorative object color, often used for greenery.",
    fieldset: "decorative",
    cssVar: "--theme-decorative-tertiary",
    allowAlpha: false,
  },
  {
    name: "decorativeAccent",
    title: "Decorative Accent",
    description: "Accent color for props and ornament details.",
    fieldset: "decorative",
    cssVar: "--theme-decorative-accent",
    allowAlpha: false,
  },
  {
    name: "decorativeAccentSoft",
    title: "Decorative Accent Soft",
    description: "Soft highlight color for props and ornament details.",
    fieldset: "decorative",
    cssVar: "--theme-decorative-accent-soft",
    allowAlpha: false,
  },
  {
    name: "wallArtPaper",
    title: "Wall Art Paper",
    description: "Paper or background color for fallback wall art pieces.",
    fieldset: "wallArt",
    cssVar: "--theme-wall-art-paper",
    allowAlpha: false,
  },
  {
    name: "wallArtInk",
    title: "Wall Art Ink",
    description: "Ink and line color for fallback wall art pieces.",
    fieldset: "wallArt",
    cssVar: "--theme-wall-art-ink",
    allowAlpha: false,
  },
  {
    name: "wallArtAccent",
    title: "Wall Art Accent",
    description: "Accent color used in fallback wall art graphics.",
    fieldset: "wallArt",
    cssVar: "--theme-wall-art-accent",
    allowAlpha: false,
  },
  {
    name: "wallArtPinRed",
    title: "Pushpin Red",
    description: "Red pushpin color.",
    fieldset: "wallArt",
    cssVar: "--theme-wall-art-pin-red",
    allowAlpha: false,
  },
  {
    name: "wallArtPinYellow",
    title: "Pushpin Yellow",
    description: "Yellow pushpin color.",
    fieldset: "wallArt",
    cssVar: "--theme-wall-art-pin-yellow",
    allowAlpha: false,
  },
  {
    name: "wallArtPinGreen",
    title: "Pushpin Green",
    description: "Green pushpin color.",
    fieldset: "wallArt",
    cssVar: "--theme-wall-art-pin-green",
    allowAlpha: false,
  },
  {
    name: "wallArtPinBlue",
    title: "Pushpin Blue",
    description: "Blue pushpin color.",
    fieldset: "wallArt",
    cssVar: "--theme-wall-art-pin-blue",
    allowAlpha: false,
  },
] as const;

type ThemeFieldDefinition = (typeof THEME_FIELD_DEFINITIONS)[number];
export type ThemeTokenName = ThemeFieldDefinition["name"];
export type ThemeCssVariable = ThemeFieldDefinition["cssVar"];

export type SiteTheme = Record<ThemeTokenName, string>;
export type ThemePresetId =
  | "station-amber"
  | "paper-stack"
  | "midnight-blue"
  | "moss-study";

export interface SiteThemeSource
  extends Partial<Record<ThemeTokenName, SanityColorSource>> {
  preset?: ThemePresetId | null;
}

export interface ThemePreset {
  id: ThemePresetId;
  title: string;
  description: string;
  theme: SiteTheme;
}

const STATION_AMBER_THEME: SiteTheme = {
  background: "#1C1917",
  foreground: "#E7E5E4",
  mutedForeground: "#A8A29E",
  softForeground: "#D6D3D1",
  accent: "#F59E0B",
  accentHover: "#FBBF24",
  accentSoft: "rgba(245, 158, 11, 0.16)",
  focusRing: "#F59E0B",
  surface: "#1C1917",
  surfaceElevated: "#292524",
  surfaceOverlay: "rgba(28, 25, 23, 0.72)",
  border: "#44403C",
  borderStrong: "#78716C",
  navPillBackground: "rgba(0, 0, 0, 0.35)",
  navPillText: "#F5F5F4",
  navPillActiveBackground: "#E7E5E4",
  navPillActiveText: "#1C1917",
  tooltipBackground: "rgba(0, 0, 0, 0.7)",
  tooltipText: "#F5F5F4",
  shelfTop: "#B45309",
  shelfBottom: "#92400E",
  shelfLip: "#78350F",
  shelfShadow: "rgba(0, 0, 0, 0.3)",
  headerTopSpine: "#2A2A4E",
  headerTopCover: "#1A1A2E",
  headerBottomSpine: "#7D5C4D",
  headerBottomCover: "#5C3D2E",
  bookPage: "#E8E0D0",
  spotlightFill: "rgba(242, 223, 187, 0.18)",
  spotlightShadow: "rgba(7, 6, 5, 0.58)",
  decorativePrimary: "#5C3D2E",
  decorativeSecondary: "#4E3226",
  decorativeTertiary: "#2E7D32",
  decorativeAccent: "#D4A056",
  decorativeAccentSoft: "#C5A880",
  wallArtPaper: "#F5F0E8",
  wallArtInk: "#1C1917",
  wallArtAccent: "#D4A056",
  wallArtPinRed: "#CC3333",
  wallArtPinYellow: "#E6C619",
  wallArtPinGreen: "#339933",
  wallArtPinBlue: "#3366CC",
};

const PAPER_STACK_THEME: SiteTheme = {
  background: "#EEE7DB",
  foreground: "#2C2621",
  mutedForeground: "#5B5247",
  softForeground: "#73695D",
  accent: "#9C5D2E",
  accentHover: "#B26E3B",
  accentSoft: "rgba(156, 93, 46, 0.14)",
  focusRing: "#9C5D2E",
  surface: "#F5F0E8",
  surfaceElevated: "#FFF9F0",
  surfaceOverlay: "rgba(245, 240, 232, 0.76)",
  border: "#C9BCA8",
  borderStrong: "#A9967D",
  navPillBackground: "rgba(44, 38, 33, 0.08)",
  navPillText: "#2C2621",
  navPillActiveBackground: "#2C2621",
  navPillActiveText: "#FAF7F2",
  tooltipBackground: "rgba(44, 38, 33, 0.88)",
  tooltipText: "#FAF7F2",
  shelfTop: "#A2591A",
  shelfBottom: "#83430E",
  shelfLip: "#6E340B",
  shelfShadow: "rgba(44, 38, 33, 0.18)",
  headerTopSpine: "#6C4E3D",
  headerTopCover: "#8B6854",
  headerBottomSpine: "#B38A6A",
  headerBottomCover: "#CBA98D",
  bookPage: "#FFF8EE",
  spotlightFill: "rgba(255, 246, 223, 0.38)",
  spotlightShadow: "rgba(68, 56, 43, 0.32)",
  decorativePrimary: "#7A5339",
  decorativeSecondary: "#A06B48",
  decorativeTertiary: "#6C8E58",
  decorativeAccent: "#C9954B",
  decorativeAccentSoft: "#E0C39A",
  wallArtPaper: "#FFF8EE",
  wallArtInk: "#2C2621",
  wallArtAccent: "#C9954B",
  wallArtPinRed: "#B44A42",
  wallArtPinYellow: "#D3A630",
  wallArtPinGreen: "#658A4A",
  wallArtPinBlue: "#5579B1",
};

const MIDNIGHT_BLUE_THEME: SiteTheme = {
  background: "#111827",
  foreground: "#E5ECF7",
  mutedForeground: "#9FB0C8",
  softForeground: "#C8D1DF",
  accent: "#5EA4FF",
  accentHover: "#8CC0FF",
  accentSoft: "rgba(94, 164, 255, 0.18)",
  focusRing: "#5EA4FF",
  surface: "#111827",
  surfaceElevated: "#192233",
  surfaceOverlay: "rgba(17, 24, 39, 0.72)",
  border: "#304053",
  borderStrong: "#50657F",
  navPillBackground: "rgba(0, 0, 0, 0.28)",
  navPillText: "#E5ECF7",
  navPillActiveBackground: "#DCE7F5",
  navPillActiveText: "#111827",
  tooltipBackground: "rgba(8, 12, 20, 0.84)",
  tooltipText: "#F3F7FC",
  shelfTop: "#7C3F1D",
  shelfBottom: "#5C2C13",
  shelfLip: "#4A210D",
  shelfShadow: "rgba(0, 0, 0, 0.36)",
  headerTopSpine: "#273B73",
  headerTopCover: "#1A2A57",
  headerBottomSpine: "#5A4B71",
  headerBottomCover: "#45395B",
  bookPage: "#F1E9DA",
  spotlightFill: "rgba(225, 236, 255, 0.16)",
  spotlightShadow: "rgba(2, 4, 9, 0.62)",
  decorativePrimary: "#5A3D30",
  decorativeSecondary: "#3D2D26",
  decorativeTertiary: "#2E8B78",
  decorativeAccent: "#E0A458",
  decorativeAccentSoft: "#E7C9A0",
  wallArtPaper: "#EFF3FA",
  wallArtInk: "#101827",
  wallArtAccent: "#5EA4FF",
  wallArtPinRed: "#D25D5D",
  wallArtPinYellow: "#E2B541",
  wallArtPinGreen: "#53B17B",
  wallArtPinBlue: "#5EA4FF",
};

const MOSS_STUDY_THEME: SiteTheme = {
  background: "#151A14",
  foreground: "#E7E9DF",
  mutedForeground: "#AEB5A5",
  softForeground: "#C8CDBD",
  accent: "#B88C4A",
  accentHover: "#D2A35B",
  accentSoft: "rgba(184, 140, 74, 0.18)",
  focusRing: "#B88C4A",
  surface: "#151A14",
  surfaceElevated: "#20281D",
  surfaceOverlay: "rgba(21, 26, 20, 0.72)",
  border: "#384136",
  borderStrong: "#5A6754",
  navPillBackground: "rgba(0, 0, 0, 0.28)",
  navPillText: "#EFF2E7",
  navPillActiveBackground: "#E7E9DF",
  navPillActiveText: "#151A14",
  tooltipBackground: "rgba(10, 13, 9, 0.82)",
  tooltipText: "#EFF2E7",
  shelfTop: "#8D4A19",
  shelfBottom: "#6A3410",
  shelfLip: "#53250B",
  shelfShadow: "rgba(0, 0, 0, 0.34)",
  headerTopSpine: "#324936",
  headerTopCover: "#213320",
  headerBottomSpine: "#79614B",
  headerBottomCover: "#5F4B3A",
  bookPage: "#ECE2D1",
  spotlightFill: "rgba(235, 230, 207, 0.16)",
  spotlightShadow: "rgba(4, 5, 4, 0.6)",
  decorativePrimary: "#664330",
  decorativeSecondary: "#4D3023",
  decorativeTertiary: "#4B8B4A",
  decorativeAccent: "#CBA45A",
  decorativeAccentSoft: "#DAC59B",
  wallArtPaper: "#F3EFE4",
  wallArtInk: "#171B15",
  wallArtAccent: "#CBA45A",
  wallArtPinRed: "#C65C4B",
  wallArtPinYellow: "#D9B33E",
  wallArtPinGreen: "#5DA05C",
  wallArtPinBlue: "#5B7DB9",
};

export const DEFAULT_THEME_PRESET: ThemePresetId = "station-amber";

export const THEME_PRESETS: Record<ThemePresetId, ThemePreset> = {
  "station-amber": {
    id: "station-amber",
    title: "Station Amber",
    description: "Warm shelf lighting with the original moody studio feel.",
    theme: STATION_AMBER_THEME,
  },
  "paper-stack": {
    id: "paper-stack",
    title: "Paper Stack",
    description: "A lighter, editorial palette with tan wood and parchment tones.",
    theme: PAPER_STACK_THEME,
  },
  "midnight-blue": {
    id: "midnight-blue",
    title: "Midnight Blue",
    description: "Cool nocturne tones with blue highlights and dark navy surfaces.",
    theme: MIDNIGHT_BLUE_THEME,
  },
  "moss-study": {
    id: "moss-study",
    title: "Moss Study",
    description: "Earthy green and bronze tones for a softer library look.",
    theme: MOSS_STUDY_THEME,
  },
};

export const THEME_PRESET_OPTIONS = Object.values(THEME_PRESETS).map(
  ({ id, title, description }) => ({
    title: `${title} - ${description}`,
    value: id,
  })
);

export const DEFAULT_SITE_THEME = THEME_PRESETS[DEFAULT_THEME_PRESET].theme;

export function getThemePreset(preset?: string | null): ThemePreset {
  if (preset && preset in THEME_PRESETS) {
    return THEME_PRESETS[preset as ThemePresetId];
  }

  return THEME_PRESETS[DEFAULT_THEME_PRESET];
}

export function getThemeSwatches(fieldName: ThemeTokenName) {
  return Array.from(
    new Set(Object.values(THEME_PRESETS).map((preset) => preset.theme[fieldName]))
  );
}

export function resolveTheme(source?: SiteThemeSource | null): SiteTheme {
  const baseTheme = getThemePreset(source?.preset).theme;

  return THEME_FIELD_DEFINITIONS.reduce((theme, definition) => {
    theme[definition.name] = sanityColorToCss(
      source?.[definition.name],
      baseTheme[definition.name]
    );
    return theme;
  }, {} as SiteTheme);
}
