import { useState } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import {
  Users,
  FileCheck,
  RotateCcw,
  Check,
  Plus,
  Calendar,
  AlertCircle,
  Loader2,
  Plane,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Search,
  Home as HomeIcon,
  Globe,
  Trash2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAimaProcess } from '@/hooks/useAimaProcess';
import { useUserDocuments } from '@/hooks/useUserDocuments';
import { visaTypes, VisaType } from '@/data/visaTypes';
import { toast } from '@/hooks/use-toast';

const processTypes = [
  {
    id: 'cplp' as const,
    icon: Users,
    title: 'CPLP',
    description: 'Comunidade dos Países de Língua Portuguesa',
  },
  {
    id: 'manifestation' as const,
    icon: FileCheck,
    title: 'Manifestação de Interesse',
    description: 'Para quem já está trabalhando',
  },
  {
    id: 'renewal' as const,
    icon: RotateCcw,
    title: 'Renovação',
    description: 'Renovar autorização de residência',
  },
  {
    id: 'visa' as const,
    icon: Plane,
    title: 'Visto',
    description: 'Visto de estadia temporária ou residência',
  },
];

const visaIcons: Record<string, any> = {
  'study': GraduationCap,
  'work': Briefcase,
  'job-seeking': Search,
  'residence': HomeIcon,
  'schengen': Globe,
};

const getStepsForProcess = (type: string) => {
  const steps: Record<string, { id: string; title: string }[]> = {
    cplp: [
      { id: '1', title: 'Reunir documentos do país de origem' },
      { id: '2', title: 'Agendar marcação AIMA' },
      { id: '3', title: 'Comparecer à entrevista' },
      { id: '4', title: 'Aguardar decisão' },
      { id: '5', title: 'Recolher título de residência' },
    ],
    manifestation: [
      { id: '1', title: 'Verificar elegibilidade' },
      { id: '2', title: 'Reunir contrato de trabalho' },
      { id: '3', title: 'Obter NIF e NISS' },
      { id: '4', title: 'Submeter manifestação de interesse' },
      { id: '5', title: 'Aguardar convocação' },
      { id: '6', title: 'Comparecer à AIMA' },
    ],
    renewal: [
      { id: '1', title: 'Verificar validade do título atual' },
      { id: '2', title: 'Reunir documentos atualizados' },
      { id: '3', title: 'Agendar renovação' },
      { id: '4', title: 'Pagar taxas' },
      { id: '5', title: 'Aguardar novo título' },
    ],
    visa: [
      { id: '1', title: 'Escolher tipo de visto' },
      { id: '2', title: 'Preencher formulário de pedido' },
      { id: '3', title: 'Reunir documentação' },
      { id: '4', title: 'Agendar entrega (VFS/Consulado)' },
      { id: '5', title: 'Aguardar processamento' },
    ],
  };

  // Map specific visa IDs to the generic visa steps
  if (['study', 'work', 'job-seeking', 'residence', 'schengen'].includes(type)) {
    return steps.visa;
  }

  return steps[type] || [];
};

