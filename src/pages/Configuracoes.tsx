
import { useState, useEffect, useRef } from "react";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AparenciaTab from "@/components/configuracoes/AparenciaTab";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  clinica_nome?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export default function Configuracoes() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [nome, setNome] = useState("");
  const [clinicaNome, setClinicaNome] = useState("");
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  
  const [notificacoesEmail, setNotificacoesEmail] = useState(true);
  const [relatoriosAutomaticos, setRelatoriosAutomaticos] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Carregar dados do usuário
  useEffect(() => {
    async function carregarUsuario() {
      try {
        setCarregando(true);
        
        // Obter sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          toast.error("Usuário não autenticado");
          return;
        }
        
        // Carregar dados do usuário da tabela usuarios
        const { data: usuarioData, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error("Erro ao carregar dados do usuário:", error);
          toast.error("Erro ao carregar dados do usuário");
          return;
        }
        
        if (usuarioData) {
          setUsuario(usuarioData);
          setNome(usuarioData.nome || '');
          setEmail(usuarioData.email || '');
          setClinicaNome(usuarioData.clinica_nome || '');
          
          if (usuarioData.avatar_url) {
            setAvatarUrl(usuarioData.avatar_url);
          }
        }
        
      } catch (err) {
        console.error("Erro:", err);
        toast.error("Erro ao carregar dados do perfil");
      } finally {
        setCarregando(false);
      }
    }
    
    carregarUsuario();
  }, []);
  
  // Salvar alterações do perfil
  const salvarAlteracoes = async () => {
    try {
      setSalvando(true);
      
      // Verificar se usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Atualizar dados do usuário na tabela usuarios
      const { error } = await supabase
        .from('usuarios')
        .update({
          nome: nome,
          clinica_nome: clinicaNome || 'CraniumCare',
          email: email
        })
        .eq('id', session.user.id);
        
      if (error) {
        throw error;
      }
      
      // Salvar também localmente
      localStorage.setItem('clinicaNome', clinicaNome || 'CraniumCare');
      
      toast.success("Alterações salvas com sucesso!");
      
    } catch (err: any) {
      console.error("Erro ao salvar alterações:", err);
      toast.error(`Erro ao salvar alterações: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  };
  
  // Alterar senha
  const alterarSenha = async () => {
    try {
      setAlterandoSenha(true);
      
      // Validação
      if (novaSenha !== confirmarSenha) {
        toast.error("As senhas não coincidem");
        return;
      }
      
      if (novaSenha.length < 6) {
        toast.error("A nova senha deve ter pelo menos 6 caracteres");
        return;
      }
      
      // Atualizar senha
      const { error } = await supabase.auth.updateUser({
        password: novaSenha
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Senha alterada com sucesso!");
      
      // Limpar campos
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      
    } catch (err: any) {
      console.error("Erro ao alterar senha:", err);
      toast.error(`Erro ao alterar senha: ${err.message}`);
    } finally {
      setAlterandoSenha(false);
    }
  };
  
  // Salvar preferências de notificações
  const salvarPreferencias = async () => {
    try {
      // Aqui seria implementado o salvamento das preferências no banco
      // Por enquanto, apenas mostra uma notificação de sucesso
      toast.success("Preferências de notificações salvas com sucesso!");
      
    } catch (err: any) {
      console.error("Erro ao salvar preferências:", err);
      toast.error(`Erro ao salvar preferências: ${err.message}`);
    }
  };
  
  // Upload de avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setUploadingAvatar(true);
      
      // Verificar se usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("Usuário não autenticado");
        return;
      }
      
      // Verificar se o bucket existe, se não, criar
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('avatars');
        
      if (bucketError && bucketError.message.includes('does not exist')) {
        // Criar bucket se não existir
        await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 1024 * 1024 * 2 // 2MB
        });
      }
      
      // Upload do arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Obter URL pública
      const { data: urlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      const avatarUrl = urlData.publicUrl;
      
      // Atualizar URL no perfil do usuário
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          avatar_url: avatarUrl
        })
        .eq('id', session.user.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Atualizar estado
      setAvatarUrl(avatarUrl);
      
      toast.success("Foto de perfil atualizada com sucesso!");
      
    } catch (err: any) {
      console.error("Erro ao fazer upload do avatar:", err);
      toast.error(`Erro ao atualizar foto de perfil: ${err.message}`);
    } finally {
      setUploadingAvatar(false);
    }
  };
  
  // Remover avatar
  const removerAvatar = async () => {
    try {
      setUploadingAvatar(true);
      
      // Verificar se usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("Usuário não autenticado");
        return;
      }
      
      // Remover referência do avatar no perfil
      const { error } = await supabase
        .from('usuarios')
        .update({
          avatar_url: null
        })
        .eq('id', session.user.id);
        
      if (error) {
        throw error;
      }
      
      // Atualizar estado
      setAvatarUrl(null);
      
      toast.success("Foto de perfil removida com sucesso!");
      
    } catch (err: any) {
      console.error("Erro ao remover avatar:", err);
      toast.error(`Erro ao remover foto de perfil: ${err.message}`);
    } finally {
      setUploadingAvatar(false);
    }
  };
  
  // Dialog para adicionar colaborador
  const [novoColaborador, setNovoColaborador] = useState({
    email: '',
    permissao: 'visualizar' as 'visualizar' | 'editar' | 'admin'
  });
  
  const adicionarColaborador = async () => {
    // Implementação futura para adicionar colaboradores
    toast.success(`Convite enviado para ${novoColaborador.email}`);
    setNovoColaborador({ email: '', permissao: 'visualizar' });
  };
  
  // Iniciais para o avatar
  const obterIniciais = (nome: string) => {
    return nome
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
      
      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="conta">Conta</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="colaboradores">Colaboradores</TabsTrigger>
        </TabsList>
        
        <TabsContent value="perfil" className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader className="card-header-highlight">
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e foto de perfil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-sm">
                  <AvatarImage src={avatarUrl || ""} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {obterIniciais(nome || "Usuário")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                  <Button 
                    variant="outline" 
                    className="mr-2 btn-hover"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : "Alterar Foto"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-destructive btn-hover"
                    onClick={removerAvatar}
                    disabled={!avatarUrl || uploadingAvatar}
                  >
                    Remover
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input 
                    id="nome" 
                    value={nome} 
                    onChange={(e) => setNome(e.target.value)} 
                    className="transition-all focus:border-primary/30 focus:shadow-sm"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="clinica-nome">Nome da Clínica</Label>
                  <Input 
                    id="clinica-nome" 
                    value={clinicaNome} 
                    placeholder="Ex: Clínica PediaCare"
                    onChange={(e) => setClinicaNome(e.target.value)} 
                    className="transition-all focus:border-primary/30 focus:shadow-sm"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="transition-all focus:border-primary/30 focus:shadow-sm"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 py-3">
              <Button 
                className="btn-hover"
                onClick={salvarAlteracoes}
                disabled={salvando}
              >
                {salvando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : "Salvar Alterações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="conta" className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader className="card-header-highlight">
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>
                Altere sua senha e gerencie as configurações de segurança.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="senha-atual">Senha Atual</Label>
                  <Input 
                    id="senha-atual" 
                    type="password" 
                    value={senhaAtual} 
                    onChange={(e) => setSenhaAtual(e.target.value)} 
                    className="transition-all focus:border-primary/30 focus:shadow-sm"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="nova-senha">Nova Senha</Label>
                  <Input 
                    id="nova-senha" 
                    type="password" 
                    value={novaSenha} 
                    onChange={(e) => setNovaSenha(e.target.value)} 
                    className="transition-all focus:border-primary/30 focus:shadow-sm"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
                  <Input 
                    id="confirmar-senha" 
                    type="password" 
                    value={confirmarSenha} 
                    onChange={(e) => setConfirmarSenha(e.target.value)} 
                    className="transition-all focus:border-primary/30 focus:shadow-sm"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 py-3">
              <Button 
                className="btn-hover"
                onClick={alterarSenha}
                disabled={alterandoSenha}
              >
                {alterandoSenha ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Alterando...
                  </>
                ) : "Alterar Senha"}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="animate-fade-in">
            <CardHeader className="card-header-highlight">
              <CardTitle>Gerenciamento da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <Button variant="outline" className="w-full sm:w-auto btn-hover">
                Exportar Dados
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto btn-hover">
                    Excluir Conta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                      e todos os dados associados a ela.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="btn-hover">Cancelar</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90 btn-hover">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notificacoes">
          <Card className="animate-fade-in">
            <CardHeader className="card-header-highlight">
              <CardTitle>Preferências de Notificações</CardTitle>
              <CardDescription>
                Configure como deseja receber notificações da plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
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
            <CardFooter className="border-t bg-muted/20 py-3">
              <Button 
                className="btn-hover"
                onClick={salvarPreferencias}
              >
                Salvar Preferências
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="aparencia">
          {/* Importar novo componente de aparência */}
          <AparenciaTab />
        </TabsContent>
        
        <TabsContent value="colaboradores">
          <Card className="animate-fade-in">
            <CardHeader className="card-header-highlight">
              <CardTitle>Colaboradores</CardTitle>
              <CardDescription>
                Adicione ou remova usuários com acesso ao seu sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="btn-hover">
                    Adicionar Colaborador
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Colaborador</DialogTitle>
                    <DialogDescription>
                      Insira o email da pessoa que você deseja convidar para colaborar.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-colaborador">Email</Label>
                      <Input
                        id="email-colaborador"
                        type="email"
                        placeholder="colaborador@exemplo.com"
                        value={novoColaborador.email}
                        onChange={(e) => setNovoColaborador({...novoColaborador, email: e.target.value})}
                        className="transition-all focus:border-primary/30 focus:shadow-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="permissao">Permissões</Label>
                      <select
                        id="permissao"
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={novoColaborador.permissao}
                        onChange={(e) => setNovoColaborador({...novoColaborador, permissao: e.target.value as any})}
                      >
                        <option value="visualizar">Visualizar (somente leitura)</option>
                        <option value="editar">Editor (criar e editar)</option>
                        <option value="admin">Administrador (acesso completo)</option>
                      </select>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setNovoColaborador({email: '', permissao: 'visualizar'})}>
                      Cancelar
                    </Button>
                    <Button type="submit" onClick={adicionarColaborador} className="btn-hover">
                      Enviar Convite
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Permissão</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Nenhum colaborador adicionado.
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
