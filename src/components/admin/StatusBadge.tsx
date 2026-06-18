import { Badge } from "@/components/ui/badge";
import type { Professional } from "@/mocks/data";

export function StatusBadge({ status }: { status: Professional["status"] }) {
  const map: Record<Professional["status"], string> = {
    ativo: "bg-success/15 text-success border-success/30",
    pendente: "bg-warning/20 text-warning-foreground border-warning/40",
    pausado: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={`capitalize ${map[status]}`}>
      {status}
    </Badge>
  );
}
