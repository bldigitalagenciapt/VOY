import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Euro,
  InfoIcon,
  PiggyBank,
  Plus,
  Trash2,
  Users,
  Heart,
  Shield,
  Clock,
  Utensils,
  Receipt,
  TrendingDown,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  calculateNetSalary,
  formatCurrency,
  OVERTIME_OPTIONS,
  MEAL_ALLOWANCE_LIMITS,
  type SalaryInputs,
  type MaritalStatus,
  type MealAllowancePayType,
  type OvertimeEntry,
} from '@/lib/calculatorLogic';
import { cn } from '@/lib/utils';

// ────────────── SMALL HELPER COMPONENTS ──────────────

function InfoTooltip({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="inline-flex ml-1 align-middle">
          <InfoIcon className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[260px] text-xs leading-relaxed bg-popover border shadow-xl rounded-2xl px-4 py-3"
      >
        {children}
      </TooltipContent>
    </Tooltip>
  );
}

function PaystubRow({
  label,
  value,
  positive = true,
  bold = false,
  accent,
}: {
  label: string;
  value: number;
  positive?: boolean;
  bold?: boolean;
  accent?: string;
}) {
  return (
    <div className="flex items-baseline justify-between py-1.5">
      <span
        className={cn(
          'text-sm',
          bold ? 'font-bold text-foreground' : 'text-muted-foreground'
        )}
      >
        {label}
      </span>
      <div className="flex-1 mx-3 border-b border-dotted border-muted-foreground/15 relative top-[-3px]" />
      <span
        className={cn(
          'text-sm font-semibold tabular-nums whitespace-nowrap',
          accent
            ? accent
            : positive
              ? 'text-foreground'
              : 'text-orange-600 dark:text-orange-400'
        )}
      >
        {positive ? '' : '-'}
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  tooltip,
}: {
  icon: React.ElementType;
  title: string;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
        {title}
      </h3>
      {tooltip && <InfoTooltip>{tooltip}</InfoTooltip>}
    </div>
  );
}

function AlertBanner({
  type,
  message,
}: {
  type: 'info' | 'success' | 'warning';
  message: string;
}) {
  const config = {
    info: {
      bg: 'bg-blue-500/5 border-blue-500/20',
      icon: AlertCircle,
      iconColor: 'text-blue-500',
    },
    success: {
      bg: 'bg-emerald-500/5 border-emerald-500/20',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
    },
    warning: {
      bg: 'bg-amber-500/5 border-amber-500/20',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
    },
  };
  const c = config[type];
  const IconComp = c.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl border transition-all animate-in fade-in slide-in-from-bottom-2 duration-300',
        c.bg
      )}
    >
      <IconComp className={cn('w-4 h-4 mt-0.5 shrink-0', c.iconColor)} />
      <p className="text-xs leading-relaxed text-muted-foreground">{message}</p>
    </div>
  );
}

// ────────────── MAIN PAGE COMPONENT ──────────────

