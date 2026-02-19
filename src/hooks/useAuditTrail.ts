import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface AuditEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  details: Record<string, unknown> | null;
  performed_by: string;
  performed_at: string;
}

export function useAuditTrail() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("audit_trail")
      .select("*")
      .order("performed_at", { ascending: false })
      .limit(200);

    if (!error && data) {
      setEntries(data as unknown as AuditEntry[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { entries, loading, refetch: fetchEntries };
}
