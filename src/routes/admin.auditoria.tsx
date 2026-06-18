import { createFileRoute } from "@tanstack/react-router";
import { auditLog } from "@/mocks/data";

export const Route = createFileRoute("/admin/auditoria")({
  head: () => ({ meta: [{ title: "Auditoria — Admin" }] }),
  component: Auditoria,
});

function Auditoria() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Auditoria</h1>
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
    </div>
  );
}
