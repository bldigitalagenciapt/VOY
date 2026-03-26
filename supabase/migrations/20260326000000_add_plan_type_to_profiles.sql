-- Adicionar coluna plan_type na tabela profiles
-- Registra qual plano o usuário assinou: 'monthly' (mensal) ou 'yearly' (anual)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT NULL;

COMMENT ON COLUMN public.profiles.plan_type IS 'Tipo de plano Stripe assinado: monthly (mensal) ou yearly (anual)';
