import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "top-montadores-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setVisible(window.localStorage.getItem(COOKIE_CONSENT_KEY) !== "accepted");
  }, []);

  function acceptCookies() {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-4 py-4 shadow-[0_-16px_50px_rgba(2,17,43,0.16)] backdrop-blur">
      <div className="container mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl text-sm leading-6 text-muted-foreground">
          <strong className="font-bold text-foreground">Cookies de sessão:</strong> usamos cookies
          e armazenamento local necessários para manter a sessão, segurança e preferências do site.
          <Link to="/politicas-de-cookies" className="ml-1 font-semibold text-primary hover:underline">
            Ver política.
          </Link>
        </div>
        <Button type="button" onClick={acceptCookies} className="shrink-0">
          Aceitar cookies
        </Button>
      </div>
    </div>
  );
}
