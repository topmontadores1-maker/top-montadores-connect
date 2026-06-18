import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { importPreview } from "@/mocks/data";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/importacoes")({
  head: () => ({ meta: [{ title: "Importações — Admin" }] }),
  component: Importacoes,
});

function Importacoes() {
  const [hasFile, setHasFile] = useState(false);

  const ok = importPreview.filter((r) => r.status === "ok").length;
  const warn = importPreview.filter((r) => r.status === "warning").length;
  const err = importPreview.filter((r) => r.status === "error").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Importações</h1>

      {!hasFile ? (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center hover:border-primary">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="font-bold">Arraste sua planilha (.csv ou .xlsx) aqui</div>
          <div className="text-sm text-muted-foreground">ou clique para selecionar</div>
          <input type="file" accept=".csv,.xlsx" className="hidden" onChange={() => setHasFile(true)} />
        </label>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <Card label="Total de linhas" value={importPreview.length.toString()} />
            <Card label="Válidas" value={ok.toString()} tone="ok" />
            <Card label="Avisos" value={warn.toString()} tone="warn" />
            <Card label="Erros" value={err.toString()} tone="err" />
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Linha</th>
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left">WhatsApp</th>
                  <th className="px-4 py-3 text-left">Cidade</th>
                  <th className="px-4 py-3 text-left">UF</th>
                  <th className="px-4 py-3 text-left">Serviço</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {importPreview.map((r) => (
                  <tr key={r.line} className="border-t border-border align-top">
                    <td className="px-4 py-3 font-mono text-xs">{r.line}</td>
                    <td className="px-4 py-3">{r.name || <em className="text-muted-foreground">vazio</em>}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.whatsapp}</td>
                    <td className="px-4 py-3">{r.city}</td>
                    <td className="px-4 py-3">{r.state}</td>
                    <td className="px-4 py-3">{r.service}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={r.status} message={r.message} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setHasFile(false)}>Cancelar</Button>
            <Button variant="outline">Baixar erros</Button>
            <Button onClick={() => toast.success(`${ok + warn} linhas importadas.`)}>Importar válidas</Button>
          </div>
        </>
      )}

      <div className="rounded-xl border border-border bg-card">
        <header className="border-b border-border p-4"><h2 className="font-bold">Histórico de importações</h2></header>
        <ul className="divide-y divide-border text-sm">
          {["import-2026-06-17.xlsx", "import-2026-06-02.csv", "import-2026-05-22.xlsx"].map((f, i) => (
            <li key={f} className="flex items-center justify-between p-4">
              <span className="font-mono">{f}</span>
              <span className="text-xs text-muted-foreground">{124 - i * 18} linhas · {2 + i} erros</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Card({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" | "err" }) {
  const toneCls = tone === "ok" ? "text-success" : tone === "warn" ? "text-warning-foreground" : tone === "err" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className={`text-2xl font-black ${toneCls}`}>{value}</div>
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
    </div>
  );
}

function StatusPill({ status, message }: { status: "ok" | "warning" | "error"; message?: string }) {
  if (status === "ok") return <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="h-4 w-4" /> OK</span>;
  if (status === "warning") return <span title={message} className="inline-flex items-center gap-1 text-warning-foreground"><AlertTriangle className="h-4 w-4" /> Aviso</span>;
  return <span title={message} className="inline-flex items-center gap-1 text-destructive"><XCircle className="h-4 w-4" /> Erro</span>;
}
