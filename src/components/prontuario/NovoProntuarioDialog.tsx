
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Prontuario } from "@/types";

interface NovoProntuarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacienteId: string;
  onSuccess: (novoProntuario: Prontuario) => void;
}

export function NovoProntuarioDialog({
  open,
  onOpenChange,
  pacienteId,
  onSuccess
}: NovoProntuarioDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    altura: "",
    peso: "",
    tipo_sanguineo: "",
    alergias: "",
    observacoes_gerais: ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pacienteId) {
      toast.error("ID do paciente não encontrado. Tente novamente.");
      return;
    }
    
    setLoading(true);
    
    try {
      // Sempre criar um novo prontuário para cada consulta
      const { data, error } = await supabase
        .from('prontuarios')
        .insert({
          paciente_id: pacienteId,
          data_criacao: new Date().toISOString(),
          altura: formData.altura ? parseFloat(formData.altura) : null,
          peso: formData.peso ? parseFloat(formData.peso) : null,
          tipo_sanguineo: formData.tipo_sanguineo || null,
          alergias: formData.alergias || null,
          observacoes_gerais: formData.observacoes_gerais || null
        })
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao criar prontuário:", error);
        toast.error("Erro ao criar prontuário: " + error.message);
        return;
      }
      
      // Limpar o formulário
      setFormData({
        altura: "",
        peso: "",
        tipo_sanguineo: "",
        alergias: "",
        observacoes_gerais: ""
      });
      
      onSuccess(data as any as Prontuario);
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao criar prontuário:", err);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nova Consulta
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="altura">Altura (cm)</Label>
                <Input
                  id="altura"
                  name="altura"
                  type="number"
                  placeholder="Ex: 175"
                  value={formData.altura}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  name="peso"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 70.5"
                  value={formData.peso}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="tipo_sanguineo">Tipo Sanguíneo</Label>
              <Input
                id="tipo_sanguineo"
                name="tipo_sanguineo"
                placeholder="Ex: O+"
                value={formData.tipo_sanguineo}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label htmlFor="alergias">Alergias</Label>
              <Input
                id="alergias"
                name="alergias"
                placeholder="Ex: Penicilina, Látex"
                value={formData.alergias}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label htmlFor="observacoes_gerais">Observações Gerais</Label>
              <textarea
                id="observacoes_gerais"
                name="observacoes_gerais"
                placeholder="Informações adicionais relevantes sobre o paciente"
                value={formData.observacoes_gerais}
                onChange={handleChange}
                className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-turquesa hover:bg-turquesa/90"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Nova Consulta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
