import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAimaProcess } from '@/hooks/useAimaProcess';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { QuickAccessCard } from '@/components/ui/QuickAccessCard';
import { ActionCard } from '@/components/ui/ActionCard';
import { FileText, Globe, MessageCircle, Settings, StickyNote, Loader2, Star } from 'lucide-react';
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
import { cn } from "@/lib/utils";
import { TrendingUp, AlertCircle } from 'lucide-react';
import { visaTypes } from '@/data/visaTypes';

const processTypes = [
  { id: 'cplp', title: 'CPLP' },
  { id: 'manifestation', title: 'Manifestação de Interesse' },
  { id: 'renewal', title: 'Renovação' },
  { id: 'visa', title: 'Visto' },
];

type NumberField = 'nif' | 'niss' | 'sns' | 'passport';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, updateNumber, loading: profileLoading } = useProfile();
  const { process: aimaProcess } = useAimaProcess();
  const { notes } = useNotes();
  const { documents } = useDocuments();
  const { userDocuments, loading: docsLoading } = useUserDocuments();
  const [showNumberDialog, setShowNumberDialog] = useState<NumberField | null>(null);
  const [tempNumber, setTempNumber] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveNumber = async () => {
    if (showNumberDialog) {
      try {
        setSaving(true);
        await updateNumber(showNumberDialog, tempNumber);
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

  const getDialogTitle = (type: NumberField | null) => {
    switch (type) {
      case 'nif': return 'NIF';
      case 'niss': return 'NISS';
      case 'sns': return 'Número SNS';
      case 'passport': return 'Passaporte';
      default: return '';
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
  const aimaDeadlines = aimaProcess?.important_dates?.filter(d => (d as any).date === tomorrowStr) || [];

  if (noteDeadlines.length > 0 || aimaDeadlines.length > 0) {
    alerts.push({
      message: `Você tem ${noteDeadlines.length + aimaDeadlines.length} prazos chegando em 24h!`,
      variant: 'warning' as const,
      action: 'Ver',
      onAction: () => navigate(noteDeadlines.length > 0 ? '/notes' : '/aima'),
    });
  }

  // Calculate Progress
  const totalChecklistItems = userDocuments.length || 0;
  const completedChecklistItems = userDocuments.filter(ud => ud.is_completed).length;
  const docProgress = totalChecklistItems > 0 ? Math.round((completedChecklistItems / totalChecklistItems) * 100) : 0;

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

  return (
    <MobileLayout>
      <div className="px-5 py-6 safe-area-top">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Olá! 👋
            </h1>
            <p className="text-muted-foreground">Bem-vindo de volta</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors overflow-hidden"
            >
              {(profile as any)?.avatar_url ? (
                <img src={(profile as any).avatar_url} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-primary">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Documentation Progress Bar */}
        <div className="mb-8 p-5 bg-primary/5 rounded-3xl border border-primary/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-foreground">Sua Documentação</h2>
            </div>
            <span className="text-primary font-bold">{docProgress}%</span>
          </div>
          <div className="h-3 bg-primary/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${docProgress}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            {totalChecklistItems > 0
              ? `${completedChecklistItems} de ${totalChecklistItems} documentos do visto concluídos.`
              : "Configure seu visto na aba Imigração para ver o progresso."}
          </p>
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

        {/* AIMA Status Summary - Redesigned for Premium Look */}
        <div
          onClick={() => navigate('/aima')}
          className="mb-8 relative overflow-hidden bg-gradient-to-br from-[#1a1c1e] to-[#2d2f31] rounded-3xl p-6 shadow-xl border border-white/5 cursor-pointer hover:scale-[1.01] transition-all active:scale-[0.98]"
        >
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Globe className="w-24 h-24 text-white" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary/20 p-2 rounded-xl">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-white/70 uppercase tracking-widest">AIMA - Status</span>
            </div>

            {aimaProcess?.process_type ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white leading-tight">
                    {visaTypes.find(v => v.id === aimaProcess.process_type)?.name ||
                      processTypes.find(p => p.id === aimaProcess.process_type)?.title ||
                      aimaProcess.process_type.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-white/50 text-sm mt-1">Seu processo em andamento</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                    <span className="text-primary">Progresso</span>
                    <span className="text-white">Etapa {aimaProcess.step}</span>
                  </div>
                  <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                      style={{ width: `${Math.min((aimaProcess.step / 5) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={cn(
                        "w-6 h-6 rounded-full border-2 border-[#1a1c1e] bg-muted flex items-center justify-center overflow-hidden",
                        i <= aimaProcess.step ? "bg-primary/20" : "bg-white/5"
                      )}>
                        {i <= aimaProcess.step && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-white/40">Atualizado recentemente</span>
                </div>
              </div>
            ) : (
              <div className="py-2">
                <p className="text-white font-bold text-lg">Inicie seu processo</p>
                <p className="text-white/50 text-sm">Configure seu perfil imigratório para começar o acompanhamento.</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4 bg-white/10 hover:bg-white/20 text-white border-none rounded-xl"
                >
                  Configurar agora
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Profile Progress */}
          <div className="bg-card border rounded-2xl p-4 shadow-sm space-y-3">
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
                  className="min-w-[160px] max-w-[200px] bg-card border rounded-2xl p-4 shadow-sm space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
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

        {/* Quick Access Numbers */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Acesso rápido
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
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
          </div>
        </div>


        {/* Main Actions */}
        <div className="space-y-3">
          <ActionCard
            icon={<FileText className="w-6 h-6" />}
            title="Documentos"
            description="Guarde seus documentos importantes"
            onClick={() => navigate('/documents')}
            variant="primary"
          />
          <ActionCard
            icon={<Globe className="w-6 h-6" />}
            title="Imigração"
            description="Acompanhe seu processo"
            onClick={() => navigate('/aima')}
          />
          <ActionCard
            icon={<StickyNote className="w-6 h-6" />}
            title="Anotações"
            description="Suas anotações e lembretes"
            onClick={() => navigate('/notes')}
          />
          <ActionCard
            icon={<MessageCircle className="w-6 h-6" />}
            title="Ajuda"
            description="Tire suas dúvidas"
            onClick={() => navigate('/assistant')}
            variant="success"
          />
        </div>
      </div>

      {/* Number Input Dialog */}
      <Dialog open={!!showNumberDialog} onOpenChange={() => setShowNumberDialog(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {profile?.[showNumberDialog!] ? 'Editar' : 'Adicionar'} {getDialogTitle(showNumberDialog)}
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
    </MobileLayout>
  );
}
