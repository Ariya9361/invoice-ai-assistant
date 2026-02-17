import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2, Zap } from "lucide-react";
import { invoices } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const processingSteps = [
  { label: "Document Received", icon: FileText },
  { label: "AI Extracting Fields", icon: Zap },
  { label: "Matching Against PO", icon: CheckCircle },
  { label: "Result Generated", icon: AlertTriangle },
];

export default function InvoiceProcessing() {
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showResult, setShowResult] = useState(false);

  const simulateProcessing = () => {
    setProcessing(true);
    setShowResult(false);
    setCurrentStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= processingSteps.length) {
        clearInterval(interval);
        setProcessing(false);
        setShowResult(true);
      }
      setCurrentStep(step);
    }, 1200);
  };

  const statusColor: Record<string, string> = {
    matched: "bg-chart-matched/20 text-chart-matched border-chart-matched/30",
    mismatched: "bg-chart-unmatched/20 text-chart-unmatched border-chart-unmatched/30",
    pending: "bg-chart-pending/20 text-chart-pending border-chart-pending/30",
    approved: "bg-chart-matched/20 text-chart-matched border-chart-matched/30",
    rejected: "bg-chart-unmatched/20 text-chart-unmatched border-chart-unmatched/30",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Invoice Processing</h1>
        <p className="text-sm text-muted-foreground">Upload and process invoices with AI extraction</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Upload Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={simulateProcessing}
            >
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-foreground">Drop invoice PDF/image here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to simulate upload</p>
            </div>

            {/* Processing Steps */}
            {(processing || showResult) && (
              <div className="mt-6 space-y-3">
                {processingSteps.map((step, i) => (
                  <div key={i} className={cn("flex items-center gap-3 p-3 rounded-lg transition-all", i <= currentStep ? "bg-secondary" : "opacity-40")}>
                    {i < currentStep ? (
                      <CheckCircle className="w-5 h-5 text-chart-matched shrink-0" />
                    ) : i === currentStep && processing ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                    ) : (
                      <step.icon className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm font-medium text-foreground">{step.label}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extracted Data Preview */}
        {showResult && (
          <Card className="bg-card border-border animate-slide-in">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                AI Extracted Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Vendor", value: "Acme Industrial Supply" },
                { label: "Invoice #", value: "INV-8834" },
                { label: "PO Reference", value: "PO-2026-001" },
                { label: "Amount", value: "$45,250.00" },
                { label: "Date", value: "Feb 2, 2026" },
                { label: "Match Result", value: "100% Match", badge: true },
              ].map((field) => (
                <div key={field.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{field.label}</span>
                  {field.badge ? (
                    <Badge className="bg-chart-matched/20 text-chart-matched border-chart-matched/30">{field.value}</Badge>
                  ) : (
                    <span className="text-sm font-medium text-foreground">{field.value}</span>
                  )}
                </div>
              ))}
              <div className="p-3 rounded-lg bg-chart-matched/10 border border-chart-matched/20">
                <p className="text-xs font-medium text-chart-matched">✅ AI Recommendation: Approve</p>
                <p className="text-xs text-muted-foreground mt-1">Perfect three-way match. All quantities, prices, and totals align.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Invoice Queue */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Processing Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">Invoice</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">Vendor</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">PO Ref</th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                  <th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground uppercase">Match</th>
                  <th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-2 font-mono text-xs">{inv.number}</td>
                    <td className="py-3 px-2">{inv.vendor}</td>
                    <td className="py-3 px-2 font-mono text-xs">{inv.poNumber}</td>
                    <td className="py-3 px-2 text-right font-mono">${inv.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-2 text-center">
                      {inv.matchScore > 0 ? (
                        <span className={cn("text-xs font-medium", inv.matchScore >= 95 ? "text-chart-matched" : inv.matchScore >= 70 ? "text-chart-pending" : "text-chart-unmatched")}>
                          {inv.matchScore}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Badge variant="outline" className={cn("text-[10px]", statusColor[inv.status])}>{inv.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
