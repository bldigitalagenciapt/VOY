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

      // Debugging connection as requested
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      console.log(`[DEBUG] Attempting fetch to: ${baseUrl}/rest/v1/documents?user_id=eq.${user.id}`);

      const { data, error } = await supabase
        .schema('public')
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
    mutationFn: async ({ name, category, file, isSecure = false }: { name: string; category: string; file?: File, isSecure?: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      let fileUrl = null;
      let fileType = null;

      if (file) {
        // Construct the file path as requested: userId/filename
        const fileName = `${user.id}/${file.name}`;

        // Determine content type
        const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
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

        const bucket = isSecure ? 'secure_documents' : 'documents';

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            contentType,
            upsert: true, // Use upsert to allow re-uploading the same file
          });

        if (uploadError) {
          // Log error as requested to debug 403 or bucket issues
          console.error(`[CRITICAL] Supabase Storage Error!`, {
            bucket,
            fileName,
            error: uploadError.message,
            tip: "Certifique-se de que os buckets 'documents' e 'secure_documents' foram criados no SQL Editor.",
            fullError: uploadError
          });
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        fileUrl = publicUrl;
        fileType = contentType;
      }

      const { data, error } = await supabase
        .schema('public')
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

      if (error) {
        console.error('[DATABASE] Error inserting document record:', {
          message: error.message,
          hint: error.hint,
          details: error.details,
          fullError: error
        });
        throw error;
      }
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
    onError: (error: any) => {
      logger.error('Error adding document', { error });
      console.error('[UPLOAD_FAILED] useDocuments mutation error:', {
        message: error.message,
        hint: error.hint,
        details: error.details,
        fullError: error
      });
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message?.includes('bucket')
          ? "Erro de configuração: Bucket não encontrado."
          : "Não foi possível fazer upload. Verifique sua conexão.",
      });
    }
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: { name?: string; category?: string } }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .schema('public')
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
        .schema('public')
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
    addDocument: (name: string, category: string, file?: File, isSecure?: boolean) => addDocumentMutation.mutateAsync({ name, category, file, isSecure }),
    updateDocument: (id: string, updates: { name?: string; category?: string }) => updateDocumentMutation.mutateAsync({ id, updates }),
    deleteDocument: deleteDocumentMutation.mutateAsync,
    refetch,
  };
}

