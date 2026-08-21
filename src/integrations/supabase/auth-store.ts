import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./client";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "admin";
};

type AuthState = {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setUser: (user: AdminUser | null) => void;
};

// Admin user ID from Supabase
const ADMIN_USER_ID = "070251e6-bb99-4805-9bd9-2166b0193e63";

export const useSupabaseAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,

      setUser: (user) => set({ user }),

      initializeAuth: async () => {
        try {
          const { data } = await supabase.auth.getSession();
          
          if (data.session?.user) {
            // Check if user is admin
            if (data.session.user.id === ADMIN_USER_ID) {
              set({
                user: {
                  id: data.session.user.id,
                  email: data.session.user.email || "",
                  name: data.session.user.user_metadata?.name || "Administrador",
                  role: "admin",
                },
                loading: false,
              });
            } else {
              // User logged in but not admin
              await supabase.auth.signOut();
              set({ user: null, loading: false });
            }
          } else {
            set({ user: null, loading: false });
          }
        } catch (error) {
          console.error("Error initializing auth:", error);
          set({ user: null, loading: false });
        }
      },

      login: async (email, password) => {
        try {
          // Sign in with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            return { ok: false, error: error.message || "E-mail ou senha inválidos." };
          }

          // Check if user is admin
          if (data.user?.id !== ADMIN_USER_ID) {
            // Sign out if not admin
            await supabase.auth.signOut();
            return { ok: false, error: "Apenas administradores podem acessar." };
          }

          // Set user in state
          set({
            user: {
              id: data.user.id,
              email: data.user.email || "",
              name: data.user.user_metadata?.name || "Administrador",
              role: "admin",
            },
          });

          return { ok: true };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Erro ao fazer login.";
          return { ok: false, error: message };
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
          set({ user: null });
        } catch (error) {
          console.error("Error logging out:", error);
          set({ user: null });
        }
      },
    }),
    { name: "top-montadores-supabase-auth" }
  )
);
