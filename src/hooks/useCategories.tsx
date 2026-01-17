import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface CustomCategory {
  id: string;
  user_id: string;
  label: string;
  icon?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export function useCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['custom_categories', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('custom_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('Error fetching categories', { error });
        throw error;
      }
      return data as CustomCategory[];
    },
    enabled: !!user,
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (label: string) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('custom_categories')
        .insert({
          user_id: user.id,
          label: label.trim(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['custom_categories', user?.id], (old: CustomCategory[] | undefined) =>
        old ? [...old, data] : [data]
      );
      toast({
        title: "Categoria criada!",
        description: `A categoria "${data.label}" foi adicionada.`,
      });
    },
    onError: () => {
      logger.error('Error adding category');
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar a categoria.",
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, label }: { id: string; label: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('custom_categories')
        .update({ label: label.trim() })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      return { id, label: label.trim() };
    },
    onSuccess: ({ id, label }) => {
      queryClient.setQueryData(['custom_categories', user?.id], (old: CustomCategory[] | undefined) =>
        old?.map(cat => cat.id === id ? { ...cat, label } : cat)
      );
      toast({
        title: "Categoria atualizada!",
      });
    },
    onError: () => {
      logger.error('Error updating category');
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar a categoria.",
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('custom_categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['custom_categories', user?.id], (old: CustomCategory[] | undefined) =>
        old?.filter(cat => cat.id !== id)
      );
      toast({
        title: "Categoria excluída",
      });
    },
    onError: () => {
      logger.error('Error deleting category');
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir a categoria.",
      });
    }
  });

  return {
    categories,
    loading,
    addCategory: (label: string) => addCategoryMutation.mutateAsync(label),
    updateCategory: (id: string, label: string) => updateCategoryMutation.mutateAsync({ id, label }),
    deleteCategory: deleteCategoryMutation.mutateAsync,
    refetch,
  };
}

