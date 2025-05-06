
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function RegistroForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validação simples
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    
    setIsLoading(true);
    
    // Simulando registro para demonstração
    setTimeout(() => {
      setIsLoading(false);
      navigate("/login");
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-turquesa">Criar Conta</CardTitle>
        <CardDescription>
          Registre-se para começar a usar o CraniumCare
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
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
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Senha</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <Button type="submit" className="w-full bg-turquesa hover:bg-turquesa/90" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Registrar"}
          </Button>
          <Button variant="outline" className="w-full" type="button">
            Registrar com Google
          </Button>
          <div className="text-center text-sm">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-turquesa hover:underline">
              Faça login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
