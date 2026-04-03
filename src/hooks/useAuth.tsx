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
    let mounted = true;
    console.log('[Auth] Inicializando estado de autenticação...');

    // Função para verificar deletamento agendado
    const checkDeletionStatus = async (user: User) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('deletion_scheduled_at')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('[Auth] Erro ao verificar status de exclusão:', error);
          return false;
        }

        if (profile?.deletion_scheduled_at) {
          console.warn('[Auth] Conta agendada para exclusão capturada.');
          return true;
        }
      } catch (e) {
        console.error('[Auth] Exceção ao verificar status de exclusão:', e);
      }
      return false;
    };

    const initializeAuth = async () => {
      try {
        // 1. Recuperar sessão inicial (Síncrono/Rápido via LocalStorage)
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[Auth] Erro ao recuperar sessão inicial:', sessionError);
        }

        if (initialSession?.user) {
          const isDeleted = await checkDeletionStatus(initialSession.user);
          if (isDeleted && mounted) {
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            setLoading(false);
            return;
          }
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setLoading(false);
        }

        // 2. Configurar o listener para mudanças futuras
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('[Auth] Evento de mudança:', event);
            
            if (currentSession?.user && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
              const isDeleted = await checkDeletionStatus(currentSession.user);
              if (isDeleted && mounted) {
                await supabase.auth.signOut();
                setSession(null);
                setUser(null);
                setLoading(false);
                return;
              }
            }

            if (mounted) {
              setSession(currentSession);
              setUser(currentSession?.user ?? null);
              setLoading(false);
            }
          }
        );

        return subscription;
      } catch (err) {
        console.error('[Auth] Erro crítico na inicialização:', err);
        if (mounted) setLoading(false);
        return null;
      }
    };

    const authPromise = initializeAuth();

    return () => {
      mounted = false;
      authPromise.then(sub => sub?.unsubscribe());
    };
  }, []);


  const signUp = async (email: string, password: string, captchaToken?: string) => {
    const redirectUrl = `${window.location.origin}/home`;

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
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken,
      },
    });

    if (signInError) return { error: signInError };

    if (data.user) {
      // Check if account is scheduled for deletion
      const { data: profile } = await supabase
        .from('profiles')
        .select('deletion_scheduled_at')
        .eq('user_id', data.user.id)
        .single();

      if (profile?.deletion_scheduled_at) {
        console.warn('[Auth] Tentativa de login em conta agendada para exclusão.');
        await supabase.auth.signOut();
        return { error: new Error('Esta conta está agendada para exclusão em 30 dias. Entre em contato com o suporte para reativar.') };
      }
    }

    return { error: null };
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
