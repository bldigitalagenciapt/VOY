import { useState, useEffect } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import {
    Users,
    Globe,
    Terminal,
    Settings,
    ChevronLeft,
    Plus,
    Trash2,
    ExternalLink,
    Loader2,
    TrendingDown,
    TrendingUp,
    LayoutDashboard,
    ShieldCheck,
    Key,
    Mail,
    Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface UsefulLink {
    id: string;
    label: string;
    url: string;
    category: string;
}

export default function Admin() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'stats' | 'links' | 'security'>('stats');
    const [links, setLinks] = useState<UsefulLink[]>([]);
    const [loading, setLoading] = useState(false);

    // Stats state
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalDocs, setTotalDocs] = useState(0);

    // New Link form
    const [newLinkLabel, setNewLinkLabel] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');

    // Security form
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updatingAccount, setUpdatingAccount] = useState(false);

    useEffect(() => {
        fetchStats();
        fetchLinks();
    }, []);

    const fetchStats = async () => {
        const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: dCount } = await supabase.from('documents').select('*', { count: 'exact', head: true });
        setTotalUsers(uCount || 0);
        setTotalDocs(dCount || 0);
    };

    const fetchLinks = async () => {
        const { data } = await (supabase as any).from('useful_links').select('*').order('created_at', { ascending: false });
        if (data) setLinks(data);
    };

    const handleAddLink = async () => {
        if (!newLinkLabel || !newLinkUrl) return;
        setLoading(true);
        const { error } = await (supabase as any).from('useful_links').insert({
            label: newLinkLabel,
            url: newLinkUrl,
            category: 'Geral'
        });

        if (error) {
            toast.error('Erro ao adicionar link');
        } else {
            toast.success('Link adicionado!');
            setNewLinkLabel('');
            setNewLinkUrl('');
            fetchLinks();
        }
        setLoading(false);
    };

    const handleDeleteLink = async (id: string) => {
        const { error } = await (supabase as any).from('useful_links').delete().eq('id', id);
        if (!error) {
            toast.success('Link removido');
            fetchLinks();
        }
    };

    const handleUpdateEmail = async () => {
        if (!newEmail) return;
        setUpdatingAccount(true);
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        if (error) {
            toast.error('Erro ao atualizar email: ' + error.message);
        } else {
            toast.success('Email de confirmação enviado para o novo endereço!');
            setNewEmail('');
        }
        setUpdatingAccount(true);
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }
        setUpdatingAccount(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            toast.error('Erro ao atualizar senha: ' + error.message);
        } else {
            toast.success('Senha atualizada com sucesso!');
            setNewPassword('');
            setConfirmPassword('');
        }
        setUpdatingAccount(false);
    };

    return (
        <MobileLayout showNav={false}>
            <div className="px-5 py-6 safe-area-top min-h-screen bg-background">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/settings')}
                            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                Master Panel
                            </h1>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Modo Administrador</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mb-8 bg-muted p-1 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={cn("flex-1 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'stats' ? "bg-background shadow-sm" : "text-muted-foreground")}
                    >Estatísticas</button>
                    <button
                        onClick={() => setActiveTab('links')}
                        className={cn("flex-1 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'links' ? "bg-background shadow-sm" : "text-muted-foreground")}
                    >Links</button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={cn("flex-1 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'security' ? "bg-background shadow-sm" : "text-muted-foreground")}
                    >Segurança</button>
                </div>

                {activeTab === 'stats' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-card border border-border rounded-2xl">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                                    <Users className="w-5 h-5 text-primary" />
                                </div>
                                <p className="text-2xl font-bold">{totalUsers}</p>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Utilizadores</p>
                            </div>
                            <div className="p-4 bg-card border border-border rounded-2xl">
                                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mb-3">
                                    <Globe className="w-5 h-5 text-success" />
                                </div>
                                <p className="text-2xl font-bold">{totalDocs}</p>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Docs Salvos</p>
                            </div>
                        </div>

                        <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl">
                            <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4" />
                                Bem-vindo, Administrador
                            </h3>
                            <p className="text-sm text-balance leading-relaxed">
                                Este é o seu centro de comando. Aqui você pode gerir o conteúdo global do app e acompanhar o crescimento da plataforma.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'links' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="p-5 bg-card border border-border rounded-3xl space-y-4">
                            <h3 className="font-bold text-lg">Adicionar Link Útil</h3>
                            <div className="space-y-3">
                                <Input
                                    placeholder="Etiqueta (ex: Segurança Social)"
                                    value={newLinkLabel}
                                    onChange={(e) => setNewLinkLabel(e.target.value)}
                                    className="h-12 rounded-xl"
                                />
                                <Input
                                    placeholder="URL (https://...)"
                                    value={newLinkUrl}
                                    onChange={(e) => setNewLinkUrl(e.target.value)}
                                    className="h-12 rounded-xl"
                                />
                                <Button
                                    onClick={handleAddLink}
                                    disabled={loading || !newLinkLabel}
                                    className="w-full h-12 rounded-xl font-bold"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publicar Link Global'}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-bold px-1 uppercase text-xs text-muted-foreground tracking-widest">Links Ativos</h3>
                            {links.map((link) => (
                                <div key={link.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
                                    <div className="min-w-0">
                                        <p className="font-bold truncate">{link.label}</p>
                                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteLink(link.id)}
                                        className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            {links.length === 0 && <p className="text-center py-10 text-muted-foreground text-sm">Nenhum link ativo.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="p-6 bg-card border border-border rounded-3xl space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Mail className="w-5 h-5" />
                                    <h3 className="font-bold">Alterar Email Master</h3>
                                </div>
                                <p className="text-xs text-muted-foreground">O novo email precisará de ser confirmado para efetuar a troca.</p>
                                <div className="space-y-3">
                                    <Input
                                        placeholder="Novo email master"
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="h-12 rounded-xl"
                                    />
                                    <Button
                                        onClick={handleUpdateEmail}
                                        disabled={updatingAccount || !newEmail}
                                        className="w-full h-12 rounded-xl font-bold"
                                        variant="outline"
                                    >
                                        Atualizar Email
                                    </Button>
                                </div>
                            </div>

                            <hr className="border-border" />

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Key className="w-5 h-5" />
                                    <h3 className="font-bold">Alterar Senha</h3>
                                </div>
                                <div className="space-y-3">
                                    <Input
                                        placeholder="Nova senha"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="h-12 rounded-xl"
                                    />
                                    <Input
                                        placeholder="Confirmar nova senha"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="h-12 rounded-xl"
                                    />
                                    <Button
                                        onClick={handleUpdatePassword}
                                        disabled={updatingAccount || !newPassword}
                                        className="w-full h-12 rounded-xl font-bold"
                                    >
                                        {updatingAccount ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Nova Senha'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-2xl flex items-start gap-3">
                            <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Como Administrador Master, as alterações aqui afetam diretamente as suas credenciais de acesso ao sistema. Guarde bem os novos dados.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </MobileLayout>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
