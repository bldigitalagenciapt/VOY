import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Settings as SettingsIcon, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export function AppSettings() {
    const queryClient = useQueryClient();
    const [settings, setSettings] = useState<Record<string, any>>({});

    const { data: appSettings, isLoading } = useQuery({
        queryKey: ['app-settings'],
        queryFn: async () => {
            const { data, error } = await (supabase as any).from('app_settings').select('*');
            if (error) throw error;

            // Convert array to object
            const settingsObj: Record<string, any> = {};
            data.forEach((setting: any) => {
                settingsObj[setting.key] = setting.value;
            });
            return settingsObj;
        },
    });

    useEffect(() => {
        if (appSettings) {
            setSettings(appSettings);
        }
    }, [appSettings]);

    const updateSettingMutation = useMutation({
        mutationFn: async ({ key, value }: { key: string; value: any }) => {
            const db = supabase as any;

            // Check if exists
            const { data: current, error: fetchError } = await db
                .from('app_settings')
                .select('key')
                .eq('key', key)
                .maybeSingle();

            if (fetchError) throw fetchError;

            let result;
            if (current) {
                result = await db
                    .from('app_settings')
                    .update({ value, updated_at: new Date().toISOString() })
                    .eq('key', key);
            } else {
                result = await db
                    .from('app_settings')
                    .insert({ key, value, updated_at: new Date().toISOString() });
            }

            if (result.error) throw result.error;
        },
        onSuccess: () => {
            toast.success('Configuração atualizada!');
            queryClient.invalidateQueries({ queryKey: ['app-settings'] });
            queryClient.invalidateQueries({ queryKey: ['community-enabled'] });
        },
        onError: (error: any) => {
            console.error('Erro ao atualizar configuração:', error);
            toast.error('Falha ao salvar: ' + (error.message || 'Erro desconhecido'));
        }
    });

    const handleToggle = (key: string, currentValue: boolean) => {
        const newValue = !currentValue;
        setSettings({ ...settings, [key]: newValue });
        updateSettingMutation.mutate({ key, value: newValue });
    };

    const handleInputChange = (key: string, value: string) => {
        setSettings({ ...settings, [key]: value });
    };

    const handleSave = (key: string) => {
        updateSettingMutation.mutate({ key, value: settings[key] });
    };

    if (isLoading) {
        return <div className="text-center py-10">Carregando...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Funcionalidades */}
            <div className="p-5 bg-card border border-border rounded-3xl space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5" />
                    Funcionalidades
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                        <div>
                            <p className="font-medium">Permitir Cadastros</p>
                            <p className="text-xs text-muted-foreground">Novos usuários podem se registrar</p>
                        </div>
                        <Switch
                            checked={settings.registration_enabled === true}
                            onCheckedChange={() => handleToggle('registration_enabled', settings.registration_enabled)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                        <div>
                            <p className="font-medium">Permitir Uploads</p>
                            <p className="text-xs text-muted-foreground">Usuários podem fazer upload de documentos</p>
                        </div>
                        <Switch
                            checked={settings.upload_enabled === true}
                            onCheckedChange={() => handleToggle('upload_enabled', settings.upload_enabled)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                        <div>
                            <p className="font-medium">Mural da Comunidade</p>
                            <p className="text-xs text-muted-foreground">Permitir postagens e conversas no mural</p>
                        </div>
                        <Switch
                            checked={settings.community_enabled !== false} // Default to true if missing
                            onCheckedChange={() => handleToggle('community_enabled', settings.community_enabled ?? true)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                        <div>
                            <p className="font-medium">Modo Manutenção</p>
                            <p className="text-xs text-muted-foreground">Bloquear acesso ao app</p>
                        </div>
                        <Switch
                            checked={settings.maintenance_mode === true}
                            onCheckedChange={() => handleToggle('maintenance_mode', settings.maintenance_mode)}
                        />
                    </div>
                </div>
            </div>

            {/* Limites */}
            <div className="p-5 bg-card border border-border rounded-3xl space-y-4">
                <h3 className="font-bold text-lg">Limites</h3>

                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Tamanho Máximo de Upload (MB)
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                value={settings.max_upload_size_mb || 10}
                                onChange={(e) => handleInputChange('max_upload_size_mb', e.target.value)}
                                className="h-12 rounded-xl"
                            />
                            <Button
                                onClick={() => handleSave('max_upload_size_mb')}
                                className="h-12 rounded-xl"
                            >
                                <Save className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {settings.maintenance_mode && (
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Mensagem de Manutenção
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    value={settings.maintenance_message?.replace(/"/g, '') || ''}
                                    onChange={(e) => handleInputChange('maintenance_message', `"${e.target.value}"`)}
                                    className="h-12 rounded-xl"
                                />
                                <Button
                                    onClick={() => handleSave('maintenance_message')}
                                    className="h-12 rounded-xl"
                                >
                                    <Save className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-muted/50 rounded-2xl">
                <p className="text-xs text-muted-foreground leading-relaxed">
                    💡 As configurações são aplicadas imediatamente para todos os usuários do app.
                </p>
            </div>
        </div>
    );
}
