import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface ChecklistItem {
    id: string;
    label: string;
    category: string;
    description: string;
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
    { id: 'sim_card', label: 'Cartão SIM (Telemóvel)', category: 'Essencial', description: 'Obter um número português para contactos e serviços.' },
    { id: 'nif', label: 'NIF (Finanças)', category: 'Legal', description: 'Número de Identificação Fiscal, essencial para tudo.' },
    { id: 'bank_account', label: 'Conta Bancária', category: 'Essencial', description: 'Abrir conta num banco português (ex: CGD, Millenium, Activo).' },
    { id: 'niss', label: 'NISS (Segurança Social)', category: 'Trabalho', description: 'Número de Identificação da Segurança Social.' },
    { id: 'sns_number', label: 'Número de Utente (Saúde)', category: 'Saúde', description: 'Inscrição no Centro de Saúde da sua área de residência.' },
    { id: 'arrendamento', label: 'Contrato de Arrendamento', category: 'Essencial', description: 'Garantir morada oficial com contrato registado nas Finanças.' },
    { id: 'manifestacao', label: 'Manifestação de Interesse', category: 'Legal', description: 'Dar início ao processo de regularização na AIMA.' },
];

export function useChecklist() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: completedItems = [], isLoading: loading } = useQuery({
        queryKey: ['user_checklists', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await (supabase as any)
                .from('user_checklists')
                .select('item_id')
                .eq('user_id', user.id)
                .eq('is_completed', true);

            if (error) throw error;
            return data.map((d: any) => d.item_id) as string[];
        },
        enabled: !!user,
    });

    const toggleItemMutation = useMutation({
        mutationFn: async ({ itemId, isCompleted }: { itemId: string; isCompleted: boolean }) => {
            if (!user) throw new Error('Auth required');

            const { error } = await (supabase as any)
                .from('user_checklists')
                .upsert({
                    user_id: user.id,
                    item_id: itemId,
                    is_completed: isCompleted,
                    completed_at: isCompleted ? new Date().toISOString() : null
                }, { onConflict: 'user_id,item_id' });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user_checklists'] });
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Erro ao salvar progresso",
                description: error.message
            });
        }
    });

    return {
        completedItems,
        loading,
        toggleItem: (itemId: string, isCompleted: boolean) => toggleItemMutation.mutateAsync({ itemId, isCompleted }),
    };
}
