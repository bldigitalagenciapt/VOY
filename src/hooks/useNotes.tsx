import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  category: string | null;
  is_important: boolean;
  reminder_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useNotes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['notes', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('is_important', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching notes', { error });
        throw error;
      }
      return data as Note[];
    },
    enabled: !!user,
  });

  const addNoteMutation = useMutation({
    mutationFn: async (note: {
      title: string;
      content?: string;
      category?: string;
      is_important?: boolean;
      reminder_date?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: note.title,
          content: note.content || null,
          category: note.category || null,
          is_important: note.is_important || false,
          reminder_date: note.reminder_date || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['notes', user?.id], (old: Note[] | undefined) =>
        old ? [data, ...old] : [data]
      );
      toast({
        title: "Anotação salva!",
        description: "Sua nota foi criada com sucesso.",
      });
    },
    onError: () => {
      logger.error('Error adding note');
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Tente novamente.",
      });
    }
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Note> }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { id, updates };
    },
    onSuccess: ({ id, updates }) => {
      queryClient.setQueryData(['notes', user?.id], (old: Note[] | undefined) =>
        old?.map(note => note.id === id ? { ...note, ...updates } : note)
      );
      toast({
        title: "Anotação atualizada!",
        description: "As alterações foram salvas.",
      });
    },
    onError: () => {
      logger.error('Error updating note');
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Tente novamente.",
      });
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['notes', user?.id], (old: Note[] | undefined) =>
        old?.filter(note => note.id !== id)
      );
      toast({
        title: "Anotação excluída",
        description: "A nota foi removida.",
      });
    },
    onError: () => {
      logger.error('Error deleting note');
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Tente novamente.",
      });
    }
  });

  const toggleImportant = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      return updateNoteMutation.mutateAsync({ id, updates: { is_important: !note.is_important } });
    }
  };

  return {
    notes,
    loading,
    addNote: addNoteMutation.mutateAsync,
    updateNote: (id: string, updates: Partial<Note>) => updateNoteMutation.mutateAsync({ id, updates }),
    deleteNote: deleteNoteMutation.mutateAsync,
    toggleImportant,
    refetch,
  };
}

