
import { Button } from "@/components/ui/button";
import { Edit3, Plus, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PatientHeaderProps {
  paciente: {
    id: string;
    nome: string;
  };
  idadeAtual: string;
  formatarData: (dataString: string) => string;
  dataNascimento: string;
  onEditClick: () => void;
}

export function PatientHeader({ 
  paciente, 
  idadeAtual, 
  formatarData, 
  dataNascimento, 
  onEditClick 
}: PatientHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold">{paciente.nome}</h2>
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
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate(`/pacientes/${paciente.id}/prontuario`)}
        >
          <FileText className="h-4 w-4" />
          <span>Prontuário</span>
        </Button>
        
        <Button 
          className="flex items-center gap-2 bg-turquesa hover:bg-turquesa/90"
          onClick={() => navigate(`/pacientes/${paciente.id}/nova-medicao`)}
        >
          <Plus className="h-4 w-4" />
          <span>Nova Medição</span>
        </Button>
      </div>
    </div>
  );
}
