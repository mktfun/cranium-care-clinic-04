
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, UserPlus, Mail, X, Check, Info } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  permissao: "admin" | "editor" | "visualizador";
  status: "ativo" | "pendente" | "inativo";
}

export function ColaboradoresTab() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [novoColaborador, setNovoColaborador] = useState({ nome: "", email: "", permissao: "visualizador" });
  const [exibirFormulario, setExibirFormulario] = useState(false);
  const [visualizandoColaborador, setVisualizandoColaborador] = useState<Colaborador | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // Usar dados mockados sempre
  useEffect(() => {
    const fetchColaboradores = async () => {
      setCarregando(true);
      try {
        // Usar dados mockados
        setColaboradores([
          { 
            id: "1", 
            nome: "Admin Principal", 
            email: "admin@exemplo.com", 
            permissao: "admin", 
            status: "ativo" 
          },
          { 
            id: "2", 
            nome: "Maria Silva", 
            email: "maria@exemplo.com", 
            permissao: "editor", 
            status: "ativo" 
          },
          { 
            id: "3", 
            nome: "João Pereira", 
            email: "joao@exemplo.com", 
            permissao: "visualizador", 
            status: "pendente" 
          }
        ]);
      } catch (error) {
        console.error("Erro:", error);
        // Use dados mockados em caso de erro
        setColaboradores([
          { 
            id: "1", 
            nome: "Admin Principal", 
            email: "admin@exemplo.com", 
            permissao: "admin", 
            status: "ativo" 
          },
          { 
            id: "2", 
            nome: "Maria Silva", 
            email: "maria@exemplo.com", 
            permissao: "editor", 
            status: "ativo" 
          },
          { 
            id: "3", 
            nome: "João Pereira", 
            email: "joao@exemplo.com", 
            permissao: "visualizador", 
            status: "pendente" 
          }
        ]);
      } finally {
        setCarregando(false);
      }
    };

    fetchColaboradores();
  }, []);

  const handleConvidarColaborador = async () => {
    if (!novoColaborador.nome || !novoColaborador.email) {
      toast.error("Preencha nome e email do colaborador");
      return;
    }

    try {
      // Simular envio de convite
      const novoId = Math.random().toString(36).substring(2, 11);
      
      const novoColab: Colaborador = {
        id: novoId,
        nome: novoColaborador.nome,
        email: novoColaborador.email,
        permissao: novoColaborador.permissao as "admin" | "editor" | "visualizador",
        status: "pendente"
      };
      
      setColaboradores([...colaboradores, novoColab]);
      setNovoColaborador({ nome: "", email: "", permissao: "visualizador" });
      setExibirFormulario(false);
      
      toast.success("Convite enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar convite:", error);
      toast.error("Erro ao enviar convite. Tente novamente.");
    }
  };

  const handleReenviarConvite = (id: string) => {
    toast.success("Convite reenviado com sucesso!");
  };

  const handleCancelarConvite = (id: string) => {
    setColaboradores(colaboradores.filter(col => col.id !== id));
    toast.success("Convite cancelado com sucesso!");
  };

  const handleViewColaboradorDetails = (colaborador: Colaborador) => {
    setVisualizandoColaborador(colaborador);
    setDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getPermissaoLabel = (permissao: string) => {
    switch(permissao) {
      case "admin": return "Administrador";
      case "editor": return "Editor";
      case "visualizador": return "Visualizador";
      default: return permissao;
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "ativo": return "Ativo";
      case "pendente": return "Pendente";
      case "inativo": return "Inativo";
      default: return status;
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <CardTitle>Colaboradores</CardTitle>
              <CardDescription>Gerencie o acesso de colaboradores à sua clínica</CardDescription>
            </div>
            <Button 
              onClick={() => setExibirFormulario(!exibirFormulario)}
              className="bg-turquesa hover:bg-turquesa/90"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {isMobile ? "Convidar" : "Convidar Colaborador"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {exibirFormulario && (
            <div className="bg-muted/20 p-4 rounded-lg mb-6 border">
              <h3 className="text-base font-medium mb-3">Novo Colaborador</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input 
                    placeholder="Nome do colaborador" 
                    value={novoColaborador.nome}
                    onChange={(e) => setNovoColaborador({...novoColaborador, nome: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">E-mail</label>
                  <Input 
                    placeholder="email@exemplo.com" 
                    type="email"
                    value={novoColaborador.email}
                    onChange={(e) => setNovoColaborador({...novoColaborador, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Permissão</label>
                  <Select 
                    value={novoColaborador.permissao}
                    onValueChange={(value) => setNovoColaborador({...novoColaborador, permissao: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a permissão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="visualizador">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button 
                    onClick={handleConvidarColaborador}
                    className="bg-turquesa hover:bg-turquesa/90"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Convite
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setExibirFormulario(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {carregando ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : colaboradores.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">Nenhum colaborador encontrado</p>
              <Button 
                onClick={() => setExibirFormulario(true)}
                className="bg-turquesa hover:bg-turquesa/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Colaborador
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {colaboradores.map((colaborador) => (
                <div 
                  key={colaborador.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-lg gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(colaborador.nome)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{colaborador.nome}</p>
                      <p className="text-sm text-muted-foreground">{colaborador.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-auto items-center">
                    <Badge variant={colaborador.status === "ativo" ? "secondary" : colaborador.status === "pendente" ? "outline" : "destructive"}>
                      {colaborador.status === "ativo" ? "Ativo" : colaborador.status === "pendente" ? "Pendente" : "Inativo"}
                    </Badge>
                    
                    <Badge variant="secondary" className="capitalize">
                      {colaborador.permissao === "admin" ? "Administrador" : 
                       colaborador.permissao === "editor" ? "Editor" : "Visualizador"}
                    </Badge>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewColaboradorDetails(colaborador)}
                      >
                        <Info className="h-3.5 w-3.5 mr-1" />
                        <span className="hidden sm:inline">Detalhes</span>
                      </Button>
                      
                      {colaborador.status === "pendente" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReenviarConvite(colaborador.id)}
                          >
                            <Mail className="h-3.5 w-3.5 mr-1" />
                            <span className="hidden sm:inline">Reenviar</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleCancelarConvite(colaborador.id)}
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            <span className="hidden sm:inline">Cancelar</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for collaborator details */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Colaborador</DialogTitle>
            <DialogDescription>
              Informações sobre o colaborador e suas permissões
            </DialogDescription>
          </DialogHeader>
          
          {visualizandoColaborador && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 pb-3 border-b">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{getInitials(visualizandoColaborador.nome)}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-medium text-lg">{visualizandoColaborador.nome}</h3>
                  <p className="text-sm text-muted-foreground">{visualizandoColaborador.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                  <Badge variant={visualizandoColaborador.status === "ativo" ? "secondary" : visualizandoColaborador.status === "pendente" ? "outline" : "destructive"}>
                    {getStatusLabel(visualizandoColaborador.status)}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Permissão</h4>
                  <Badge variant="secondary">
                    {getPermissaoLabel(visualizandoColaborador.permissao)}
                  </Badge>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t">
                <h4 className="text-sm font-medium mb-2">Descrição das Permissões</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  {visualizandoColaborador.permissao === "admin" && (
                    <p>Acesso total ao sistema, incluindo gerenciamento de colaboradores, pacientes e configurações da clínica.</p>
                  )}
                  {visualizandoColaborador.permissao === "editor" && (
                    <p>Pode criar e editar registros de pacientes e medições, mas não tem acesso às configurações administrativas.</p>
                  )}
                  {visualizandoColaborador.permissao === "visualizador" && (
                    <p>Acesso somente para visualização de pacientes e medições, sem permissão para criar ou editar registros.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
