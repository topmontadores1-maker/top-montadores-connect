import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Conteudo")
    .items([
      S.listItem()
        .id("termsOfUse")
        .title("Termos de Uso")
        .child(
          S.document()
            .schemaType("page")
            .documentId("page.termos-de-uso")
            .initialValueTemplate("termsOfUsePage")
            .title("Termos de Uso"),
        ),
      S.documentTypeListItem("page").title("Paginas"),
      S.documentTypeListItem("faqItem").title("FAQ"),
      S.documentTypeListItem("banner").title("Banners"),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !["page", "faqItem", "banner"].includes(item.getId() || ""),
      ),
    ]);
