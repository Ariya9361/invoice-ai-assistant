import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Clock, TrendingUp, Target, BarChart3 } from "lucide-react";

const summaryCards = [
  { label: "Avg Time Saved / Invoice", value: "—", icon: Clock, desc: "no data yet" },
  { label: "Auto-Approval Rate", value: "—", icon: Target, desc: "no data yet" },
  { label: "Monthly Cost Savings", value: "—", icon: DollarSign, desc: "no data yet" },
  { label: "Accuracy Improvement", value: "—", icon: TrendingUp, desc: "no data yet" },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Processing efficiency and cost savings insights</p>
      </div>

      {/* Summary */}
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

      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium text-foreground">No analytics data yet</p>
          <p className="text-xs text-muted-foreground mt-1">Process invoices to generate analytics and insights</p>
        </CardContent>
      </Card>
    </div>
  );
}