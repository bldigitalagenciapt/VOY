import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface Profile {
  id: string;
  user_id: string;
  language: string;
  user_profile: string | null;
  nif: string | null;
  niss: string | null;
  sns: string | null;
  passport: string | null;
  notifications_enabled: boolean;
  biometric_enabled: boolean;
  theme: string;
  display_name?: string | null;
  avatar_url?: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: loading, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .schema('public')
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        logger.error('Error fetching profile', { error });
        throw error;
      }
      return data as Profile;
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .schema('public')
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
      return updates;
    },
    onSuccess: (updates) => {
      queryClient.setQueryData(['profile', user?.id], (old: Profile | null) =>
        old ? { ...old, ...updates } : null
      );
      toast({
        title: "Salvo com sucesso!",
        description: "Suas informações foram atualizadas.",
      });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Tente novamente.",
      });
    }
  });

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      await updateProfileMutation.mutateAsync(updates);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateNumber = async (field: 'nif' | 'niss' | 'sns' | 'passport', value: string) => {
    return updateProfile({ [field]: value });
  };

  return {
    profile,
    loading,
    updateProfile,
    updateNumber,
    refetch,
    isUpdating: updateProfileMutation.isPending,
  };
}

