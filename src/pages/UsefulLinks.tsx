import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';
import {
    ChevronLeft,
    ExternalLink,
    Building2,
    Stethoscope,
    Scale,
    Umbrella,
    Smartphone,
    Globe2,
    Euro
} from 'lucide-react';

export default function UsefulLinks() {
    const navigate = useNavigate();

    const categories = [
        {
            title: 'Administração & Vistos',
            links: [
                { label: 'Portal AIMA', url: 'https://aima.gov.pt', icon: Building2, desc: 'Processos e agendamentos de residência' },
                { label: 'Cidadão.pt', url: 'https://eportugal.gov.pt', icon: Building2, desc: 'Central de serviços públicos' }
            ]
        },
        {
            title: 'Finanças & Segurança Social',
            links: [
                { label: 'Portal das Finanças', url: 'https://www.portaldasfinancas.gov.pt', icon: Euro, desc: 'NIF, IRS e taxas' },
                { label: 'Segurança Social Direta', url: 'https://app.seg-social.pt', icon: Umbrella, desc: 'NISS e prestações sociais' }
            ]
        },
        {
            title: 'Saúde & Educação',
            links: [
                { label: 'Portal SNS24', url: 'https://www.sns24.gov.pt', icon: Stethoscope, desc: 'Número de Utente e consultas' },
                { label: 'DGE (Educação)', url: 'https://www.dge.mec.pt', icon: Scale, desc: 'Equivalências e matrículas' }
            ]
        },
        {
            title: 'Vida em Portugal',
            links: [
                { label: 'Custo de Vida (Numbeo)', url: 'https://www.numbeo.com/cost-of-living/in/Lisbon', icon: Euro, desc: 'Comparador de preços reais' },
                { label: 'Idealista', url: 'https://www.idealista.pt', icon: Building2, desc: 'Arrendamento e compra de casa' }
            ]
        }
    ];

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
                    <h1 className="text-2xl font-bold">Links Úteis</h1>
                </div>

                <div className="space-y-8">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="space-y-4">
                            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                                {cat.title}
                            </h2>
                            <div className="grid gap-3">
                                {cat.links.map((link, lIdx) => (
                                    <button
                                        key={lIdx}
                                        onClick={() => window.open(link.url, '_blank')}
                                        className="w-full flex items-center gap-4 p-4 rounded-3xl bg-card border border-border/50 hover:border-primary/50 hover:bg-primary/5 active:scale-98 transition-all text-left group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors group-hover:text-primary">
                                            <link.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm group-hover:text-primary transition-colors">{link.label}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">{link.desc}</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Safety Banner */}
                <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex gap-3 items-center">
                    <Globe2 className="w-5 h-5 text-blue-500 shrink-0" />
                    <p className="text-[10px] text-blue-500 font-medium leading-relaxed">
                        Certifique-se sempre de que está num site oficial (.gov.pt) antes de inserir dados sensíveis.
                    </p>
                </div>
            </div>
        </MobileLayout>
    );
}
