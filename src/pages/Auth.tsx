import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { validatePassword, getPasswordStrength } from '@/lib/passwordValidation';
import { Turnstile } from '@marsidev/react-turnstile';

const emailSchema = z.string().email('Email inválido').max(255, 'Email muito longo');

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, sendPasswordResetEmail, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetSent, setIsResetSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const passwordStrength = getPasswordStrength(password);
  const [captchaToken, setCaptchaToken] = useState<string>('');

  const validate = () => {
    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }

    // For signup, validate password strength
    if (!isLogin) {
      const validation = validatePassword(password);
      if (!validation.isValid) {
        setPasswordErrors(validation.errors);
        setError(validation.errors[0]);
        return false;
      }
      if (!agreePrivacy) {
        setError('Você deve concordar com os Termos e Política de Privacidade');
        return false;
      }
    } else {
      // For login, just check minimum length
      if (password.length < 6) {
        setError('Senha deve ter no mínimo 6 caracteres');
        return false;
      }
    }

    setPasswordErrors([]);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);

    try {
      if (isLogin) {
        console.log('Tentativa de login:', email);
        const { error } = await signIn(email, password, captchaToken);
        if (error) {
          console.error('[Auth DEBUG] Erro completo do Supabase:', error);
          const errorMessage = error.message.toLowerCase();

          if (errorMessage.includes('invalid login') || errorMessage.includes('invalid credentials')) {
            setError('Email ou senha incorretos');
          } else if (errorMessage.includes('email not confirmed')) {
            setError('Por favor, confirme seu email antes de fazer login');
          } else {
            setError(`Erro (${error.name || 'Auth'}): ${error.message}`);
          }
        } else {
          console.log('Login bem-sucedido');
          navigate('/home');
        }
      } else {
        const { error } = await signUp(email, password, captchaToken);
        if (error) {
          console.error('[Auth DEBUG] Erro completo do cadastro:', error);
          if (error.message.toLowerCase().includes('already registered')) {
            setError('Este email já está cadastrado');
          } else {
            setError(`Erro ao criar conta: ${error.message}`);
          }
        } else {
          navigate('/home');
        }
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Ocorreu um erro inesperado. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      emailSchema.parse(email);
    } catch (err) {
      setError('Insira um email válido');
      return;
    }

    setLoading(true);
    try {
      const { error } = await sendPasswordResetEmail(email, captchaToken);
      if (error) {
        if (error.message.toLowerCase().includes('rate limit')) {
          setError('Muitas solicitações. Tente novamente em alguns minutos.');
        } else {
          setError(`Erro ao enviar email de recuperação: ${error.message}`);
        }
      } else {
        setIsResetSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isResetSent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Verifique seu email</h2>
          <p className="text-muted-foreground mb-8">
            Enviamos um link de recuperação para <strong>{email}</strong>. Por favor, verifique sua caixa de entrada e spam.
          </p>
          <Button
            onClick={() => {
              setIsResetSent(false);
              setIsForgotPassword(false);
              setIsLogin(true);
            }}
            className="w-full h-12 rounded-xl"
          >
            Voltar para o login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Premium background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[100px] rounded-full animate-float" />

      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-sm glass-card p-8 rounded-[2.5rem] shadow-2xl shadow-primary/5">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 flex items-center justify-center mx-auto mb-4 animate-float">
              <img src="/logo.png" alt="VOY Logo" className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
            <p className="text-xl font-black text-primary tracking-tighter uppercase mb-1">
              VOY App
            </p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">
              A porta de entrada para o seu futuro
            </p>
            <div className="h-px w-12 bg-primary/20 mx-auto mb-6" />
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              {isForgotPassword ? 'Recuperar senha' : isLogin ? 'Bem-vindo!' : 'Criar conta'}
            </h2>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <Button
              variant="outline"
              type="button"
              className="w-full h-12 rounded-xl border-input bg-background hover:bg-accent hover:text-accent-foreground items-center gap-2 text-base font-semibold"
              onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  console.log('Iniciando login com Google');
                  const { error } = await signInWithGoogle();
                  if (error) {
                    console.error('Erro Google Auth:', error);
                    setError(`Erro ao conectar com Google: ${error.message}`);
                    setLoading(false);
                  }
                } catch (err) {
                  console.error('Erro inesperado Google Auth:', err);
                  setError('Erro inesperado ao conectar com Google');
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  style={{ fill: '#4285F4' }}
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  style={{ fill: '#34A853' }}
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z"
                  style={{ fill: '#FBBC05' }}
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  style={{ fill: '#EA4335' }}
                />
              </svg>
              Continuar com Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continue com
                </span>
              </div>
            </div>

            <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="h-12 pl-10 rounded-xl"
                    disabled={loading}
                  />
                </div>
              </div>

              {!isForgotPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError('');
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      className="h-12 pl-10 pr-10 rounded-xl"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password strength indicator for signup */}
                  {!isLogin && password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        <div className={cn(
                          "h-1 flex-1 rounded",
                          passwordStrength === 'weak' ? 'bg-destructive' :
                            passwordStrength === 'medium' ? 'bg-warning' : 'bg-success'
                        )} />
                        <div className={cn(
                          "h-1 flex-1 rounded",
                          passwordStrength === 'medium' ? 'bg-warning' :
                            passwordStrength === 'strong' ? 'bg-success' : 'bg-muted'
                        )} />
                        <div className={cn(
                          "h-1 flex-1 rounded",
                          passwordStrength === 'strong' ? 'bg-success' : 'bg-muted'
                        )} />
                      </div>
                      <p className={cn(
                        "text-xs",
                        passwordStrength === 'weak' ? 'text-destructive' :
                          passwordStrength === 'medium' ? 'text-warning' : 'text-success'
                      )}>
                        Força: {passwordStrength === 'weak' ? 'Fraca' :
                          passwordStrength === 'medium' ? 'Média' : 'Forte'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!isLogin && !isForgotPassword && (
                <div className="flex items-start space-x-3 p-2">
                  <Checkbox
                    id="privacy"
                    checked={agreePrivacy}
                    onCheckedChange={(checked) => setAgreePrivacy(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="privacy"
                      className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                    >
                      Eu aceito os <span className="text-primary font-medium">Termos de Uso</span> e a <span className="text-primary font-medium">Política de Privacidade</span> (LGPD/GDPR) do VOY App.
                    </label>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
                  {error}
                </div>
              )}

              {/* Cloudflare Turnstile (Desativado para Depuração)
              {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
                <div className="flex justify-center">
                  <Turnstile
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                    onSuccess={(token) => setCaptchaToken(token)}
                    onError={() => setError('Erro ao validar CAPTCHA')}
                    onExpire={() => setCaptchaToken('')}
                  />
                </div>
              )} 
              */}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isForgotPassword ? (
                  'Enviar link de recuperação'
                ) : isLogin ? (
                  'Entrar'
                ) : (
                  'Criar conta'
                )}
              </Button>
            </form>
          </div>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isForgotPassword ? 'Lembrou a senha?' : isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            </p>
            <button
              onClick={() => {
                if (isForgotPassword) {
                  setIsForgotPassword(false);
                } else {
                  setIsLogin(!isLogin);
                }
                setError('');
              }}
              className="text-primary font-semibold hover:underline mt-1"
              disabled={loading}
            >
              {isForgotPassword ? 'Voltar para login' : isLogin ? 'Criar conta' : 'Fazer login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
