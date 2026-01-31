import { useState } from 'react';
import { useCommunity, CommunityPost } from '@/hooks/useCommunity';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    MessageSquare,
    Trash2,
    Search,
    ShieldAlert,
    Filter,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    XCircle,
    Loader2,
    StickyNote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function CommunityManagement() {
    const queryClient = useQueryClient();
    const { posts, loading, deletePost, deleteReply } = useCommunity();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedPost, setExpandedPost] = useState<string | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        type: 'post' | 'reply' | null;
        id: string | null;
    }>({ open: false, type: null, id: null });

    // Global toggle state
    const { data: communityEnabled, isLoading: loadingStatus } = useQuery({
        queryKey: ['community-enabled'],
        queryFn: async () => {
            try {
                const { data, error } = await (supabase as any)
                    .from('app_settings')
                    .select('value')
                    .eq('key', 'community_enabled')
                    .maybeSingle();

                if (error) throw error;
                // If row doesn't exist, we assume it's enabled by default
                if (!data) return true;
                return data.value === true;
            } catch (err) {
                console.error("Error fetching community status:", err);
                return true;
            }
        }
    });

    const toggleMutation = useMutation({
        mutationFn: async (newValue: boolean) => {
            const db = supabase as any;

            // First check if it exists
            const { data: current, error: fetchError } = await db
                .from('app_settings')
                .select('key')
                .eq('key', 'community_enabled')
                .maybeSingle();

            if (fetchError) throw fetchError;

            let result;
            if (current) {
                // Update existing
                result = await db
                    .from('app_settings')
                    .update({
                        value: newValue,
                        updated_at: new Date().toISOString()
                    })
                    .eq('key', 'community_enabled');
            } else {
                // Insert new
                result = await db
                    .from('app_settings')
                    .insert({
                        key: 'community_enabled',
                        value: newValue,
                        updated_at: new Date().toISOString()
                    });
            }

            if (result.error) throw result.error;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['community-enabled'] });
            queryClient.invalidateQueries({ queryKey: ['app-settings'] });
            toast.success(variables ? 'O mural agora está ATIVO!' : 'O mural foi BLOQUEADO!');
        },
        onError: (error: any) => {
            console.error('Erro ao alternar mural:', error);
            toast.error('Falha ao atualizar status: ' + (error.message || 'Erro desconhecido'));
        }
    });

    const handleDelete = async () => {
        if (!deleteDialog.id || !deleteDialog.type) return;

        try {
            if (deleteDialog.type === 'post') {
                await deletePost(deleteDialog.id);
            } else {
                await deleteReply(deleteDialog.id);
            }
            setDeleteDialog({ open: false, type: null, id: null });
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || loadingStatus) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Carregando mural comunitário...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Status & Control */}
            <div className="p-5 bg-card border border-border rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            Status do Mural
                        </h3>
                        <p className="text-xs text-muted-foreground">Ativar ou desativar o mural para todos os usuários</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                            communityEnabled ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        )}>
                            {communityEnabled ? 'Ativo' : 'Bloqueado'}
                        </span>
                        <Switch
                            checked={communityEnabled}
                            onCheckedChange={(checked) => toggleMutation.mutate(checked)}
                        />
                    </div>
                </div>
            </div>

            {/* Moderation Alert */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-500/90 leading-relaxed font-bold">
                    Atenção: Você está no modo moderador. Todas as exclusões são permanentes e não podem ser desfeitas.
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="Filtrar por nome ou conteúdo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                />
            </div>

            {/* Posts List */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">
                    Publicações Recentes ({filteredPosts.length})
                </h4>

                {filteredPosts.map(post => (
                    <Card key={post.id} className="p-4 rounded-3xl border-border/50 relative overflow-hidden group">
                        <div className="flex gap-4">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">{post.user_name}</span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteDialog({ open: true, type: 'post', id: post.id })}
                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3 italic">
                                    "{post.content}"
                                </p>

                                {/* Replies Count */}
                                {post.replies && post.replies.length > 0 && (
                                    <button
                                        onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                                        className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-wider"
                                    >
                                        {post.replies.length} Respostas
                                        {expandedPost === post.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>
                                )}

                                {/* Expanded Replies */}
                                {expandedPost === post.id && post.replies && (
                                    <div className="mt-4 space-y-3 pl-4 border-l-2 border-muted animate-in slide-in-from-top-2">
                                        {post.replies.map(reply => (
                                            <div key={reply.id} className="bg-muted/30 p-3 rounded-2xl relative">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[10px] font-bold">{reply.user_name}</span>
                                                    <button
                                                        onClick={() => setDeleteDialog({ open: true, type: 'reply', id: reply.id })}
                                                        className="text-destructive opacity-40 hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-foreground/80">{reply.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}

                {filteredPosts.length === 0 && (
                    <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border border-dashed border-border">
                        <p className="text-sm text-muted-foreground font-medium">Nenhuma publicação encontrada.</p>
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ ...deleteDialog, open: false })}>
                <AlertDialogContent className="rounded-3xl border-none">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Deseja realmente remover esta {deleteDialog.type === 'post' ? 'publicação' : 'resposta'}? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-2xl h-11">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl h-11"
                        >
                            Remover Permanentemente
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
