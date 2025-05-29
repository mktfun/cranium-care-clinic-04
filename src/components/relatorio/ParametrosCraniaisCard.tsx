import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { getCranialStatus } from "@/lib/cranial-utils";
interface ParametrosCraniaisCardProps {
  dataFormatada: string;
  comprimento: number;
  largura: number;
  indiceCraniano: number;
  diagonalD: number;
  diagonalE: number;
  diferencaDiagonais: number;
  cvai: number;
  perimetroCefalico?: number;
  className?: string;
}
export function ParametrosCraniaisCard({
  dataFormatada,
  comprimento,
  largura,
  indiceCraniano,
  diagonalD,
  diagonalE,
  diferencaDiagonais,
  cvai,
  perimetroCefalico,
  className
}: ParametrosCraniaisCardProps) {
  // Obter tipo e severidade da assimetria
  const {
    asymmetryType,
    severityLevel
  } = getCranialStatus(indiceCraniano, cvai);

  // Função para determinar a classe de cor com base no valor do índice craniano
  const getIndiceClasse = (valor: number) => {
    if (valor >= 75 && valor <= 85) return "text-green-600"; // Normal (updated range)
    if (valor > 85) return "text-amber-500"; // Braquicefalia
    return "text-amber-500"; // Dolicocefalia
  };

  // Função para determinar a classe de cor com base no valor do CVAI
  const getCvaiClasse = (valor: number) => {
    if (valor < 3.5) return "text-green-600"; // Normal
    if (valor < 6.25) return "text-yellow-500"; // Leve
    if (valor < 8.75) return "text-amber-500"; // Moderada
    return "text-red-500"; // Severa
  };
  return;
}