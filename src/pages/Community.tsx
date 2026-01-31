import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCommunity, CommunityPost } from '@/hooks/useCommunity';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import {
    ChevronLeft,
    Send,
    Heart,
    MessageCircle,
    MoreHorizontal,
    Trash2,
    Loader2,
    ShieldCheck,
    PartyPopper,
    Info,
    ShieldAlert
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Community() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { posts, loading, createPost, toggleLike, deletePost, isPosting } = useCommunity();
    const [content, setContent] = useState('');

    const { profile } = useProfile();
    const queryClient = useQueryClient();

    // Check if community is enabled
    const { data: communityEnabled = true, isLoading: loadingStatus } = useQuery({
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

    const isAdmin = profile?.is_admin === true || user?.email?.toLowerCase().trim() === 'brunoalmeidaoficial21@gmail.com';

    const handlePost = async () => {
        if (!content.trim()) return;
        try {
            await createPost(content);
            setContent('');
        } catch (error) {
            // Toast shown in hook
        }
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
                        <h1 className="text-2xl font-bold">Mural</h1>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                </div>

                {/* Safety Notice */}
                <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-2xl flex gap-3 items-start">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Este mural destina-se a trocas de experiências positivas. Mantenha o respeito. Conteúdo impróprio será removido automaticamente.
                    </p>
                </div>

                {/* Content */}
                {!communityEnabled ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-6 bg-muted/20 rounded-[2.5rem] border border-dashed border-border text-center animate-in fade-in zoom-in duration-500 mt-10">
                        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                            <ShieldAlert className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold">Mural Temporariamente Indisponível</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                A administração suspendeu o mural para manutenção ou moderação. Por favor, volte mais tarde.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/home')}
                            className="rounded-full px-8"
                        >
                            Voltar ao Início
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Create Post */}
                        <Card className="p-4 rounded-3xl mb-8 border-primary/10 shadow-lg shadow-primary/5">
                            <div className="flex gap-4">
                                <Avatar className="w-10 h-10 border-2 border-primary/20">
                                    <AvatarImage src={profile?.avatar_url || ''} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {profile?.display_name ? profile.display_name.substring(0, 2).toUpperCase() : user?.email?.[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-3">
                                    <Textarea
                                        placeholder="Partilhe uma dica, dúvida ou vitória..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="min-h-[100px] bg-muted/30 border-none focus-visible:ring-primary/20 rounded-2xl resize-none text-sm"
                                    />
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-muted-foreground italic">
                                            Todos serão educados. 🛡️
                                        </span>
                                        <Button
                                            size="sm"
                                            onClick={handlePost}
                                            disabled={isPosting || !content.trim()}
                                            className="rounded-full px-6 font-bold gap-2"
                                        >
                                            {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            Publicar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Feed */}
                        <div className="space-y-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center p-12 space-y-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground">A sintonizar com a comunidade...</p>
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="text-center p-12 space-y-4">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                                        <MessageCircle className="w-8 h-8" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">Seja o primeiro a dizer olá!</p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onLike={() => toggleLike(post.id, post.user_has_liked)}
                                        onDelete={() => deletePost(post.id)}
                                        currentUserId={user?.id}
                                        isAdmin={isAdmin}
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </MobileLayout>
    );
}

function PostCard({
    post,
    onLike,
    onDelete,
    currentUserId,
    isAdmin
}: {
    post: CommunityPost;
    onLike: () => void;
    onDelete: () => void;
    currentUserId?: string;
    isAdmin?: boolean;
}) {
    const isOwner = currentUserId === post.user_id;
    const canDelete = isOwner || isAdmin;
    const [showReplies, setShowReplies] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const { createReply, isReplying } = useCommunity();

    const handleReply = async () => {
        if (!replyContent.trim()) return;
        try {
            await createReply({ postId: post.id, content: replyContent });
            setReplyContent('');
        } catch (error) {
            // Error managed by hook
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="p-5 rounded-[32px] border-none bg-card shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-4">
                    <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                        <AvatarImage src={post.avatar_url || ''} />
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase">
                            {post.user_name.substring(0, 2)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex flex-col">
                                <span className="font-bold text-sm truncate">{post.user_name}</span>
                                <span className="text-[10px] text-muted-foreground">
                                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                                </span>
                            </div>

                            {canDelete && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-1 hover:bg-muted rounded-full transition-colors">
                                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-xl">
                                        <DropdownMenuItem onClick={onDelete} className="text-destructive gap-2">
                                            <Trash2 className="w-4 h-4" />
                                            Remover publicação
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>

                        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap mt-2">
                            {post.content}
                        </p>

                        <div className="flex items-center gap-6 mt-4 pt-3 border-t border-muted/30">
                            <button
                                onClick={onLike}
                                className={cn(
                                    "flex items-center gap-1.5 text-xs font-medium transition-colors",
                                    post.user_has_liked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Heart className={cn("w-4 h-4", post.user_has_liked && "fill-current")} />
                                {post.likes_count}
                            </button>

                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className={cn(
                                    "flex items-center gap-1.5 text-xs font-medium transition-colors",
                                    showReplies ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <MessageCircle className="w-4 h-4" />
                                {post.replies?.length || ''} Interagir
                            </button>
                        </div>

                        {/* Replies Section */}
                        {showReplies && (
                            <div className="mt-4 pt-4 border-t border-muted/20 space-y-4 animate-in fade-in slide-in-from-top-2">
                                {post.replies?.map((reply) => (
                                    <div key={reply.id} className="flex gap-3 items-start bg-muted/20 p-3 rounded-2xl">
                                        <Avatar className="w-7 h-7">
                                            <AvatarImage src={reply.avatar_url || ''} />
                                            <AvatarFallback className="text-[10px] bg-primary/5 text-primary">
                                                {reply.user_name.substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold truncate">{reply.user_name}</span>
                                                <span className="text-[8px] text-muted-foreground">
                                                    {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: ptBR })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-foreground/80 mt-1">{reply.content}</p>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex gap-2 pt-2">
                                    <Input
                                        placeholder="Escreva uma resposta..."
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        className="h-9 text-xs rounded-full bg-muted/50 border-none"
                                        onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-9 w-9 rounded-full text-primary"
                                        disabled={isReplying || !replyContent.trim()}
                                        onClick={handleReply}
                                    >
                                        {isReplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
