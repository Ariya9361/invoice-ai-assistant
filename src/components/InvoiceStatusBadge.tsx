import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  uploaded: "bg-chart-processing/15 text-chart-processing border-chart-processing/30",
  under_review: "bg-chart-pending/15 text-chart-pending border-chart-pending/30",
  approved: "bg-chart-matched/15 text-chart-matched border-chart-matched/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  paid: "bg-primary/15 text-primary border-primary/30",
};

const statusLabels: Record<string, string> = {
  uploaded: "Uploaded",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  paid: "Paid",
};

export function InvoiceStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold", statusStyles[status] || "")}>
      {statusLabels[status] || status}
    </Badge>
  );
}
