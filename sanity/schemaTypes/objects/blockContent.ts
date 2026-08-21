import { defineArrayMember, defineType } from "sanity";

export const blockContent = defineType({
  name: "blockContent",
  title: "Conteudo",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Titulo 2", value: "h2" },
        { title: "Titulo 3", value: "h3" },
        { title: "Citação", value: "blockquote" },
      ],
      lists: [
        { title: "Lista", value: "bullet" },
        { title: "Numerada", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Negrito", value: "strong" },
          { title: "Italico", value: "em" },
        ],
        annotations: [
          {
            name: "link",
            title: "Link",
            type: "object",
            fields: [
              {
                name: "href",
                title: "URL",
                type: "url",
              },
              {
                name: "blank",
                title: "Abrir em nova aba",
                type: "boolean",
                initialValue: false,
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          title: "Texto alternativo",
          type: "string",
        },
      ],
    }),
  ],
});
