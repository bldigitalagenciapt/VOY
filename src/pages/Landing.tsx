import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    Download,
    Smartphone,
    CheckCircle2,
    ArrowRight,
    Menu,
    X,
    Share,
    PlusSquare,
    UserPlus,
    FileText,
    MessageSquare,
    Globe,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Landing() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showIosModal, setShowIosModal] = useState(false);
    const [isIos, setIsIos] = useState(false);

    useEffect(() => {
        // Detect iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIos(isIosDevice);

        // Capture PWA Install Prompt (Android/Chrome)
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });

        window.addEventListener('appinstalled', () => {
            setDeferredPrompt(null);
            console.log('PWA was installed');
        });
    }, []);

    const handleInstallClick = async () => {
        if (isIos) {
            setShowIosModal(true);
        } else if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        } else {
            // Fallback if no prompt or already installed
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    };

    const features = [
        {
            icon: <FileText className="w-8 h-8 text-blue-500" />,
            title: "Gestão de Documentos",
            description: "Organize NIF, NISS, SNS e passaporte em um cofre digital seguro e criptografado."
        },
        {
            icon: <Globe className="w-8 h-8 text-emerald-500" />,
            title: "Rastreador AIMA",
            description: "Acompanhe cada etapa do seu processo de residência com notificações em tempo real."
        },
        {
            icon: <MessageSquare className="w-8 h-8 text-purple-500" />,
            title: "Comunidade Ativa",
            description: "Conecte-se com outros imigrantes e compartilhe experiências no nosso mural exclusivo."
        }
    ];

    const plans = [
        {
            name: "Explorador",
            price: "Grátis",
            features: ["Acesso ao Guia de Chegada", "Gestão de 3 Documentos", "Simulador Salarial", "Acesso à Comunidade"],
            cta: "Começar Agora",
            popular: false
        },
        {
            name: "Residente Pro",
            price: "€19.90",
            period: "/ parcela única",
            features: ["Documentos Ilimitados", "Rastreador AIMA Avançado", "Cofre Criptografado", "Suporte Prioritário", "Sem Anúncios"],
            cta: "Comprar Acesso",
            popular: true
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-primary/20 selection:text-primary">
            {/* Sticky Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <img src="/logo.png" alt="VOY" className="w-7 h-7 object-contain brightness-0 invert" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter uppercase text-slate-800">VOY</span>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors uppercase tracking-widest">Funcionalidades</a>
                        <a href="#showcase" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors uppercase tracking-widest">Aplicativo</a>
                        <a href="#pricing" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors uppercase tracking-widest">Preços</a>
                        <Button onClick={() => navigate('/auth')} variant="ghost" className="font-bold uppercase tracking-widest text-xs">Login</Button>
                        <Button onClick={handleInstallClick} className="rounded-full px-8 font-black uppercase tracking-tighter text-sm shadow-xl shadow-primary/20">Instalar App</Button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-600">
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Nav Overlay */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-200 animate-in slide-in-from-top duration-300">
                        <nav className="flex flex-col p-6 gap-4">
                            <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold p-2">Funcionalidades</a>
                            <a href="#showcase" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold p-2">Aplicativo</a>
                            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold p-2">Preços</a>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <Button onClick={() => navigate('/auth')} variant="outline" className="rounded-2xl h-14 font-bold">Login</Button>
                                <Button onClick={handleInstallClick} className="rounded-2xl h-14 font-black">Instalar</Button>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-20 right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-[-10%] w-[30%] h-[30%] bg-blue-400/10 blur-[100px] rounded-full" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-up duration-700">
                        <Zap className="w-3 h-3 fill-primary" /> Lançamento Oficial VOY 2.0
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tight text-slate-900 leading-[0.9] mb-8 animate-in fade-in slide-in-from-up duration-1000">
                        A porta de entrada<br />
                        <span className="text-primary italic">para o seu futuro</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                        Simplificamos sua jornada migratória em Portugal. Organize seus documentos,
                        rastreie seu processo AIMA e conecte-se com quem trilha o mesmo caminho.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                            className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30 group"
                        >
                            Começar Agora
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            onClick={handleInstallClick}
                            variant="outline"
                            className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-bold border-2 bg-white/50"
                        >
                            <Download className="mr-2 w-5 h-5" />
                            Ver App Demo
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Tudo em um só lugar</h2>
                        <p className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
                            Feito por quem entende<br />sua jornada.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-10">
                        {features.map((f, i) => (
                            <div key={i} className="group p-8 rounded-[2.5rem] bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 transition-all hover:shadow-2xl hover:shadow-slate-200/50">
                                <div className="mb-6 inline-flex p-4 bg-white rounded-3xl shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-black mb-4 text-slate-800 tracking-tight">{f.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* App Showcase Mockup */}
            <section id="showcase" className="py-24 px-6 relative overflow-hidden bg-slate-900 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)]" />
                <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10">
                    <div className="text-center max-w-3xl mb-20">
                        <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Interface Premium</h2>
                        <p className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-[0.95]">
                            Uma experiência<br />nativa no seu celular.
                        </p>
                        <p className="text-slate-400 font-medium text-lg">
                            Nosso PWA oferece a fluidez de um aplicativo instalado com a praticidade da web.
                            Sem ocupar espaço na sua memória.
                        </p>
                    </div>

                    {/* Smartphone Mockup */}
                    <div className="relative w-[300px] md:w-[350px] aspect-[9/19] bg-slate-800 rounded-[3rem] p-4 border-[8px] border-slate-700 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-700 rounded-b-2xl z-20" />
                        <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative group">
                            <img src="https://placehold.co/600x1200/1e293b/white?text=VOY+Interface+Home" alt="App Content" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-8">
                                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                    <div className="w-1/3 h-full bg-primary" />
                                </div>
                            </div>
                        </div>

                        {/* Floating Decorations */}
                        <div className="absolute -left-20 top-1/4 hidden md:block animate-float">
                            <div className="glass-card bg-white/10 dark p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
                                <CheckCircle2 className="text-emerald-400 w-6 h-6 mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-300">Documento Validado</p>
                                <p className="text-[10px] text-slate-400 mt-1">Passaporte atualizado em 24h</p>
                            </div>
                        </div>
                        <div className="absolute -right-20 bottom-1/4 hidden md:block animate-float" style={{ animationDelay: '1s' }}>
                            <div className="glass-card bg-primary/20 p-4 rounded-2xl border border-primary/20 backdrop-blur-xl">
                                <Smartphone className="text-primary w-6 h-6 mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest text-white">Instalação One-Click</p>
                                <p className="text-[10px] text-blue-200 mt-1">Totalmente PWA compatível</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Planos e Preços</h2>
                        <p className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">Escolha o seu nível<br />de liberdade.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {plans.map((p, i) => (
                            <div key={i} className={cn(
                                "relative p-10 rounded-[3rem] border-2 transition-all hover:-translate-y-2",
                                p.popular
                                    ? "bg-slate-900 text-white border-primary shadow-2xl shadow-primary/10"
                                    : "bg-white text-slate-900 border-white shadow-xl shadow-slate-200"
                            )}>
                                {p.popular && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg">
                                        Mais Escolhido
                                    </div>
                                )}
                                <div className="mb-8">
                                    <h3 className="text-xl font-black uppercase tracking-widest mb-2 opacity-80">{p.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black tracking-tighter">{p.price}</span>
                                        <span className="text-sm font-bold opacity-60">{p.period}</span>
                                    </div>
                                </div>
                                <div className="space-y-4 mb-10">
                                    {p.features.map((f, fi) => (
                                        <div key={fi} className="flex items-center gap-3">
                                            <CheckCircle2 className={cn("w-5 h-5 flex-shrink-0", p.popular ? "text-primary" : "text-emerald-500")} />
                                            <span className="text-sm font-bold opacity-90 tracking-tight">{f}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    onClick={() => navigate('/auth')}
                                    className={cn(
                                        "w-full h-16 rounded-[1.5rem] font-black text-lg transition-transform active:scale-95",
                                        p.popular ? "bg-primary hover:bg-primary-hover text-white shadow-xl shadow-primary/20" : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                                    )}
                                >
                                    {p.cta}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="max-w-sm text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <span className="text-xl font-black uppercase tracking-tighter">VOY</span>
                            </div>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Nascemos para devolver o controle aos imigrantes. Tecnologia humanizada
                                focada na sua integração em Portugal.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-10 md:gap-20">
                            <div className="text-center md:text-left">
                                <h4 className="font-black uppercase tracking-widest text-xs mb-6 opacity-40">Links</h4>
                                <ul className="space-y-4 text-sm font-bold text-slate-600">
                                    <li><a href="#" className="hover:text-primary transition-colors">Termos</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
                                    <li><a href="#" className="hover:text-primary transition-colors">Suporte</a></li>
                                </ul>
                            </div>
                            <div className="text-center md:text-left">
                                <h4 className="font-black uppercase tracking-widest text-xs mb-6 opacity-40">App</h4>
                                <div className="flex flex-col gap-3">
                                    <Button onClick={handleInstallClick} size="sm" variant="outline" className="rounded-xl font-bold bg-slate-50 border-slate-200">
                                        <Smartphone className="w-4 h-4 mr-2" /> Instalar PWA
                                    </Button>
                                    <Button onClick={() => navigate('/auth')} size="sm" className="rounded-xl font-bold">
                                        <UserPlus className="w-4 h-4 mr-2" /> Criar Conta
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-20 pt-10 border-t border-slate-50 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                        © {new Date().getFullYear()} VOY App. Todos os direitos reservados.
                    </div>
                </div>
            </footer>

            {/* iOS Installation Tutorial Modal */}
            {showIosModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowIosModal(false)} />
                    <div className="relative w-full max-w-sm bg-white rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <Smartphone className="w-8 h-8 text-primary" />
                            </div>
                            <button onClick={() => setShowIosModal(false)} className="p-2 rounded-full bg-slate-100">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Instalar no seu iPhone</h3>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            Siga estes passos simples para ter o VOY na sua tela de início como um app nativo.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500 font-bold">1</div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Passo 1</p>
                                    <p className="font-bold text-slate-800 flex items-center gap-2">
                                        Toque em <Share className="w-5 h-5 text-blue-500" /> Compartilhar
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary font-bold">2</div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Passo 2</p>
                                    <p className="font-bold text-slate-800">Role para baixo</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-900 font-bold">3</div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Passo 3</p>
                                    <p className="font-bold text-slate-800 flex items-center gap-2 text-sm leading-tight">
                                        Toque em <PlusSquare className="w-5 h-5" /> Adicionar à Tela de Início
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button onClick={() => setShowIosModal(false)} className="w-full h-16 rounded-2xl font-black mt-10 shadow-xl shadow-primary/20">
                            Entendi, vamos lá!
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
