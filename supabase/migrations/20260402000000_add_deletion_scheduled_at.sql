-- Add deletion_scheduled_at to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMP WITH TIME ZONE;

-- Create function to schedule account deletion
CREATE OR REPLACE FUNCTION public.schedule_account_deletion(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET deletion_scheduled_at = now()
  WHERE user_id = target_user_id;
END;
$$;

-- Create function to get users scheduled for deletion for more than 30 days
CREATE OR REPLACE FUNCTION public.get_expired_deletion_requests()
RETURNS TABLE (user_id UUID)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT user_id
  FROM public.profiles
  WHERE deletion_scheduled_at IS NOT NULL
    AND deletion_scheduled_at < now() - INTERVAL '30 days';
$$;
