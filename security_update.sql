-- ============================================
-- VOY APP - SECURITY UPDATE PARA DADOS PII E AUDITORIA
-- ============================================
-- Execute este script no SQL Editor do Supabase

-- 1. TORNAR O BUCKET DE DOCUMENTOS PRIVADO
UPDATE storage.buckets
SET public = false
WHERE id = 'voy_secure_docs';

-- 2. RESTRINGIR ESTRITAMENTE AS POLÍTICAS DO STORAGE
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their documents" ON storage.objects;

-- Novo: Upload apenas na prórpria pasta e no bucket certo
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'voy_secure_docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Novo: Leitura apenas da própria pasta
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'voy_secure_docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Novo: Delete apenas da própria pasta
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'voy_secure_docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Atualiza permissão também de Update (se não houvesse antes)
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'voy_secure_docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. CRIAR TABELA DE LOGS DE AUDITORIA DE DOCUMENTOS E PII
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nos logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Usuários só podem ver seus próprios logs de atividade
CREATE POLICY "Users can view their own activity logs"
ON public.activity_logs FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- E ninguém, através de APIs públicas/Client, pode alterar ou deletar os logs (Apenas INSERT ou Leitura)
CREATE POLICY "Users can insert their own activity logs"
ON public.activity_logs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. FUNÇÕES DE AUDITORIA AUTOMÁTICAS PARA DOCUMENTOS
CREATE OR REPLACE FUNCTION public.log_document_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.activity_logs (user_id, action, entity, entity_id, details)
        VALUES (NEW.user_id, 'UPLOAD_DOCUMENT', 'documents', NEW.id, jsonb_build_object('name', NEW.name, 'category', NEW.category));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.activity_logs (user_id, action, entity, entity_id, details)
        VALUES (OLD.user_id, 'DELETE_DOCUMENT', 'documents', OLD.id, jsonb_build_object('name', OLD.name, 'category', OLD.category));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atrelar Triggers aos documentos
DROP TRIGGER IF EXISTS trg_audit_document_insert ON public.documents;
CREATE TRIGGER trg_audit_document_insert
    AFTER INSERT ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.log_document_activity();

DROP TRIGGER IF EXISTS trg_audit_document_delete ON public.documents;
CREATE TRIGGER trg_audit_document_delete
    AFTER DELETE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.log_document_activity();
