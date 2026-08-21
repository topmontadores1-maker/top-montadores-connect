import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAuditLogs } from "@/lib/supabase-queries";

type AuditEntry = { id: string; at: string; who: string; what: string; target: string };

export const Route = createFileRoute("/admin/auditoria")({
  head: () => ({ meta: [{ title: "Auditoria — Admin" }] }),
  component: Auditoria,
});

function Auditoria() {
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs(1000)
      .then((logs) => {
        // Convert audit logs to match UI expectations
        const converted = logs.map((log) => ({
          id: log.id,
          at: new Date(log.created_at).toLocaleString("pt-BR"),
          who: log.user_id ? "Admin" : "Sistema",
          what: log.action,
          target: log.target,
        }));
        setAuditLog(converted);
      })
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Auditoria</h1>
      {loading ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted"></div>
            ))}
          </div>
        </div>
      ) : (
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Quando</th>
              <th className="px-4 py-3 text-left">Quem</th>
              <th className="px-4 py-3 text-left">Ação</th>
              <th className="px-4 py-3 text-left">Alvo</th>
            </tr>
          </thead>
          <tbody>
            {auditLog.map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{a.at}</td>
                <td className="px-4 py-3">{a.who}</td>
                <td className="px-4 py-3 font-semibold">{a.what}</td>
                <td className="px-4 py-3">{a.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
