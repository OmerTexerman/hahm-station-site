import Image from "next/image";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { urlFor } from "@/sanity/image";
import type {
  PortableTextAudioBlock,
  PortableTextBlock,
  PortableTextCalloutBlock,
  PortableTextCodeBlock,
  PortableTextImageGalleryBlock,
  PortableTextImageBlock,
  PortableTextMarkDef,
  PostBodyNode,
} from "@/sanity/types";

function getSafeHref(href?: string) {
  if (!href) {
    return null;
  }

  if (href.startsWith("/") || href.startsWith("#")) {
    return { href, kind: "internal" as const };
  }

  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    return { href, kind: "anchor" as const };
  }

  try {
    const parsed = new URL(href);

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return { href: parsed.toString(), kind: "external" as const };
    }
  } catch {
    return null;
  }

  return null;
}

function renderMarks(
  text: string,
  marks: string[] | undefined,
  markDefs: PortableTextMarkDef[] | undefined
) {
  return (marks ?? []).reduce<ReactNode>((content, mark) => {
    if (mark === "strong") {
      return <strong key={mark}>{content}</strong>;
    }

    if (mark === "em") {
      return <em key={mark}>{content}</em>;
    }

    if (mark === "underline") {
      return <u key={mark}>{content}</u>;
    }

    if (mark === "strike-through") {
      return <s key={mark}>{content}</s>;
    }

    if (mark === "code") {
      return (
        <code
          key={mark}
          className="rounded px-1.5 py-0.5 text-[0.9em]"
          style={{
            backgroundColor: "var(--theme-surface-elevated)",
            color: "var(--theme-foreground)",
          }}
        >
          {content}
        </code>
      );
    }

    const markDef = markDefs?.find((definition) => definition._key === mark);

    if (markDef?._type === "link" && markDef.href) {
      const safeLink = getSafeHref(markDef.href);

      if (!safeLink) {
        return <Fragment key={mark}>{content}</Fragment>;
      }

      const linkClass =
        "theme-link theme-focus-ring underline underline-offset-4 transition-colors";

      return safeLink.kind === "external" ? (
        <a
          key={mark}
          href={safeLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {content}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : safeLink.kind === "internal" ? (
        <Link
          key={mark}
          href={safeLink.href}
          className={linkClass}
        >
          {content}
        </Link>
      ) : (
        <a
          key={mark}
          href={safeLink.href}
          className={linkClass}
        >
          {content}
        </a>
      );
    }

    return <Fragment key={mark}>{content}</Fragment>;
  }, text);
}

function renderBlockChildren(node: PortableTextBlock) {
  return node.children.map((child) => (
    <Fragment key={child._key}>
      {renderMarks(child.text, child.marks, node.markDefs)}
    </Fragment>
  ));
}

function renderBlock(node: PortableTextBlock) {
  const content = renderBlockChildren(node);

  switch (node.style) {
    case "h2":
      return (
        <h2 key={node._key} className="theme-text-foreground mt-12 text-2xl font-bold">
          {content}
        </h2>
      );
    case "h3":
      return (
        <h3 key={node._key} className="theme-text-foreground mt-10 text-xl font-semibold">
          {content}
        </h3>
      );
    case "h4":
      return (
        <h4 key={node._key} className="theme-text-foreground mt-8 text-lg font-semibold">
          {content}
        </h4>
      );
    case "blockquote":
      return (
        <blockquote
          key={node._key}
          className="theme-text-muted border-l-2 pl-4 italic"
          style={{ borderColor: "color-mix(in srgb, var(--theme-accent) 60%, transparent)" }}
        >
          {content}
        </blockquote>
      );
    default:
      return (
        <p key={node._key} className="theme-text-muted">
          {content}
        </p>
      );
  }
}

function renderListItemContent(node: PortableTextBlock) {
  const content = renderBlockChildren(node);

  if (node.style === "blockquote") {
    return (
      <blockquote
        className="theme-text-muted border-l-2 pl-4 italic"
        style={{ borderColor: "color-mix(in srgb, var(--theme-accent) 60%, transparent)" }}
      >
        {content}
      </blockquote>
    );
  }

  return <p className="theme-text-muted">{content}</p>;
}

function renderList(
  body: PostBodyNode[],
  startIndex: number,
  listType: "bullet" | "number",
  level: number
) {
  const ListTag = listType === "number" ? "ol" : "ul";
  const items: Array<{ key: string; content: ReactNode; nested: ReactNode[] }> = [];
  let index = startIndex;

  while (index < body.length) {
    const node = body[index];

    if (node._type !== "block" || !node.listItem) {
      break;
    }

    const nodeLevel = node.level ?? 1;

    if (nodeLevel < level) {
      break;
    }

    if (nodeLevel > level) {
      const previousItem = items.at(-1);

      if (!previousItem) {
        break;
      }

      const nestedList = renderList(body, index, node.listItem, nodeLevel);
      previousItem.nested.push(nestedList.element);
      index = nestedList.nextIndex;
      continue;
    }

    if (node.listItem !== listType) {
      break;
    }

    items.push({
      key: node._key,
      content: renderListItemContent(node),
      nested: [],
    });
    index += 1;
  }

  return {
    element: (
      <ListTag
        key={`${body[startIndex]?._key ?? "list"}-list`}
        className={`theme-text-muted my-6 space-y-2 pl-6 ${
          listType === "number" ? "list-decimal" : "list-disc"
        }`}
      >
        {items.map((item) => (
          <li key={item.key}>
            {item.content}
            {item.nested.length > 0 ? item.nested : null}
          </li>
        ))}
      </ListTag>
    ),
    nextIndex: index,
  };
}

function renderBody(body: PostBodyNode[]) {
  const rendered: ReactNode[] = [];

  for (let index = 0; index < body.length; index += 1) {
    const node = body[index];

    if (node._type === "block") {
      if (node.listItem) {
        const list = renderList(body, index, node.listItem, node.level ?? 1);
        rendered.push(list.element);
        index = list.nextIndex - 1;
        continue;
      }

      rendered.push(renderBlock(node));
      continue;
    }

    if (node._type === "image") {
      rendered.push(renderImage(node));
      continue;
    }

    if (node._type === "audioFile") {
      rendered.push(renderAudio(node));
      continue;
    }

    if (node._type === "codeBlock") {
      rendered.push(renderCodeBlock(node));
      continue;
    }

    if (node._type === "callout") {
      rendered.push(renderCallout(node));
      continue;
    }

    if (node._type === "imageGallery") {
      rendered.push(renderImageGallery(node));
      continue;
    }

    if (node._type === "videoEmbed" && node.url) {
      const safeLink = getSafeHref(node.url);

      if (!safeLink) {
        continue;
      }

      const embedUrl = getEmbedUrl(safeLink.href);

      if (!embedUrl) {
        rendered.push(
          <p key={node._key}>
            <a
              href={safeLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-link theme-focus-ring underline underline-offset-4"
            >
              Watch video
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        );
        continue;
      }

      rendered.push(
        <div
          key={node._key}
          className="my-10 overflow-hidden rounded-lg border"
          style={{ borderColor: "var(--theme-border)" }}
        >
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              title="Embedded video"
              className="h-full w-full"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-presentation"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      );
    }
  }

  return rendered;
}

function renderImage(node: PortableTextImageBlock) {
  if (!node.asset?._ref) {
    return null;
  }

  return (
    <figure key={node._key} className="my-10 space-y-3">
      <Image
        src={urlFor(node).width(1400).height(900).fit("max").url()}
        alt={node.alt || "Post image"}
        width={1400}
        height={900}
        sizes="(max-width: 768px) 100vw, 768px"
        className="w-full rounded-lg border object-cover"
        style={{ borderColor: "var(--theme-border)" }}
      />
      {node.caption ? (
        <figcaption className="theme-text-muted text-sm">{node.caption}</figcaption>
      ) : null}
    </figure>
  );
}

function renderAudio(node: PortableTextAudioBlock) {
  if (!node.asset?.url) {
    return null;
  }

  return (
    <figure
      key={node._key}
      className="my-8 rounded-lg border p-4"
      style={{
        borderColor: "var(--theme-border)",
        backgroundColor: "color-mix(in srgb, var(--theme-surface) 82%, black)",
      }}
    >
      <audio controls preload="metadata" className="w-full" src={node.asset.url}>
        Your browser does not support embedded audio.
      </audio>
      {node.description ? (
        <figcaption className="theme-text-muted mt-3 text-sm">
          {node.description}
        </figcaption>
      ) : null}
    </figure>
  );
}

function renderCodeBlock(node: PortableTextCodeBlock) {
  if (!node.code?.trim()) {
    return null;
  }

  return (
    <figure
      key={node._key}
      className="my-8 overflow-hidden rounded-xl border"
      style={{
        borderColor: "var(--theme-border)",
        backgroundColor: "color-mix(in srgb, var(--theme-surface) 78%, black)",
      }}
    >
      {node.filename || node.language ? (
        <figcaption
          className="theme-text-muted flex items-center justify-between gap-3 border-b px-4 py-2 text-xs uppercase tracking-[0.18em]"
          style={{ borderColor: "var(--theme-border)" }}
        >
          <span>{node.filename || "Code block"}</span>
          <span>{node.language || "text"}</span>
        </figcaption>
      ) : null}
      <pre className="theme-text-foreground overflow-x-auto p-4 text-sm leading-7">
        <code>{node.code}</code>
      </pre>
    </figure>
  );
}

const CALLOUT_TONE_STYLES = {
  note: {
    border: "color-mix(in srgb, var(--theme-accent) 50%, transparent)",
    background: "color-mix(in srgb, var(--theme-accent-soft) 80%, transparent)",
    color: "var(--theme-foreground)",
  },
  info: {
    border: "color-mix(in srgb, var(--theme-decorative-accent-soft) 50%, transparent)",
    background: "color-mix(in srgb, var(--theme-decorative-accent-soft) 18%, transparent)",
    color: "var(--theme-foreground)",
  },
  success: {
    border: "color-mix(in srgb, var(--theme-decorative-tertiary) 50%, transparent)",
    background: "color-mix(in srgb, var(--theme-decorative-tertiary) 16%, transparent)",
    color: "var(--theme-foreground)",
  },
  warning: {
    border: "color-mix(in srgb, var(--theme-decorative-primary) 55%, transparent)",
    background: "color-mix(in srgb, var(--theme-decorative-primary) 16%, transparent)",
    color: "var(--theme-foreground)",
  },
} as const;

function renderCallout(node: PortableTextCalloutBlock) {
  const tone = node.tone ?? "note";
  const toneStyle = CALLOUT_TONE_STYLES[tone] ?? CALLOUT_TONE_STYLES.note;

  return (
    <aside
      key={node._key}
      className="my-8 rounded-xl border px-5 py-4"
      style={{
        borderColor: toneStyle.border,
        backgroundColor: toneStyle.background,
        color: toneStyle.color,
      }}
    >
      {node.title ? (
        <h3 className="theme-text-foreground text-sm font-semibold uppercase tracking-[0.18em]">
          {node.title}
        </h3>
      ) : null}
      <div className={node.title ? "mt-3 space-y-4" : "space-y-4"}>
        {renderBody((node.body ?? []) as PostBodyNode[])}
      </div>
    </aside>
  );
}

function renderImageGallery(node: PortableTextImageGalleryBlock) {
  const images = (node.images ?? []).filter((image) => image.asset?._ref);

  if (images.length === 0) {
    return null;
  }

  return (
    <figure key={node._key} className="my-10 space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((image) => (
          <figure
            key={image._key}
            className="overflow-hidden rounded-lg border"
            style={{
              borderColor: "var(--theme-border)",
              backgroundColor: "color-mix(in srgb, var(--theme-surface) 70%, black)",
            }}
          >
            <Image
              src={urlFor(image).width(1200).height(1200).fit("max").url()}
              alt={image.alt || "Gallery image"}
              width={1200}
              height={1200}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="aspect-square w-full object-cover"
            />
            {image.caption ? (
              <figcaption className="theme-text-muted px-3 py-2 text-sm">
                {image.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
      {node.caption ? (
        <figcaption className="theme-text-muted text-sm">{node.caption}</figcaption>
      ) : null}
    </figure>
  );
}

function getEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const videoId = parsed.pathname.slice(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const videoId = parsed.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }
    }

    if (host === "vimeo.com") {
      const videoId = parsed.pathname.split("/").filter(Boolean).at(-1);
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    if (host === "player.vimeo.com") {
      return url;
    }

    return null;
  } catch {
    return null;
  }
}

export default function PostBody({ body = [] }: { body?: PostBodyNode[] }) {
  return (
    <div className="max-w-none">
      {renderBody(body)}
    </div>
  );
}
