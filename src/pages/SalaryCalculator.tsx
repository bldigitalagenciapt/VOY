import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    Calculator as CalcIcon,
    Euro,
    TrendingDown,
    TrendingUp,
    InfoIcon,
    PiggyBank
} from 'lucide-react';

export default function SalaryCalculator() {
    const navigate = useNavigate();
    const [grossSalary, setGrossSalary] = useState<number>(1200);
    const [ssRate, setSsRate] = useState<number>(11); // Standard 11%
    const [netSalary, setNetSalary] = useState<number>(0);
    const [irsTax, setIrsTax] = useState<number>(0);
    const [ssTax, setSsTax] = useState<number>(0);

    // Simple Portuguese IRS Brackets Approximation (2026 simplified)
    const calculateTaxes = () => {
        const ss = grossSalary * (ssRate / 100);

        // IRS Estimation (Simplified brackets for Portugal)
        let irsRate = 0;
        if (grossSalary <= 850) irsRate = 0;
        else if (grossSalary <= 1200) irsRate = 8;
        else if (grossSalary <= 1800) irsRate = 15;
        else if (grossSalary <= 2500) irsRate = 22;
        else if (grossSalary <= 4000) irsRate = 28;
        else irsRate = 35;

        const irs = grossSalary * (irsRate / 100);
        const net = grossSalary - ss - irs;

        setSsTax(ss);
        setIrsTax(irs);
        setNetSalary(net);
    };

    useEffect(() => {
        calculateTaxes();
    }, [grossSalary]);

    return (
        <MobileLayout showNav={true}>
            <div className="px-5 py-6 pb-24 safe-area-top">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/home')}
                        className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold">Simulador de Salário</h1>
                </div>

                <div className="space-y-6">
                    {/* Input Card */}
                    <Card className="p-6 rounded-[32px] border-none shadow-xl bg-card">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="gross" className="text-xs font-bold uppercase text-muted-foreground">Salário Bruto Mensal</Label>
                                <div className="relative">
                                    <Input
                                        id="gross"
                                        type="number"
                                        value={grossSalary}
                                        onChange={(e) => setGrossSalary(Number(e.target.value))}
                                        className="h-16 text-3xl font-black pl-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary/20"
                                    />
                                    <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-primary opacity-50" />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-2xl">
                                <InfoIcon className="w-4 h-4 text-primary" />
                                <p className="text-[10px] text-muted-foreground leading-tight italic">
                                    Este simulador utiliza tabelas de retenção genéricas para solteiros sem dependentes. Os valores são aproximados.
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Results Visual */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4 rounded-[28px] border-none bg-orange-500/5 flex flex-col items-center justify-center text-center">
                            <TrendingDown className="w-5 h-5 text-orange-500 mb-1 opacity-50" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">IRS (Est.)</p>
                            <p className="text-lg font-black text-orange-600">-{irsTax.toFixed(2)}€</p>
                        </Card>
                        <Card className="p-4 rounded-[28px] border-none bg-blue-500/5 flex flex-col items-center justify-center text-center">
                            <TrendingDown className="w-5 h-5 text-blue-500 mb-1 opacity-50" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Seg. Social</p>
                            <p className="text-lg font-black text-blue-600">-{ssTax.toFixed(2)}€</p>
                        </Card>
                    </div>

                    {/* Final Net Result */}
                    <Card className="p-8 rounded-[40px] border-none bg-primary text-primary-foreground shadow-2xl shadow-primary/30 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <PiggyBank className="w-10 h-10 mb-2 opacity-30" />
                            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Salário Líquido Estimado</p>
                            <h2 className="text-5xl font-black mt-2">{netSalary.toFixed(2)}€</h2>
                            <p className="mt-4 text-[10px] opacity-60">* Baseado em 14 meses e retenção na fonte.</p>
                        </div>
                        {/* Glossy background element */}
                        <div className="absolute -left-20 -top-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
                    </Card>

                    <Button
                        onClick={() => navigate('/meu-bolso')}
                        variant="outline"
                        className="w-full h-14 rounded-2xl border-primary/20 text-primary font-bold gap-2"
                    >
                        Gerir no meu orçamento
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </MobileLayout>
    );
}

function ArrowRight({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        </svg>
    );
}
