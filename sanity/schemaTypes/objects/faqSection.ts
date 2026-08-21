import { defineArrayMember, defineField, defineType } from "sanity";

export const faqSection = defineType({
  name: "faqSection",
  title: "Bloco de FAQ",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Titulo",
      type: "string",
      initialValue: "Perguntas frequentes",
    }),
    defineField({
      name: "items",
      title: "Perguntas",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "faqItem" }],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
  },
});
