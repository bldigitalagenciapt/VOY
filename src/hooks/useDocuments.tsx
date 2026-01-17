import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface Document {
  id: string;
  user_id: string;
  name: string;
  category: string;
  file_url: string | null;
  file_type: string | null;
  created_at: string;
  updated_at: string;
}

export function useDocuments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['documents', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching documents', { error });
        throw error;
      }
      return data as Document[];
    },
    enabled: !!user,
  });

  const addDocumentMutation = useMutation({
    mutationFn: async ({ name, category, file }: { name: string; category: string; file?: File }) => {
      if (!user) throw new Error('Not authenticated');

      let fileUrl = null;
      let fileType = null;

      if (file) {
        const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        // Determine content type
        let contentType = file.type;
        if (!contentType || contentType === 'application/octet-stream') {
          const mimeTypes: Record<string, string> = {
            'pdf': 'application/pdf',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'webp': 'image/webp',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          };
          contentType = mimeTypes[fileExt] || 'application/octet-stream';
        }

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file, {
            contentType,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        fileUrl = publicUrl;
        fileType = contentType;
      }

      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          name,
          category,
          file_url: fileUrl,
          file_type: fileType,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['documents', user?.id], (old: Document[] | undefined) =>
        old ? [data, ...old] : [data]
      );
      toast({
        title: "Documento salvo!",
        description: "Seu documento foi adicionado com sucesso.",
      });
    },
    onError: () => {
      logger.error('Error adding document');
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível fazer upload. Verifique sua conexão.",
      });
    }
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: { name?: string; category?: string } }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { id, updates };
    },
    onSuccess: ({ id, updates }) => {
      queryClient.setQueryData(['documents', user?.id], (old: Document[] | undefined) =>
        old?.map(doc => doc.id === id ? { ...doc, ...updates } : doc)
      );
      toast({
        title: "Documento atualizado!",
        description: "As alterações foram salvas.",
      });
    },
    onError: () => {
      logger.error('Error updating document');
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Tente novamente.",
      });
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['documents', user?.id], (old: Document[] | undefined) =>
        old?.filter(doc => doc.id !== id)
      );
      toast({
        title: "Documento excluído",
        description: "O documento foi removido.",
      });
    },
    onError: () => {
      logger.error('Error deleting document');
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Tente novamente.",
      });
    }
  });

  return {
    documents,
    loading,
    addDocument: (name: string, category: string, file?: File) => addDocumentMutation.mutateAsync({ name, category, file }),
    updateDocument: (id: string, updates: { name?: string; category?: string }) => updateDocumentMutation.mutateAsync({ id, updates }),
    deleteDocument: deleteDocumentMutation.mutateAsync,
    refetch,
  };
}

