import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuditTrail } from "@/hooks/useAuditTrail";
import { useState } from "react";
import { Search, History, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { InvoiceStatusBadge } from "@/components/InvoiceStatusBadge";

export default function AuditTrail() {
  const { entries, loading } = useAuditTrail();
  const [search, setSearch] = useState("");

  const filtered = entries.filter((e) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      e.action.toLowerCase().includes(s) ||
      e.entity_type.toLowerCase().includes(s) ||
      JSON.stringify(e.details).toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Trail</h1>
        <p className="text-sm text-muted-foreground">Complete log of all system actions</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search audit logs..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <History className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-foreground">No audit entries yet</p>
              <p className="text-xs text-muted-foreground mt-1">Actions will be recorded here automatically</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((entry) => {
                const details = entry.details as Record<string, string> | null;
                return (
                  <div key={entry.id} className="px-4 py-3 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold uppercase text-primary">{entry.entity_type}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-sm font-medium text-foreground">{entry.action.replace(/_/g, " ")}</span>
                        </div>
                        {details && (
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {details.invoice_title && (
                              <span className="text-xs text-muted-foreground">"{details.invoice_title}"</span>
                            )}
                            {details.old_status && details.new_status && (
                              <span className="flex items-center gap-1">
                                <InvoiceStatusBadge status={details.old_status} />
                                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                <InvoiceStatusBadge status={details.new_status} />
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(entry.performed_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
