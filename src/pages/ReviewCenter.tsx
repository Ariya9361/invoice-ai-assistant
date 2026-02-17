import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";

export default function ReviewCenter() {
  const { user } = useAuth();
  const { isReviewer } = useUserRole();
  const { submissions, loading } = useSubmissions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const selected = submissions.find((s) => s.id === selectedId);

  const handleAction = async (status: "approved" | "rejected" | "in_review") => {
    if (!selectedId || !user) return;
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          status,
          reviewer_id: user.id,
          reviewer_notes: notes.trim() || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedId);

      if (error) throw error;
      toast.success(`Submission ${status}`);
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

  const filtered = submissions.filter((s) => {
    const matchSearch = search
      ? s.title.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Review Center</h1>
        <p className="text-sm text-muted-foreground">Review and approve submissions in real-time</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["pending", "in_review", "approved", "rejected"] as const).map((st) => (
          <Card key={st} className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{submissions.filter((s) => s.status === st).length}</p>
              <StatusBadge status={st} />
            </CardContent>
          </Card>
        ))}
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
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Title</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">File</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Submitted</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{s.title}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground truncate max-w-[150px]">{s.file_name || "—"}</td>
                      <td className="py-3 px-4 text-center"><StatusBadge status={s.status} /></td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedId(s.id); setNotes(s.reviewer_notes || ""); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="text-sm font-medium text-foreground">{selected.title}</p>
              </div>
              {selected.description && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm text-foreground">{selected.description}</p>
                </div>
              )}
              {selected.file_name && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">File</p>
                  <p className="text-sm text-foreground">{selected.file_name}</p>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Status</p>
                <StatusBadge status={selected.status} />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Reviewer Notes</p>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes..." rows={3} />
              </div>
              <div className="flex gap-2">
                {selected.status !== "in_review" && (
                  <Button variant="outline" className="flex-1" disabled={processing} onClick={() => handleAction("in_review")}>
                    <Eye className="w-4 h-4 mr-2" /> Mark In Review
                  </Button>
                )}
                <Button className="flex-1 bg-chart-matched hover:bg-chart-matched/90 text-foreground" disabled={processing} onClick={() => handleAction("approved")}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve
                </Button>
                <Button variant="destructive" className="flex-1" disabled={processing} onClick={() => handleAction("rejected")}>
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
