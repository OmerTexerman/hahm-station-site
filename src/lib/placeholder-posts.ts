import { getSectionConfig, type CategorySlug } from "@/lib/site";
import type { PostAuthor, PostDetail, PostSummary } from "@/sanity/types";

const placeholderAuthor: PostAuthor = { name: "HAHM" };

const posts: PostSummary[] = [
  {
    _id: "placeholder-1",
    title: "Why Blonde by Frank Ocean Still Hits Different",
    slug: "blonde-frank-ocean-review",
    publishedAt: "2026-03-28T00:00:00Z",
    excerpt:
      "A deep dive into the layered production and raw vulnerability that makes this album timeless.",
    categorySlug: "music-review",
    author: placeholderAuthor,
  },
  {
    _id: "placeholder-2",
    title: "Charli XCX — Brat: A Summer Anthem Dissected",
    slug: "charli-xcx-brat-review",
    publishedAt: "2026-03-20T00:00:00Z",
    excerpt:
      "Is it pop? Is it punk? Charli blurs the lines again and it works.",
    categorySlug: "music-review",
    author: placeholderAuthor,
  },
  {
    _id: "placeholder-3",
    title: "The Art of Looping: Building Tracks from Scratch",
    slug: "art-of-looping",
    publishedAt: "2026-03-15T00:00:00Z",
    excerpt:
      "Breaking down the creative process behind loop-based music production.",
    categorySlug: "music-review",
    author: placeholderAuthor,
  },
  {
    _id: "placeholder-4",
    title: "Kafka on the Shore — A Labyrinth of Meaning",
    slug: "kafka-on-the-shore",
    publishedAt: "2026-03-25T00:00:00Z",
    excerpt:
      "Murakami weaves dreams and reality into something you can't put down.",
    categorySlug: "literature-review",
    author: placeholderAuthor,
  },
  {
    _id: "placeholder-5",
    title: "The Brothers Karamazov: Still Relevant in 2026",
    slug: "brothers-karamazov",
    publishedAt: "2026-03-10T00:00:00Z",
    excerpt:
      "Dostoevsky's masterpiece on faith, doubt, and family — a re-read that rewards.",
    categorySlug: "literature-review",
    author: placeholderAuthor,
  },
  {
    _id: "placeholder-6",
    title: "Parable of the Sower by Octavia Butler",
    slug: "parable-of-the-sower",
    publishedAt: "2026-02-28T00:00:00Z",
    excerpt:
      "Dystopia that feels uncomfortably prophetic. Butler saw everything coming.",
    categorySlug: "literature-review",
    author: placeholderAuthor,
  },
  {
    _id: "placeholder-7",
    title: "Starting a New Chapter",
    slug: "starting-new-chapter",
    publishedAt: "2026-04-01T00:00:00Z",
    excerpt:
      "Some thoughts on change, growth, and what's coming next.",
    categorySlug: "life-updates",
    author: placeholderAuthor,
  },
  {
    _id: "placeholder-8",
    title: "Reflections on the Last Few Months",
    slug: "reflections-last-months",
    publishedAt: "2026-03-18T00:00:00Z",
    excerpt:
      "Looking back at what I learned and where things are headed.",
    categorySlug: "life-updates",
    author: placeholderAuthor,
  },
  {
    _id: "placeholder-9",
    title: "First Beat Tape — Out Now",
    slug: "first-beat-tape",
    publishedAt: "2026-03-22T00:00:00Z",
    excerpt:
      "After months of late nights, the first collection of beats is finally out.",
    categorySlug: "my-music",
    author: placeholderAuthor,
  },
  {
    _id: "placeholder-10",
    title: "Behind the Track: Midnight Drift",
    slug: "behind-midnight-drift",
    publishedAt: "2026-03-05T00:00:00Z",
    excerpt:
      "Breaking down the sampling, mixing, and vibe behind my latest track.",
    categorySlug: "my-music",
    author: placeholderAuthor,
  },
];

export function getPlaceholderPostsByCategory(
  categorySlug: CategorySlug
): PostSummary[] {
  return posts.filter((p) => p.categorySlug === categorySlug);
}

export function getPlaceholderPost(slug: string): PostDetail | null {
  const post = posts.find((p) => p.slug === slug);
  if (!post) {
    return null;
  }

  const section = getSectionConfig(post.categorySlug);

  return {
    ...post,
    author: placeholderAuthor,
    category: {
      title: section.title,
      slug: post.categorySlug,
    },
    body: [
      {
        _type: "block",
        _key: "intro",
        style: "normal",
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "This is development-only placeholder content. Connect Sanity CMS to replace it with your published writing.",
          },
        ],
        markDefs: [],
      },
    ],
  } satisfies PostDetail;
}
