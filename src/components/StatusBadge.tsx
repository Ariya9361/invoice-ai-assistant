import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending: "bg-chart-pending/15 text-chart-pending border-chart-pending/30",
  in_review: "bg-chart-processing/15 text-chart-processing border-chart-processing/30",
  approved: "bg-chart-matched/15 text-chart-matched border-chart-matched/30",
  rejected: "bg-chart-unmatched/15 text-chart-unmatched border-chart-unmatched/30",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold", statusStyles[status] || "")}>
      {statusLabels[status] || status}
    </Badge>
  );
}
