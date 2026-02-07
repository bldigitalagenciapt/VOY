export interface AimaDocument {
  name: string;
  description: string;
  why: string;
  requirements: string[];
}

export interface VisaType {
  id: string;
  name: string;
  shortDescription: string;
  forWho: string;
  duration: string;
  specificDocuments: AimaDocument[];
  observations: string[];
}

export const commonAimaDocuments: AimaDocument[] = [
  {
    name: 'Passaporte Válido',
    description: 'Documento de identificação internacional.',
    why: 'Para comprovar identidade e legalidade da entrada em território nacional.',
    requirements: ['Cópia das páginas biográficas', 'Cópia dos vistos e carimbos de entrada', 'Validade mínima de 6 meses']
  },
  {
    name: 'Comprovativo de Alojamento',
    description: 'Documento que prova onde você vai morar.',
    why: 'A AIMA exige saber a morada de residência em Portugal.',
    requirements: ['Contrato de arrendamento registrado nas Finanças', 'OU Atestado da Junta de Freguesia', 'OU Declaração de acolhimento assinada pelo proprietário']
  },
  {
    name: 'Meios de Subsistência',
    description: 'Prova de que possui recursos financeiros para viver em Portugal.',
    why: 'Para garantir que o imigrante não dependerá de auxílio estatal imediato.',
    requirements: ['Saldos bancários em Portugal', 'OU Comprovativos de rendimentos/salário']
  },
  {
    name: 'Atestado de Antecedentes Criminais',
    description: 'Documento emitido pelo país de origem ou onde residiu há mais de um ano.',
    why: 'Para verificação de idoneidade e segurança pública.',
    requirements: ['Apostilado (Convenção de Haia)', 'Traduzido se não estiver em PT/EN/ES/FR', 'Emitido nos últimos 90 dias']
  },
  {
    name: 'NIF (Número de Identificação Fiscal)',
    description: 'Seu número de contribuinte em Portugal.',
    why: 'Necessário para qualquer ato fiscal ou contrato no país.',
    requirements: ['Comprovativo emitido pelas Finanças']
  },
  {
    name: 'NISS (Número de Identificação da Segurança Social)',
    description: 'Número para contribuições e acesso ao sistema de previdência.',
    why: 'Obrigatório para quem exerce atividade laboral ou quer acesso a direitos sociais.',
    requirements: ['Comprovativo emitido pela Segurança Social']
  }
];

