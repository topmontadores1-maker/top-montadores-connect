/**
 * Supabase query helpers
 * Use these to interact with the database
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  Service,
  ServiceInsert,
  PublicService,
  Professional,
  ProfessionalInsert,
  ProfessionalPortfolioItem,
  PublicLink,
  City,
  PublicCity,
  PublicDirectoryLinkRow,
  SearchQueryInsert,
  ServiceCitySearchRanking,
  AuditLog,
  AuditLogInsert,
} from "@/integrations/supabase/database.types";

export type DashboardStats = {
  totalProfessionals: number;
  totalLinks: number;
  totalCities: number;
  pendingProfessionals: number;
  totalClicks: number;
  totalServices: number;
};

export type AdminAnalytics = {
  clicksByService: Array<{ service: string; clicks: number }>;
  linksByState: Array<{ state: string; total: number }>;
  searchedCitiesByService: ServiceCitySearchRanking[];
};

export type PublicDirectoryLink = PublicDirectoryLinkRow;
export type ProfessionalPortfolioInput = Pick<
  ProfessionalPortfolioItem,
  "image_url" | "description" | "position"
>;

// ============ SERVICES ============

export async function getServices() {
  const { data, error } = await supabase.from("services").select("*").order("name");

  if (error) throw error;
  return data as Service[];
}

export async function getPublicServices() {
  const { data, error } = await supabase.from("public_services").select("*").order("name");

  if (error) throw error;
  return data as PublicService[];
}

export async function createService(service: ServiceInsert) {
  const { data, error } = await supabase.from("services").insert(service).select().single();

  if (error) throw error;
  return data as Service;
}

export async function updateService(slug: string, updates: Partial<Omit<ServiceInsert, "slug">>) {
  const { data, error } = await supabase
    .from("services")
    .update(updates)
    .eq("slug", slug)
    .select()
    .single();

  if (error) throw error;
  return data as Service;
}

export async function deleteService(slug: string) {
  const { error } = await supabase.from("services").delete().eq("slug", slug);

  if (error) throw error;
}

// ============ CITIES ============

export async function getCities() {
  const { data, error } = await supabase.from("cities").select("*").order("state").order("city");

  if (error) throw error;
  return data as City[];
}

export async function getPublicCities() {
  const { data, error } = await supabase
    .from("public_cities")
    .select("*")
    .order("state")
    .order("city");

  if (error) throw error;
  return data as PublicCity[];
}

// ============ PROFESSIONALS ============

type ProfessionalWithRelations = Professional & {
  professional_services: Array<{ service_slug: string }>;
  professional_portfolio_items: ProfessionalPortfolioItem[];
};

const PROFESSIONAL_SERVICES_SELECT = `
  *,
  professional_services (
    service_slug
  )
`;

const PROFESSIONAL_WITH_PORTFOLIO_SELECT = `
  ${PROFESSIONAL_SERVICES_SELECT},
  professional_portfolio_items (
    id,
    professional_id,
    image_url,
    description,
    position,
    created_at,
    updated_at
  )
`;

let portfolioRelationAvailable = true;

export async function getProfessionals() {
  if (portfolioRelationAvailable) {
    const { data, error } = await supabase
      .from("professionals")
      .select(PROFESSIONAL_WITH_PORTFOLIO_SELECT)
      .order("name");

    if (!error) return data as ProfessionalWithRelations[];
    if (error.code !== "PGRST200") throw error;

    portfolioRelationAvailable = false;
  }

  const { data, error } = await supabase
    .from("professionals")
    .select(PROFESSIONAL_SERVICES_SELECT)
    .order("name");
  if (error) throw error;
  return (data || []).map((professional) => ({
    ...professional,
    professional_portfolio_items: [],
  })) as ProfessionalWithRelations[];
}

export async function getProfessional(id: string) {
  if (portfolioRelationAvailable) {
    const { data, error } = await supabase
      .from("professionals")
      .select(PROFESSIONAL_WITH_PORTFOLIO_SELECT)
      .eq("id", id)
      .single();

    if (!error) return data as ProfessionalWithRelations;
    if (error.code !== "PGRST200") throw error;

    portfolioRelationAvailable = false;
  }

  const { data, error } = await supabase
    .from("professionals")
    .select(PROFESSIONAL_SERVICES_SELECT)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data ? ({ ...data, professional_portfolio_items: [] } as ProfessionalWithRelations) : null;
}

export async function createProfessional(
  professional: ProfessionalInsert,
  services: string[],
  portfolio: ProfessionalPortfolioInput[] = [],
) {
  // Start transaction
  const { data: prof, error: profError } = await supabase
    .from("professionals")
    .insert([professional])
    .select()
    .single();

  if (profError) throw profError;

  // Add services
  if (services.length > 0) {
    const serviceLinks = services.map((slug) => ({
      professional_id: prof.id,
      service_slug: slug,
    }));

    const { error: servicesError } = await supabase
      .from("professional_services")
      .insert(serviceLinks);

    if (servicesError) throw servicesError;
  }

  if (portfolio.length > 0) {
    await replaceProfessionalPortfolio(prof.id, portfolio);
  }

  return prof as Professional;
}

export async function submitPublicProfessionalRegistration(
  professional: ProfessionalInsert,
  services: string[],
  portfolio: ProfessionalPortfolioInput[] = [],
) {
  const { error } = await supabase.rpc("submit_professional_registration", {
    p_name: professional.name,
    p_whatsapp: professional.whatsapp,
    p_email: professional.email,
    p_doc: professional.doc,
    p_photo_url: professional.photo_url,
    p_postal_code: professional.postal_code || "",
    p_street: professional.street || "",
    p_address_number: professional.address_number || "",
    p_address_complement: professional.address_complement ?? null,
    p_neighborhood: professional.neighborhood || "",
    p_city: professional.city,
    p_state: professional.state,
    p_hours: professional.hours,
    p_notes: professional.notes,
    p_neighborhoods: professional.neighborhoods,
    p_service_slugs: services,
    p_portfolio: portfolio,
  });

  if (error) throw error;
}

export async function updateProfessional(id: string, updates: Partial<ProfessionalInsert>) {
  const { data, error } = await supabase
    .from("professionals")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Professional;
}

export async function updateProfessionalServices(professionalId: string, serviceSlugs: string[]) {
  const uniqueSlugs = Array.from(new Set(serviceSlugs));
  const { data: currentRows, error: currentError } = await supabase
    .from("professional_services")
    .select("service_slug")
    .eq("professional_id", professionalId);

  if (currentError) throw currentError;

  const currentSlugs = new Set((currentRows || []).map((row) => row.service_slug));
  const toAdd = uniqueSlugs.filter((slug) => !currentSlugs.has(slug));
  const toRemove = Array.from(currentSlugs).filter((slug) => !uniqueSlugs.includes(slug));

  if (toAdd.length > 0) {
    const { error } = await supabase.from("professional_services").insert(
      toAdd.map((serviceSlug) => ({
        professional_id: professionalId,
        service_slug: serviceSlug,
      })),
    );
    if (error) throw error;
  }

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("professional_services")
      .delete()
      .eq("professional_id", professionalId)
      .in("service_slug", toRemove);
    if (error) throw error;
  }

  return uniqueSlugs;
}

export async function replaceProfessionalPortfolio(
  professionalId: string,
  portfolio: ProfessionalPortfolioInput[],
) {
  const { error } = await supabase.rpc("replace_professional_portfolio", {
    p_professional_id: professionalId,
    p_items: portfolio,
  });

  if (error) throw error;
  return portfolio;
}

export async function deleteProfessional(id: string) {
  const { error } = await supabase.from("professionals").delete().eq("id", id);

  if (error) throw error;
}

// ============ PUBLIC LINKS ============

export async function getPublicLinks() {
  const { data, error } = await supabase
    .from("public_links")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as PublicLink[];
}

export async function getPublicLinksByProfessional(professionalId: string) {
  const { data, error } = await supabase
    .from("public_links")
    .select("*")
    .eq("professional_id", professionalId);

  if (error) throw error;
  return data as PublicLink[];
}

export async function getPublicLinksForServiceCity(serviceSlug: string, citySlug: string) {
  const { data, error } = await supabase
    .from("public_directory_links")
    .select("*")
    .eq("service_slug", serviceSlug)
    .eq("city_slug", citySlug)
    .order("name", { ascending: true });

  if (error) throw error;
  return data as PublicDirectoryLink[];
}

export async function recordPublicSearchQuery(query: SearchQueryInsert) {
  const { error } = await supabase.from("search_queries").insert(query);

  if (error) throw error;
}

export async function updatePublicLink(
  id: string,
  updates: Partial<
    Pick<PublicLink, "professional_id" | "photo_override" | "whatsapp_override" | "status">
  >,
) {
  const { data, error } = await supabase
    .from("public_links")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as PublicLink;
}

export async function replaceProfessionalInLinks(
  fromId: string,
  toId: string,
  filter?: { citySlug?: string; serviceSlug?: string },
) {
  let query = supabase
    .from("public_links")
    .update({ professional_id: toId })
    .eq("professional_id", fromId);

  if (filter?.citySlug) query = query.eq("city_slug", filter.citySlug);
  if (filter?.serviceSlug) query = query.eq("service_slug", filter.serviceSlug);

  const { data, error } = await query.select("id");
  if (error) throw error;
  return data?.length ?? 0;
}

export async function syncProfessionalPublicLinks(
  professional: Professional,
  serviceSlugs: string[],
) {
  const uniqueServices = Array.from(new Set(serviceSlugs));
  const hasCompleteAddress = Boolean(
    professional.postal_code &&
    professional.street &&
    professional.address_number &&
    professional.neighborhood &&
    professional.city &&
    professional.state,
  );
  const isPublishable =
    professional.status === "ativo" &&
    Boolean(professional.name && professional.whatsapp) &&
    hasCompleteAddress &&
    uniqueServices.length > 0;

  const { data: existingLinks, error: linksError } = await supabase
    .from("public_links")
    .select("*")
    .eq("professional_id", professional.id);

  if (linksError) throw linksError;

  if (!isPublishable) {
    if ((existingLinks || []).some((link) => link.status !== "inativo")) {
      const { error } = await supabase
        .from("public_links")
        .update({ status: "inativo" })
        .eq("professional_id", professional.id);
      if (error) throw error;
    }
    const { error: cityError } = await supabase
      .from("cities")
      .update({ professional_id: null })
      .eq("professional_id", professional.id);
    if (cityError) throw cityError;
    return { generated: 0, publishable: false };
  }

  const citySlug = slugifyPathSegment(`${professional.city}-${professional.state}`);
  const { error: previousCityError } = await supabase
    .from("cities")
    .update({ professional_id: null })
    .eq("professional_id", professional.id)
    .neq("slug", citySlug);
  if (previousCityError) throw previousCityError;

  const { error: cityError } = await supabase.from("cities").upsert(
    {
      city: professional.city,
      state: professional.state,
      slug: citySlug,
      professional_id: professional.id,
    },
    { onConflict: "city,state,slug" },
  );
  if (cityError) throw cityError;

  const activeLinkIds = new Set<string>();
  for (const serviceSlug of uniqueServices) {
    const existing = (existingLinks || []).find(
      (link) => link.service_slug === serviceSlug && link.city_slug === citySlug,
    );
    const linkData = {
      service_slug: serviceSlug,
      city: professional.city,
      state: professional.state,
      city_slug: citySlug,
      professional_id: professional.id,
      url: `/s/${serviceSlug}/${citySlug}`,
      status: "ativo" as const,
    };

    if (existing) {
      const { data, error } = await supabase
        .from("public_links")
        .update(linkData)
        .eq("id", existing.id)
        .select("id")
        .single();
      if (error) throw error;
      activeLinkIds.add(data.id);
    } else {
      const { data, error } = await supabase
        .from("public_links")
        .insert({ ...linkData, clicks: 0, photo_override: null, whatsapp_override: null })
        .select("id")
        .single();
      if (error) throw error;
      activeLinkIds.add(data.id);
    }
  }

  const obsoleteIds = (existingLinks || [])
    .filter((link) => !activeLinkIds.has(link.id) && link.status !== "inativo")
    .map((link) => link.id);
  if (obsoleteIds.length > 0) {
    const { error } = await supabase
      .from("public_links")
      .update({ status: "inativo" })
      .in("id", obsoleteIds);
    if (error) throw error;
  }

  return { generated: activeLinkIds.size, publishable: true };
}

export async function incrementLinkClicks(linkId: string) {
  const { data, error } = await supabase.rpc("increment_clicks", {
    link_id: linkId,
  });

  if (error) throw error;
  return data;
}

// ============ AUDIT LOGS ============

export async function getAuditLogs(limit = 50) {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as AuditLog[];
}

function slugifyPathSegment(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function getAuditLogsByTarget(target: string, limit = 50) {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("target", target)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as AuditLog[];
}

export async function createAuditLog(log: AuditLogInsert) {
  const { data, error } = await supabase.from("audit_logs").insert([log]).select().single();

  if (error) throw error;
  return data as AuditLog;
}

// ============ DASHBOARD STATS ============

export async function getDashboardStats() {
  const [profs, links, cities, pending, services, clickRows] = await Promise.all([
    supabase.from("professionals").select("*", { count: "exact", head: true }),
    supabase.from("public_links").select("*", { count: "exact", head: true }).eq("status", "ativo"),
    supabase
      .from("cities")
      .select("*", { count: "exact", head: true })
      .not("professional_id", "is", null),
    supabase
      .from("professionals")
      .select("*", { count: "exact", head: true })
      .eq("status", "pendente"),
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase.from("public_links").select("clicks"),
  ]);

  const error = [profs, links, cities, pending, services, clickRows].find(
    (result) => result.error,
  )?.error;
  if (error) throw error;

  return {
    totalProfessionals: profs.count || 0,
    totalLinks: links.count || 0,
    totalCities: cities.count || 0,
    pendingProfessionals: pending.count || 0,
    totalClicks: (clickRows.data || []).reduce((sum, link) => sum + (link.clicks || 0), 0),
    totalServices: services.count || 0,
  } satisfies DashboardStats;
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const [linksResult, servicesResult, searchRankingResult] = await Promise.all([
    supabase.from("public_links").select("service_slug, state, clicks"),
    supabase.from("services").select("slug, name"),
    supabase
      .from("service_city_search_rankings")
      .select("*")
      .order("searches", { ascending: false })
      .order("last_searched_at", { ascending: false })
      .limit(12),
  ]);

  if (linksResult.error) throw linksResult.error;
  if (servicesResult.error) throw servicesResult.error;
  if (searchRankingResult.error) throw searchRankingResult.error;

  const serviceNames = new Map(
    (servicesResult.data || []).map((service) => [service.slug, service.name]),
  );
  const clicks = new Map<string, number>();
  const states = new Map<string, number>();

  for (const link of linksResult.data || []) {
    clicks.set(link.service_slug, (clicks.get(link.service_slug) || 0) + (link.clicks || 0));
    states.set(link.state, (states.get(link.state) || 0) + 1);
  }

  return {
    clicksByService: Array.from(clicks, ([slug, total]) => ({
      service: serviceNames.get(slug) || slug,
      clicks: total,
    })).sort((a, b) => b.clicks - a.clicks),
    linksByState: Array.from(states, ([state, total]) => ({ state, total })).sort(
      (a, b) => b.total - a.total,
    ),
    searchedCitiesByService: (searchRankingResult.data || []) as ServiceCitySearchRanking[],
  };
}
