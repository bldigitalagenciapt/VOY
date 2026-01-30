import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Mail, Megaphone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export function Communication() {
    const queryClient = useQueryClient();
    const [notificationForm, setNotificationForm] = useState({ title: '', message: '' });
    const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });

    const sendNotificationMutation = useMutation({
        mutationFn: async (data: { title: string; message: string }) => {
            const { error } = await supabase.from('system_notifications').insert({
                title: data.title,
                message: data.message,
                type: 'info',
                target_users: [], // Empty = all users
            });
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Notificação enviada para todos os usuários!');
            setNotificationForm({ title: '', message: '' });
        },
    });

    const createAnnouncementMutation = useMutation({
        mutationFn: async (data: { title: string; content: string }) => {
            const { error } = await supabase.from('announcements').insert({
                title: data.title,
                content: data.content,
                type: 'banner',
                priority: 'normal',
            });
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Anúncio criado!');
            setAnnouncementForm({ title: '', content: '' });
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        },
    });

    const { data: announcements = [] } = useQuery({
        queryKey: ['announcements'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);
            if (error) throw error;
            return data;
        },
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Send Notification */}
            <div className="p-5 bg-card border border-border rounded-3xl space-y-4">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">Enviar Notificação</h3>
                </div>
                <div className="space-y-3">
                    <Input
                        placeholder="Título da notificação"
                        value={notificationForm.title}
                        onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                        className="h-12 rounded-xl"
                    />
                    <Textarea
                        placeholder="Mensagem..."
                        value={notificationForm.message}
                        onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                        className="rounded-xl"
                        rows={3}
                    />
                    <Button
                        onClick={() => sendNotificationMutation.mutate(notificationForm)}
                        disabled={!notificationForm.title || !notificationForm.message}
                        className="w-full h-12 rounded-xl font-bold"
                    >
                        <Send className="w-5 h-5 mr-2" />
                        Enviar para Todos
                    </Button>
                </div>
            </div>

            {/* Create Announcement */}
            <div className="p-5 bg-card border border-border rounded-3xl space-y-4">
                <div className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">Criar Anúncio</h3>
                </div>
                <div className="space-y-3">
                    <Input
                        placeholder="Título do anúncio"
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                        className="h-12 rounded-xl"
                    />
                    <Textarea
                        placeholder="Conteúdo do anúncio..."
                        value={announcementForm.content}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                        className="rounded-xl"
                        rows={3}
                    />
                    <Button
                        onClick={() => createAnnouncementMutation.mutate(announcementForm)}
                        disabled={!announcementForm.title || !announcementForm.content}
                        className="w-full h-12 rounded-xl font-bold"
                    >
                        <Megaphone className="w-5 h-5 mr-2" />
                        Publicar Anúncio
                    </Button>
                </div>
            </div>

            {/* Active Announcements */}
            {announcements.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-bold px-1 uppercase text-xs text-muted-foreground tracking-widest">
                        Anúncios Ativos
                    </h3>
                    {announcements.map((announcement: any) => (
                        <div key={announcement.id} className="p-4 bg-card border border-border rounded-2xl">
                            <p className="font-bold">{announcement.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
