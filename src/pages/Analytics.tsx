import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Clock, TrendingUp, Target, BarChart3, PieChart } from "lucide-react";
import { useInvoices } from "@/hooks/useInvoices";
import { useVendors } from "@/hooks/useVendors";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Analytics() {
  const { invoices } = useInvoices();
  const { vendors } = useVendors();
  const { currency } = useCurrency();
  const symbol = currency.symbol;

  const total = invoices.length;
  const approved = invoices.filter((i) => i.status === "approved" || i.status === "paid").length;
  const totalValue = invoices.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const avgValue = total > 0 ? totalValue / total : 0;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const highRiskCount = invoices.filter((i) => i.risk_score === "high").length;

  const summaryCards = [
    { label: "Approval Rate", value: total > 0 ? `${approvalRate}%` : "—", icon: Target, desc: `${approved} of ${total} invoices` },
    { label: "Total Processed Value", value: total > 0 ? `${symbol}${totalValue.toLocaleString()}` : "—", icon: DollarSign, desc: `across ${total} invoices` },
    { label: "Avg Invoice Value", value: total > 0 ? `${symbol}${Math.round(avgValue).toLocaleString()}` : "—", icon: TrendingUp, desc: "per invoice" },
    { label: "High Risk Invoices", value: highRiskCount.toString(), icon: BarChart3, desc: `of ${total} total` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Processing efficiency and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((c) => (
          <Card key={c.label} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{c.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{c.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10"><c.icon className="w-5 h-5 text-primary" /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status breakdown */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Invoice Status Breakdown</h3>
          {total === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <PieChart className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">No data yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {(["uploaded", "under_review", "approved", "rejected", "paid"] as const).map((status) => {
                const count = invoices.filter((i) => i.status === status).length;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={status} className="text-center">
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground capitalize">{status.replace("_", " ")}</p>
                    <div className="w-full h-2 bg-secondary rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{pct}%</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendor spend */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Top Vendors by Spend</h3>
          {vendors.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No vendors yet</p>
          ) : (
            <div className="space-y-3">
              {vendors.sort((a, b) => Number(b.total_spend) - Number(a.total_spend)).slice(0, 5).map((v) => {
                const maxSpend = Math.max(...vendors.map((x) => Number(x.total_spend)), 1);
                const pct = (Number(v.total_spend) / maxSpend) * 100;
                return (
                  <div key={v.id} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-foreground w-32 truncate">{v.name}</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">{symbol}{Number(v.total_spend).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
