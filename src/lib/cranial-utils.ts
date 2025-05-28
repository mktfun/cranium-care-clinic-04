// Define types for asymmetry and severity
export type AsymmetryType = "Braquicefalia" | "Dolicocefalia" | "Plagiocefalia" | "Misto" | "Normal";
export type SeverityLevel = "normal" | "leve" | "moderada" | "severa";

// Threshold values
const CVAI_THRESHOLDS = {
  NORMAL: 3.5,
  LEVE: 6.25,
  MODERADA: 8.75,
  // Above 8.75 is considered 'severa'
};

const IC_THRESHOLDS = {
  DOLICOCEFALIA_UPPER: 76, // Below this is dolicocefalia
  NORMAL_UPPER: 81, // 76-81 is normal
  BRAQUICEFALIA_MODERATE: 90, // 81-90 is moderate braquicefalia
  // Above 90 is severe braquicefalia
};

// Limites para perímetro cefálico (em milímetros)
export const PERIMETRO_CEFALICO_LIMITS = {
  MIN_0_6_MESES: 320,  // 32cm
  MAX_0_6_MESES: 440,  // 44cm
  MIN_6_12_MESES: 400, // 40cm
  MAX_6_12_MESES: 490, // 49cm
  MIN_1_2_ANOS: 450,   // 45cm
  MAX_1_2_ANOS: 520,   // 52cm
  MIN_2_5_ANOS: 480,   // 48cm
  MAX_2_5_ANOS: 550,   // 55cm
  MIN_ADULTO: 500,     // 50cm
  MAX_ADULTO: 650      // 65cm
};

// Função para validar o perímetro cefálico com base na idade
export function validatePerimetroCefalico(perimetroCefalico: number, dataNascimento: string): {
  isValid: boolean;
  message?: string;
} {
  if (!perimetroCefalico || perimetroCefalico <= 0) {
    return { isValid: false, message: "Perímetro cefálico deve ser maior que zero" };
  }

  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  const idadeEmMeses = (hoje.getFullYear() - nascimento.getFullYear()) * 12 + 
                        (hoje.getMonth() - nascimento.getMonth());
  
  let minLimit: number;
  let maxLimit: number;
  
  if (idadeEmMeses <= 6) {
    minLimit = PERIMETRO_CEFALICO_LIMITS.MIN_0_6_MESES;
    maxLimit = PERIMETRO_CEFALICO_LIMITS.MAX_0_6_MESES;
  } else if (idadeEmMeses <= 12) {
    minLimit = PERIMETRO_CEFALICO_LIMITS.MIN_6_12_MESES;
    maxLimit = PERIMETRO_CEFALICO_LIMITS.MAX_6_12_MESES;
  } else if (idadeEmMeses <= 24) {
    minLimit = PERIMETRO_CEFALICO_LIMITS.MIN_1_2_ANOS;
    maxLimit = PERIMETRO_CEFALICO_LIMITS.MAX_1_2_ANOS;
  } else if (idadeEmMeses <= 60) {
    minLimit = PERIMETRO_CEFALICO_LIMITS.MIN_2_5_ANOS;
    maxLimit = PERIMETRO_CEFALICO_LIMITS.MAX_2_5_ANOS;
  } else {
    minLimit = PERIMETRO_CEFALICO_LIMITS.MIN_ADULTO;
    maxLimit = PERIMETRO_CEFALICO_LIMITS.MAX_ADULTO;
  }
  
  if (perimetroCefalico < minLimit) {
    return { 
      isValid: false, 
      message: `Valor muito baixo para a idade (mín: ${minLimit}mm)`
    };
  }
  
  if (perimetroCefalico > maxLimit) {
    return {
      isValid: false,
      message: `Valor muito alto para a idade (máx: ${maxLimit}mm)`
    };
  }
  
  return { isValid: true };
}

import { 
  generateCranialDiagnosis, 
  getIndividualClassifications,
  getIndividualClassificationText,
  type CranialDiagnosis,
  type IndividualClassification
} from './cranial-classification-utils';

interface CranialStatus {
  asymmetryType: AsymmetryType;
  severityLevel: SeverityLevel;
}

/**
 * Gets cranial status using the official classification system
 * This function now uses the new classification logic from cranial-classification-utils
 */
export function getCranialStatus(indiceCraniano: number, cvai: number): {
  asymmetryType: AsymmetryType;
  severityLevel: SeverityLevel;
  diagnosis: CranialDiagnosis;
  individualClassifications: IndividualClassification;
} {
  // Get the official diagnosis using the new classification system
  const diagnosis = generateCranialDiagnosis(indiceCraniano, cvai);
  const individualClassifications = getIndividualClassifications(indiceCraniano, cvai);
  
  // Map the new diagnosis type to existing AsymmetryType for backward compatibility
  let asymmetryType: AsymmetryType;
  switch (diagnosis.type) {
    case "Plagiocefalia":
      asymmetryType = "Plagiocefalia";
      break;
    case "Braquicefalia":
      asymmetryType = "Braquicefalia";
      break;
    case "Dolicocefalia":
      asymmetryType = "Dolicocefalia";
      break;
    case "Misto":
      asymmetryType = "Misto";
      break;
    default:
      asymmetryType = "Normal";
  }
  
  // Map severity from new system to existing SeverityLevel
  let severityLevel: SeverityLevel;
  severityLevel = diagnosis.severity as SeverityLevel;
  
  return {
    asymmetryType,
    severityLevel,
    diagnosis,
    individualClassifications
  };
}
