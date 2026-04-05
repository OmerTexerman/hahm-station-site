import type { StructureResolver } from "sanity/structure";

const SITE_SETTINGS_DOCUMENT_ID = "siteSettings";
const HOME_SCREEN_SETTINGS_DOCUMENT_ID = "homeScreenSettings";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site Settings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId(SITE_SETTINGS_DOCUMENT_ID)
        ),
      S.listItem()
        .title("Home Screen Settings")
        .child(
          S.document()
            .schemaType("homeScreenSettings")
            .documentId(HOME_SCREEN_SETTINGS_DOCUMENT_ID)
        ),
      S.divider(),
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("post").title("Posts"),
      S.documentTypeListItem("author").title("Authors"),
      S.documentTypeListItem("wallArt").title("Wall Art"),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId();
        return (
          id &&
          ![
            "siteSettings",
            "homeScreenSettings",
            "category",
            "post",
            "author",
            "wallArt",
          ].includes(id)
        );
      }),
    ]);
