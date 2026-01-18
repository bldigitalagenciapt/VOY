import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';
import { logger } from '@/lib/logger';

export interface ImportantDate {
  label: string;
  date: string;
}

export interface AimaProcess {
  id: string;
  user_id: string;
  process_type: string | null;
  completed_steps: string[];
  important_dates: ImportantDate[];
  protocols: string[];
  notes: string | null;
  step: number;
  created_at: string;
  updated_at: string;
}

export function useAimaProcess() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const parseImportantDates = (data: Json | null): ImportantDate[] => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(item => {
      if (typeof item === 'object' && item !== null && 'label' in item && 'date' in item) {
        return { label: String(item.label), date: String(item.date) };
      }
      return { label: '', date: '' };
    }).filter(d => d.label && d.date);
  };

  const { data: process = null, isLoading: loading, refetch } = useQuery({
    queryKey: ['aima_process', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .schema('public')
        .from('aima_processes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        logger.error('Error fetching AIMA process', { error });
        console.error('Error fetching AIMA process:', {
          message: error.message,
          hint: (error as any).hint,
          details: (error as any).details,
          fullError: error
        });
        throw error;
      }

      if (data) {
        return {
          ...data,
          completed_steps: data.completed_steps || [],
          important_dates: parseImportantDates(data.important_dates),
          protocols: data.protocols || [],
          step: (data.completed_steps?.length || 0) + 1,
        } as AimaProcess;
      }
      return null;
    },
    enabled: !!user,
  });

  const calculateStep = (completedHelper: string[]) => (completedHelper?.length || 0) + 1;

  const mutation = useMutation({
    mutationFn: async (updates: Partial<AimaProcess>) => {
      if (!user) throw new Error('Not authenticated');

      const dbUpdates = {
        process_type: updates.process_type,
        completed_steps: updates.completed_steps,
        important_dates: updates.important_dates as unknown as Json,
        protocols: updates.protocols,
        notes: updates.notes,
      };

      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key as keyof typeof dbUpdates] === undefined) {
          delete dbUpdates[key as keyof typeof dbUpdates];
        }
      });

      if (process) {
        const { error } = await supabase
          .schema('public')
          .from('aima_processes')
          .update(dbUpdates)
          .eq('user_id', user.id);
        if (error) {
          console.error('Error updating AIMA process:', {
            message: error.message,
            hint: error.hint,
            details: error.details,
            fullError: error
          });
          throw error;
        }
      } else {
        const { data, error } = await supabase
          .schema('public')
          .from('aima_processes')
          .insert({
            user_id: user.id,
            process_type: updates.process_type || null,
            completed_steps: updates.completed_steps || [],
            important_dates: (updates.important_dates || []) as unknown as Json,
            protocols: updates.protocols || [],
            notes: updates.notes || null,
          })
          .select()
          .single();
        if (error) {
          console.error('Error inserting AIMA process:', {
            message: error.message,
            hint: (error as any).hint,
            details: (error as any).details,
            fullError: error
          });
          throw error;
        }
        return data;
      }
      return updates;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['aima_process', user?.id] });
      toast({
        title: "Informações salvas!",
        description: "Seu processo foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      logger.error('Error updating AIMA process', { error });
      console.error('useAimaProcess mutation error:', {
        message: error.message,
        hint: error.hint,
        fullError: error
      });
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Tente novamente.",
      });
    }
  });

  const selectProcessType = async (type: string) => {
    return mutation.mutateAsync({
      process_type: type as any,
      completed_steps: [],
      important_dates: [],
      protocols: [],
    });
  };

  const toggleStep = async (stepId: string) => {
    if (!process) return;
    const currentSteps = process.completed_steps || [];
    const newSteps = currentSteps.includes(stepId)
      ? currentSteps.filter(s => s !== stepId)
      : [...currentSteps, stepId];
    return mutation.mutateAsync({ completed_steps: newSteps });
  };

  const addDate = async (date: ImportantDate) => {
    if (!process) return;
    const newDates = [...(process.important_dates || []), date];
    return mutation.mutateAsync({ important_dates: newDates });
  };

  const addProtocol = async (protocol: string) => {
    if (!process) return;
    const newProtocols = [...(process.protocols || []), protocol];
    return mutation.mutateAsync({ protocols: newProtocols });
  };

  const clearProcess = async () => {
    return mutation.mutateAsync({
      process_type: null,
      completed_steps: [],
      important_dates: [],
      protocols: [],
    });
  };

  return {
    process,
    loading,
    selectProcessType,
    toggleStep,
    addDate,
    addProtocol,
    clearProcess,
    updateProcess: (updates: Partial<AimaProcess>) => mutation.mutateAsync(updates),
    refetch,
  };
}

