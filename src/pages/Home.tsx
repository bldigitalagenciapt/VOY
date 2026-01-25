import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAimaProcess } from '@/hooks/useAimaProcess';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { QuickAccessCard } from '@/components/ui/QuickAccessCard';
import { ActionCard } from '@/components/ui/ActionCard';
import { FileText, Globe, MessageCircle, Settings, StickyNote, Loader2, Star, Wallet, Calendar as CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';
import { useDocuments } from '@/hooks/useDocuments';
import { SkeletonList, SkeletonCard } from '@/components/ui/skeleton-card';
import { useUserDocuments } from '@/hooks/useUserDocuments';
import { toast } from 'sonner';
import { useQuickAccess } from '@/hooks/useQuickAccess';
import { visaTypes } from '@/data/visaTypes';
import { processTypes } from '@/pages/Aima'; // Imported from Aima page

// The local processTypes definition is now redundant if imported from Aima.
// Keeping it for now as the instruction didn't explicitly remove it,
// but the new logic uses the imported one.
// The instruction implies this definition should be in Aima.tsx and exported from there.
// For Home.tsx, we will use the imported 'processTypes'.
// The original 'processTypesLocal' is removed as it's now redundant.

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
  ExternalLink
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

  const docProgress = totalChecklistItems > 0
    ? Math.round((completedChecklistItems / totalChecklistItems) * 100)
    : 0;

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
          <SkeletonList count={4} />
        </div>
      </MobileLayout>
    );
  }

  const favoriteDocs = documents.filter(doc => quickAccessIds.includes(doc.id));

  return (
    <MobileLayout>
      <div className="px-5 py-6 safe-area-top">
        <NewsSlider />
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Olá, {profile?.display_name?.split(' ')[0] || 'Imigrante'}! 👋
            </h1>
            <p className="text-muted-foreground">Bem-vindo de volta</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors overflow-hidden"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-primary">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowEmergency(true)}
              className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-all animate-pulse"
            >
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </button>
            <button
              onClick={() => navigate('/agenda')}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <CalendarIcon className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>


        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3 mb-6">
            {alerts.map((alert, index) => (
              <AlertBanner
                key={index}
                message={alert.message}
                action={alert.action}
                onAction={alert.onAction}
                variant={alert.variant || 'warning'}
                className="animate-slide-up"
              />
            ))}
          </div>
        )}

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Profile Progress */}
          <div
            className="bg-card border rounded-3xl p-4 shadow-sm space-y-3 active:scale-95 transition-transform"
            onClick={() => navigate('/profile')}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Perfil</span>
              <span className="text-xs font-bold text-primary">{completionPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {completedFields} de {profileFields.length} documentos
            </p>
          </div>

          {/* AIMA Status Summary - Restored to original size with specific name */}
          <div
            className="bg-card border rounded-3xl p-4 shadow-sm space-y-3 cursor-pointer hover:bg-muted/50 active:scale-95 transition-transform"
            onClick={() => navigate('/aima')}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">AIMA</span>
              <span className="text-xs font-bold text-primary">
                {aimaProcess?.process_type ? `${Math.min(Math.round(aimaProcess.step / 5 * 100), 100)}%` : '0%'}
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${aimaProcess?.process_type ? Math.min((aimaProcess.step / 5 * 100), 100) : 0}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground truncate font-semibold">
              {aimaProcess?.process_type ? (
                visaTypes.find(v => v.id === aimaProcess.process_type)?.name ||
                processTypes.find(p => p.id === aimaProcess.process_type)?.title ||
                aimaProcess.process_type.replace(/_/g, ' ')
              ) : (
                "Iniciar Processo"
              )}
            </p>
          </div>
        </div>

        {/* Starred Notes Section */}
        {starredNotes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Notas Favoritas
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
              {starredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => navigate('/notes')}
                  className="min-w-[160px] max-w-[200px] bg-card border rounded-3xl p-4 shadow-sm space-y-2 cursor-pointer hover:bg-muted/50 active:scale-95 transition-transform"
                >
                  <div className="flex items-center justify-between">
                    <StickyNote className="w-4 h-4 text-primary" />
                    <Star className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
                  </div>
                  <h3 className="font-semibold text-sm truncate">{note.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Access Numbers & Documents */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Acesso rápido
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
            {/* Standard Blocks */}
            <QuickAccessCard
              label="NIF"
              value={profile?.nif || ''}
              placeholder="Adicionar"
              onClick={() => openNumberDialog('nif')}
              isSecure={true}
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
                  setShowNumberDialog(block.label); // Use label as type for dialog title
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
