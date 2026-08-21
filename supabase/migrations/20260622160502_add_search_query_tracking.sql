CREATE TABLE IF NOT EXISTS public.search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_slug TEXT NOT NULL,
  service_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  city_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_queries_service_city
  ON public.search_queries(service_slug, city_slug);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at
  ON public.search_queries(created_at DESC);

ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.search_queries FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public.search_queries TO anon, authenticated;
GRANT SELECT ON TABLE public.search_queries TO authenticated;

CREATE POLICY "Anyone can create public search queries"
ON public.search_queries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(service_slug)) > 0
  AND length(trim(service_name)) > 0
  AND length(trim(city)) > 0
  AND state ~ '^[A-Z]{2}$'
  AND length(trim(city_slug)) > 0
);

CREATE POLICY "Only admin can view search queries"
ON public.search_queries
FOR SELECT
TO authenticated
USING (auth.uid() = '070251e6-bb99-4805-9bd9-2166b0193e63');

CREATE OR REPLACE VIEW public.service_city_search_rankings
WITH (security_invoker = true, security_barrier = true)
AS
SELECT
  service_slug,
  service_name,
  city,
  state,
  city_slug,
  COUNT(*)::INTEGER AS searches,
  MAX(created_at) AS last_searched_at,
  (DENSE_RANK() OVER (
    PARTITION BY service_slug
    ORDER BY COUNT(*) DESC, MAX(created_at) DESC, city ASC, state ASC
  ))::INTEGER AS rank
FROM public.search_queries
GROUP BY service_slug, service_name, city, state, city_slug;

REVOKE ALL ON TABLE public.service_city_search_rankings FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.service_city_search_rankings TO authenticated;
