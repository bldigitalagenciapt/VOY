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

const emailSchema = z.string().email('Email inválido').max(255, 'Email muito longo');

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, sendPasswordResetEmail } = useAuth();
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
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            setError('Email ou senha incorretos');
          } else {
            setError('Erro ao fazer login. Tente novamente.');
          }
        } else {
          navigate('/home');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('Este email já está cadastrado');
          } else {
            setError('Erro ao criar conta. Tente novamente.');
          }
        } else {
          navigate('/onboarding/welcome');
        }
      }
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
      const { error } = await sendPasswordResetEmail(email);
      if (error) {
        setError('Erro ao enviar email de recuperação');
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <img src="/logo.png" alt="VOY Logo" className="w-full h-full object-contain" />
            </div>
            <p className="text-lg font-medium text-primary mt-1">
              A porta de entrada para o seu futuro
            </p>
            <p className="text-muted-foreground mt-2">
              {isForgotPassword ? 'Recuperar sua senha' : isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
            </p>
          </div>

          {/* Form */}
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
