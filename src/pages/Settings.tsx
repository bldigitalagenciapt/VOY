import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ChevronLeft, Globe, Shield, Cloud, Palette, Info, ChevronRight, LogOut, Loader2, User, FolderPlus, Star, Trash2, AlertTriangle, ShieldCheck, Terminal } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, updateProfile, loading } = useProfile();
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const isAdmin = profile?.is_admin === true || user?.email?.toLowerCase().trim() === 'brunoalmeidaoficial21@gmail.com';

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    navigate('/auth');
  };

  const handleLanguageChange = async (lang: string) => {
    await updateProfile({ language: lang });
    setShowLanguageDialog(false);
  };

  const handleThemeChange = async (theme: string) => {
    await updateProfile({ theme });
    setShowThemeDialog(false);
  };

  const [tempName, setTempName] = useState(profile?.display_name || '');
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [savingName, setSavingName] = useState(false);

  const handleSaveName = async () => {
    setSavingName(true);
    await updateProfile({ display_name: tempName });
    setSavingName(false);
    setShowNameDialog(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeletingAccount(true);
    try {
      // 1. Delete profile (cascades to other tables)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // 2. Sign Out
      await signOut();
      toast.success('Sua conta e dados foram removidos com sucesso.');
      navigate('/auth');
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Erro ao excluir conta. Contacte o suporte.');
      setDeletingAccount(false);
    }
  };

  const settingsItems = [
    {
      id: 'profile-name',
      icon: User,
      label: 'Nome de Exibição',
      value: profile?.display_name || user?.email?.split('@')[0],
      onClick: () => setShowNameDialog(true),
    },
    {
      id: 'profile',
      icon: User,
      label: 'Meu Perfil',
      onClick: () => navigate('/profile'),
    },
    {
      id: 'categories',
      icon: FolderPlus,
      label: 'Categorias de Documentos',
      onClick: () => navigate('/settings/categories'),
    },
    {
      id: 'quickaccess',
      icon: Star,
      label: 'Acesso Rápido',
      onClick: () => navigate('/settings/quick-access'),
    },
    {
      id: 'language',
      icon: Globe,
      label: 'Idioma',
      value: profile?.language === 'en' ? 'English' : 'Português',
      onClick: () => setShowLanguageDialog(true),
    },
    {
      id: 'theme',
      icon: Palette,
      label: 'Tema',
      value: profile?.theme === 'dark' ? 'Escuro' : 'Claro',
      onClick: () => setShowThemeDialog(true),
    },
    {
      id: 'about',
      icon: Info,
      label: 'Sobre o VOY',
      onClick: () => { window.open('https://voyapp.com', '_blank') },
    },
    {
      id: 'privacy',
      icon: ShieldCheck,
      label: 'Privacidade e Termos',
      onClick: () => { window.open('https://voyapp.com/privacy', '_blank') },
    },
  ];

  if (loading) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showNav={false}>
      <div className="px-5 py-6 safe-area-top">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        </div>

        {/* User Info */}
        <div className="mb-6 p-4 bg-card rounded-2xl border border-border">
          <p className="text-sm text-muted-foreground">Conectado como</p>
          <p className="font-semibold text-foreground">{user?.email}</p>
        </div>

        {/* Settings List */}
        <div className="space-y-2 mb-8">
          {settingsItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border',
                  'hover:border-primary/30 transition-all animate-slide-up'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{item.label}</p>
                </div>
                {item.value && (
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                )}
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-primary/10 border-2 border-primary/20 hover:bg-primary/20 transition-all border-dashed"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-primary">Master Panel</p>
                <p className="text-xs text-primary/70">Acesso Administrativo</p>
              </div>
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
          )}

          <button
            onClick={async () => {
              setLoggingOut(true);
              await signOut();
              window.location.href = '/auth';
            }}
            disabled={loggingOut}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border hover:bg-muted transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              {loggingOut ? (
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              ) : (
                <LogOut className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <span className="font-medium text-foreground">Sair da conta</span>
          </button>

          <button
            onClick={() => setShowDeleteDialog(true)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <span className="font-medium text-destructive">Excluir minha conta e dados</span>
          </button>
        </div>

        {/* Version */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">VOY v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">
            Feito com 💚 para imigrantes em Portugal
          </p>
        </div>
      </div>

      {/* Language Dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Escolher idioma</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-4">
            <button
              onClick={() => handleLanguageChange('pt')}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all',
                profile?.language === 'pt'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <span className="font-medium">Português</span>
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all',
                profile?.language === 'en'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <span className="font-medium">English</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Theme Dialog */}
      <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Escolher tema</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-4">
            <button
              onClick={() => handleThemeChange('light')}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all',
                profile?.theme === 'light'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <span className="font-medium">☀️ Claro</span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all',
                profile?.theme === 'dark'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <span className="font-medium">🌙 Escuro</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Name Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Editar nome</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full p-3 rounded-xl border border-input bg-background"
                placeholder="Seu nome"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNameDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveName} disabled={savingName} className="flex-1">
                {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-3xl">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2 mx-auto">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center text-xl">Excluir Permanentemente?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Esta ação é **irreversível**. Todos os seus documentos salvos, notas, transações e histórico serão apagados para sempre em conformidade com a **LGPD**.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2">
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="w-full h-12 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
            >
              {deletingAccount ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sim, apagar tudo'}
            </AlertDialogAction>
            <AlertDialogCancel className="w-full h-12 rounded-xl border-none font-medium">
              Cancelar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileLayout>
  );
}
