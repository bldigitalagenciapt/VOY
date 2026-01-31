import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Bell, ChevronLeft, Info, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning';
    created_at: string;
    is_read: boolean;
}

export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data, error } = await (supabase as any)
                .from('system_notifications')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setNotifications(data as Notification[]);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-5 h-5 text-success" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-warning" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <MobileLayout>
            <div className="pb-32 pt-8 px-6 bg-background min-h-screen">
                <header className="flex items-center gap-4 mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center text-foreground shadow-soft hover:bg-muted/50 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-black text-foreground">Notificações</h1>
                </header>

                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className="p-6 rounded-3xl bg-card border border-border shadow-soft space-y-3 relative overflow-hidden group transition-all hover:shadow-glow"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center">
                                            {getTypeIcon(notif.type)}
                                        </div>
                                        <h3 className="font-bold text-foreground leading-tight">{notif.title}</h3>
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 flex-shrink-0">
                                        {format(new Date(notif.created_at), "dd MMM", { locale: ptBR })}
                                    </span>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                                    {notif.message}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-card rounded-[2.5rem] border border-border px-6">
                            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                                <Bell className="w-10 h-10 text-muted-foreground opacity-20" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Nenhuma notificação</h3>
                            <p className="text-sm text-muted-foreground mt-2 max-w-[240px] mx-auto leading-relaxed">
                                Quando o administrador enviar avisos importantes para você, eles aparecerão aqui.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </MobileLayout>
    );
}
