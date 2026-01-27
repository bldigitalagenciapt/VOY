import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProfile } from '@/hooks/useProfile';

type Language = 'pt' | 'en';
type UserProfile = 'recent' | 'resident' | 'legalizing' | null;

interface UserNumbers {
  nif: string;
  niss: string;
  sns: string;
}

interface Document {
  id: string;
  name: string;
  category: 'immigration' | 'work' | 'health' | 'housing';
  date: string;
  type: 'photo' | 'pdf';
}

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  isImportant: boolean;
  reminder?: string;
  createdAt: string;
}

interface AimaProcess {
  type: 'cplp' | 'manifestation' | 'renewal' | 'visa' | null;
  steps: { id: string; title: string; completed: boolean; date?: string }[];
  protocols: string[];
  importantDates: { label: string; date: string }[];
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;
  userNumbers: UserNumbers;
  setUserNumbers: (numbers: UserNumbers) => void;
  documents: Document[];
  addDocument: (doc: Document) => void;
  notes: Note[];
  addNote: (note: Note) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  aimaProcess: AimaProcess;
  setAimaProcess: (process: AimaProcess) => void;
  t: (key: string) => string;
  isProfileLoading: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  pt: {
    'welcome.title': 'Bem-vindo ao VOY',
    'welcome.subtitle': 'VOY - A porta de entrada para o seu futuro',
    'welcome.start': 'Começar',
    'language.select': 'Escolha seu idioma',
    'profile.select': 'Qual é a sua situação?',
    'profile.recent': 'Recém-chegado',
    'profile.recent.desc': 'Cheguei há pouco tempo',
    'profile.resident': 'Já moro em Portugal',
    'profile.resident.desc': 'Estou estabelecido',
    'profile.legalizing': 'Em processo de legalização',
    'profile.legalizing.desc': 'Aguardando documentos',
    'notifications.title': 'Quer receber lembretes?',
    'notifications.desc': 'Vamos avisar sobre prazos importantes para você não perder nada.',
    'notifications.allow': 'Permitir notificações',
    'notifications.skip': 'Agora não',
    'biometric.title': 'Proteja seus dados',
    'biometric.desc': 'Use sua biometria para acessar o app de forma segura.',
    'biometric.enable': 'Ativar biometria',
    'biometric.skip': 'Talvez depois',
    'home.hello': 'Olá!',
    'home.alerts': 'Atenção',
    'home.quickAccess': 'Acesso rápido',
    'home.nif': 'NIF',
    'home.niss': 'NISS',
    'home.sns': 'SNS',
    'home.addNumber': 'Toque para adicionar',
    'nav.home': 'Início',
    'nav.documents': 'Documentos',
    'nav.aima': 'Imigração',
    'nav.notes': 'Notas',
    'nav.meuBolso': 'Meu Bolso',
    'nav.community': 'Mural',
    'nav.agenda': 'Agenda',
    'nav.checklist': 'Guia de Chegada',
    'nav.calculator': 'Salário Líquido',
    'nav.usefulLinks': 'Links Úteis',
    'nav.help': 'Ajuda',
    'documents.title': 'Meus Documentos',
    'documents.add': 'Adicionar documento',
    'documents.empty': 'Nenhum documento ainda',
    'documents.empty.desc': 'Adicione seus documentos importantes aqui',
    'documents.category.immigration': 'Imigração',
    'documents.category.work': 'Trabalho',
    'documents.category.health': 'Saúde',
    'documents.category.housing': 'Moradia',
    'aima.title': 'Imigração / AIMA',
    'aima.selectProcess': 'Qual é o seu processo?',
    'aima.cplp': 'CPLP',
    'aima.cplp.desc': 'Comunidade dos Países de Língua Portuguesa',
    'aima.manifestation': 'Manifestação de Interesse',
    'aima.manifestation.desc': 'Para quem já está trabalhando',
    'aima.renewal': 'Renovação',
    'aima.renewal.desc': 'Renovar autorização de residência',
    'aima.checklist': 'Suas etapas',
    'aima.dates': 'Datas importantes',
    'aima.protocols': 'Protocolos',
    'notes.title': 'Minhas Anotações',
    'notes.add': 'Nova anotação',
    'notes.empty': 'Nenhuma anotação',
    'notes.empty.desc': 'Crie notas para lembrar de coisas importantes',
    'assistant.title': 'Preciso de Ajuda',
    'assistant.placeholder': 'Digite sua dúvida...',
    'assistant.disclaimer': 'As informações são apenas orientativas e não substituem aconselhamento legal.',
    'settings.title': 'Configurações',
    'settings.language': 'Idioma',
    'settings.security': 'Segurança',
    'settings.biometric': 'Biometria',
    'settings.backup': 'Backup',
    'settings.theme': 'Tema',
    'settings.about': 'Sobre o VOY',
    'continue': 'Continuar',
    'save': 'Salvar',
    'cancel': 'Cancelar',
    'delete': 'Excluir',
    'edit': 'Editar',
    'share': 'Compartilhar',
  },
  en: {
    'welcome.title': 'Welcome to VOY',
    'welcome.subtitle': 'VOY - The gateway to your future',
    'welcome.start': 'Get Started',
    'language.select': 'Choose your language',
    'profile.select': 'What\'s your situation?',
    'profile.recent': 'Recently arrived',
    'profile.recent.desc': 'I just got here',
    'profile.resident': 'I live in Portugal',
    'profile.resident.desc': 'I\'m settled in',
    'profile.legalizing': 'Legalizing my status',
    'profile.legalizing.desc': 'Waiting for documents',
    'notifications.title': 'Want to receive reminders?',
    'notifications.desc': 'We\'ll notify you about important deadlines so you don\'t miss anything.',
    'notifications.allow': 'Allow notifications',
    'notifications.skip': 'Not now',
    'biometric.title': 'Protect your data',
    'biometric.desc': 'Use biometrics to access the app securely.',
    'biometric.enable': 'Enable biometrics',
    'biometric.skip': 'Maybe later',
    'home.hello': 'Hello!',
    'home.alerts': 'Attention',
    'home.quickAccess': 'Quick access',
    'home.nif': 'NIF',
    'home.niss': 'NISS',
    'home.sns': 'SNS',
    'home.addNumber': 'Tap to add',
    'nav.home': 'Home',
    'nav.documents': 'Documents',
    'nav.aima': 'Immigration',
    'nav.notes': 'Notes',
    'nav.meuBolso': 'My Pocket',
    'nav.community': 'Community',
    'nav.agenda': 'Agenda',
    'nav.checklist': 'Arrival Guide',
    'nav.calculator': 'Salary Simulator',
    'nav.usefulLinks': 'Useful Links',
    'nav.help': 'Help',
    'documents.title': 'My Documents',
    'documents.add': 'Add document',
    'documents.empty': 'No documents yet',
    'documents.empty.desc': 'Add your important documents here',
    'documents.category.immigration': 'Immigration',
    'documents.category.work': 'Work',
    'documents.category.health': 'Health',
    'documents.category.housing': 'Housing',
    'aima.title': 'Immigration / AIMA',
    'aima.selectProcess': 'What\'s your process?',
    'aima.cplp': 'CPLP',
    'aima.cplp.desc': 'Community of Portuguese-Speaking Countries',
    'aima.manifestation': 'Manifestation of Interest',
    'aima.manifestation.desc': 'For those already working',
    'aima.renewal': 'Renewal',
    'aima.renewal.desc': 'Renew residence permit',
    'aima.checklist': 'Your steps',
    'aima.dates': 'Important dates',
    'aima.protocols': 'Protocols',
    'notes.title': 'My Notes',
    'notes.add': 'New note',
    'notes.empty': 'No notes',
    'notes.empty.desc': 'Create notes to remember important things',
    'assistant.title': 'Need Help',
    'assistant.placeholder': 'Type your question...',
    'assistant.disclaimer': 'Information is for guidance only and does not replace legal advice.',
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.security': 'Security',
    'settings.biometric': 'Biometrics',
    'settings.backup': 'Backup',
    'settings.theme': 'Theme',
    'settings.about': 'About VOY',
    'continue': 'Continue',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'share': 'Share',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { profile, loading } = useProfile();

  const [language, setLanguage] = useState<Language>('pt');
  const [userProfile, setUserProfile] = useState<UserProfile>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userNumbers, setUserNumbers] = useState<UserNumbers>({ nif: '', niss: '', sns: '' });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [aimaProcess, setAimaProcess] = useState<AimaProcess>({
    type: null,
    steps: [],
    protocols: [],
    importantDates: [],
  });

  useEffect(() => {
    if (profile) {
      if (profile.language && (profile.language === 'pt' || profile.language === 'en')) {
        setLanguage(profile.language as Language);
      }

      // If user has a profile type selected (Steps 1-3), we consider onboarding sufficiently advanced/complete
      // to avoid restarting the flow.
      if (profile.user_profile) {
        setUserProfile(profile.user_profile as UserProfile);
        setHasCompletedOnboarding(true);
      }
    }
  }, [profile]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const addDocument = (doc: Document) => {
    setDocuments((prev) => [...prev, doc]);
  };

  const addNote = (note: Note) => {
    setNotes((prev) => [...prev, note]);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...updates } : note))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        userProfile,
        setUserProfile,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        userNumbers,
        setUserNumbers,
        documents,
        addDocument,
        notes,
        addNote,
        updateNote,
        deleteNote,
        aimaProcess,
        setAimaProcess,
        t,
        isProfileLoading: loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
