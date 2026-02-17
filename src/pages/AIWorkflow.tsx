import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, FileSearch, Brain, Database, GitCompareArrows, CheckSquare, Zap, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { icon: Mail, label: "Email Ingestion", desc: "Invoice received via email gateway", color: "text-chart-processing" },
  { icon: FileSearch, label: "Document Parsing", desc: "OCR and text extraction from PDF/image", color: "text-chart-pending" },
  { icon: Brain, label: "AI Data Extraction", desc: "LLM extracts vendor, PO#, amounts, line items", color: "text-primary" },
  { icon: Database, label: "PO Lookup", desc: "Match extracted PO# against ERP database", color: "text-chart-processing" },
  { icon: GitCompareArrows, label: "Three-Way Match", desc: "Compare Invoice ↔ PO ↔ Goods Receipt", color: "text-chart-matched" },
  { icon: CheckSquare, label: "Recommendation", desc: "AI generates approval/rejection recommendation", color: "text-primary" },
];

export default function AIWorkflow() {
  const [activeStep, setActiveStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [thoughts, setThoughts] = useState<string[]>([]);

  const stepThoughts = [
    "📧 Detected new invoice email from acme@industrial.com with PDF attachment...",
    "📄 Running OCR on invoice_8842.pdf... Detected 2 pages, extracting text blocks...",
    "🧠 Identified fields: Vendor=Acme Industrial, INV#=INV-8842, PO#=PO-2026-007, Amount=$34,200.00",
    "🔍 Querying ERP... Found PO-2026-007: 200x Steel Pipes @ $171/unit = $34,200.00",
    "⚖️ Comparing: Invoice $34,200 = PO $34,200 ✓ | Qty: 200 = 200 ✓ | GR: 200 received ✓",
    "✅ Confidence: 100%. Recommendation: AUTO-APPROVE. All three documents match perfectly.",
  ];

  const runWorkflow = () => {
    setRunning(true);
    setActiveStep(0);
    setThoughts([]);
    let step = 0;
    const interval = setInterval(() => {
      setThoughts((prev) => [...prev, stepThoughts[step]]);
      step++;
      setActiveStep(step);
      if (step >= steps.length) {
        clearInterval(interval);
        setRunning(false);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Agent Workflow</h1>
          <p className="text-sm text-muted-foreground">Visual pipeline of the AI processing agent</p>
        </div>
        <Button onClick={runWorkflow} disabled={running} className="gap-2">
          {running ? <Zap className="w-4 h-4 animate-pulse-glow" /> : <Play className="w-4 h-4" />}
          {running ? "Processing..." : "Run Demo"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Steps */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Processing Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className={cn("absolute left-[19px] top-10 w-0.5 h-8 transition-colors duration-500", i < activeStep ? "bg-primary" : "bg-border")} />
                  )}
                  <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl border-2 shrink-0 transition-all duration-500", i < activeStep ? "bg-primary/10 border-primary" : i === activeStep && running ? "bg-primary/10 border-primary animate-pulse-glow" : "bg-secondary border-border")}>
                    <step.icon className={cn("w-5 h-5 transition-colors", i <= activeStep ? step.color : "text-muted-foreground")} />
                  </div>
                  <div className="pt-1 pb-6">
                    <p className={cn("text-sm font-medium transition-colors", i <= activeStep ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Thoughts */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" /> Agent Thinking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {thoughts.length > 0 ? (
              <div className="space-y-3 font-mono text-xs">
                {thoughts.map((t, i) => (
                  <div key={i} className="p-3 rounded-lg bg-secondary border border-border animate-slide-in">
                    {t}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                Click "Run Demo" to see the AI agent in action
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
