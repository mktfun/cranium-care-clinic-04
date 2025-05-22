import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Updated to allow both aminmedikran.com and adminmedikran.com domains
  const isAdminEmail = (email: string) => {
    return email.endsWith("@aminmedikran.com") || email.endsWith("@adminmedikran.com");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Check if it's an admin email and redirect to admin login
      if (isAdminEmail(email)) {
        navigate("/admin/login");
        return;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Erro no login:", error);
      
      // Specific error handling
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email ou senha incorretos");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Email não confirmado. Por favor, verifique sua caixa de entrada");
      } else {
        toast.error(`Erro ao fazer login: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast.error(`Erro ao fazer login com Google: ${error.message}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-turquesa">Medikran</CardTitle>
        <CardDescription>
          Faça login para acessar o sistema de medição craniana
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link to="/esqueci-senha" className="text-sm text-turquesa hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <Button type="submit" className="w-full bg-turquesa hover:bg-turquesa/90" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            type="button" 
            onClick={handleLoginWithGoogle}
            disabled={isLoading}
          >
            Entrar com Google
          </Button>
          <div className="text-center text-sm">
            Não tem uma conta?{" "}
            <Link to="/registro" className="text-turquesa hover:underline">
              Registre-se
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
