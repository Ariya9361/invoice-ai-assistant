import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import AuthPage from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import InvoiceProcessing from "@/pages/InvoiceProcessing";
import ThreeWayMatch from "@/pages/ThreeWayMatch";
import ReviewApproval from "@/pages/ReviewApproval";
import ERPIntegration from "@/pages/ERPIntegration";
import Analytics from "@/pages/Analytics";
import AIWorkflow from "@/pages/AIWorkflow";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background dark">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <AuthPage />;

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/invoices" element={<InvoiceProcessing />} />
        <Route path="/matching" element={<ThreeWayMatch />} />
        <Route path="/review" element={<ReviewApproval />} />
        <Route path="/erp" element={<ERPIntegration />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/workflow" element={<AIWorkflow />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
