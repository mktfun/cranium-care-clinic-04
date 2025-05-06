
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulando autenticação para demonstração
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-turquesa">CraniumCare Clinic</CardTitle>
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
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <Button type="submit" className="w-full bg-turquesa hover:bg-turquesa/90" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
          <Button variant="outline" className="w-full" type="button">
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
