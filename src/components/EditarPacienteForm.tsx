import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface ResponsavelType {
  nome: string;
  telefone: string;
  email: string;
}

interface PacienteProps {
  id: string;
  nome: string;
  dataNascimento: string;
  data_nascimento?: string;
  idadeEmMeses: number;
  sexo: "M" | "F";
  responsaveis: ResponsavelType[] | ResponsavelType | null | Json;
  medicoes: any[];
}

interface EditarPacienteFormProps {
  paciente: PacienteProps;
  onSalvar: () => void;
}

export function EditarPacienteForm({ paciente, onSalvar }: EditarPacienteFormProps) {
  const [nome, setNome] = useState(paciente.nome);
  const [dataNascimento, setDataNascimento] = useState((paciente.dataNascimento || paciente.data_nascimento || '').split('T')[0]);
  const [sexo, setSexo] = useState(paciente.sexo);

  // Ensure responsaveis is always an array by checking different possible types
  let initialResponsaveis: ResponsavelType[] = [];
  
  if (paciente.responsaveis) {
    if (Array.isArray(paciente.responsaveis)) {
      initialResponsaveis = [...paciente.responsaveis];
    } else if (typeof paciente.responsaveis === 'object') {
      // If it's a single object, convert to array
      initialResponsaveis = [paciente.responsaveis as ResponsavelType];
    }
  }
  
  // If we still have an empty array, add a default empty responsavel
  if (initialResponsaveis.length === 0) {
    initialResponsaveis = [{ nome: '', telefone: '', email: '' }];
  }
  
  const [responsaveis, setResponsaveis] = useState<ResponsavelType[]>(initialResponsaveis);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleResponsavelChange = (index: number, field: keyof ResponsavelType, value: string) => {
    const novosResponsaveis = [...responsaveis];
    novosResponsaveis[index] = {
      ...novosResponsaveis[index],
      [field]: value
    };
    setResponsaveis(novosResponsaveis);
  };
  
  const handleAddResponsavel = () => {
    setResponsaveis([...responsaveis, { nome: '', telefone: '', email: '' }]);
  };
  
  const handleRemoveResponsavel = (index: number) => {
    if (responsaveis.length > 1) {
      const novosResponsaveis = [...responsaveis];
      novosResponsaveis.splice(index, 1);
      setResponsaveis(novosResponsaveis);
    } else {
      toast.error("É necessário pelo menos um responsável");
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Make sure paciente.id is valid before proceeding
      if (!paciente.id) {
        toast.error("ID do paciente inválido");
        return;
      }
      
      // Validate form data
      if (!nome || !dataNascimento || !sexo || responsaveis.length === 0) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }
      
      // Validate responsáveis data
      for (const resp of responsaveis) {
        if (!resp.nome || !resp.telefone || !resp.email) {
          toast.error("Preencha todos os dados dos responsáveis");
          return;
        }
      }
  
      // First, check if we're dealing with mock data or Supabase data
      const { data: existingPaciente, error: checkError } = await supabase
        .from('pacientes')
        .select('id')
        .eq('id', paciente.id)
        .maybeSingle();
  
      if (checkError) {
        console.error("Erro ao verificar paciente:", checkError);
      }
  
      if (existingPaciente) {
        // Update in Supabase - convert responsaveis to Json compatible format
        const { error } = await supabase
          .from('pacientes')
          .update({
            nome,
            data_nascimento: dataNascimento,
            sexo,
            responsaveis: responsaveis as unknown as Json
          })
          .eq('id', paciente.id);
  
        if (error) {
          throw error;
        }
  
        toast.success("Dados do paciente atualizados com sucesso!");
      } else {
        // Handle mock data update - in real app this would be skipped
        toast.success("Dados do paciente atualizados com sucesso (mock)!");
      }
      
      onSalvar();
    } catch (error: any) {
      console.error("Erro ao atualizar paciente:", error);
      toast.error(`Erro ao atualizar dados: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome completo</Label>
          <Input 
            id="nome" 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="data-nascimento">Data de nascimento</Label>
            <Input 
              id="data-nascimento" 
              type="date" 
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sexo">Sexo</Label>
            <select 
              id="sexo"
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={sexo}
              onChange={(e) => setSexo(e.target.value as "M" | "F")}
              required
              disabled={isLoading}
            >
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Responsáveis</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddResponsavel}
              disabled={isLoading}
            >
              Adicionar Responsável
            </Button>
          </div>
          
          {responsaveis.map((responsavel, index) => (
            <div key={index} className="space-y-2 border p-3 rounded-md">
              <div className="flex justify-between">
                <span className="font-medium">Responsável {index + 1}</span>
                {responsaveis.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive/10 h-7 px-2"
                    onClick={() => handleRemoveResponsavel(index)}
                    disabled={isLoading}
                  >
                    Remover
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`responsavel-nome-${index}`}>Nome</Label>
                <Input 
                  id={`responsavel-nome-${index}`} 
                  value={responsavel.nome}
                  onChange={(e) => handleResponsavelChange(index, "nome", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`responsavel-telefone-${index}`}>Telefone</Label>
                  <Input 
                    id={`responsavel-telefone-${index}`} 
                    value={responsavel.telefone}
                    onChange={(e) => handleResponsavelChange(index, "telefone", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`responsavel-email-${index}`}>Email</Label>
                  <Input 
                    id={`responsavel-email-${index}`} 
                    type="email" 
                    value={responsavel.email}
                    onChange={(e) => handleResponsavelChange(index, "email", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <DialogFooter className="mt-4">
        <Button type="submit" className="bg-turquesa hover:bg-turquesa/90" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar alterações"}
        </Button>
      </DialogFooter>
    </form>
  );
}
