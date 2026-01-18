import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface UserDocument {
    id: string;
    user_id: string;
    document_name: string;
    is_completed: boolean;
    created_at?: string;
}

export function useUserDocuments() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: userDocuments = [], isLoading: loading } = useQuery({
        queryKey: ['user_documents', user?.id],
        queryFn: async () => {
            if (!user) return [];

            // Debugging connection as requested
            const baseUrl = import.meta.env.VITE_SUPABASE_URL;
            console.log(`[DEBUG] Attempting fetch to: ${baseUrl}/rest/v1/user_documents?user_id=eq.${user.id}`);

            const { data, error } = await (supabase as any)
                .schema('public')
                .from('user_documents')
                .select('*')
                .eq('user_id', user.id);

            if (error) {
                console.error('Error fetching user documents:', {
                    message: error.message,
                    hint: (error as any).hint,
                    details: (error as any).details,
                    fullError: error
                });
                throw error;
            }
            return (data as any[]) as UserDocument[];
        },
        enabled: !!user,
    });

    const upsertDocument = useMutation({
        mutationFn: async ({ document_name, is_completed }: { document_name: string; is_completed: boolean }) => {
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await (supabase as any)
                .schema('public')
                .from('user_documents')
                .upsert(
                    {
                        user_id: user.id,
                        document_name,
                        is_completed,
                        updated_at: new Date().toISOString()
                    },
                    { onConflict: 'user_id,document_name' }
                )
                .select()
                .single();

            if (error) {
                console.error('Error upserting user document:', {
                    message: error.message,
                    hint: (error as any).hint,
                    details: (error as any).details,
                    fullError: error
                });
                throw error;
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user_documents', user?.id] });
        },
        onError: (error: any) => {
            console.error('Error updating document status:', {
                message: error.message,
                hint: error.hint,
                details: error.details,
                fullError: error
            });
            toast({
                variant: "destructive",
                title: "Erro ao salvar",
                description: "Não foi possível atualizar o status do documento.",
            });
        },
    });

    return {
        userDocuments,
        loading,
        toggleDocument: (document_name: string, current_status: boolean) =>
            upsertDocument.mutateAsync({ document_name, is_completed: !current_status }),
    };
}
