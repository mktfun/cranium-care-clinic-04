
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { settingsStorage, PerfilSettings, NotificacaoSettings } from "@/services/localStorageService";

export function PerfilTab() {
  const [usuario, setUsuario] = useState<PerfilSettings>({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
  });
  
  const [notificacoes, setNotificacoes] = useState<NotificacaoSettings>({
    email: true,
    browser: true,
    novosLeads: true,
    agendamentos: true,
    ordensCompletas: true
  });
  
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [salvandoNotificacoes, setSalvandoNotificacoes] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Carregar dados
  useEffect(() => {
    try {
      const settings = settingsStorage.getAll();
      setUsuario(settings.perfil.usuario);
      setNotificacoes(settings.perfil.notificacoes);
      setCarregando(false);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações de perfil");
      setCarregando(false);
    }
  }, []);
  
  // Salvar dados do perfil
  const salvarPerfil = async () => {
    if (!usuario.nome || !usuario.email) {
      toast.error("Nome e email são obrigatórios");
      return;
    }
    
    try {
      setSalvandoPerfil(true);
      
      settingsStorage.updateSection('perfil', {
        usuario: {
          ...usuario,
        }
      });
      
      toast.success("Perfil atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setSalvandoPerfil(false);
    }
  };
  
  // Alterar senha
  const alterarSenha = async () => {
    if (novaSenha.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    try {
      setAlterandoSenha(true);
      
      // Simulação de alteração de senha - em um app real, isso seria feito com uma API
      setTimeout(() => {
        toast.success("Senha alterada com sucesso");
        setSenhaAtual("");
        setNovaSenha("");
        setConfirmarSenha("");
        setAlterandoSenha(false);
      }, 1000);
      
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast.error("Erro ao alterar senha");
      setAlterandoSenha(false);
    }
  };
  
  // Salvar preferências de notificação
  const salvarNotificacoes = async () => {
    try {
      setSalvandoNotificacoes(true);
      
      settingsStorage.updateSection('perfil', {
        notificacoes
      });
      
      toast.success("Preferências de notificação salvas com sucesso");
    } catch (error) {
      console.error("Erro ao salvar preferências:", error);
      toast.error("Erro ao salvar preferências de notificação");
    } finally {
      setSalvandoNotificacoes(false);
    }
  };
  
  // Upload de avatar
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploadingAvatar(true);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        setUsuario(prev => ({
          ...prev,
          avatar: base64String
        }));
        
        // Salvar no localStorage
        settingsStorage.updateSection('perfil', {
          usuario: {
            ...usuario,
            avatar: base64String
          }
        });
        
        toast.success("Foto de perfil atualizada com sucesso");
        setUploadingAvatar(false);
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      toast.error("Erro ao atualizar foto de perfil");
      setUploadingAvatar(false);
    }
  };
  
  // Remover avatar
  const removerAvatar = () => {
    try {
      setUploadingAvatar(true);
      
      setUsuario(prev => ({
        ...prev,
        avatar: undefined
      }));
      
      settingsStorage.updateSection('perfil', {
        usuario: {
          ...usuario,
          avatar: undefined
        }
      });
      
      toast.success("Foto de perfil removida com sucesso");
    } catch (error) {
      console.error("Erro ao remover foto:", error);
      toast.error("Erro ao remover foto de perfil");
    } finally {
      setUploadingAvatar(false);
    }
  };
  
  if (carregando) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Perfil</h3>
        <p className="text-sm text-muted-foreground">
          Atualize suas informações pessoais e foto de perfil
        </p>
      </div>
      
      <Separator />
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Avatar className="h-24 w-24 border-2 border-primary/20">
          <AvatarImage src={usuario.avatar} />
          <AvatarFallback className="text-2xl">
            {usuario.nome ? usuario.nome.charAt(0).toUpperCase() : "U"}
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
            className="mr-2"
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
            className="text-destructive"
            onClick={removerAvatar}
            disabled={!usuario.avatar || uploadingAvatar}
          >
            Remover
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input 
              id="nome" 
              value={usuario.nome} 
              onChange={(e) => setUsuario({...usuario, nome: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo</Label>
            <Input 
              id="cargo" 
              value={usuario.cargo} 
              onChange={(e) => setUsuario({...usuario, cargo: e.target.value})}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              value={usuario.email} 
              onChange={(e) => setUsuario({...usuario, email: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input 
              id="telefone" 
              value={usuario.telefone} 
              onChange={(e) => setUsuario({...usuario, telefone: e.target.value})}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={salvarPerfil}
            disabled={salvandoPerfil}
          >
            {salvandoPerfil ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : "Salvar Perfil"}
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Alteração de Senha</h3>
        <p className="text-sm text-muted-foreground">
          Altere sua senha para manter sua conta segura
        </p>
      </div>
      
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="senha-atual">Senha Atual</Label>
          <Input 
            id="senha-atual" 
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nova-senha">Nova Senha</Label>
            <Input 
              id="nova-senha" 
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
            <Input 
              id="confirmar-senha" 
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
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
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Preferências de Notificações</h3>
        <p className="text-sm text-muted-foreground">
          Configure como deseja receber notificações da plataforma
        </p>
      </div>
      
      <div className="grid gap-6 py-4">
        <div>
          <h4 className="text-sm font-medium mb-3">Canais de Notificação</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notificacoes-email">Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receba atualizações importantes por email
                </p>
              </div>
              <Switch 
                id="notificacoes-email"
                checked={notificacoes.email}
                onCheckedChange={(checked) => setNotificacoes({...notificacoes, email: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notificacoes-browser">Notificações no Navegador</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações em tempo real no navegador
                </p>
              </div>
              <Switch 
                id="notificacoes-browser"
                checked={notificacoes.browser}
                onCheckedChange={(checked) => setNotificacoes({...notificacoes, browser: checked})}
              />
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-3">Tipos de Notificação</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notificacoes-leads">Novos Leads</Label>
              <Switch 
                id="notificacoes-leads"
                checked={notificacoes.novosLeads}
                onCheckedChange={(checked) => setNotificacoes({...notificacoes, novosLeads: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="notificacoes-agendamentos">Agendamentos</Label>
              <Switch 
                id="notificacoes-agendamentos"
                checked={notificacoes.agendamentos}
                onCheckedChange={(checked) => setNotificacoes({...notificacoes, agendamentos: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="notificacoes-ordens">Ordens de Serviço Concluídas</Label>
              <Switch 
                id="notificacoes-ordens"
                checked={notificacoes.ordensCompletas}
                onCheckedChange={(checked) => setNotificacoes({...notificacoes, ordensCompletas: checked})}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={salvarNotificacoes}
            disabled={salvandoNotificacoes}
          >
            {salvandoNotificacoes ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : "Salvar Preferências"}
          </Button>
        </div>
      </div>
    </div>
  );
}
