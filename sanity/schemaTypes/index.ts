import { banner } from "./documents/banner";
import { faqItem } from "./documents/faqItem";
import { page } from "./documents/page";
import { blockContent } from "./objects/blockContent";
import { cta } from "./objects/cta";
import { ctaSection } from "./objects/ctaSection";
import { faqSection } from "./objects/faqSection";
import { heroSection } from "./objects/heroSection";
import { richTextSection } from "./objects/richTextSection";
import { seo } from "./objects/seo";

export const schemaTypes = [
  page,
  faqItem,
  banner,
  seo,
  cta,
  blockContent,
  heroSection,
  richTextSection,
  faqSection,
  ctaSection,
];
