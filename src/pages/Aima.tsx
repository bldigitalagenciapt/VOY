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
  Trash2,
  FileText,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  Coins,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAimaProcess } from '@/hooks/useAimaProcess';
import { useUserDocuments } from '@/hooks/useUserDocuments';
import { useDocuments } from '@/hooks/useDocuments';
import { visaTypes, VisaType, commonAimaDocuments } from '@/data/visaTypes';
import { toast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

const MOTIVATIONAL_PHRASES = [
  "Um passo mais perto do seu sonho! 🇵🇹",
  "Excelente! A burocracia não te para. 💪",
  "Mais uma etapa vencida! Orgulho desse caminho. ✨",
  "Brilhante! Cada detalhe conta. 🚀",
  "Caminhando com segurança rumo à residência! ✅"
];

export const processTypes = [
  { id: 'visto', title: 'Visto Consular', icon: Plane, description: 'Para quem entrou com visto de residência' },
  { id: 'cplp', title: 'CPLP', icon: Globe, description: 'Portal Digital para cidadãos da CPLP' },
  { id: 'familiar', title: 'Familiar', icon: Users, description: 'Reagrupamento de familiares em Portugal' },
  { id: 'renewal', title: 'Renovação', icon: RefreshCw, description: 'Renovação de Título de Residência' },
];

import { LucideIcon } from 'lucide-react';

const visaIcons: Record<string, LucideIcon> = {
  'study': GraduationCap,
  'work': Briefcase,
  'job-seeking': Search,
  'residence': HomeIcon,
  'schengen': Globe,
};

const getStepsForProcess = (type: string) => {
  const steps: Record<string, any[]> = {
    cplp: [
      {
        id: 'nif',
        title: 'Obter NIF',
        description: 'Número de Identificação Fiscal essencial para viver em Portugal.',
        voyTip: 'Pode ser pedido presencialmente nas Finanças ou online através de representantes.',
        documents: ['Passaporte', 'Comprovativo de Morada (Origem ou PT)'],
        actionLink: 'https://www.portaldasfinancas.gov.pt/',
        cost: 'Gratuito (no balcão)'
      },
      {
        id: 'niss',
        title: 'Obter NISS',
        description: 'Número de Identificação de Segurança Social.',
        voyTip: 'O NISS na hora agora pode ser pedido online pelo portal da Segurança Social Direta.',
        documents: ['Passaporte', 'NIF'],
        actionLink: 'https://www.seg-social.pt/pedido-de-formulario-niss-na-hora',
        cost: 'Gratuito'
      },
      {
        id: 'junta',
        title: 'Atestado da Junta',
        description: 'Comprovativo de morada oficial da sua freguesia.',
        voyTip: 'Precisa de 2 testemunhas que morem na mesma freguesia (algumas juntas aceitam contrato de arrendamento).',
        documents: ['Passaporte', 'NIF', '2 Testemunhas ou Contrato'],
        cost: '€5 - €15 (média)'
      },
      {
        id: 'portal_cplp',
        title: 'Pedido no Portal CPLP',
        description: 'Submissão digital do pedido de autorização de residência.',
        voyTip: 'Atenção: Este portal é exclusivo para quem já tem NIF/NISS e manifestação/visto anterior ou entrada legal.',
        documents: ['Certidão de Antecedentes Criminais', 'NIF', 'NISS'],
        actionLink: 'https://cplp.aima.gov.pt/',
        cost: 'Taxa zero para alguns países (verificar DUC)'
      },
      {
        id: 'duc_cplp',
        title: 'Pagamento DUC',
        description: 'Documento Único de Cobrança para emissão do título.',
        voyTip: 'O documento chega por e-mail após a submissão no portal. Pague nas Finanças ou Multibanco.',
        documents: ['Guia DUC'],
        cost: '€15 (emissão básica)'
      },
      {
        id: 'certificado',
        title: 'Certificado Digital',
        description: 'Download do título de residência digital.',
        voyTip: 'O certificado digital tem validade legal imediata enquanto o cartão físico não chega.',
        documents: ['Login Portal AIMA'],
        actionLink: 'https://cplp.aima.gov.pt/',
        cost: 'Incluído'
      }
    ],
    visto: [
      {
        id: 'nif',
        title: 'Obter NIF',
        description: 'Número Fiscal.',
        voyTip: 'Se já tem NIF no visto, verifique se está ativo.',
        documents: ['Passaporte', 'Visto'],
        cost: 'Gratuito'
      },
      {
        id: 'niss',
        title: 'Obter NISS',
        description: 'Segurança Social.',
        voyTip: 'Muitos vistos D agora já trazem o NISS associado.',
        documents: ['Passaporte', 'Visto'],
        cost: 'Gratuito'
      },
      {
        id: 'junta',
        title: 'Atestado da Junta',
        description: 'Confirmar morada em Portugal.',
        voyTip: 'Essencial para a entrevista na AIMA.',
        documents: ['Passaporte', 'Contrato ou Testemunhas'],
        cost: '€5 - €15'
      },
      {
        id: 'agendamento_automatico',
        title: 'Validar Agendamento',
        description: 'Verificar o agendamento automático no verso do visto.',
        voyTip: 'Consulte a URL no selo do visto ou o portal da AIMA para confirmar dia e hora.',
        documents: ['Passaporte com Visto'],
        actionLink: 'https://aima.gov.pt/',
        cost: 'Gratuito'
      },
      {
        id: 'ida_aima',
        title: 'Ida à AIMA',
        description: 'Entrevista presencial para recolha de dados biométricos.',
        voyTip: 'Leve todos os originais! Chegue 15 min antes.',
        documents: ['Passaporte', 'Comprovativo de Morada', 'Meios de Subsistência'],
        cost: 'Taxa variável (verificar DUC)'
      },
      {
        id: 'recebimento_cartao',
        title: 'Recebimento do Cartão',
        description: 'Entrega do Título de Residência físico na sua morada.',
        voyTip: 'Garanta que o seu nome está na caixa de correio para evitar devolução.',
        cost: 'Taxa de envio incluída'
      }
    ],
    familiar: [
      { id: 'prep', title: 'Preparação Documental', voyTip: 'Certidões de nascimento/casamento devem ser apostiladas.', cost: 'Variável' },
      { id: 'agendamento', title: 'Agendamento AIMA', voyTip: 'Feito por telefone ou portal quando abrem vagas.', actionLink: 'https://aima.gov.pt/' },
      { id: 'meios', title: 'Meios de Subsistência', voyTip: 'O reagrupante deve provar que pode sustentar a família.', cost: 'Salário Mínimo + Percentagens' },
      { id: 'entrevista', title: 'Entrevista Familiar', voyTip: 'Presença de todos os membros é obrigatória.', cost: 'Taxas AIMA' },
      { id: 'cartao', title: 'Recebimento do Titulo', voyTip: 'Enviado por correio registado.', cost: 'Incluído' }
    ],
    renewal: [
      { id: '1', title: 'Verificar Validade', voyTip: 'Inicie o processo 60-90 dias antes de vencer.' },
      { id: '2', title: 'Documentos Atualizados', voyTip: 'Certidões criminais muitas vezes precisam ser renovadas.' },
      { id: '3', title: 'Agendar/Pedido Online', actionLink: 'https://aima.gov.pt/' },
      { id: '4', title: 'Pagar Taxas' },
      { id: '5', title: 'Aguardar Novo Título' }
    ]
  };
  return steps[type] || [];
};

export default function Aima() {
  const { process, loading, selectProcessType, toggleStep, addDate, addProtocol, clearProcess, updateProcess } = useAimaProcess();
  const { userDocuments, toggleDocument } = useUserDocuments();
  const { documents } = useDocuments();
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [showProtocolDialog, setShowProtocolDialog] = useState(false);
  const [newDate, setNewDate] = useState({ label: '', date: '' });
  const [newProtocol, setNewProtocol] = useState('');
  const [saving, setSaving] = useState(false);

  // Visa section states
  const [showVisaSection, setShowVisaSection] = useState(false);
  const [selectedVisa, setSelectedVisa] = useState<VisaType | null>(null);

  // Consider process as a visa if it matches any specific visa ID
  const isSpecificVisa = (visaTypes ?? []).some(v => v.id === process?.process_type);
  const activeVisa = (visaTypes ?? []).find(v => v.id === process?.process_type);

  const handleSelectProcess = async (type: string) => {
    setSaving(true);
    await selectProcessType(type);
    setSaving(false);
  };

  const handleToggleStep = async (stepId: string) => {
    const isCurrentlyCompleted = process?.completed_steps?.includes(stepId);
    await toggleStep(stepId);

    if (!isCurrentlyCompleted) {
      // Just marked as completed
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#3b82f6', '#22c55e', '#f59e0b']
      });

      const randomPhrase = MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];
      toast({
        title: "Etapa Concluída!",
        description: randomPhrase,
      });
    }
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

  // Show visa detail (Dynamic Checklist)
  if (selectedVisa) {
    const Icon = visaIcons[selectedVisa.id] || Plane;
    const isSaved = process?.process_type === selectedVisa.id;

    return (
      <MobileLayout>
        <div className="px-5 py-6 safe-area-top pb-24">
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
              <p className="text-sm text-muted-foreground">Checklist padrão AIMA</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* 1. Documentos Comuns */}
            <section>
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileCheck className="w-4 h-4" /> 1. Documentos Comuns
              </h2>
              <p className="text-xs text-muted-foreground mb-4">Obrigatórios para todos os tipos de autorização de residência.</p>
              <div className="space-y-3">
                {(commonAimaDocuments ?? []).map((doc: any, index: number) => (
                  <div key={index} className="glass-card p-4 rounded-2xl border-primary/5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm">{doc.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                        <div className="mt-3 bg-muted/30 p-2 rounded-lg">
                          <p className="text-[10px] font-bold uppercase text-primary mb-1">Por que a AIMA exige:</p>
                          <p className="text-[11px] text-foreground/80">{doc.why}</p>
                        </div>
                        <div className="mt-2 text-[11px] space-y-1">
                          {(doc.requirements ?? []).map((req: string, rIdx: number) => (
                            <div key={rIdx} className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-primary/40" />
                              <span className="text-muted-foreground">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Documentos Específicos */}
            <section>
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" /> 2. Documentos Específicos
              </h2>
              <p className="text-xs text-muted-foreground mb-4">Adicionais necessários para o visto {selectedVisa.name}.</p>
              <div className="space-y-3">
                {(selectedVisa.specificDocuments ?? []).map((doc: any, index: number) => (
                  <div key={index} className="glass-card p-4 rounded-2xl border-info/20 bg-info/5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-info" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm">{doc.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                        <div className="mt-3 bg-info/10 p-2 rounded-lg">
                          <p className="text-[10px] font-bold uppercase text-info mb-1">Quando é exigido:</p>
                          <p className="text-[11px] text-foreground/80">{doc.why}</p>
                        </div>
                        <div className="mt-2 text-[11px] space-y-1">
                          {(doc.requirements ?? []).map((req: string, rIdx: number) => (
                            <div key={rIdx} className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-info/40" />
                              <span className="text-muted-foreground">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Nota de Transparência */}
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-2xl animate-pulse">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-warning uppercase mb-1">Nota de Transparência AIMA</h4>
                  <p className="text-[11px] text-foreground/80 leading-relaxed">
                    A AIMA pode solicitar documentos adicionais ou dispensar alguns documentos, dependendo do caso concreto, do balcão de atendimento e da análise do processo. Este checklist representa a documentação padrão normalmente exigida, mas não substitui a análise individual do processo.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Campo de Observações do Caso */}
            <section>
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" /> 4. Observações do Caso
              </h2>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Registre exigências específicas feitas pela AIMA ou solicitações do balcão.</p>
                <textarea
                  className="w-full h-32 p-4 rounded-2xl bg-muted/50 border border-border focus:border-primary/50 transition-all text-sm outline-none resize-none"
                  placeholder="Ex: Documento X solicitado pelo balcão de Lisboa..."
                  value={process?.notes || ''}
                  onChange={(e) => updateProcess({ notes: e.target.value })}
                />
              </div>
            </section>

            {/* Save/Clear Button */}
            <div className="flex gap-3 pt-4">
              {isSaved ? (
                <Button
                  variant="outline"
                  onClick={handleClearVisa}
                  className="flex-1 h-12 rounded-xl"
                  disabled={saving}
                >
                  Remover do meu perfil
                </Button>
              ) : (
                <Button
                  onClick={() => handleSaveVisa(selectedVisa.id)}
                  className="flex-1 h-12 rounded-xl shadow-lg border-b-4 border-primary-dark active:border-b-0 active:translate-y-1 transition-all"
                  disabled={saving}
                >
                  Salvar este processo
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
            {(visaTypes ?? []).map((visa, index) => {
              const Icon = visaIcons[visa.id] || Plane;
              const isSaved = process?.process_type === visa.id;

              return (
                <button
                  key={visa.id}
                  onClick={() => setSelectedVisa(visa)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-3xl border-2 transition-all animate-slide-up active:scale-[0.97]',
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
          <h1 className="text-2xl font-bold text-foreground mb-2 text-center md:text-left">Imigração / AIMA</h1>
          <p className="text-muted-foreground mb-8 text-center md:text-left">Qual é o seu processo?</p>

          <div className="space-y-4 mb-8">
            <Tabs defaultValue="visto" className="w-full" onValueChange={handleSelectProcess}>
              <TabsList className="grid grid-cols-3 h-12 bg-muted/50 rounded-xl p-1">
                <TabsTrigger value="visto" className="rounded-lg text-xs font-bold">Visto</TabsTrigger>
                <TabsTrigger value="cplp" className="rounded-lg text-xs font-bold">CPLP</TabsTrigger>
                <TabsTrigger value="familiar" className="rounded-lg text-xs font-bold">Familiar</TabsTrigger>
              </TabsList>
            </Tabs>

            {processTypes.filter(p => p.id !== 'renewal').map((processType, index) => {
              const Icon = processType.icon;
              return (
                <button
                  key={processType.id}
                  onClick={() => handleSelectProcess(processType.id)}
                  disabled={saving}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-border bg-card hover:border-primary/50 transition-all animate-slide-up disabled:opacity-50 active:scale-[0.97]"
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
  const progress = steps.length > 0 ? Math.min((completedCount / steps.length) * 100, 100) : 0;

  return (
    <MobileLayout>
      <div className="px-5 py-6 safe-area-top">
        {/* Premium Header */}
        <div className="relative mb-8 p-6 glass-card border-primary/20 overflow-hidden animate-glow">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Globe className="w-32 h-32 text-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Processo Ativo</span>
              <button
                onClick={handleClearProcess}
                disabled={saving}
                className="text-[10px] font-black text-destructive px-3 py-1 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-all border border-destructive/20"
              >
                Encerrar
              </button>
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter">
              {isSpecificVisa
                ? visaTypes.find(v => v.id === process.process_type)?.name
                : processTypes.find((p) => p.id === process.process_type)?.title}
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-2 opacity-80">
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
            <div className="w-14 h-14 flex items-center justify-center relative">
              <span className="text-[10px] font-bold text-primary z-10">{Math.round(progress)}%</span>
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 48 48"
              >
                {/* Background Track */}
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-primary/10"
                />
                {/* Progress Bar */}
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-primary transition-all duration-700 ease-in-out"
                  strokeDasharray={`${(progress / 100) * 113} 113`}
                  strokeLinecap="round"
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

        {/* Timeline with Accordion */}
        <div className="mb-10">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 px-1">
            Meu Caminho em Portugal
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isNext = !isCompleted && (index === 0 || completedSteps.includes(steps[index - 1].id));

              return (
                <AccordionItem
                  key={step.id}
                  value={step.id}
                  className={cn(
                    "border rounded-2xl overflow-hidden transition-all duration-300",
                    isCompleted ? "bg-success/5 border-success/20" : isNext ? "border-primary/50 shadow-md bg-card" : "bg-card border-border"
                  )}
                >
                  <AccordionTrigger className="px-5 hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStep(step.id);
                        }}
                        className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                          isCompleted ? "bg-success border-success text-white" : "border-muted-foreground/30"
                        )}
                      >
                        {isCompleted && <Check className="w-4 h-4 stroke-[3px]" />}
                      </div>
                      <div>
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-tighter",
                          isCompleted ? "text-success" : isNext ? "text-primary" : "text-muted-foreground"
                        )}>Etapa {index + 1}</p>
                        <h3 className={cn(
                          "font-bold text-base leading-tight",
                          isCompleted && "text-muted-foreground/70"
                        )}>{step.title}</h3>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5">
                    <div className="space-y-4 pt-2">
                      {step.description && (
                        <p className="text-sm text-foreground/80 leading-relaxed">{step.description}</p>
                      )}

                      {/* VOY TIPS */}
                      {step.voyTip && (
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex gap-3">
                          <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-primary uppercase">Dica VOY</p>
                            <p className="text-xs text-foreground/90 italic">"{step.voyTip}"</p>
                          </div>
                        </div>
                      )}

                      {/* What to bring */}
                      {step.documents && step.documents.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3" /> O que levar / Preparar
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            {step.documents.map((doc: string, dIdx: number) => (
                              <div key={dIdx} className="flex items-center gap-2 bg-muted/40 p-2 rounded-lg">
                                <div className="w-1 h-1 rounded-full bg-primary" />
                                <span className="text-xs font-medium">{doc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cost */}
                      {step.cost && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Coins className="w-3 h-3" />
                          <span>Custo estimado: <strong className="text-foreground">{step.cost}</strong></span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          className="flex-1 h-10 rounded-xl text-xs font-bold"
                          onClick={() => handleToggleStep(step.id)}
                        >
                          {isCompleted ? 'Desmarcar Concluído' : 'Marcar como Feito'}
                        </Button>
                        {step.actionLink && (
                          <Button
                            variant="outline"
                            className="h-10 px-4 rounded-xl border-primary text-primary hover:bg-primary/10"
                            onClick={() => window.open(step.actionLink, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Documentation Checklist for Visas (Dynamic) */}
        {isSpecificVisa && activeVisa && (
          <div className="mb-10 space-y-8">
            <section>
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 px-1 flex items-center gap-2">
                <FileCheck className="w-4 h-4" /> 1. Documentos Comuns
              </h2>
              <div className="space-y-3">
                {(commonAimaDocuments ?? []).map((doc, index) => {
                  const isCompleted = userDocuments.some(ud => ud.document_name === doc.name && ud.is_completed);
                  const hasUpload = documents.some(d =>
                    d.name.toLowerCase().includes(doc.name.toLowerCase()) ||
                    doc.name.toLowerCase().includes(d.name.toLowerCase())
                  );

                  return (
                    <div
                      key={index}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all",
                        isCompleted || hasUpload ? "border-success/20 bg-success/5" : "border-border bg-card"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleDocument(doc.name, isCompleted)}
                          className={cn(
                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors mt-0.5",
                            isCompleted || hasUpload
                              ? "bg-success border-success text-white"
                              : "border-muted-foreground/30 hover:border-primary"
                          )}
                        >
                          {(isCompleted || hasUpload) && <Check className="w-4 h-4 stroke-[3px]" />}
                        </button>
                        <div className="flex-1">
                          <p className={cn(
                            "font-semibold text-sm leading-tight",
                            (isCompleted || hasUpload) && "text-muted-foreground line-through opacity-70"
                          )}>
                            {doc.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">{doc.description}</p>
                          {hasUpload && !isCompleted && (
                            <p className="text-[10px] text-success font-bold uppercase mt-1">Detectado em Meus Documentos</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 px-1 flex items-center gap-2">
                <Plus className="w-4 h-4" /> 2. Documentos Específicos
              </h2>
              <div className="space-y-3">
                {(activeVisa.specificDocuments ?? []).map((doc, index) => {
                  const isCompleted = userDocuments.some(ud => ud.document_name === doc.name && ud.is_completed);
                  const hasUpload = documents.some(d =>
                    d.name.toLowerCase().includes(doc.name.toLowerCase()) ||
                    doc.name.toLowerCase().includes(d.name.toLowerCase())
                  );

                  return (
                    <div
                      key={index}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all",
                        isCompleted || hasUpload ? "border-success/20 bg-success/5" : "border-info/20 bg-info/5"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleDocument(doc.name, isCompleted)}
                          className={cn(
                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors mt-0.5",
                            isCompleted || hasUpload
                              ? "bg-success border-success text-white"
                              : "border-info/30 hover:border-info"
                          )}
                        >
                          {(isCompleted || hasUpload) && <Check className="w-4 h-4 stroke-[3px]" />}
                        </button>
                        <div className="flex-1">
                          <p className={cn(
                            "font-semibold text-sm leading-tight",
                            (isCompleted || hasUpload) && "text-muted-foreground line-through opacity-70"
                          )}>
                            {doc.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">{doc.description}</p>
                          {hasUpload && !isCompleted && (
                            <p className="text-[10px] text-success font-bold uppercase mt-1">Detectado em Meus Documentos</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. Nota de Transparência */}
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-2xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-warning uppercase mb-1">Nota de Transparência AIMA</h4>
                  <p className="text-[11px] text-foreground/80 leading-relaxed">
                    A AIMA pode solicitar documentos adicionais ou dispensar alguns documentos, dependendo do caso concreto, do balcão de atendimento e da análise do processo. Este checklist representa a documentação padrão normalmente exigida, mas não substitui a análise individual do processo.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Campo de Observações do Caso */}
            <section>
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" /> 4. Observações do Caso
              </h2>
              <div className="space-y-2">
                <textarea
                  className="w-full h-32 p-4 rounded-2xl bg-muted/50 border border-border focus:border-primary/50 transition-all text-sm outline-none resize-none"
                  placeholder="Ex: Documento X solicitado pelo balcão de Lisboa..."
                  value={process?.notes || ''}
                  onChange={(e) => updateProcess({ notes: e.target.value })}
                />
              </div>
            </section>
          </div>
        )}

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
