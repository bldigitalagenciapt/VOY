import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { encryptData, decryptData } from '@/lib/crypto';

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
  is_admin?: boolean;
  custom_quick_access?: { id: string; label: string; value: string }[] | null;
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

      if (data) {
        // cast to any to allow accessing fields not yet in types.ts (like avatar_url)
        const decryptedDoc = { ...data } as any;
        const sensitiveFields = ['nif', 'niss', 'sns', 'passport'] as const;

        for (const field of sensitiveFields) {
          if (decryptedDoc[field]) {
            decryptedDoc[field] = await decryptData(decryptedDoc[field] as string, user.id);
          }
        }

        // Generate signed URL for avatar if it exists
        let signedAvatarUrl = null;
        if (decryptedDoc.avatar_url) {
          try {
            const bucket = 'voy_secure_docs';
            let filePath = '';

            if (decryptedDoc.avatar_url.includes(`/${bucket}/`)) {
              filePath = decodeURIComponent(decryptedDoc.avatar_url.split(`/${bucket}/`)[1]);
            } else {
              const urlParts = decryptedDoc.avatar_url.split('/');
              filePath = urlParts[urlParts.length - 1];
            }

            const { data: signedData, error: signedError } = await supabase.storage
              .from(bucket)
              .createSignedUrl(filePath, 3600);

            if (!signedError && signedData) {
              signedAvatarUrl = signedData.signedUrl;
            }
          } catch (err) {
            console.error('Error signing avatar URL:', err);
          }
        }

        return { ...decryptedDoc, signedAvatarUrl } as unknown as Profile & { signedAvatarUrl?: string | null };
      }
      return null;
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('Not authenticated');

      const encryptedUpdates = { ...updates } as any;
      const sensitiveFields = ['nif', 'niss', 'sns', 'passport'] as const;

      for (const field of sensitiveFields) {
        if (encryptedUpdates[field]) {
          encryptedUpdates[field] = await encryptData(encryptedUpdates[field] as string, user.id);
        }
      }

      const { error } = await supabase
        .schema('public')
        .from('profiles')
        .upsert({
          ...encryptedUpdates,
          user_id: user.id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

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

