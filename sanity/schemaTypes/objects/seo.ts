import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "metaTitle",
      title: "Titulo SEO",
      type: "string",
      validation: (Rule) => Rule.max(70),
    }),
    defineField({
      name: "metaDescription",
      title: "Descricao SEO",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "ogImage",
      title: "Imagem de compartilhamento",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "noIndex",
      title: "Nao indexar",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
