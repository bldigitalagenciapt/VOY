import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { containsOffensiveContent } from '@/lib/moderation';

export interface CommunityReply {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    user_name: string;
    avatar_url?: string;
}

export interface CommunityPost {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    likes_count: number;
    user_has_liked: boolean;
    user_name?: string;
    avatar_url?: string;
    replies?: CommunityReply[];
}

export function useCommunity() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: posts = [], isLoading: loading } = useQuery({
        queryKey: ['community_posts', user?.id],
        queryFn: async () => {
            if (!user) return [];

            // Fetch posts
            const { data: postsData, error: postsError } = await (supabase as any)
                .from('community_posts')
                .select(`
                  *,
                  user:profiles(display_name, avatar_url)
                `)
                .order('created_at', { ascending: false });

            if (postsError) {
                console.error('[COMMUNITY] Error fetching posts:', postsError);
                throw postsError;
            }

            if (!postsData || postsData.length === 0) return [];

            // Fetch likes
            const postIds = postsData.map((p: any) => p.id);
            const { data: likesData, error: likesError } = await (supabase as any)
                .from('community_likes')
                .select('post_id, user_id')
                .in('post_id', postIds);

            if (likesError) {
                console.error('[COMMUNITY] Error fetching likes:', likesError);
            }

            // Fetch replies
            const { data: repliesData, error: repliesError } = await (supabase as any)
                .from('community_replies')
                .select(`
                    *,
                    user:profiles(display_name, avatar_url)
                `)
                .in('post_id', postIds)
                .order('created_at', { ascending: true });

            if (repliesError) {
                console.error('[COMMUNITY] Error fetching replies:', repliesError);
            }

            const currentLikes = likesData || [];
            const currentReplies = repliesData || [];

            return postsData.map((post: any) => {
                const postLikes = currentLikes.filter((l: any) => l.post_id === post.id);
                const postReplies = currentReplies.filter((r: any) => r.post_id === post.id).map((reply: any) => {
                    const replyProfile = Array.isArray(reply.user) ? reply.user[0] : reply.user;
                    return {
                        ...reply,
                        user_name: replyProfile?.display_name || 'Membro do Voy',
                        avatar_url: replyProfile?.avatar_url
                    };
                });

                // Handle both single object and array responses for joined user profile
                const profile = Array.isArray(post.user) ? post.user[0] : post.user;

                return {
                    ...post,
                    user_name: profile?.display_name || 'Membro do Voy',
                    avatar_url: profile?.avatar_url,
                    likes_count: postLikes.length,
                    user_has_liked: postLikes.some((l: any) => l.user_id === user.id),
                    replies: postReplies
                } as CommunityPost;
            });
        },
        enabled: !!user,
    });

    const createPostMutation = useMutation({
        mutationFn: async (content: string) => {
            if (!user) throw new Error('Auth required');

            // Client-side moderation check
            const { isOffensive, word } = containsOffensiveContent(content);
            if (isOffensive) {
                throw new Error(`O conteúdo contém linguagem imprópria (${word}). Por favor, mantenha o respeito na comunidade.`);
            }

            const { data, error } = await (supabase as any)
                .from('community_posts')
                .insert({
                    user_id: user.id,
                    content
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community_posts'] });
            toast({
                title: "Publicado!",
                description: "A sua mensagem foi partilhada com a comunidade.",
            });
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Erro ao publicar",
                description: error.message,
            });
        }
    });

    const createReplyMutation = useMutation({
        mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
            if (!user) throw new Error('Auth required');

            const { isOffensive, word } = containsOffensiveContent(content);
            if (isOffensive) {
                throw new Error(`Conteúdo não permitido (${word}).`);
            }

            const { data, error } = await (supabase as any)
                .from('community_replies')
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    content
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community_posts'] });
            toast({
                title: "Resposta enviada!",
            });
        },
        onError: (error: Error) => {
            toast({
                variant: "destructive",
                title: "Falha ao responder",
                description: error.message,
            });
        }
    });

    const toggleLikeMutation = useMutation({
        mutationFn: async ({ postId, hasLiked }: { postId: string; hasLiked: boolean }) => {
            if (!user) throw new Error('Auth required');

            if (hasLiked) {
                // Remove like
                const { error } = await (supabase as any)
                    .from('community_likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', user.id);
                if (error) throw error;
            } else {
                // Add like
                const { error } = await (supabase as any)
                    .from('community_likes')
                    .insert({
                        post_id: postId,
                        user_id: user.id
                    });
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community_posts'] });
        }
    });

    const deletePostMutation = useMutation({
        mutationFn: async (postId: string) => {
            const { error } = await (supabase as any)
                .from('community_posts')
                .delete()
                .eq('id', postId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community_posts'] });
            toast({
                title: "Removido",
                description: "A publicação foi eliminada.",
            });
        }
    });

    const deleteReplyMutation = useMutation({
        mutationFn: async (replyId: string) => {
            const { error } = await (supabase as any)
                .from('community_replies')
                .delete()
                .eq('id', replyId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['community_posts'] });
            toast({
                title: "Resposta removida",
                description: "A resposta foi eliminada com sucesso.",
            });
        }
    });

    return {
        posts,
        loading,
        createPost: createPostMutation.mutateAsync,
        createReply: createReplyMutation.mutateAsync,
        toggleLike: (postId: string, hasLiked: boolean) => toggleLikeMutation.mutateAsync({ postId, hasLiked }),
        deletePost: deletePostMutation.mutateAsync,
        deleteReply: deleteReplyMutation.mutateAsync,
        isPosting: createPostMutation.isPending,
        isReplying: createReplyMutation.isPending
    };
}
