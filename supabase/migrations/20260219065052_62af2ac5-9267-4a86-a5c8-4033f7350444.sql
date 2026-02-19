
-- Invoice status enum
CREATE TYPE public.invoice_status AS ENUM ('uploaded', 'under_review', 'approved', 'rejected', 'paid');

-- Vendor risk enum
CREATE TYPE public.vendor_risk AS ENUM ('low', 'medium', 'high');

-- Vendors table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  risk_status vendor_risk NOT NULL DEFAULT 'low',
  total_spend NUMERIC(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vendors" ON public.vendors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and reviewers can insert vendors" ON public.vendors
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));

CREATE POLICY "Admins and reviewers can update vendors" ON public.vendors
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));

CREATE POLICY "Admins can delete vendors" ON public.vendors
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(15,2),
  currency TEXT DEFAULT 'USD',
  due_date DATE,
  status invoice_status NOT NULL DEFAULT 'uploaded',
  risk_score vendor_risk DEFAULT 'low',
  risk_score_value NUMERIC(5,2),
  risk_reason TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  reviewer_id UUID,
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Users can view own invoices
CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Reviewers/admins can view all invoices
CREATE POLICY "Reviewers can view all invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'));

-- Users can create invoices
CREATE POLICY "Users can create invoices" ON public.invoices
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Reviewers/admins can update invoices
CREATE POLICY "Reviewers can update invoices" ON public.invoices
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'reviewer') OR public.has_role(auth.uid(), 'admin'));

-- Users can update own uploaded invoices
CREATE POLICY "Users can update own uploaded invoices" ON public.invoices
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'uploaded');

-- Users can delete own uploaded invoices
CREATE POLICY "Users can delete own uploaded invoices" ON public.invoices
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND status = 'uploaded');

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for invoices
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;

-- Audit trail table
CREATE TABLE public.audit_trail (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  performed_by UUID NOT NULL,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit trail
CREATE POLICY "Admins can view all audit trail" ON public.audit_trail
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Reviewers can view audit trail
CREATE POLICY "Reviewers can view audit trail" ON public.audit_trail
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'reviewer'));

-- Users can view own audit trail entries
CREATE POLICY "Users can view own audit trail" ON public.audit_trail
  FOR SELECT TO authenticated
  USING (auth.uid() = performed_by);

-- Authenticated users can insert audit trail (via app logic)
CREATE POLICY "Authenticated can insert audit trail" ON public.audit_trail
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = performed_by);

-- Trigger to auto-create audit trail on invoice status change
CREATE OR REPLACE FUNCTION public.audit_invoice_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_trail (entity_type, entity_id, action, details, performed_by)
    VALUES (
      'invoice',
      NEW.id,
      'status_change',
      jsonb_build_object(
        'old_status', OLD.status::text,
        'new_status', NEW.status::text,
        'invoice_title', NEW.title,
        'reviewer_notes', NEW.reviewer_notes
      ),
      COALESCE(NEW.reviewer_id, NEW.user_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_invoice_status
  AFTER UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.audit_invoice_status_change();

-- Notify user on invoice status change
CREATE OR REPLACE FUNCTION public.notify_invoice_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, title, message)
    VALUES (
      NEW.user_id,
      'Invoice ' || NEW.status::text,
      'Your invoice "' || NEW.title || '" has been ' || NEW.status::text || '.'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_invoice_status
  AFTER UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.notify_invoice_status_change();

-- Update vendor total_spend when invoice is paid
CREATE OR REPLACE FUNCTION public.update_vendor_spend()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid' AND NEW.vendor_id IS NOT NULL AND NEW.amount IS NOT NULL THEN
    UPDATE public.vendors SET total_spend = total_spend + NEW.amount WHERE id = NEW.vendor_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_vendor_spend_on_paid
  AFTER UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_vendor_spend();
