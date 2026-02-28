import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
    ChevronLeft, 
    Plus, 
    TrendingUp, 
    TrendingDown, 
    Wallet, 
    Trash2, 
    Loader2, 
    ArrowUpCircle, 
    ArrowDownCircle, 
    PieChart as PieChartIcon,
    Calendar as CalendarIcon,
    Bell,
    CheckCircle2,
    Clock,
    AlertCircle,
    Repeat
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Transaction {
    id: string;
    valor: number;
    categoria: string;
    tipo: 'entrada' | 'saida';
    data: string;
    due_date?: string;
    is_recurring?: boolean;
    status?: 'pago' | 'pendente';
}

const EXPENSE_CATEGORIES = [
    'Aluguer', 'Mercado', 'Transporte', 'Lazer', 'Remessas', 'Saúde', 'Educação', 'Outros'
];

const INCOME_CATEGORIES = [
    'Salário', 'Freelance', 'Venda', 'Prémio', 'Outros'
];

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899', '#64748b'];

export default function MeuBolso() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);

    // New transaction state
    const [newVal, setNewVal] = useState('');
    const [newCat, setNewCat] = useState('Outros');
    const [newTipo, setNewTipo] = useState<'entrada' | 'saida'>('saida');
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [isRecurring, setIsRecurring] = useState(false);
    const [isPending, setIsPending] = useState(false);

    // Reset category when switching type to avoid invalid selections
    const handleTipoChange = (tipo: 'entrada' | 'saida') => {
        setNewTipo(tipo);
        setNewCat('Outros');
    };

    useEffect(() => {
        if (user) fetchTransactions();
    }, [user]);

    const fetchTransactions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('data', { ascending: false });

        if (!error && data) {
            setTransactions(data as any);
        }
        setLoading(false);
    };

    const handleAdd = async () => {
        if (!user || !newVal) return;
        setSaving(true);
        const { error } = await supabase
            .from('transactions')
            .insert({
                user_id: user.id,
                valor: parseFloat(newVal),
                categoria: newCat,
                tipo: newTipo,
                data: new Date().toISOString(),
                due_date: dueDate ? dueDate.toISOString() : null,
                is_recurring: isRecurring,
                status: isPending ? 'pendente' : 'pago'
            });

        if (!error) {
            toast.success("Transação adicionada!");
            fetchTransactions();
            setShowAddDialog(false);
            setNewVal('');
            setNewCat('Outros');
            setDueDate(undefined);
            setIsRecurring(false);
            setIsPending(false);
        } else {
            toast.error("Erro ao salvar.");
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (!error) {
            toast.success("Removido");
            setTransactions(prev => prev.filter(t => t.id !== id));
        }
    };

    const handleToggleStatus = async (transaction: Transaction) => {
        const newStatus = transaction.status === 'pago' ? 'pendente' : 'pago';
        const { error } = await supabase
            .from('transactions')
            .update({ status: newStatus })
            .eq('id', transaction.id);

        if (!error) {
            toast.success(newStatus === 'pago' ? "Marcado como pago" : "Marcado como pendente");
            setTransactions(prev => prev.map(t => t.id === transaction.id ? { ...t, status: newStatus } : t));
        }
    };

    const totals = transactions.reduce((acc, t) => {
        if (t.tipo === 'entrada') acc.entrada += Number(t.valor);
        else acc.saida += Number(t.valor);
        return acc;
    }, { entrada: 0, saida: 0 });

    const saldo = totals.entrada - totals.saida;

    const chartData = EXPENSE_CATEGORIES.map(cat => ({
        name: cat,
        value: transactions
            .filter(t => t.categoria === cat && t.tipo === 'saida' && t.status !== 'pendente') // Only show paid or non-status expenses in chart
            .reduce((sum, t) => sum + Number(t.valor), 0)
    })).filter(d => d.value > 0);

    const pendingTransactions = transactions.filter(t => t.status === 'pendente');
    const upcomingExpenses = pendingTransactions.filter(t => {
        if (!t.due_date) return false;
        const due = new Date(t.due_date);
        const today = new Date();
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 5; // Alert for next 5 days
    });

    return (
        <MobileLayout showNav={false}>
            <div className="px-5 py-6 safe-area-top pb-24">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-foreground">Meu Bolso</h1>
                </div>

                {/* Alerts Section */}
                {upcomingExpenses.length > 0 && (
                    <div className="mb-6 space-y-3">
                        {upcomingExpenses.map(expense => {
                            const isOverdue = new Date(expense.due_date!) < new Date();
                            return (
                                <Alert key={expense.id} variant={isOverdue ? "destructive" : "default"} className="rounded-2xl border-none bg-opacity-10 bg-current">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                            isOverdue ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                                        )}>
                                            {isOverdue ? <AlertCircle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                        </div>
                                        <AlertDescription className="flex-1 text-xs font-medium">
                                            <span className="font-bold block text-sm">
                                                {isOverdue ? 'Atrasado: ' : 'Vencendo logo: '} {expense.categoria}
                                            </span>
                                            Vencimento: {format(new Date(expense.due_date!), "dd 'de' MMMM", { locale: ptBR })}
                                        </AlertDescription>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 rounded-lg text-[10px] font-bold"
                                            onClick={() => handleToggleStatus(expense)}
                                        >
                                            Pagar
                                        </Button>
                                    </div>
                                </Alert>
                            );
                        })}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                    <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 border-none shadow-xl shadow-primary/20 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium opacity-80">Saldo Atual</span>
                            <Wallet className="w-5 h-5 opacity-80" />
                        </div>
                        <div className="text-3xl font-bold">€ {saldo.toFixed(2)}</div>
                        {pendingTransactions.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] opacity-90">
                                <span>Comprometido (Pendentes):</span>
                                <span className="font-bold">€ {pendingTransactions.reduce((acc, t) => acc + Number(t.valor), 0).toFixed(2)}</span>
                            </div>
                        )}
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4 bg-success/10 border-success/20">
                            <div className="flex items-center gap-2 mb-1">
                                <ArrowUpCircle className="w-4 h-4 text-success" />
                                <span className="text-xs font-medium text-success uppercase">Entradas</span>
                            </div>
                            <div className="text-lg font-bold text-success">€ {totals.entrada.toFixed(2)}</div>
                        </Card>
                        <Card className="p-4 bg-destructive/10 border-destructive/20">
                            <div className="flex items-center gap-2 mb-1">
                                <ArrowDownCircle className="w-4 h-4 text-destructive" />
                                <span className="text-xs font-medium text-destructive uppercase">Saídas</span>
                            </div>
                            <div className="text-lg font-bold text-destructive">€ {totals.saida.toFixed(2)}</div>
                        </Card>
                    </div>
                </div>

                {/* Chart Section */}
                {chartData.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">
                            Despesas por Categoria
                        </h2>
                        <Card className="p-4 rounded-3xl h-64 border-none bg-muted/30">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'hsl(var(--card))', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ fontSize: '12px' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>
                )}

                {/* Transactions List */}
                <div>
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 px-1">
                        Últimas Transações
                    </h2>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                        ) : transactions.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">Nenhuma transação registrada.</p>
                        ) : (
                            transactions.map((t) => (
                                <div key={t.id} className="flex items-center gap-4 p-4 bg-card border rounded-2xl group active:scale-95 transition-all">
                                    <div 
                                        onClick={() => handleToggleStatus(t)}
                                        className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-110",
                                        t.status === 'pendente' ? "bg-muted text-muted-foreground" : (t.tipo === 'entrada' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")
                                    )}>
                                        {t.status === 'pendente' ? <Clock className="w-5 h-5" /> : (t.tipo === 'entrada' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-sm">{t.categoria}</p>
                                            {t.is_recurring && <Repeat className="w-3 h-3 text-primary" />}
                                            {t.status === 'pendente' && <Badge variant="outline" className="text-[8px] h-4 py-0 border-destructive/30 text-destructive bg-destructive/5">Pendente</Badge>}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            {new Date(t.data).toLocaleDateString('pt-BR')}
                                            {t.due_date && (
                                                <span className="flex items-center gap-1 before:content-['•'] before:mx-1">
                                                    Vence {format(new Date(t.due_date), "dd/MM")}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className={cn("font-bold text-sm text-right", t.status === 'pendente' ? "text-muted-foreground" : (t.tipo === 'entrada' ? "text-success" : "text-destructive"))}>
                                        <p>{t.tipo === 'entrada' ? '+' : '-'} € {Number(t.valor).toFixed(2)}</p>
                                        {t.status === 'pendente' && <p className="text-[10px] font-normal underline cursor-pointer" onClick={() => handleToggleStatus(t)}>Marcar pago</p>}
                                    </div>
                                    <button onClick={() => handleDelete(t.id)} className="p-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Add Button Fab */}
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                        <Button size="icon" className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-2xl shadow-primary/40 z-50">
                            <Plus className="w-7 h-7" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[calc(100vw-2rem)] rounded-3xl">
                        <DialogHeader>
                            <DialogTitle>Nova Transação</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
                                <button
                                    onClick={() => handleTipoChange('entrada')}
                                    className={cn("py-2 rounded-lg text-sm font-bold transition-all", newTipo === 'entrada' ? "bg-background shadow-sm text-success" : "text-muted-foreground")}
                                >Entrada</button>
                                <button
                                    onClick={() => handleTipoChange('saida')}
                                    className={cn("py-2 rounded-lg text-sm font-bold transition-all", newTipo === 'saida' ? "bg-background shadow-sm text-destructive" : "text-muted-foreground")}
                                >Saída</button>
                            </div>

                            <div className="space-y-2">
                                <Label>Valor (EUR)</Label>
                                <Input type="number" value={newVal} onChange={(e) => setNewVal(e.target.value)} placeholder="0.00" className="h-12 rounded-xl text-lg" />
                            </div>

                            <div className="space-y-2">
                                <Label>Categoria</Label>
                                <Select value={newCat} onValueChange={setNewCat}>
                                    <SelectTrigger className="h-12 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {(newTipo === 'entrada' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {newTipo === 'saida' && (
                                <div className="space-y-4 p-4 bg-muted/30 rounded-2xl border border-dashed">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Pagamento Pendente</Label>
                                            <p className="text-[10px] text-muted-foreground">Registar agora e pagar depois</p>
                                        </div>
                                        <Switch checked={isPending} onCheckedChange={setIsPending} />
                                    </div>

                                    {isPending && (
                                        <>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Data de Vencimento</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full h-10 rounded-xl justify-start text-left font-normal",
                                                                !dueDate && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : <span>Selecionar data</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={dueDate}
                                                            onSelect={setDueDate}
                                                            initialFocus
                                                            locale={ptBR}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label className="text-sm font-bold">Repetir Mensalmente</Label>
                                                    <p className="text-[10px] text-muted-foreground">Despesa fixa recorrente</p>
                                                </div>
                                                <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            <Button onClick={handleAdd} disabled={saving || !newVal} className="w-full h-12 rounded-xl font-bold">
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Registrar'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </MobileLayout>
    );
}
