import { Card, CardContent } from "@/components/ui/card";
import { GitCompareArrows } from "lucide-react";

export default function ThreeWayMatch() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Three-Way Matching</h1>
        <p className="text-sm text-muted-foreground">Invoice ↔ Purchase Order ↔ Goods Receipt</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <GitCompareArrows className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium text-foreground">No matching data available</p>
          <p className="text-xs text-muted-foreground mt-1">Invoices, purchase orders, and goods receipts will appear here once connected to your ERP</p>
        </CardContent>
      </Card>
    </div>
  );
}