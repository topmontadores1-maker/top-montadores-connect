CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;

CREATE OR REPLACE FUNCTION private.increment_public_link_click(p_link_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  next_clicks INTEGER;
BEGIN
  UPDATE public.public_links
  SET clicks = COALESCE(clicks, 0) + 1,
      updated_at = NOW()
  WHERE id = p_link_id
    AND status = 'ativo'
  RETURNING clicks INTO next_clicks;

  RETURN next_clicks;
END;
$$;

REVOKE ALL ON FUNCTION private.increment_public_link_click(UUID) FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.increment_public_link_click(UUID) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_clicks(link_id UUID)
RETURNS INTEGER
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT private.increment_public_link_click(link_id);
$$;

REVOKE ALL ON FUNCTION public.increment_clicks(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_clicks(UUID) TO anon, authenticated;
