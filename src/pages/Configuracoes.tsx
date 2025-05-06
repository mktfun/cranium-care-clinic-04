
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Configuracoes() {
  const [nome, setNome] = useState("Dra. Ana Silva");
  const [email, setEmail] = useState("ana.silva@exemplo.com");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  
  const [notificacoesEmail, setNotificacoesEmail] = useState(true);
  const [relatoriosAutomaticos, setRelatoriosAutomaticos] = useState(true);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold">Configurações</h2>
      
      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="conta">Conta</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
        </TabsList>
        
        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e foto de perfil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl bg-azul text-white">AS</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="mr-2">Alterar Foto</Button>
                  <Button variant="outline" className="text-destructive">Remover</Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input 
                    id="nome" 
                    value={nome} 
                    onChange={(e) => setNome(e.target.value)} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-turquesa hover:bg-turquesa/90">Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="conta">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>
                Altere sua senha e gerencie as configurações de segurança.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="senha-atual">Senha Atual</Label>
                  <Input 
                    id="senha-atual" 
                    type="password" 
                    value={senhaAtual} 
                    onChange={(e) => setSenhaAtual(e.target.value)} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="nova-senha">Nova Senha</Label>
                  <Input 
                    id="nova-senha" 
                    type="password" 
                    value={novaSenha} 
                    onChange={(e) => setNovaSenha(e.target.value)} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                  <Input 
                    id="confirmar-senha" 
                    type="password" 
                    value={confirmarSenha} 
                    onChange={(e) => setConfirmarSenha(e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-turquesa hover:bg-turquesa/90">Alterar Senha</Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Gerenciamento da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full sm:w-auto">
                Exportar Dados
              </Button>
              <Button variant="destructive" className="w-full sm:w-auto">
                Excluir Conta
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificações</CardTitle>
              <CardDescription>
                Configure como deseja receber notificações da plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">Notificações por Email</p>
                  <p className="text-sm text-muted-foreground">
                    Receba lembretes de consultas e atualizações importantes.
                  </p>
                </div>
                <Switch 
                  checked={notificacoesEmail} 
                  onCheckedChange={setNotificacoesEmail} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">Relatórios Automáticos</p>
                  <p className="text-sm text-muted-foreground">
                    Gere relatórios automaticamente após novas medições.
                  </p>
                </div>
                <Switch 
                  checked={relatoriosAutomaticos} 
                  onCheckedChange={setRelatoriosAutomaticos} 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-turquesa hover:bg-turquesa/90">Salvar Preferências</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="aparencia">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize a aparência do sistema conforme sua preferência.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tema</p>
                    <p className="text-sm text-muted-foreground">
                      Alternar entre modo claro e modo escuro.
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
