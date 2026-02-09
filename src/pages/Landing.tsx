import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appScreenshot from '../assets/app-screenshot.png';
import {
    ShieldCheck,
    Smartphone,
    CheckCircle2,
    ArrowRight,
    Menu,
    X,
    Globe,
    Zap,
    Calculator,
    Briefcase,
    Wallet,
    FileText,
    Link2,
    CheckCircle,
    Trophy,
    ArrowUpRight,
    ChevronRight,
    Star,
    Plus,
    Minus,
    Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Landing() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showIosModal, setShowIosModal] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [currency, setCurrency] = useState<'EUR' | 'BRL'>('EUR');
    const [activeFaq, setActiveFaq] = useState<number | null>(0);

    useEffect(() => {
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIos(isIosDevice);

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        });

        window.addEventListener('appinstalled', () => {
            setDeferredPrompt(null);
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
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    };

    const services = [
        {
            title: "Primeiros Passos",
            subtitle: "GUIA ESSENCIAL",
            icon: <Globe className="w-6 h-6 text-blue-400" />,
            description: "O roteiro definitivo para quem acaba de chegar ou está planejando a mudança."
        },
        {
            title: "Simulador de Salário",
            subtitle: "SALÁRIO LÍQUIDO",
            icon: <Calculator className="w-6 h-6 text-orange-400" />,
            description: "Calcule exatamente quanto vai sobrar no seu bolso no final do mês."
        },
        {
            title: "Documentos (NIF/NISS)",
            subtitle: "SEUS ARQUIVOS",
            icon: <FileText className="w-6 h-6 text-blue-300" />,
            description: "Organize, valide e gerencie todos os documentos essenciais em um só lugar."
        },
        {
            title: "Emprego",
            subtitle: "VAGAS E DICAS",
            icon: <Briefcase className="w-6 h-6 text-emerald-400" />,
            description: "Acesso a portais de emprego e dicas para se destacar no mercado português."
        },
        {
            title: "Meu Bolso",
            subtitle: "GESTOR FINANCEIRO",
            icon: <Wallet className="w-6 h-6 text-amber-400" />,
            description: "Controle seus gastos e planeje sua vida financeira em Portugal."
        },
        {
            title: "Links Úteis e Notas",
            subtitle: "LINKS E DICAS",
            icon: <Link2 className="w-6 h-6 text-purple-400" />,
            description: "Centralize informações importantes e anotações cruciais para sua jornada."
        }
    ];

    const pricing = {
        EUR: [
            { name: "Explorador", price: "Grátis", features: ["Guia de Chegada", "Gestão de 3 Docs", "Simulador Salarial", "Mural da Comunidade"], popular: false },
            { name: "Residente Pro", price: "€19.90", period: "/ taxa única", features: ["Documentos Ilimitados", "Tracking AIMA Manual", "Cofre Criptografado", "Sem Anúncios", "Suporte VIP"], popular: true }
        ],
        BRL: [
            { name: "Explorador", price: "Grátis", features: ["Guia de Chegada", "Gestão de 3 Docs", "Simulador Salarial", "Mural da Comunidade"], popular: false },
            { name: "Residente Pro", price: "R$ 119,90", period: "/ taxa única", features: ["Documentos Ilimitados", "Tracking AIMA Manual", "Cofre Criptografado", "Sem Anúncios", "Suporte VIP"], popular: true }
        ]
    };

    const faqs = [
        { q: "Como o Voy ajuda na minha imigração?", a: "O Voy centraliza todas as ferramentas que você precisa: desde guias passo-a-passo, simuladores financeiros, até a organização segura de documentos essenciais como NIF e NISS." },
        { q: "O rastreamento de processo é oficial?", a: "Não, o nosso sistema de tracking na AIMA é um checklist manual para que você mantenha o controle e histórico de cada etapa do seu processo de forma organizada." },
        { q: "Os meus documentos estão seguros?", a: "Sim! Utilizamos tecnologia de criptografia de ponta para garantir que apenas você tenha acesso aos seus arquivos e dados sensíveis." },
        { q: "Posso usar o app offline?", a: "Como um PWA, algumas funcionalidades de visualização de documentos podem ser acessíveis após o primeiro carregamento, mas recomendamos conexão para sincronização." }
    ];

    return (
        <div className="min-h-screen bg-[#0A0D14] text-white font-['Inter'] selection:bg-blue-500/30 selection:text-white overflow-x-hidden">
            {/* Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0D14]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#0066FF] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-white font-black text-lg italic pt-0.5">V</span>
                        </div>
                        <span className="text-xl font-black tracking-tight text-white uppercase italic">Voy</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-10">
                        {['Serviços', 'Processo', 'Preços', 'FAQ'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">{item}</a>
                        ))}
                        <div className="h-4 w-[1px] bg-white/10 mx-2" />
                        <Button onClick={() => navigate('/auth')} variant="ghost" className="text-xs font-bold text-white hover:bg-white/5 uppercase tracking-widest">Login</Button>
                        <Button onClick={handleInstallClick} className="bg-[#0066FF] hover:bg-blue-600 rounded-lg px-6 text-xs font-black uppercase tracking-widest h-11">Instalar</Button>
                    </nav>

                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-white">
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </header>

            {/* Mobile Nav Overlay */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[49] bg-[#0A0D14] pt-24 px-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <nav className="flex flex-col gap-6">
                        {['Serviços', 'Processo', 'Preços', 'FAQ'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)} className="text-2xl font-black text-white py-2 border-b border-white/5">{item}</a>
                        ))}
                        <div className="grid grid-cols-1 gap-4 mt-8">
                            <Button onClick={() => navigate('/auth')} variant="outline" className="h-14 font-black rounded-xl border-white/10">LOGIN</Button>
                            <Button onClick={handleInstallClick} className="h-14 bg-[#0066FF] font-black rounded-xl text-white">INSTALAR APP</Button>
                        </div>
                    </nav>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />

                <div className="max-w-7xl mx-auto text-center space-y-10">
                    <div className="inline-flex items-center gap-3 px-5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-bold text-blue-400 uppercase tracking-widest animate-in fade-in duration-700">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        PLATAFORMA Nº1 PARA IMIGRANTES EM PORTUGAL
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.95] max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Sua Vida em <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 italic">Portugal</span> Simplificada.
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                        Organize documentos, contemple seu futuro e gerencie sua jornada com a ferramenta mais completa do mercado.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                        <Button className="h-16 px-12 rounded-2xl bg-[#0066FF] hover:bg-blue-600 text-lg font-black shadow-2xl shadow-blue-500/30 group">
                            COMEÇAR AGORA
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Sem custos iniciais</p>
                    </div>

                    {/* Triple Mockup Hero */}
                    <div className="relative mt-24 max-w-5xl mx-auto animate-in fade-in zoom-in duration-1000 delay-500">
                        <div className="flex items-end justify-center -space-x-16 md:-space-x-32 px-10">
                            {/* Left Phone */}
                            <div className="relative z-10 hidden sm:block rotate-[-8deg] scale-90 translate-y-20 p-2 bg-slate-950 rounded-[2.5rem] border-4 border-slate-800 shadow-2xl">
                                <div className="bg-slate-900 rounded-[2rem] overflow-hidden aspect-[9/19] w-[180px] md:w-[220px]">
                                    <div className="p-4 space-y-4">
                                        <div className="h-4 w-12 bg-white/5 rounded" />
                                        <div className="space-y-2">
                                            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl" />)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Center Phone */}
                            <div className="relative z-30 p-2.5 bg-slate-950 rounded-[3rem] border-[8px] border-slate-900 shadow-[0_50px_100px_-20px_rgba(0,102,255,0.4)]">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-b-xl z-20" />
                                <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19.5] w-[240px] md:w-[300px] relative">
                                    <img
                                        src={appScreenshot}
                                        alt="Voy App Interface"
                                        className="w-full h-full object-contain bg-[#FAFBFF]"
                                        loading="eager"
                                    />
                                </div>
                            </div>
                            {/* Right Phone */}
                            <div className="relative z-10 hidden sm:block rotate-[8deg] scale-90 translate-y-20 p-2 bg-slate-950 rounded-[2.5rem] border-4 border-slate-800 shadow-2xl">
                                <div className="bg-slate-900 rounded-[2rem] overflow-hidden aspect-[9/19] w-[180px] md:w-[220px]">
                                    <div className="p-4 space-y-4">
                                        <div className="flex justify-center mb-6">
                                            <div className="w-20 h-20 rounded-full border-4 border-blue-500/20" />
                                        </div>
                                        <div className="space-y-2">
                                            {[1, 2].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl" />)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats/Logo Bar */}
            <section className="py-16 border-y border-white/5 bg-white/2 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    {[
                        { val: "30k+", label: "Download no App" },
                        { val: "805+", label: "Residências Emitidas" },
                        { val: "98%", label: "Taxa de Sucesso" },
                        { val: "24/7", label: "Suporte VIP" }
                    ].map((stat, i) => (
                        <div key={i} className="space-y-1">
                            <h4 className="text-3xl font-black text-white">{stat.val}</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features/Services Section */}
            <section id="serviços" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                        <div className="space-y-4 text-left max-w-xl">
                            <h2 className="text-blue-500 font-black uppercase tracking-[0.25em] text-xs">Recursos Inclusos</h2>
                            <h3 className="text-4xl md:text-5xl font-black text-white leading-tight">Muitas ferramentas. <br />Uma experiência única.</h3>
                        </div>
                        <p className="text-slate-400 font-bold max-w-xs text-sm leading-relaxed pb-2 border-l-2 border-blue-600 pl-6">
                            Tudo o que você precisa para uma imigração organizada e sem dores de cabeça.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((s, i) => (
                            <div key={i} className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-white/[0.07] transition-all group">
                                <div className="w-14 h-14 bg-white/5 rounded-[1.25rem] flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                                    {s.icon}
                                </div>
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">{s.subtitle}</span>
                                <h4 className="text-xl font-bold mb-4">{s.title}</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Showcase Section 1 */}
            <section className="py-32 px-6 bg-blue-600/5 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
                    <div className="flex-1 space-y-8">
                        <h2 className="text-[#0066FF] font-black uppercase tracking-widest text-xs">Simulador Salarial</h2>
                        <h3 className="text-4xl md:text-6xl font-black leading-[1.1]">Descubra seu real poder de compra.</h3>
                        <p className="text-lg text-slate-400 font-medium leading-relaxed">
                            Não se deixe enganar pelo salário bruto. Nosso simulador avançado calcula impostos, segurança social e retenção na fonte em segundos.
                        </p>
                        <ul className="space-y-4">
                            {['Cálculo de SS e IRS', 'Ajuste de dependentes', 'Sugestão de custo de vida'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 font-bold text-sm">
                                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-1 relative">
                        <div className="absolute inset-0 bg-blue-600/20 blur-[100px] -z-10" />
                        <div className="p-3 bg-slate-950 rounded-[3rem] border-8 border-slate-900 shadow-2xl skew-y-3">
                            <div className="bg-slate-900 rounded-[2.5rem] p-6 aspect-[9/14] w-[320px] mx-auto overflow-hidden">
                                <div className="space-y-6 pt-4">
                                    <div className="flex justify-between items-center">
                                        <div className="w-20 h-3 bg-white/20 rounded" />
                                        <div className="w-8 h-8 rounded-full bg-blue-600 shadow-lg shadow-blue-500/40" />
                                    </div>
                                    <div className="h-40 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center">
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Salário Líquido</span>
                                        <span className="text-4xl font-black">€1.240,50</span>
                                    </div>
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => <div key={i} className="h-4 w-full bg-white/5 rounded" />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="preços" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center space-y-8 mb-20">
                        <h2 className="text-[#0066FF] font-black uppercase tracking-widest text-xs">Planos Sob Medida</h2>
                        <h3 className="text-4xl md:text-5xl font-black">Invista no seu sonho.</h3>

                        <div className="inline-flex p-1.5 bg-white/5 border border-white/10 rounded-2xl">
                            <button onClick={() => setCurrency('EUR')} className={cn("px-10 py-3 rounded-xl text-xs font-black transition-all", currency === 'EUR' ? "bg-white text-black" : "text-white/40 hover:text-white")}>
                                EURO €
                            </button>
                            <button onClick={() => setCurrency('BRL')} className={cn("px-10 py-3 rounded-xl text-xs font-black transition-all", currency === 'BRL' ? "bg-white text-black" : "text-white/40 hover:text-white")}>
                                REAL R$
                            </button>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {pricing[currency].map((p, i) => (
                            <div key={i} className={cn(
                                "p-12 rounded-[3.5rem] relative group border transition-all duration-300",
                                p.popular ? "bg-[#0066FF] border-blue-400 text-white shadow-2xl shadow-blue-500/20 -translate-y-2" : "bg-white/5 border-white/10 text-white hover:bg-white/[0.08]"
                            )}>
                                {p.popular && (
                                    <div className="absolute top-8 right-8 bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Mais Popular</div>
                                )}
                                <h4 className="text-lg font-black uppercase tracking-widest opacity-60 mb-6">{p.name}</h4>
                                <div className="flex items-baseline gap-2 mb-10">
                                    <span className="text-6xl font-black">{p.price}</span>
                                    <span className="text-xs font-bold opacity-60 uppercase">{p.period}</span>
                                </div>
                                <ul className="space-y-6 mb-12">
                                    {p.features.map((f, fi) => (
                                        <li key={fi} className="flex items-center gap-4 text-sm font-bold">
                                            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", p.popular ? "bg-white/20" : "bg-blue-500/20 text-blue-400")}>
                                                <CheckCircle2 className="w-3 h-3" />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Button className={cn(
                                    "w-full h-16 rounded-2xl font-black uppercase tracking-widest group",
                                    p.popular ? "bg-white text-[#0066FF] hover:bg-slate-100" : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                                )}>
                                    Assinar Agora
                                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-32 px-6 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 space-y-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                            <Quote className="text-white w-8 h-8 rotate-180" />
                        </div>
                        <h3 className="text-4xl md:text-5xl font-black">Histórias reais <br />de sucesso.</h3>
                    </div>
                    <div className="flex-1 grid gap-6">
                        {[
                            { name: "Carlos Silva", role: "Visto D7", txt: "O simulador de custo de vida foi essencial para planejarmos nossa mudança. O suporte é impecável." },
                            { name: "Maria Oliveira", role: "Manifestação de Interesse", txt: "Eu estava perdida com a burocracia do NIF. O Voy organizou tudo e me deu a tranquilidade que eu precisava." }
                        ].map((t, i) => (
                            <div key={i} className="p-8 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                                <div className="flex gap-1 text-amber-500">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                                </div>
                                <p className="text-slate-400 font-medium italic">"{t.txt}"</p>
                                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-slate-800" />
                                    <div>
                                        <p className="font-bold text-sm">{t.name}</p>
                                        <p className="text-xs text-[#0066FF] font-black uppercase tracking-widest">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Accordion */}
            <section id="faq" className="py-32 px-6">
                <div className="max-w-3xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-[#0066FF] font-black uppercase tracking-widest text-xs">Dúvidas Frequentes</h2>
                        <h3 className="text-4xl font-black">Você pergunta, nós respondemos.</h3>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((f, i) => (
                            <div key={i} className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden transition-all">
                                <button
                                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                    className="w-full p-8 flex items-center justify-between text-left group"
                                >
                                    <span className="font-bold text-lg">{f.q}</span>
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", activeFaq === i ? "bg-blue-600" : "bg-white/5 group-hover:bg-white/10")}>
                                        {activeFaq === i ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5 text-slate-400" />}
                                    </div>
                                </button>
                                {activeFaq === i && (
                                    <div className="px-8 pb-8 text-slate-400 font-medium leading-relaxed animate-in slide-in-from-top-2 duration-300">
                                        {f.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Footer */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto bg-gradient-to-br from-blue-600 to-blue-800 rounded-[4rem] p-12 md:p-24 text-center space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <h3 className="text-4xl md:text-7xl font-black text-white leading-tight max-w-4xl mx-auto">
                        A jornada dos seus sonhos <br />começa com um clique.
                    </h3>
                    <p className="text-xl text-blue-100 font-medium max-w-xl mx-auto">
                        Baixe o app agora e junte-se à comunidade que mais cresce em Portugal.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button onClick={handleInstallClick} className="h-20 px-12 rounded-[2rem] bg-white text-[#0066FF] text-xl font-black shadow-2xl hover:bg-slate-50">
                            INSTALAR AGORA
                        </Button>
                        <div className="flex items-center gap-2 text-white/60">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                            <span className="text-xs font-bold uppercase tracking-widest">Download Seguro</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0066FF] rounded-xl flex items-center justify-center">
                            <span className="text-white font-black text-xl italic">V</span>
                        </div>
                        <span className="text-2xl font-black text-white uppercase italic">Voy</span>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4">
                        {['Termos', 'Privacidade', 'Cookies', 'Contato'].map(item => (
                            <a key={item} href="#" className="text-xs font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">{item}</a>
                        ))}
                    </nav>

                    <div className="flex gap-6">
                        {['IG', 'FB', 'LI'].map(s => (
                            <div key={s} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-500 font-black text-[10px] hover:border-white hover:text-white cursor-pointer transition-all">{s}</div>
                        ))}
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-12 text-center">
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">© {new Date().getFullYear()} VOY Group. Todos os direitos reservados.</p>
                </div>
            </footer>

            {/* iOS Modal */}
            {showIosModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowIosModal(false)} />
                    <div className="relative w-full max-w-sm bg-[#161B22] rounded-[3rem] p-10 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h3 className="text-2xl font-black text-white mb-8 tracking-tight">Instalar no seu iPhone</h3>
                        <div className="space-y-6">
                            {[
                                { step: 1, text: "Toque em Compartilhar", icon: <ArrowUpRight className="w-5 h-5 text-blue-500" /> },
                                { step: 2, text: "Role e toque em 'Adicionar à Tela de Início'", icon: <span className="text-[10px] font-black border border-white/10 p-1.5 rounded">ADD</span> },
                                { step: 3, text: "Confirme tocando em 'Adicionar'", icon: <div className="w-3 h-3 bg-blue-500 rounded-full" /> }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-5 p-5 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-xs text-blue-400">
                                        {item.step}
                                    </div>
                                    <p className="text-sm font-bold text-slate-300">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
