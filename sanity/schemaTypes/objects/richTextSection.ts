import { defineField, defineType } from "sanity";

export const richTextSection = defineType({
  name: "richTextSection",
  title: "Texto",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Titulo",
      type: "string",
    }),
    defineField({
      name: "body",
      title: "Conteudo",
      type: "blockContent",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare: ({ title }) => ({
      title: title || "Texto",
    }),
  },
});
