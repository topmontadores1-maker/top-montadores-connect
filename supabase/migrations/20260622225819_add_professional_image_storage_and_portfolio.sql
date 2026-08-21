INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'professional-images',
  'professional-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Anonymous can upload registration images" ON storage.objects;
CREATE POLICY "Anonymous can upload registration images"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'professional-images'
  AND (storage.foldername(name))[1] = 'registrations'
);

DROP POLICY IF EXISTS "Admin can upload professional images" ON storage.objects;
CREATE POLICY "Admin can upload professional images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'professional-images'
  AND auth.uid() = '070251e6-bb99-4805-9bd9-2166b0193e63'
);

DROP POLICY IF EXISTS "Admin can update professional images" ON storage.objects;
CREATE POLICY "Admin can update professional images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'professional-images'
  AND auth.uid() = '070251e6-bb99-4805-9bd9-2166b0193e63'
)
WITH CHECK (
  bucket_id = 'professional-images'
  AND auth.uid() = '070251e6-bb99-4805-9bd9-2166b0193e63'
);

DROP POLICY IF EXISTS "Admin can delete professional images" ON storage.objects;
CREATE POLICY "Admin can delete professional images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'professional-images'
  AND auth.uid() = '070251e6-bb99-4805-9bd9-2166b0193e63'
);

CREATE TABLE IF NOT EXISTS public.professional_portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL CHECK (
    length(btrim(image_url)) > 0
    AND position('/storage/v1/object/public/professional-images/' IN image_url) > 0
  ),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 500),
  position SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (professional_id, position)
);

CREATE INDEX IF NOT EXISTS idx_professional_portfolio_items_professional
  ON public.professional_portfolio_items(professional_id, position);

ALTER TABLE public.professional_portfolio_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.professional_portfolio_items FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.professional_portfolio_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.professional_portfolio_items TO authenticated;

DROP POLICY IF EXISTS "Public can read active professional portfolios" ON public.professional_portfolio_items;
CREATE POLICY "Public can read active professional portfolios"
ON public.professional_portfolio_items
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.professionals
    JOIN public.public_links
      ON public_links.professional_id = professionals.id
    WHERE professionals.id = professional_portfolio_items.professional_id
      AND professionals.status = 'ativo'
      AND public_links.status = 'ativo'
  )
);

DROP POLICY IF EXISTS "Admin can manage professional portfolios" ON public.professional_portfolio_items;
CREATE POLICY "Admin can manage professional portfolios"
ON public.professional_portfolio_items
FOR ALL
TO authenticated
USING (auth.uid() = '070251e6-bb99-4805-9bd9-2166b0193e63')
WITH CHECK (auth.uid() = '070251e6-bb99-4805-9bd9-2166b0193e63');

CREATE OR REPLACE FUNCTION public.replace_professional_portfolio(
  p_professional_id UUID,
  p_items JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF jsonb_typeof(coalesce(p_items, '[]'::JSONB)) <> 'array'
    OR jsonb_array_length(coalesce(p_items, '[]'::JSONB)) > 4 THEN
    RAISE EXCEPTION 'Portfólio inválido.' USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(coalesce(p_items, '[]'::JSONB)) AS item
    WHERE NULLIF(btrim(item->>'image_url'), '') IS NULL
      OR position('/storage/v1/object/public/professional-images/' IN (item->>'image_url')) = 0
      OR char_length(coalesce(item->>'description', '')) > 500
  ) THEN
    RAISE EXCEPTION 'Item de portfólio inválido.' USING ERRCODE = '22023';
  END IF;

  DELETE FROM public.professional_portfolio_items
  WHERE professional_id = p_professional_id;

  INSERT INTO public.professional_portfolio_items (
    professional_id,
    image_url,
    description,
    position
  )
  SELECT
    p_professional_id,
    btrim(item->>'image_url'),
    NULLIF(btrim(item->>'description'), ''),
    ordinality::SMALLINT
  FROM jsonb_array_elements(coalesce(p_items, '[]'::JSONB))
    WITH ORDINALITY AS portfolio(item, ordinality);
END;
$$;

REVOKE ALL ON FUNCTION public.replace_professional_portfolio(UUID, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.replace_professional_portfolio(UUID, JSONB) TO authenticated;

DROP FUNCTION IF EXISTS public.submit_professional_registration(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[]
);
DROP FUNCTION IF EXISTS private.submit_professional_registration(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[]
);

CREATE FUNCTION private.submit_professional_registration(
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
  p_service_slugs TEXT[],
  p_portfolio JSONB
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
  IF p_photo_url IS NOT NULL
    AND position('/storage/v1/object/public/professional-images/' IN p_photo_url) = 0 THEN
    RAISE EXCEPTION 'Foto inválida.' USING ERRCODE = '22023';
  END IF;
  IF coalesce(cardinality(p_service_slugs), 0) = 0 THEN
    RAISE EXCEPTION 'Selecione ao menos um serviço.' USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(coalesce(p_portfolio, '[]'::JSONB)) <> 'array'
    OR jsonb_array_length(coalesce(p_portfolio, '[]'::JSONB)) > 4 THEN
    RAISE EXCEPTION 'Portfólio inválido.' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(coalesce(p_portfolio, '[]'::JSONB)) AS item
    WHERE NULLIF(btrim(item->>'image_url'), '') IS NULL
      OR position('/storage/v1/object/public/professional-images/' IN (item->>'image_url')) = 0
      OR char_length(coalesce(item->>'description', '')) > 500
  ) THEN
    RAISE EXCEPTION 'Item de portfólio inválido.' USING ERRCODE = '22023';
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

  INSERT INTO public.professional_portfolio_items (
    professional_id,
    image_url,
    description,
    position
  )
  SELECT
    v_professional_id,
    btrim(item->>'image_url'),
    NULLIF(btrim(item->>'description'), ''),
    ordinality::SMALLINT
  FROM jsonb_array_elements(coalesce(p_portfolio, '[]'::JSONB))
    WITH ORDINALITY AS portfolio(item, ordinality);
END;
$$;

CREATE FUNCTION public.submit_professional_registration(
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
  p_service_slugs TEXT[],
  p_portfolio JSONB
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT private.submit_professional_registration(
    p_name, p_whatsapp, p_email, p_doc, p_photo_url, p_postal_code,
    p_street, p_address_number, p_address_complement, p_neighborhood,
    p_city, p_state, p_hours, p_notes, p_neighborhoods, p_service_slugs,
    p_portfolio
  );
$$;

REVOKE ALL ON FUNCTION private.submit_professional_registration(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[], JSONB
) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.submit_professional_registration(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[], JSONB
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_professional_registration(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT,
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT[], JSONB
) TO anon;

DROP VIEW IF EXISTS public.public_directory_links;

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
    FILTER (WHERE professional_services.service_slug IS NOT NULL), '{}'::TEXT[]) AS service_slugs,
  coalesce((
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', portfolio.id,
        'image_url', portfolio.image_url,
        'description', portfolio.description,
        'position', portfolio.position
      )
      ORDER BY portfolio.position
    )
    FROM public.professional_portfolio_items AS portfolio
    WHERE portfolio.professional_id = professionals.id
  ), '[]'::JSONB) AS portfolio
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

REVOKE ALL ON public.public_directory_links FROM PUBLIC;
GRANT SELECT ON public.public_directory_links TO anon, authenticated;
