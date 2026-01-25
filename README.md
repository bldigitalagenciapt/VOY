# 🚀 VOY App - O Companheiro do Imigrante em Portugal

![VOY Logo](/public/logo.png)

O **VOY** é uma aplicação mobile-first desenvolvida para centralizar e simplificar a jornada de integração de imigrantes em Portugal. Desde a gestão de documentos sensíveis até o controlo financeiro e acompanhamento de processos na AIMA, o VOY oferece uma interface intuitiva, segura e em total conformidade com a LGPD/GDPR.

## ✨ Funcionalidades Principais

### 📂 Gestão de Documentos & Pasta Segura
- Armazenamento privado de passaportes, contratos e vistos.
- Acesso via **Signed URLs** (links temporários de 60 segundos) para máxima proteção.
- Pré-visualização integrada de PDFs e Imagens.

### 💶 Meu Bolso (Gestão Financeira)
- Registo de receitas e despesas com categorias específicas para o contexto de imigração (ex: Remessas).
- Gráficos interativos para análise de gastos mensais.

### 🛂 Imigração & AIMA
- Checklists detalhadas para processos CPLP, Manifestação de Interesse e Renovação.
- Monitorização de etapas e protocolos de forma organizada.

### 📅 Utilidades Diárias
- Calendário com feriados portugueses automáticos.
- Simulador de Salário Líquido (regras fiscais de Portugal).
- Acesso rápido a números vitais (NIF, NISS, SNS) com modo de privacidade.

## 🛡️ Segurança e Privacidade (LGPD)
- **Privacidade por Design**: Bucket de armazenamento 100% privado.
- **RLS (Row Level Security)**: Isolamento total de dados entre utilizadores a nível de base de dados.
- **Direito ao Esquecimento**: Funcionalidade de eliminação total de conta e dados vinculados.
- **Consentimento**: Fluxo de registo com aceite explícito de termos de uso.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React.js, Vite, Tailwind CSS.
- **UI Components**: Shadcn/UI, Lucide React.
- **Backend/BaaS**: Supabase (Auth, Database, Storage, Edge Functions).
- **Gestão de State**: TanStack Query (React Query).
- **Validação**: Zod.

## 🚀 Como Executar o Projeto

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/voy-app.git
   cd voy-app
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**:
   Crie um arquivo `.env` na raiz do projeto com as suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
   ```

4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

## 💚 Contribuição & Créditos

Este projeto foi idealizado e desenvolvido por **Bruno Leandro**.

Feito com dedicação para ajudar a comunidade de imigrantes a navegar pelo seu futuro em Portugal. 🇵🇹
