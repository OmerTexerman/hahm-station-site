import { getCliClient } from "sanity/cli";
import { THEME_FIELD_DEFINITIONS } from "../src/lib/site-theme";
import {
  parseCssColor,
  type SanityColorSource,
  type SanityColorValue,
} from "../src/sanity/color";

type CategoryColorDocument = {
  _id: string;
  title?: string;
  color?: SanityColorSource;
  accentColor?: SanityColorSource;
};

type SiteSettingsColorDocument = {
  _id: string;
  theme?: Record<string, SanityColorSource> | null;
};

const client = getCliClient({
  apiVersion: "2024-01-01",
});

const dryRun = process.argv.includes("--dry-run");

function normalizeColorValue(value: SanityColorSource): SanityColorValue | null {
  if (typeof value !== "string") {
    return null;
  }

  return parseCssColor(value);
}

async function migrateCategoryColors() {
  const categories = await client.fetch<CategoryColorDocument[]>(
    `*[_type == "category"]{_id, title, color, accentColor}`
  );

  let changes = 0;

  for (const category of categories) {
    const nextColor = normalizeColorValue(category.color);
    const nextAccentColor = normalizeColorValue(category.accentColor);

    if (!nextColor && !nextAccentColor) {
      continue;
    }

    changes += 1;

    if (dryRun) {
      console.log(
        `[dry-run] Would migrate category colors for ${category.title ?? category._id}`
      );
      continue;
    }

    const patch = client.patch(category._id);

    if (nextColor) {
      patch.set({ color: nextColor });
    }

    if (nextAccentColor) {
      patch.set({ accentColor: nextAccentColor });
    }

    await patch.commit();
    console.log(`Migrated category colors for ${category.title ?? category._id}`);
  }

  return changes;
}

async function migrateSiteThemeColors() {
  const siteSettings = await client.fetch<SiteSettingsColorDocument | null>(
    `*[_type == "siteSettings"][0]{_id, theme}`
  );

  if (!siteSettings?._id || !siteSettings.theme) {
    return 0;
  }

  const nextTheme = { ...siteSettings.theme };
  let changed = false;

  for (const definition of THEME_FIELD_DEFINITIONS) {
    const nextColorValue = normalizeColorValue(siteSettings.theme[definition.name]);

    if (!nextColorValue) {
      continue;
    }

    nextTheme[definition.name] = nextColorValue;
    changed = true;
  }

  if (!changed) {
    return 0;
  }

  if (dryRun) {
    console.log("[dry-run] Would migrate theme colors on the site settings document");
    return 1;
  }

  await client.patch(siteSettings._id).set({ theme: nextTheme }).commit();
  console.log("Migrated theme colors on the site settings document");
  return 1;
}

async function main() {
  const [categoryChanges, siteSettingsChanges] = await Promise.all([
    migrateCategoryColors(),
    migrateSiteThemeColors(),
  ]);

  const total = categoryChanges + siteSettingsChanges;

  if (total === 0) {
    console.log("No legacy string color fields needed migration.");
    return;
  }

  console.log(
    `${dryRun ? "Found" : "Applied"} ${total} color migration${
      total === 1 ? "" : "s"
    }.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
