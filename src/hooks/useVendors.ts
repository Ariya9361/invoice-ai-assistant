import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Vendor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_id: string | null;
  risk_status: "low" | "medium" | "high";
  total_spend: number;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useVendors() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data) {
      setVendors(data as unknown as Vendor[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return { vendors, loading, refetch: fetchVendors };
}
