-- Ownership check on star increments (SECURITY DEFINER must not credit arbitrary children).
-- Family dashboard stats as one query instead of N progress fetches per child.

CREATE OR REPLACE FUNCTION public.increment_stars(p_child_id UUID, p_stars INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_stars IS NULL OR p_stars <= 0 THEN
    RETURN;
  END IF;

  UPDATE public.children
  SET total_stars = total_stars + p_stars,
      updated_at = now()
  WHERE id = p_child_id
    AND parent_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'increment_stars denied for child %', p_child_id
      USING ERRCODE = '42501';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.increment_stars(UUID, INTEGER) IS
  'Atomically add stars to a child owned by auth.uid(). Rejects other families.';

GRANT EXECUTE ON FUNCTION public.increment_stars(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_stars(UUID, INTEGER) TO service_role;

CREATE OR REPLACE FUNCTION public.family_play_stats()
RETURNS TABLE(
  total_sessions bigint,
  unique_games_touched bigint,
  last_activity_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*)::bigint AS total_sessions,
    COUNT(DISTINCT p.game_id)::bigint AS unique_games_touched,
    MAX(COALESCE(p.completed_at, p.created_at)) AS last_activity_at
  FROM public.progress p
  INNER JOIN public.children c ON c.id = p.child_id
  WHERE c.parent_id = auth.uid();
$$;

COMMENT ON FUNCTION public.family_play_stats() IS
  'Aggregated play counts for the signed-in parent’s children. Replaces N+1 client loops.';

GRANT EXECUTE ON FUNCTION public.family_play_stats() TO authenticated;
