import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShieldAlert, ShieldCheck, Shield } from "lucide-react";

const riskConfig = {
  low: { style: "bg-chart-matched/15 text-chart-matched border-chart-matched/30", icon: ShieldCheck, label: "Low Risk" },
  medium: { style: "bg-chart-pending/15 text-chart-pending border-chart-pending/30", icon: Shield, label: "Medium Risk" },
  high: { style: "bg-destructive/15 text-destructive border-destructive/30", icon: ShieldAlert, label: "High Risk" },
};

export function RiskBadge({ risk }: { risk: "low" | "medium" | "high" | null }) {
  if (!risk) return <span className="text-xs text-muted-foreground">—</span>;
  const config = riskConfig[risk];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold gap-1", config.style)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
