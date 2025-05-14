
import React from 'react';
import { Separator } from "@/components/ui/separator";
import MeasurementInputs from './MeasurementInputs';
import MeasurementResults from './MeasurementResults';
import NotesAndRecommendations from './NotesAndRecommendations';
import { SeverityLevel } from "@/lib/cranial-utils";

interface MeasurementsSectionProps {
  measurements: {
    comprimento: number | null;
    largura: number | null;
    diagonalDireita: number | null;
    diagonalEsquerda: number | null;
    perimetroCefalico: number | null;
    indiceCraniano: number | null;
    diferencaDiagonais: number | null;
    cvai: number | null;
  };
  onInputChange: (field: string, value: number | null) => void;
  observacoes: string;
  recomendacoes: string[];
  onObservacoesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onRecomendacoesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  getSeverityLevel: () => SeverityLevel;
}

const MeasurementsSection: React.FC<MeasurementsSectionProps> = ({
  measurements,
  onInputChange,
  observacoes,
  recomendacoes,
  onObservacoesChange,
  onRecomendacoesChange,
  getSeverityLevel
}) => {
  return (
    <div className="space-y-6">
      <MeasurementInputs
        comprimento={measurements.comprimento}
        largura={measurements.largura}
        diagonalDireita={measurements.diagonalDireita}
        diagonalEsquerda={measurements.diagonalEsquerda}
        perimetroCefalico={measurements.perimetroCefalico}
        onInputChange={onInputChange}
      />

      <Separator className="my-4" />

      <MeasurementResults
        indiceCraniano={measurements.indiceCraniano}
        diferencaDiagonais={measurements.diferencaDiagonais}
        cvai={measurements.cvai}
        getSeverityLevel={getSeverityLevel}
      />

      <Separator className="my-4" />

      <NotesAndRecommendations
        observacoes={observacoes}
        recomendacoes={recomendacoes}
        onObservacoesChange={onObservacoesChange}
        onRecomendacoesChange={onRecomendacoesChange}
      />
    </div>
  );
};

export default MeasurementsSection;
