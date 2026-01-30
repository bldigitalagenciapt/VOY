import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLog {
    id: string;
    user_id: string;
    action: string;
    details: Record<string, any>;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    user_email?: string;
}

export function useActivityLogs(filters?: {
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
}) {
    const { data: logs = [], isLoading, refetch } = useQuery({
        queryKey: ['activity-logs', filters],
        queryFn: async () => {
            let query = supabase
                .from('activity_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (filters?.action) {
                query = query.eq('action', filters.action);
            }

            if (filters?.userId) {
                query = query.eq('user_id', filters.userId);
            }

            if (filters?.startDate) {
                query = query.gte('created_at', filters.startDate);
            }

            if (filters?.endDate) {
                query = query.lte('created_at', filters.endDate);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Get user emails
            const { data: authData } = await supabase.auth.admin.listUsers();

            return data.map(log => ({
                ...log,
                user_email: authData?.users.find(u => u.id === log.user_id)?.email || 'N/A',
            })) as ActivityLog[];
        },
    });

    return {
        logs,
        isLoading,
        refetch,
    };
}
