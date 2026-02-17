
-- Fix: restrict notification inserts to authenticated users only
DROP POLICY "System can create notifications" ON public.notifications;

CREATE POLICY "Authenticated can create notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);
