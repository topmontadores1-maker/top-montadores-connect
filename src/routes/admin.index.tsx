import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, MapPin, Link2, MessageCircle, Upload, AlertTriangle } from "lucide-react";
import { dashboardStats, clicksSeries, stateBars, auditLog } from "@/mocks/data";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Admin" }] }),
  component: Dashboard,
});

function Dashboard() {
  const cards = [
    { label: "Montadores", value: dashboardStats.totalProfessionals, icon: Users },
    { label: "Cidades cobertas", value: dashboardStats.citiesCovered, icon: MapPin },
    { label: "Links ativos", value: dashboardStats.activeLinks, icon: Link2 },
    { label: "Cliques no WhatsApp (7d)", value: dashboardStats.whatsappClicks7d.toLocaleString("pt-BR"), icon: MessageCircle },
    { label: "Importações no mês", value: dashboardStats.importsThisMonth, icon: Upload },
    { label: "Pendências", value: dashboardStats.pending, icon: AlertTriangle },
  ];
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
        <ChartCard title="Cliques no WhatsApp (7 dias)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={clicksSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 0% / 0.06)" />
              <XAxis dataKey="day" stroke="currentColor" fontSize={12} />
              <YAxis stroke="currentColor" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="clicks" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Links por estado">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stateBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 0% / 0.06)" />
              <XAxis dataKey="state" stroke="currentColor" fontSize={12} />
              <YAxis stroke="currentColor" fontSize={12} />
              <Tooltip />
              <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <header className="border-b border-border p-4">
          <h2 className="font-bold">Últimas atividades</h2>
        </header>
        <ul className="divide-y divide-border">
          {auditLog.map((a) => (
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
