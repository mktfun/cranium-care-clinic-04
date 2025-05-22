
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { settingsStorage, Unidade, HorariosSemana } from "@/services/localStorageService";
import { ScrollArea } from "@/components/ui/scroll-area";

export function UnidadesTab() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [editandoUnidade, setEditandoUnidade] = useState<Unidade | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [adicionando, setAdicionando] = useState(false);
  
  // Modelo para nova unidade
  const unidadeVazia: Unidade = {
    id: "",
    nome: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    telefone: "",
    email: "",
    principal: false,
    horarios: {
      segunda: { abrir: "08:00", fechar: "18:00", fechado: false },
      terca: { abrir: "08:00", fechar: "18:00", fechado: false },
      quarta: { abrir: "08:00", fechar: "18:00", fechado: false },
      quinta: { abrir: "08:00", fechar: "18:00", fechado: false },
      sexta: { abrir: "08:00", fechar: "18:00", fechado: false },
      sabado: { abrir: "08:00", fechar: "12:00", fechado: false },
      domingo: { abrir: "", fechar: "", fechado: true }
    },
    criadoEm: new Date().toISOString()
  };
  
  // Carregar dados
  useEffect(() => {
    try {
      const settings = settingsStorage.getAll();
      setUnidades(settings.unidades || []);
      setCarregando(false);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar unidades");
      setCarregando(false);
    }
  }, []);
  
  // Adicionar nova unidade
  const iniciarAdicionarUnidade = () => {
    setAdicionando(true);
    setEditandoUnidade({
      ...unidadeVazia,
      id: `unit-${Date.now()}`
    });
  };
  
  // Editar unidade existente
  const iniciarEditarUnidade = (unidade: Unidade) => {
    setEditandoUnidade({...unidade});
    setAdicionando(false);
  };
  
  // Cancelar edição/adição
  const cancelarEdicao = () => {
    setEditandoUnidade(null);
    setAdicionando(false);
  };
  
  // Salvar unidade (nova ou editada)
  const salvarUnidade = () => {
    if (!editandoUnidade) return;
    
    if (!editandoUnidade.nome || !editandoUnidade.endereco) {
      toast.error("Nome e endereço são obrigatórios");
      return;
    }
    
    try {
      setSalvando(true);
      
      let novasUnidades: Unidade[];
      
      if (adicionando) {
        // Adicionar nova unidade
        const novaUnidade = {
          ...editandoUnidade,
          criadoEm: new Date().toISOString()
        };
        
        // Se for a primeira unidade ou marcada como principal
        if (novaUnidade.principal || unidades.length === 0) {
          // Desmarcar outras unidades
          novasUnidades = unidades.map(u => ({
            ...u,
            principal: false
          }));
          
          // Garantir que esta seja principal
          novaUnidade.principal = true;
        } else {
          novasUnidades = [...unidades];
        }
        
        // Adicionar a nova unidade
        novasUnidades.push(novaUnidade);
      } else {
        // Atualizar unidade existente
        const unidadeAtualizada = {
          ...editandoUnidade,
          atualizadoEm: new Date().toISOString()
        };
        
        // Se marcada como principal
        if (unidadeAtualizada.principal) {
          // Desmarcar outras unidades
          novasUnidades = unidades.map(u => ({
            ...u,
            principal: u.id === unidadeAtualizada.id
          }));
        } else {
          // Verificar se era a principal
          const eraPrincipal = unidades.find(u => u.id === unidadeAtualizada.id)?.principal;
          
          if (eraPrincipal) {
            toast.error("Não é possível remover a marcação de unidade principal. Defina outra unidade como principal primeiro.");
            setSalvando(false);
            return;
          }
          
          // Substituir unidade antiga pela atualizada
          novasUnidades = unidades.map(u => 
            u.id === unidadeAtualizada.id ? unidadeAtualizada : u
          );
        }
      }
      
      // Salvar no localStorage
      settingsStorage.updateSection('unidades', novasUnidades);
      
      // Atualizar estado
      setUnidades(novasUnidades);
      setEditandoUnidade(null);
      setAdicionando(false);
      
      toast.success(adicionando ? "Unidade adicionada com sucesso" : "Unidade atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao salvar unidade:", error);
      toast.error("Erro ao salvar unidade");
    } finally {
      setSalvando(false);
    }
  };
  
  // Definir unidade como principal
  const definirComoPrincipal = (id: string) => {
    try {
      // Atualizar unidades
      const novasUnidades = unidades.map(unidade => ({
        ...unidade,
        principal: unidade.id === id
      }));
      
      // Salvar no localStorage
      settingsStorage.updateSection('unidades', novasUnidades);
      
      // Atualizar estado
      setUnidades(novasUnidades);
      
      toast.success("Unidade principal definida com sucesso");
    } catch (error) {
      console.error("Erro ao definir unidade principal:", error);
      toast.error("Erro ao definir unidade principal");
    }
  };
  
  // Remover unidade
  const removerUnidade = (id: string) => {
    // Verificar se é a unidade principal
    const unidade = unidades.find(u => u.id === id);
    if (!unidade) return;
    
    if (unidade.principal) {
      toast.error("Não é possível remover a unidade principal. Defina outra unidade como principal primeiro.");
      return;
    }
    
    try {
      // Confirmar remoção
      if (confirm("Tem certeza que deseja remover esta unidade?")) {
        // Remover unidade
        const novasUnidades = unidades.filter(u => u.id !== id);
        
        // Salvar no localStorage
        settingsStorage.updateSection('unidades', novasUnidades);
        
        // Atualizar estado
        setUnidades(novasUnidades);
        
        toast.success("Unidade removida com sucesso");
      }
    } catch (error) {
      console.error("Erro ao remover unidade:", error);
      toast.error("Erro ao remover unidade");
    }
  };
  
  // Renderizar dias da semana para configuração de horários
  const renderizarHorarios = () => {
    if (!editandoUnidade) return null;
    
    const diasSemana = [
      { key: 'segunda', label: 'Segunda-feira' },
      { key: 'terca', label: 'Terça-feira' },
      { key: 'quarta', label: 'Quarta-feira' },
      { key: 'quinta', label: 'Quinta-feira' },
      { key: 'sexta', label: 'Sexta-feira' },
      { key: 'sabado', label: 'Sábado' },
      { key: 'domingo', label: 'Domingo' }
    ] as const;
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium">Horário de Funcionamento</h4>
        
        {diasSemana.map(dia => (
          <div key={dia.key} className="flex items-center justify-between gap-4">
            <div className="w-32 min-w-[8rem]">
              <Label>{dia.label}</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={!editandoUnidade.horarios[dia.key].fechado}
                  onCheckedChange={(checked) => {
                    setEditandoUnidade(prev => {
                      if (!prev) return prev;
                      const novoHorarios = {...prev.horarios};
                      novoHorarios[dia.key].fechado = !checked;
                      return {...prev, horarios: novoHorarios};
                    });
                  }}
                />
                <Label>{editandoUnidade.horarios[dia.key].fechado ? "Fechado" : "Aberto"}</Label>
              </div>
              
              {!editandoUnidade.horarios[dia.key].fechado && (
                <div className="flex items-center gap-2">
                  <Input 
                    type="time"
                    className="w-24"
                    value={editandoUnidade.horarios[dia.key].abrir}
                    onChange={(e) => {
                      setEditandoUnidade(prev => {
                        if (!prev) return prev;
                        const novoHorarios = {...prev.horarios};
                        novoHorarios[dia.key].abrir = e.target.value;
                        return {...prev, horarios: novoHorarios};
                      });
                    }}
                  />
                  <span>às</span>
                  <Input 
                    type="time"
                    className="w-24"
                    value={editandoUnidade.horarios[dia.key].fechar}
                    onChange={(e) => {
                      setEditandoUnidade(prev => {
                        if (!prev) return prev;
                        const novoHorarios = {...prev.horarios};
                        novoHorarios[dia.key].fechar = e.target.value;
                        return {...prev, horarios: novoHorarios};
                      });
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const formatarHorario = (horario: HorariosSemana, dia: keyof HorariosSemana) => {
    if (horario[dia].fechado) return "Fechado";
    return `${horario[dia].abrir} - ${horario[dia].fechar}`;
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
          <h3 className="text-lg font-medium">Unidades</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as unidades da sua oficina mecânica
          </p>
        </div>
        
        {!editandoUnidade && (
          <Button onClick={iniciarAdicionarUnidade}>
            <Plus className="h-4 w-4 mr-2" /> Nova Unidade
          </Button>
        )}
      </div>
      
      <Separator />
      
      {editandoUnidade ? (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">{adicionando ? "Adicionar Nova Unidade" : "Editar Unidade"}</h3>
          
          <div className="grid gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Unidade</Label>
                <Input 
                  id="nome"
                  value={editandoUnidade.nome}
                  onChange={(e) => setEditandoUnidade({...editandoUnidade, nome: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input 
                  id="telefone"
                  value={editandoUnidade.telefone}
                  onChange={(e) => setEditandoUnidade({...editandoUnidade, telefone: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                value={editandoUnidade.email}
                onChange={(e) => setEditandoUnidade({...editandoUnidade, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input 
                id="endereco"
                value={editandoUnidade.endereco}
                onChange={(e) => setEditandoUnidade({...editandoUnidade, endereco: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input 
                  id="cidade"
                  value={editandoUnidade.cidade}
                  onChange={(e) => setEditandoUnidade({...editandoUnidade, cidade: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input 
                  id="estado"
                  value={editandoUnidade.estado}
                  onChange={(e) => setEditandoUnidade({...editandoUnidade, estado: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input 
                  id="cep"
                  value={editandoUnidade.cep}
                  onChange={(e) => setEditandoUnidade({...editandoUnidade, cep: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                id="principal"
                checked={editandoUnidade.principal}
                onCheckedChange={(checked) => setEditandoUnidade({...editandoUnidade, principal: checked})}
                disabled={editandoUnidade.principal && !adicionando}
              />
              <Label htmlFor="principal">Unidade principal</Label>
            </div>
            
            <Separator />
            
            <ScrollArea className="h-[300px]">
              {renderizarHorarios()}
            </ScrollArea>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelarEdicao}>
                Cancelar
              </Button>
              <Button onClick={salvarUnidade} disabled={salvando}>
                {salvando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : adicionando ? "Adicionar Unidade" : "Salvar Alterações"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {unidades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-4">
                Nenhuma unidade cadastrada. Adicione a primeira unidade da sua oficina.
              </p>
              <Button onClick={iniciarAdicionarUnidade}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar Primeira Unidade
              </Button>
            </div>
          ) : (
            unidades.map(unidade => (
              <Card key={unidade.id} className={unidade.principal ? "border-primary" : ""}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-medium">{unidade.nome}</h4>
                        {unidade.principal && (
                          <Badge>Principal</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <p>{unidade.endereco}</p>
                        <p>{unidade.cidade}, {unidade.estado} - {unidade.cep}</p>
                        <p className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4" />
                          <span>Segunda a Sexta: {formatarHorario(unidade.horarios, 'segunda')}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="h-4 w-4 opacity-0" />
                          <span>Sábado: {formatarHorario(unidade.horarios, 'sabado')}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="h-4 w-4 opacity-0" />
                          <span>Domingo: {formatarHorario(unidade.horarios, 'domingo')}</span>
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm pt-1">
                        <p>Tel: {unidade.telefone}</p>
                        <p>Email: {unidade.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex md:flex-col gap-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => iniciarEditarUnidade(unidade)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span>Editar</span>
                      </Button>
                      
                      {!unidade.principal && (
                        <>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => definirComoPrincipal(unidade.id)}
                          >
                            <Check className="h-4 w-4" />
                            <span>Definir Principal</span>
                          </Button>
                          
                          <Button 
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2 text-red-500 hover:text-red-600"
                            onClick={() => removerUnidade(unidade.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span>Remover</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
