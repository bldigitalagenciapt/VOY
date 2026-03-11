import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ShieldCheck, Scale, History, Trash2 } from 'lucide-react';

export default function Terms() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0A0D14] text-slate-300 font-['Inter'] py-20 px-6">
            <div className="max-w-3xl mx-auto space-y-12">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-blue-500 font-bold hover:text-blue-400 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Voltar
                </button>

                <header className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white">Termos e Condições</h1>
                    <p className="text-slate-500 font-medium">Última atualização: {new Date().toLocaleDateString('pt-PT')}</p>
                </header>

                <section className="space-y-8">
                    <div className="p-8 bg-blue-600/5 border border-blue-500/20 rounded-3xl space-y-4">
                        <div className="flex items-center gap-3 text-blue-400">
                            <ShieldCheck className="w-6 h-6" />
                            <h2 className="text-xl font-bold uppercase tracking-tight">Privacidade e RGPD/LGPD</h2>
                        </div>
                        <p className="leading-relaxed">
                            O VOY App está em total conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD) da União Europeia e a Lei Geral de Proteção de Dados (LGPD). Seus dados pessoais e documentos são criptografados e utilizados exclusivamente para as funcionalidades de auxílio à imigração em Portugal.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                                <Scale className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-white">1. Modelo de Assinatura e Trial</h3>
                                <p className="leading-relaxed">
                                    Oferecemos um período de teste gratuito (Trial) de 14 dias. Após este período, a cobrança será efetuada automaticamente de acordo com o plano selecionado (Mensal ou Anual). O cancelamento pode ser feito a qualquer momento através do portal do cliente no aplicativo.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                                <History className="w-5 h-5 text-amber-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-white">2. Inadimplência e Bloqueio</h3>
                                <p className="leading-relaxed">
                                    Em caso de falha no pagamento da assinatura, o acesso às ferramentas premium (simuladores, tracking de processos, visualização de documentos) será bloqueado. Durante este período, o usuário poderá apenas visualizar seus dados básicos e realizar a exclusão de seus documentos ou de sua conta.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 text-red-400">
                            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-white">3. Política de Eliminação Definitiva</h3>
                                <p className="leading-relaxed text-slate-400">
                                    <strong>Atenção:</strong> Se a conta permanecer em estado de inadimplência por mais de 30 dias seguidos, o VOY App reserva-se o direito de excluir permanentemente todos os dados e documentos armazenados em nossos servidores para cumprir com as diretrizes de minimização de dados do RGPD. Esta ação é irreversível.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="pt-12 border-t border-white/5 text-center">
                    <p className="text-sm text-slate-500">Ao utilizar o VOY App, você concorda integralmente com estes termos.</p>
                </footer>
            </div>
        </div>
    );
}
