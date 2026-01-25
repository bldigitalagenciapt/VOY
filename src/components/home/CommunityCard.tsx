import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PartyPopper, Users, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

export function CommunityCard() {
    const { user } = useAuth();
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCount();

        // Realtime subscription for updates
        const channel = supabase
            .channel('aima_status_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'aima_status' }, () => {
                fetchCount();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchCount = async () => {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count, error } = await supabase
            .from('aima_status')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', twentyFourHoursAgo);

        if (!error) {
            setCount(count || 0);
        }
    };

    const handleVictory = async () => {
        if (!user) return;
        setLoading(true);

        const { error } = await supabase
            .from('aima_status')
            .insert({ user_id: user.id });

        if (!error) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#22c55e', '#3b82f6', '#f59e0b']
            });
            toast.success("Parabéns pela sua conquista! 🎉");
            fetchCount();
        } else {
            toast.error("Erro ao registrar. Tente novamente.");
        }
        setLoading(false);
    };

    return (
        <Card className="p-6 rounded-3xl border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="font-bold text-lg">Comunidade Voy</h2>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-success/10 rounded-full">
                    <PartyPopper className="w-3 h-3 text-success" />
                    <span className="text-[10px] font-bold text-success uppercase">{count} Vitórias</span>
                </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
                <span className="font-bold text-foreground">{count} títulos entregues</span> nas últimas 24h. A próxima vitória pode ser a sua!
            </p>

            <Button
                onClick={handleVictory}
                disabled={loading}
                className="w-full h-12 rounded-2xl gap-2 font-bold text-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                <PartyPopper className="w-5 h-5" />
                Recebi minha Residência! 🎉
            </Button>
        </Card>
    );
}
