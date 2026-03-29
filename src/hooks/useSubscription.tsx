import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type PlanType = 'monthly' | 'yearly';

export function useSubscription() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async (planType: PlanType = 'monthly') => {
        if (!user) {
            // Se não estiver logado, redireciona para login
            sessionStorage.setItem('redirect_after_login', `/?checkout=true&plan=${planType}`);
            window.location.href = '/auth';
            return;
        }

        try {
            setLoading(true);

            // Get current session to ensure we have a valid token
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                console.error('Session error:', sessionError);
                throw new Error('Sessão inválida. Por favor, faça login novamente.');
            }

            // IDs dos planos do Stripe (mesmos que estavam configurados no backend)
            const PRICE_IDS = {
                monthly: 'price_1TErBVE9B3Qi46145xFfvUu3',
                yearly: 'price_1TErBVE9B3Qi4614qt3qEvv4'
            };
            const priceId = PRICE_IDS[planType];

            console.log(`Iniciando checkout para o Price ID: ${priceId}`);
            console.log(`[STRIPE DEBUG] User ID: ${user.id}, Email: ${user.email}`);

            const { data, error } = await supabase.functions.invoke('stripe-checkout', {
                body: {
                    user_id: user.id,
                    user_email: user.email,
                    plan_type: planType,
                    price_id: priceId
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
