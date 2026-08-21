-- Public clients may only read the curated views below. Internal tables remain
-- available to authenticated administrators through their existing RLS policies.

DROP POLICY IF EXISTS "Services are readable by everyone" ON public.services;
DROP POLICY IF EXISTS "Cities are readable by everyone" ON public.cities;
DROP POLICY IF EXISTS "Professionals are readable by everyone" ON public.professionals;
DROP POLICY IF EXISTS "Professional services are readable by everyone" ON public.professional_services;
DROP POLICY IF EXISTS "Public links are readable by everyone" ON public.public_links;

DROP POLICY IF EXISTS "Anonymous can read public cities" ON public.cities;
DROP POLICY IF EXISTS "Anonymous can read active professionals" ON public.professionals;
DROP POLICY IF EXISTS "Anonymous can read active professional services" ON public.professional_services;
DROP POLICY IF EXISTS "Anonymous can read active public links" ON public.public_links;

REVOKE ALL ON TABLE public.services FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.cities FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.professionals FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.professional_services FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.public_links FROM PUBLIC, anon;
REVOKE ALL ON TABLE public.audit_logs FROM PUBLIC, anon;

CREATE OR REPLACE VIEW public.public_services
WITH (security_invoker = false, security_barrier = true)
AS
SELECT slug, name, icon, description
FROM public.services;

CREATE OR REPLACE VIEW public.public_cities
WITH (security_invoker = false, security_barrier = true)
AS
SELECT city, state, slug
FROM public.cities;

CREATE OR REPLACE VIEW public.public_directory_links
WITH (security_invoker = false, security_barrier = true)
AS
SELECT
  public_links.id AS link_id,
  public_links.service_slug,
  public_links.city,
  public_links.state,
  public_links.city_slug,
  public_links.url,
  professionals.name,
  coalesce(public_links.whatsapp_override, professionals.whatsapp) AS whatsapp,
  coalesce(public_links.photo_override, professionals.photo_url) AS photo_url,
  professionals.city AS professional_city,
  professionals.state AS professional_state,
  professionals.neighborhoods,
  professionals.hours,
  coalesce(
    array_agg(professional_services.service_slug)
      FILTER (WHERE professional_services.service_slug IS NOT NULL),
    '{}'::TEXT[]
  ) AS service_slugs
FROM public.public_links
JOIN public.professionals
  ON professionals.id = public_links.professional_id
LEFT JOIN public.professional_services
  ON professional_services.professional_id = professionals.id
WHERE public_links.status = 'ativo'
  AND professionals.status = 'ativo'
GROUP BY
  public_links.id,
  professionals.id;

REVOKE ALL ON TABLE public.public_services FROM PUBLIC;
REVOKE ALL ON TABLE public.public_cities FROM PUBLIC;
REVOKE ALL ON TABLE public.public_directory_links FROM PUBLIC;
GRANT SELECT ON TABLE public.public_services TO anon, authenticated;
GRANT SELECT ON TABLE public.public_cities TO anon, authenticated;
GRANT SELECT ON TABLE public.public_directory_links TO anon, authenticated;

-- The public wrappers execute with their owner's privileges. Anonymous users do
-- not need access to the private schema or its implementation functions.
CREATE OR REPLACE FUNCTION public.increment_clicks(link_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT private.increment_public_link_click(link_id);
$$;

CREATE OR REPLACE FUNCTION public.submit_professional_registration(
  p_name TEXT,
  p_whatsapp TEXT,
  p_email TEXT,
  p_doc TEXT,
  p_photo_url TEXT,
  p_postal_code TEXT,
  p_street TEXT,
  p_address_number TEXT,
  p_address_complement TEXT,
  p_neighborhood TEXT,
  p_city TEXT,
  p_state TEXT,
  p_hours TEXT,
  p_notes TEXT,
  p_neighborhoods TEXT[],
  p_service_slugs TEXT[]
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT private.submit_professional_registration(
    p_name, p_whatsapp, p_email, p_doc, p_photo_url, p_postal_code,
    p_street, p_address_number, p_address_complement, p_neighborhood,
    p_city, p_state, p_hours, p_notes, p_neighborhoods, p_service_slugs
  );
$$;

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.increment_public_link_click(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.submit_professional_registration(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[]
) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.increment_clicks(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_clicks(UUID) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.submit_professional_registration(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[]
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_professional_registration(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[]
) TO anon;
