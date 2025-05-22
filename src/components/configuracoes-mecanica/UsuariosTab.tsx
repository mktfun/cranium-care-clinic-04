
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Pencil, Trash, User, Search, Shield } from "lucide-react";
import { toast } from "sonner";
import { settingsStorage, Usuario } from "@/services/localStorageService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function UsuariosTab() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioAtual, setUsuarioAtual] = useState<Usuario>({
    id: "",
    nome: "",
    email: "",
    cargo: "",
    permissoes: [],
    criadoEm: ""
  });
  
  const [filtro, setFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [modoEdicao, setModoEdicao] = useState<"adicionar" | "editar">("adicionar");
  const [dialogoAberto, setDialogoAberto] = useState(false);
  
  const permissoesDisponiveis = [
    { id: 'dashboard', nome: 'Dashboard' },
    { id: 'clientes', nome: 'Clientes' },
    { id: 'ordens_servico', nome: 'Ordens de Serviço' },
    { id: 'estoque', nome: 'Estoque' },
    { id: 'financeiro', nome: 'Financeiro' },
    { id: 'relatorios', nome: 'Relatórios' },
    { id: 'configuracoes', nome: 'Configurações' },
    { id: 'admin', nome: 'Administrador' }
  ];
  
  // Carregar dados
  useEffect(() => {
    try {
      const settings = settingsStorage.getAll();
      
      // Se não houver usuários, criar um usuário administrador padrão
      if (!settings.usuarios || settings.usuarios.length === 0) {
        const adminUser: Usuario = {
          id: `user-${Date.now()}`,
          nome: "Administrador",
          email: "admin@mecanicapro.com",
          cargo: "Administrador",
          permissoes: ["admin"],
          criadoEm: new Date().toISOString()
        };
        
        // Salvar no localStorage
        settingsStorage.updateSection('usuarios', [adminUser]);
        
        setUsuarios([adminUser]);
      } else {
        setUsuarios(settings.usuarios);
      }
      
      setCarregando(false);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários");
      setCarregando(false);
    }
  }, []);
  
  // Abrir diálogo para adicionar novo usuário
  const abrirDialogoAdicionarUsuario = () => {
    setUsuarioAtual({
      id: "",
      nome: "",
      email: "",
      cargo: "",
      permissoes: [],
      criadoEm: ""
    });
    setModoEdicao("adicionar");
    setDialogoAberto(true);
  };
  
  // Abrir diálogo para editar usuário
  const abrirDialogoEditarUsuario = (usuario: Usuario) => {
    setUsuarioAtual({...usuario});
    setModoEdicao("editar");
    setDialogoAberto(true);
  };
  
  // Alternar seleção de permissão
  const alternarPermissao = (permissaoId: string) => {
    setUsuarioAtual(prev => {
      const permissoes = [...prev.permissoes];
      
      // Se permissão "admin" for selecionada, dar todas as permissões
      if (permissaoId === "admin") {
        if (permissoes.includes("admin")) {
          // Remover admin e manter apenas outras permissões
          return {
            ...prev,
            permissoes: permissoes.filter(p => p !== "admin")
          };
        } else {
          // Adicionar todas as permissões
          return {
            ...prev,
            permissoes: permissoesDisponiveis.map(p => p.id)
          };
        }
      }
      
      // Verificar se já tem a permissão
      const temPermissao = permissoes.includes(permissaoId);
      
      if (temPermissao) {
        // Se remover uma permissão e tinha "admin", remover "admin" também
        const novasPermissoes = permissoes.filter(p => p !== permissaoId);
        if (permissoes.includes("admin")) {
          return {
            ...prev,
            permissoes: novasPermissoes.filter(p => p !== "admin")
          };
        }
        return {...prev, permissoes: novasPermissoes};
      } else {
        // Adicionar permissão
        return {...prev, permissoes: [...permissoes, permissaoId]};
      }
    });
  };
  
  // Salvar usuário (novo ou editado)
  const salvarUsuario = () => {
    if (!usuarioAtual.nome || !usuarioAtual.email) {
      toast.error("Nome e email são obrigatórios");
      return;
    }
    
    try {
      setSalvando(true);
      
      let novosUsuarios: Usuario[];
      
      if (modoEdicao === "adicionar") {
        // Adicionar novo usuário
        const novoUsuario = {
          ...usuarioAtual,
          id: `user-${Date.now()}`,
          criadoEm: new Date().toISOString()
        };
        
        novosUsuarios = [...usuarios, novoUsuario];
      } else {
        // Atualizar usuário existente
        novosUsuarios = usuarios.map(u => 
          u.id === usuarioAtual.id ? {...usuarioAtual, ultimoAcesso: u.ultimoAcesso} : u
        );
      }
      
      // Salvar no localStorage
      settingsStorage.updateSection('usuarios', novosUsuarios);
      
      // Atualizar estado
      setUsuarios(novosUsuarios);
      setDialogoAberto(false);
      
      toast.success(modoEdicao === "adicionar" ? "Usuário adicionado com sucesso" : "Usuário atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      toast.error("Erro ao salvar usuário");
    } finally {
      setSalvando(false);
    }
  };
  
  // Remover usuário
  const removerUsuario = (id: string) => {
    // Verificar se é o único usuário admin
    const usuario = usuarios.find(u => u.id === id);
    const outrosAdmins = usuarios.filter(u => u.id !== id && u.permissoes.includes("admin")).length > 0;
    
    if (usuario?.permissoes.includes("admin") && !outrosAdmins) {
      toast.error("Não é possível remover o único usuário administrador");
      return;
    }
    
    try {
      // Confirmar remoção
      if (confirm("Tem certeza que deseja remover este usuário?")) {
        // Remover usuário
        const novosUsuarios = usuarios.filter(u => u.id !== id);
        
        // Salvar no localStorage
        settingsStorage.updateSection('usuarios', novosUsuarios);
        
        // Atualizar estado
        setUsuarios(novosUsuarios);
        
        toast.success("Usuário removido com sucesso");
      }
    } catch (error) {
      console.error("Erro ao remover usuário:", error);
      toast.error("Erro ao remover usuário");
    }
  };
  
  // Filtrar usuários
  const usuariosFiltrados = usuarios.filter(usuario => 
    usuario.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    usuario.email.toLowerCase().includes(filtro.toLowerCase()) ||
    usuario.cargo.toLowerCase().includes(filtro.toLowerCase())
  );
  
  // Formatar data
  const formatarData = (dataString: string) => {
    if (!dataString) return "";
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR");
  };
  
  // Obter iniciais para avatar
  const obterIniciais = (nome: string) => {
    return nome
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Gerenciamento de Usuários</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os usuários do sistema e suas permissões
          </p>
        </div>
        
        <Button onClick={abrirDialogoAdicionarUsuario}>
          <Plus className="h-4 w-4 mr-2" /> Novo Usuário
        </Button>
      </div>
      
      <div className="flex items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, email ou cargo..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        {usuariosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-4">
              {filtro ? "Nenhum usuário encontrado para esta busca." : "Nenhum usuário cadastrado."}
            </p>
            {!filtro && (
              <Button onClick={abrirDialogoAdicionarUsuario}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar Usuário
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usuariosFiltrados.map(usuario => (
              <div 
                key={usuario.id} 
                className="border rounded-lg p-4 flex justify-between hover:bg-slate-50"
              >
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={usuario.avatar} />
                    <AvatarFallback>
                      {obterIniciais(usuario.nome)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{usuario.nome}</h4>
                      {usuario.permissoes.includes("admin") && (
                        <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
                          <Shield className="h-3 w-3" />
                          <span>Admin</span>
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{usuario.email}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs">{usuario.cargo}</p>
                      <p className="text-xs text-muted-foreground">
                        Criado em {formatarData(usuario.criadoEm)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="px-3"
                    onClick={() => abrirDialogoEditarUsuario(usuario)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="px-3 text-red-500 hover:text-red-600"
                    onClick={() => removerUsuario(usuario.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Diálogo de Usuário */}
      <Dialog open={dialogoAberto} onOpenChange={setDialogoAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>{modoEdicao === "adicionar" ? "Adicionar Novo Usuário" : "Editar Usuário"}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input 
                  id="nome"
                  value={usuarioAtual.nome}
                  onChange={(e) => setUsuarioAtual({...usuarioAtual, nome: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input 
                  id="cargo"
                  value={usuarioAtual.cargo}
                  onChange={(e) => setUsuarioAtual({...usuarioAtual, cargo: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                value={usuarioAtual.email}
                onChange={(e) => setUsuarioAtual({...usuarioAtual, email: e.target.value})}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <Label>Permissões</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {permissoesDisponiveis.map((permissao) => (
                  <div key={permissao.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`permissao-${permissao.id}`}
                      checked={usuarioAtual.permissoes.includes(permissao.id)}
                      onCheckedChange={() => alternarPermissao(permissao.id)}
                    />
                    <Label 
                      htmlFor={`permissao-${permissao.id}`}
                      className={permissao.id === "admin" ? "font-medium" : ""}
                    >
                      {permissao.nome}
                    </Label>
                  </div>
                ))}
              </div>
              
              {usuarioAtual.permissoes.includes("admin") && (
                <p className="text-xs text-amber-600 font-medium">
                  Administradores têm acesso completo ao sistema
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarUsuario} disabled={salvando}>
              {salvando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : modoEdicao === "adicionar" ? "Adicionar" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
