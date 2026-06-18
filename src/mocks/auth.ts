import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminUser = {
  email: string;
  name: string;
  role: "admin";
};

type AuthState = {
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
};

// Mock-only credentials. No backend, no real auth.
const MOCK_EMAIL = "admin@topmontadores.com.br";
const MOCK_PASSWORD = "admin123";

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 500));
        if (email.trim().toLowerCase() !== MOCK_EMAIL || password !== MOCK_PASSWORD) {
          return { ok: false, error: "E-mail ou senha inválidos." };
        }
        set({
          user: { email: MOCK_EMAIL, name: "Administrador", role: "admin" },
        });
        return { ok: true };
      },
      logout: () => set({ user: null }),
    }),
    { name: "top-montadores-auth" },
  ),
);

export const MOCK_AUTH_HINT = { email: MOCK_EMAIL, password: MOCK_PASSWORD };
