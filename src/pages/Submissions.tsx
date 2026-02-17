import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/FileUpload";
import { StatusBadge } from "@/components/StatusBadge";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";

export default function Submissions() {
  const { user } = useAuth();
  const { submissions, loading } = useSubmissions();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleSubmit = async () => {
    if (!user || !title.trim()) {
      toast.error("Title is required");
      return;
    }

    setUploading(true);
    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let fileType: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("submissions")
          .upload(path, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("submissions")
          .getPublicUrl(path);

        fileUrl = urlData.publicUrl;
        fileName = file.name;
        fileType = file.type;
      }

      const { error } = await supabase.from("submissions").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
      });

      if (error) throw error;

      toast.success("Submission created successfully");
      setOpen(false);
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const filtered = submissions.filter((s) => {
    const matchSearch = search
      ? s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.file_name?.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Submissions</h1>
          <p className="text-sm text-muted-foreground">Upload files and track review status in real-time</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> New Submission
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Create Submission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Invoice from Vendor A" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description (optional)</Label>
                <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional notes..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>File (optional)</Label>
                <FileUpload onFileSelected={setFile} uploading={uploading} />
              </div>
              <Button onClick={handleSubmit} disabled={uploading || !title.trim()} className="w-full">
                {uploading ? "Uploading..." : "Submit"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search submissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
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
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No submissions found</p>
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
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{s.title}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs truncate max-w-[150px]">
                        {s.file_name || "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground truncate max-w-[200px]">
                        {s.reviewer_notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
