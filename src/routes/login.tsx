import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Logo } from "@/components/brand/Logo";
import { useSupabaseAuth } from "@/integrations/supabase/auth-store";

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(1, "Senha é obrigatória").max(120),
});

type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acesso administrativo — Top Montadores" },
      { name: "description", content: "Área restrita do painel administrativo Top Montadores." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const user = useSupabaseAuth((s) => s.user);
  const login = useSupabaseAuth((s) => s.login);
  const search = useRouterState({ select: (s) => s.location.search }) as { redirect?: string };
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const defaultSanityStudioUrl = "https://top-montadores-cms.sanity.studio";
  const sanityStudioHref =
    import.meta.env.VITE_SANITY_STUDIO_URL ||
    (import.meta.env.DEV ? "http://localhost:3340" : defaultSanityStudioUrl);

  useEffect(() => {
    if (user) navigate({ to: search?.redirect ?? "/admin", replace: true });
  }, [user, navigate, search]);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const res = await login(values.email, values.password);
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error);
      form.setError("password", { message: res.error });
      return;
    }
    toast.success("Bem-vindo de volta!");
    navigate({ to: search?.redirect ?? "/admin", replace: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Logo variant="light" />
        <div className="space-y-6">
          <ShieldCheck className="h-10 w-10 opacity-80" />
          <h1 className="text-3xl font-extrabold leading-tight">
            Painel Top Montadores
          </h1>
          <p className="max-w-md text-primary-foreground/80">
            Gerencie montadores, links públicos, cobertura por cidade e auditoria de
            alterações em um só lugar.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">
          Acesso restrito. Todas as ações são registradas em auditoria.
        </p>
      </aside>

      <main className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-border/60">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto lg:hidden">
              <Logo />
            </div>
            <CardTitle className="text-2xl">Entrar no painel</CardTitle>
            <CardDescription>
              Use seu e-mail administrativo para acessar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            autoFocus
                            autoComplete="email"
                            placeholder="admin@topmontadores.com.br"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Entrando…
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>

                <Button type="button" variant="outline" className="w-full" asChild>
                  <a href={sanityStudioHref} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Acessar Sanity Studio
                  </a>
                </Button>
              </form>
            </Form>

            <div className="mt-6 rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Acesso Administrativo</p>
              <p className="mt-1">
                Use sua conta de administrador configurada para acessar o painel.
              </p>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">← Voltar ao site</Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
