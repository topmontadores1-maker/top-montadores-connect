import { defineField, defineType } from "sanity";

export const banner = defineType({
  name: "banner",
  title: "Banner",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Titulo",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "message",
      title: "Mensagem",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "placement",
      title: "Posicao",
      type: "string",
      initialValue: "home",
      options: {
        list: [
          { title: "Home", value: "home" },
          { title: "Paginas de servico", value: "servicePages" },
          { title: "Topo global", value: "globalTop" },
        ],
      },
    }),
    defineField({
      name: "cta",
      title: "Chamada",
      type: "cta",
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
      name: "active",
      title: "Ativo",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "placement",
      media: "image",
    },
  },
});
