import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, Pencil, Save, Trash2, X, Calendar, FileText 
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Consulta } from "@/types";

interface ConsultasTabProps {
  pacienteId: string;
}

export function ConsultasTab({ pacienteId }: ConsultasTabProps) {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [currentConsulta, setCurrentConsulta] = useState<Partial<Consulta>>({
    data: new Date().toISOString().split('T')[0],
    profissional: "",
    especialidade: "",
    motivo: "",
    diagnostico: "",
    tratamento: "",
    observacoes: ""
  });

  useEffect(() => {
    fetchConsultas();
  }, [pacienteId]);

  async function fetchConsultas() {
    try {
      setLoading(true);
      // Use raw response to avoid type checking
      const response = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('data', { ascending: false });
      
      if (response.error) {
        console.error('Erro ao carregar consultas:', response.error);
        toast.error('Erro ao carregar consultas.');
      } else {
        // Transform the data to match our Consulta interface if needed
        const consultasData = (response.data || []) as Consulta[];
        setConsultas(consultasData);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      toast.error('Erro ao carregar dados de consultas.');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setCurrentConsulta({
      ...currentConsulta,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = (consulta: Consulta) => {
    setEditingId(consulta.id);
    setCurrentConsulta({
      data: consulta.data ? consulta.data.split('T')[0] : new Date().toISOString().split('T')[0],
      profissional: consulta.profissional || "",
      especialidade: consulta.especialidade || "",
      motivo: consulta.motivo || "",
      diagnostico: consulta.diagnostico || "",
      tratamento: consulta.tratamento || "",
      observacoes: consulta.observacoes || ""
    });
    setAddingNew(false);
  };

  const handleAdd = () => {
    setAddingNew(true);
    setEditingId(null);
    setCurrentConsulta({
      data: new Date().toISOString().split('T')[0],
      profissional: "",
      especialidade: "",
      motivo: "",
      diagnostico: "",
      tratamento: "",
      observacoes: ""
    });
  };

  const handleCancel = () => {
    setAddingNew(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    try {
      if (addingNew) {
        const newConsulta = {
          paciente_id: pacienteId,
          data: currentConsulta.data,
          profissional: currentConsulta.profissional,
          especialidade: currentConsulta.especialidade,
          motivo: currentConsulta.motivo,
          diagnostico: currentConsulta.diagnostico,
          tratamento: currentConsulta.tratamento,
          observacoes: currentConsulta.observacoes
        };

        const response = await supabase
          .from('consultas')
          .insert(newConsulta);
        
        if (response.error) {
          toast.error("Erro ao salvar consulta: " + response.error.message);
          return;
        }
        
        // Refresh the data after saving
        await fetchConsultas();
        toast.success("Consulta registrada com sucesso");
      } else if (editingId) {
        const updateData = {
          data: currentConsulta.data,
          profissional: currentConsulta.profissional,
          especialidade: currentConsulta.especialidade,
          motivo: currentConsulta.motivo,
          diagnostico: currentConsulta.diagnostico,
          tratamento: currentConsulta.tratamento,
          observacoes: currentConsulta.observacoes
        };

        const response = await supabase
          .from('consultas')
          .update(updateData)
          .eq('id', editingId);
        
        if (response.error) {
          toast.error("Erro ao atualizar consulta: " + response.error.message);
          return;
        }
        
        await fetchConsultas();
        toast.success("Consulta atualizada com sucesso");
      }
      
      setAddingNew(false);
      setEditingId(null);
    } catch (err) {
      console.error("Erro:", err);
      toast.error("Ocorreu um erro ao processar sua solicitação");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta consulta?")) {
      return;
    }
    
    try {
      const response = await supabase
        .from('consultas')
        .delete()
        .eq('id', id);
      
      if (response.error) {
        toast.error("Erro ao excluir consulta: " + response.error.message);
        return;
      }
      
      setConsultas(consultas.filter(item => item.id !== id));
      toast.success("Consulta excluída com sucesso");
    } catch (err) {
      console.error("Erro ao excluir:", err);
      toast.error("Ocorreu um erro ao excluir a consulta");
    }
  };

  const formatarData = (dataString: string) => {
    if (!dataString) return "N/A";
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString('pt-BR');
  };

  const ConsultaForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">
          {addingNew ? "Nova Consulta" : "Editar Consulta"}
        </CardTitle>
        <CardDescription>
          Preencha as informações da consulta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="data">Data da Consulta</Label>
              <Input
                id="data"
                name="data"
                type="date"
                value={currentConsulta.data}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="profissional">Profissional</Label>
              <Input
                id="profissional"
                name="profissional"
                value={currentConsulta.profissional}
                onChange={handleChange}
                placeholder="Nome do profissional"
              />
            </div>
            <div>
              <Label htmlFor="especialidade">Especialidade</Label>
              <Input
                id="especialidade"
                name="especialidade"
                value={currentConsulta.especialidade}
                onChange={handleChange}
                placeholder="Ex: Fisioterapeuta, Pediatra"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="motivo">Motivo da Consulta</Label>
            <Input
              id="motivo"
              name="motivo"
              value={currentConsulta.motivo}
              onChange={handleChange}
              placeholder="Descreva o motivo principal da consulta"
            />
          </div>
          
          <div>
            <Label htmlFor="diagnostico">Diagnóstico</Label>
            <textarea
              id="diagnostico"
              name="diagnostico"
              value={currentConsulta.diagnostico}
              onChange={handleChange}
              placeholder="Diagnóstico e/ou impressões clínicas"
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          
          <div>
            <Label htmlFor="tratamento">Tratamento/Recomendações</Label>
            <textarea
              id="tratamento"
              name="tratamento"
              value={currentConsulta.tratamento}
              onChange={handleChange}
              placeholder="Tratamento indicado e/ou recomendações"
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={currentConsulta.observacoes}
              onChange={handleChange}
              placeholder="Observações adicionais"
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Consultas</h3>
        {!addingNew && !editingId && (
          <Button 
            onClick={handleAdd}
            className="flex items-center gap-1 bg-turquesa hover:bg-turquesa/90"
          >
            <Plus className="h-4 w-4" /> Registrar Consulta
          </Button>
        )}
      </div>
      
      {(addingNew || editingId) && <ConsultaForm />}
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-muted-foreground">Carregando consultas...</p>
        </div>
      ) : consultas.length > 0 ? (
        <div className="space-y-4">
          {consultas.map((consulta) => (
            <Card key={consulta.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-turquesa" />
                      <CardTitle className="text-base">
                        {formatarData(consulta.data)}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {consulta.especialidade ? 
                        `${consulta.profissional} • ${consulta.especialidade}` : 
                        consulta.profissional}
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-2 flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(consulta)}
                      className="flex items-center gap-1"
                    >
                      <Pencil className="h-4 w-4" /> Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(consulta.id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" /> Excluir
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {consulta.motivo && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Motivo da Consulta</p>
                      <p>{consulta.motivo}</p>
                    </div>
                  )}
                  
                  {consulta.diagnostico && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Diagnóstico</p>
                      <p>{consulta.diagnostico}</p>
                    </div>
                  )}
                  
                  {consulta.tratamento && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tratamento/Recomendações</p>
                      <p>{consulta.tratamento}</p>
                    </div>
                  )}
                  
                  {consulta.observacoes && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Observações</p>
                      <p>{consulta.observacoes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma consulta registrada para este paciente.</p>
            {!addingNew && (
              <Button 
                className="mt-4 bg-turquesa hover:bg-turquesa/90"
                onClick={handleAdd}
              >
                <Plus className="h-4 w-4 mr-2" /> Registrar Nova Consulta
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
