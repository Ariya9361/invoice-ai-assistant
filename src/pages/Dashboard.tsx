import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, AlertTriangle, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { dashboardKPIs, statusBreakdown, monthlyTrend, recentActivity } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { CurrencySelector } from "@/components/CurrencySelector";
import { useCurrency } from "@/contexts/CurrencyContext";

const kpiCards = [
  { label: "Total Processed", value: dashboardKPIs.totalProcessed, change: dashboardKPIs.totalProcessedChange, icon: FileText, suffix: "" },
  { label: "Match Rate", value: dashboardKPIs.matchRate, change: dashboardKPIs.matchRateChange, icon: CheckCircle, suffix: "%" },
  { label: "Pending Approvals", value: dashboardKPIs.pendingApprovals, change: dashboardKPIs.pendingChange, icon: Clock, suffix: "" },
  { label: "Time Saved", value: dashboardKPIs.timeSaved, change: dashboardKPIs.timeSavedChange, icon: TrendingUp, suffix: "" },
];

const activityIcons: Record<string, string> = {
  matched: "🟢",
  flagged: "🟡",
  approved: "✅",
  processing: "🔵",
};

export default function Dashboard() {
  const { format } = useCurrency();

  const trendData = monthlyTrend.map((m) => ({
    ...m,
    value: m.value,
  }));

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
              <div className="flex items-center gap-1 mt-2">
                {kpi.change > 0 ? (
                  <TrendingUp className="w-3 h-3 text-chart-matched" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-chart-unmatched" />
                )}
                <span className={`text-xs font-medium ${kpi.change > 0 ? "text-chart-matched" : "text-chart-unmatched"}`}>
                  {Math.abs(kpi.change)}%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Invoice Status Pie */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Invoice Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={85} strokeWidth={2} stroke="hsl(var(--card))">
                  {statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(222 25% 10%)", border: "1px solid hsl(222 20% 18%)", borderRadius: "8px", color: "hsl(220 15% 90%)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center">
              {statusBreakdown.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.fill }} />
                  <span className="text-xs text-muted-foreground">{s.name} ({s.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Invoice Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyTrend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(220 10% 55%)", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "hsl(220 10% 55%)", fontSize: 12 }} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(222 25% 10%)", border: "1px solid hsl(222 20% 18%)", borderRadius: "8px", color: "hsl(220 15% 90%)" }} />
                <Legend wrapperStyle={{ fontSize: 12, color: "hsl(220 10% 55%)" }} />
                <Bar dataKey="invoices" name="Total" fill="hsl(var(--chart-processing))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="matched" name="Matched" fill="hsl(var(--chart-matched))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <span className="text-lg">{activityIcons[a.type]}</span>
                <p className="text-sm text-foreground flex-1">{a.message}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
