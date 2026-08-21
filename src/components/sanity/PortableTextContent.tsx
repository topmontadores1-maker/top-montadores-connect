import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";

import { sanityImageUrl } from "@/lib/sanity";

type PortableTextContentProps = {
  value: PortableTextBlock[];
};

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="mt-10 text-2xl font-semibold tracking-tight text-foreground">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 text-xl font-semibold tracking-tight text-foreground">{children}</h3>
    ),
    normal: ({ children }) => <p className="mt-4 leading-7 text-muted-foreground">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-primary pl-4 text-muted-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-2 pl-6 text-muted-foreground">{children}</ol>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const blank = Boolean(value?.blank);

      return (
        <a
          className="font-medium text-primary underline-offset-4 hover:underline"
          href={href}
          rel={blank ? "noreferrer" : undefined}
          target={blank ? "_blank" : undefined}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) {
        return null;
      }

      const imageUrl = sanityImageUrl(value).width(1200).url();
      const alt = typeof value.alt === "string" ? value.alt : "";

      return (
        <img
          alt={alt}
          className="mt-6 w-full rounded-md object-cover"
          loading="lazy"
          src={imageUrl}
        />
      );
    },
  },
};

export function PortableTextContent({ value }: PortableTextContentProps) {
  return <PortableText components={components} value={value} />;
}
