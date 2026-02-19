import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/hooks/useUserRole";
import { useInvoices } from "@/hooks/useInvoices";
import { useVendors } from "@/hooks/useVendors";
import { useAuditTrail } from "@/hooks/useAuditTrail";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, FileText, ShieldCheck, Activity, Building2, History } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserWithRole {
  user_id: string;
  display_name: string | null;
  role: string;
}

export default function AdminPanel() {
  const { isAdmin } = useUserRole();
  const { invoices } = useInvoices();
  const { vendors } = useVendors();
  const { entries: auditEntries } = useAuditTrail();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name");
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");

      if (profiles && roles) {
        const merged = profiles.map((p) => ({
          ...p,
          role: roles.find((r) => r.user_id === p.user_id)?.role || "user",
        }));
        setUsers(merged);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const updateRole = async (userId: string, newRole: string) => {
    try {
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole as any });
      if (error) throw error;
      setUsers((prev) => prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u)));
      toast.success("Role updated");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Admin access required.</p>
      </div>
    );
  }

  const roleLabels: Record<string, string> = { user: "Accountant", reviewer: "Manager", admin: "Admin" };

  const stats = [
    { label: "Total Users", value: users.length, icon: Users },
    { label: "Total Invoices", value: invoices.length, icon: FileText },
    { label: "Total Vendors", value: vendors.length, icon: Building2 },
    { label: "Pending Review", value: invoices.filter((i) => i.status === "uploaded" || i.status === "under_review").length, icon: Activity },
    { label: "Approved", value: invoices.filter((i) => i.status === "approved").length, icon: ShieldCheck },
    { label: "Audit Events", value: auditEntries.length, icon: History },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Manage users, roles, and monitor system activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">User Management</CardTitle>
          <p className="text-xs text-muted-foreground">Roles: Accountant (User) → Manager (Reviewer) → Admin</p>
        </CardHeader>
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
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">User</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Current Role</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.user_id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{u.display_name || "Unknown"}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="text-xs">{roleLabels[u.role] || u.role}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Select value={u.role} onValueChange={(v) => updateRole(u.user_id, v)}>
                          <SelectTrigger className="w-36 mx-auto"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Accountant</SelectItem>
                            <SelectItem value="reviewer">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
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
