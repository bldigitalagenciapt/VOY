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
  ChevronRight
} from 'lucide-react';
import { EmergencyModal } from '@/components/modals/EmergencyModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';
import { useUserDocuments } from '@/hooks/useUserDocuments';
import { toast } from 'sonner';
import { CommunityCard } from '@/components/home/CommunityCard';
import { PremiumWelcomeModal } from '@/components/PremiumWelcomeModal';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type NumberField = 'nif' | 'niss' | 'sns' | 'passport';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, updateNumber, updateProfile, loading: profileLoading } = useProfile();
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
  const isPremium = profile?.plan_status === 'premium';

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowWelcome(true);
      searchParams.delete('success');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // ─── PAYWALL: Full sales page for non-premium users ───
  if (profile && !isPremium && !profileLoading) {
    const handleCheckout = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('stripe-checkout', {
          body: { user_id: profile?.user_id, user_email: profile?.user_profile }
        });
        if (error) throw error;
        if (data?.url) window.location.href = data.url;
      } catch (err) {
        toast.error('Erro ao iniciar pagamento. Tente novamente.');
        console.error('Checkout error:', err);
      }
    };

    return (
      <MobileLayout>
        <div className="px-5 py-8 safe-area-top min-h-full flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/10">
              <Shield className="w-12 h-12 text-blue-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>

          <h1 className="text-[1.6rem] font-black text-foreground leading-tight mb-3 max-w-xs tracking-tight">
            Tenha seu cofre digital de imigrante por apenas{' '}
            <span className="text-blue-500">19,90€</span>
          </h1>

          <p className="text-sm text-muted-foreground font-medium mb-8 max-w-[280px]">
            Pagamento único. Acesso vitalício. Sem mensalidades.
          </p>

          <div className="w-full max-w-sm space-y-3 mb-8">
            {[
              { icon: Upload, text: 'Uploads ilimitados de documentos', sub: 'PDF, fotos, scans e mais' },
              { icon: ShieldCheck, text: 'Cofre criptografado', sub: 'Seus documentos seguros e privados' },
              { icon: Bell, text: 'Alertas de validade', sub: 'Nunca perca um prazo importante' },
              { icon: FileText, text: 'Acesso vitalício garantido', sub: 'Pague uma vez, use para sempre' },
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
            onClick={handleCheckout}
            className="w-full max-w-sm h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-black text-lg tracking-wider gap-3 shadow-xl shadow-blue-500/25 transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-5 h-5" />
            DESBLOQUEAR TUDO — 19,90€
          </Button>

          <p className="mt-4 text-xs text-muted-foreground font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Garantia de reembolso de 7 dias
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
        toast.success(`${getDialogTitle(showNumberDialog)} atualizado!`);
        setShowNumberDialog(null);
        setTempNumber('');
      } catch (error) {
        toast.error('Erro ao salvar número.');
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
      case 'passport': return 'Passaporte';
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
              <div className="w-full h-full rounded-full border-2 border-background overflow-hidden bg-muted">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-primary">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground leading-none">
                Olá, {profile?.display_name?.split(' ')[0] || 'Imigrante'}
              </h1>
              <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest opacity-60">
                Sua jornada para Portugal
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
          <h2 className="text-lg font-black text-foreground mb-6 uppercase tracking-wider text-center md:text-left">Seu Progresso</h2>
          <div className="grid grid-cols-2 gap-4">
            <CircularProgress
              percentage={completionPercentage}
              label="Perfil"
              evolution="+5%"
              onClick={() => navigate('/profile')}
            />
            <CircularProgress
              percentage={processPercentage}
              label="Processo"
              evolution="+12%"
              onClick={() => navigate('/aima')}
            />
          </div>
        </section>

        {/* Acesso Rápido Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between md:justify-start gap-4 mb-6">
            <h2 className="text-lg font-black text-foreground uppercase tracking-wider">Acesso Rápido</h2>
            <button
              onClick={() => setShowAllQuickAccess(true)}
              className="text-xs font-black text-primary uppercase tracking-widest hover:underline"
            >
              Ver Todos
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
        {notes.filter(n => n.is_important).length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between md:justify-start gap-4 mb-6">
              <h2 className="text-lg font-black text-foreground uppercase tracking-wider">Anotações</h2>
              <button
                onClick={() => navigate('/notes')}
                className="text-xs font-black text-primary uppercase tracking-widest hover:underline"
              >
                Ver Todas
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
        )}

        {/* Dialog for All Quick Access Documents */}
        <Dialog open={showAllQuickAccess} onOpenChange={setShowAllQuickAccess}>
          <DialogContent className="max-w-[calc(100vw-2rem)] rounded-[2.5rem] p-6 max-h-[80vh] overflow-y-auto">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black text-center">Acesso Rápido</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4">
              <QuickAccessCard
                label="NIF"
                value={profile?.nif || ''}
                placeholder="Adicionar NIF"
                onClick={() => openNumberDialog('nif', profile?.nif || '')}
              />
              <QuickAccessCard
                label="NISS"
                value={profile?.niss || ''}
                placeholder="Adicionar NISS"
                onClick={() => openNumberDialog('niss', profile?.niss || '')}
              />
              <QuickAccessCard
                label="SNS"
                value={profile?.sns || ''}
                placeholder="Adicionar SNS"
                onClick={() => openNumberDialog('sns', profile?.sns || '')}
              />
              <QuickAccessCard
                label="Passaporte"
                value={profile?.passport || ''}
                placeholder="Adicionar Passaporte"
                onClick={() => openNumberDialog('passport', profile?.passport || '')}
              />
              {profile?.custom_quick_access?.map((block) => (
                <QuickAccessCard
                  key={block.id}
                  label={block.label}
                  value={block.value || ''}
                  placeholder={`Adicionar ${block.label}`}
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

        {/* Serviços Grid */}
        <section className="mb-8">
          <h2 className="text-lg font-black text-foreground mb-6 uppercase tracking-wider text-center md:text-left">Serviços</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <ActionCard
              icon={<ClipboardCheck className="w-8 h-8 text-blue-500" />}
              title="Primeiros Passos"
              description="Guia Essencial"
              onClick={() => navigate('/checklist')}
            />
            <ActionCard
              icon={<CalcIcon className="w-8 h-8 text-orange-500" />}
              title="Simulador"
              description="Salário Líquido"
              onClick={() => navigate('/calculator')}
            />
            <ActionCard
              icon={<Briefcase className="w-8 h-8 text-emerald-500" />}
              title="Emprego"
              description="Vagas e Dicas"
              onClick={() => navigate('/emprego')}
            />
            <ActionCard
              icon={<ExternalLink className="w-8 h-8 text-purple-500" />}
              title="Links Úteis"
              description="Links e Dicas"
              onClick={() => navigate('/useful-links')}
            />
            <ActionCard
              icon={<FileText className="w-8 h-8 text-blue-400" />}
              title="Documentos"
              description="Seus Arquivos"
              onClick={() => navigate('/documents')}
            />
            <ActionCard
              icon={<Globe className="w-8 h-8 text-indigo-500" />}
              title="Imigração"
              description="Seu Processo"
              onClick={() => navigate('/aima')}
            />

            <ActionCard
              icon={<Wallet className="w-8 h-8 text-amber-500" />}
              title="Meu Bolso"
              description="Gestor Financeiro"
              onClick={() => navigate('/meu-bolso')}
            />
            <ActionCard
              icon={<StickyNote className="w-8 h-8 text-yellow-500" />}
              title="Minhas Notas"
              description="Suas Anotações"
              onClick={() => navigate('/notes')}
            />
          </div>
        </section>



      </div>

      {/* Number Input Dialog */}
      <Dialog open={!!showNumberDialog} onOpenChange={() => setShowNumberDialog(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              {getDialogTitle(showNumberDialog)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-3">
              <Label htmlFor="number" className="text-xs font-bold uppercase tracking-widest opacity-60">Número do documento</Label>
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
                Cancelar
              </Button>
              <Button
                onClick={handleSaveNumber}
                className="flex-1 h-14 rounded-full font-black bg-primary text-white"
                disabled={saving}
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Emergency Modal */}
      <EmergencyModal open={showEmergency} onOpenChange={setShowEmergency} />

      {/* Premium Welcome Modal */}
      <PremiumWelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} />

    </MobileLayout>
  );
}
