import Link from "next/link";
import { getResolvedSiteSettings } from "@/lib/content";

export default async function NotFound() {
  const settings = await getResolvedSiteSettings();

  return (
    <main
      id="content"
      className="theme-page flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <h1 className="theme-text-foreground font-[family-name:var(--font-display)] text-4xl font-black tracking-tight">
        {settings.notFoundTitle}
      </h1>
      <p className="theme-text-muted mt-4 max-w-md">
        {settings.notFoundDescription}
      </p>
      <Link
        href="/"
        className="theme-link theme-focus-ring mt-8 text-sm transition-colors"
      >
        {settings.notFoundLinkLabel}
      </Link>
    </main>
  );
}
