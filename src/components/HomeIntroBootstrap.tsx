"use client";

import { useServerInsertedHTML } from "next/navigation";
import { getHomeIntroBootstrapScript } from "@/lib/homeIntro";

export default function HomeIntroBootstrap() {
  useServerInsertedHTML(() => (
    <script
      id="home-scene-session-state"
      dangerouslySetInnerHTML={{ __html: getHomeIntroBootstrapScript() }}
    />
  ));

  return null;
}
