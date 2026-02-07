import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ChevronLeft, Info, ShieldCheck, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function About() {
    const navigate = useNavigate();

    const aboutItems = [
        {
            id: 'about-voy',
            icon: Info,
            label: 'Sobre o VOY',
            onClick: () => navigate('/about/info'),
        },
        {
            id: 'privacy',
            icon: ShieldCheck,
            label: 'Privacidade e Termos',
            onClick: () => navigate('/about/privacy'),
        },
    ];

    return (
        <MobileLayout showNav={false}>
            <div className="px-5 py-6 safe-area-top">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-foreground">Sobre</h1>
                </div>

                {/* About List */}
                <div className="space-y-3 mb-10 text-pretty">
                    {aboutItems.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.id}
                                onClick={item.onClick}
                                className={cn(
                                    'w-full flex items-center gap-4 p-5 rounded-[2rem] glass-card glass-card-hover',
                                    'animate-slide-up border-primary/5'
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-medium text-foreground">{item.label}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </button>
                        );
                    })}
                </div>

                {/* LGPD Badge */}
                <div className="mt-8 flex flex-col items-center justify-center gap-2 opacity-60">
                    <ShieldCheck className="w-6 h-6 text-muted-foreground" />
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground text-center max-w-[200px]">
                        Em conformidade com a LGPD e GDPR
                    </p>
                </div>

                {/* Version */}
                <div className="mt-8 text-center pb-8 animate-fade-in">
                    <p className="text-xs font-black text-primary/40 uppercase tracking-[0.3em]">VOY VERSION 1.0.0</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="w-8 h-px bg-primary/10" />
                        <p className="text-[10px] font-medium text-muted-foreground italic">
                            Feito com excelência para você
                        </p>
                        <span className="w-8 h-px bg-primary/10" />
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
