import {
  findSectionConfig,
  resolveSections,
  resolveSiteSettings,
  type SectionConfig,
  type SiteSettings,
} from "@/lib/site";
import {
  getCategories,
  getHomeScreenSettings,
  getSiteSettings,
} from "@/sanity/queries";

type ResolvedSiteContent = {
  sections: SectionConfig[];
  settings: SiteSettings;
};

export async function getResolvedSiteContent(): Promise<ResolvedSiteContent> {
  const [siteSettingsSource, homeScreenSettingsSource, categoriesSource] =
    await Promise.all([
      getSiteSettings(),
      getHomeScreenSettings(),
      getCategories(),
    ]);

  return {
    settings: resolveSiteSettings({
      ...siteSettingsSource,
      ...homeScreenSettingsSource,
    }),
    sections: resolveSections(categoriesSource),
  };
}

export async function getResolvedSiteSettings(): Promise<SiteSettings> {
  const { settings } = await getResolvedSiteContent();
  return settings;
}

export async function getResolvedSections(): Promise<SectionConfig[]> {
  const { sections } = await getResolvedSiteContent();
  return sections;
}

export async function getResolvedSection(
  slug: string
): Promise<SectionConfig | null> {
  const sections = await getResolvedSections();
  return findSectionConfig(sections, slug);
}
