import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import {
    ChevronLeft,
    ExternalLink,
    Briefcase,
    Search
} from 'lucide-react';

export default function Emprego() {
    const navigate = useNavigate();

    const getLogoUrl = (domain: string) => {
        return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
    };

    const categories = [
        {
            title: 'Agências de Emprego',
            links: [
                { label: 'Eurofirms', url: 'https://www.eurofirms.com/pt/pt/', domain: 'eurofirms.com', desc: 'Agência de recursos humanos' },
                { label: 'Gi Group', url: 'https://pt.gigroup.com/ofertas-de-emprego/', domain: 'gigroup.com', desc: 'Consultoria de RH e recrutamento' },
                { label: 'Adecco', url: 'https://www.adecco.com/pt-pt', domain: 'adecco.com', desc: 'Líder mundial em recursos humanos' },
                { label: 'Randstad', url: 'https://www.randstad.pt', domain: 'randstad.pt', desc: 'Soluções de trabalho e recrutamento' }
            ]
        },
        {
            title: 'Portais de Emprego',
            links: [
                { label: 'Net-Empregos', url: 'https://www.net-empregos.com/emprego-braga.asp', domain: 'net-empregos.com', desc: 'Maior portal de emprego em Portugal' },
                { label: 'IEFP Online', url: 'https://www.iefp.pt/', domain: 'iefp.pt', desc: 'Instituto de Emprego e Formação Profissional' },
                { label: 'SAPO Emprego', url: 'https://emprego.sapo.pt/', domain: 'sapo.pt', desc: 'Vagas de emprego em diversas áreas' },
                { label: 'Indeed Portugal', url: 'https://pt.indeed.com/', domain: 'indeed.com', desc: 'Motor de busca de empregos' },
                { label: 'Alerta Emprego', url: 'https://www.alertaemprego.pt/', domain: 'alertaemprego.pt', desc: 'Ofertas diárias de trabalho' }
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
                    <h1 className="text-2xl font-bold italic tracking-tight">Emprego</h1>
                </div>

                <div className="space-y-8">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="space-y-4">
                            <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] px-1 opacity-70">
                                {cat.title}
                            </h2>
                            <div className="grid gap-3">
                                {cat.links.map((link, lIdx) => (
                                    <button
                                        key={lIdx}
                                        onClick={() => window.open(link.url, '_blank')}
                                        className="w-full flex items-center gap-4 p-4 rounded-[2rem] bg-card border border-border/40 hover:border-primary/30 hover:bg-primary/5 active:scale-95 transition-all text-left group shadow-sm"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-white border border-border/20 flex items-center justify-center group-hover:scale-105 transition-transform p-2 shadow-sm shrink-0">
                                            <img
                                                src={getLogoUrl(link.domain)}
                                                alt={link.label}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://www.google.com/s2/favicons?sz=128&domain=google.com'; // Fallback
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-sm group-hover:text-primary transition-colors tracking-tight">{link.label}</p>
                                            <p className="text-[10px] font-medium text-muted-foreground line-clamp-1 opacity-80">{link.desc}</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Safety Banner */}
                <div className="mt-10 p-5 bg-primary/5 border border-primary/10 rounded-[2.5rem] flex gap-4 items-center shadow-inner">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-[11px] text-foreground/80 font-bold leading-relaxed">
                        Mantenha seu currículo atualizado e prepare-se para as entrevistas. O mercado português valoriza a proatividade!
                    </p>
                </div>
            </div>
        </MobileLayout>
    );
}
