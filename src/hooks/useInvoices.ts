import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Invoice {
  id: string;
  invoice_number: string | null;
  vendor_id: string | null;
  user_id: string;
  title: string;
  description: string | null;
  amount: number | null;
  currency: string;
  due_date: string | null;
  status: "uploaded" | "under_review" | "approved" | "rejected" | "paid";
  risk_score: "low" | "medium" | "high" | null;
  risk_score_value: number | null;
  risk_reason: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  reviewer_id: string | null;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setInvoices(data as unknown as Invoice[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("invoices-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, () => {
        fetchInvoices();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchInvoices]);

  return { invoices, loading, refetch: fetchInvoices };
}
