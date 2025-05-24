import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HistoricoMedicoList } from "@/components/historico/HistoricoMedicoList";

interface HistoricoMedicoTabProps {
  prontuario: any;
  pacienteId: string;
}

export function HistoricoMedicoTab({
  prontuario,
  pacienteId
}: HistoricoMedicoTabProps) {
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
        const {
          data,
          error
        } = await supabase.from('historico_medico').select('*').eq('paciente_id', pacienteId).order('data', {
          ascending: false
        });
        if (error) {
          console.error('Erro ao carregar histórico médico:', error);
          toast.error('Erro ao carregar histórico médico.');
          return;
        }
        setHistoricoMedico(data || []);
      } catch (err) {
        console.error('Erro inesperado:', err);
        toast.error('Erro ao carregar dados do histórico médico.');
      } finally {
        setLoading(false);
      }
    }
    if (pacienteId) {
      fetchHistoricoMedico();
    }
  }, [pacienteId]);

  const handleOpenDialog = (item?: any) => {
    if (item) {
      setFormData({
        tipo: item.tipo,
        descricao: item.descricao,
        data: item.data.substring(0, 10),
        // Format as YYYY-MM-DD for input
        tratamento: item.tratamento || "",
        observacoes: item.observacoes || ""
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
        // Update existing record
        const {
          error
        } = await supabase.from('historico_medico').update({
          tipo: formData.tipo,
          descricao: formData.descricao,
          data: formData.data,
          tratamento: formData.tratamento || null,
          observacoes: formData.observacoes || null
        }).eq('id', editingItemId);
        if (error) {
          console.error('Erro ao atualizar registro:', error);
          toast.error('Erro ao atualizar registro.');
          return;
        }
        toast.success('Registro atualizado com sucesso!');
      } else {
        // Create new record
        const {
          error
        } = await supabase.from('historico_medico').insert({
          paciente_id: pacienteId,
          prontuario_id: prontuario?.id || null,
          tipo: formData.tipo,
          descricao: formData.descricao,
          data: formData.data,
          tratamento: formData.tratamento || null,
          observacoes: formData.observacoes || null
        });
        if (error) {
          console.error('Erro ao adicionar registro:', error);
          toast.error('Erro ao adicionar registro.');
          return;
        }
        toast.success('Registro adicionado com sucesso!');
      }

      // Refresh data
      const {
        data,
        error
      } = await supabase.from('historico_medico').select('*').eq('paciente_id', pacienteId).order('data', {
        ascending: false
      });
      if (error) {
        console.error('Erro ao recarregar dados:', error);
      } else {
        setHistoricoMedico(data || []);
      }
      setDialogOpen(false);
    } catch (err) {
      console.error('Erro inesperado:', err);
      toast.error('Erro ao salvar registro.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const {
        error
      } = await supabase.from('historico_medico').delete().eq('id', id);
      if (error) {
        console.error('Erro ao remover registro:', error);
        toast.error('Erro ao remover registro.');
        return;
      }
      setHistoricoMedico(historicoMedico.filter(item => item.id !== id));
      toast.success('Registro removido com sucesso!');
    } catch (err) {
      console.error('Erro inesperado:', err);
      toast.error('Erro ao remover registro.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Histórico</h3>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-1 bg-turquesa hover:bg-turquesa/90" disabled={loading}>
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>
      
      {loading && historicoMedico.length === 0 ? <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-muted-foreground">Carregando histórico...</p>
        </div> : <HistoricoMedicoList historico={historicoMedico} onEdit={handleOpenDialog} onDelete={handleDelete} />}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItemId ? 'Editar' : 'Adicionar'} Registro</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do registro abaixo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={formData.tipo} onValueChange={value => setFormData({
                ...formData,
                tipo: value
              })}>
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
                <Input id="data" type="date" value={formData.data} onChange={e => setFormData({
                ...formData,
                data: e.target.value
              })} required />
              </div>
            </div>
            
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" value={formData.descricao} onChange={e => setFormData({
              ...formData,
              descricao: e.target.value
            })} required />
            </div>
            
            <div>
              <Label htmlFor="tratamento">Tratamento</Label>
              <Input id="tratamento" value={formData.tratamento} onChange={e => setFormData({
              ...formData,
              tratamento: e.target.value
            })} />
            </div>
            
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" value={formData.observacoes} onChange={e => setFormData({
              ...formData,
              observacoes: e.target.value
            })} rows={3} />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingItemId ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}
