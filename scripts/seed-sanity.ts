import { createReadStream } from "node:fs";
import path from "node:path";
import { getCliClient } from "sanity/cli";
import { DEFAULT_THEME_PRESET } from "../src/lib/site-theme";
import { parseCssColor } from "../src/sanity/color";

const client = getCliClient({
  apiVersion: "2025-02-19",
});

const dryRun = process.argv.includes("--dry-run");

const SAMPLE_ASSET_FILES = {
  sonicMap: "sonic-map.svg",
  marginNotes: "margin-notes.svg",
  greenRoom: "green-room.svg",
  stillLife: "still-life.svg",
} as const;

const CATEGORY_SEEDS = [
  {
    slug: "music-review",
    title: "Music Review",
    description:
      "Albums, singles, and production notes worth sitting with a little longer.",
    navigationLabel: "Music",
    bookTitle: "Music\nReview",
    bookSubtitle: "Albums, tracks & sounds",
    emptyState: "No music reviews have been published yet.",
    postFallbackExcerpt: "Albums, singles, and production observations.",
    color: "#9B531F",
    accentColor: "#D5A35C",
    orderRank: 0,
  },
  {
    slug: "life-updates",
    title: "Life Updates",
    description:
      "Reflections, process notes, and the quieter things around the work.",
    navigationLabel: "Life",
    bookTitle: "Life\nUpdates",
    bookSubtitle: "Reflections & milestones",
    emptyState: "No life updates have been published yet.",
    postFallbackExcerpt: "Reflections, process notes, and quieter updates.",
    color: "#446E72",
    accentColor: "#7FB0B4",
    orderRank: 1,
  },
  {
    slug: "my-music",
    title: "My Music",
    description:
      "Releases, sketches, and behind-the-track notes from work in progress.",
    navigationLabel: "My Music",
    bookTitle: "My\nMusic",
    bookSubtitle: "Original compositions",
    emptyState: "No music releases or notes have been published yet.",
    postFallbackExcerpt: "Original releases, sketches, and studio notes.",
    color: "#232543",
    accentColor: "#6769E4",
    orderRank: 2,
  },
  {
    slug: "literature-review",
    title: "Literature Review",
    description: "Reading notes, close looks, and books worth revisiting.",
    navigationLabel: "Literature",
    bookTitle: "Literature\nReview",
    bookSubtitle: "Books, words & ideas",
    emptyState: "No literature reviews have been published yet.",
    postFallbackExcerpt: "Books, words, and reading notes.",
    color: "#1E7A4A",
    accentColor: "#56B76C",
    orderRank: 3,
  },
] as const;

function getDraftDocumentId(value: string) {
  return `drafts.${value}`;
}

async function publishDocument(document: {
  _id: string;
  _type: string;
  [key: string]: unknown;
}) {
  if (dryRun) {
    return;
  }

  const publishedId = document._id;
  const draftId = getDraftDocumentId(publishedId);
  await client
    .transaction()
    .createOrReplace({ ...document, _id: draftId })
    .commit();
  await client.action({
    actionType: "sanity.action.document.publish",
    draftId,
    publishedId,
  });
}

function requireColor(value: string) {
  const parsed = parseCssColor(value);

  if (!parsed) {
    throw new Error(`Unable to parse sample color "${value}".`);
  }

  return parsed;
}

function slug(current: string) {
  return {
    _type: "slug",
    current,
  };
}

function textBlock(
  key: string,
  text: string,
  style: string = "normal"
) {
  return {
    _type: "block",
    _key: key,
    style,
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: `${key}-span`,
        text,
        marks: [],
      },
    ],
  };
}

function linkedParagraph(
  key: string,
  before: string,
  linkText: string,
  href: string,
  after = ""
) {
  const markKey = `${key}-link`;

  return {
    _type: "block",
    _key: key,
    style: "normal",
    markDefs: [
      {
        _key: markKey,
        _type: "link",
        href,
      },
    ],
    children: [
      {
        _type: "span",
        _key: `${key}-before`,
        text: before,
        marks: [],
      },
      {
        _type: "span",
        _key: `${key}-link-span`,
        text: linkText,
        marks: [markKey],
      },
      {
        _type: "span",
        _key: `${key}-after`,
        text: after,
        marks: [],
      },
    ],
  };
}

