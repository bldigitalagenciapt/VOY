import { useState, useRef, useEffect } from 'react';
import { Bot, ChevronRight, AlertCircle, Sparkles, Send, X, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { visaFaqQuestions, visaTypes, commonAimaDocuments } from '@/data/visaTypes';
import { Check, FileCheck, Plus, AlertTriangle } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

const generalFaqQuestions = [
    {
        question: 'O que é a AIMA?',
        answer: `A AIMA (Agência para a Integração, Migrações e Asilo) é o órgão responsável pelos processos de imigração em Portugal.

**O que faz:**
• Autorização de residência
• Renovação de documentos
• Manifestação de interesse
• Reagrupamento familiar

**Dica importante:**
Os processos podem demorar. Guarde sempre seus protocolos!`,
    },
    {
        question: 'Como tirar o NIF?',
        answer: `O NIF (Número de Identificação Fiscal) é essencial para qualquer atividade fiscal em Portugal.

**Como obter:**
1. Vá a um balcão das Finanças
2. Leve seu passaporte e comprovativo de morada
3. Pode ser feito presencialmente ou online (com representante fiscal)

**Documentos necessários:**
• Passaporte válido
• Comprovativo de morada (contrato de arrendamento, carta de familiar, etc.)`,
    },
    {
        question: 'Como tirar o NISS?',
        answer: `O NISS (Número de Identificação da Segurança Social) é necessário para trabalhar legalmente.

**Como obter:**
1. Vá a um balcão da Segurança Social
2. Ou peça ao seu empregador para solicitar

**Documentos necessários:**
• Passaporte
• NIF
• Contrato de trabalho (se tiver)

**Prazo:** Geralmente sai no mesmo dia!`,
    },
    {
        question: 'Como funciona o SNS?',
        answer: `O SNS (Serviço Nacional de Saúde) é o sistema público de saúde em Portugal.

**Como ter acesso:**
1. Obter o número de utente no Centro de Saúde
2. Levar passaporte, NIF e comprovativo de morada

**Serviços disponíveis:**
• Consultas de medicina geral
• Urgências hospitalares
• Especialidades (com encaminhamento)
• Vacinação

**Custo:** Taxas moderadoras baixas ou gratuito para alguns grupos.`,
    },
    {
        question: 'Preciso de morada para tirar o NIF?',
        answer: `Depende da sua situação:

**Com morada em Portugal:**
• Vá às Finanças com comprovativo de morada
• Contrato de arrendamento ou declaração de alojamento

**Sem morada em Portugal:**
• Precisa de um representante fiscal
• Pode ser um cidadão português ou empresa
• O NIF ficará vinculado à morada do representante

**Dica:** Algumas lojas de serviços oferecem representação fiscal por um valor mensal.`,
    },
    {
        question: 'O que é a Manifestação de Interesse?',
        answer: `A Manifestação de Interesse é um processo para regularização de imigrantes que já estão em Portugal.

**Para quem é:**
• Pessoas que entraram legalmente em Portugal
• Que já têm contrato de trabalho
• Com contribuições para a Segurança Social

**Como fazer:**
1. Acessar o portal da AIMA
2. Preencher o formulário online
3. Aguardar convocação

**Importante:** Este processo pode demorar meses. Guarde o número de protocolo!`,
    },
    {
        question: 'O que é o CPLP?',
        answer: `CPLP significa Comunidade dos Países de Língua Portuguesa.

**Países membros:**
• Brasil, Portugal, Angola, Moçambique
• Cabo Verde, Guiné-Bissau, São Tomé e Príncipe
• Timor-Leste, Guiné Equatorial

**Vantagens para brasileiros:**
• Processo de visto simplificado
• Acordo de mobilidade (em implementação)
• Facilidades para obter residência

**Documentos geralmente necessários:**
• Passaporte válido
• Certidão de nascimento
• Antecedentes criminais`,
    },
    {
        question: 'Quais documentos devo guardar?',
        answer: `Documentos essenciais para guardar em Portugal:

**Identificação:**
• Passaporte (original e cópias)
• Título de residência
• NIF e NISS

**Trabalho:**
• Contrato de trabalho
• Recibos de vencimento
• Declaração de IRS

**Saúde:**
• Número de utente SNS
• Cartão Europeu (se aplicável)

**Moradia:**
• Contrato de arrendamento
• Comprovativos de morada

**Dica:** Use o app VOY para guardar tudo digitalmente!`,
    },
    {
        question: 'Como me organizar para não perder prazos?',
        answer: `Dicas para não perder prazos importantes:

**Use o app VOY:**
• Adicione datas importantes na seção Imigração
• Crie notas com lembretes
• Configure alertas

**Prazos comuns:**
• Renovação de título: iniciar 30 dias antes do vencimento
• Manifestação de interesse: acompanhar status regularmente
• IRS: entregar entre abril e junho

**Dica importante:**
Guarde todos os protocolos e comprovantes. Tire foto e salve no app!`,
    },
    {
        question: 'Onde acompanho meu processo?',
        answer: `Para acompanhar seu processo de imigração:

**Portal AIMA:**
• Acesse: aima.gov.pt
• Use seu número de processo/protocolo
• Verifique o status regularmente

**Outras formas:**
• Linha telefónica da AIMA
• Email (pode demorar para responder)
• Balcão presencial (com agendamento)

**Dica:** 
Anote o número do protocolo no app VOY na seção Imigração!

**Importante:** 
Os processos podem demorar. Paciência é fundamental.`,
    },
];

const faqQuestions = [...generalFaqQuestions, ...visaFaqQuestions];

interface ChatInterfaceProps {
    onClose?: () => void;
}

export function ChatInterface({ onClose }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSelectQuestion = (question: string) => {
        const faq = faqQuestions.find(q => q.question === question);
        if (!faq) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: question,
        };

        const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: faq.answer,
        };

        setMessages(prev => [...prev, userMessage, assistantMessage]);
        setSelectedQuestion(question);
    };

    const handleReset = () => {
        setMessages([]);
        setSelectedQuestion(null);
    };

    return (
        <div className="flex flex-col h-full bg-background/50 backdrop-blur-sm">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border/50 bg-card/80 backdrop-blur-xl safe-area-top flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="font-bold text-foreground">Preciso de Ajuda</h1>
                        <p className="text-xs text-muted-foreground">Assistente Virtual VOY</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {messages.length > 0 && (
                        <button
                            onClick={handleReset}
                            className="text-xs font-bold text-primary hover:text-primary/80"
                        >
                            Reiniciar
                        </button>
                    )}
                    {onClose && (
                        <button onClick={onClose} className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
                {messages.length === 0 ? (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                        {/* Welcome */}
                        <div className="text-center py-6">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <Bot className="w-8 h-8 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-black mb-2 tracking-tight">Como posso ajudar?</h2>
                            <p className="text-sm text-muted-foreground">
                                Selecione uma dúvida abaixo para começar
                            </p>
                        </div>

                        {/* Featured Actions */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                                Recomendado para você
                            </p>
                            <button
                                onClick={() => {
                                    if (onClose) onClose();
                                    navigate('/aima');
                                }}
                                className="w-full flex items-center gap-4 p-4 text-left bg-blue-600 rounded-[1.5rem] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <ClipboardCheck className="w-16 h-16 text-white" />
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 text-white">
                                    <ClipboardCheck className="w-6 h-6" />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="font-black text-white text-base">Checklist de Visto</h3>
                                    <p className="text-blue-100 text-xs font-medium">Documentos para D1, D2, D7, D8...</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-white/50 ml-auto group-hover:text-white transition-colors" />
                            </button>
                        </div>

                        {/* FAQ Questions */}
                        <div className="space-y-2 pb-10">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 px-1">
                                Perguntas frequentes
                            </p>
                            {faqQuestions.map((faq, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectQuestion(faq.question)}
                                    className="w-full flex items-center justify-between p-4 text-left bg-card hover:bg-muted border border-border/40 rounded-[1.25rem] active:scale-[0.98] transition-all shadow-sm group"
                                >
                                    <span className="font-bold text-sm text-foreground/80 group-hover:text-primary transition-colors">{faq.question}</span>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary flex-shrink-0" />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    'flex gap-3 animate-slide-in-up duration-300',
                                    message.role === 'user' && 'flex-row-reverse'
                                )}
                            >
                                <div
                                    className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm',
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-blue-500 text-white'
                                    )}
                                >
                                    {message.role === 'user' ? (
                                        <span className="text-[10px] font-black">EU</span>
                                    ) : (
                                        <Bot className="w-4 h-4" />
                                    )}
                                </div>
                                <div
                                    className={cn(
                                        'max-w-[90%] p-4 rounded-[1.5rem] shadow-sm',
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-br-none'
                                            : 'bg-card border border-border rounded-bl-none'
                                    )}
                                >
                                    {message.role === 'assistant' && (message.content ?? '').includes('**') && (visaTypes ?? []).some(v => (message.content ?? '').includes(`**${v.name}**`)) ? (
                                        <div className="space-y-6 text-foreground">
                                            {(() => {
                                                const visa = (visaTypes ?? []).find(v => (message.content ?? '').includes(`**${v.name}**`));
                                                if (!visa) return <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>;

                                                return (
                                                    <div className="space-y-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                                <Bot className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-black text-sm text-foreground uppercase tracking-tight">{visa.name}</h3>
                                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Checklist padrão AIMA</p>
                                                            </div>
                                                        </div>

                                                        {/* 1. DOCUMENTOS COMUNS */}
                                                        <div className="space-y-4">
                                                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                                                                <FileCheck className="w-3 h-3" /> 1. DOCUMENTOS COMUNS
                                                            </h4>
                                                            <p className="text-[10px] text-muted-foreground -mt-3 mb-3">Obrigatórios para todos os tipos de autorização de residência.</p>
                                                            <div className="space-y-3">
                                                                {(commonAimaDocuments ?? []).map((doc, idx) => (
                                                                    <div key={idx} className="bg-card border border-border/60 p-4 rounded-2xl shadow-sm">
                                                                        <div className="flex items-start gap-3">
                                                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary/20">
                                                                                <Check className="w-3 h-3 text-primary" />
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <h5 className="font-bold text-[13px] leading-none mb-1">{doc.name}</h5>
                                                                                <p className="text-[11px] text-muted-foreground leading-tight mb-3">{doc.description}</p>

                                                                                <div className="bg-muted/50 p-3 rounded-xl mb-3">
                                                                                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">POR QUE A AIMA EXIGE:</p>
                                                                                    <p className="text-[10px] text-foreground/80 leading-snug">{doc.why}</p>
                                                                                </div>

                                                                                <ul className="space-y-1.5">
                                                                                    {(doc.requirements ?? []).map((req, rIdx) => (
                                                                                        <li key={rIdx} className="flex items-start gap-2 text-[10px] text-muted-foreground">
                                                                                            <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                                                                            <span>{req}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* 2. DOCUMENTOS ESPECÍFICOS */}
                                                        <div className="space-y-4">
                                                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                                                                <Plus className="w-3 h-3" /> 2. DOCUMENTOS ESPECÍFICOS
                                                            </h4>
                                                            <div className="space-y-3">
                                                                {(visa.specificDocuments ?? []).map((doc, idx) => (
                                                                    <div key={idx} className="bg-blue-600/5 border border-blue-600/10 p-4 rounded-2xl shadow-sm">
                                                                        <div className="flex items-start gap-3">
                                                                            <div className="w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-600/20">
                                                                                <Check className="w-3 h-3 text-blue-600" />
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <h5 className="font-bold text-[13px] leading-none mb-1">{doc.name}</h5>
                                                                                <p className="text-[11px] text-muted-foreground leading-tight mb-3">{doc.description}</p>

                                                                                <div className="bg-blue-600/10 p-3 rounded-xl mb-3">
                                                                                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">QUANDO É EXIGIDO:</p>
                                                                                    <p className="text-[10px] text-foreground/80 leading-snug">{doc.why}</p>
                                                                                </div>

                                                                                <ul className="space-y-1.5">
                                                                                    {(doc.requirements ?? []).map((req, rIdx) => (
                                                                                        <li key={rIdx} className="flex items-start gap-2 text-[10px] text-muted-foreground">
                                                                                            <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                                                                            <span>{req}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="p-4 bg-warning/10 border border-warning/20 rounded-2xl">
                                                            <div className="flex gap-3">
                                                                <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-warning uppercase tracking-widest mb-1">Nota de Transparência</p>
                                                                    <p className="text-[10px] text-foreground/80 leading-relaxed">
                                                                        A AIMA pode solicitar documentos adicionais ou dispensar alguns conforme o caso concreto.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => {
                                                                if (onClose) onClose();
                                                                navigate('/aima');
                                                            }}
                                                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all border-b-4 border-primary-dark"
                                                        >
                                                            ABRIR CHECKLIST INTERATIVO 🚀
                                                        </button>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* More Questions */}
                        {messages.length > 0 && (
                            <div className="pt-4 animate-in fade-in duration-500 delay-150">
                                <p className="text-[10px] font-black text-muted-foreground mb-3 uppercase tracking-widest">
                                    Continuar conversa
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {faqQuestions
                                        .filter(q => q.question !== selectedQuestion)
                                        .slice(0, 4)
                                        .map((faq, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSelectQuestion(faq.question)}
                                                className="px-4 py-2.5 text-xs font-bold bg-card border border-border/50 rounded-xl hover:bg-muted hover:scale-105 active:scale-95 transition-all shadow-sm"
                                            >
                                                {faq.question}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Disclaimer */}
            <div className="px-5 py-3 border-t border-border/50 bg-card/50 backdrop-blur-md">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>Respostas automáticas. Confirme nos canais oficiais.</span>
                </div>
            </div>
        </div>
    );
}
