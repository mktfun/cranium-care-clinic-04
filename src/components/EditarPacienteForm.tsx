
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";

interface ResponsavelType {
  nome: string;
  telefone: string;
  email: string;
}

interface PacienteProps {
  id: string;
  nome: string;
  dataNascimento: string;
  idadeEmMeses: number;
  sexo: "M" | "F";
  responsaveis: ResponsavelType[];
  medicoes: any[];
}

interface EditarPacienteFormProps {
  paciente: PacienteProps;
  onSalvar: () => void;
}

export function EditarPacienteForm({ paciente, onSalvar }: EditarPacienteFormProps) {
  const [nome, setNome] = useState(paciente.nome);
  const [dataNascimento, setDataNascimento] = useState(paciente.dataNascimento.split('T')[0]);
  const [sexo, setSexo] = useState(paciente.sexo);
  const [responsaveis, setResponsaveis] = useState([...paciente.responsaveis]);
  
  const handleResponsavelChange = (index: number, field: keyof ResponsavelType, value: string) => {
    const novosResponsaveis = [...responsaveis];
    novosResponsaveis[index] = {
      ...novosResponsaveis[index],
      [field]: value
    };
    setResponsaveis(novosResponsaveis);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Em uma aplicação real, aqui seria feita a chamada para salvar os dados
    onSalvar();
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
            >
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Responsáveis</Label>
          {responsaveis.map((responsavel, index) => (
            <div key={index} className="space-y-2 border p-3 rounded-md">
              <div className="space-y-2">
                <Label htmlFor={`responsavel-nome-${index}`}>Nome</Label>
                <Input 
                  id={`responsavel-nome-${index}`} 
                  value={responsavel.nome}
                  onChange={(e) => handleResponsavelChange(index, "nome", e.target.value)}
                  required
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
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <DialogFooter className="mt-4">
        <Button type="submit" className="bg-turquesa hover:bg-turquesa/90">
          Salvar alterações
        </Button>
      </DialogFooter>
    </form>
  );
}
