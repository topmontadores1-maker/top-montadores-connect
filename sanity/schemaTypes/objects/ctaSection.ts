import { defineField, defineType } from "sanity";

export const ctaSection = defineType({
  name: "ctaSection",
  title: "Bloco de chamada",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Titulo",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Texto",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "cta",
      title: "Chamada",
      type: "cta",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "body",
    },
  },
});
