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
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { useApp } from '@/contexts/AppContext';

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
  const { process, loading, steps, selectProcessType, toggleStep, resetProcess } = useAimaProcess();
  const [saving, setSaving] = useState(false);

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

  if (!process) {
    return (
      <MobileLayout>
        <div className="px-5 py-6 safe-area-top">
          <h1 className="text-2xl font-bold text-foreground mb-2 text-center md:text-left">{t('aima.title')}</h1>
          <p className="text-muted-foreground mb-8 text-center md:text-left">{t('aima.subtitle')}</p>
          <div className="grid grid-cols-1 gap-4">
            {processTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => selectProcessType(type.id)}
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
        </div>
      </MobileLayout>
    );
  }

  const completedCount = process.completed_steps?.length || 0;
  const progress = (completedCount / steps.length) * 100;

  return (
    <MobileLayout>
      <div className="px-5 py-6 pb-24 safe-area-top">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t('aima.title')}</h1>
          <Button variant="ghost" size="sm" onClick={() => resetProcess()} className="text-destructive">
            {t('aima.close')}
          </Button>
        </div>

        <div className="bg-card p-6 rounded-[2.5rem] border border-border/50 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('aima.progress')}</p>
              <p className="text-lg font-bold">{completedCount} {t('aima.of')} {steps.length} {t('aima.completed')}</p>
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
            {steps.map((step, index) => {
              const isCompleted = process.completed_steps?.includes(step.id);
              return (
                <AccordionItem key={step.id} value={step.id} className="border-none">
                  <AccordionTrigger className="bg-card p-5 rounded-[2rem] border border-border/50 hover:no-underline [&[data-state=open]]:rounded-b-none">
                    <div className="flex items-center gap-4 text-left w-full">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all",
                        isCompleted ? "bg-success/10 border-success text-success" : "bg-muted border-transparent text-muted-foreground"
                      )}>
                        {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : <span className="text-sm font-black">{index + 1}</span>}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground">{t('aima.step')} {index + 1}</p>
                        <p className={cn("font-bold", isCompleted && "text-muted-foreground line-through")}>{step.title}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-card border-x border-b border-border/50 rounded-b-[2rem] p-5 pt-0">
                    <div className="space-y-4 pt-4">
                      <p className="text-sm text-balance leading-relaxed">{step.description}</p>
                      <Button
                        onClick={() => handleToggleStep(step.id)}
                        className={cn("w-full rounded-2xl", isCompleted ? "bg-muted text-muted-foreground" : "bg-primary")}
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
