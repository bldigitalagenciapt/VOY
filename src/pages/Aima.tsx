/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import {
  Users,
  Check,
  Plane,
  ChevronRight,
  Globe,
  RefreshCw,
  Loader2,
  ChevronDown
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useAimaProcess } from '@/hooks/useAimaProcess';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { useApp } from '@/contexts/AppContext';
import { visaTypes } from '@/data/visaTypes';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

const MOTIVATIONAL_PHRASES = [
  "Um passo mais perto do seu sonho! 🇵🇹",
  "Excelente! A burocracia não te para. 💪",
  "Mais uma etapa vencida! Orgulho desse caminho. ✨",
  "Brilhante! Cada detalhe conta. 🚀",
  "Caminhando com segurança rumo à residência! ✅"
];

export const processTypes = [
  { id: 'visto', title: 'aima.visa_types', icon: Plane, description: 'aima.visa_desc' },
  { id: 'cplp', title: 'CPLP', icon: Globe, description: 'aima.subtitle' },
  { id: 'familiar', title: 'aima.familiar', icon: Users, description: 'aima.familiar_desc' },
  { id: 'renewal', title: 'aima.renewal', icon: RefreshCw, description: 'aima.renewal_desc' },
];

export default function Aima() {
  const { t } = useApp();
  const { toast } = useToast();
  const { process, loading, steps, selectProcessType, toggleStep, clearProcess } = useAimaProcess();
  const [showVisaSelection, setShowVisaSelection] = useState(false);

  useEffect(() => {
    if (showVisaSelection) {
      setTimeout(() => {
        document.getElementById('visa-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [showVisaSelection]);

  const handleToggleStep = async (stepId: string) => {
    const isCompleted = process?.completed_steps?.includes(stepId);
    await toggleStep(stepId);

    if (!isCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#60A5FA', '#93C5FD']
      });

      const randomPhrase = MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];
      toast({
        title: t('aima.congratulations'),
        description: randomPhrase,
      });
    }
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  if (!process || !process.process_type) {
    return (
      <MobileLayout>
        <div className="px-5 py-6 safe-area-top pb-24">
          <h1 className="text-2xl font-bold text-foreground mb-2 text-center md:text-left">{t('aima.title')}</h1>
          <p className="text-muted-foreground mb-8 text-center md:text-left">{t('aima.subtitle')}</p>
          <div className="grid grid-cols-1 gap-4">
            {processTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  if (type.id === 'visto') {
                    setShowVisaSelection(true);
                  } else {
                    selectProcessType(type.id);
                  }
                }}
                className="flex items-center gap-4 p-5 bg-card rounded-3xl border border-border/50 hover:border-primary/30 transition-all active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <type.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold">{t(type.title)}</p>
                  <p className="text-xs text-muted-foreground">{t(type.description)}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground opacity-30" />
              </button>
            ))}
          </div>

          <div id="visa-catalog" className="mt-12 space-y-6 scroll-mt-20">
            <div className="flex items-center gap-2 px-1">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Info className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                {t('aima.visa_catalog')}
              </h2>
            </div>
            {showVisaSelection && (
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-primary italic">Escolha o seu visto abaixo para ver o checklist específico:</p>
                  <Button variant="ghost" size="sm" onClick={() => setShowVisaSelection(false)} className="h-7 text-[10px] text-primary hover:bg-primary/10">
                    {t('cancel')}
                  </Button>
                </div>
              </div>
            )}

            <Accordion type="single" collapsible className="space-y-3">
              {visaTypes.map((visa) => (
                <AccordionItem key={visa.id} value={visa.id} className="border-none">
                  <AccordionTrigger className={cn(
                    "bg-card/50 p-5 rounded-3xl border border-border/40 hover:no-underline transition-all [&[data-state=open]]:bg-card [&[data-state=open]]:rounded-b-none shadow-sm",
                    showVisaSelection && "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                  )}>
                    <div className="flex flex-col items-start gap-1 text-left">
                      <p className="font-bold text-base">{visa.name}</p>
                      <p className="text-xs text-muted-foreground font-medium line-clamp-1">{visa.shortDescription}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-card border-x border-b border-border/40 rounded-b-3xl p-6">
                    <div className="space-y-4">
                      <Button
                        onClick={() => selectProcessType(visa.id)}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl h-12 shadow-glow mb-2"
                      >
                        {t('aima.select_this_visa') || 'Começar este Processo'}
                      </Button>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-primary mb-2">{t('aima.for_who')}</p>
                        <p className="text-sm leading-relaxed">{visa.forWho}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-lg font-bold px-3 py-1 bg-primary/5 text-primary border-primary/10">
                          {t('aima.duration_label')} {visa.duration}
                        </Badge>
                      </div>

                      {visa.specificDocuments.length > 0 && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-3">{t('aima.specific_docs')}</p>
                          <div className="space-y-3">
                            {visa.specificDocuments.map((doc, i) => (
                              <div key={i} className="p-3 rounded-2xl bg-muted/30 border border-border/20">
                                <p className="text-sm font-bold mb-1">{doc.name}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{doc.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {visa.observations.length > 0 && (
                        <div className="pt-2 border-t border-border/30">
                          {visa.observations.map((obs, i) => (
                            <p key={i} className="text-[10px] italic text-muted-foreground">
                              * {obs}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const completedCount = process.completed_steps?.length || 0;
  const totalSteps = steps?.length || 1;
  const progress = (completedCount / totalSteps) * 100;

  return (
    <MobileLayout>
      <div className="px-5 py-6 pb-24 safe-area-top">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t('aima.title')}</h1>
          <Button variant="ghost" size="sm" onClick={() => clearProcess()} className="text-destructive rounded-xl">
            {t('aima.close')}
          </Button>
        </div>

        <div className="bg-card p-6 rounded-[2.5rem] border border-border/50 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('aima.progress')}</p>
              <p className="text-lg font-bold">{completedCount} {t('aima.of')} {totalSteps} {t('aima.completed')}</p>
            </div>
            <div className="text-2xl font-black text-primary">{Math.round(progress)}%</div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">{t('aima.path')}</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {steps?.map((step, index) => {
              const isCompleted = process.completed_steps?.includes(step.id);
              return (
                <AccordionItem key={step.id} value={step.id} className="border-none">
                  <AccordionTrigger className="bg-card p-5 rounded-[2rem] border border-border/50 hover:no-underline [&[data-state=open]]:rounded-b-none transition-all">
                    <div className="flex items-center gap-4 text-left w-full">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all",
                        isCompleted ? "bg-success/10 border-success text-success" : "bg-muted border-transparent text-muted-foreground"
                      )}>
                        {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : <span className="text-sm font-black">{index + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase text-muted-foreground">{t('aima.step')} {index + 1}</p>
                        <p className={cn("font-bold truncate", isCompleted && "text-muted-foreground line-through")}>{step.title}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-card border-x border-b border-border/50 rounded-b-[2rem] p-5 pt-0">
                    <div className="space-y-4 pt-4">
                      <p className="text-sm text-balance leading-relaxed text-muted-foreground">{step.description}</p>

                      {step.voyTip && (
                        <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                          <p className="text-[10px] font-black text-primary uppercase mb-1">{t('aima.tip')}</p>
                          <p className="text-xs italic">"{step.voyTip}"</p>
                        </div>
                      )}

                      <Button
                        onClick={() => handleToggleStep(step.id)}
                        className={cn("w-full h-12 rounded-2xl font-bold", isCompleted ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-primary hover:bg-primary/90 shadow-glow")}
                      >
                        {isCompleted ? t('aima.unmark') : t('aima.mark_done')}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </MobileLayout>
  );
}
