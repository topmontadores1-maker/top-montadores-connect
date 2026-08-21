import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, MapPin, Link2, MessageCircle, Upload, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getAdminAnalytics,
  getDashboardStats,
  getAuditLogs,
  type AdminAnalytics,
  type DashboardStats,
} from "@/lib/supabase-queries";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Admin" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProfessionals: 0,
    totalLinks: 0,
    totalCities: 0,
    pendingProfessionals: 0,
    totalClicks: 0,
    totalServices: 0,
  });
  const [analytics, setAnalytics] = useState<AdminAnalytics>({
    clicksByService: [],
    linksByState: [],
    searchedCitiesByService: [],
  });
  const [auditLog, setAuditLog] = useState<Array<{ id: string; at: string; who: string; what: string; target: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getAuditLogs(8), getAdminAnalytics()])
      .then(([dbStats, logs, analyticsData]) => {
        setStats(dbStats);
        setAnalytics(analyticsData);
        const converted = logs.map((log) => ({
          id: log.id,
          at: new Date(log.created_at).toLocaleString("pt-BR"),
          who: log.user_id || "Sistema",
          what: log.action,
          target: log.target,
        }));
        setAuditLog(converted);
      })
      .catch((error) => {
        console.error("Error loading dashboard:", error);
        toast.error("Erro ao carregar o dashboard.");
      })
      .finally(() => setLoading(false));
  }, []);
  const cards = [
    { label: "Montadores", value: stats.totalProfessionals, icon: Users },
    { label: "Cidades cobertas", value: stats.totalCities, icon: MapPin },
    { label: "Links ativos", value: stats.totalLinks, icon: Link2 },
    { label: "Cliques acumulados", value: stats.totalClicks.toLocaleString("pt-BR"), icon: MessageCircle },
    { label: "Serviços", value: stats.totalServices, icon: Upload },
    { label: "Pendências", value: stats.pendingProfessionals, icon: AlertTriangle },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 animate-pulse rounded bg-muted"></div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral da operação</p>
        </div>
        <Link to="/admin/montadores" className="text-sm font-semibold text-primary hover:underline">
          Ver montadores →
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-accent text-primary">
                <c.icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 text-2xl font-black">{c.value}</div>
            <div className="text-xs font-semibold text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Cliques por serviço">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={analytics.clicksByService}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 0% / 0.06)" />
              <XAxis dataKey="service" stroke="currentColor" fontSize={12} />
              <YAxis stroke="currentColor" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="clicks" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Links por estado">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={analytics.linksByState}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 0% / 0.06)" />
              <XAxis dataKey="state" stroke="currentColor" fontSize={12} />
              <YAxis stroke="currentColor" fontSize={12} />
              <Tooltip />
              <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Cidades mais pesquisadas por serviço">
        {analytics.searchedCitiesByService.length > 0 ? (
          <div className="divide-y divide-border">
            {analytics.searchedCitiesByService.map((item) => (
              <div
                key={`${item.service_slug}-${item.city_slug}`}
                className="grid gap-3 py-3 text-sm sm:grid-cols-[1fr_1fr_auto] sm:items-center"
              >
                <div>
                  <div className="font-semibold">{item.service_name}</div>
                  <div className="text-xs text-muted-foreground">#{item.rank} no serviço</div>
                </div>
                <div className="text-muted-foreground">
                  {item.city}, {item.state}
                </div>
                <div className="font-bold text-primary">
                  {item.searches.toLocaleString("pt-BR")} busca(s)
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-sm text-muted-foreground">Nenhuma busca registrada.</p>
        )}
      </ChartCard>

      <div className="rounded-xl border border-border bg-card">
        <header className="border-b border-border p-4">
          <h2 className="font-bold">Últimas atividades</h2>
        </header>
        <ul className="divide-y divide-border">
          {auditLog.slice(0, 8).map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
              <div>
                <div className="font-semibold">{a.what}</div>
                <div className="text-xs text-muted-foreground">{a.target}</div>
              </div>
              <div className="text-xs text-muted-foreground">{a.at} · {a.who}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2 text-sm font-bold">{title}</h3>
      {children}
    </div>
  );
}
