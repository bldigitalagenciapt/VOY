// ═══════════════════════════════════════════════════════════════
// calculatorLogic.ts — Motor de Cálculo de Salário Líquido PT
// Tabelas de Retenção IRS 2025 (Continente) - Despacho 236-A/2025
// ═══════════════════════════════════════════════════════════════

// ────────────── TYPES ──────────────

export type MaritalStatus = 'single' | 'married_two_holders' | 'married_one_holder';
export type MealAllowancePayType = 'card' | 'cash';

export interface OvertimeEntry {
  id: string;
  hours: number;
  percentage: number; // 25, 37.5, 50, 75, 100
}

export interface SalaryInputs {
  baseSalary: number;
  maritalStatus: MaritalStatus;
  dependents: number;
  disability: boolean;
  rnh: boolean;
  mealAllowancePerDay: number;
  mealAllowanceWorkDays: number;
  mealAllowancePayType: MealAllowancePayType;
  overtimeEntries: OvertimeEntry[];
  hasRetroactive: boolean;
  retroactiveTotal: number;
  retroactiveMonths: number;
}

export interface EarningsBreakdown {
  baseSalary: number;
  mealAllowanceGross: number;
  mealAllowanceTaxable: number;
  mealAllowanceExempt: number;
  overtimeTotal: number;
  overtimeDetails: { label: string; value: number }[];
  retroactiveMonthly: number;
  totalGross: number;
}

export interface DeductionsBreakdown {
  ssBase: number;
  ssRate: number;
  ssAmount: number;
  irsBase: number;
  irsTableUsed: string;
  irsRate: number;
  irsDeduction: number;
  irsDependentDeduction: number;
  irsAmount: number;
  totalDeductions: number;
}

export interface AlertInfo {
  type: 'info' | 'success' | 'warning';
  message: string;
}

export interface SalaryResult {
  earnings: EarningsBreakdown;
  deductions: DeductionsBreakdown;
  netSalary: number;
  alerts: AlertInfo[];
}

// ────────────── CONSTANTS ──────────────

const SS_EMPLOYEE_RATE = 0.11;
const RNH_FLAT_RATE = 0.20;
const STANDARD_MONTHLY_HOURS = 173.33; // 40h/sem × 52sem / 12meses

export const MEAL_ALLOWANCE_LIMITS = {
  card: 10.20,  // Limite isento em cartão/voucher (€/dia)
  cash: 6.00,   // Limite isento em numerário (€/dia)
};

export const OVERTIME_OPTIONS = [
  { value: 25,   label: 'Dia útil — 1ª hora (+25%)' },
  { value: 37.5, label: 'Dia útil — horas seguintes (+37,5%)' },
  { value: 50,   label: 'Descanso/Feriado — 1ª hora (+50%)' },
  { value: 75,   label: 'Descanso/Feriado — horas seguintes (+75%)' },
  { value: 100,  label: 'Trabalho noturno (+100%)' },
];

// ────────────── IRS TABLES 2025 (Continente) ──────────────
// Fonte: Despacho n.º 236-A/2025, de 6 de janeiro
// Fórmula: Retenção = (Rendimento × Taxa) - Parcela a Abater - (Deps × Dedução/Dep)
// Os valores são facilmente atualizáveis neste JSON.

interface IRSBracket {
  maxIncome: number;
  rate: number;              // Taxa marginal (%)
  deduction: number;         // Parcela a abater (€)
  dependentDeduction: number; // Dedução por dependente (€)
}

