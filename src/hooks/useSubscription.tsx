import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useSubscription() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        if (!user) {
            // Se não estiver logado, redireciona para login
            // Salvamos a intenção de compra para redirecionar de volta depois (opcional, mas boa prática)
            sessionStorage.setItem('redirect_after_login', '/?checkout=true');
            window.location.href = '/auth';
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase.functions.invoke('stripe-checkout', {
                body: {
                    user_id: user.id,
                    user_email: user.email
                }
            });

            if (error) {
                throw error;
            }

            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error: any) {
            console.error('Checkout error details:', error);

            // Tenta extrair mensagem de erro do corpo da resposta, se disponível
            let errorMessage = 'Erro ao iniciar pagamento. Tente novamente mais tarde.';

            if (error && typeof error === 'object') {
                if (error.message) {
                    errorMessage = `Erro no Checkout: ${error.message}`;
                }
                if (error.context && error.context.json) {
                    try {
                        const errorBody = await error.context.json();
                        console.error('Error body:', errorBody);
                        if (errorBody.error) {
                            errorMessage = `Erro do Servidor: ${errorBody.error}`;
                        }
                    } catch (e) {
                        console.log('Could not parse error context json');
                    }
                }
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return {
        handleCheckout,
        loading
    };
}
