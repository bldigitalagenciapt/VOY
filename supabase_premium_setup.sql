-- ######### 1. TABELA PROFILES - CAMPOS PREMIUM #########

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;

-- ######### 2. RLS POLICIES - DOCUMENTOS #########

-- Remove políticas antigas
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;

-- Cria novas políticas que exigem status 'premium'
CREATE POLICY "Premium users can view their own documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.plan_status = 'premium'
  )
);

CREATE POLICY "Premium users can insert their own documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.plan_status = 'premium'
  )
);

-- ######### 3. RLS POLICIES - STORAGE (STAGING) #########

-- Note: No Supabase Dashboard, você também deve configurar o bucket 'voy_secure_docs' 
-- para permitir SELECT/INSERT apenas para usuários autenticados com status premium.
-- Exemplo de política para storage.objects:
-- SELECT: auth.uid() = owner AND (SELECT plan_status FROM profiles WHERE user_id = auth.uid()) = 'premium'

-- ######### 4. FUNÇÃO DE EXCLUSÃO DE DADOS (LGPD / REEMBOLSO) #########

CREATE OR REPLACE FUNCTION public.handle_user_data_deletion(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Deletar documentos (isso já libera as referências no banco)
  DELETE FROM public.documents WHERE user_id = user_uuid;
  
  -- 2. Deletar outras informações vinculadas
  DELETE FROM public.notes WHERE user_id = user_uuid;
  DELETE FROM public.aima_status WHERE user_id = user_uuid;
  DELETE FROM public.transactions WHERE user_id = user_uuid;
  DELETE FROM public.custom_categories WHERE user_id = user_uuid;
  DELETE FROM public.quick_access_documents WHERE user_id = user_uuid;
  
  -- 3. Deletar o perfil
  DELETE FROM public.profiles WHERE user_id = user_uuid;
  
  -- Nota: Os arquivos no Storage são removidos via código no Frontend 
  -- antes desta chamada para garantir que o bucket fique limpo.
END;
$$;