// Tabela I: Não casado sem dependentes / Casado 2 titulares
const TABLE_I: IRSBracket[] = [
  { maxIncome: 870,      rate: 0,     deduction: 0,       dependentDeduction: 0 },
  { maxIncome: 935,      rate: 13.25, deduction: 115.28,  dependentDeduction: 0 },
  { maxIncome: 1001,     rate: 18.00, deduction: 159.68,  dependentDeduction: 0 },
  { maxIncome: 1123,     rate: 23.00, deduction: 209.73,  dependentDeduction: 0 },
  { maxIncome: 1765,     rate: 26.00, deduction: 243.40,  dependentDeduction: 0 },
  { maxIncome: 2057,     rate: 32.75, deduction: 362.47,  dependentDeduction: 0 },
  { maxIncome: 2664,     rate: 37.00, deduction: 449.89,  dependentDeduction: 0 },
  { maxIncome: 3193,     rate: 38.72, deduction: 495.70,  dependentDeduction: 0 },
  { maxIncome: 4157,     rate: 40.20, deduction: 542.96,  dependentDeduction: 0 },
  { maxIncome: 5479,     rate: 41.68, deduction: 604.48,  dependentDeduction: 0 },
  { maxIncome: 6650,     rate: 43.30, deduction: 693.25,  dependentDeduction: 0 },
  { maxIncome: 20067,    rate: 44.95, deduction: 803.02,  dependentDeduction: 0 },
  { maxIncome: Infinity, rate: 47.17, deduction: 1248.11, dependentDeduction: 0 },
];

// Tabela II: Não casado com dependentes
const TABLE_II: IRSBracket[] = [
  { maxIncome: 870,      rate: 0,     deduction: 0,       dependentDeduction: 21.43 },
  { maxIncome: 935,      rate: 13.25, deduction: 115.28,  dependentDeduction: 21.43 },
  { maxIncome: 1001,     rate: 18.00, deduction: 159.68,  dependentDeduction: 21.43 },
  { maxIncome: 1123,     rate: 23.00, deduction: 209.73,  dependentDeduction: 21.43 },
  { maxIncome: 1765,     rate: 26.00, deduction: 243.40,  dependentDeduction: 21.43 },
  { maxIncome: 2057,     rate: 32.75, deduction: 362.47,  dependentDeduction: 21.43 },
  { maxIncome: 2664,     rate: 37.00, deduction: 449.89,  dependentDeduction: 21.43 },
  { maxIncome: 3193,     rate: 38.72, deduction: 495.70,  dependentDeduction: 21.43 },
  { maxIncome: 4157,     rate: 40.20, deduction: 542.96,  dependentDeduction: 21.43 },
  { maxIncome: 5479,     rate: 41.68, deduction: 604.48,  dependentDeduction: 21.43 },
  { maxIncome: 6650,     rate: 43.30, deduction: 693.25,  dependentDeduction: 21.43 },
  { maxIncome: 20067,    rate: 44.95, deduction: 803.02,  dependentDeduction: 21.43 },
  { maxIncome: Infinity, rate: 47.17, deduction: 1248.11, dependentDeduction: 21.43 },
];

// Tabela III: Casado, único titular
const TABLE_III: IRSBracket[] = [
  { maxIncome: 870,      rate: 0,     deduction: 0,       dependentDeduction: 21.43 },
  { maxIncome: 1001,     rate: 0,     deduction: 0,       dependentDeduction: 21.43 },
  { maxIncome: 1123,     rate: 13.25, deduction: 148.85,  dependentDeduction: 21.43 },
  { maxIncome: 1765,     rate: 18.00, deduction: 202.18,  dependentDeduction: 21.43 },
  { maxIncome: 2057,     rate: 23.00, deduction: 290.48,  dependentDeduction: 21.43 },
  { maxIncome: 2664,     rate: 26.00, deduction: 352.16,  dependentDeduction: 21.43 },
  { maxIncome: 3193,     rate: 32.75, deduction: 531.77,  dependentDeduction: 21.43 },
  { maxIncome: 4157,     rate: 37.00, deduction: 667.50,  dependentDeduction: 21.43 },
  { maxIncome: 5479,     rate: 38.72, deduction: 739.00,  dependentDeduction: 21.43 },
  { maxIncome: 6650,     rate: 40.20, deduction: 820.10,  dependentDeduction: 21.43 },
  { maxIncome: 20067,    rate: 41.68, deduction: 918.42,  dependentDeduction: 21.43 },
  { maxIncome: Infinity, rate: 44.95, deduction: 1574.72, dependentDeduction: 21.43 },
];

const TABLE_NAMES: Record<string, string> = {
  TABLE_I: 'Tabela I — Não casado s/ dep. / Casado 2 titulares',
  TABLE_II: 'Tabela II — Não casado c/ dependentes',
  TABLE_III: 'Tabela III — Casado, único titular',
};

// ────────────── HELPER FUNCTIONS ──────────────

