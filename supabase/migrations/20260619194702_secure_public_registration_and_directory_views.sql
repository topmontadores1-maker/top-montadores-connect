CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.submit_professional_registration(
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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_professional_id UUID := gen_random_uuid();
  v_service_count INTEGER;
BEGIN
  IF NULLIF(btrim(p_name), '') IS NULL OR char_length(btrim(p_name)) > 150 THEN
    RAISE EXCEPTION 'Nome inválido.' USING ERRCODE = '22023';
  END IF;
  IF p_whatsapp IS NULL OR p_whatsapp !~ '^\d{12,13}$' THEN
    RAISE EXCEPTION 'WhatsApp inválido.' USING ERRCODE = '22023';
  END IF;
  IF p_postal_code IS NULL
    OR p_postal_code !~ '^\d{8}$'
    OR NULLIF(btrim(p_street), '') IS NULL
    OR NULLIF(btrim(p_address_number), '') IS NULL
    OR NULLIF(btrim(p_neighborhood), '') IS NULL
    OR NULLIF(btrim(p_city), '') IS NULL
    OR p_state IS NULL
    OR char_length(btrim(p_state)) <> 2 THEN
    RAISE EXCEPTION 'Endereço incompleto.' USING ERRCODE = '22023';
  END IF;
  IF p_email IS NOT NULL AND char_length(p_email) > 320 THEN
    RAISE EXCEPTION 'E-mail inválido.' USING ERRCODE = '22023';
  END IF;
  IF p_doc IS NOT NULL AND char_length(p_doc) > 50 THEN
    RAISE EXCEPTION 'Documento inválido.' USING ERRCODE = '22023';
  END IF;
  IF p_notes IS NOT NULL AND char_length(p_notes) > 2000 THEN
    RAISE EXCEPTION 'Observações muito longas.' USING ERRCODE = '22023';
  END IF;
  IF coalesce(cardinality(p_service_slugs), 0) = 0 THEN
    RAISE EXCEPTION 'Selecione ao menos um serviço.' USING ERRCODE = '22023';
  END IF;

  SELECT count(DISTINCT service_slug)
  INTO v_service_count
  FROM unnest(p_service_slugs) AS selected(service_slug)
  JOIN public.services ON services.slug = selected.service_slug;

  IF v_service_count <> (
    SELECT count(DISTINCT selected.service_slug)
    FROM unnest(p_service_slugs) AS selected(service_slug)
  ) THEN
    RAISE EXCEPTION 'Serviço inválido.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.professionals (
    id, name, whatsapp, email, doc, photo_url, postal_code, street,
    address_number, address_complement, neighborhood, city, state,
    hours, notes, neighborhoods, status
  ) VALUES (
    v_professional_id,
    btrim(p_name),
    p_whatsapp,
    NULLIF(btrim(p_email), ''),
    NULLIF(btrim(p_doc), ''),
    NULLIF(btrim(p_photo_url), ''),
    p_postal_code,
    btrim(p_street),
    btrim(p_address_number),
    NULLIF(btrim(p_address_complement), ''),
    btrim(p_neighborhood),
    btrim(p_city),
    upper(btrim(p_state)),
    NULLIF(btrim(p_hours), ''),
    NULLIF(btrim(p_notes), ''),
    coalesce(p_neighborhoods, '{}'::TEXT[]),
    'pendente'
  );

  INSERT INTO public.professional_services (professional_id, service_slug)
  SELECT v_professional_id, service_slug
  FROM (SELECT DISTINCT unnest(p_service_slugs) AS service_slug) AS selected_services;
END;
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
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT private.submit_professional_registration(
    p_name, p_whatsapp, p_email, p_doc, p_photo_url, p_postal_code,
    p_street, p_address_number, p_address_complement, p_neighborhood,
    p_city, p_state, p_hours, p_notes, p_neighborhoods, p_service_slugs
  );
$$;

REVOKE ALL ON FUNCTION private.submit_professional_registration(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[]
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_professional_registration(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[]
) FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon;
GRANT EXECUTE ON FUNCTION private.submit_professional_registration(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[]
) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_professional_registration(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[]
) TO anon;

DROP VIEW IF EXISTS public.public_directory_links;
DROP VIEW IF EXISTS public.public_cities;

DROP POLICY IF EXISTS "Professionals are readable by everyone" ON public.professionals;
DROP POLICY IF EXISTS "Anonymous can read active professionals" ON public.professionals;
CREATE POLICY "Anonymous can read active professionals"
ON public.professionals
FOR SELECT
TO anon
USING (status = 'ativo');

DROP POLICY IF EXISTS "Professional services are readable by everyone" ON public.professional_services;
DROP POLICY IF EXISTS "Anonymous can read active professional services" ON public.professional_services;
CREATE POLICY "Anonymous can read active professional services"
ON public.professional_services
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM public.professionals
    WHERE professionals.id = professional_services.professional_id
      AND professionals.status = 'ativo'
  )
);

DROP POLICY IF EXISTS "Public links are readable by everyone" ON public.public_links;
DROP POLICY IF EXISTS "Anonymous can read active public links" ON public.public_links;
CREATE POLICY "Anonymous can read active public links"
ON public.public_links
FOR SELECT
TO anon
USING (
  status = 'ativo'
  AND EXISTS (
    SELECT 1
    FROM public.professionals
    WHERE professionals.id = public_links.professional_id
      AND professionals.status = 'ativo'
  )
);

DROP POLICY IF EXISTS "Cities are readable by everyone" ON public.cities;
DROP POLICY IF EXISTS "Anonymous can read public cities" ON public.cities;
CREATE POLICY "Anonymous can read public cities"
ON public.cities
FOR SELECT
TO anon
USING (true);

REVOKE ALL ON public.professionals FROM anon;
REVOKE ALL ON public.professional_services FROM anon;
REVOKE ALL ON public.public_links FROM anon;
REVOKE ALL ON public.cities FROM anon;

GRANT SELECT (id, name, whatsapp, photo_url, city, state, neighborhoods, hours, status)
ON public.professionals TO anon;
GRANT SELECT (professional_id, service_slug)
ON public.professional_services TO anon;
GRANT SELECT (id, service_slug, city, state, city_slug, professional_id, url, status, photo_override, whatsapp_override)
ON public.public_links TO anon;
GRANT SELECT (city, state, slug)
ON public.cities TO anon;

CREATE VIEW public.public_cities
WITH (security_invoker = true)
AS
SELECT city, state, slug
FROM public.cities;

CREATE VIEW public.public_directory_links
WITH (security_invoker = true)
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
  coalesce(array_agg(professional_services.service_slug)
    FILTER (WHERE professional_services.service_slug IS NOT NULL), '{}'::TEXT[]) AS service_slugs
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

REVOKE ALL ON public.public_cities FROM PUBLIC;
REVOKE ALL ON public.public_directory_links FROM PUBLIC;
GRANT SELECT ON public.public_cities TO anon, authenticated;
GRANT SELECT ON public.public_directory_links TO anon, authenticated;
