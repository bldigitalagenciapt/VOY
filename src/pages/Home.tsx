import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAimaProcess } from '@/hooks/useAimaProcess';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { QuickAccessCard } from '@/components/ui/QuickAccessCard';
import { ActionCard } from '@/components/ui/ActionCard';
import { FileText, Globe, Settings, StickyNote, Loader2, Star, Wallet, Calendar as CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';
import { useDocuments } from '@/hooks/useDocuments';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { useUserDocuments } from '@/hooks/useUserDocuments';
import { toast } from 'sonner';
import { useQuickAccess } from '@/hooks/useQuickAccess';
import { visaTypes } from '@/data/visaTypes';
import { processTypes } from '@/pages/Aima';


import { NewsSlider } from '@/components/home/NewsSlider';
import { CalendarPreview } from '@/components/home/CalendarPreview';
import { CommunityCard } from '@/components/home/CommunityCard';
import { WelcomeModal } from '@/components/modals/WelcomeModal';
import { EmergencyModal } from '@/components/modals/EmergencyModal';
import {
  ShieldAlert,
  ArrowRight,
  ClipboardCheck,
  Calculator as CalcIcon,
  ExternalLink,
  Briefcase,
  User as UserIcon
} from 'lucide-react';

type NumberField = 'nif' | 'niss' | 'sns' | 'passport';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, updateNumber, updateProfile, loading: profileLoading } = useProfile();
  const { process: aimaProcess } = useAimaProcess(); // Corrected destructuring to 'process'
  const { notes } = useNotes();
  const { documents } = useDocuments();
  const { userDocuments, loading: docsLoading } = useUserDocuments(); // Consolidated destructuring
  const { quickAccessIds } = useQuickAccess();

  const [showNumberDialog, setShowNumberDialog] = useState<string | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [tempNumber, setTempNumber] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveNumber = async () => {
    if (showNumberDialog) {
      try {
        setSaving(true);
        // Check if it's a standard field or a custom one
        const standardFields = ['nif', 'niss', 'sns', 'passport'];
        if (standardFields.includes(showNumberDialog as string)) {
          await updateNumber(showNumberDialog as NumberField, tempNumber);
        } else {
          // Update custom block value
          const customBlocks = profile?.custom_quick_access || [];
          const updatedBlocks = customBlocks.map((b) =>
            b.label === showNumberDialog ? { ...b, value: tempNumber } : b
          );
          await updateProfile({ custom_quick_access: updatedBlocks });
        }
        toast.success(`${getDialogTitle(showNumberDialog)} atualizado com sucesso!`);
        setShowNumberDialog(null);
        setTempNumber('');
      } catch (error) {
        toast.error('Erro ao atualizar número. Tente novamente.');
      } finally {
        setSaving(false);
      }
    }
  };

  const openNumberDialog = (type: NumberField) => {
    const currentValue = profile?.[type] || '';
    setTempNumber(currentValue);
    setShowNumberDialog(type);
  };

  // Calculate profile completion
  const profileFields = ['nif', 'niss', 'sns', 'passport'] as const;
  const completedFields = profileFields.filter(field => profile?.[field]).length;
  const completionPercentage = Math.round((completedFields / profileFields.length) * 100);

  const getDialogTitle = (type: string | null) => {
    switch (type) {
      case 'nif': return 'NIF';
      case 'niss': return 'NISS';
      case 'sns': return 'Número SNS';
      case 'passport': return 'Passaporte';
      default: return type || '';
    }
  };

  // Determine alerts based on user state
  const alerts = [];
  if (!aimaProcess?.process_type && profile?.user_profile === 'legalizing') {
    alerts.push({
      message: 'Você ainda não configurou seu processo na AIMA',
      action: 'Configurar',
      onAction: () => navigate('/aima'),
    });
  }
  if (!profile?.nif) {
    alerts.push({
      message: 'Adicione seu NIF para ter acesso rápido',
      variant: 'info' as const,
    });
  }

  // Notification for deadlines (24h before)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const noteDeadlines = notes.filter(n => n.reminder_date?.startsWith(tomorrowStr));
  const aimaDeadlines = aimaProcess?.important_dates?.filter(d => d.date === tomorrowStr) || [];

  if (noteDeadlines.length > 0 || aimaDeadlines.length > 0) {
    alerts.push({
      message: `Você tem ${noteDeadlines.length + aimaDeadlines.length} prazos chegando em 24h!`,
      variant: 'warning' as const,
      action: 'Ver',
      onAction: () => navigate(noteDeadlines.length > 0 ? '/notes' : '/aima'),
    });
  }

  // Calculate documentation progress based on the active AIMA process
  const activeVisa = visaTypes.find(v => v.id === aimaProcess?.process_type);
  const activeProcess = processTypes.find(p => p.id === aimaProcess?.process_type);

  const requiredDocs = activeVisa?.requiredDocuments || [];
  const totalChecklistItems = requiredDocs.length;

  // A document is considered "completed" if:
  // 1. It's manually checked in the user_documents table
  // 2. OR if there's an actual file uploaded in the documents table with a similar name
  const completedChecklistItems = requiredDocs.filter(docName => {
    const isManualDone = userDocuments.some(ud => ud.document_name === docName && ud.is_completed);
    const hasUpload = documents.some(d =>
      d.name.toLowerCase().includes(docName.toLowerCase()) ||
      docName.toLowerCase().includes(d.name.toLowerCase())
    );
    return isManualDone || hasUpload;
  }).length;

  // Process completion calculation moved to widgets

  const starredNotes = notes.filter(n => n.is_important);


  if (profileLoading) {
    return (
      <MobileLayout>
        <div className="px-5 py-6 safe-area-top space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            <div className="flex gap-3 overflow-hidden">
              <SkeletonCard count={2} className="w-[140px] h-[100px]" />
            </div>
          </div>
          <div className="space-y-4">
            <SkeletonCard count={4} />
          </div>
        </div>
      </MobileLayout>
    );
  }

  const favoriteDocs = documents.filter(doc => quickAccessIds.includes(doc.id));

  return (
    <MobileLayout>
      <div className="px-5 pb-32 pt-safe-top min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Premium Header */}
        <div className="flex items-center justify-between mb-8 mt-2">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              VOY<span className="text-primary">.</span>
            </h1>
            <p className="text-sm font-medium text-muted-foreground">Seu futuro começa aqui</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/settings')}
              className="w-10 h-10 rounded-full bg-white/80 border border-white/20 shadow-sm flex items-center justify-center hover:bg-white transition-all dark:bg-white/10 dark:border-white/5"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-12 h-12 rounded-full p-1 bg-gradient-to-br from-primary via-blue-400 to-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-primary font-bold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Olá, <span className="premium-gradient-text">{profile?.display_name?.split(' ')[0] || 'Imigrante'}</span>
          </h2>
          <p className="text-muted-foreground text-sm">Pronto para avançar hoje?</p>
        </div>

        <NewsSlider />

        {/* Alerts moved below slider for better visual flow */}
        <div className="mt-6">
          {alerts.length > 0 && (
            <div className="space-y-3 mb-6 animate-slide-up">
              {alerts.map((alert, index) => (
                <AlertBanner
                  key={index}
                  message={alert.message}
                  action={alert.action}
                  onAction={alert.onAction}
                  variant={alert.variant || 'warning'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-2 gap-4 mb-8 mt-6">
          {/* Profile Progress Widget */}
          <div
            className="group relative overflow-hidden rounded-3xl bg-white border border-white/20 shadow-soft p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer dark:bg-white/5 dark:border-white/10"
            onClick={() => navigate('/profile')}
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-primary blur-2xl" />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-primary dark:bg-blue-900/20">
                  <UserIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 px-2 py-1 rounded-full">{completionPercentage}%</span>
              </div>

              <div>
                <span className="text-sm font-semibold text-foreground block mb-1">Meu Perfil</span>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-1000 ease-out shadow-[0_0_10px_hsl(var(--primary)/0.5)]"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AIMA Status Widget */}
          <div
            className="group relative overflow-hidden rounded-3xl bg-white border border-white/20 shadow-soft p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer dark:bg-white/5 dark:border-white/10"
            onClick={() => navigate('/aima')}
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <div className="w-16 h-16 rounded-full bg-emerald-500 blur-2xl" />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 px-2 py-1 rounded-full">
                  {aimaProcess?.process_type ? `${Math.min(Math.round(aimaProcess.step / 5 * 100), 100)}%` : 'Start'}
                </span>
              </div>

              <div>
                <span className="text-sm font-semibold text-foreground block mb-1 truncate">
                  {aimaProcess?.process_type ? (
                    visaTypes.find(v => v.id === aimaProcess.process_type)?.name || "Processo"
                  ) : "Iniciar AIMA"}
                </span>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-out shadow-[0_0_10px_hsl(150_60%_45%/0.5)]"
                    style={{ width: `${aimaProcess?.process_type ? Math.min((aimaProcess.step / 5 * 100), 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Starred Notes Section */}
        {starredNotes.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-base font-bold text-foreground">Importante</h2>
              <span className="text-xs font-medium text-primary cursor-pointer hover:underline" onClick={() => navigate('/notes')}>Ver tudo</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
              {starredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => navigate('/notes')}
                  className="min-w-[160px] max-w-[200px] bg-white border border-white/40 rounded-3xl p-4 shadow-sm space-y-3 cursor-pointer hover:-translate-y-1 transition-all active:scale-95 dark:bg-white/5 dark:border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center">
                      <StickyNote className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <Star className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm truncate text-foreground">{note.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{note.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Access Numbers & Documents */}
        <div className="mb-8">
          <h2 className="text-base font-bold text-foreground mb-4 px-1">Seus Documentos</h2>
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
            {/* Standard Blocks with better styling */}
            <QuickAccessCard
              label="NIF"
              value={profile?.nif || ''}
              placeholder="Adicionar"
              onClick={() => openNumberDialog('nif')}
              isSecure={true}
              className="bg-white"
            />
            <QuickAccessCard
              label="NISS"
              value={profile?.niss || ''}
              placeholder="Adicionar"
              onClick={() => openNumberDialog('niss')}
              isSecure={true}
            />
            <QuickAccessCard
              label="SNS"
              value={profile?.sns || ''}
              placeholder="Adicionar"
              onClick={() => openNumberDialog('sns')}
              isSecure={true}
            />
            <QuickAccessCard
              label="Passaporte"
              value={profile?.passport || ''}
              placeholder="Adicionar"
              onClick={() => openNumberDialog('passport')}
              isSecure={true}
            />

            {/* Custom Blocks Added by User */}
            {profile?.custom_quick_access?.map((block) => (
              <QuickAccessCard
                key={block.id}
                label={block.label}
                value={block.value || ''}
                placeholder="Adicionar"
                onClick={() => {
                  setTempNumber(block.value || '');
                  setShowNumberDialog(block.label);
                }}
                isSecure={true}
              />
            ))}

          </div>
        </div>

        <CalendarPreview />
        <CommunityCard />


        {/* Main Actions */}
        <div className="space-y-3">
          <ActionCard
            icon={<ClipboardCheck className="w-6 h-6 text-primary" />}
            title="Primeiros Passos"
            description="Guia essencial para quem chega"
            onClick={() => navigate('/checklist')}
            className="border-primary/20 bg-primary/5"
          />
          <ActionCard
            icon={<CalcIcon className="w-6 h-6 text-orange-500" />}
            title="Simulador de Salário"
            description="Calcule seu rendimento líquido"
            onClick={() => navigate('/calculator')}
          />
          <ActionCard
            icon={<ExternalLink className="w-6 h-6 text-blue-500" />}
            title="Links Úteis"
            description="Diretório oficial de serviços"
            onClick={() => navigate('/useful-links')}
          />
          <ActionCard
            icon={<Briefcase className="w-6 h-6 text-green-500" />}
            title="Emprego"
            description="Agências e portais de trabalho"
            onClick={() => navigate('/emprego')}
          />
          <ActionCard
            icon={<FileText className="w-6 h-6" />}
            title="Documentos"
            description="Guarde seus documentos importantes"
            onClick={() => navigate('/documents')}
          />
          <ActionCard
            icon={<Globe className="w-6 h-6" />}
            title="Imigração"
            description="Acompanhe seu processo"
            onClick={() => navigate('/aima')}
          />
          <ActionCard
            icon={<Wallet className="w-6 h-6 text-warning" />}
            title="Meu Bolso"
            description="Gestor financeiro e despesas"
            onClick={() => navigate('/meu-bolso')}
            variant="warning"
          />
        </div>
      </div>

      {/* Number Input Dialog */}
      <Dialog open={!!showNumberDialog} onOpenChange={() => setShowNumberDialog(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {profile?.[showNumberDialog as NumberField] ? 'Editar' : 'Adicionar'} {getDialogTitle(showNumberDialog)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                value={tempNumber}
                onChange={(e) => setTempNumber(e.target.value)}
                placeholder="Digite o número..."
                className="h-12 text-lg rounded-xl"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowNumberDialog(null)}
                className="flex-1 h-12 rounded-xl"
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveNumber}
                className="flex-1 h-12 rounded-xl"
                disabled={saving}
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <WelcomeModal />
      <EmergencyModal open={showEmergency} onOpenChange={setShowEmergency} />
    </MobileLayout>
  );
}
