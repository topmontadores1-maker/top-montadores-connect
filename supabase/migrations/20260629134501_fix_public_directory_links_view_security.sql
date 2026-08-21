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
