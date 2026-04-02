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
import { useApp } from '@/contexts/AppContext';

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, updateProfile, loading } = useProfile();
  const { t, setLanguage, language } = useApp();
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
    setLanguage(lang as any);
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
      const { data, error } = await supabase.functions.invoke('delete-account', {
        body: { user_id: user.id }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Deletion failed');

      await signOut();
      toast.success(t('settings.delete.success'));
      navigate('/auth');
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(error?.message || t('settings.delete.error') || 'Erro ao excluir conta. Contacte o suporte.');
      setDeletingAccount(false);
    }
  };

  const isRefundEligible = profile?.plan_status === 'premium' && profile?.payment_date && (
    (new Date().getTime() - new Date(profile.payment_date).getTime()) < (7 * 24 * 60 * 60 * 1000)
  );

  const settingsItems = [
    {
      id: 'profile-name',
      icon: User,
      label: t('settings.displayName'),
      value: profile?.display_name || user?.email?.split('@')[0],
      onClick: () => setShowNameDialog(true),
    },
    {
      id: 'profile',
      icon: User,
      label: t('settings.myProfile'),
      onClick: () => navigate('/profile', { replace: true }),
    },
    {
      id: 'categories',
      icon: FolderPlus,
      label: t('settings.docCategories'),
      onClick: () => navigate('/settings/categories'),
    },
    {
      id: 'quickaccess',
      icon: Star,
      label: t('settings.quickAccess'),
      onClick: () => navigate('/settings/quick-access'),
    },
    {
      id: 'language',
      icon: Globe,
      label: t('settings.language'),
      value: language === 'en' ? t('language.en') : t('language.pt'),
      onClick: () => setShowLanguageDialog(true),
    },
    {
      id: 'theme',
      icon: Palette,
      label: t('settings.theme'),
      value: profile?.theme === 'dark' ? t('settings.theme.dark') : t('settings.theme.light'),
      onClick: () => setShowThemeDialog(true),
    },
    {
      id: 'about',
      icon: Info,
      label: t('settings.about'),
      onClick: () => navigate('/about'),
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
          <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
        </div>

        {/* User Info */}
        <div className="mb-8 glass-card p-6 shadow-xl shadow-primary/5 rounded-[2rem] border-primary/10">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{t('settings.connectedAs')}</p>
          <p className="text-xl font-black text-foreground tracking-tight">{user?.email}</p>
        </div>

        {/* Settings List */}
        <div className="space-y-3 mb-10 text-pretty">
          {settingsItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={cn(
                  'w-full flex items-center gap-4 p-5 rounded-[2rem] glass-card glass-card-hover',
                  'animate-slide-up border-primary/5'
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
                <p className="font-bold text-primary">{t('settings.admin_panel')}</p>
                <p className="text-xs text-primary/70">{t('settings.admin_desc')}</p>
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
            className="w-full flex items-center gap-4 p-5 rounded-[2rem] glass-card glass-card-hover border-primary/5"
          >
            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
              {loggingOut ? (
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              ) : (
                <LogOut className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <span className="font-medium text-foreground">{t('settings.logout')}</span>
          </button>

          {isRefundEligible && (
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full flex flex-col items-center gap-2 p-6 rounded-[2rem] bg-orange-500/10 border-2 border-orange-500/30 hover:bg-orange-500/20 transition-all text-center group"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-orange-500" />
              </div>
              <div className="space-y-1">
                <span className="font-black text-orange-500 text-sm tracking-widest uppercase">{t('settings.refund')}</span>
                <span className="block text-[10px] text-orange-400/80 font-bold uppercase tracking-widest leading-none">{t('settings.refund_guarantee')}</span>
              </div>
              <p className="text-xs text-orange-200/50 font-medium px-4">
                {t('settings.refund_desc')}
              </p>
            </button>
          )}

          <button
            onClick={() => setShowDeleteDialog(true)}
            className="w-full flex items-center gap-4 p-5 rounded-[2rem] bg-destructive/5 border border-destructive/20 hover:bg-destructive/10 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <span className="font-medium text-destructive">{t('settings.deleteAccount')}</span>
          </button>
        </div>

        {/* Version */}
        <div className="mt-16 text-center pb-8 animate-fade-in">
          <p className="text-xs font-black text-primary/40 uppercase tracking-[0.3em]">{t('settings.version')} 1.0.0</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-8 h-px bg-primary/10" />
            <p className="text-[10px] font-medium text-muted-foreground italic">
              {t('settings.madeWith')}
            </p>
            <span className="w-8 h-px bg-primary/10" />
          </div>
        </div>
      </div>

      {/* Language Dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t('settings.language.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-4">
            <button
              onClick={() => handleLanguageChange('pt')}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all',
                language === 'pt'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <span className="font-medium">{t('language.pt')}</span>
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all',
                language === 'en'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <span className="font-medium">{t('language.en')}</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Theme Dialog */}
      <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t('settings.theme.title')}</DialogTitle>
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
              <span className="font-medium">{t('settings.theme.light')}</span>
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
              <span className="font-medium">{t('settings.theme.dark')}</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Name Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t('settings.name.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.name.label')}</label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full p-3 rounded-xl border border-input bg-background"
                placeholder={t('settings.name.placeholder')}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowNameDialog(false)} className="flex-1">
                {t('cancel')}
              </Button>
              <Button onClick={handleSaveName} disabled={savingName} className="flex-1">
                {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : t('save')}
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
            <AlertDialogTitle className="text-center text-xl">{t('settings.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t('settings.delete.desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2">
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="w-full h-12 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
            >
              {deletingAccount ? <Loader2 className="w-5 h-5 animate-spin" /> : t('settings.delete.confirm')}
            </AlertDialogAction>
            <AlertDialogCancel className="w-full h-12 rounded-xl border-none font-medium">
              {t('cancel')}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileLayout>
  );
}
