import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminStats {
    total_users: number;
    new_users_today: number;
    new_users_week: number;
    new_users_month: number;
    total_documents: number;
    uploads_today: number;
    active_aima_processes: number;
    suspended_users: number;
}

export interface UserGrowthData {
    date: string;
    users: number;
}

export function useAdminStats() {
    const { data: stats, isLoading, refetch } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const { data, error } = await supabase.rpc('get_admin_stats');
            if (error) throw error;
            return data as AdminStats;
        },
    });

    const { data: userGrowth } = useQuery({
        queryKey: ['user-growth'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('created_at')
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Group by date
            const grouped = data.reduce((acc: Record<string, number>, item) => {
                const date = new Date(item.created_at).toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});

            // Convert to array and fill missing dates
            const result: UserGrowthData[] = [];
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            let cumulativeUsers = 0;

            for (let i = 0; i < 30; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                cumulativeUsers += grouped[dateStr] || 0;
                result.push({
                    date: dateStr,
                    users: cumulativeUsers,
                });
            }

            return result;
        },
    });

    const { data: uploadTrend } = useQuery({
        queryKey: ['upload-trend'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('documents')
                .select('created_at')
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Group by date
            const grouped = data.reduce((acc: Record<string, number>, item) => {
                const date = new Date(item.created_at).toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});

            // Convert to array
            const result: { date: string; uploads: number }[] = [];
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            for (let i = 0; i < 30; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                result.push({
                    date: dateStr,
                    uploads: grouped[dateStr] || 0,
                });
            }

            return result;
        },
    });

    return {
        stats,
        userGrowth,
        uploadTrend,
        isLoading,
        refetch,
    };
}
