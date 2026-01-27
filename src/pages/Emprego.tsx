import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import {
    ChevronLeft,
    ExternalLink,
    Building2,
    Briefcase,
    Search,
    Globe2,
    Euro
} from 'lucide-react';

export default function Emprego() {
    const navigate = useNavigate();

    const categories = [
        {
            title: 'Agências de Emprego',
            links: [
                { label: 'Eurofirms', url: 'https://www.eurofirms.com/pt/pt/', icon: Building2, desc: 'Agência de recursos humanos' },
                { label: 'Gi Group', url: 'https://pt.gigroup.com/ofertas-de-emprego/', icon: Building2, desc: 'Consultoria de RH e recrutamento' },
                { label: 'Adecco', url: 'https://www.adecco.com/pt-pt', icon: Building2, desc: 'Líder mundial em recursos humanos' },
                { label: 'Randstad', url: 'https://www.randstad.pt', icon: Building2, desc: 'Soluções de trabalho e recrutamento' }
            ]
        },
        {
            title: 'Portais de Emprego',
            links: [
                { label: 'Net-Empregos', url: 'https://www.net-empregos.com/emprego-braga.asp', icon: Search, desc: 'Maior portal de emprego em Portugal' },
                { label: 'SAPO Emprego', url: 'https://emprego.sapo.pt/', icon: Briefcase, desc: 'Vagas de emprego em diversas áreas' },
                { label: 'Indeed Portugal', url: 'https://pt.indeed.com/', icon: Globe2, desc: 'Motor de busca de empregos' },
                { label: 'Alerta Emprego', url: 'https://www.alertaemprego.pt/', icon: Search, desc: 'Ofertas diárias de trabalho' }
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
                    <h1 className="text-2xl font-bold">Emprego</h1>
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
                <div className="mt-8 p-4 bg-orange-500/5 border border-orange-500/10 rounded-3xl flex gap-3 items-center">
                    <Briefcase className="w-5 h-5 text-orange-500 shrink-0" />
                    <p className="text-[10px] text-orange-500 font-medium leading-relaxed">
                        Mantenha o seu currículo atualizado e esteja atento a novas oportunidades nestes portais.
                    </p>
                </div>
            </div>
        </MobileLayout>
    );
}
