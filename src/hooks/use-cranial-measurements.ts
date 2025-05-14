
import { useState, useEffect } from 'react';
import { SeverityLevel } from "@/lib/cranial-utils";
import { calculateAsymmetry } from "@/lib/cranial-utils";

export interface CranialMeasurements {
  comprimento: number | null;
  largura: number | null;
  diagonalDireita: number | null;
  diagonalEsquerda: number | null;
  perimetroCefalico: number | null;
  indiceCraniano: number | null;
  diferencaDiagonais: number | null;
  cvai: number | null;
}

export const useCranialMeasurements = () => {
  const [measurements, setMeasurements] = useState<CranialMeasurements>({
    comprimento: null,
    largura: null,
    diagonalDireita: null,
    diagonalEsquerda: null,
    perimetroCefalico: null,
    indiceCraniano: null,
    diferencaDiagonais: null,
    cvai: null
  });

  useEffect(() => {
    const { comprimento, largura, diagonalDireita, diagonalEsquerda } = measurements;
    
    if (comprimento && largura && diagonalDireita && diagonalEsquerda) {
      const ic = (largura / comprimento) * 100;
      const dd = Math.abs(diagonalDireita - diagonalEsquerda);
      const cv = calculateAsymmetry(comprimento, largura, diagonalDireita, diagonalEsquerda);

      setMeasurements(prev => ({
        ...prev,
        indiceCraniano: parseFloat(ic.toFixed(2)),
        diferencaDiagonais: parseFloat(dd.toFixed(2)),
        cvai: parseFloat(cv.toFixed(2))
      }));
    } else {
      setMeasurements(prev => ({
        ...prev,
        indiceCraniano: null,
        diferencaDiagonais: null,
        cvai: null
      }));
    }
  }, [measurements.comprimento, measurements.largura, measurements.diagonalDireita, measurements.diagonalEsquerda]);

  const handleInputChange = (field: string, value: number | null) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));
  };

  const resetMeasurements = () => {
    setMeasurements({
      comprimento: null,
      largura: null,
      diagonalDireita: null,
      diagonalEsquerda: null,
      perimetroCefalico: null,
      indiceCraniano: null,
      diferencaDiagonais: null,
      cvai: null
    });
  };

  const getSeverityLevel = (): SeverityLevel => {
    if (measurements.cvai === null) return "normal";

    if (measurements.cvai <= 2.5) {
      return "normal";
    } else if (measurements.cvai <= 5) {
      return "leve";
    } else if (measurements.cvai <= 7.5) {
      return "moderada";
    } else {
      return "severa";
    }
  };

  return {
    measurements,
    handleInputChange,
    resetMeasurements,
    getSeverityLevel
  };
};
