import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

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

import pt from '../i18n/locales/pt.json';
import en from '../i18n/locales/en.json';

const AppContext = createContext<AppContextType | undefined>(undefined);
const translations: Record<string, any> = { pt, en };

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { profile, loading } = useProfile();

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('voy-language');
    return (saved === 'en' || saved === 'pt') ? saved as Language : 'pt';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('voy-language', lang);
  };
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
      // Only set language from profile if we don't have a saved preference in localStorage
      // or if we want to sync it initially. To avoid the toggle-back bug, we check
      // if the current local state is different from profile.
      const savedLang = localStorage.getItem('voy-language');

      if (profile.language && (profile.language === 'pt' || profile.language === 'en')) {
        const profileLang = profile.language as Language;

        // Sync with profile only if no local preference exists yet
        if (!savedLang) {
          setLanguageState(profileLang);
          localStorage.setItem('voy-language', profileLang);
        }
      }

      if (profile.user_profile) {
        setUserProfile(profile.user_profile as UserProfile);
        setHasCompletedOnboarding(true);
      }
    }
  }, [profile]);

  const t = React.useCallback((key: string): string => {
    const data = translations[language] || translations['pt'];
    return data[key] || key;
  }, [language]);

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
        isProfileLoading: loading || (!!user && !profile && !userProfile),
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
