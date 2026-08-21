/**
 * TypeScript types for Supabase tables
 * Generated from schema
 */

export type Service = {
  slug: string;
  name: string;
  icon: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicService = Pick<Service, "slug" | "name" | "icon" | "description">;

export type Professional = {
  id: string;
  name: string;
  whatsapp: string;
  photo_url: string | null;
  city: string;
  state: string;
  postal_code: string | null;
  street: string | null;
  address_number: string | null;
  address_complement: string | null;
  neighborhood: string | null;
  email: string | null;
  doc: string | null;
  notes: string | null;
  neighborhoods: string[];
  hours: string | null;
  status: "ativo" | "pausado" | "pendente";
  created_at: string;
  updated_at: string;
};

export type ProfessionalPortfolioItem = {
  id: string;
  professional_id: string;
  image_url: string;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type PublicPortfolioItem = Pick<
  ProfessionalPortfolioItem,
  "id" | "image_url" | "description" | "position"
>;

export type ProfessionalService = {
  id: string;
  professional_id: string;
  service_slug: string;
  created_at: string;
};

export type PublicLink = {
  id: string;
  service_slug: string;
  city: string;
  state: string;
  city_slug: string;
  professional_id: string;
  url: string;
  status: "ativo" | "inativo";
  clicks: number;
  photo_override: string | null;
  whatsapp_override: string | null;
  created_at: string;
  updated_at: string;
};

export type SearchQuery = {
  id: string;
  service_slug: string;
  service_name: string;
  city: string;
  state: string;
  city_slug: string;
  created_at: string;
};

export type City = {
  id: string;
  city: string;
  state: string;
  slug: string;
  professional_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicCity = Pick<City, "city" | "state" | "slug">;

export type PublicDirectoryLinkRow = {
  link_id: string;
  service_slug: string;
  city: string;
  state: string;
  city_slug: string;
  url: string;
  name: string;
  whatsapp: string;
  photo_url: string | null;
  professional_city: string;
  professional_state: string;
  neighborhoods: string[];
  hours: string | null;
  service_slugs: string[];
  portfolio: PublicPortfolioItem[];
};

export type ServiceCitySearchRanking = {
  service_slug: string;
  service_name: string;
  city: string;
  state: string;
  city_slug: string;
  searches: number;
  last_searched_at: string;
  rank: number;
};

export type AuditLog = {
  id: string;
  action: string;
  target: string;
  user_id: string | null;
  ip_address: string | null;
  created_at: string;
};

// Type helpers for inserts
export type ServiceInsert = Omit<Service, "created_at" | "updated_at">;
type ProfessionalAddressField =
  | "postal_code"
  | "street"
  | "address_number"
  | "address_complement"
  | "neighborhood";
export type ProfessionalInsert = Omit<
  Professional,
  "id" | "created_at" | "updated_at" | ProfessionalAddressField
> &
  Partial<Pick<Professional, ProfessionalAddressField>>;
export type ProfessionalServiceInsert = Omit<ProfessionalService, "id" | "created_at">;
export type ProfessionalPortfolioItemInsert = Omit<
  ProfessionalPortfolioItem,
  "id" | "created_at" | "updated_at"
>;
export type PublicLinkInsert = Omit<PublicLink, "id" | "created_at" | "updated_at">;
export type SearchQueryInsert = Omit<SearchQuery, "id" | "created_at">;
export type CityInsert = Omit<City, "id" | "created_at" | "updated_at">;
export type AuditLogInsert = Omit<AuditLog, "id" | "created_at">;
