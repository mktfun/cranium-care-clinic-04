
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ConviteAceitar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [colaboradorData, setColaboradorData] = useState<any>(null);
  const [isValid, setIsValid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase.rpc('validate_invite_token', {
        token_input: token
      });

      if (error) throw error;

      const result = data[0];
      if (result?.valid) {
        setIsValid(true);
        setColaboradorData(result.collaborator_data);
      } else {
        setIsValid(false);
      }
    } catch (error) {
      console.error('Erro ao validar token:', error);
      setIsValid(false);
      toast.error('Erro ao validar convite');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setValidating(true);
    try {
      // Criar conta do usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: colaboradorData.email,
        password,
        options: {
          data: {
            nome: colaboradorData.nome,
            cargo: colaboradorData.permissao
          }
        }
      });

      if (authError) {
        if (authError.message.includes('User already registered')) {
          // Se usuário já existe, fazer login
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: colaboradorData.email,
            password
          });

          if (signInError) {
            toast.error('Email já cadastrado. Tente fazer login com sua senha atual.');
            return;
          }
        } else {
          throw authError;
        }
      }

      // Aceitar convite
      const userId = authData?.user?.id || (await supabase.auth.getUser()).data.user?.id;
      
      const { data: acceptData, error: acceptError } = await supabase.rpc('accept_invitation', {
        token_input: token,
        user_id_input: userId
      });

      if (acceptError) throw acceptError;

      const result = acceptData as { success: boolean; error?: string };
      
      if (result.success) {
        toast.success('Convite aceito com sucesso! Bem-vindo à equipe!');
        
        // Aguardar um momento para o banco processar
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(result.error || 'Erro desconhecido ao aceitar convite');
      }

    } catch (error: any) {
      console.error('Erro ao aceitar convite:', error);
      toast.error(error.message || 'Erro ao aceitar convite');
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-turquesa" />
          <span>Validando convite...</span>
        </div>
      </div>
    );
  }

  if (!token || !isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Convite Inválido</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Este convite é inválido, expirou ou já foi utilizado.
            </p>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleNames = {
    'admin': 'Administrador',
    'editar': 'Editor',
    'visualizar': 'Visualizador'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-8 w-8 text-turquesa" />
            <h1 className="text-2xl font-bold text-turquesa">Medikran</h1>
          </div>
          <CardTitle>Aceitar Convite</CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete seu cadastro para colaborar
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{colaboradorData?.nome}</strong>, você foi convidado para colaborar na{' '}
              <strong>{colaboradorData?.empresa_nome}</strong> como{' '}
              <strong>{roleNames[colaboradorData?.permissao as keyof typeof roleNames] || colaboradorData?.permissao}</strong>.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleAcceptInvitation} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={colaboradorData?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha (min. 6 caracteres)"
                required
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-turquesa hover:bg-turquesa/90"
              disabled={validating}
            >
              {validating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Aceitando Convite...
                </>
              ) : (
                'Aceitar Convite e Criar Conta'
              )}
            </Button>
          </form>

          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-sm"
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
