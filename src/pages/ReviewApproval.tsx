import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";

export default function ReviewApproval() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Review & Approval</h1>
        <p className="text-sm text-muted-foreground">Review invoices and approve or reject them</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CheckSquare className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium text-foreground">No invoices to review</p>
          <p className="text-xs text-muted-foreground mt-1">Invoices requiring approval will appear here</p>
        </CardContent>
      </Card>
    </div>
  );
}