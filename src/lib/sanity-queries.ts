const PAGE_FIELDS = `{
  _id,
  _updatedAt,
  title,
  "slug": slug.current,
  pageType,
  seo,
  sections[]{
    ...,
    _type == "faqSection" => {
      ...,
      items[]->{
        _id,
        question,
        answer,
        category,
        order
      }
    }
  }
}`;

export const PAGE_BY_SLUG_QUERY = `*[_type == "page" && slug.current == $slug][0]${PAGE_FIELDS}`;

export const TERMS_OF_USE_PAGE_QUERY = `coalesce(
  *[_type == "page" && _id == "page.termos-de-uso"][0]${PAGE_FIELDS},
  *[_type == "page" && slug.current == "termos-de-uso"][0]${PAGE_FIELDS}
)`;

export const FAQ_ITEMS_QUERY = `*[_type == "faqItem"] | order(order asc, question asc) {
  _id,
  question,
  answer,
  category,
  order
}`;

export const ACTIVE_BANNERS_QUERY = `*[_type == "banner" && active == true && placement == $placement] | order(_updatedAt desc) {
  _id,
  title,
  message,
  placement,
  cta,
  image
}`;
