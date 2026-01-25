import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { getPortugalHolidays, Holiday } from '@/lib/holidays';
import { format, getYear } from 'date-fns';

export interface CalendarEvent {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    event_date: string;
    category: 'legal' | 'work' | 'health' | 'personal' | 'holiday';
    is_holiday: boolean;
}

export function useCalendar(selectedYear = getYear(new Date())) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: userEvents = [], isLoading: loading } = useQuery({
        queryKey: ['calendar_events', user?.id, selectedYear],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('calendar_events')
                .select('*')
                .eq('user_id', user?.id)
                .gte('event_date', `${selectedYear}-01-01`)
                .lte('event_date', `${selectedYear}-12-31`);

            if (error) throw error;
            return data as CalendarEvent[];
        },
        enabled: !!user,
    });

    const holidays = getPortugalHolidays(selectedYear).map(h => ({
        id: `holiday-${h.date.toISOString()}`,
        user_id: 'system',
        title: h.name_pt,
        description: '',
        event_date: format(h.date, 'yyyy-MM-dd'),
        category: 'holiday' as const,
        is_holiday: true
    }));

    const allEvents = [...userEvents, ...holidays].sort((a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    );

    const createEventMutation = useMutation({
        mutationFn: async (event: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at'>) => {
            if (!user) throw new Error('Auth required');
            const { data, error } = await (supabase as any)
                .from('calendar_events')
                .insert({
                    ...event,
                    user_id: user.id
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
            toast({ title: "Evento adicionado!", description: "A sua agenda foi atualizada." });
        },
    });

    const deleteEventMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase as any)
                .from('calendar_events')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
            toast({ title: "Evento removido" });
        },
    });

    return {
        events: allEvents,
        loading,
        createEvent: createEventMutation.mutateAsync,
        deleteEvent: deleteEventMutation.mutateAsync,
        isCreating: createEventMutation.isPending
    };
}
