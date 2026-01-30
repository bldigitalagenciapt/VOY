import { useState } from 'react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { Activity, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

export function SecurityLogs() {
    const [actionFilter, setActionFilter] = useState<string>('');
    const { logs, isLoading } = useActivityLogs({ action: actionFilter || undefined });

    const actionTypes = ['login', 'upload', 'profile_update', 'document_delete'];

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setActionFilter('')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${!actionFilter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}
                >
                    Todos
                </button>
                {actionTypes.map((action) => (
                    <button
                        key={action}
                        onClick={() => setActionFilter(action)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${actionFilter === action ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}
                    >
                        {action}
                    </button>
                ))}
            </div>

            {/* Logs List */}
            <div className="space-y-3">
                <p className="text-xs text-muted-foreground uppercase font-medium px-1">
                    {logs.length} registro(s)
                </p>
                {logs.map((log) => (
                    <div key={log.id} className="p-4 bg-card border border-border rounded-2xl">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Activity className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-bold text-sm">{log.action}</p>
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(log.created_at), 'dd/MM/yy HH:mm', { locale: ptBR })}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{log.user_email}</p>
                                {log.details && Object.keys(log.details).length > 0 && (
                                    <div className="mt-2 p-2 bg-muted rounded-lg">
                                        <pre className="text-xs overflow-x-auto">
                                            {JSON.stringify(log.details, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {logs.length === 0 && (
                    <p className="text-center py-10 text-muted-foreground text-sm">
                        Nenhum log encontrado
                    </p>
                )}
            </div>
        </div>
    );
}