function selectIRSTable(
  status: MaritalStatus,
  dependents: number
): { table: IRSBracket[]; tableName: string } {
  if (status === 'married_one_holder') {
    return { table: TABLE_III, tableName: 'TABLE_III' };
  }
  if (status === 'single' && dependents > 0) {
    return { table: TABLE_II, tableName: 'TABLE_II' };
  }
  // single without dependents OR married_two_holders
  return { table: TABLE_I, tableName: 'TABLE_I' };
}

function findBracket(table: IRSBracket[], income: number): IRSBracket {
  return table.find(b => income <= b.maxIncome) ?? table[table.length - 1];
}

/**
 * Calcula retenção IRS mensal com base nas tabelas de taxas marginais.
 * Fórmula: (Rendimento × Taxa%) - Parcela a Abater - (Dependentes × Dedução/Dep)
 */
function calculateIRS(
  monthlyIncome: number,
  status: MaritalStatus,
  dependents: number,
  disability: boolean,
  rnh: boolean
): {
  amount: number;
  rate: number;
  deduction: number;
  dependentDeduction: number;
  tableName: string;
} {
  if (monthlyIncome <= 0) {
    return { amount: 0, rate: 0, deduction: 0, dependentDeduction: 0, tableName: 'N/A' };
  }

  // Regime RNH: taxa fixa de 20%
  if (rnh) {
    const amount = monthlyIncome * RNH_FLAT_RATE;
    return { amount, rate: 20, deduction: 0, dependentDeduction: 0, tableName: 'RNH (20%)' };
  }

  const { table, tableName } = selectIRSTable(status, dependents);
  const bracket = findBracket(table, monthlyIncome);

  const grossIRS = (monthlyIncome * bracket.rate / 100) - bracket.deduction;
  const depsDeduction = dependents * bracket.dependentDeduction;
  let irsAmount = grossIRS - depsDeduction;

  // Deficiência ≥60%: redução aproximada de 25% na retenção
  // (Simplificação das Tabelas IV/V/VI do Despacho)
  if (disability) {
    irsAmount *= 0.75;
  }

  // IRS nunca pode ser negativo
  irsAmount = Math.max(0, irsAmount);

  return {
    amount: irsAmount,
    rate: bracket.rate,
    deduction: bracket.deduction,
    dependentDeduction: depsDeduction,
    tableName: TABLE_NAMES[tableName] ?? tableName,
  };
}

/**
 * Calcula a Segurança Social do trabalhador (11%).
 * Base: Salário Base + Horas Extra + SA tributável
 * O SA só é tributável se exceder os limites legais.
 */
function calculateSS(
  baseSalary: number,
  overtimeTotal: number,
  mealAllowanceTaxable: number
): number {
  const ssBase = baseSalary + overtimeTotal + mealAllowanceTaxable;
  return Math.max(0, ssBase * SS_EMPLOYEE_RATE);
}

/**
 * Calcula subsídio de alimentação e determina parte tributável.
 */
function calculateMealAllowance(
  valuePerDay: number,
  workDays: number,
  payType: MealAllowancePayType
): { gross: number; taxable: number; exempt: number } {
  const limit = MEAL_ALLOWANCE_LIMITS[payType];
  const gross = valuePerDay * workDays;

  if (valuePerDay <= limit) {
    return { gross, taxable: 0, exempt: gross };
  }

  const taxablePerDay = valuePerDay - limit;
  const taxable = taxablePerDay * workDays;
  const exempt = limit * workDays;

  return { gross, taxable, exempt };
}

/**
 * Calcula horas extra com base na taxa horária do salário base.
 */
function calculateOvertime(
  baseSalary: number,
  entries: OvertimeEntry[]
): { total: number; details: { label: string; value: number }[] } {
  if (entries.length === 0) return { total: 0, details: [] };

  const hourlyRate = baseSalary / STANDARD_MONTHLY_HOURS;
  const details: { label: string; value: number }[] = [];
  let total = 0;

  for (const entry of entries) {
    const multiplier = 1 + entry.percentage / 100;
    const value = entry.hours * hourlyRate * multiplier;
    total += value;

    const option = OVERTIME_OPTIONS.find(o => o.value === entry.percentage);
    details.push({
      label: `${entry.hours}h × ${entry.percentage}% (${option?.label.split('(')[0].trim() ?? ''})`,
      value,
    });
  }

  return { total, details };
}

