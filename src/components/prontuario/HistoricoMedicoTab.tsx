
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Save, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HistoricoMedicoTabProps {
  prontuario: any;
  pacienteId: string;
}

export function HistoricoMedicoTab({ prontuario, pacienteId }: HistoricoMedicoTabProps) {
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    tipo: "",
    descricao: "",
    data: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    async function fetchHistorico() {
      try {
        const { data, error } = await supabase
          .from('historico_medico')
          .select('*')
          .eq('paciente_id', pacienteId)
          .order('data', { ascending: false });
        
        if (error) {
          console.error('Erro ao carregar histórico médico:', error);
          toast.error('Erro ao carregar histórico médico.');
        } else {
          setHistorico(data || []);
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        toast.error('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchHistorico();
  }, [pacienteId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setCurrentItem({
      ...currentItem,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setCurrentItem({
      tipo: item.tipo,
      descricao: item.descricao,
      data: item.data ? item.data.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setAddingNew(false);
  };

  const handleAdd = () => {
    setAddingNew(true);
    setEditingId(null);
    setCurrentItem({
      tipo: "",
      descricao: "",
      data: new Date().toISOString().split('T')[0]
    });
  };

  const handleCancel = () => {
    setAddingNew(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    try {
      if (addingNew) {
        const { data, error } = await supabase
          .from('historico_medico')
          .insert({
            paciente_id: pacienteId,
            prontuario_id: prontuario.id,
            tipo: currentItem.tipo,
            descricao: currentItem.descricao,
            data: currentItem.data
          })
          .select();
        
        if (error) {
          toast.error("Erro ao salvar: " + error.message);
          return;
        }
        
        if (data) {
          setHistorico([...data, ...historico]);
        }
        toast.success("Registro adicionado com sucesso");
      } else if (editingId) {
        const { error } = await supabase
          .from('historico_medico')
          .update({
            tipo: currentItem.tipo,
            descricao: currentItem.descricao,
            data: currentItem.data
          })
          .eq('id', editingId);
        
        if (error) {
          toast.error("Erro ao atualizar: " + error.message);
          return;
        }
        
        setHistorico(historico.map(item => 
          item.id === editingId 
            ? { ...item, tipo: currentItem.tipo, descricao: currentItem.descricao, data: currentItem.data } 
            : item
        ));
        toast.success("Registro atualizado com sucesso");
      }
      
      setAddingNew(false);
      setEditingId(null);
    } catch (err) {
      console.error("Erro:", err);
      toast.error("Ocorreu um erro ao processar sua solicitação");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('historico_medico')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error("Erro ao excluir: " + error.message);
        return;
      }
      
      setHistorico(historico.filter(item => item.id !== id));
      toast.success("Registro excluído com sucesso");
    } catch (err) {
      console.error("Erro ao excluir:", err);
      toast.error("Ocorreu um erro ao excluir o registro");
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
        {!addingNew && !editingId && (
          <Button 
            onClick={handleAdd}
            className="flex items-center gap-1 bg-turquesa hover:bg-turquesa/90"
          >
            <Plus className="h-4 w-4" /> Adicionar Registro
          </Button>
        )}
      </div>
      
      {(addingNew || editingId) && (
        <Card>
          <CardContent className="pt-6">
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo de Registro</Label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={currentItem.tipo}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Selecione um tipo</option>
                    <option value="Diagnóstico">Diagnóstico</option>
                    <option value="Cirurgia">Cirurgia</option>
                    <option value="Exame">Exame</option>
                    <option value="Medicação">Medicação</option>
                    <option value="Alergia">Alergia</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    name="data"
                    type="date"
                    value={currentItem.data}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={currentItem.descricao}
                  onChange={handleChange}
                  className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" /> Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSave}
                  className="flex items-center gap-1 bg-turquesa hover:bg-turquesa/90"
                >
                  <Save className="h-4 w-4" /> Salvar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-muted-foreground">Carregando histórico médico...</p>
        </div>
      ) : historico.length > 0 ? (
        <div className="space-y-4">
          {historico.map((item, index) => (
            <Card key={item.id || index}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {item.tipo} • {formatarData(item.data)}
                    </div>
                    <p className="mt-1">{item.descricao}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Nenhum registro encontrado no histórico médico.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