export default function Aima() {
  const { process, loading, selectProcessType, toggleStep, addDate, addProtocol, clearProcess, updateProcess } = useAimaProcess();
  const { userDocuments, toggleDocument } = useUserDocuments();
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [showProtocolDialog, setShowProtocolDialog] = useState(false);
  const [newDate, setNewDate] = useState({ label: '', date: '' });
  const [newProtocol, setNewProtocol] = useState('');
  const [saving, setSaving] = useState(false);

  // Visa section states
  const [showVisaSection, setShowVisaSection] = useState(false);
  const [selectedVisa, setSelectedVisa] = useState<VisaType | null>(null);

  // Consider process as a visa if it matches any specific visa ID
  const isSpecificVisa = ['study', 'work', 'job-seeking', 'residence', 'schengen'].includes(process?.process_type || '');

  const handleSelectProcess = async (type: string) => {
    setSaving(true);
    await selectProcessType(type);
    setSaving(false);
  };

  const handleToggleStep = async (stepId: string) => {
    await toggleStep(stepId);
  };

  const handleAddDate = async () => {
    if (newDate.label && newDate.date) {
      setSaving(true);
      await addDate(newDate);
      setSaving(false);
      setNewDate({ label: '', date: '' });
      setShowDateDialog(false);
    }
  };

  const handleAddProtocol = async () => {
    if (newProtocol) {
      setSaving(true);
      await addProtocol(newProtocol);
      setSaving(false);
      setNewProtocol('');
      setShowProtocolDialog(false);
    }
  };

  const handleClearProcess = async () => {
    setSaving(true);
    await clearProcess();
    setSaving(false);
  };

  const handleDeleteDate = async (index: number) => {
    if (!process?.important_dates) return;
    const newDates = [...process.important_dates];
    newDates.splice(index, 1);
    await updateProcess({ important_dates: newDates });
    toast({ title: "Data removida" });
  };

  const handleDeleteProtocol = async (index: number) => {
    if (!process?.protocols) return;
    const newProtocols = [...process.protocols];
    newProtocols.splice(index, 1);
    await updateProcess({ protocols: newProtocols });
    toast({ title: "Protocolo removido" });
  };

  const handleSaveVisa = async (visaId: string) => {
    setSaving(true);
    await selectProcessType(visaId);
    setSaving(false);
    toast({
      title: "Visto salvo!",
      description: "Suas informações de visto foram guardadas.",
    });
  };

  const handleClearVisa = async () => {
    setSaving(true);
    await clearProcess();
    setSaving(false);
    setSelectedVisa(null);
    toast({
      title: "Visto removido",
    });
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  // Show visa detail
  if (selectedVisa) {
    const Icon = visaIcons[selectedVisa.id] || Plane;
    const isSaved = process?.process_type === selectedVisa.id;

    return (
      <MobileLayout>
        <div className="px-5 py-6 safe-area-top">
          <button
            onClick={() => setSelectedVisa(null)}
            className="flex items-center gap-2 text-primary font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-info/10 flex items-center justify-center">
              <Icon className="w-7 h-7 text-info" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{selectedVisa.name}</h1>
              <p className="text-sm text-muted-foreground">{selectedVisa.duration}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                O que é
              </h2>
              <p className="text-foreground">{selectedVisa.shortDescription}</p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Para quem é indicado
              </h2>
              <p className="text-foreground">{selectedVisa.forWho}</p>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Documentos geralmente exigidos
              </h2>
              <div className="space-y-2">
                {selectedVisa.requiredDocuments.map((doc, index) => {
                  const isSavedDoc = userDocuments.find(ud => ud.document_name === doc)?.is_completed;
                  return (
                    <button
                      key={index}
                      onClick={() => toggleDocument(doc, !!isSavedDoc)}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left",
                        isSavedDoc
                          ? "bg-success/10 border-success/30"
                          : "bg-card border-border hover:border-primary/30"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all",
                        isSavedDoc ? "bg-success border-success" : "border-muted-foreground/30"
                      )}>
                        {isSavedDoc && <Check className="w-3.5 h-3.5 text-success-foreground" />}
                      </div>
                      <span className={cn("text-sm", isSavedDoc && "line-through text-muted-foreground")}>
                        {doc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Observações importantes
              </h2>
              <div className="space-y-2">
                {selectedVisa.observations.map((obs, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-warning/10 rounded-xl border border-warning/20">
                    <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{obs}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 bg-muted rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <strong>Aviso:</strong> Esta informação é orientativa. As regras podem mudar.
                  Consulte sempre o site oficial do consulado ou da VFS Global.
                </p>
              </div>
            </div>

            {/* Save/Clear Button */}
            <div className="flex gap-3">
              {isSaved ? (
                <Button
                  variant="outline"
                  onClick={handleClearVisa}
                  className="flex-1 h-12 rounded-xl"
                >
                  Remover seleção
                </Button>
              ) : (
                <Button
                  onClick={() => handleSaveVisa(selectedVisa.id)}
                  className="flex-1 h-12 rounded-xl"
                >
                  Salvar este visto
                </Button>
              )}
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Show visa list
  if (showVisaSection) {
    return (
      <MobileLayout>
        <div className="px-5 py-6 safe-area-top">
          <button
            onClick={() => setShowVisaSection(false)}
            className="flex items-center gap-2 text-primary font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <h1 className="text-2xl font-bold text-foreground mb-2">Tipos de Vistos</h1>
          <p className="text-muted-foreground mb-6">
            Conheça os principais tipos de visto para Portugal
          </p>

          <div className="space-y-3">
            {visaTypes.map((visa, index) => {
              const Icon = visaIcons[visa.id] || Plane;
              const isSaved = process?.process_type === visa.id;

              return (
                <button
                  key={visa.id}
                  onClick={() => setSelectedVisa(visa)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all animate-slide-up',
                    isSaved
                      ? 'bg-info/5 border-info'
                      : 'bg-card border-border hover:border-primary/50'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    isSaved ? 'bg-info/15' : 'bg-info/10'
                  )}>
                    <Icon className="w-6 h-6 text-info" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{visa.name}</p>
                      {isSaved && (
                        <span className="text-xs bg-info/20 text-info px-2 py-0.5 rounded-full">
                          Seu visto
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {visa.shortDescription}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-muted rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                As informações são baseadas em dados públicos e podem mudar.
                Consulte sempre os canais oficiais.
              </p>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // Show initial selection
  if (!process?.process_type) {
    return (
      <MobileLayout>
        <div className="px-5 py-6 safe-area-top">
          <h1 className="text-2xl font-bold text-foreground mb-2">Imigração / AIMA</h1>
          <p className="text-muted-foreground mb-8">Qual é o seu processo?</p>

          <div className="space-y-4 mb-8">
            {processTypes.map((processType, index) => {
              const Icon = processType.icon;
              return (
                <button
                  key={processType.id}
                  onClick={() => handleSelectProcess(processType.id)}
                  disabled={saving}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-border bg-card hover:border-primary/50 transition-all animate-slide-up disabled:opacity-50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-lg">{processType.title}</p>
                    <p className="text-sm text-muted-foreground">{processType.description}</p>
                  </div>
                  {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                </button>
              );
            })}
          </div>

          {/* Visa Section */}
          <div className="border-t border-border pt-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Tipos de Vistos
            </h2>
            <button
              onClick={() => setShowVisaSection(true)}
              className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-info/30 bg-info/5 hover:border-info transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-info/15 flex items-center justify-center">
                <Plane className="w-7 h-7 text-info" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-lg">Vistos</p>
                <p className="text-sm text-muted-foreground">
                  {isSpecificVisa
                    ? `Seu visto: ${visaTypes.find(v => v.id === process?.process_type)?.name}`
                    : 'Conheça os tipos de visto para Portugal'
                  }
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const steps = getStepsForProcess(process.process_type);
  const completedSteps = process.completed_steps || [];
  const completedCount = completedSteps.length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <MobileLayout>
      <div className="px-5 py-6 safe-area-top">
        {/* Premium Header */}
        <div className="relative mb-8 p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Globe className="w-20 h-20 text-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Processo Ativo</span>
              <button
                onClick={handleClearProcess}
                disabled={saving}
                className="text-xs font-bold text-destructive px-3 py-1 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors"
              >
                Encerrar
              </button>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {isSpecificVisa
                ? visaTypes.find(v => v.id === process.process_type)?.name
                : processTypes.find((p) => p.id === process.process_type)?.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe cada etapa do seu caminho em Portugal
            </p>
          </div>
        </div>

        {/* Professional Combined Progress */}
        <div className="mb-10 bg-card border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progresso Geral</p>
              <p className="text-lg font-bold">{completedCount} de {steps.length} concluídas</p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-primary/10 flex items-center justify-center relative">
              <span className="text-xs font-bold text-primary">{Math.round(progress)}%</span>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-primary"
                  strokeDasharray={`${(progress / 100) * 125.6} 125.6`}
                />
              </svg>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Professional Vertical Timeline */}
        <div className="mb-10">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 px-1">
            Linha do Tempo
          </h2>
          <div className="space-y-0 ml-4 border-l-2 border-muted">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isNext = !isCompleted && (index === 0 || completedSteps.includes(steps[index - 1].id));

              return (
                <div key={step.id} className="relative pb-8 pl-8 group">
                  {/* Timeline Node */}
                  <div className={cn(
                    "absolute left-[-11px] top-0 w-5 h-5 rounded-full border-4 transition-all duration-300 z-10",
                    isCompleted
                      ? "bg-success border-[#fff] shadow-[0_0_0_2px_rgba(34,197,94,0.3)]"
                      : isNext
                        ? "bg-card border-primary animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                        : "bg-card border-muted"
                  )}>
                    {isCompleted && <Check className="w-3 h-3 text-white absolute inset-0 m-auto" />}
                  </div>

                  {/* Content Card */}
                  <button
                    onClick={() => handleToggleStep(step.id)}
                    className={cn(
                      'w-full text-left p-4 rounded-2xl border transition-all duration-200',
                      isCompleted
                        ? 'bg-success/5 border-success/20 opacity-80'
                        : isNext
                          ? 'bg-card border-primary/50 shadow-md scale-[1.02]'
                          : 'bg-card border-border hover:border-primary/20'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-xs font-bold tracking-tighter uppercase",
                        isCompleted ? "text-success" : isNext ? "text-primary" : "text-muted-foreground"
                      )}>
                        Etapa {index + 1}
                      </span>
                      {isCompleted && <span className="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded-full font-bold">Concluído</span>}
                    </div>
                    <span className={cn(
                      'block font-semibold text-lg leading-tight',
                      isCompleted && 'text-muted-foreground'
                    )}>
                      {step.title}
                    </span>
                    {isNext && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <ArrowLeft className="w-3 h-3 rotate-180" /> Clique para concluir esta etapa
                      </p>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Important Dates */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Datas importantes
            </h2>
            <button
              onClick={() => setShowDateDialog(true)}
              className="flex items-center gap-1 text-sm text-primary font-medium"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
          {(!process.important_dates || process.important_dates.length === 0) ? (
            <p className="text-muted-foreground text-sm">Nenhuma data adicionada</p>
          ) : (
            <div className="space-y-2">
              {process.important_dates.map((date, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
                >
                  <Calendar className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{date.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(date.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteDate(index)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Protocols */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Protocolos
            </h2>
            <button
              onClick={() => setShowProtocolDialog(true)}
              className="flex items-center gap-1 text-sm text-primary font-medium"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
          {(!process.protocols || process.protocols.length === 0) ? (
            <p className="text-muted-foreground text-sm">Nenhum protocolo adicionado</p>
          ) : (
            <div className="space-y-2">
              {process.protocols.map((protocol, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border"
                >
                  <AlertCircle className="w-5 h-5 text-info" />
                  <span className="font-mono font-medium flex-1">{protocol}</span>
                  <button
                    onClick={() => handleDeleteProtocol(index)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Add Date Dialog */}
      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar data importante</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="dateLabel">Descrição</Label>
              <Input
                id="dateLabel"
                value={newDate.label}
                onChange={(e) => setNewDate({ ...newDate, label: e.target.value })}
                placeholder="Ex: Entrevista AIMA"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateValue">Data</Label>
              <Input
                id="dateValue"
                type="date"
                value={newDate.date}
                onChange={(e) => setNewDate({ ...newDate, date: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDateDialog(false)}
                className="flex-1 h-12 rounded-xl"
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddDate}
                className="flex-1 h-12 rounded-xl"
                disabled={saving || !newDate.label || !newDate.date}
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Protocol Dialog */}
      <Dialog open={showProtocolDialog} onOpenChange={setShowProtocolDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar protocolo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="protocol">Número do protocolo</Label>
              <Input
                id="protocol"
                value={newProtocol}
                onChange={(e) => setNewProtocol(e.target.value)}
                placeholder="Ex: AIMA-2024-123456"
                className="h-12 rounded-xl font-mono"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowProtocolDialog(false)}
                className="flex-1 h-12 rounded-xl"
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddProtocol}
                className="flex-1 h-12 rounded-xl"
                disabled={saving || !newProtocol}
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