export const visaTypes: VisaType[] = [
  {
    id: 'd1',
    name: 'Trabalho Subordinado (D1)',
    shortDescription: 'Para quem possui um contrato de trabalho em Portugal.',
    forWho: 'Trabalhadores com contrato assinado com empresa portuguesa.',
    duration: 'Geralmente 2 anos (renovável)',
    specificDocuments: [
      {
        name: 'Contrato de Trabalho',
        description: 'Documento assinado entre trabalhador e empresa.',
        why: 'Base legal para a autorização de residência tipo D1.',
        requirements: ['Deve estar em conformidade com o Código do Trabalho', 'Registrado na Segurança Social']
      }
    ],
    observations: ['O contrato deve ter duração prevista superior a 12 meses.']
  },
  {
    id: 'd2',
    name: 'Trabalho Independente / Empreendedor (D2)',
    shortDescription: 'Para prestadores de serviços ou investidores de pequeno/médio porte.',
    forWho: 'Profissionais liberais ou quem abriu empresa em Portugal.',
    duration: '2 anos (renovável)',
    specificDocuments: [
      {
        name: 'Declaração de Início de Atividade',
        description: 'Documento das Finanças comprovando que você presta serviços.',
        why: 'Prova que está legalmente apto a trabalhar como independente.',
        requirements: ['Emitido pelo Portal das Finanças', 'Atividade deve estar "Aberta"']
      },
      {
        name: 'Prova de Investimento (se aplicável)',
        description: 'Plano de negócios ou prova de capital social.',
        why: 'Para quem entra como empreendedor societário.',
        requirements: ['Extratos bancários da empresa', 'Certidão Permanente']
      }
    ],
    observations: ['Recomendado ter faturamento demonstrado ou projeção sólida.']
  },
  {
    id: 'd4',
    name: 'Estudo (D4)',
    shortDescription: 'Para estudantes de ensino superior ou cursos de longa duração.',
    forWho: 'Alunos inscritos em universidades ou centros de formação.',
    duration: '1 ano ou duração do curso (renovável)',
    specificDocuments: [
      {
        name: 'Comprovativo de Matrícula',
        description: 'Declaração da instituição de ensino.',
        why: 'Prova o vínculo acadêmico.',
        requirements: ['Indicação da duração do curso', 'Pagamento de propinas (se aplicável)']
      }
    ],
    observations: ['Permite trabalhar até 20h semanais com comunicação à AIMA.']
  },
  {
    id: 'd7',
    name: 'Rendimentos Próprios / Aposentados (D7)',
    shortDescription: 'Para quem vive de aposentadoria ou rendimentos passivos.',
    forWho: 'Aposentados, detentores de imóveis alugados ou direitos autorais.',
    duration: '2 anos (renovável)',
    specificDocuments: [
      {
        name: 'Comprovativo de Rendimentos Passivos',
        description: 'Prova de recebimento constante de valores de fora de Portugal.',
        why: 'Base principal do visto D7.',
        requirements: ['Extratos bancários dos últimos 6 meses', 'Comprovativo oficial da fonte dos rendimentos']
      }
    ],
    observations: ['Os valores devem respeitar o salário mínimo português (ajustado por dependentes).']
  },
  {
    id: 'd8',
    name: 'Nômade Digital (D8)',
    shortDescription: 'Para quem trabalha remotamente para fora de Portugal.',
    forWho: 'Trabalhadores remotos com rendimentos superiores a 4 salários mínimos portugueses.',
    duration: '2 anos (Residência) ou 1 ano (Estada Temporária)',
    specificDocuments: [
      {
        name: 'Prova de Rendimentos Remotos',
        description: 'Contrato de trabalho ou prestação de serviços estrangeiro.',
        why: 'Prova que o trabalho é exercido à distância.',
        requirements: ['Rendimento mensal médio superior a €3.280 (valor ref. 2024)', 'Comprovativo de morada fiscal fora de PT no último ano']
      }
    ],
    observations: ['É um dos vistos mais rigorosos quanto ao valor mínimo de rendimento.']
  },
  {
    id: 'reagrupamento',
    name: 'Reagrupamento Familiar',
    shortDescription: 'Para familiares de quem já possui residência legal em Portugal.',
    forWho: 'Cônjuges, filhos ou ascendentes a cargo.',
    duration: 'Mesma validade da residência do titular',
    specificDocuments: [
      {
        name: 'Prova de Parentesco',
        description: 'Certidão de nascimento ou casamento.',
        why: 'Para comprovar o laço familiar.',
        requirements: ['Certidão de Inteiro Teor', 'Apostilada', 'Emitida há menos de 6 meses']
      },
      {
        name: 'Documento de Residência do Titular',
        description: 'Cópia do título de quem está reagrupando a família.',
        why: 'O titular deve ter situação regular.',
        requirements: ['Título de Residência válido']
      }
    ],
    observations: ['O titular deve comprovar alojamento e subsistência para todos os familiares.']
  }
];

export const visaFaqQuestions = visaTypes.map(visa => ({
  question: `O que é o ${visa.name}?`,
  answer: `**${visa.name}**

${visa.shortDescription}

**Para quem é indicado:**
${visa.forWho}

**Duração:**
${visa.duration}

**Observações importantes:**
${visa.observations.map(obs => `• ${obs}`).join('\n')}

⚠️ **Aviso:** Esta informação é orientativa. As regras podem mudar. Consulte sempre o site oficial da AIMA.`
}));
