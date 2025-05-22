
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { settingsStorage, ServicoOfertado, CategoriaVeiculo, TaxaImposto } from "@/services/localStorageService";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function NegocioTab() {
  const [servicos, setServicos] = useState<ServicoOfertado[]>([]);
  const [categorias, setCategorias] = useState<CategoriaVeiculo[]>([]);
  const [taxas, setTaxas] = useState<TaxaImposto[]>([]);
  const [termos, setTermos] = useState("");
  
  const [carregando, setCarregando] = useState(true);
  const [salvandoServico, setSalvandoServico] = useState(false);
  const [salvandoCategoria, setSalvandoCategoria] = useState(false);
  const [salvandoTaxa, setSalvandoTaxa] = useState(false);
  const [salvandoTermos, setSalvandoTermos] = useState(false);
  
  // Diálogos de edição
  const [dialogoServicoAberto, setDialogoServicoAberto] = useState(false);
  const [dialogoCategoriaAberto, setDialogoCategoriaAberto] = useState(false);
  const [dialogoTaxaAberto, setDialogoTaxaAberto] = useState(false);
  
  // Item em edição
  const [servicoAtual, setServicoAtual] = useState<ServicoOfertado>({
    id: "",
    nome: "",
    descricao: "",
    preco: 0,
    tempoEstimado: 0
  });
  
  const [categoriaAtual, setCategoriaAtual] = useState<CategoriaVeiculo>({
    id: "",
    nome: "",
    descricao: ""
  });
  
  const [taxaAtual, setTaxaAtual] = useState<TaxaImposto>({
    id: "",
    nome: "",
    percentual: 0,
    aplicavelA: []
  });
  
  const [modoEdicao, setModoEdicao] = useState<"adicionar" | "editar">("adicionar");
  
  // Carregar dados
  useEffect(() => {
    try {
      const settings = settingsStorage.getAll();
      
      if (settings.negocio) {
        setServicos(settings.negocio.servicos || []);
        setCategorias(settings.negocio.categorias || []);
        setTaxas(settings.negocio.taxas || []);
        setTermos(settings.negocio.termos || "");
      }
      
      setCarregando(false);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações");
      setCarregando(false);
    }
  }, []);
  
  // ===== SERVIÇOS =====
  
  // Abrir diálogo para adicionar novo serviço
  const abrirDialogoAdicionarServico = () => {
    setServicoAtual({
      id: "",
      nome: "",
      descricao: "",
      preco: 0,
      tempoEstimado: 0
    });
    setModoEdicao("adicionar");
    setDialogoServicoAberto(true);
  };
  
  // Abrir diálogo para editar serviço
  const abrirDialogoEditarServico = (servico: ServicoOfertado) => {
    setServicoAtual({...servico});
    setModoEdicao("editar");
    setDialogoServicoAberto(true);
  };
  
  // Salvar serviço (novo ou editado)
  const salvarServico = () => {
    if (!servicoAtual.nome) {
      toast.error("O nome do serviço é obrigatório");
      return;
    }
    
    try {
      setSalvandoServico(true);
      
      let novosServicos: ServicoOfertado[];
      
      if (modoEdicao === "adicionar") {
        // Adicionar novo serviço
        const novoServico = {
          ...servicoAtual,
          id: `service-${Date.now()}`
        };
        
        novosServicos = [...servicos, novoServico];
      } else {
        // Atualizar serviço existente
        novosServicos = servicos.map(s => 
          s.id === servicoAtual.id ? servicoAtual : s
        );
      }
      
      // Salvar no localStorage
      settingsStorage.updateSection('negocio', {
        servicos: novosServicos
      });
      
      // Atualizar estado
      setServicos(novosServicos);
      setDialogoServicoAberto(false);
      
      toast.success(modoEdicao === "adicionar" ? "Serviço adicionado com sucesso" : "Serviço atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      toast.error("Erro ao salvar serviço");
    } finally {
      setSalvandoServico(false);
    }
  };
  
  // Remover serviço
  const removerServico = (id: string) => {
    try {
      // Confirmar remoção
      if (confirm("Tem certeza que deseja remover este serviço?")) {
        // Remover serviço
        const novosServicos = servicos.filter(s => s.id !== id);
        
        // Salvar no localStorage
        settingsStorage.updateSection('negocio', {
          servicos: novosServicos
        });
        
        // Atualizar estado
        setServicos(novosServicos);
        
        toast.success("Serviço removido com sucesso");
      }
    } catch (error) {
      console.error("Erro ao remover serviço:", error);
      toast.error("Erro ao remover serviço");
    }
  };
  
  // ===== CATEGORIAS =====
  
  // Abrir diálogo para adicionar nova categoria
  const abrirDialogoAdicionarCategoria = () => {
    setCategoriaAtual({
      id: "",
      nome: "",
      descricao: ""
    });
    setModoEdicao("adicionar");
    setDialogoCategoriaAberto(true);
  };
  
  // Abrir diálogo para editar categoria
  const abrirDialogoEditarCategoria = (categoria: CategoriaVeiculo) => {
    setCategoriaAtual({...categoria});
    setModoEdicao("editar");
    setDialogoCategoriaAberto(true);
  };
  
  // Salvar categoria (nova ou editada)
  const salvarCategoria = () => {
    if (!categoriaAtual.nome) {
      toast.error("O nome da categoria é obrigatório");
      return;
    }
    
    try {
      setSalvandoCategoria(true);
      
      let novasCategorias: CategoriaVeiculo[];
      
      if (modoEdicao === "adicionar") {
        // Adicionar nova categoria
        const novaCategoria = {
          ...categoriaAtual,
          id: `category-${Date.now()}`
        };
        
        novasCategorias = [...categorias, novaCategoria];
      } else {
        // Atualizar categoria existente
        novasCategorias = categorias.map(c => 
          c.id === categoriaAtual.id ? categoriaAtual : c
        );
      }
      
      // Salvar no localStorage
      settingsStorage.updateSection('negocio', {
        categorias: novasCategorias
      });
      
      // Atualizar estado
      setCategorias(novasCategorias);
      setDialogoCategoriaAberto(false);
      
      toast.success(modoEdicao === "adicionar" ? "Categoria adicionada com sucesso" : "Categoria atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast.error("Erro ao salvar categoria");
    } finally {
      setSalvandoCategoria(false);
    }
  };
  
  // Remover categoria
  const removerCategoria = (id: string) => {
    try {
      // Confirmar remoção
      if (confirm("Tem certeza que deseja remover esta categoria?")) {
        // Remover categoria
        const novasCategorias = categorias.filter(c => c.id !== id);
        
        // Salvar no localStorage
        settingsStorage.updateSection('negocio', {
          categorias: novasCategorias
        });
        
        // Atualizar estado
        setCategorias(novasCategorias);
        
        toast.success("Categoria removida com sucesso");
      }
    } catch (error) {
      console.error("Erro ao remover categoria:", error);
      toast.error("Erro ao remover categoria");
    }
  };
  
  // ===== TAXAS =====
  
  // Abrir diálogo para adicionar nova taxa
  const abrirDialogoAdicionarTaxa = () => {
    setTaxaAtual({
      id: "",
      nome: "",
      percentual: 0,
      aplicavelA: []
    });
    setModoEdicao("adicionar");
    setDialogoTaxaAberto(true);
  };
  
  // Abrir diálogo para editar taxa
  const abrirDialogoEditarTaxa = (taxa: TaxaImposto) => {
    setTaxaAtual({...taxa});
    setModoEdicao("editar");
    setDialogoTaxaAberto(true);
  };
  
  // Salvar taxa (nova ou editada)
  const salvarTaxa = () => {
    if (!taxaAtual.nome) {
      toast.error("O nome da taxa é obrigatório");
      return;
    }
    
    try {
      setSalvandoTaxa(true);
      
      let novasTaxas: TaxaImposto[];
      
      if (modoEdicao === "adicionar") {
        // Adicionar nova taxa
        const novaTaxa = {
          ...taxaAtual,
          id: `tax-${Date.now()}`
        };
        
        novasTaxas = [...taxas, novaTaxa];
      } else {
        // Atualizar taxa existente
        novasTaxas = taxas.map(t => 
          t.id === taxaAtual.id ? taxaAtual : t
        );
      }
      
      // Salvar no localStorage
      settingsStorage.updateSection('negocio', {
        taxas: novasTaxas
      });
      
      // Atualizar estado
      setTaxas(novasTaxas);
      setDialogoTaxaAberto(false);
      
      toast.success(modoEdicao === "adicionar" ? "Taxa adicionada com sucesso" : "Taxa atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao salvar taxa:", error);
      toast.error("Erro ao salvar taxa");
    } finally {
      setSalvandoTaxa(false);
    }
  };
  
  // Remover taxa
  const removerTaxa = (id: string) => {
    try {
      // Confirmar remoção
      if (confirm("Tem certeza que deseja remover esta taxa?")) {
        // Remover taxa
        const novasTaxas = taxas.filter(t => t.id !== id);
        
        // Salvar no localStorage
        settingsStorage.updateSection('negocio', {
          taxas: novasTaxas
        });
        
        // Atualizar estado
        setTaxas(novasTaxas);
        
        toast.success("Taxa removida com sucesso");
      }
    } catch (error) {
      console.error("Erro ao remover taxa:", error);
      toast.error("Erro ao remover taxa");
    }
  };
  
  // ===== TERMOS =====
  
  // Salvar termos
  const salvarTermos = () => {
    try {
      setSalvandoTermos(true);
      
      // Salvar no localStorage
      settingsStorage.updateSection('negocio', {
        termos
      });
      
      toast.success("Termos atualizados com sucesso");
    } catch (error) {
      console.error("Erro ao salvar termos:", error);
      toast.error("Erro ao salvar termos");
    } finally {
      setSalvandoTermos(false);
    }
  };
  
  // Formatar preço
  const formatarPreco = (preco: number) => {
    return preco.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
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
      <Tabs defaultValue="servicos">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="taxas">Taxas e Impostos</TabsTrigger>
          <TabsTrigger value="termos">Termos e Condições</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="servicos" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Serviços Oferecidos</h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie os serviços que sua oficina oferece
                </p>
              </div>
              
              <Button onClick={abrirDialogoAdicionarServico}>
                <Plus className="h-4 w-4 mr-2" /> Novo Serviço
              </Button>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {servicos.length === 0 ? (
                <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    Nenhum serviço cadastrado. Adicione os serviços que sua oficina oferece.
                  </p>
                  <Button onClick={abrirDialogoAdicionarServico}>
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Serviço
                  </Button>
                </div>
              ) : (
                servicos.map(servico => (
                  <Card key={servico.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-medium">{servico.nome}</h4>
                          <p className="text-sm text-muted-foreground">{servico.descricao}</p>
                          <div className="flex gap-4 mt-2">
                            <p className="text-sm"><strong>Preço:</strong> {formatarPreco(servico.preco)}</p>
                            <p className="text-sm"><strong>Tempo:</strong> {servico.tempoEstimado}h</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => abrirDialogoEditarServico(servico)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => removerServico(servico.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="categorias" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Categorias de Veículos</h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie as categorias de veículos que sua oficina atende
                </p>
              </div>
              
              <Button onClick={abrirDialogoAdicionarCategoria}>
                <Plus className="h-4 w-4 mr-2" /> Nova Categoria
              </Button>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorias.length === 0 ? (
                <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    Nenhuma categoria cadastrada. Adicione as categorias de veículos que sua oficina atende.
                  </p>
                  <Button onClick={abrirDialogoAdicionarCategoria}>
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Categoria
                  </Button>
                </div>
              ) : (
                categorias.map(categoria => (
                  <Card key={categoria.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-medium">{categoria.nome}</h4>
                          <p className="text-sm text-muted-foreground">{categoria.descricao}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => abrirDialogoEditarCategoria(categoria)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => removerCategoria(categoria.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="taxas" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Taxas e Impostos</h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie as taxas e impostos aplicáveis aos serviços
                </p>
              </div>
              
              <Button onClick={abrirDialogoAdicionarTaxa}>
                <Plus className="h-4 w-4 mr-2" /> Nova Taxa
              </Button>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {taxas.length === 0 ? (
                <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    Nenhuma taxa cadastrada. Adicione as taxas e impostos aplicáveis aos seus serviços.
                  </p>
                  <Button onClick={abrirDialogoAdicionarTaxa}>
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Taxa
                  </Button>
                </div>
              ) : (
                taxas.map(taxa => (
                  <Card key={taxa.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-medium">{taxa.nome}</h4>
                          <p className="text-sm">Percentual: {taxa.percentual}%</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Aplicável a: {taxa.aplicavelA.join(", ") || "Todos os serviços"}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => abrirDialogoEditarTaxa(taxa)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => removerTaxa(taxa.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="termos" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Termos e Condições</h3>
              <p className="text-sm text-muted-foreground">
                Defina os termos e condições para seus serviços
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="termos">Texto dos Termos e Condições</Label>
                <Textarea 
                  id="termos"
                  value={termos}
                  onChange={(e) => setTermos(e.target.value)}
                  className="min-h-[300px]"
                  placeholder="Digite aqui os termos e condições da sua oficina..."
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={salvarTermos}
                  disabled={salvandoTermos}
                >
                  {salvandoTermos ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : "Salvar Termos"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Diálogo de Serviço */}
      <Dialog open={dialogoServicoAberto} onOpenChange={setDialogoServicoAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modoEdicao === "adicionar" ? "Adicionar Novo Serviço" : "Editar Serviço"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome-servico">Nome do Serviço</Label>
              <Input 
                id="nome-servico"
                value={servicoAtual.nome}
                onChange={(e) => setServicoAtual({...servicoAtual, nome: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descricao-servico">Descrição</Label>
              <Textarea 
                id="descricao-servico"
                value={servicoAtual.descricao}
                onChange={(e) => setServicoAtual({...servicoAtual, descricao: e.target.value})}
                placeholder="Breve descrição do serviço..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco-servico">Preço (R$)</Label>
                <Input 
                  id="preco-servico"
                  type="number"
                  value={servicoAtual.preco}
                  onChange={(e) => setServicoAtual({...servicoAtual, preco: parseFloat(e.target.value) || 0})}
                  min={0}
                  step="0.01"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tempo-servico">Tempo Estimado (horas)</Label>
                <Input 
                  id="tempo-servico"
                  type="number"
                  value={servicoAtual.tempoEstimado}
                  onChange={(e) => setServicoAtual({...servicoAtual, tempoEstimado: parseFloat(e.target.value) || 0})}
                  min={0}
                  step="0.5"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoServicoAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarServico} disabled={salvandoServico}>
              {salvandoServico ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : modoEdicao === "adicionar" ? "Adicionar" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Categoria */}
      <Dialog open={dialogoCategoriaAberto} onOpenChange={setDialogoCategoriaAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modoEdicao === "adicionar" ? "Adicionar Nova Categoria" : "Editar Categoria"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome-categoria">Nome da Categoria</Label>
              <Input 
                id="nome-categoria"
                value={categoriaAtual.nome}
                onChange={(e) => setCategoriaAtual({...categoriaAtual, nome: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descricao-categoria">Descrição</Label>
              <Textarea 
                id="descricao-categoria"
                value={categoriaAtual.descricao}
                onChange={(e) => setCategoriaAtual({...categoriaAtual, descricao: e.target.value})}
                placeholder="Breve descrição da categoria..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoCategoriaAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarCategoria} disabled={salvandoCategoria}>
              {salvandoCategoria ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : modoEdicao === "adicionar" ? "Adicionar" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de Taxa */}
      <Dialog open={dialogoTaxaAberto} onOpenChange={setDialogoTaxaAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modoEdicao === "adicionar" ? "Adicionar Nova Taxa" : "Editar Taxa"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome-taxa">Nome da Taxa</Label>
              <Input 
                id="nome-taxa"
                value={taxaAtual.nome}
                onChange={(e) => setTaxaAtual({...taxaAtual, nome: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="percentual-taxa">Percentual (%)</Label>
              <Input 
                id="percentual-taxa"
                type="number"
                value={taxaAtual.percentual}
                onChange={(e) => setTaxaAtual({...taxaAtual, percentual: parseFloat(e.target.value) || 0})}
                min={0}
                max={100}
                step="0.01"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="aplicavel-taxa">Aplicável a (separar por vírgula)</Label>
              <Input 
                id="aplicavel-taxa"
                value={taxaAtual.aplicavelA.join(", ")}
                onChange={(e) => setTaxaAtual({
                  ...taxaAtual, 
                  aplicavelA: e.target.value
                    .split(",")
                    .map(item => item.trim())
                    .filter(item => item !== "")
                })}
                placeholder="Ex: Troca de óleo, Alinhamento"
              />
              <p className="text-xs text-muted-foreground">Deixe em branco para aplicar a todos os serviços</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoTaxaAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarTaxa} disabled={salvandoTaxa}>
              {salvandoTaxa ? (
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
