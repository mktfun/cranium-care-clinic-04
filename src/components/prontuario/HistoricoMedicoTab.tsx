
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash } from "lucide-react";

// Mock data for historico medico
const mockHistoricoMedico = [
  {
    id: "1",
    prontuario_id: "1",
    paciente_id: "123",
    tipo: "Doença",
    descricao: "Sarampo",
    data: "2024-03-15",
    tratamento: "Repouso e medicação",
    observacoes: "Recuperação completa"
  },
  {
    id: "2",
    prontuario_id: "1",
    paciente_id: "123",
    tipo: "Cirurgia",
    descricao: "Correção de hérnia umbilical",
    data: "2024-02-10",
    tratamento: "Procedimento cirúrgico",
    observacoes: "Sem complicações"
  }
];

interface HistoricoMedicoTabProps {
  prontuario: any;
  pacienteId: string;
}

export function HistoricoMedicoTab({ prontuario, pacienteId }: HistoricoMedicoTabProps) {
  const [loading, setLoading] = useState(false);
  const [historicoMedico, setHistoricoMedico] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tipo: "Doença",
    descricao: "",
    data: "",
    tratamento: "",
    observacoes: ""
  });

  useEffect(() => {
    async function fetchHistoricoMedico() {
      try {
        setLoading(true);
        
        // Use mock data instead of supabase query
        setTimeout(() => {
          setHistoricoMedico(mockHistoricoMedico);
          setLoading(false);
        }, 500);
        
      } catch (err) {
        console.error('Erro ao carregar histórico médico:', err);
        toast.error('Erro ao carregar histórico médico.');
        setLoading(false);
      }
    }
    
    if (prontuario?.id) {
      fetchHistoricoMedico();
    }
  }, [prontuario?.id, pacienteId]);
  
  const handleOpenDialog = (item?: any) => {
    if (item) {
      setFormData({
        tipo: item.tipo,
        descricao: item.descricao,
        data: item.data,
        tratamento: item.tratamento,
        observacoes: item.observacoes
      });
      setEditingItemId(item.id);
    } else {
      setFormData({
        tipo: "Doença",
        descricao: "",
        data: new Date().toISOString().split('T')[0],
        tratamento: "",
        observacoes: ""
      });
      setEditingItemId(null);
    }
    setDialogOpen(true);
  };
  
  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (!formData.descricao || !formData.data) {
        toast.error('Preencha todos os campos obrigatórios.');
        setLoading(false);
        return;
      }
      
      if (editingItemId) {
        // Simulate updating item
        const updatedHistorico = historicoMedico.map(item => {
          if (item.id === editingItemId) {
            return { ...item, ...formData };
          }
          return item;
        });
        
        setHistoricoMedico(updatedHistorico);
        toast.success('Item atualizado com sucesso!');
      } else {
        // Simulate creating new item
        const newItem = {
          id: `temp-${Date.now()}`,
          prontuario_id: prontuario.id,
          paciente_id: pacienteId,
          ...formData
        };
        
        setHistoricoMedico([...historicoMedico, newItem]);
        toast.success('Item adicionado com sucesso!');
      }
      
      setDialogOpen(false);
    } catch (err) {
      console.error('Erro ao salvar histórico médico:', err);
      toast.error('Erro ao salvar histórico médico.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      
      // Simulate deletion
      const filteredHistorico = historicoMedico.filter(item => item.id !== id);
      setHistoricoMedico(filteredHistorico);
      
      toast.success('Item removido com sucesso!');
    } catch (err) {
      console.error('Erro ao remover item do histórico:', err);
      toast.error('Erro ao remover item do histórico.');
    } finally {
      setLoading(false);
    }
  };
  
  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Histórico Médico</h3>
        <Button 
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-1 bg-turquesa hover:bg-turquesa/90"
        >
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>
      
      {loading && historicoMedico.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-muted-foreground">Carregando histórico médico...</p>
        </div>
      ) : historicoMedico.length > 0 ? (
        <div className="space-y-4">
          {historicoMedico.map((item) => (
            <div 
              key={item.id} 
              className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs">{item.tipo}</span>
                    <h4 className="font-medium">{item.descricao}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Data: {formatarData(item.data)}</p>
                  
                  {item.tratamento && (
                    <div className="mb-2">
                      <span className="text-sm font-medium">Tratamento:</span>
                      <p className="text-sm">{item.tratamento}</p>
                    </div>
                  )}
                  
                  {item.observacoes && (
                    <div>
                      <span className="text-sm font-medium">Observações:</span>
                      <p className="text-sm">{item.observacoes}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-8 w-8" 
                    onClick={() => handleOpenDialog(item)}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" 
                    onClick={() => handleDelete(item.id)}
                    title="Excluir"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">Nenhum registro no histórico médico.</p>
          <Button 
            onClick={() => handleOpenDialog()} 
            className="mt-4 bg-turquesa hover:bg-turquesa/90"
          >
            <Plus className="h-4 w-4 mr-2" /> Adicionar Primeiro Registro
          </Button>
        </div>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItemId ? 'Editar' : 'Adicionar'} Registro Médico</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do registro médico abaixo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <Label htmlFor="tipo">Tipo</Label>
                <Select 
                  value={formData.tipo} 
                  onValueChange={(value) => setFormData({...formData, tipo: value})}
                >
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Doença">Doença</SelectItem>
                    <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                    <SelectItem value="Exame">Exame</SelectItem>
                    <SelectItem value="Vacina">Vacina</SelectItem>
                    <SelectItem value="Alergia">Alergia</SelectItem>
                    <SelectItem value="Medicação">Medicação</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-1">
                <Label htmlFor="data">Data</Label>
                <Input 
                  id="data" 
                  type="date" 
                  value={formData.data} 
                  onChange={(e) => setFormData({...formData, data: e.target.value})} 
                  required 
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input 
                id="descricao" 
                value={formData.descricao} 
                onChange={(e) => setFormData({...formData, descricao: e.target.value})} 
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="tratamento">Tratamento</Label>
              <Input 
                id="tratamento" 
                value={formData.tratamento} 
                onChange={(e) => setFormData({...formData, tratamento: e.target.value})} 
              />
            </div>
            
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea 
                id="observacoes" 
                value={formData.observacoes} 
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})} 
                rows={3} 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"></div>
              ) : editingItemId ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
