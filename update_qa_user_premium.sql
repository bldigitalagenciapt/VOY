-- Executar este comando no SQL Editor do Supabase (Painel de Controle)
-- Ele busca o ID do usuário pelo email na tabela de autenticação e atualiza o perfil.

UPDATE public.profiles
SET 
  plan_status = 'premium',
  plan_type = 'yearly',
  payment_date = NOW()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'qa.luca.test@gmail.com'
);
