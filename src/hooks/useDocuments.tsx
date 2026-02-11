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
        // Determine file extension
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';

        // Use simplified file naming: userId/documento_${timestamp}.${extension}
        const fileName = `${user.id}/documento_${Date.now()}.${fileExt}`;

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

        // Always use voy_secure_docs bucket
        const bucket = 'voy_secure_docs';

        // STEP 1: Upload to Supabase Storage FIRST
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          // Detailed error logging as requested
          console.error('[STORAGE UPLOAD FAILED]', {
            bucket,
            fileName,
            message: uploadError.message,
            fullError: uploadError
          });
          throw uploadError;
        }

        // DOUBLE CHECK: Verify file exists after upload before DB insert
        // When checking for existence in a folder, we list the FOLDER (user.id) and look for the file
        const { data: listData, error: listError } = await supabase.storage
          .from(bucket)
          .list(user.id, {
            search: fileName.split('/').pop() // Search only for the filename part
          });

        if (listError || !listData || listData.length === 0) {
          console.error('[STORAGE VERIFICATION FAILED]', { fileName, listError });
          throw new Error('Falha ao verificar o upload do arquivo no servidor.');
        }

        // Get public URL only after successful upload and verification
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        fileUrl = publicUrl;
        fileType = contentType;
      }

      // STEP 2: Insert to database ONLY after successful upload
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
        console.error('Erro detalhado:', error.message, error.stack);
        console.error('[DATABASE INSERT FAILED]', {
          message: error.message,
          stack: error.stack,
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
    onError: (error: Error) => {
      logger.error('Error adding document', { error });
      console.error('Erro detalhado:', error.message);
      console.error('[UPLOAD_FAILED] useDocuments mutation error:', {
        message: error.message,
        fullError: error
      });
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Não foi possível fazer upload do documento.",
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

      // 1. Fetch document to get file_url
      const { data: doc, error: fetchError } = await supabase
        .schema('public')
        .from('documents')
        .select('file_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // 2. If there's a file, delete it from storage
      if (doc?.file_url) {
        try {
          const bucket = 'voy_secure_docs';

          // Parse correct path from URL, handling both root and folder paths
          // URL format: .../voy_secure_docs/path/to/file
          let filePath = '';
          const urlParts = doc.file_url.split(`/${bucket}/`);

          if (urlParts.length > 1) {
            // Decodes URI components to handle potential %20 spaces etc, though less likely with our naming
            filePath = decodeURIComponent(urlParts[1]);
          } else {
            // Fallback for older legacy URLs if format differs (unlikely given supabase getPublicUrl)
            const parts = doc.file_url.split('/');
            filePath = parts[parts.length - 1]; // Old behavior as fallback
          }

          console.log('[DELETE] Attempting to delete file path:', filePath);

          const { error: storageError } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

          if (storageError) {
            console.warn('[STORAGE_DELETE_WARNING]', storageError.message);
            // We continue even if storage delete fails to ensure DB stays in sync,
            // but we log it.
          }
        } catch (err) {
          console.error('[STORAGE_DELETE_ERROR]', err);
        }
      }

      // 3. Delete from database
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
        description: "O documento e o arquivo foram removidos permanentemente.",
      });
    },
    onError: (error: Error) => {
      logger.error('Error deleting document', { error });
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível remover o documento. Tente novamente.",
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

