import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { createProfessional, getServices } from "@/lib/supabase-queries";
import { auditActions } from "@/lib/audit";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/importacoes")({
  head: () => ({ meta: [{ title: "Importações — Admin" }] }),
  component: Importacoes,
});

type PreviewStatus = "ok" | "warning" | "error";

type ImportRow = {
  line: number;
  name: string;
  whatsapp: string;
  city: string;
  state: string;
  service: string;
  serviceSlugs: string[];
  email: string;
  doc: string;
  hours: string;
  notes: string;
  status: PreviewStatus;
  message: string;
};

function Importacoes() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const ok = rows.filter((row) => row.status === "ok").length;
  const warn = rows.filter((row) => row.status === "warning").length;
  const err = rows.filter((row) => row.status === "error").length;

  async function selectFile(file?: File) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Selecione um arquivo CSV.");
      return;
    }

    setLoading(true);
    try {
      const [contents, services] = await Promise.all([file.text(), getServices()]);
      const parsed = parseCsv(contents);
      if (parsed.length < 2) throw new Error("O CSV não possui linhas de dados.");

      const headers = parsed[0].map(normalize);
      const serviceLookup = new Map<string, string>();
      for (const service of services) {
        serviceLookup.set(normalize(service.slug), service.slug);
        serviceLookup.set(normalize(service.name), service.slug);
      }

      const preview = parsed
        .slice(1)
        .filter((values) => values.some(Boolean))
        .map((values, index) => {
          const value = (...names: string[]) => {
            const headerIndex = headers.findIndex((header) => names.includes(header));
            return headerIndex >= 0 ? (values[headerIndex] || "").trim() : "";
          };
          const name = value("nome", "name");
          const whatsapp = value("whatsapp", "telefone").replace(/\D/g, "");
          const city = value("cidade", "city");
          const state = value("uf", "estado", "state").toUpperCase();
          const service = value("servico", "servicos", "service", "services");
          const requestedServices = service
            .split("|")
            .map((item) => item.trim())
            .filter(Boolean);
          const serviceSlugs = requestedServices
            .map((item) => serviceLookup.get(normalize(item)))
            .filter(Boolean) as string[];
          const unknownServices = requestedServices.filter(
            (item) => !serviceLookup.has(normalize(item)),
          );
          const errors = [
            !name ? "nome obrigatório" : "",
            !/^\d{12,13}$/.test(whatsapp) ? "WhatsApp inválido" : "",
            !city ? "cidade obrigatória" : "",
            state.length !== 2 ? "UF inválida" : "",
            serviceSlugs.length === 0 ? "serviço não encontrado" : "",
          ].filter(Boolean);
          const warnings =
            unknownServices.length > 0 ? [`serviços ignorados: ${unknownServices.join(", ")}`] : [];

          return {
            line: index + 2,
            name,
            whatsapp,
            city,
            state,
            service,
            serviceSlugs,
            email: value("email", "e-mail"),
            doc: value("documento", "doc", "cpf", "cnpj"),
            hours: value("horario", "hours"),
            notes: value("observacoes", "notas", "notes"),
            status: errors.length > 0 ? "error" : warnings.length > 0 ? "warning" : "ok",
            message: [...errors, ...warnings].join("; ") || "Pronto para importar",
          } satisfies ImportRow;
        });

      setRows(preview);
      setFileName(file.name);
    } catch (error) {
      console.error("Error reading import file:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao ler CSV.");
    } finally {
      setLoading(false);
    }
  }

  async function importRows() {
    const validRows = rows.filter((row) => row.status !== "error");
    if (validRows.length === 0) return toast.error("Não há linhas válidas para importar.");

    setLoading(true);
    const results = await Promise.allSettled(
      validRows.map((row) =>
        createProfessional(
          {
            name: row.name,
            whatsapp: row.whatsapp,
            email: row.email || null,
            doc: row.doc || null,
            photo_url: null,
            city: row.city,
            state: row.state,
            notes: row.notes || null,
            neighborhoods: [],
            hours: row.hours || null,
            status: "pendente",
          },
          row.serviceSlugs,
        ),
      ),
    );

    const failures = results.filter((result) => result.status === "rejected").length;
    const imported = results.length - failures;
    if (imported > 0) await auditActions.importData(fileName, imported);
    if (failures > 0)
      toast.error(`${imported} linha(s) importadas e ${failures} rejeitadas pelo banco.`);
    else toast.success(`${imported} linha(s) importadas com sucesso.`);
    setLoading(false);
  }

  function downloadErrors() {
    const errorRows = rows.filter((row) => row.status === "error");
    const csv = [
      ["linha", "nome", "whatsapp", "cidade", "uf", "servico", "erro"],
      ...errorRows.map((row) => [
        row.line,
        row.name,
        row.whatsapp,
        row.city,
        row.state,
        row.service,
        row.message,
      ]),
    ]
      .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "erros-importacao.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Importações</h1>

      {rows.length === 0 ? (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center hover:border-primary">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="font-bold">Selecione sua planilha CSV</div>
          <div className="text-sm text-muted-foreground">
            Colunas obrigatórias: nome, whatsapp, cidade, uf e servico
          </div>
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            disabled={loading}
            onChange={(event) => selectFile(event.target.files?.[0])}
          />
        </label>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <Card label="Total de linhas" value={rows.length.toString()} />
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
                {rows.map((row) => (
                  <tr key={row.line} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs">{row.line}</td>
                    <td className="px-4 py-3">
                      {row.name || <em className="text-muted-foreground">vazio</em>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{row.whatsapp}</td>
                    <td className="px-4 py-3">{row.city}</td>
                    <td className="px-4 py-3">{row.state}</td>
                    <td className="px-4 py-3">{row.service}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.status} message={row.message} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRows([]);
                setFileName("");
              }}
            >
              Cancelar
            </Button>
            <Button variant="outline" onClick={downloadErrors} disabled={err === 0}>
              Baixar erros
            </Button>
            <Button onClick={importRows} disabled={loading || ok + warn === 0}>
              {loading ? "Importando..." : `Importar ${ok + warn} linha(s)`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function parseCsv(contents: string) {
  const lines = contents
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  const delimiter =
    (lines[0]?.match(/;/g) || []).length > (lines[0]?.match(/,/g) || []).length ? ";" : ",";
  return lines.map((line) => {
    const values: string[] = [];
    let value = "";
    let quoted = false;
    for (let index = 0; index < line.length; index++) {
      const character = line[index];
      if (character === '"' && line[index + 1] === '"' && quoted) {
        value += '"';
        index++;
      } else if (character === '"') quoted = !quoted;
      else if (character === delimiter && !quoted) {
        values.push(value);
        value = "";
      } else value += character;
    }
    values.push(value);
    return values;
  });
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function Card({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "err";
}) {
  const color =
    tone === "ok"
      ? "text-success"
      : tone === "warn"
        ? "text-warning-foreground"
        : tone === "err"
          ? "text-destructive"
          : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
    </div>
  );
}

function StatusPill({ status, message }: { status: PreviewStatus; message: string }) {
  const config =
    status === "ok"
      ? { icon: CheckCircle2, cls: "text-success", label: "Válida" }
      : status === "warning"
        ? { icon: AlertTriangle, cls: "text-warning-foreground", label: "Aviso" }
        : { icon: XCircle, cls: "text-destructive", label: "Erro" };
  const Icon = config.icon;
  return (
    <span
      title={message}
      className={`inline-flex items-center gap-1 text-xs font-semibold ${config.cls}`}
    >
      <Icon className="h-4 w-4" /> {config.label}
    </span>
  );
}
