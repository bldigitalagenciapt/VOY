import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminUser {
    id: string;
    user_id: string;
    display_name: string | null;
    email: string;
    is_admin: boolean;
    is_suspended: boolean;
    suspended_reason: string | null;
    last_login_at: string | null;
    created_at: string;
    document_count?: number;
}

export function useAdminUsers() {
    const queryClient = useQueryClient();

    const { data: users = [], isLoading, refetch } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            // Usar função SQL para buscar usuários com emails
            const { data: usersData, error: usersError } = await supabase
                .rpc('get_all_users_for_admin');

            if (usersError) {
                console.error('Erro ao buscar usuários:', usersError);
                throw usersError;
            }

            // Get document counts
            const { data: docCounts } = await supabase
                .from('documents')
                .select('user_id');

            const counts = docCounts?.reduce((acc: Record<string, number>, doc) => {
                acc[doc.user_id] = (acc[doc.user_id] || 0) + 1;
                return acc;
            }, {});

            return (usersData || []).map(user => ({
                ...user,
                document_count: counts?.[user.user_id] || 0,
            })) as AdminUser[];
        },
    });

    const suspendUserMutation = useMutation({
        mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
            const { error } = await supabase
                .from('profiles')
                .update({
                    is_suspended: true,
                    suspended_reason: reason,
                    suspended_at: new Date().toISOString(),
                })
                .eq('user_id', userId);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Usuário suspenso com sucesso');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: () => {
            toast.error('Erro ao suspender usuário');
        },
    });

    const reactivateUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            const { error } = await supabase
                .from('profiles')
                .update({
                    is_suspended: false,
                    suspended_reason: null,
                    suspended_at: null,
                })
                .eq('user_id', userId);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Usuário reativado com sucesso');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: () => {
            toast.error('Erro ao reativar usuário');
        },
    });

    const toggleAdminMutation = useMutation({
        mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
            const { error } = await supabase
                .from('profiles')
                .update({ is_admin: !isAdmin })
                .eq('user_id', userId);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Permissões atualizadas');
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: () => {
            toast.error('Erro ao atualizar permissões');
        },
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async (email: string) => {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth`,
            });

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Email de redefinição enviado');
        },
        onError: () => {
            toast.error('Erro ao enviar email');
        },
    });

    return {
        users,
        isLoading,
        refetch,
        suspendUser: suspendUserMutation.mutateAsync,
        reactivateUser: reactivateUserMutation.mutateAsync,
        toggleAdmin: toggleAdminMutation.mutateAsync,
        resetPassword: resetPasswordMutation.mutateAsync,
    };
}
