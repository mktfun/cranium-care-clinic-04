
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validatePasswordStrength, checkRateLimit, resetRateLimit } from '@/lib/security-utils';

interface SecureLoginFormProps {
  onSuccess?: () => void;
}

export function SecureLoginForm({ onSuccess }: SecureLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    
    // Check rate limiting
    if (!checkRateLimit(email)) {
      setIsBlocked(true);
      setErrors(['Muitas tentativas de login. Tente novamente em 15 minutos.']);
      return;
    }

    // Validate password strength for signup
    if (!isLogin) {
      const validation = validatePasswordStrength(password);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrors(['Email ou senha incorretos']);
          } else {
            setErrors([error.message]);
          }
          return;
        }

        if (data.user) {
          resetRateLimit(email);
          toast.success('Login realizado com sucesso!');
          onSuccess?.();
        }
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });

        if (error) {
          setErrors([error.message]);
          return;
        }

        if (data.user) {
          toast.success('Conta criada com sucesso! Verifique seu email.');
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      setErrors([error.message || 'Erro inesperado']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          {isLogin ? 'Entrar' : 'Criar Conta'}
        </CardTitle>
        <CardDescription className="text-center">
          {isLogin 
            ? 'Entre com suas credenciais' 
            : 'Crie sua conta para acessar o sistema'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {isBlocked && (
            <Alert variant="destructive">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Conta temporariamente bloqueada por segurança. Tente novamente em alguns minutos.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || isBlocked}
            />
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || isBlocked}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || isBlocked}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {!isLogin && password && (
              <div className="text-sm text-muted-foreground">
                <p>A senha deve conter:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li className={password.length >= 8 ? 'text-green-600' : 'text-red-600'}>
                    Pelo menos 8 caracteres
                  </li>
                  <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-red-600'}>
                    Uma letra maiúscula
                  </li>
                  <li className={/[a-z]/.test(password) ? 'text-green-600' : 'text-red-600'}>
                    Uma letra minúscula
                  </li>
                  <li className={/[0-9]/.test(password) ? 'text-green-600' : 'text-red-600'}>
                    Um número
                  </li>
                  <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-red-600'}>
                    Um caractere especial
                  </li>
                </ul>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || isBlocked}
          >
            {loading 
              ? (isLogin ? 'Entrando...' : 'Criando conta...') 
              : (isLogin ? 'Entrar' : 'Criar Conta')
            }
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading || isBlocked}
            >
              {isLogin 
                ? 'Não tem uma conta? Crie aqui' 
                : 'Já tem uma conta? Faça login'
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
