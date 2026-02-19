import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Wifi } from "lucide-react";

export default function ERPIntegration() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ERP Integration</h1>
          <p className="text-sm text-muted-foreground">Purchase Orders, Receipts & Vendors</p>
        </div>
        <Badge className="bg-muted text-muted-foreground border-border gap-1">
          <Wifi className="w-3 h-3" /> Not Connected
        </Badge>
      </div>

      <Tabs defaultValue="pos" className="w-full">
        <TabsList className="bg-secondary">
          <TabsTrigger value="pos">Purchase Orders (0)</TabsTrigger>
          <TabsTrigger value="receipts">Goods Receipts (0)</TabsTrigger>
          <TabsTrigger value="vendors">Vendors (0)</TabsTrigger>
        </TabsList>

        <TabsContent value="pos">
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Database className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-foreground">No purchase orders</p>
              <p className="text-xs text-muted-foreground mt-1">Connect your ERP to sync purchase orders</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts">
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Database className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-foreground">No goods receipts</p>
              <p className="text-xs text-muted-foreground mt-1">Connect your ERP to sync goods receipts</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors">
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Database className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-foreground">No vendors</p>
              <p className="text-xs text-muted-foreground mt-1">Connect your ERP to sync vendor data</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}