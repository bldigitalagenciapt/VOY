import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { validatePassword, getPasswordStrength } from '@/lib/passwordValidation';

const emailSchema = z.string().email('Email inválido').max(255, 'Email muito longo');

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Raiz</h1>
            <p className="text-muted-foreground mt-2">
              {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
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
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-primary font-semibold hover:underline mt-1"
              disabled={loading}
            >
              {isLogin ? 'Criar conta' : 'Fazer login'}
            </button>
          </div>

          {/* Test Account */}

        </div>
      </div>
    </div>
  );
}
