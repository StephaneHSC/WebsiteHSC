import type { StructureBuilder } from "sanity/structure";

/**
 * Document types that should appear as singletons (one document per type)
 * rather than collections.
 */
const SINGLETONS = ["quoteFormConfig", "siteStats"];

/**
 * Custom Studio desk structure: pin singletons at the top, list collections below.
 */
export const structure = (S: StructureBuilder) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Quote Form Configuration")
        .id("quoteFormConfig")
        .child(S.document().schemaType("quoteFormConfig").documentId("quoteFormConfig")),
      S.listItem()
        .title("Site Stats / KPIs")
        .id("siteStats")
        .child(S.document().schemaType("siteStats").documentId("siteStats")),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => !SINGLETONS.includes(item.getId() ?? "")),
    ]);