function bulletItem(key: string, text: string, level = 1) {
  return {
    ...textBlock(key, text),
    listItem: "bullet",
    level,
  };
}

function numberItem(key: string, text: string, level = 1) {
  return {
    ...textBlock(key, text),
    listItem: "number",
    level,
  };
}

function imageBlock(
  key: string,
  assetRef: string,
  alt: string,
  caption?: string
) {
  return {
    _type: "image",
    _key: key,
    asset: {
      _type: "reference",
      _ref: assetRef,
    },
    alt,
    caption,
  };
}

function galleryBlock(
  key: string,
  images: Array<{ assetRef: string; alt: string; caption?: string }>,
  caption?: string
) {
  return {
    _type: "imageGallery",
    _key: key,
    caption,
    images: images.map((image, index) => ({
      _type: "image",
      _key: `${key}-image-${index + 1}`,
      asset: {
        _type: "reference",
        _ref: image.assetRef,
      },
      alt: image.alt,
      caption: image.caption,
    })),
  };
}

function calloutBlock(
  key: string,
  tone: "note" | "info" | "success" | "warning",
  title: string,
  body: string
) {
  return {
    _type: "callout",
    _key: key,
    tone,
    title,
    body: [textBlock(`${key}-body`, body)],
  };
}

function codeBlock(
  key: string,
  filename: string,
  language: string,
  code: string
) {
  return {
    _type: "codeBlock",
    _key: key,
    filename,
    language,
    code,
  };
}

function videoEmbed(key: string, url: string) {
  return {
    _type: "videoEmbed",
    _key: key,
    url,
  };
}

function imagePath(filename: string) {
  return path.join(process.cwd(), "public", "sanity-sample-assets", filename);
}

