
import { type CranialDiagnosis, type IndividualClassification, generateCranialDiagnosis, getIndividualClassifications } from "./cranial-classification-utils";
import { getCHOAClassification, getCHOARecommendations, getCHOADiagnosis, type CHOAClassification } from "./choa-plagiocephaly-scale";

export type AsymmetryType = "Normal" | "Plagiocefalia" | "Braquicefalia" | "Dolicocefalia" | "Misto";
export type SeverityLevel = "normal" | "leve" | "moderada" | "severa";

export interface CranialStatusInfo {
  asymmetryType: AsymmetryType;
  severityLevel: SeverityLevel;
  diagnosis: CranialDiagnosis;
  individualClassifications: IndividualClassification;
  choaClassification: CHOAClassification;
  choaRecommendations: string[];
  choaDiagnosis: string;
}

/**
 * Obtém status craniano completo incluindo classificação CHOA
 */
export function getCranialStatus(indiceCraniano: number, cvai: number, idadeEmMeses?: number): CranialStatusInfo {
  // Usar o sistema de classificação científica existente
  const diagnosis = generateCranialDiagnosis(indiceCraniano, cvai);
  const individualClassifications = getIndividualClassifications(indiceCraniano, cvai);
  
  // Adicionar classificação CHOA específica para plagiocefalia
  const choaClassification = getCHOAClassification(cvai);
  const choaRecommendations = getCHOARecommendations(cvai, idadeEmMeses);
  const choaDiagnosis = getCHOADiagnosis(cvai);
  
  return {
    asymmetryType: diagnosis.type,
    severityLevel: diagnosis.severity,
    diagnosis,
    individualClassifications,
    choaClassification,
    choaRecommendations,
    choaDiagnosis
  };
}

/**
 * Valida se o perímetro cefálico está dentro da faixa esperada
 */
export function validatePerimetroCefalico(perimetro: number, idadeEmMeses: number, sexo: 'M' | 'F' = 'M'): {
  isValid: boolean;
  message?: string;
  percentil?: string;
} {
  // Valores aproximados baseados em curvas de crescimento WHO
  const referenceRanges = {
    'M': {
      0: { min: 320, max: 380, p50: 350 },
      3: { min: 380, max: 440, p50: 410 },
      6: { min: 410, max: 470, p50: 440 },
      12: { min: 430, max: 490, p50: 460 },
      24: { min: 450, max: 510, p50: 480 }
    },
    'F': {
      0: { min: 315, max: 375, p50: 345 },
      3: { min: 375, max: 435, p50: 405 },
      6: { min: 405, max: 465, p50: 435 },
      12: { min: 425, max: 485, p50: 455 },
      24: { min: 445, max: 505, p50: 475 }
    }
  };

  // Encontrar a faixa etária mais próxima
  const ageKeys = [0, 3, 6, 12, 24];
  const nearestAge = ageKeys.reduce((prev, curr) => 
    Math.abs(curr - idadeEmMeses) < Math.abs(prev - idadeEmMeses) ? curr : prev
  );

  const range = referenceRanges[sexo][nearestAge as keyof typeof referenceRanges['M']];

  if (perimetro < range.min) {
    return {
      isValid: false,
      message: `Perímetro abaixo do esperado para a idade. Considere investigação adicional.`,
      percentil: "< P3"
    };
  }

  if (perimetro > range.max) {
    return {
      isValid: false,
      message: `Perímetro acima do esperado para a idade. Considere investigação adicional.`,
      percentil: "> P97"
    };
  }

  return {
    isValid: true,
    message: "Perímetro cefálico dentro da faixa esperada",
    percentil: "P3-P97"
  };
}
