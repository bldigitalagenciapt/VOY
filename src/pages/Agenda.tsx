import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Plus,
    Clock,
    Trash2,
    Info,
    InfoIcon
} from 'lucide-react';
import { useCalendar, CalendarEvent } from '@/hooks/useCalendar';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isToday, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function Agenda() {
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { events, loading, createEvent, deleteEvent } = useCalendar(currentMonth.getFullYear());

    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newCategory, setNewCategory] = useState<'legal' | 'work' | 'health' | 'personal'>('personal');

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const selectedDateEvents = events.filter(e => isSameDay(new Date(e.event_date + 'T12:00:00'), selectedDate));

    const handleCreate = async () => {
        if (!newTitle.trim()) return;
        await createEvent({
            title: newTitle,
            description: newDesc,
            event_date: format(selectedDate, 'yyyy-MM-dd'),
            category: newCategory,
            is_holiday: false
        });
        setNewTitle('');
        setNewDesc('');
        setShowAddDialog(false);
    };

    return (
        <MobileLayout showNav={true}>
            <div className="px-5 py-6 pb-24 safe-area-top">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/home')}
                            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold">Agenda</h1>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                    </div>
                </div>

                {/* Calendar Card */}
                <Card className="p-4 rounded-[32px] border-none shadow-xl mb-8 bg-card">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="font-bold text-lg capitalize">
                            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-muted rounded-full">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-muted rounded-full">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 mb-2">
                        {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => (
                            <span key={i} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                {day}
                            </span>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, i) => {
                            const hasEvents = events.some(e => isSameDay(new Date(e.event_date + 'T12:00:00'), day));
                            const hasHoliday = events.some(e => e.is_holiday && isSameDay(new Date(e.event_date + 'T12:00:00'), day));
                            const active = isSameDay(day, selectedDate);
                            const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);

                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(day)}
                                    className={cn(
                                        "h-10 rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-90",
                                        !isCurrentMonth && "opacity-20",
                                        active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "hover:bg-muted",
                                        isToday(day) && !active && "border-2 border-primary/30"
                                    )}
                                >
                                    <span className="text-sm font-bold">{format(day, 'd')}</span>
                                    <div className="flex gap-0.5 mt-0.5">
                                        {hasHoliday && <div className={cn("w-1 h-1 rounded-full", active ? "bg-white/60" : "bg-red-400")} />}
                                        {hasEvents && !hasHoliday && <div className={cn("w-1 h-1 rounded-full", active ? "bg-white/60" : "bg-primary")} />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </Card>

                {/* Selected Day View */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">
                            {isToday(selectedDate) ? 'Hoje' : format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                        </h3>
                        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="rounded-full gap-2 px-4 shadow-lg shadow-primary/20">
                                    <Plus className="w-4 h-4" />
                                    Novo
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-[24px] max-w-[calc(100vw-2rem)]">
                                <DialogHeader>
                                    <DialogTitle>Adicionar Compromisso</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label>O que é importante?</Label>
                                        <Input
                                            placeholder="Ex: Agendamento AIMA"
                                            value={newTitle}
                                            onChange={e => setNewTitle(e.target.value)}
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Categoria</Label>
                                        <Select value={newCategory} onValueChange={(v: any) => setNewCategory(v)}>
                                            <SelectTrigger className="rounded-xl h-12">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="legal">Imigração / Legal</SelectItem>
                                                <SelectItem value="work">Trabalho</SelectItem>
                                                <SelectItem value="health">Saúde</SelectItem>
                                                <SelectItem value="personal">Pessoal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Detalhes (opcional)</Label>
                                        <Input
                                            placeholder="Local, notas..."
                                            value={newDesc}
                                            onChange={e => setNewDesc(e.target.value)}
                                            className="rounded-xl h-12"
                                        />
                                    </div>
                                    <Button onClick={handleCreate} className="w-full h-12 rounded-xl mt-4 font-bold text-lg">
                                        Salvar na Agenda
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-3">
                        {selectedDateEvents.length === 0 ? (
                            <div className="bg-muted/30 border border-dashed rounded-[24px] p-8 text-center">
                                <p className="text-muted-foreground text-sm font-medium">Sem planos para este dia ainda.</p>
                            </div>
                        ) : (
                            selectedDateEvents.map(event => (
                                <Card
                                    key={event.id}
                                    className={cn(
                                        "p-4 rounded-[24px] border-none relative overflow-hidden",
                                        event.is_holiday ? "bg-red-50 dark:bg-red-950/20" : "bg-card shadow-sm"
                                    )}
                                >
                                    <div className={cn(
                                        "absolute left-0 top-0 bottom-0 w-1.5",
                                        event.category === 'legal' ? "bg-blue-500" :
                                            event.category === 'work' ? "bg-orange-500" :
                                                event.category === 'health' ? "bg-green-500" :
                                                    event.category === 'holiday' ? "bg-red-500" : "bg-primary"
                                    )} />
                                    <div className="flex justify-between items-start pl-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-sm">{event.title}</h4>
                                                {event.is_holiday && <span className="text-[10px] font-bold text-red-500 uppercase">Feriado Nacional</span>}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{event.description || 'Consulta a tua agenda'}</p>
                                        </div>
                                        {!event.is_holiday && (
                                            <button
                                                onClick={() => deleteEvent(event.id)}
                                                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
