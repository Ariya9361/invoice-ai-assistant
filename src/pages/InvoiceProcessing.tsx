import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, AlertTriangle, Loader2, Zap } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { StatusBadge } from "@/components/StatusBadge";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const processingSteps = [
  { label: "Document Received", icon: FileText },
  { label: "AI Extracting Fields", icon: Zap },
  { label: "Matching Against PO", icon: CheckCircle },
  { label: "Result Generated", icon: AlertTriangle },
];

export default function InvoiceProcessing() {
  const { user } = useAuth();
  const { submissions, loading: loadingSubmissions } = useSubmissions();
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showResult, setShowResult] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastUploadedFile, setLastUploadedFile] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setUploading(true);
    setProcessing(true);
    setShowResult(false);
    setCurrentStep(0);

    try {
      // Step 1: Upload file to storage
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("submissions")
        .upload(path, file);

      if (uploadError) throw uploadError;

      setCurrentStep(1);

      const { data: urlData } = supabase.storage
        .from("submissions")
        .getPublicUrl(path);

      // Step 2: Create submission record
      const { error: insertError } = await supabase.from("submissions").insert({
        user_id: user.id,
        title: `Invoice: ${file.name}`,
        description: `Auto-uploaded invoice file`,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_type: file.type,
      });

      if (insertError) throw insertError;

      setCurrentStep(2);
      setLastUploadedFile(file.name);

      // Simulate AI processing delay for UX
      await new Promise((r) => setTimeout(r, 1000));
      setCurrentStep(3);

      await new Promise((r) => setTimeout(r, 800));
      setProcessing(false);
      setShowResult(true);
      setUploading(false);
      toast.success("Invoice uploaded and submitted for review!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
      setProcessing(false);
      setUploading(false);
      setCurrentStep(-1);
    }
  };

  // Show recent invoice submissions
  const invoiceSubmissions = submissions.filter(
    (s) => s.file_type?.includes("pdf") || s.file_type?.includes("image") || s.file_type?.includes("sheet") || s.file_type?.includes("csv") || s.title.toLowerCase().includes("invoice")
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Invoice Processing</h1>
        <p className="text-sm text-muted-foreground">Upload invoices for AI extraction and review</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Upload Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              onFileSelected={handleFileSelected}
              uploading={uploading}
              accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.webp"
            />

            {/* Processing Steps */}
            {(processing || showResult) && (
              <div className="mt-6 space-y-3">
                {processingSteps.map((step, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all",
                      i <= currentStep ? "bg-secondary" : "opacity-40"
                    )}
                  >
                    {i < currentStep ? (
                      <CheckCircle className="w-5 h-5 text-chart-matched shrink-0" />
                    ) : i === currentStep && processing ? (
                      <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                    ) : (
                      <step.icon className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm font-medium text-foreground">{step.label}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Preview */}
        {showResult && (
          <Card className="bg-card border-border animate-slide-in">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Upload Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "File", value: lastUploadedFile || "Unknown" },
                { label: "Status", value: "Pending Review", badge: true },
              ].map((field) => (
                <div key={field.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{field.label}</span>
                  {field.badge ? (
                    <StatusBadge status="pending" />
                  ) : (
                    <span className="text-sm font-medium text-foreground">{field.value}</span>
                  )}
                </div>
              ))}
              <div className="p-3 rounded-lg bg-chart-matched/10 border border-chart-matched/20">
                <p className="text-xs font-medium text-chart-matched">✅ Submitted for review</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your invoice has been uploaded and is now pending reviewer approval.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Invoice Submissions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSubmissions ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : invoiceSubmissions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No invoices uploaded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">Title</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">File</th>
                    <th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceSubmissions.map((s) => (
                    <tr key={s.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-2 font-medium text-foreground">{s.title}</td>
                      <td className="py-3 px-2 text-xs text-muted-foreground truncate max-w-[150px]">
                        {s.file_name || "—"}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="py-3 px-2 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
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
