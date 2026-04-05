"use client";

import { useEffect, useSyncExternalStore } from "react";
import { HOME_INTRO_FLAG_VALUE, HOME_INTRO_STORAGE_KEY } from "@/lib/homeIntro";
import { readSessionItem, writeSessionItem } from "@/lib/sessionStorage";
import type { WallArtPiece } from "@/sanity/types";
import type { SectionConfig, SiteSettings } from "@/lib/site";
import Header from "./Header";
import Bookshelf from "./Bookshelf";
import SceneSpotlight from "./SceneSpotlight";
import WallArt from "./WallArt";

function subscribeToSessionSnapshot() {
  return () => {};
}

function getPlayIntroSnapshot() {
  return readSessionItem(HOME_INTRO_STORAGE_KEY) !== HOME_INTRO_FLAG_VALUE;
}

export default function HomeScene({
  pieces,
  sections,
  settings,
}: {
  pieces?: WallArtPiece[];
  sections: SectionConfig[];
  settings: SiteSettings;
}) {
  const playIntro = useSyncExternalStore(
    subscribeToSessionSnapshot,
    getPlayIntroSnapshot,
    () => true
  );

  useEffect(() => {
    writeSessionItem(HOME_INTRO_STORAGE_KEY, HOME_INTRO_FLAG_VALUE);
  }, []);

  return (
    <div
      data-intro-state={playIntro ? "intro" : "settled"}
      className="home-scene w-full"
    >
      <WallArt
        pieces={pieces}
        playIntro={playIntro}
        label={settings.wallArtLabel}
        quote={settings.wallArtQuote}
      />

      <SceneSpotlight skipIntro={!playIntro}>
        <div className="w-full max-w-4xl">
          <Header
            siteTitle={settings.siteTitle}
            headerTop={settings.homeHeaderTop}
            headerBottom={settings.homeHeaderBottom}
          />
        </div>
        <div className="relative mt-8 w-full max-w-5xl">
          <Bookshelf sections={sections} settings={settings} />
        </div>
      </SceneSpotlight>
    </div>
  );
}
