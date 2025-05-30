
import { Input } from "@/components/ui/input";

interface HistoricoHeaderProps {
  filtro: string;
  onFiltroChange: (value: string) => void;
}

export function HistoricoHeader({ filtro, onFiltroChange }: HistoricoHeaderProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold">Histórico de Medições</h2>
      
      <div className="flex items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar por nome do paciente..."
            value={filtro}
            onChange={(e) => onFiltroChange(e.target.value)}
            className="pl-10"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
