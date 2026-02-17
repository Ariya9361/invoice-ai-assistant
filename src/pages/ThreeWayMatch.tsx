import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { invoices, purchaseOrders, goodsReceipts } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function ThreeWayMatch() {
  const [selectedInvoice, setSelectedInvoice] = useState(invoices[0].id);
  const inv = invoices.find((i) => i.id === selectedInvoice)!;
  const po = purchaseOrders.find((p) => p.id === inv.poId);
  const gr = goodsReceipts.find((g) => g.poId === inv.poId);

  const matchIcon = (score: number) => {
    if (score >= 95) return <CheckCircle className="w-5 h-5 text-chart-matched" />;
    if (score >= 70) return <AlertTriangle className="w-5 h-5 text-chart-pending" />;
    return <XCircle className="w-5 h-5 text-chart-unmatched" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Three-Way Matching</h1>
          <p className="text-sm text-muted-foreground">Invoice ↔ Purchase Order ↔ Goods Receipt</p>
        </div>
        <Select value={selectedInvoice} onValueChange={setSelectedInvoice}>
          <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
          <SelectContent>
            {invoices.map((i) => (
              <SelectItem key={i.id} value={i.id}>{i.number} — {i.vendor}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Match Score */}
      <Card className="bg-card border-border">
        <CardContent className="p-5 flex items-center gap-4">
          {matchIcon(inv.matchScore)}
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              Match Score: <span className={cn("font-bold", inv.matchScore >= 95 ? "text-chart-matched" : inv.matchScore >= 70 ? "text-chart-pending" : "text-chart-unmatched")}>{inv.matchScore}%</span>
            </p>
            {inv.aiReasoning && <p className="text-xs text-muted-foreground mt-1">{inv.aiReasoning}</p>}
          </div>
          {inv.aiRecommendation && (
            <Badge className={cn("text-xs", inv.aiRecommendation === "Approve" ? "bg-chart-matched/20 text-chart-matched" : inv.aiRecommendation === "Escalate" ? "bg-chart-unmatched/20 text-chart-unmatched" : "bg-chart-pending/20 text-chart-pending")}>
              AI: {inv.aiRecommendation}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Three columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Invoice */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Invoice — {inv.number}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between"><span className="text-muted-foreground">Vendor</span><span className="font-medium">{inv.vendor}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{inv.date}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-mono font-medium">${inv.totalAmount.toLocaleString()}</span></div>
            </div>
            <div className="border-t border-border pt-2 mt-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase mb-2">Line Items</p>
              {inv.items.map((item, i) => (
                <div key={i} className="text-xs py-1.5 border-b border-border last:border-0">
                  <p className="font-medium">{item.description}</p>
                  <p className="text-muted-foreground">{item.quantity} × ${item.unitPrice} = ${item.total.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* PO */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-processing" />
              Purchase Order — {po?.number ?? "N/A"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {po ? (
              <>
                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between"><span className="text-muted-foreground">Vendor</span><span className="font-medium">{po.vendor}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{po.date}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-mono font-medium">${po.totalAmount.toLocaleString()}</span></div>
                </div>
                <div className="border-t border-border pt-2 mt-3">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase mb-2">Line Items</p>
                  {po.items.map((item, i) => (
                    <div key={i} className="text-xs py-1.5 border-b border-border last:border-0">
                      <p className="font-medium">{item.description}</p>
                      <p className="text-muted-foreground">{item.quantity} × ${item.unitPrice} = ${item.total.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No matching PO found</p>
            )}
          </CardContent>
        </Card>

        {/* GR */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-chart-matched" />
              Goods Receipt — {gr?.number ?? "N/A"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {gr ? (
              <>
                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between"><span className="text-muted-foreground">PO Ref</span><span className="font-medium">{gr.poNumber}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{gr.date}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Received By</span><span className="font-medium">{gr.receivedBy}</span></div>
                </div>
                <div className="border-t border-border pt-2 mt-3">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase mb-2">Items Received</p>
                  {gr.items.map((item, i) => (
                    <div key={i} className="text-xs py-1.5 border-b border-border last:border-0">
                      <p className="font-medium">{item.description}</p>
                      <p className={cn("text-muted-foreground", item.quantityReceived < item.quantityOrdered && "text-chart-unmatched")}>
                        {item.quantityReceived} / {item.quantityOrdered} received
                        {item.status !== "complete" && ` (${item.status})`}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No goods receipt found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
