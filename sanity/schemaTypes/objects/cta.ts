import { defineField, defineType } from "sanity";

export const cta = defineType({
  name: "cta",
  title: "Chamada",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Texto",
      type: "string",
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      description: "Use caminho interno, como /montador, ou URL completa.",
    }),
  ],
});
