import { defineField, defineType } from "sanity";

export const heroSection = defineType({
  name: "heroSection",
  title: "Hero",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Chapeu",
      type: "string",
    }),
    defineField({
      name: "title",
      title: "Titulo",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitulo",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "image",
      title: "Imagem",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "primaryCta",
      title: "Chamada principal",
      type: "cta",
    }),
    defineField({
      name: "secondaryCta",
      title: "Chamada secundaria",
      type: "cta",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "subtitle",
      media: "image",
    },
  },
});
