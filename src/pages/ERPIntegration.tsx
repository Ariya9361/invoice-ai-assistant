import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { purchaseOrders, goodsReceipts, vendors } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Wifi } from "lucide-react";

export default function ERPIntegration() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ERP Integration</h1>
          <p className="text-sm text-muted-foreground">Mock ERP data — Purchase Orders, Receipts & Vendors</p>
        </div>
        <Badge className="bg-chart-matched/20 text-chart-matched border-chart-matched/30 gap-1">
          <Wifi className="w-3 h-3" /> Connected
        </Badge>
      </div>

      <Tabs defaultValue="pos" className="w-full">
        <TabsList className="bg-secondary">
          <TabsTrigger value="pos">Purchase Orders ({purchaseOrders.length})</TabsTrigger>
          <TabsTrigger value="receipts">Goods Receipts ({goodsReceipts.length})</TabsTrigger>
          <TabsTrigger value="vendors">Vendors ({vendors.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pos">
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">PO Number</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Vendor</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Items</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="border-b border-border hover:bg-secondary/50">
                      <td className="py-3 px-4 font-mono text-xs">{po.number}</td>
                      <td className="py-3 px-4">{po.vendor}</td>
                      <td className="py-3 px-4 text-muted-foreground">{po.date}</td>
                      <td className="py-3 px-4 text-right font-mono">${po.totalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className={po.status === "received" ? "text-chart-matched" : po.status === "partial" ? "text-chart-pending" : "text-muted-foreground"}>
                          {po.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground">{po.items.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts">
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">GR Number</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">PO Ref</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Received By</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Items</th>
                  </tr>
                </thead>
                <tbody>
                  {goodsReceipts.map((gr) => (
                    <tr key={gr.id} className="border-b border-border hover:bg-secondary/50">
                      <td className="py-3 px-4 font-mono text-xs">{gr.number}</td>
                      <td className="py-3 px-4 font-mono text-xs">{gr.poNumber}</td>
                      <td className="py-3 px-4 text-muted-foreground">{gr.date}</td>
                      <td className="py-3 px-4">{gr.receivedBy}</td>
                      <td className="py-3 px-4 text-center text-muted-foreground">{gr.items.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((v) => (
              <Card key={v.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{v.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{v.code}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-chart-matched" />
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-muted-foreground">{v.contact}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-primary">★ {v.rating}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
