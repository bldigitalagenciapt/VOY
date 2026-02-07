import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ChevronLeft, Rocket, Globe, ShieldCheck, Heart } from 'lucide-react';

export default function AppInfo() {
    const navigate = useNavigate();

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
                    <h1 className="text-2xl font-bold text-foreground">Sobre o VOY</h1>
                </div>

                <div className="space-y-6 text-pretty animate-slide-up">
                    {/* Intro */}
                    <div className="glass-card p-6 rounded-[2rem] border-primary/5">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                            <Rocket className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Sua Jornada Começa Aqui</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            O <strong>VOY</strong> é muito mais que um aplicativo. É o seu parceiro digital na jornada de imigração para Portugal. Desenvolvido para simplificar processos burocráticos e organizar sua nova vida.
                        </p>
                    </div>

                    {/* Mission */}
                    <div className="glass-card p-6 rounded-[2rem] border-primary/5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                            <Globe className="w-6 h-6 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Nossa Missão</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Facilitar a integração de imigrantes, centralizando documentos, processos e informações essenciais em um único lugar seguro e acessível.
                        </p>
                    </div>

                    {/* Security */}
                    <div className="glass-card p-6 rounded-[2rem] border-primary/5">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                            <ShieldCheck className="w-6 h-6 text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Segurança em Primeiro Lugar</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Seus dados são sagrados. Utilizamos criptografia de ponta e seguimos rigorosamente a LGPD para garantir que suas informações estejam sempre protegidas.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="pt-8 text-center opacity-60">
                        <Heart className="w-4 h-4 text-red-500 mx-auto mb-2 fill-current animate-pulse" />
                        <p className="text-xs font-black uppercase tracking-widest">
                            Feito com carinho para a comunidade
                        </p>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
