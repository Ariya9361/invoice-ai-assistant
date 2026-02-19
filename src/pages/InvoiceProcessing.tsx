import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/FileUpload";
import { InvoiceStatusBadge } from "@/components/InvoiceStatusBadge";
import { RiskBadge } from "@/components/RiskBadge";
import { useInvoices } from "@/hooks/useInvoices";
import { useVendors } from "@/hooks/useVendors";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Search, Filter, FileText, Zap, CheckCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function InvoiceProcessing() {
  const { user } = useAuth();
  const { invoices, loading } = useInvoices();
  const { vendors } = useVendors();
  const { currency } = useCurrency();
  const symbol = currency.symbol;
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scoringId, setScoringId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form
  const [form, setForm] = useState({ title: "", description: "", invoice_number: "", amount: "", vendor_id: "", due_date: "" });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (!user || !form.title.trim()) { toast.error("Title is required"); return; }
    setUploading(true);
    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let fileType: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("submissions").upload(path, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("submissions").getPublicUrl(path);
        fileUrl = urlData.publicUrl;
        fileName = file.name;
        fileType = file.type;
      }

      const { data, error } = await supabase.from("invoices").insert({
        user_id: user.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        invoice_number: form.invoice_number.trim() || null,
        amount: form.amount ? parseFloat(form.amount) : null,
        vendor_id: form.vendor_id || null,
        due_date: form.due_date || null,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
      } as any).select().single();

      if (error) throw error;

      toast.success("Invoice uploaded successfully!");
      setOpen(false);
      setForm({ title: "", description: "", invoice_number: "", amount: "", vendor_id: "", due_date: "" });
      setFile(null);

      // Trigger AI fraud risk scoring
      if (data) {
        const invoiceId = (data as any).id;
        setScoringId(invoiceId);
        const vendor = vendors.find((v) => v.id === form.vendor_id);
        try {
          const { data: riskData, error: riskError } = await supabase.functions.invoke("assess-fraud-risk", {
            body: {
              invoice: {
                title: form.title.trim(),
                invoice_number: form.invoice_number.trim(),
                amount: form.amount,
                vendor_name: vendor?.name || "Unknown",
                description: form.description.trim(),
                file_name: fileName,
              },
            },
          });

          if (!riskError && riskData && !riskData.error) {
            await supabase.from("invoices").update({
              risk_score: riskData.risk_level as any,
              risk_score_value: riskData.risk_score,
              risk_reason: riskData.reason,
            }).eq("id", invoiceId);
            toast.success(`Risk assessed: ${riskData.risk_level}`);
          }
        } catch {
          // Non-blocking risk scoring failure
        }
        setScoringId(null);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const filtered = invoices.filter((inv) => {
    const matchSearch = search ? inv.title.toLowerCase().includes(search.toLowerCase()) || inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) : true;
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    uploaded: invoices.filter((i) => i.status === "uploaded").length,
    under_review: invoices.filter((i) => i.status === "under_review").length,
    approved: invoices.filter((i) => i.status === "approved").length,
    rejected: invoices.filter((i) => i.status === "rejected").length,
    paid: invoices.filter((i) => i.status === "paid").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoice Processing</h1>
          <p className="text-sm text-muted-foreground">Upload, track, and manage invoices through the approval workflow</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Upload Invoice</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader><DialogTitle>Upload Invoice</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Invoice from Acme Corp" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Invoice #</Label><Input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} placeholder="INV-001" /></div>
                <div className="space-y-2"><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <Select value={form.vendor_id} onValueChange={(v) => setForm({ ...form, vendor_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                    <SelectContent>
                      {vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <div className="space-y-2"><Label>File</Label><FileUpload onFileSelected={setFile} uploading={uploading} accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.webp" /></div>
              <Button onClick={handleSubmit} disabled={uploading || !form.title.trim()} className="w-full">
                {uploading ? "Uploading..." : "Submit Invoice"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(Object.entries(statusCounts) as [string, number][]).map(([status, count]) => (
          <Card key={status} className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setStatusFilter(status === statusFilter ? "all" : status)}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{count}</p>
              <InvoiceStatusBadge status={status} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
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
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-foreground">No invoices found</p>
              <p className="text-xs text-muted-foreground mt-1">Upload an invoice to get started</p>
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
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Uploaded</th>
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
                        <td className="py-3 px-4 text-center">
                          <InvoiceStatusBadge status={inv.status} />
                          {scoringId === inv.id && <Loader2 className="w-3 h-3 animate-spin inline ml-1 text-primary" />}
                        </td>
                        <td className="py-3 px-4 text-center"><RiskBadge risk={inv.risk_score} /></td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}
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
    </div>
  );
}
