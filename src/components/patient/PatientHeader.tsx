
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit3, Plus } from "lucide-react";
import { formatAgeHeader } from "@/lib/age-utils";
import { useNavigate } from "react-router-dom";

interface PatientHeaderProps {
  id: string;
  nome: string;
  dataNascimento: string;
  onEditClick: () => void;
}

export function PatientHeader({ id, nome, dataNascimento, onEditClick }: PatientHeaderProps) {
  const navigate = useNavigate();
  
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const idadeAtual = formatAgeHeader(dataNascimento);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold">{nome}</h2>
        <p className="text-muted-foreground">
          {idadeAtual} • Nasc.: {formatarData(dataNascimento)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="flex items-center gap-2" onClick={onEditClick}>
          <Edit3 className="h-4 w-4" />
          <span>Editar</span>
        </Button>
        <Button 
          className="flex items-center gap-2 bg-turquesa hover:bg-turquesa/90" 
          onClick={() => navigate(`/pacientes/${id}/nova-medicao`)}
        >
          <Plus className="h-4 w-4" />
          <span>Nova Medição</span>
        </Button>
      </div>
    </div>
  );
}
