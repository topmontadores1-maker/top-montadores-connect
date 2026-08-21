import { useEffect } from "react";
import { useSupabaseAuth } from "@/integrations/supabase/auth-store";

/**
 * Initialize Supabase authentication on app mount
 * This component should be rendered at the root level
 */
export function AuthInitializer() {
  const initializeAuth = useSupabaseAuth((s) => s.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return null;
}