async function getOrUploadImageAsset(filename: string) {
  const existingAsset = await client.fetch<{ _id: string } | null>(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}`,
    { filename }
  );

  if (existingAsset?._id) {
    return existingAsset._id;
  }

  if (dryRun) {
    return `dry-run-image-${filename}`;
  }

  const asset = await client.assets.upload(
    "image",
    createReadStream(imagePath(filename)),
    {
      filename,
    }
  );

  return asset._id;
}

async function upsertAuthor() {
  const authorDocument = {
    _id: "seed-author-hahm",
    _type: "author",
    name: "HAHM",
    slug: slug("hahm"),
    bio: "Curator and contributor at HAHM Station.",
  };

  if (dryRun) {
    console.log("[dry-run] Would upsert default author");
    return authorDocument._id;
  }

  await publishDocument(authorDocument);
  console.log("Upserted default author");
  return authorDocument._id;
}

async function resolveCategoryIds() {
  const categoryIds = new Map<string, string>();

  for (const seed of CATEGORY_SEEDS) {
    const publishedId = `seed-category-${seed.slug}`;
    categoryIds.set(seed.slug, publishedId);

    const nextCategory = {
      _id: publishedId,
      _type: "category",
      title: seed.title,
      slug: slug(seed.slug),
      description: seed.description,
      navigationLabel: seed.navigationLabel,
      bookTitle: seed.bookTitle,
      bookSubtitle: seed.bookSubtitle,
      emptyState: seed.emptyState,
      postFallbackExcerpt: seed.postFallbackExcerpt,
      color: requireColor(seed.color),
      accentColor: requireColor(seed.accentColor),
      orderRank: seed.orderRank,
    };

    if (dryRun) {
      console.log(`[dry-run] Would upsert category ${seed.slug}`);
      continue;
    }

    await publishDocument(nextCategory);
    console.log(`Upserted category ${seed.slug}`);
  }

  return categoryIds;
}

async function upsertSiteSettings() {
  const siteSettingsDocument = {
    _id: "siteSettings",
    _type: "siteSettings",
    siteTitle: "HAHM Station",
    siteDescription:
      "A quiet room for music reviews, literature notes, original releases, and life updates.",
    notFoundTitle: "Page not found",
    notFoundDescription:
      "The page you tried to open does not exist, or the link points to an older draft.",
    notFoundLinkLabel: "Return home",
    theme: {
      preset: DEFAULT_THEME_PRESET,
      accent: requireColor("#E0A458"),
      accentHover: requireColor("#F0C06E"),
      accentSoft: requireColor("rgba(224, 164, 88, 0.18)"),
      navPillBackground: requireColor("rgba(28, 25, 23, 0.48)"),
      tooltipBackground: requireColor("rgba(12, 10, 9, 0.82)"),
      spotlightFill: requireColor("rgba(242, 223, 187, 0.22)"),
      spotlightShadow: requireColor("rgba(7, 6, 5, 0.62)"),
    },
  };

  if (dryRun) {
    console.log("[dry-run] Would upsert site settings");
    return;
  }

  await publishDocument(siteSettingsDocument);
  console.log("Upserted site settings");
}

async function upsertHomeScreenSettings(categoryIds: Map<string, string>) {
  const homeScreenSettingsDocument = {
    _id: "homeScreenSettings",
    _type: "homeScreenSettings",
    homeHeaderTop: "HAHM",
    homeHeaderBottom: "STATION",
    homeSceneTitle: "HAHM Station",
    homeSceneDescription:
      "A small shelf of categories, posts, and objects that can all be managed from Sanity.",
    homeFooter: "Music, literature, process, and life.",
    wallArtLabel: "HAHM STATION",
    wallArtQuote: "\"Keep something worth looking at nearby.\"",
    metronomeCategory: {
      _type: "reference",
      _ref: categoryIds.get("my-music"),
    },
    vinylCategory: {
      _type: "reference",
      _ref: categoryIds.get("my-music"),
    },
    plantCategory: {
      _type: "reference",
      _ref: categoryIds.get("life-updates"),
    },
  };

  if (dryRun) {
    console.log("[dry-run] Would upsert home screen settings");
    return;
  }

  await publishDocument(homeScreenSettingsDocument);
  console.log("Upserted home screen settings");
}

async function upsertPosts(
  categoryIds: Map<string, string>,
  assets: Record<keyof typeof SAMPLE_ASSET_FILES, string>,
  authorId: string
) {
  const postSeeds = [
    {
      slug: "blonde-frank-ocean-review",
      title: "Mapping the Quiet Architecture of Blonde",
      categorySlug: "music-review",
      publishedAt: "2026-03-02T10:00:00.000Z",
      excerpt:
        "A sample review that shows off cover images, rich body content, galleries, and callouts.",
      coverAssetRef: assets.sonicMap,
      coverAlt: "Abstract blue and amber composition with a record-like circle.",
      body: [
        textBlock(
          "intro-1",
          "This sample review exists to prove that the CMS is really driving the card, page, and post template content."
        ),
        linkedParagraph(
          "intro-2",
          "The body renderer supports inline links too, so you can point readers toward ",
          "another section",
          "/my-music",
          " without leaving the post format."
        ),
        textBlock("heading-1", "Three details worth noticing", "h2"),
        bulletItem("bullet-1", "The cover image is editable in the Studio."),
        bulletItem("bullet-2", "Portable text blocks render as expected on the live site."),
        bulletItem("bullet-3", "Category color choices shape the homepage shelf."),
        imageBlock(
          "image-1",
          assets.sonicMap,
          "Abstract blue composition with wave-like lines",
          "A body image uploaded through the seed script."
        ),
        calloutBlock(
          "callout-1",
          "note",
          "Why this post matters",
          "It exercises text, image, link, list, and callout rendering in one place."
        ),
      ],
    },
    {
      slug: "notes-from-the-quiet-week",
      title: "Notes from a Quiet Week in the Room",
      categorySlug: "life-updates",
      publishedAt: "2026-03-10T08:30:00.000Z",
      excerpt:
        "A sample life update with a gallery and softer editorial copy.",
      coverAssetRef: assets.greenRoom,
      coverAlt: "Green abstract interior scene with sweeping lines.",
      body: [
        textBlock(
          "life-intro",
          "The goal here is to make it obvious that longform reflections, image galleries, and shorter updates can all live in the same system."
        ),
        textBlock("life-heading", "Small things that changed the week", "h2"),
        numberItem("life-step-1", "A few stronger routines."),
        numberItem("life-step-2", "Less friction around drafting."),
        numberItem("life-step-3", "More confidence that the Studio setup is usable."),
        galleryBlock(
          "life-gallery",
          [
            {
              assetRef: assets.greenRoom,
              alt: "Green room abstract sample",
              caption: "Gallery image one",
            },
            {
              assetRef: assets.stillLife,
              alt: "Still life composition with books and a shelf",
              caption: "Gallery image two",
            },
          ],
          "A seeded gallery block with editable captions."
        ),
        calloutBlock(
          "life-callout",
          "success",
          "Rich content is enabled",
          "Images, galleries, embeds, and structured callouts are all available from the same post editor."
        ),
      ],
    },
    {
      slug: "demo-tape-room-tone",
      title: "Room Tone, Demo Tapes, and What Stayed in the Mix",
      categorySlug: "my-music",
      publishedAt: "2026-03-14T14:15:00.000Z",
      excerpt:
        "A sample post that demonstrates embeds and code blocks inside the music section.",
      coverAssetRef: assets.stillLife,
      coverAlt: "Still life illustration with books, record, and metronome.",
      body: [
        textBlock(
          "music-intro",
          "This sample post is less about the writing itself and more about showing that richer technical notes still fit into the site."
        ),
        videoEmbed("music-video", "https://www.youtube.com/watch?v=ysz5S6PUM-U"),
        textBlock("music-heading", "Tiny production note", "h2"),
        codeBlock(
          "music-code",
          "session-notes.ts",
          "ts",
          "const arrangement = {\n  introBars: 8,\n  chorusLift: true,\n  roomTone: 'kept in the final bounce',\n};"
        ),
        calloutBlock(
          "music-callout",
          "info",
          "Embed support",
          "This block proves the blog template can hold video embeds and code without any custom page work."
        ),
      ],
    },
    {
      slug: "margins-after-midnight",
      title: "Margins After Midnight",
      categorySlug: "literature-review",
      publishedAt: "2026-03-18T19:00:00.000Z",
      excerpt:
        "A sample reading note with headings, quotes, and imagery.",
      coverAssetRef: assets.marginNotes,
      coverAlt: "Parchment-style notebook page with a circular diagram.",
      body: [
        textBlock(
          "lit-intro",
          "This sample reading note shows that the category pages and the shared post template work just as well for books and essays."
        ),
        textBlock("lit-heading", "A line worth carrying around", "h2"),
        {
          ...textBlock(
            "lit-quote",
            "A good margin note is less a summary than a trace of attention."
          ),
          style: "blockquote",
        },
        imageBlock(
          "lit-image",
          assets.marginNotes,
          "Notebook-like sample illustration with horizontal lines",
          "A seeded cover-style image reused inside the post body."
        ),
        bulletItem("lit-bullet-1", "Close reading can stay short."),
        bulletItem("lit-bullet-2", "Visual inserts do not break the prose rhythm."),
        bulletItem("lit-bullet-3", "The same template works across categories."),
      ],
    },
    {
      slug: "listening-to-empty-space",
      title: "Listening to Empty Space Between Layers",
      categorySlug: "music-review",
      publishedAt: "2026-03-22T11:45:00.000Z",
      excerpt:
        "A second sample review so the music section has more than one card.",
      coverAssetRef: assets.greenRoom,
      coverAlt: "Green abstract composition used as sample cover art.",
      body: [
        textBlock(
          "space-intro",
          "A second music review makes the category page feel more realistic and shows sorting by publish date."
        ),
        textBlock("space-heading", "What stays after the first listen", "h2"),
        numberItem("space-item-1", "Room left in the arrangement."),
        numberItem("space-item-2", "A bass line that knows when not to move."),
        numberItem("space-item-3", "Mix choices that leave breathing room."),
      ],
    },
  ] as const;

  for (const postSeed of postSeeds) {
    const publishedId = `seed-post-${postSeed.categorySlug}-${postSeed.slug}`;
    const categoryRef = categoryIds.get(postSeed.categorySlug);

    if (!categoryRef) {
      throw new Error(`Missing category reference for ${postSeed.categorySlug}`);
    }

    const nextPost = {
      _id: publishedId,
      _type: "post",
      title: postSeed.title,
      slug: slug(postSeed.slug),
      category: {
        _type: "reference",
        _ref: categoryRef,
      },
      author: {
        _type: "reference",
        _ref: authorId,
      },
      publishedAt: postSeed.publishedAt,
      excerpt: postSeed.excerpt,
      coverImage: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: postSeed.coverAssetRef,
        },
        alt: postSeed.coverAlt,
      },
      body: postSeed.body,
    };

    if (dryRun) {
      console.log(`[dry-run] Would upsert post ${postSeed.slug}`);
      continue;
    }

    await publishDocument(nextPost);
    console.log(`Upserted post ${postSeed.slug}`);
  }
}

async function upsertWallArt(assets: Record<keyof typeof SAMPLE_ASSET_FILES, string>) {
  const wallArtSeeds = [
    {
      id: "seed-wall-art-sonic-map",
      title: "Sonic Map",
      assetRef: assets.sonicMap,
      alt: "Abstract blue and amber sonic map illustration",
      style: "poster",
      size: "medium",
      caption: null,
      link: null,
    },
    {
      id: "seed-wall-art-margin-notes",
      title: "Margin Notes",
      assetRef: assets.marginNotes,
      alt: "Notebook-inspired artwork with paper tones",
      style: "polaroid",
      size: "medium",
      caption: "Margin notes",
      link: null,
    },
    {
      id: "seed-wall-art-green-room",
      title: "Green Room",
      assetRef: assets.greenRoom,
      alt: "Green abstract room scene",
      style: "framed",
      size: "large",
      caption: null,
      link: null,
    },
    {
      id: "seed-wall-art-still-life",
      title: "Still Life",
      assetRef: assets.stillLife,
      alt: "Still life scene with books and shelf props",
      style: "frameless",
      size: "small",
      caption: null,
      link: null,
    },
  ] as const;

  for (const piece of wallArtSeeds) {
    const nextPiece = {
      _id: piece.id,
      _type: "wallArt",
      title: piece.title,
      image: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: piece.assetRef,
        },
        alt: piece.alt,
      },
      style: piece.style,
      size: piece.size,
      caption: piece.caption,
      link: piece.link,
    };

    if (dryRun) {
      console.log(`[dry-run] Would upsert wall art ${piece.title}`);
      continue;
    }

    await publishDocument(nextPiece);
    console.log(`Upserted wall art ${piece.title}`);
  }
}

async function main() {
  const assets = {
    sonicMap: await getOrUploadImageAsset(SAMPLE_ASSET_FILES.sonicMap),
    marginNotes: await getOrUploadImageAsset(SAMPLE_ASSET_FILES.marginNotes),
    greenRoom: await getOrUploadImageAsset(SAMPLE_ASSET_FILES.greenRoom),
    stillLife: await getOrUploadImageAsset(SAMPLE_ASSET_FILES.stillLife),
  };

  const categoryIds = await resolveCategoryIds();
  const authorId = await upsertAuthor();
  await upsertSiteSettings();
  await upsertHomeScreenSettings(categoryIds);
  await upsertPosts(categoryIds, assets, authorId);
  await upsertWallArt(assets);

  console.log(
    dryRun
      ? "Dry run complete. No content was written."
      : "Sample Sanity content is now seeded into the configured dataset."
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
