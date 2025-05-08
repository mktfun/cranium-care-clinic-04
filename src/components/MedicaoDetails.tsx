
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { formatAge } from "@/lib/age-utils";
import { AsymmetryType, SeverityLevel } from "@/lib/cranial-utils";

interface MedicaoDetailsProps {
  medicao: {
    id: string;
    data: string;
    comprimento: number;
    largura: number;
    diagonalD: number;
    diagonalE: number;
    diferencaDiagonais: number;
    indiceCraniano: number;
    cvai: number;
    perimetroCefalico?: number;
    status: SeverityLevel;
    asymmetryType?: AsymmetryType;
    observacoes?: string;
  };
  pacienteNascimento: string;
  compact?: boolean;
}

export function MedicaoDetails({ medicao, pacienteNascimento, compact = false }: MedicaoDetailsProps) {
  // Format date
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  // Calculate age at measurement date
  const idadeMedicao = formatAge(pacienteNascimento, medicao.data);
  
  return (
    <Card className={`p-4 ${compact ? 'mb-2' : 'mb-4'}`}>
      <div className="flex flex-col gap-2">
        {/* Header with date, age and status */}
        <div className="flex flex-wrap justify-between items-center mb-2">
          <div>
            <span className="font-medium">
              {formatarData(medicao.data)}
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              Idade: {idadeMedicao}
            </span>
          </div>
          <StatusBadge 
            status={medicao.status} 
            asymmetryType={medicao.asymmetryType}
          />
        </div>
        
        {/* Measurements - First row */}
        <div className="grid grid-cols-3 gap-2 mb-1">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Comprimento</span>
            <span>{medicao.comprimento} mm</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Largura</span>
            <span>{medicao.largura} mm</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Índice Craniano</span>
            <span>{medicao.indiceCraniano}%</span>
          </div>
        </div>
        
        {/* Measurements - Second row */}
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Diagonal D</span>
            <span>{medicao.diagonalD} mm</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Diagonal E</span>
            <span>{medicao.diagonalE} mm</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Dif. Diagonais</span>
            <span>{medicao.diferencaDiagonais} mm</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">CVAI</span>
            <span>{medicao.cvai}%</span>
          </div>
        </div>
        
        {/* Perimetro cefalico if available */}
        {medicao.perimetroCefalico && (
          <div className="mt-1">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Perímetro Cefálico</span>
              <span>{medicao.perimetroCefalico} mm</span>
            </div>
          </div>
        )}
        
        {/* Observations if available and not compact mode */}
        {!compact && medicao.observacoes && (
          <div className="mt-2 text-sm">
            <span className="font-medium">Observações:</span>
            <p className="text-muted-foreground">{medicao.observacoes}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
