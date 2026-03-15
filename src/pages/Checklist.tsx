import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    ChevronLeft,
    CheckCircle2,
    Circle,
    Info,
    Rocket,
    Plus,
    Trash2,
    Pencil
} from 'lucide-react';
import { useChecklist, CHECKLIST_ITEMS } from '@/hooks/useChecklist';
import { useCustomChecklist } from '@/hooks/useCustomChecklist';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Checklist() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { completedItems, loading, toggleItem } = useChecklist();
    const { items: customItems, loading: customLoading, addItem, toggleItem: toggleCustom, deleteItem, updateItem } = useCustomChecklist();

    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<{ id: string, label: string, isCustom: boolean } | null>(null);
    const [newLabel, setNewLabel] = useState('');
    const [editLabel, setEditLabel] = useState('');
    const [saving, setSaving] = useState(false);
    const [hiddenDefaultItems, setHiddenDefaultItems] = useState<string[]>([]);

    useEffect(() => {
        const hidden = localStorage.getItem('voy_hidden_checklist_items');
        if (hidden) setHiddenDefaultItems(JSON.parse(hidden));
    }, []);

    const saveHiddenItems = (ids: string[]) => {
        setHiddenDefaultItems(ids);
        localStorage.setItem('voy_hidden_checklist_items', JSON.stringify(ids));
    };

    const visibleDefaultItems = CHECKLIST_ITEMS.filter(item => !hiddenDefaultItems.includes(item.id));
    const total = visibleDefaultItems.length + customItems.length;
    const completedCount = CHECKLIST_ITEMS.filter(i => completedItems.includes(i.id) && !hiddenDefaultItems.includes(i.id)).length + 
                           customItems.filter(i => i.is_done).length;
    const progressPercent = Math.round((completedCount / Math.max(total, 1)) * 100);

    const handleAddCustom = async () => {
        if (!newLabel.trim()) return;
        setSaving(true);
        await addItem(newLabel.trim());
        setNewLabel('');
        setSaving(false);
        setShowAddDialog(false);
    };

    const handleEditItem = (id: string, label: string, isCustom: boolean) => {
        setEditingItem({ id, label, isCustom });
        setEditLabel(label);
        setShowEditDialog(true);
    };

    const handleSaveEdit = async () => {
        if (!editLabel.trim() || !editingItem) return;
        setSaving(true);
        if (editingItem.isCustom) {
            await updateItem(editingItem.id, editLabel.trim());
        } else {
            // Se for item padrão, o ocultamos e criamos um novo personalizado
            const newHidden = [...hiddenDefaultItems, editingItem.id];
            saveHiddenItems(newHidden);
            await addItem(editLabel.trim());
            
            // Se estava completado, mantemos o estado no novo item (opcional, aqui simplificamos)
            toast({ title: "Item padrão atualizado!", description: "O item original foi substituído pela sua edição." });
        }
        setSaving(false);
        setShowEditDialog(false);
        setEditingItem(null);
    };

    const handleDeleteDefault = (id: string) => {
        const newHidden = [...hiddenDefaultItems, id];
        saveHiddenItems(newHidden);
        toast({ title: "Item removido", description: "O item padrão foi ocultado da sua lista." });
    };

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

                {/* VOY Default Items */}
                <div className="space-y-4 mb-8">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Itens do VOY</p>
                    {visibleDefaultItems.map((item) => {
                        const isDone = completedItems.includes(item.id);
                        return (
                            <div
                                key={item.id}
                                className={cn(
                                    "w-full flex items-start gap-4 p-5 rounded-[28px] border transition-all text-left group relative",
                                    isDone
                                        ? "bg-primary/5 border-primary/20"
                                        : "bg-card border-border/50 hover:border-primary/30"
                                )}
                            >
                                <button
                                    onClick={() => toggleItem(item.id, !isDone)}
                                    className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                        isDone ? "bg-primary text-white" : "border-2 border-muted-foreground/30 text-transparent"
                                    )}>
                                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                </button>
                                <div className="flex-1 min-w-0" onClick={() => toggleItem(item.id, !isDone)}>
                                    <div className="flex justify-between items-center mb-1 pr-14">
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
                                        "text-[10px] leading-relaxed pr-8",
                                        isDone ? "text-muted-foreground/50" : "text-muted-foreground"
                                    )}>
                                        {item.description}
                                    </p>
                                </div>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEditItem(item.id, item.label, false)}
                                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDefault(item.id)}
                                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* My Custom Items */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between px-1">
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Meus Itens</p>
                        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="gap-2 rounded-xl text-xs font-bold h-8">
                                    <Plus className="w-3.5 h-3.5" />
                                    Adicionar
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-[24px] max-w-[calc(100vw-2rem)]">
                                <DialogHeader>
                                    <DialogTitle>Novo Item</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-2">
                                    <Input
                                        placeholder="Ex: Marcar consulta no Centro de Saúde"
                                        value={newLabel}
                                        onChange={e => setNewLabel(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
                                        className="rounded-xl h-12"
                                        autoFocus
                                    />
                                    <Button onClick={handleAddCustom} disabled={saving || !newLabel.trim()} className="w-full h-12 rounded-xl font-bold">
                                        Adicionar Item
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {customItems.length === 0 ? (
                        <div className="bg-muted/20 border border-dashed rounded-[24px] p-8 text-center">
                            <p className="text-muted-foreground text-sm font-medium">Adicione seus próprios itens personalizados.</p>
                        </div>
                    ) : (
                        customItems.map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "w-full flex items-start gap-4 p-5 rounded-[28px] border transition-all group relative",
                                    item.is_done
                                        ? "bg-primary/5 border-primary/20"
                                        : "bg-card border-border/50 hover:border-primary/30"
                                )}
                            >
                                <button
                                    onClick={() => toggleCustom(item.id, !item.is_done)}
                                    className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                        item.is_done ? "bg-primary text-white" : "border-2 border-muted-foreground/30 text-transparent"
                                    )}
                                >
                                    {item.is_done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                </button>
                                <div className="flex-1 min-w-0" onClick={() => toggleCustom(item.id, !item.is_done)}>
                                    <span className={cn(
                                        "text-sm font-bold transition-all",
                                        item.is_done ? "text-primary line-through opacity-70" : "text-foreground"
                                    )}>
                                        {item.label}
                                    </span>
                                </div>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEditItem(item.id, item.label, true)}
                                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Edit Dialog */}
                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                    <DialogContent className="rounded-[24px] max-w-[calc(100vw-2rem)]">
                        <DialogHeader>
                            <DialogTitle>Editar Item</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <Input
                                placeholder="Nome do item"
                                value={editLabel}
                                onChange={e => setEditLabel(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                                className="rounded-xl h-12"
                                autoFocus
                            />
                            <Button onClick={handleSaveEdit} disabled={saving || !editLabel.trim()} className="w-full h-12 rounded-xl font-bold">
                                Salvar Alterações
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Pro Tip */}
                <div className="mt-4 p-4 bg-muted/30 rounded-3xl flex gap-3 items-center border border-border/50">
                    <Info className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Dica VOY: Comece pelo NIF. Quase todos os outros passos dependem dele para serem concluídos.
                    </p>
                </div>
            </div>
        </MobileLayout>
    );
}
