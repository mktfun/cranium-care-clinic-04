
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
import { ConsultasList } from "@/components/historico/ConsultasList";

interface ConsultasTabProps {
  pacienteId: string;
}

export function ConsultasTab({ pacienteId }: ConsultasTabProps) {
  const [loading, setLoading] = useState(false);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tipo: "Consulta",
    descricao: "",
    data: "",
    profissional: "",
    especialidade: "",
    motivo: "",
    diagnostico: "",
    tratamento: "",
    observacoes: ""
  });

  useEffect(() => {
    async function fetchConsultas() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('consultas')
          .select('*')
          .eq('paciente_id', pacienteId)
          .order('data', { ascending: false });
          
        if (error) {
          console.error('Erro ao carregar consultas:', error);
          toast.error('Erro ao carregar consultas.');
          return;
        }
        
        setConsultas(data || []);
      } catch (err) {
        console.error('Erro inesperado:', err);
        toast.error('Erro ao carregar dados de consultas.');
      } finally {
        setLoading(false);
      }
    }
    
    if (pacienteId) {
      fetchConsultas();
    }
  }, [pacienteId]);
  
  const handleOpenDialog = (item?: any) => {
    if (item) {
      setFormData({
        tipo: item.tipo || "Consulta",
        descricao: item.descricao || "",
        data: item.data ? new Date(item.data).toISOString().substring(0, 16) : "", // Format as YYYY-MM-DDThh:mm
        profissional: item.profissional || "",
        especialidade: item.especialidade || "",
        motivo: item.motivo || "",
        diagnostico: item.diagnostico || "",
        tratamento: item.tratamento || "",
        observacoes: item.observacoes || ""
      });
      setEditingItemId(item.id);
    } else {
      const now = new Date();
      const localDatetime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
        .toISOString()
        .substring(0, 16);
        
      setFormData({
        tipo: "Consulta",
        descricao: "",
        data: localDatetime,
        profissional: "",
        especialidade: "",
        motivo: "",
        diagnostico: "",
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
      
      const consultaData = {
        paciente_id: pacienteId,
        tipo: formData.tipo,
        descricao: formData.descricao,
        data: formData.data,
        profissional: formData.profissional || null,
        especialidade: formData.especialidade || null,
        motivo: formData.motivo || null,
        diagnostico: formData.diagnostico || null,
        tratamento: formData.tratamento || null,
        observacoes: formData.observacoes || null
      };
      
      if (editingItemId) {
        // Update existing record
        const { error } = await supabase
          .from('consultas')
          .update(consultaData)
          .eq('id', editingItemId);
          
        if (error) {
          console.error('Erro ao atualizar consulta:', error);
          toast.error('Erro ao atualizar consulta.');
          return;
        }
        
        toast.success('Consulta atualizada com sucesso!');
      } else {
        // Create new record
        const { error } = await supabase
          .from('consultas')
          .insert(consultaData);
          
        if (error) {
          console.error('Erro ao adicionar consulta:', error);
          toast.error('Erro ao adicionar consulta.');
          return;
        }
        
        toast.success('Consulta adicionada com sucesso!');
      }
      
      // Refresh data
      const { data, error } = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('data', { ascending: false });
        
      if (error) {
        console.error('Erro ao recarregar dados:', error);
      } else {
        setConsultas(data || []);
      }
      
      setDialogOpen(false);
    } catch (err) {
      console.error('Erro inesperado:', err);
      toast.error('Erro ao salvar consulta.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('consultas')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Erro ao remover consulta:', error);
        toast.error('Erro ao remover consulta.');
        return;
      }
      
      setConsultas(consultas.filter(item => item.id !== id));
      toast.success('Consulta removida com sucesso!');
    } catch (err) {
      console.error('Erro inesperado:', err);
      toast.error('Erro ao remover consulta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Consultas</h3>
        <Button 
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-1 bg-turquesa hover:bg-turquesa/90"
          disabled={loading}
        >
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>
      
      {loading && consultas.length === 0 ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-muted-foreground">Carregando consultas...</p>
        </div>
      ) : (
        <ConsultasList 
          consultas={consultas} 
          onEdit={handleOpenDialog}
          onDelete={handleDelete}
        />
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItemId ? 'Editar' : 'Adicionar'} Consulta</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da consulta abaixo.
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
                    <SelectItem value="Consulta">Consulta</SelectItem>
                    <SelectItem value="Retorno">Retorno</SelectItem>
                    <SelectItem value="Avaliação">Avaliação</SelectItem>
                    <SelectItem value="Emergência">Emergência</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-1">
                <Label htmlFor="data">Data e Hora</Label>
                <Input 
                  id="data" 
                  type="datetime-local" 
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <Label htmlFor="profissional">Profissional</Label>
                <Input 
                  id="profissional" 
                  value={formData.profissional} 
                  onChange={(e) => setFormData({...formData, profissional: e.target.value})} 
                />
              </div>
              
              <div className="col-span-1">
                <Label htmlFor="especialidade">Especialidade</Label>
                <Input 
                  id="especialidade" 
                  value={formData.especialidade} 
                  onChange={(e) => setFormData({...formData, especialidade: e.target.value})} 
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="motivo">Motivo da Consulta</Label>
              <Textarea 
                id="motivo" 
                value={formData.motivo} 
                onChange={(e) => setFormData({...formData, motivo: e.target.value})} 
                rows={2} 
              />
            </div>
            
            <div>
              <Label htmlFor="diagnostico">Diagnóstico</Label>
              <Textarea 
                id="diagnostico" 
                value={formData.diagnostico} 
                onChange={(e) => setFormData({...formData, diagnostico: e.target.value})} 
                rows={2} 
              />
            </div>
            
            <div>
              <Label htmlFor="tratamento">Tratamento</Label>
              <Textarea 
                id="tratamento" 
                value={formData.tratamento} 
                onChange={(e) => setFormData({...formData, tratamento: e.target.value})} 
                rows={2} 
              />
            </div>
            
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea 
                id="observacoes" 
                value={formData.observacoes} 
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})} 
                rows={2} 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingItemId ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
