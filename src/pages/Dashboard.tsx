import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { CurrencySelector } from "@/components/CurrencySelector";

const kpiCards = [
  { label: "Total Processed", value: 0, icon: FileText, suffix: "" },
  { label: "Match Rate", value: 0, icon: CheckCircle, suffix: "%" },
  { label: "Pending Approvals", value: 0, icon: Clock, suffix: "" },
  { label: "Time Saved", value: "0 hrs", icon: TrendingUp, suffix: "" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">AI-powered invoice processing overview</p>
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

      {/* Empty state */}
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium text-foreground">No data yet</p>
          <p className="text-xs text-muted-foreground mt-1">Upload invoices to start seeing analytics here</p>
        </CardContent>
      </Card>
    </div>
  );
}