import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, TrendingUp, DollarSign } from "lucide-react";
import { CurrencySelector } from "@/components/CurrencySelector";
import { useInvoices } from "@/hooks/useInvoices";
import { useVendors } from "@/hooks/useVendors";
import { useCurrency } from "@/contexts/CurrencyContext";
import { InvoiceStatusBadge } from "@/components/InvoiceStatusBadge";
import { RiskBadge } from "@/components/RiskBadge";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { invoices, loading } = useInvoices();
  const { vendors } = useVendors();
  const { currency } = useCurrency();
  const symbol = currency.symbol;

  const totalAmount = invoices.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const approvedCount = invoices.filter((i) => i.status === "approved" || i.status === "paid").length;
  const pendingCount = invoices.filter((i) => i.status === "uploaded" || i.status === "under_review").length;

  const kpiCards = [
    { label: "Total Invoices", value: invoices.length, icon: FileText, suffix: "" },
    { label: "Approved / Paid", value: approvedCount, icon: CheckCircle, suffix: "" },
    { label: "Pending Review", value: pendingCount, icon: Clock, suffix: "" },
    { label: "Total Value", value: `${symbol}${totalAmount.toLocaleString()}`, icon: DollarSign, suffix: "" },
  ];

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Enterprise invoice processing overview</p>
        </div>
        <CurrencySelector />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
                    {kpi.suffix}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <kpi.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Invoices */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recentInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-foreground">No invoices yet</p>
              <p className="text-xs text-muted-foreground mt-1">Upload invoices to start tracking</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Invoice</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Risk</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">{inv.title}</p>
                        {inv.invoice_number && <p className="text-xs text-muted-foreground">{inv.invoice_number}</p>}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-foreground">
                        {inv.amount ? `${symbol}${Number(inv.amount).toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3 px-4 text-center"><InvoiceStatusBadge status={inv.status} /></td>
                      <td className="py-3 px-4 text-center"><RiskBadge risk={inv.risk_score} /></td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
