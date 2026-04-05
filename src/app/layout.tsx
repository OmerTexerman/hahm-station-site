import { Playfair_Display, DM_Sans } from "next/font/google";
import HomeIntroBootstrap from "@/components/HomeIntroBootstrap";
import { getResolvedSiteSettings } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { buildThemeStyle } from "@/lib/theme";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata() {
  return buildMetadata();
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getResolvedSiteSettings();

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={buildThemeStyle(settings.theme)}>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        {children}
        <HomeIntroBootstrap />
      </body>
    </html>
  );
}
