import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAimaProcess } from '@/hooks/useAimaProcess';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { QuickAccessCard } from '@/components/ui/QuickAccessCard';
import { ActionCard } from '@/components/ui/ActionCard';
import { CircularProgress } from '@/components/ui/CircularProgress';
import {
  FileText,
  Settings,
  Loader2,
  Wallet,
  Calendar as CalendarIcon,
  Bell,
  ClipboardCheck,
  Calculator as CalcIcon,
  ExternalLink,
  Briefcase,
  Users,
  Globe,
  Plus,
  ShieldAlert,
  StickyNote,
  Star,
  HelpCircle,
  Bot,
  Shield,
  Sparkles,
  Upload,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Archive,
  User as UserIcon
} from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { EmergencyModal } from '@/components/modals/EmergencyModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useNotes } from '@/hooks/useNotes';
import { useUserDocuments } from '@/hooks/useUserDocuments';
import { toast } from 'sonner';
import { CommunityCard } from '@/components/home/CommunityCard';
import { PremiumWelcomeModal } from '@/components/PremiumWelcomeModal';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';

type NumberField = 'nif' | 'niss' | 'sns' | 'passport';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, updateNumber, updateProfile, loading: profileLoading, refetch } = useProfile();
  const { t } = useApp();
  const { process: aimaProcess } = useAimaProcess();
  const { notes } = useNotes();
  const { userDocuments } = useUserDocuments();

  const [showNumberDialog, setShowNumberDialog] = useState<string | null>(null);
  const [showAllQuickAccess, setShowAllQuickAccess] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [tempNumber, setTempNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showWelcome, setShowWelcome] = useState(false);
  const { documents } = useDocuments();
  const isPremium = profile?.plan_status === 'premium';

  const { handleCheckout, loading: checkoutLoading } = useSubscription();

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowWelcome(true);
      refetch(); // Forçar atualização do perfil para verificar status premium
      searchParams.delete('success');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, refetch]);

  // ─── PAYWALL: Full sales page for non-premium users ───
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  if (profile && !isPremium && !profileLoading && !showWelcome) {
    const prices = {
      monthly: 1.99,
      yearly: 19.90
    };

    const discount = Math.round((1 - (prices.yearly / (prices.monthly * 12))) * 100);

    return (
      <MobileLayout>
        <div className="px-5 py-8 safe-area-top min-h-full flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/10">
              <Shield className="w-12 h-12 text-blue-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>

          <h1 className="text-[1.6rem] font-black text-foreground leading-tight mb-2 max-w-xs tracking-tight text-center">
            Escolha seu Plano Premium
          </h1>

          <p className="text-sm text-muted-foreground font-medium mb-8 max-w-[280px] text-center">
            Desbloqueie todas as ferramentas essenciais para sua vida em Portugal.
          </p>

          {/* Plan Toggle */}
          <div className="w-full max-w-sm bg-muted/30 p-1 rounded-2xl flex mb-8 border border-border">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                billingCycle === 'monthly' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:bg-background/50"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative",
                billingCycle === 'yearly' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:bg-background/50"
              )}
            >
              Anual
              <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[8px] px-2 py-0.5 rounded-full ring-2 ring-background">
                -{discount}%
              </span>
            </button>
          </div>

          {/* Pricing Info */}
          <div className="mb-8 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black">€{billingCycle === 'monthly' ? prices.monthly : prices.yearly}</span>
              <span className="text-muted-foreground text-sm font-bold uppercase tracking-widest">
                / {billingCycle === 'monthly' ? 'mês' : 'ano'}
              </span>
            </div>
            {billingCycle === 'yearly' && (
              <p className="text-xs text-emerald-500 font-bold mt-1 uppercase tracking-widest">Oferta de Lançamento</p>
            )}
          </div>

          <div className="w-full max-w-sm space-y-3 mb-8">
            {[
              { icon: Upload, text: "Cofre de Documentos", sub: "Espaço ilimitado e seguro" },
              { icon: ShieldCheck, text: "Tracking Completo", sub: "Siga cada passo da imigração" },
              { icon: Bell, text: "Alertas de Validade", sub: "Nunca perca um prazo importante" },
              { icon: FileText, text: "NIF e NISS Digitais", sub: "Acesso rápido em qualquer lugar" },
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border text-left">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{benefit.text}</p>
                  <p className="text-[11px] text-muted-foreground">{benefit.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => handleCheckout(billingCycle)}
            disabled={checkoutLoading}
            className="w-full max-w-sm h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-black text-lg tracking-wider gap-3 shadow-xl shadow-blue-500/25 transition-all active:scale-[0.98]"
          >
            {checkoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {checkoutLoading ? "Processando..." : "Assinar Agora"}
          </Button>

          <p className="mt-4 text-xs text-muted-foreground font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Pagamento Seguro via Stripe
          </p>
        </div>
      </MobileLayout>
    );
  }

  const handleSaveNumber = async () => {
    if (showNumberDialog) {
      try {
        setSaving(true);
        const standardFields = ['nif', 'niss', 'sns', 'passport'];
        if (standardFields.includes(showNumberDialog as string)) {
          await updateNumber(showNumberDialog as NumberField, tempNumber);
        } else {
          const customBlocks = profile?.custom_quick_access || [];
          const updatedBlocks = customBlocks.map((b) =>
            b.label === showNumberDialog ? { ...b, value: tempNumber } : b
          );
          await updateProfile({ custom_quick_access: updatedBlocks });
        }
        toast.success(`${getDialogTitle(showNumberDialog)} ${t('toast.save.success')}`);
        setShowNumberDialog(null);
        setTempNumber('');
      } catch (error) {
        toast.error(t('toast.save.error'));
      } finally {
        setSaving(false);
      }
    }
  };

  const openNumberDialog = (type: string, value: string) => {
    setTempNumber(value);
    setShowNumberDialog(type);
  };

  const profileFields = ['nif', 'niss', 'sns', 'passport'] as const;
  const completedFields = profileFields.filter(field => profile?.[field]).length;
  const completionPercentage = Math.round((completedFields / profileFields.length) * 100);

  const getDialogTitle = (type: string | null) => {
    switch (type) {
      case 'nif': return 'NIF';
      case 'niss': return 'NISS';
      case 'sns': return 'SNS';
      case 'passport': return t('home.passport_placeholder').replace(t('home.doc_number') + ' ', '');
      default: return type || '';
    }
  };

  const processPercentage = aimaProcess?.process_type
    ? Math.min(Math.round((aimaProcess.step || 0) / 5 * 100), 100)
    : 0;

  if (profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MobileLayout>
      <div className="pb-32 pt-8 px-6 bg-background min-h-screen">

        {/* Header Section */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-br from-primary to-blue-400">
              <div className="w-full h-full rounded-full border-2 border-background overflow-hidden bg-muted flex items-center justify-center">
                {profile?.signedAvatarUrl || profile?.avatar_url ? (
                  <img
                    src={profile.signedAvatarUrl || profile.avatar_url || ''}
                    alt="Foto"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent && !parent.querySelector('.avatar-fallback')) {
                        const icon = document.createElement('div');
                        icon.className = 'avatar-fallback w-full h-full flex items-center justify-center';
                        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-muted-foreground"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                        parent.appendChild(icon);
                      }
                    }}
                  />
                ) : (
                  <UserIcon className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground leading-none">
                {t('home.hello')}, {profile?.display_name?.split(' ')[0] || t('home.guest')}
              </h1>
              <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest opacity-60">
                {t('home.welcome')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/agenda')}
              className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground shadow-soft hover:bg-muted/50 transition-colors"
            >
              <CalendarIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowEmergency(true)}
              className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-soft hover:bg-red-500/20 transition-all animate-pulse"
            >
              <ShieldAlert className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/notifications')}
              className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center text-foreground shadow-soft hover:bg-muted/50 transition-colors"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Seu Progresso Section */}
        <section className="mb-8">
          <h2 className="text-lg font-black text-foreground mb-6 uppercase tracking-wider text-center md:text-left">{t('home.progress')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <CircularProgress
              percentage={completionPercentage}
              label={t('home.profile')}
              evolution="+5%"
              onClick={() => navigate('/profile')}
            />
            <CircularProgress
              percentage={processPercentage}
              label={t('home.process')}
              evolution="+12%"
              onClick={() => navigate('/aima')}
            />
          </div>
        </section>

        {/* Acesso Rápido Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between md:justify-start gap-4 mb-6">
            <h2 className="text-lg font-black text-foreground uppercase tracking-wider">{t('home.quickAccess')}</h2>
            <button
              onClick={() => setShowAllQuickAccess(true)}
              className="text-xs font-black text-primary uppercase tracking-widest hover:underline"
            >
              {t('home.viewAll')}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <QuickAccessCard
              label="NIF"
              value={profile?.nif || ''}
              placeholder="Adicionar NIF"
              onClick={() => openNumberDialog('nif', profile?.nif || '')}
              className="w-full"
            />
            <QuickAccessCard
              label="NISS"
              value={profile?.niss || ''}
              placeholder="Adicionar NISS"
              onClick={() => openNumberDialog('niss', profile?.niss || '')}
              className="w-full"
            />
          </div>
        </section>

        {/* Anotações Section */}
        {
          notes.filter(n => n.is_important).length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between md:justify-start gap-4 mb-6">
                <h2 className="text-lg font-black text-foreground uppercase tracking-wider">{t('home.notes')}</h2>
                <button
                  onClick={() => navigate('/notes')}
                  className="text-xs font-black text-primary uppercase tracking-widest hover:underline"
                >
                  {t('home.see_all')}
                </button>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                {notes.filter(n => n.is_important).map((note) => (
                  <div
                    key={note.id}
                    onClick={() => navigate('/notes')}
                    className="min-w-[200px] max-w-[240px] bg-card border border-border rounded-[2rem] p-5 shadow-soft hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <StickyNote className="w-12 h-12 text-primary blur-sm" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <StickyNote className="w-4 h-4 text-primary" />
                        </div>
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      </div>
                      <h3 className="font-bold text-foreground text-sm truncate mb-1">{note.title}</h3>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        }

        {/* Dialog for All Quick Access Documents */}
        <Dialog open={showAllQuickAccess} onOpenChange={setShowAllQuickAccess}>
          <DialogContent className="max-w-[calc(100vw-2rem)] rounded-[2.5rem] p-6 max-h-[80vh] overflow-y-auto">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black text-center">{t('home.quick_access')}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4">
              <QuickAccessCard
                label="NIF"
                value={profile?.nif || ''}
                placeholder={t('home.nif_placeholder')}
                onClick={() => openNumberDialog('nif', profile?.nif || '')}
              />
              <QuickAccessCard
                label="NISS"
                value={profile?.niss || ''}
                placeholder={t('home.niss_placeholder')}
                onClick={() => openNumberDialog('niss', profile?.niss || '')}
              />
              <QuickAccessCard
                label="SNS"
                value={profile?.sns || ''}
                placeholder={t('home.sns_placeholder')}
                onClick={() => openNumberDialog('sns', profile?.sns || '')}
              />
              <QuickAccessCard
                label="Passaporte"
                value={profile?.passport || ''}
                placeholder={t('home.passport_placeholder')}
                onClick={() => openNumberDialog('passport', profile?.passport || '')}
              />
              {profile?.custom_quick_access?.map((block) => (
                <QuickAccessCard
                  key={block.id}
                  label={block.label}
                  value={block.value || ''}
                  placeholder={`${t('docs.add')} ${block.label}`}
                  onClick={() => openNumberDialog(block.label, block.value || '')}
                />
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Comunidade Voy Section */}
        <section className="mb-8">
          <CommunityCard />
        </section>

        {/* Alertas de Validade */}
        {
          isPremium && documents.filter(doc => {
            if (!doc.expiry_date) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const expiry = new Date(doc.expiry_date);
            const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 30;
          }).length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-black text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                {t('home.alerts')}
              </h2>
              <div className="space-y-3">
                {documents
                  .filter(doc => {
                    if (!doc.expiry_date) return false;
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const expiry = new Date(doc.expiry_date);
                    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return diffDays <= 30;
                  })
                  .sort((a, b) => new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime())
                  .slice(0, 3)
                  .map((doc) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const expiry = new Date(doc.expiry_date!);
                    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    const isExpired = diffDays < 0;

                    return (
                      <div
                        key={doc.id}
                        onClick={() => navigate('/documents')}
                        className={cn(
                          "p-4 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all active:scale-[0.98]",
                          isExpired ? "bg-red-500/5 border-red-500/20" : "bg-orange-500/5 border-orange-500/20"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          isExpired ? "bg-red-500/10 text-red-500" : "bg-orange-500/10 text-orange-500"
                        )}>
                          <Archive className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{doc.name}</p>
                          <p className={cn(
                            "text-[11px] font-black uppercase tracking-wider mt-0.5",
                            isExpired ? "text-red-500" : "text-orange-500"
                          )}>
                            {isExpired ? t('docs.status.expired') : t('docs.status.expires_in').replace('{{days}}', diffDays.toString())}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-30" />
                      </div>
                    );
                  })}
              </div>
            </section>
          )
        }

        {/* Serviços Grid */}
        <section className="mb-8">
          <h2 className="text-lg font-black text-foreground mb-6 uppercase tracking-wider text-center md:text-left">{t('home.services')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <ActionCard
              icon={<ClipboardCheck className="w-8 h-8 text-blue-500" />}
              title={t('services.steps')}
              description={t('services.steps.desc')}
              onClick={() => navigate('/checklist')}
            />
            <ActionCard
              icon={<CalcIcon className="w-8 h-8 text-orange-500" />}
              title={t('services.simulator')}
              description={t('services.simulator.desc')}
              onClick={() => navigate('/calculator')}
            />
            <ActionCard
              icon={<Briefcase className="w-8 h-8 text-emerald-500" />}
              title={t('services.jobs')}
              description={t('services.jobs.desc')}
              onClick={() => navigate('/emprego')}
            />
            <ActionCard
              icon={<ExternalLink className="w-8 h-8 text-purple-500" />}
              title={t('services.links')}
              description={t('services.links.desc')}
              onClick={() => navigate('/useful-links')}
            />
            <ActionCard
              icon={<FileText className="w-8 h-8 text-blue-400" />}
              title={t('services.docs')}
              description={t('services.docs.desc')}
              onClick={() => navigate('/documents')}
            />
            <ActionCard
              icon={<Globe className="w-8 h-8 text-indigo-500" />}
              title={t('services.aima')}
              description={t('services.aima.desc')}
              onClick={() => navigate('/aima')}
            />

            <ActionCard
              icon={<Wallet className="w-8 h-8 text-amber-500" />}
              title={t('services.wallet')}
              description={t('services.wallet.desc')}
              onClick={() => navigate('/meu-bolso')}
            />
            <ActionCard
              icon={<StickyNote className="w-8 h-8 text-yellow-500" />}
              title={t('services.notes')}
              description={t('services.notes.desc')}
              onClick={() => navigate('/notes')}
            />
          </div>
        </section>



      </div >

      {/* Number Input Dialog */}
      < Dialog open={!!showNumberDialog
      } onOpenChange={() => setShowNumberDialog(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              {getDialogTitle(showNumberDialog)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-3">
              <Label htmlFor="number" className="text-xs font-bold uppercase tracking-widest opacity-60">{t('home.doc_number')}</Label>
              <Input
                id="number"
                value={tempNumber}
                onChange={(e) => setTempNumber(e.target.value)}
                placeholder="000 000 000"
                className="h-16 text-xl font-black rounded-2xl bg-muted/30 border-none focus-visible:ring-primary"
              />
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setShowNumberDialog(null)}
                className="flex-1 h-14 rounded-full font-bold border-border"
                disabled={saving}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={handleSaveNumber}
                className="flex-1 h-14 rounded-full font-black bg-primary text-white"
                disabled={saving}
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : t('save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EmergencyModal open={showEmergency} onOpenChange={setShowEmergency} />
      <PremiumWelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} />
    </MobileLayout>
  );
}