// ────────────── MAIN CALCULATION ──────────────

export function calculateNetSalary(inputs: SalaryInputs): SalaryResult {
  const alerts: AlertInfo[] = [];
  const baseSalary = Math.max(0, inputs.baseSalary);

  // 1. Subsídio de Alimentação
  const mealResult = calculateMealAllowance(
    inputs.mealAllowancePerDay,
    inputs.mealAllowanceWorkDays,
    inputs.mealAllowancePayType
  );

  // 2. Horas Extra
  const overtimeResult = calculateOvertime(baseSalary, inputs.overtimeEntries);

  // 3. Retroativos (distribuídos por meses)
  let retroactiveMonthly = 0;
  if (inputs.hasRetroactive && inputs.retroactiveTotal > 0 && inputs.retroactiveMonths > 0) {
    retroactiveMonthly = inputs.retroactiveTotal / inputs.retroactiveMonths;
    alerts.push({
      type: 'info',
      message: `Cálculo otimizado: distribuímos os retroativos (${formatCurrency(inputs.retroactiveTotal)}) por ${inputs.retroactiveMonths} meses (${formatCurrency(retroactiveMonthly)}/mês) para simular menor impacto no escalão de IRS.`,
    });
  }

  // 4. Total Bruto
  const totalGross = baseSalary + mealResult.gross + overtimeResult.total + retroactiveMonthly;

  // 5. Segurança Social (11% sobre Base + HExtra + SA tributável)
  const ssBase = baseSalary + overtimeResult.total + mealResult.taxable + retroactiveMonthly;
  const ssAmount = Math.max(0, ssBase * SS_EMPLOYEE_RATE);

  // 6. Base tributável para IRS = Base + HExtra + SA tributável + Retroativos mensalizados - SS
  const irsBase = baseSalary + overtimeResult.total + mealResult.taxable + retroactiveMonthly;
  const irsResult = calculateIRS(
    irsBase,
    inputs.maritalStatus,
    inputs.dependents,
    inputs.disability,
    inputs.rnh
  );

  // 7. Deduções totais
  const totalDeductions = ssAmount + irsResult.amount;

  // 8. Salário Líquido
  const netSalary = totalGross - totalDeductions;

  // ── Alertas inteligentes ──
  if (irsResult.amount === 0 && baseSalary > 0) {
    alerts.push({
      type: 'success',
      message: 'O seu rendimento está abaixo do mínimo de existência. Não haverá retenção de IRS este mês.',
    });
  }

  if (inputs.rnh) {
    alerts.push({
      type: 'warning',
      message: 'Regime RNH ativo: taxa fixa de 20%. Nota: o RNH clássico encerrou para novas inscrições em 2024.',
    });
  }

  if (inputs.disability) {
    alerts.push({
      type: 'info',
      message: 'Deficiência ≥60%: Aplicada redução aproximada de 25% na retenção IRS (simplificação das Tabelas IV/V/VI).',
    });
  }

  if (mealResult.taxable > 0) {
    alerts.push({
      type: 'warning',
      message: `O subsídio de alimentação excede o limite isento de ${formatCurrency(MEAL_ALLOWANCE_LIMITS[inputs.mealAllowancePayType])}/dia. O excedente (${formatCurrency(mealResult.taxable)}) é tributável.`,
    });
  }

  return {
    earnings: {
      baseSalary,
      mealAllowanceGross: mealResult.gross,
      mealAllowanceTaxable: mealResult.taxable,
      mealAllowanceExempt: mealResult.exempt,
      overtimeTotal: overtimeResult.total,
      overtimeDetails: overtimeResult.details,
      retroactiveMonthly,
      totalGross,
    },
    deductions: {
      ssBase,
      ssRate: SS_EMPLOYEE_RATE * 100,
      ssAmount,
      irsBase,
      irsTableUsed: irsResult.tableName,
      irsRate: irsResult.rate,
      irsDeduction: irsResult.deduction,
      irsDependentDeduction: irsResult.dependentDeduction,
      irsAmount: irsResult.amount,
      totalDeductions,
    },
    netSalary,
    alerts,
  };
}

// ────────────── FORMATAÇÃO ──────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
