import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Trophy, PartyPopper, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface CommunityCardProps {
    className?: string;
}

export function CommunityCard({ className }: CommunityCardProps) {
    const { user } = useAuth();
    const { t } = useApp();
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCount();

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
                colors: ['#0090FF', '#22C55E', '#FFFFFF']
            });
            toast.success(t('community.button')); // or a specific success toast key if preferred, but user said translate principal items
            fetchCount();
        } else {
            toast.error(t('community.error'));
        }
        setLoading(false);
    };

    return (
        <div className={cn(
            "relative overflow-hidden rounded-[2rem] bg-card border border-border p-5 text-center shadow-soft group transition-all duration-300 hover:shadow-glow",
            className
        )}>
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 blur-[80px] -mt-32" />

            <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-foreground tracking-tight">{t('community.title')}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 rounded-full border border-success/20">
                        <PartyPopper className="w-3.5 h-3.5 text-success" />
                        <span className="text-[10px] font-black text-success uppercase tracking-wider">{count} {t('community.victories')}</span>
                    </div>
                </div>

                <div className="text-left w-full">
                    <p className="text-foreground text-sm leading-relaxed">
                        <span className="font-black">{count} {t('community.delivered')}</span> {t('community.last24h')}. {t('community.next')}
                    </p>
                </div>

                <div className="w-full">
                    <Button
                        onClick={handleVictory}
                        disabled={loading}
                        size="lg"
                        className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                            <>
                                <PartyPopper className="w-6 h-6" />
                                {t('community.button')}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
