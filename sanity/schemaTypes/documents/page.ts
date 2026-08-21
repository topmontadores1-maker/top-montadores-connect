import { defineArrayMember, defineField, defineType } from "sanity";

export const page = defineType({
  name: "page",
  title: "Pagina",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Titulo",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "pageType",
      title: "Tipo de pagina",
      type: "string",
      initialValue: "institutional",
      options: {
        layout: "radio",
        list: [
          { title: "Institucional", value: "institutional" },
          { title: "Landing page", value: "landing" },
          { title: "Legal", value: "legal" },
          { title: "SEO local", value: "localSeo" },
        ],
      },
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
    defineField({
      name: "sections",
      title: "Secoes",
      type: "array",
      of: [
        defineArrayMember({ type: "heroSection" }),
        defineArrayMember({ type: "richTextSection" }),
        defineArrayMember({ type: "faqSection" }),
        defineArrayMember({ type: "ctaSection" }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
    },
  },
});
