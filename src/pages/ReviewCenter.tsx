import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceStatusBadge } from "@/components/InvoiceStatusBadge";
import { RiskBadge } from "@/components/RiskBadge";
import { useInvoices } from "@/hooks/useInvoices";
import { useVendors } from "@/hooks/useVendors";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, Search, Filter, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import type { Invoice } from "@/hooks/useInvoices";

export default function ReviewCenter() {
  const { user } = useAuth();
  const { isReviewer, isAdmin } = useUserRole();
  const { invoices, loading } = useInvoices();
  const { vendors } = useVendors();
  const { currency } = useCurrency();
  const symbol = currency.symbol;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const selected = invoices.find((i) => i.id === selectedId);

  const handleAction = async (status: "under_review" | "approved" | "rejected" | "paid") => {
    if (!selectedId || !user) return;
    setProcessing(true);
    try {
      const updateData: Record<string, unknown> = {
        status,
        reviewer_id: user.id,
        reviewer_notes: notes.trim() || null,
        reviewed_at: new Date().toISOString(),
      };
      if (status === "approved") {
        updateData.approved_by = user.id;
        updateData.approved_at = new Date().toISOString();
      }
      if (status === "paid") {
        updateData.paid_at = new Date().toISOString();
      }

      const { error } = await supabase.from("invoices").update(updateData as any).eq("id", selectedId);
      if (error) throw error;

      // Log to audit trail
      await supabase.from("audit_trail").insert({
        entity_type: "invoice",
        entity_id: selectedId,
        action: `manual_${status}`,
        details: { reviewer_notes: notes.trim() || null },
        performed_by: user.id,
      } as any);

      toast.success(`Invoice ${status.replace("_", " ")}`);
      setSelectedId(null);
      setNotes("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (!isReviewer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">You don't have reviewer permissions.</p>
      </div>
    );
  }

  const filtered = invoices.filter((i) => {
    const matchSearch = search ? i.title.toLowerCase().includes(search.toLowerCase()) || i.invoice_number?.toLowerCase().includes(search.toLowerCase()) : true;
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Review Center</h1>
        <p className="text-sm text-muted-foreground">Review invoices through the multi-stage approval workflow</p>
      </div>

      {/* Status pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(["uploaded", "under_review", "approved", "rejected", "paid"] as const).map((st) => (
          <Card key={st} className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{invoices.filter((i) => i.status === st).length}</p>
              <InvoiceStatusBadge status={st} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="uploaded">Uploaded</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Invoice</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Vendor</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Risk</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => {
                    const vendor = vendors.find((v) => v.id === inv.vendor_id);
                    return (
                      <tr key={inv.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{inv.title}</p>
                          {inv.invoice_number && <p className="text-xs text-muted-foreground">{inv.invoice_number}</p>}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">{vendor?.name || "—"}</td>
                        <td className="py-3 px-4 text-right font-medium text-foreground">
                          {inv.amount ? `${symbol}${Number(inv.amount).toLocaleString()}` : "—"}
                        </td>
                        <td className="py-3 px-4 text-center"><InvoiceStatusBadge status={inv.status} /></td>
                        <td className="py-3 px-4 text-center"><RiskBadge risk={inv.risk_score} /></td>
                        <td className="py-3 px-4 text-center">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedId(inv.id); setNotes(inv.reviewer_notes || ""); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Review Invoice</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Title</p><p className="text-sm font-medium text-foreground">{selected.title}</p></div>
                <div><p className="text-xs text-muted-foreground">Invoice #</p><p className="text-sm font-medium text-foreground">{selected.invoice_number || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Amount</p><p className="text-sm font-medium text-foreground">{selected.amount ? `${symbol}${Number(selected.amount).toLocaleString()}` : "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Risk</p><RiskBadge risk={selected.risk_score} /></div>
              </div>
              {selected.risk_reason && (
                <div className="p-3 rounded-lg bg-secondary border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">AI Risk Analysis</p>
                  <p className="text-xs text-foreground">{selected.risk_reason}</p>
                </div>
              )}
              <div><p className="text-xs text-muted-foreground">Current Status</p><InvoiceStatusBadge status={selected.status} /></div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Reviewer Notes</p>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes..." rows={3} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {selected.status === "uploaded" && (
                  <Button variant="outline" className="flex-1" disabled={processing} onClick={() => handleAction("under_review")}>
                    <Eye className="w-4 h-4 mr-2" /> Start Review
                  </Button>
                )}
                {(selected.status === "uploaded" || selected.status === "under_review") && (
                  <>
                    <Button className="flex-1 bg-chart-matched hover:bg-chart-matched/90 text-foreground" disabled={processing} onClick={() => handleAction("approved")}>
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button variant="destructive" className="flex-1" disabled={processing} onClick={() => handleAction("rejected")}>
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </>
                )}
                {selected.status === "approved" && isAdmin && (
                  <Button className="flex-1" disabled={processing} onClick={() => handleAction("paid")}>
                    <DollarSign className="w-4 h-4 mr-2" /> Mark as Paid
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
