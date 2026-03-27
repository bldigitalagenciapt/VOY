-- ============================================
-- PATCH DE SEGURANÇA: EXCLUSÃO DE CONTAS (VOY APP)
-- ============================================
-- Execute este script no SQL Editor do seu Dashboard no Supabase
-- Ele substitui a função vulnerável por uma versão 100% segura.

CREATE OR REPLACE FUNCTION public.handle_user_data_deletion(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 🚨 Trava de Segurança Crítica: Apenas o dono da conta pode excluir seus dados
  IF auth.uid() IS NULL OR auth.uid() != user_uuid THEN
    RAISE EXCEPTION 'Acesso Negado: Você só pode excluir os seus próprios dados.';
  END IF;

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
