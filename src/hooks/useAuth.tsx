import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, captchaToken?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string, captchaToken?: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string, captchaToken?: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[Auth] Inicializando estado de autenticação...');
    console.log('[Auth] Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

    // Failsafe: Se em 8 segundos não inicializar, força loading para false
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('[Auth] Tempo limite de inicialização atingido. Forçando desbloqueio.');
        setLoading(false);
      }
    }, 8000);

    try {
      // Set up auth state listener FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('[Auth] Mudança de estado:', event);
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          clearTimeout(timeout);
        }
      );

      // THEN check for existing session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error('[Auth] Erro ao buscar sessão:', error);
        }
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        clearTimeout(timeout);
      }).catch(err => {
        console.error('[Auth] Erro crítico na Promise de sessão:', err);
        setLoading(false);
        clearTimeout(timeout);
      });

      return () => {
        subscription.unsubscribe();
        clearTimeout(timeout);
      };
    } catch (err) {
      console.error('[Auth] Erro ao configurar listeners de auth:', err);
      setLoading(false);
      clearTimeout(timeout);
    }
  }, []);


  const signUp = async (email: string, password: string, captchaToken?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        captchaToken
      }
    });

    return { error: error };
  };

  const signIn = async (email: string, password: string, captchaToken?: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken,
      },
    });

    return { error: error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const sendPasswordResetEmail = async (email: string, captchaToken?: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
      captchaToken,
    });
    return { error: error as Error | null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut, sendPasswordResetEmail, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
