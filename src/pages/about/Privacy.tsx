import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { ChevronLeft, Lock, Database, Eye, FileText, UserCheck } from 'lucide-react';

export default function Privacy() {
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
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-foreground leading-none">Privacidade</h1>
                        <p className="text-xs text-muted-foreground mt-1">Termos e Condições</p>
                    </div>
                </div>

                <div className="space-y-6 text-pretty animate-slide-up pb-10">
                    {/* Intro */}
                    <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10">
                        <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                            O VOY compromete-se com a proteção da sua privacidade. Esta política descreve como coletamos, usamos e protegemos seus dados pessoais, em conformidade com a <strong>LGPD (Lei Geral de Proteção de Dados)</strong> e <strong>GDPR</strong>.
                        </p>
                    </div>

                    {/* Coleta de Dados */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Database className="w-4 h-4 text-primary" />
                            </div>
                            <h2 className="font-bold text-lg">1. Coleta de Dados</h2>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                            Coletamos apenas informações essenciais para o funcionamento do app, como:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Dados de cadastro (email, nome) to autenticação.</li>
                                <li>Documentos que você opta por armazenar.</li>
                                <li>Informações do perfil (NIF, NISS) para preenchimento rápido.</li>
                            </ul>
                        </p>
                    </section>

                    {/* Uso de Dados */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Eye className="w-4 h-4 text-primary" />
                            </div>
                            <h2 className="font-bold text-lg">2. Uso das Informações</h2>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                            Suas informações são utilizadas exclusivamente para:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Fornecer e personalizar os serviços do VOY.</li>
                                <li>Gerenciar seus documentos e processos.</li>
                                <li>Melhorar a segurança e performance do app.</li>
                            </ul>
                            <span className="block mt-2 font-bold text-xs uppercase tracking-wider text-primary">Não vendemos seus dados a terceiros.</span>
                        </p>
                    </section>

                    {/* Segurança */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Lock className="w-4 h-4 text-primary" />
                            </div>
                            <h2 className="font-bold text-lg">3. Segurança</h2>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                            Implementamos medidas técnicas rigorosas, como criptografia de ponta a ponta e autenticação segura, para proteger contra acesso não autorizado, alteração ou destruição de dados.
                        </p>
                    </section>

                    {/* Seus Direitos */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <UserCheck className="w-4 h-4 text-primary" />
                            </div>
                            <h2 className="font-bold text-lg">4. Seus Direitos (LGPD)</h2>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                            Você tem total controle sobre sues dados, incluindo o direito de:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Acessar seus dados a qualquer momento.</li>
                                <li>Corrigir informações incompletas ou inexatas.</li>
                                <li>Solicitar a exclusão total da sua conta e dados.</li>
                            </ul>
                        </p>
                    </section>

                    {/* Termos */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <h2 className="font-bold text-lg">5. Termos de Uso</h2>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                            Ao utilizar o VOY, você concorda em usar o aplicativo conforme as leis vigentes e não realizar atividades ilícitas ou que comprometam a segurança da plataforma.
                        </p>
                    </section>

                    <div className="pt-8 pb-4 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase opacity-60">
                            Última atualização: Fevereiro de 2026
                        </p>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