export default function SalaryCalculator() {
  const navigate = useNavigate();

  // ── Form State ──
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('single');
  const [dependents, setDependents] = useState(0);
  const [disability, setDisability] = useState(false);
  const [rnh, setRnh] = useState(false);

  const [baseSalary, setBaseSalary] = useState('1200');
  const [mealPerDay, setMealPerDay] = useState('10.20');
  const [mealDays, setMealDays] = useState('22');
  const [mealPayType, setMealPayType] = useState<MealAllowancePayType>('card');

  const [showExtras, setShowExtras] = useState(false);
  const [overtimeEntries, setOvertimeEntries] = useState<OvertimeEntry[]>([]);
  const [hasRetroactive, setHasRetroactive] = useState(false);
  const [retroTotal, setRetroTotal] = useState('');
  const [retroMonths, setRetroMonths] = useState('1');
  const [bonusTotal, setBonusTotal] = useState('');

  // ── Derived Calculation (pure, no side effects) ──
  const result = useMemo(() => {
    const inputs: SalaryInputs = {
      baseSalary: Number(baseSalary) || 0,
      maritalStatus,
      dependents,
      disability,
      rnh,
      mealAllowancePerDay: Number(mealPerDay) || 0,
      mealAllowanceWorkDays: Number(mealDays) || 0,
      mealAllowancePayType: mealPayType,
      overtimeEntries,
      hasRetroactive,
      retroactiveTotal: Number(retroTotal) || 0,
      retroactiveMonths: Math.max(1, Number(retroMonths) || 1),
      bonusTotal: Number(bonusTotal) || 0,
    };
    return calculateNetSalary(inputs);
  }, [
    baseSalary, maritalStatus, dependents, disability, rnh,
    mealPerDay, mealDays, mealPayType,
    overtimeEntries, hasRetroactive, retroTotal, retroMonths, bonusTotal,
  ]);

  // ── Overtime Handlers ──
  const addOvertime = () => {
    setOvertimeEntries((prev) => [
      ...prev,
      { id: crypto.randomUUID(), hours: 1, percentage: 25 },
    ]);
    if (!showExtras) setShowExtras(true);
  };

  const removeOvertime = (id: string) => {
    setOvertimeEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateOvertime = (
    id: string,
    field: 'hours' | 'percentage',
    value: number
  ) => {
    setOvertimeEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  // ── Render ──
  return (
    <MobileLayout showNav={true}>
      <div className="px-5 py-6 pb-24 safe-area-top">
        {/* ═══ HEADER ═══ */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold leading-tight">
              Simulador de Salário
            </h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Tabelas IRS 2025 · Continente
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* ═══ SECTION 1: PERFIL FISCAL ═══ */}
          <Card className="p-5 rounded-[28px] border-none shadow-lg bg-card">
            <SectionHeader
              icon={Users}
              title="Perfil Fiscal"
              tooltip="O seu perfil fiscal determina qual tabela de retenção IRS é aplicada ao seu rendimento."
            />

            <div className="space-y-4">
              {/* Estado Civil */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Estado Civil
                  <InfoTooltip>
                    A tabela de IRS muda conforme o seu estado civil e se o cônjuge também aufere rendimentos.
                  </InfoTooltip>
                </Label>
                <Select
                  value={maritalStatus}
                  onValueChange={(v) => setMaritalStatus(v as MaritalStatus)}
                >
                  <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none text-sm font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="single">Solteiro / Divorciado / Viúvo</SelectItem>
                    <SelectItem value="married_two_holders">Casado — 2 Titulares</SelectItem>
                    <SelectItem value="married_one_holder">Casado — Único Titular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dependentes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Dependentes
                  <InfoTooltip>
                    Filhos ou outros dependentes a cargo do agregado familiar. Cada dependente reduz a retenção de IRS.
                  </InfoTooltip>
                </Label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDependents((p) => Math.max(0, p - 1))}
                    className="w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center text-lg font-bold hover:bg-muted active:scale-95 transition-all"
                  >
                    −
                  </button>
                  <div className="flex-1 h-11 rounded-xl bg-muted/30 flex items-center justify-center">
                    <span className="text-xl font-black tabular-nums">{dependents}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDependents((p) => Math.min(10, p + 1))}
                    className="w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center text-lg font-bold hover:bg-muted active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500 opacity-60" />
                    <span className="text-sm font-medium">Deficiência ≥60%</span>
                    <InfoTooltip>
                      Pessoas com grau de incapacidade igual ou superior a 60% beneficiam de tabelas de retenção mais favoráveis.
                    </InfoTooltip>
                  </div>
                  <Switch checked={disability} onCheckedChange={setDisability} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-500 opacity-60" />
                    <span className="text-sm font-medium">Regime RNH</span>
                    <InfoTooltip>
                      Residente Não Habitual: regime fiscal especial com taxa fixa de 20% para
                      determinados rendimentos. Encerrou para novas inscrições em 2024.
                    </InfoTooltip>
                  </div>
                  <Switch checked={rnh} onCheckedChange={setRnh} />
                </div>
              </div>
            </div>
          </Card>

          {/* ═══ SECTION 2: RENDIMENTOS ═══ */}
          <Card className="p-5 rounded-[28px] border-none shadow-lg bg-card">
            <SectionHeader
              icon={Euro}
              title="Rendimentos"
              tooltip="Insira os valores que constam no seu recibo de vencimento."
            />

            <div className="space-y-4">
              {/* Salário Base */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Salário Base Mensal
                </Label>
                <div className="relative">
                  <Input
                    id="baseSalary"
                    type="number"
                    min="0"
                    step="10"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    className="h-14 text-2xl font-black pl-11 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/30"
                  />
                  <Euro className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                </div>
              </div>

              {/* Subsídio de Alimentação */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Subsídio de Alimentação
                  <InfoTooltip>
                    Valor pago pelo empregador para as refeições. Isento de imposto até{' '}
                    {formatCurrency(MEAL_ALLOWANCE_LIMITS.card)}/dia (cartão) ou{' '}
                    {formatCurrency(MEAL_ALLOWANCE_LIMITS.cash)}/dia (numerário).
                  </InfoTooltip>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      step="0.10"
                      value={mealPerDay}
                      onChange={(e) => setMealPerDay(e.target.value)}
                      className="h-11 pl-8 text-sm font-semibold rounded-xl bg-muted/30 border-none"
                      placeholder="€/dia"
                    />
                    <Utensils className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="31"
                      step="1"
                      value={mealDays}
                      onChange={(e) => setMealDays(e.target.value)}
                      className="h-11 pl-8 text-sm font-semibold rounded-xl bg-muted/30 border-none"
                      placeholder="Dias"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40 font-bold">
                      D
                    </span>
                  </div>
                </div>
                <Select
                  value={mealPayType}
                  onValueChange={(v) => setMealPayType(v as MealAllowancePayType)}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-muted/20 border-none text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="card">
                      💳 Cartão/Voucher (isento até {formatCurrency(MEAL_ALLOWANCE_LIMITS.card)}/dia)
                    </SelectItem>
                    <SelectItem value="cash">
                      💵 Numerário (isento até {formatCurrency(MEAL_ALLOWANCE_LIMITS.cash)}/dia)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* ═══ SECTION 3: EXTRAS (Collapsible) ═══ */}
          <Card className="rounded-[28px] border-none shadow-lg bg-card overflow-hidden">
            <button
              type="button"
              onClick={() => setShowExtras((p) => !p)}
              className="w-full p-5 flex items-center justify-between hover:bg-muted/10 active:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Extras
                </h3>
                {(overtimeEntries.length > 0 || hasRetroactive) && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                    {overtimeEntries.length + (hasRetroactive ? 1 : 0)}
                  </span>
                )}
              </div>
              {showExtras ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            <div
              className={cn(
                'transition-all duration-300 ease-in-out',
                showExtras
                  ? 'max-h-[800px] opacity-100'
                  : 'max-h-0 opacity-0 overflow-hidden'
              )}
            >
              <div className="px-5 pb-5 space-y-4">
                {/* Horas Extra */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Horas Extra
                    <InfoTooltip>
                      As horas extra são pagas com acréscimo sobre a taxa horária normal. A percentagem depende do dia e hora em que o trabalho é prestado.
                    </InfoTooltip>
                  </Label>

                  {overtimeEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 animate-in fade-in slide-in-from-top-1 duration-200"
                    >
                      <Input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={entry.hours}
                        onChange={(e) =>
                          updateOvertime(entry.id, 'hours', Number(e.target.value) || 0)
                        }
                        className="w-16 h-9 text-xs font-semibold text-center rounded-lg bg-background border-none"
                        placeholder="Horas"
                      />
                      <span className="text-[10px] text-muted-foreground font-medium">h ×</span>
                      <Select
                        value={String(entry.percentage)}
                        onValueChange={(v) =>
                          updateOvertime(entry.id, 'percentage', Number(v))
                        }
                      >
                        <SelectTrigger className="flex-1 h-9 rounded-lg bg-background border-none text-[11px] font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {OVERTIME_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={String(opt.value)} className="text-xs">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button
                        type="button"
                        onClick={() => removeOvertime(entry.id)}
                        className="w-9 h-9 shrink-0 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 active:scale-95 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOvertime}
                    className="w-full h-10 rounded-xl border-dashed border-primary/30 text-primary text-xs font-semibold gap-1.5 hover:bg-primary/5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar horas extra
                  </Button>
                </div>

                {/* Prêmio / Bônus */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Prêmio / Bônus
                    <InfoTooltip>
                      Preencha caso tenha recebido um prémio em dinheiro no mês (sujeito a SS e IRS na totalidade).
                    </InfoTooltip>
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      step="10"
                      value={bonusTotal}
                      onChange={(e) => setBonusTotal(e.target.value)}
                      className="h-11 pl-8 text-sm font-semibold rounded-xl bg-muted/30 border-none animate-in fade-in slide-in-from-top-1 duration-200"
                      placeholder="Valor"
                    />
                    <Euro className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                  </div>
                </div>

                {/* Retroativos */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 opacity-60" />
                      <span className="text-sm font-medium">Retroativos</span>
                      <InfoTooltip>
                        Se recebeu retroativos (valor acumulado de meses anteriores), o cálculo distribui esse valor pelos meses correspondentes para evitar subida injusta de escalão de IRS.
                      </InfoTooltip>
                    </div>
                    <Switch
                      checked={hasRetroactive}
                      onCheckedChange={(v) => {
                        setHasRetroactive(v);
                      }}
                    />
                  </div>

                  {hasRetroactive && (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase">
                          Valor Total
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            step="10"
                            value={retroTotal}
                            onChange={(e) => setRetroTotal(e.target.value)}
                            className="h-10 pl-7 text-sm font-semibold rounded-xl bg-muted/30 border-none"
                            placeholder="0"
                          />
                          <Euro className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase">
                          Nº Meses
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="24"
                          step="1"
                          value={retroMonths}
                          onChange={(e) => setRetroMonths(e.target.value)}
                          className="h-10 text-sm font-semibold text-center rounded-xl bg-muted/30 border-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* ═══ ALERTS ═══ */}
          {result.alerts.length > 0 && (
            <div className="space-y-2">
              {result.alerts.map((alert, i) => (
                <AlertBanner key={i} type={alert.type} message={alert.message} />
              ))}
            </div>
          )}

          {/* ═══ SECTION 4: RESULTADO (PAYSTUB) ═══ */}
          <Card className="rounded-[28px] border-none shadow-lg bg-card overflow-hidden">
            {/* Ganhos */}
            <div className="p-5 pb-3">
              <SectionHeader icon={Receipt} title="Recibo Detalhado" />

              <div className="mb-1">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">
                  💰 Ganhos
                </p>
                <PaystubRow
                  label="Salário Base"
                  value={result.earnings.baseSalary}
                  accent="text-foreground"
                />
                {result.earnings.mealAllowanceGross > 0 && (
                  <PaystubRow
                    label="Sub. Alimentação"
                    value={result.earnings.mealAllowanceGross}
                    accent="text-foreground"
                  />
                )}
                {result.earnings.overtimeTotal > 0 && (
                  <>
                    <PaystubRow
                      label="Horas Extra"
                      value={result.earnings.overtimeTotal}
                      accent="text-foreground"
                    />
                    {result.earnings.overtimeDetails.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-baseline justify-between py-0.5 pl-4"
                      >
                        <span className="text-[10px] text-muted-foreground/60 italic">
                          {d.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                          {formatCurrency(d.value)}
                        </span>
                      </div>
                    ))}
                  </>
                )}
                {result.earnings.retroactiveMonthly > 0 && (
                  <PaystubRow
                    label="Retroativos (mensal.)"
                    value={result.earnings.retroactiveMonthly}
                    accent="text-foreground"
                  />
                )}
                {result.earnings.bonusTotal > 0 && (
                  <PaystubRow
                    label="Prêmio / Bônus"
                    value={result.earnings.bonusTotal}
                    accent="text-foreground"
                  />
                )}

                <div className="mt-2 pt-2 border-t border-border/50">
                  <PaystubRow
                    label="TOTAL BRUTO"
                    value={result.earnings.totalGross}
                    bold
                    accent="text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-border/50 mx-5" />

            {/* Descontos */}
            <div className="p-5 pt-3 pb-3">
              <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2">
                📉 Descontos
              </p>

              <PaystubRow
                label={`Seg. Social (${result.deductions.ssRate}%)`}
                value={result.deductions.ssAmount}
                positive={false}
              />
              <div className="pl-4 py-0.5">
                <span className="text-[10px] text-muted-foreground/50 italic">
                  Base: {formatCurrency(result.deductions.ssBase)}
                </span>
              </div>

              <PaystubRow
                label={`IRS (${result.deductions.irsRate}%)`}
                value={result.deductions.irsAmount}
                positive={false}
              />
              <div className="pl-4 space-y-0.5 py-0.5">
                <span className="text-[10px] text-muted-foreground/50 italic block">
                  {result.deductions.irsTableUsed}
                </span>
                {result.deductions.irsDeduction > 0 && (
                  <span className="text-[10px] text-muted-foreground/50 italic block">
                    Parcela a abater: {formatCurrency(result.deductions.irsDeduction)}
                  </span>
                )}
                {result.deductions.irsDependentDeduction > 0 && (
                  <span className="text-[10px] text-muted-foreground/50 italic block">
                    Dedução dependentes: -{formatCurrency(result.deductions.irsDependentDeduction)}
                  </span>
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-border/50">
                <PaystubRow
                  label="TOTAL DESCONTOS"
                  value={result.deductions.totalDeductions}
                  positive={false}
                  bold
                />
              </div>
            </div>

            {/* Net Salary — Hero Card */}
            <div className="mx-3 mb-3">
              <div className="p-6 rounded-[24px] bg-primary text-primary-foreground relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <PiggyBank className="w-8 h-8 mb-1.5 opacity-30" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
                    Salário Líquido
                  </p>
                  <h2 className="text-4xl font-black mt-1 tabular-nums">
                    {formatCurrency(result.netSalary)}
                  </h2>
                  <p className="mt-3 text-[9px] opacity-50 leading-relaxed max-w-[240px]">
                    Valor estimado com base nas tabelas de retenção IRS 2025 (Continente).
                    Os valores reais podem variar.
                  </p>
                </div>
                {/* Glow effect */}
                <div className="absolute -left-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              </div>
            </div>
          </Card>

          {/* ═══ SUMMARY CARDS ═══ */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 rounded-[24px] border-none bg-orange-500/5 flex flex-col items-center justify-center text-center">
              <TrendingDown className="w-4 h-4 text-orange-500 mb-1 opacity-50" />
              <p className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">
                IRS Retido
              </p>
              <p className="text-base font-black text-orange-600 dark:text-orange-400 tabular-nums">
                {formatCurrency(result.deductions.irsAmount)}
              </p>
            </Card>
            <Card className="p-4 rounded-[24px] border-none bg-blue-500/5 flex flex-col items-center justify-center text-center">
              <TrendingDown className="w-4 h-4 text-blue-500 mb-1 opacity-50" />
              <p className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">
                Seg. Social
              </p>
              <p className="text-base font-black text-blue-600 dark:text-blue-400 tabular-nums">
                {formatCurrency(result.deductions.ssAmount)}
              </p>
            </Card>
          </div>

          {/* ═══ INFO BANNER ═══ */}
          <div className="flex items-start gap-2.5 p-4 bg-primary/5 rounded-2xl">
            <InfoIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Este simulador utiliza as tabelas de retenção na fonte do{' '}
              <strong>Despacho n.º 236-A/2025</strong>. Os valores são estimativas e podem
              diferir do recibo real de vencimento. Para valores oficiais, consulte o{' '}
              <span className="text-primary font-semibold">Portal das Finanças</span>.
            </p>
          </div>

          {/* ═══ CTA ═══ */}
          <Button
            onClick={() => navigate('/meu-bolso')}
            variant="outline"
            className="w-full h-14 rounded-2xl border-primary/20 text-primary font-bold gap-2 hover:bg-primary/5"
          >
            Gerir no meu orçamento
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
