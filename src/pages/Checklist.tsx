import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    ChevronLeft,
    CheckCircle2,
    Circle,
    Info,
    Rocket,
    ArrowRight
} from 'lucide-react';
import { useChecklist, CHECKLIST_ITEMS } from '@/hooks/useChecklist';
import { cn } from '@/lib/utils';

export default function Checklist() {
    const navigate = useNavigate();
    const { completedItems, loading, toggleItem } = useChecklist();

    const total = CHECKLIST_ITEMS.length;
    const completedCount = completedItems.length;
    const progressPercent = Math.round((completedCount / total) * 100);

    return (
        <MobileLayout showNav={true}>
            <div className="px-5 py-6 pb-24 safe-area-top">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/home')}
                        className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold">Guia de Chegada</h1>
                </div>

                {/* Hero Progress Card */}
                <Card className="p-6 rounded-[32px] border-none bg-primary text-primary-foreground shadow-xl shadow-primary/20 mb-8 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-wider mb-1">O seu progresso</p>
                                <h2 className="text-3xl font-black">{progressPercent}%</h2>
                            </div>
                            <Rocket className="w-10 h-10 opacity-20" />
                        </div>
                        <Progress value={progressPercent} className="h-2 bg-white/20" />
                        <p className="mt-4 text-[10px] font-medium opacity-80 leading-relaxed italic">
                            {completedCount === total
                                ? 'Parabéns! Completou todos os passos essenciais. 🇵🇹🎉'
                                : `${completedCount} de ${total} tarefas concluídas. Passo a passo rumo à sua nova vida.`}
                        </p>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                </Card>

                {/* Tasks List */}
                <div className="space-y-4">
                    {CHECKLIST_ITEMS.map((item) => {
                        const isDone = completedItems.includes(item.id);

                        return (
                            <button
                                key={item.id}
                                onClick={() => toggleItem(item.id, !isDone)}
                                className={cn(
                                    "w-full flex items-start gap-4 p-5 rounded-[28px] border transition-all text-left group",
                                    isDone
                                        ? "bg-primary/5 border-primary/20"
                                        : "bg-card border-border/50 hover:border-primary/30"
                                )}
                            >
                                <div className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                    isDone ? "bg-primary text-white" : "border-2 border-muted-foreground/30 text-transparent"
                                )}>
                                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={cn(
                                            "text-sm font-bold transition-all",
                                            isDone ? "text-primary line-through opacity-70" : "text-foreground"
                                        )}>
                                            {item.label}
                                        </span>
                                        <span className={cn(
                                            "text-[8px] font-bold uppercase px-2 py-0.5 rounded-full",
                                            isDone ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                        )}>
                                            {item.category}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-[10px] leading-relaxed",
                                        isDone ? "text-muted-foreground/50" : "text-muted-foreground"
                                    )}>
                                        {item.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Pro Tip */}
                <div className="mt-8 p-4 bg-muted/30 rounded-3xl flex gap-3 items-center border border-border/50">
                    <Info className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Dica VOY: Comece pelo NIF. Quase todos os outros passos dependem dele para serem concluídos.
                    </p>
                </div>
            </div>
        </MobileLayout>
    );
}
