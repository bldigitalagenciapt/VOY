import { Users, FileText, Upload, ClipboardList, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdminStats';
import { StatCard } from './components/StatCard';
import { GrowthChart } from './components/GrowthChart';
import { Skeleton } from '@/components/ui/skeleton';

export function Dashboard() {
    const { stats, userGrowth, uploadTrend, isLoading } = useAdminStats();

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
                <Skeleton className="h-64 rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard
                    title="Total Usuários"
                    value={stats?.total_users || 0}
                    icon={Users}
                    trend={{
                        value: stats?.new_users_week || 0,
                        isPositive: true,
                    }}
                />
                <StatCard
                    title="Documentos"
                    value={stats?.total_documents || 0}
                    icon={FileText}
                    iconColor="text-green-500"
                />
                <StatCard
                    title="Uploads Hoje"
                    value={stats?.uploads_today || 0}
                    icon={Upload}
                    iconColor="text-blue-500"
                />
                <StatCard
                    title="Processos AIMA"
                    value={stats?.active_aima_processes || 0}
                    icon={ClipboardList}
                    iconColor="text-purple-500"
                />
            </div>

            {/* New Users Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-muted rounded-xl">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Hoje</p>
                    <p className="text-lg font-bold">{stats?.new_users_today || 0}</p>
                </div>
                <div className="p-3 bg-muted rounded-xl">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Semana</p>
                    <p className="text-lg font-bold">{stats?.new_users_week || 0}</p>
                </div>
                <div className="p-3 bg-muted rounded-xl">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Mês</p>
                    <p className="text-lg font-bold">{stats?.new_users_month || 0}</p>
                </div>
            </div>

            {/* Alerts */}
            {stats && stats.suspended_users > 0 && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <div>
                        <p className="font-bold text-sm">Usuários Suspensos</p>
                        <p className="text-xs text-muted-foreground">{stats.suspended_users} usuário(s) suspenso(s)</p>
                    </div>
                </div>
            )}

            {/* Charts */}
            {userGrowth && userGrowth.length > 0 && (
                <GrowthChart
                    data={userGrowth}
                    dataKey="users"
                    title="Crescimento de Usuários (30 dias)"
                    color="#3b82f6"
                />
            )}

            {uploadTrend && uploadTrend.length > 0 && (
                <GrowthChart
                    data={uploadTrend}
                    dataKey="uploads"
                    title="Uploads de Documentos (30 dias)"
                    color="#10b981"
                />
            )}

            {/* Welcome Message */}
            <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl">
                <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Centro de Comando
                </h3>
                <p className="text-sm text-balance leading-relaxed">
                    Gerencie usuários, conteúdo e monitore o crescimento da plataforma VOY.
                </p>
            </div>
        </div>
    );
}
