import HomeScene from "@/components/HomeScene";
import { getResolvedSiteContent } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { urlFor } from "@/sanity/image";
import { getWallArt } from "@/sanity/queries";
import type { WallArtPiece } from "@/sanity/types";

export async function generateMetadata() {
  return buildMetadata({ path: "/" });
}

export const revalidate = 300;

export default async function Home() {
  const [rawPieces, { settings, sections }] = await Promise.all([
    getWallArt(),
    getResolvedSiteContent(),
  ]);

  const wallArtPieces = rawPieces.map((piece: WallArtPiece) => ({
    ...piece,
    imageUrl: piece.image?.asset?._ref
      ? urlFor(piece.image).width(400).height(500).url()
      : undefined,
  }));

  return (
    <main
      id="content"
      className="theme-page relative flex min-h-screen items-center justify-center overflow-hidden px-4 vignette grain"
    >
      <div className="sr-only">
        <h1>{settings.homeSceneTitle}</h1>
        <p>{settings.homeSceneDescription}</p>
      </div>
      <HomeScene
        settings={settings}
        sections={sections}
        pieces={wallArtPieces.length > 0 ? wallArtPieces : undefined}
      />

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 py-4 text-center">
        <p className="theme-text-soft text-xs font-medium tracking-[0.18em] uppercase sm:text-sm">
          {settings.homeFooter}
        </p>
      </div>
    </main>
  );
}
