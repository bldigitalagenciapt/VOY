-- Table for user-customized checklist items
CREATE TABLE IF NOT EXISTS public.custom_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    description TEXT,
    is_done BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.custom_checklist_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own checklist items" ON public.custom_checklist_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checklist items" ON public.custom_checklist_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklist items" ON public.custom_checklist_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklist items" ON public.custom_checklist_items
    FOR DELETE USING (auth.uid() = user_id);
