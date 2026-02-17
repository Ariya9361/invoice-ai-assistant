import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { invoices, type Invoice } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, MessageSquare, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function ReviewApproval() {
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  const pendingInvoices = invoices.filter((i) => ["mismatched", "pending", "matched"].includes(i.status));

  const handleAction = (id: string, action: string) => {
    setStatuses((prev) => ({ ...prev, [id]: action }));
    toast.success(`Invoice ${action.toLowerCase()} successfully`);
  };

  const statusColor: Record<string, string> = {
    matched: "bg-chart-matched/20 text-chart-matched",
    mismatched: "bg-chart-unmatched/20 text-chart-unmatched",
    pending: "bg-chart-pending/20 text-chart-pending",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Review & Approval</h1>
        <p className="text-sm text-muted-foreground">Review invoices and approve or reject them</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Invoice Queue ({pendingInvoices.length})</p>
          {pendingInvoices.map((inv) => (
            <Card
              key={inv.id}
              className={cn("bg-card border-border cursor-pointer transition-all hover:border-primary/30", selected?.id === inv.id && "border-primary glow-yellow")}
              onClick={() => setSelected(inv)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground font-mono">{inv.number}</p>
                    <p className="text-xs text-muted-foreground">{inv.vendor}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statuses[inv.id] ? (
                      <Badge className={statuses[inv.id] === "Approved" ? "bg-chart-matched/20 text-chart-matched" : "bg-chart-unmatched/20 text-chart-unmatched"}>
                        {statuses[inv.id]}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className={statusColor[inv.status]}>{inv.status}</Badge>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{inv.date}</span>
                  <span className="text-sm font-mono font-medium text-foreground">${inv.totalAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{selected.number} — {selected.vendor}</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleAction(selected.id, "Rejected")} className="text-chart-unmatched border-chart-unmatched/30 hover:bg-chart-unmatched/10">
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toast.info("Request sent")} className="text-muted-foreground">
                      <MessageSquare className="w-4 h-4 mr-1" /> Request Info
                    </Button>
                    <Button size="sm" onClick={() => handleAction(selected.id, "Approved")} className="bg-chart-matched text-white hover:bg-chart-matched/90">
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Invoice details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "PO Reference", value: selected.poNumber },
                    { label: "Invoice Date", value: selected.date },
                    { label: "Due Date", value: selected.dueDate },
                    { label: "Total Amount", value: `$${selected.totalAmount.toLocaleString()}` },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-[10px] text-muted-foreground uppercase">{f.label}</p>
                      <p className="text-sm font-medium text-foreground">{f.value}</p>
                    </div>
                  ))}
                </div>

                {/* Line items */}
                <div className="border rounded-lg border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary/50">
                        <th className="text-left py-2 px-3 text-xs text-muted-foreground">Item</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground">Qty</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground">Unit Price</th>
                        <th className="text-right py-2 px-3 text-xs text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.items.map((item, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="py-2 px-3">{item.description}</td>
                          <td className="py-2 px-3 text-right font-mono">{item.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono">${item.unitPrice}</td>
                          <td className="py-2 px-3 text-right font-mono">${item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* AI Recommendation */}
                {selected.aiRecommendation && (
                  <div className={cn("p-4 rounded-lg border", selected.aiRecommendation === "Approve" ? "bg-chart-matched/5 border-chart-matched/20" : selected.aiRecommendation === "Escalate" ? "bg-chart-unmatched/5 border-chart-unmatched/20" : "bg-chart-pending/5 border-chart-pending/20")}>
                    <p className="text-xs font-semibold flex items-center gap-1">
                      <span>🤖</span> AI Recommendation: {selected.aiRecommendation}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{selected.aiReasoning}</p>
                  </div>
                )}

                {/* Match Score */}
                <div className="flex items-center gap-3">
                  <p className="text-xs text-muted-foreground">Match Score:</p>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", selected.matchScore >= 95 ? "bg-chart-matched" : selected.matchScore >= 70 ? "bg-chart-pending" : "bg-chart-unmatched")}
                      style={{ width: `${selected.matchScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-medium">{selected.matchScore}%</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border h-full flex items-center justify-center min-h-[400px]">
              <p className="text-muted-foreground text-sm">Select an invoice to review</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
