import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface CustomChecklistItem {
    id: string;
    user_id: string;
    label: string;
    description?: string;
    is_done: boolean;
    created_at: string;
}

export function useCustomChecklist() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [items, setItems] = useState<CustomChecklistItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchItems();
    }, [user]);

    const fetchItems = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await (supabase as any)
                .from('custom_checklist_items')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (!error && data) setItems(data as CustomChecklistItem[]);
        } catch (e) {
            console.error('Error fetching custom checklist:', e);
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (label: string, description?: string) => {
        if (!user || !label.trim()) return;
        const { data, error } = await (supabase as any)
            .from('custom_checklist_items')
            .insert({ user_id: user.id, label: label.trim(), description, is_done: false })
            .select()
            .single();

        if (!error && data) {
            setItems(prev => [...prev, data as CustomChecklistItem]);
        } else {
            toast({ variant: 'destructive', title: 'Erro ao adicionar item.' });
        }
    };

    const toggleItem = async (id: string, isDone: boolean) => {
        const { error } = await (supabase as any)
            .from('custom_checklist_items')
            .update({ is_done: isDone })
            .eq('id', id);

        if (!error) {
            setItems(prev => prev.map(i => i.id === id ? { ...i, is_done: isDone } : i));
        }
    };

    const updateItem = async (id: string, label: string) => {
        const { error } = await (supabase as any)
            .from('custom_checklist_items')
            .update({ label: label.trim() })
            .eq('id', id);

        if (!error) {
            setItems(prev => prev.map(i => i.id === id ? { ...i, label: label.trim() } : i));
        } else {
            toast({ variant: 'destructive', title: 'Erro ao atualizar item.' });
        }
    };

    return { items, loading, addItem, toggleItem, deleteItem, updateItem };
}
