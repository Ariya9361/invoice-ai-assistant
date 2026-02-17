import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { vendorPerformance, processingEfficiency, monthlyTrend } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { DollarSign, Clock, TrendingUp, Target } from "lucide-react";

const tooltipStyle = {
  backgroundColor: "hsl(222 25% 10%)",
  border: "1px solid hsl(222 20% 18%)",
  borderRadius: "8px",
  color: "hsl(220 15% 90%)",
};

const summaryCards = [
  { label: "Avg Time Saved / Invoice", value: "38 min", icon: Clock, desc: "vs 45 min manual" },
  { label: "Auto-Approval Rate", value: "67%", icon: Target, desc: "fully automated" },
  { label: "Monthly Cost Savings", value: "$12,400", icon: DollarSign, desc: "labor cost reduction" },
  { label: "Accuracy Improvement", value: "+18.7%", icon: TrendingUp, desc: "vs previous quarter" },
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Processing Time */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Processing Time: Manual vs Automated (min)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={processingEfficiency}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(220 10% 55%)", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "hsl(220 10% 55%)", fontSize: 12 }} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="manual" name="Manual" fill="hsl(var(--chart-unmatched))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="automated" name="Automated" fill="hsl(var(--chart-matched))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Invoice Value Trend */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Monthly Invoice Value ($)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(220 10% 55%)", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "hsl(220 10% 55%)", fontSize: 12 }} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vendor Performance */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Vendor Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Vendor</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Volume</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Match Rate</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Avg Process Time</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorPerformance.map((v) => (
                    <tr key={v.vendor} className="border-b border-border hover:bg-secondary/50">
                      <td className="py-3 px-4 font-medium">{v.vendor}</td>
                      <td className="py-3 px-4 text-right font-mono">{v.volume}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={v.matchRate >= 90 ? "text-chart-matched" : v.matchRate >= 80 ? "text-chart-pending" : "text-chart-unmatched"}>{v.matchRate}%</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{v.avgProcessTime}min</td>
                      <td className="py-3 px-4">
                        <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${v.matchRate}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
