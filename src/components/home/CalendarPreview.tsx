import { useNavigate } from 'react-router-dom';
import { useCalendar } from '@/hooks/useCalendar';
import { Card } from '@/components/ui/card';
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { isAfter, isToday, startOfToday, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export function CalendarPreview() {
    const navigate = useNavigate();
    const { events, loading } = useCalendar();
    const today = startOfToday();

    const upcomingEvents = events
        .filter(e => {
            const eventDate = parseISO(e.event_date);
            return isToday(eventDate) || isAfter(eventDate, today);
        })
        .slice(0, 3);

    if (loading) return null;

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    Agenda & Feriados
                </h3>
                <button
                    onClick={() => navigate('/agenda')}
                    className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                >
                    Ver tudo
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3">
                {upcomingEvents.length === 0 ? (
                    <Card className="p-4 rounded-3xl bg-muted/20 border-dashed border-2 flex flex-col items-center justify-center py-6">
                        <p className="text-xs text-muted-foreground font-medium">Nenhum compromisso próximo</p>
                    </Card>
                ) : (
                    upcomingEvents.map((event) => (
                        <div
                            key={event.id}
                            onClick={() => navigate('/agenda')}
                            className="flex items-center gap-4 p-3 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all cursor-pointer group active:scale-98"
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0",
                                event.is_holiday ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
                            )}>
                                <span className="text-[10px] font-bold uppercase leading-none opacity-70">
                                    {new Date(event.event_date + 'T12:00:00').toLocaleDateString('pt-PT', { month: 'short' }).replace('.', '')}
                                </span>
                                <span className="text-lg font-black leading-none">
                                    {new Date(event.event_date + 'T12:00:00').getDate()}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                                    {event.title}
                                </h4>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                    {event.is_holiday ? 'Feriado Nacional' : event.category}
                                </p>
                            </div>

                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-30" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
