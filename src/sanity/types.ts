import type { CategorySlug } from "@/lib/site";
import type { SiteThemeSource } from "@/lib/site-theme";
import type { SanityColorSource } from "@/sanity/color";

export interface SanityImageSource {
  asset?: {
    _ref?: string;
    url?: string;
  };
  alt?: string | null;
}

export interface PostSummary {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string | null;
  coverImage?: SanityImageSource;
  categorySlug: CategorySlug;
}

export interface PortableTextSpan {
  _type: "span";
  _key: string;
  text: string;
  marks?: string[];
}

export interface PortableTextMarkDef {
  _key: string;
  _type: string;
  href?: string;
}

export interface PortableTextBlock {
  _type: "block";
  _key: string;
  style?: string;
  children: PortableTextSpan[];
  markDefs?: PortableTextMarkDef[];
  listItem?: "bullet" | "number";
  level?: number;
}

export interface PortableTextImageBlock extends SanityImageSource {
  _type: "image";
  _key: string;
  caption?: string;
}

export interface PortableTextAudioBlock {
  _type: "audioFile";
  _key: string;
  description?: string;
  asset?: {
    url?: string;
  };
}

export interface PortableTextVideoEmbedBlock {
  _type: "videoEmbed";
  _key: string;
  url?: string;
}

export interface PortableTextCodeBlock {
  _type: "codeBlock";
  _key: string;
  language?: string | null;
  filename?: string | null;
  code?: string | null;
}

export interface PortableTextCalloutBlock {
  _type: "callout";
  _key: string;
  tone?: "note" | "info" | "success" | "warning";
  title?: string | null;
  body?: PortableTextBlock[];
}

export interface PortableTextGalleryImage extends SanityImageSource {
  _key: string;
  caption?: string | null;
}

export interface PortableTextImageGalleryBlock {
  _type: "imageGallery";
  _key: string;
  images?: PortableTextGalleryImage[];
  caption?: string | null;
}

export type PostBodyNode =
  | PortableTextBlock
  | PortableTextImageBlock
  | PortableTextAudioBlock
  | PortableTextVideoEmbedBlock
  | PortableTextCodeBlock
  | PortableTextCalloutBlock
  | PortableTextImageGalleryBlock;

export interface PostDetail extends PostSummary {
  body: PostBodyNode[];
  category: {
    title: string;
    slug: CategorySlug;
  };
}

export interface CategoryDocument {
  title?: string | null;
  slug?: string | null;
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

export interface SiteSettingsDocument {
  siteTitle?: string | null;
  siteDescription?: string | null;
  notFoundTitle?: string | null;
  notFoundDescription?: string | null;
  notFoundLinkLabel?: string | null;
  theme?: SiteThemeSource | null;
}

export interface HomeScreenSettingsDocument {
  homeHeaderTop?: string | null;
  homeHeaderBottom?: string | null;
  homeSceneTitle?: string | null;
  homeSceneDescription?: string | null;
  homeFooter?: string | null;
  wallArtLabel?: string | null;
  wallArtQuote?: string | null;
  metronomeTooltip?: string | null;
  vinylTooltip?: string | null;
  plantTooltip?: string | null;
  metronomeCategorySlug?: string | null;
  vinylCategorySlug?: string | null;
  plantCategorySlug?: string | null;
}

export type WallArtStyle = "poster" | "polaroid" | "framed" | "frameless";
export type WallArtSize = "small" | "medium" | "large";

export interface WallArtPiece {
  _id: string;
  title: string;
  image?: SanityImageSource;
  imageUrl?: string;
  style?: WallArtStyle;
  size?: WallArtSize;
  caption?: string | null;
  link?: string | null;
}
