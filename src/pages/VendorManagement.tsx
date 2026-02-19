import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RiskBadge } from "@/components/RiskBadge";
import { useVendors, Vendor } from "@/hooks/useVendors";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Building2, DollarSign, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function VendorManagement() {
  const { user } = useAuth();
  const { isReviewer, isAdmin } = useUserRole();
  const { vendors, loading, refetch } = useVendors();
  const { currency } = useCurrency();
  const symbol = currency.symbol;
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", tax_id: "", risk_status: "low" as "low" | "medium" | "high", notes: "" });

  const resetForm = () => setForm({ name: "", email: "", phone: "", address: "", tax_id: "", risk_status: "low", notes: "" });

  const openNew = () => { resetForm(); setEditing(null); setDialogOpen(true); };
  const openEdit = (v: Vendor) => {
    setForm({ name: v.name, email: v.email || "", phone: v.phone || "", address: v.address || "", tax_id: v.tax_id || "", risk_status: v.risk_status, notes: v.notes || "" });
    setEditing(v);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !form.name.trim()) { toast.error("Vendor name is required"); return; }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase.from("vendors").update({
          name: form.name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          tax_id: form.tax_id.trim() || null,
          risk_status: form.risk_status as any,
          notes: form.notes.trim() || null,
        }).eq("id", editing.id);
        if (error) throw error;
        toast.success("Vendor updated");
      } else {
        const { error } = await supabase.from("vendors").insert({
          name: form.name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          tax_id: form.tax_id.trim() || null,
          risk_status: form.risk_status as any,
          notes: form.notes.trim() || null,
          created_by: user.id,
        });
        if (error) throw error;
        toast.success("Vendor created");
      }
      setDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vendor?")) return;
    const { error } = await supabase.from("vendors").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Vendor deleted"); refetch(); }
  };

  const filtered = vendors.filter((v) => {
    const matchSearch = search ? v.name.toLowerCase().includes(search.toLowerCase()) : true;
    const matchRisk = riskFilter === "all" || v.risk_status === riskFilter;
    return matchSearch && matchRisk;
  });

  const totalSpend = vendors.reduce((s, v) => s + Number(v.total_spend), 0);
  const highRiskCount = vendors.filter((v) => v.risk_status === "high").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendor Management</h1>
          <p className="text-sm text-muted-foreground">Manage vendors, track spend, and monitor risk</p>
        </div>
        {isReviewer && (
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add Vendor</Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Vendors</p>
              <p className="text-2xl font-bold text-foreground mt-1">{vendors.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10"><Building2 className="w-5 h-5 text-primary" /></div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Spend</p>
              <p className="text-2xl font-bold text-foreground mt-1">{symbol}{totalSpend.toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10"><DollarSign className="w-5 h-5 text-primary" /></div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">High Risk</p>
              <p className="text-2xl font-bold text-destructive mt-1">{highRiskCount}</p>
            </div>
            <div className="p-2 rounded-lg bg-destructive/10"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Risk" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
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
              <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-foreground">No vendors found</p>
              <p className="text-xs text-muted-foreground mt-1">Add vendors to start tracking</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Email</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Total Spend</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Risk</th>
                    {isReviewer && <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr key={v.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{v.name}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{v.email || "—"}</td>
                      <td className="py-3 px-4 text-right text-foreground font-medium">{symbol}{Number(v.total_spend).toLocaleString()}</td>
                      <td className="py-3 px-4 text-center"><RiskBadge risk={v.risk_status} /></td>
                      {isReviewer && (
                        <td className="py-3 px-4 text-center space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(v)}><Pencil className="w-4 h-4" /></Button>
                          {isAdmin && <Button variant="ghost" size="sm" onClick={() => handleDelete(v.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>{editing ? "Edit Vendor" : "Add Vendor"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tax ID</Label><Input value={form.tax_id} onChange={(e) => setForm({ ...form, tax_id: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Risk Status</Label>
                <Select value={form.risk_status} onValueChange={(v) => setForm({ ...form, risk_status: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="w-full">
              {saving ? "Saving..." : editing ? "Update Vendor" : "Add Vendor"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
