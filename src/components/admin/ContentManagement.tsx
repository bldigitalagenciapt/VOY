import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Edit2, GripVertical, Save, X, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface UsefulLink {
    id: string;
    label: string;
    url: string;
    description: string | null;
    category: string;
    order_index: number;
    is_active: boolean;
}

export function ContentManagement() {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ label: '', url: '', description: '', category: 'Geral' });

    const { data: links = [], isLoading } = useQuery({
        queryKey: ['admin-links'],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('useful_links')
                .select('*')
                .order('order_index', { ascending: true });
            if (error) throw error;
            return data as UsefulLink[];
        },
    });

    const addLinkMutation = useMutation({
        mutationFn: async (link: Partial<UsefulLink>) => {
            const { error } = await (supabase as any).from('useful_links').insert({
                ...link,
                order_index: links.length,
            });
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Link adicionado!');
            queryClient.invalidateQueries({ queryKey: ['admin-links'] });
            setFormData({ label: '', url: '', description: '', category: 'Geral' });
        },
    });

    const updateLinkMutation = useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<UsefulLink> }) => {
            const { error } = await (supabase as any)
                .from('useful_links')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Link atualizado!');
            queryClient.invalidateQueries({ queryKey: ['admin-links'] });
            setEditingId(null);
        },
    });

    const deleteLinkMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase as any).from('useful_links').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Link removido!');
            queryClient.invalidateQueries({ queryKey: ['admin-links'] });
        },
    });

    const syncAimaNews = async () => {
        const toastId = 'sync-news';
        try {
            toast.loading('Buscando notícias no site da AIMA...', { id: toastId });

            const { data: newsItems, error } = await supabase.functions.invoke('scrape-aima-news');

            if (error) throw error;
            if (!newsItems || newsItems.length === 0) throw new Error('Nenhuma notícia encontrada');

            let newCount = 0;
            for (const item of newsItems) {
                const { data: existing } = await supabase
                    .from('noticias')
                    .select('id')
                    .eq('titulo', item.titulo)
                    .maybeSingle();

                if (!existing) {
                    const { error } = await supabase.from('noticias').insert(item);
                    if (!error) newCount++;
                }
            }

            toast.success(`Sincronização concluída! ${newCount} novas notícias.`, { id: toastId });
            queryClient.invalidateQueries({ queryKey: ['noticias'] });
        } catch (error: any) {
            console.error('Sync Error:', error);
            toast.error(`Erro ao sincronizar: ${error.message || 'Falha na conexão'}`, { id: toastId });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Add Link Form */}
            <div className="p-5 bg-card border border-border rounded-3xl space-y-4">
                <h3 className="font-bold text-lg">Adicionar Link Útil</h3>
                <div className="space-y-3">
                    <Input
                        placeholder="Título (ex: Segurança Social)"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        className="h-12 rounded-xl"
                    />
                    <Input
                        placeholder="URL (https://...)"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="h-12 rounded-xl"
                    />
                    <Textarea
                        placeholder="Descrição (opcional)"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="rounded-xl"
                        rows={2}
                    />
                    <Button
                        onClick={() => addLinkMutation.mutate(formData)}
                        disabled={!formData.label || !formData.url}
                        className="w-full h-12 rounded-xl font-bold"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Adicionar Link
                    </Button>
                </div>
            </div>

            {/* AIMA News Sync Section */}
            <div className="p-5 bg-card border border-border rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg">Notícias AIMA Oficial</h3>
                    </div>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg uppercase">Auto-Scraper</span>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                    Clique no botão abaixo para buscar automaticamente as últimas 4 notícias postadas no site oficial da AIMA (aima.gov.pt) e atualizar o aplicativo.
                </p>

                <Button
                    onClick={syncAimaNews}
                    variant="outline"
                    className="w-full h-12 rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary transition-all group"
                >
                    <RefreshCw className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-500" />
                    Sincronizar com AIMA.GOV.PT
                </Button>

                <div className="p-4 bg-muted/30 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fonte das Notícias</span>
                    </div>
                    <a href="https://aima.gov.pt/pt/noticias" target="_blank" className="text-primary hover:underline text-xs truncate block">
                        https://aima.gov.pt/pt/noticias
                    </a>
                </div>
            </div>

            {/* Links List */}
            <div className="space-y-3">
                <h3 className="font-bold px-1 uppercase text-xs text-muted-foreground tracking-widest">
                    Links Ativos ({links.length})
                </h3>
                {links.map((link) => (
                    <div key={link.id} className="p-4 bg-card border border-border rounded-2xl space-y-3">
                        {editingId === link.id ? (
                            <div className="space-y-3">
                                <Input
                                    defaultValue={link.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    className="h-10 rounded-xl"
                                />
                                <Input
                                    defaultValue={link.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    className="h-10 rounded-xl"
                                />
                                <Textarea
                                    defaultValue={link.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="rounded-xl"
                                    rows={2}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => updateLinkMutation.mutate({ id: link.id, updates: formData })}
                                        className="flex-1"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Salvar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingId(null)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold truncate">{link.label}</p>
                                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                                        {link.description && (
                                            <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingId(link.id);
                                                setFormData({
                                                    label: link.label,
                                                    url: link.url,
                                                    description: link.description || '',
                                                    category: link.category,
                                                });
                                            }}
                                            className="p-2 hover:bg-muted rounded-xl transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteLinkMutation.mutate(link.id)}
                                            className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {links.length === 0 && (
                    <p className="text-center py-10 text-muted-foreground text-sm">
                        Nenhum link cadastrado
                    </p>
                )}
            </div>
        </div>
    );
}
