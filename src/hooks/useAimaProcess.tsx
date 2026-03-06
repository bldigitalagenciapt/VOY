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

export interface Step {
  id: string;
  title: string;
  description: string;
  voyTip: string;
  documents: string[];
  actionLink?: string;
  cost: string;
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
          error
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aima_process', user?.id] });
      toast({
        title: "Informações salvas!",
        description: "Seu processo foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      logger.error('Error updating AIMA process', { error });
      console.error('useAimaProcess mutation error:', {
        message: error.message,
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
      process_type: type,
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

  const getStepsForProcess = (type: string | null): Step[] => {
    if (!type) return [];

    const steps: Record<string, Step[]> = {
      cplp: [
        {
          id: 'nif',
          title: 'Obter NIF',
          description: 'Número de Identificação Fiscal essencial para viver em Portugal.',
          voyTip: 'Pode ser pedido presencialmente nas Finanças ou online através de representantes.',
          documents: ['Passaporte', 'Comprovativo de Morada (Origem ou PT)'],
          actionLink: 'https://www.portaldasfinancas.gov.pt/',
          cost: 'Gratuito (no balcão)'
        },
        {
          id: 'niss',
          title: 'Obter NISS',
          description: 'Número de Identificação de Segurança Social.',
          voyTip: 'O NISS na hora agora pode ser pedido online pelo portal da Segurança Social Direta.',
          documents: ['Passaporte', 'NIF'],
          actionLink: 'https://www.seg-social.pt/pedido-de-formulario-niss-na-hora',
          cost: 'Gratuito'
        },
        {
          id: 'junta',
          title: 'Atestado da Junta',
          description: 'Comprovativo de morada oficial da sua freguesia.',
          voyTip: 'Precisa de 2 testemunhas que morem na mesma freguesia (algumas juntas aceitam contrato de arrendamento).',
          documents: ['Passaporte', 'NIF', '2 Testemunhas ou Contrato'],
          cost: '€5 - €10'
        },
        {
          id: 'manifestacao',
          title: 'Certificado CPLP',
          description: 'Pedido do Título de Residência Digital no portal da AIMA.',
          voyTip: 'Verifique se seus dados estão corretos antes de submeter.',
          documents: ['NIF', 'NISS', 'Passaporte'],
          actionLink: 'https://aima.gov.pt/',
          cost: '€15'
        }
      ],
      visto: [
        {
          id: 'entrada',
          title: 'Entrada Legal',
          description: 'Garantir que sua entrada em Portugal foi registrada corretamente.',
          voyTip: 'Se entrou por outro país do Espaço Schengen, tem 3 dias úteis para declarar entrada na AIMA.',
          documents: ['Passaporte com carimbo', 'Declaração de Entrada se aplicável'],
          cost: 'Gratuito'
        },
        {
          id: 'nif',
          title: 'NIF e NISS',
          description: 'Obter os números básicos de identificação.',
          voyTip: 'Como você já tem visto, o processo é mais rápido.',
          documents: ['Visto', 'Passaporte', 'Morada'],
          cost: 'Gratuito'
        },
        {
          id: 'agendamento',
          title: 'Agendamento AIMA',
          description: 'Comparecer ao agendamento marcado no seu visto.',
          voyTip: 'Leve todos os documentos originais e cópias.',
          documents: ['Checklist do Visto', 'Fotos', 'Seguro Saúde'],
          cost: 'Varie consoante o visto'
        }
      ],
      familiar: [
        {
          id: 'agrupamento',
          title: 'Pedido de Reagrupamento',
          description: 'Solicitar o direito de trazer sua família.',
          voyTip: 'Pode ser feito em simultâneo com o seu pedido em alguns casos.',
          documents: ['Certidões Apostiladas', 'Prova de Meios', 'Alojamento'],
          cost: '€80 - €150'
        }
      ]
    };

    return steps[type] || [];
  };

  const steps = getStepsForProcess(process?.process_type || null);

  return {
    process,
    loading,
    steps,
    selectProcessType,
    toggleStep,
    addDate,
    addProtocol,
    clearProcess,
    updateProcess: (updates: Partial<AimaProcess>) => mutation.mutateAsync(updates),
    refetch,
  };
}

