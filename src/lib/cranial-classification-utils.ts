/**
 * Cranial Classification Utilities
 * Based on "Guia Completo de Classificação - Medições e Diagnósticos Cranianos (Maio de 2025)"
 * 
 * This file implements the official classification logic for cranial deformities,
 * including individual classifications and mixed case logic.
 */

export type CranialSeverity = "normal" | "leve" | "moderada" | "severa"; // Changed "grave" to "severa"
export type CranialType = "Normal" | "Plagiocefalia" | "Braquicefalia" | "Dolicocefalia" | "Misto";

export interface IndividualClassification {
  plagiocefalia: CranialSeverity;
  braquicefalia: CranialSeverity;
  dolicocefalia: CranialSeverity;
}

export interface CranialDiagnosis {
  type: CranialType;
  severity: CranialSeverity;
  diagnosis: string; // Full diagnosis text (e.g., "Misto Moderado", "Plagiocefalia Leve")
}

/**
 * Classifica Plagiocefalia baseado no CVAI
 * Tabela de Classificação por CVAI (%)
 */
export function classifyPlagiocefalia(cvai: number): CranialSeverity {
  if (cvai < 3.5) return "normal";
  if (cvai >= 3.5 && cvai <= 6.25) return "leve";
  if (cvai >= 6.25 && cvai <= 8.75) return "moderada";
  return "severa"; // > 8.75% (changed from "grave" to "severa")
}

/**
 * Classifica Braquicefalia baseado no Índice Craniano
 * Tabela de Classificação por Índice Craniano (%)
 */
export function classifyBraquicefalia(indiceCraniano: number): CranialSeverity {
  if (indiceCraniano >= 75 && indiceCraniano <= 85) return "normal";
  if (indiceCraniano >= 86 && indiceCraniano <= 90) return "leve";
  if (indiceCraniano >= 91 && indiceCraniano <= 95) return "moderada";
  if (indiceCraniano > 95) return "severa"; // changed from "grave" to "severa"
  
  // Se for menor que 75%, não é braquicefalia
  return "normal";
}

/**
 * Classifica Dolicocefalia baseado no Índice Craniano
 * Tabela de Classificação por Índice Craniano (%)
 */
export function classifyDolicocefalia(indiceCraniano: number): CranialSeverity {
  if (indiceCraniano >= 75 && indiceCraniano <= 85) return "normal";
  if (indiceCraniano >= 70 && indiceCraniano <= 74) return "leve";
  if (indiceCraniano >= 65 && indiceCraniano <= 69) return "moderada";
  if (indiceCraniano < 65) return "severa"; // changed from "grave" to "severa"
  
  // Se for maior que 85%, não é dolicocefalia
  return "normal";
}

/**
 * Obtém as classificações individuais de todas as condições
 */
export function getIndividualClassifications(indiceCraniano: number, cvai: number): IndividualClassification {
  return {
    plagiocefalia: classifyPlagiocefalia(cvai),
    braquicefalia: classifyBraquicefalia(indiceCraniano),
    dolicocefalia: classifyDolicocefalia(indiceCraniano)
  };
}

/**
 * Determina o nível de severidade mais alto entre todas as condições
 */
export function getMostSevereSeverity(classifications: IndividualClassification): CranialSeverity {
  const severities = [
    classifications.plagiocefalia,
    classifications.braquicefalia,
    classifications.dolicocefalia
  ];
  
  // Ordem de prioridade: severa > moderada > leve > normal (changed "grave" to "severa")
  if (severities.includes("severa")) return "severa";
  if (severities.includes("moderada")) return "moderada";
  if (severities.includes("leve")) return "leve";
  return "normal";
}

/**
 * Conta quantas condições não são normais
 */
export function countAbnormalConditions(classifications: IndividualClassification): number {
  let count = 0;
  if (classifications.plagiocefalia !== "normal") count++;
  if (classifications.braquicefalia !== "normal") count++;
  if (classifications.dolicocefalia !== "normal") count++;
  return count;
}

/**
 * Determina o tipo de condição predominante (usado quando há apenas uma condição)
 */
export function getPredominantConditionType(classifications: IndividualClassification): CranialType {
  const abnormalCount = countAbnormalConditions(classifications);
  
  if (abnormalCount === 0) return "Normal";
  if (abnormalCount > 1) return "Misto";
  
  // Apenas uma condição anormal
  if (classifications.plagiocefalia !== "normal") return "Plagiocefalia";
  if (classifications.braquicefalia !== "normal") return "Braquicefalia";
  if (classifications.dolicocefalia !== "normal") return "Dolicocefalia";
  
  return "Normal";
}

/**
 * Gera o diagnóstico completo baseado na Tabela de Classificação para Casos Mistos
 * 
 * PRINCÍPIO FUNDAMENTAL: A classificação de casos mistos deve sempre refletir 
 * a condição mais grave entre as deformidades presentes.
 */
export function generateCranialDiagnosis(indiceCraniano: number, cvai: number): CranialDiagnosis {
  const classifications = getIndividualClassifications(indiceCraniano, cvai);
  const mostSevere = getMostSevereSeverity(classifications);
  const conditionType = getPredominantConditionType(classifications);
  
  // Se apenas uma condição ou normal
  if (conditionType === "Normal") {
    return {
      type: "Normal",
      severity: "normal",
      diagnosis: "Normal"
    };
  }
  
  if (conditionType === "Plagiocefalia") {
    const severityText = classifications.plagiocefalia === "severa" ? "Grave" : classifications.plagiocefalia.charAt(0).toUpperCase() + classifications.plagiocefalia.slice(1);
    return {
      type: "Plagiocefalia",
      severity: classifications.plagiocefalia,
      diagnosis: `Plagiocefalia ${severityText}`
    };
  }
  
  if (conditionType === "Braquicefalia") {
    const severityText = classifications.braquicefalia === "severa" ? "Grave" : classifications.braquicefalia.charAt(0).toUpperCase() + classifications.braquicefalia.slice(1);
    return {
      type: "Braquicefalia",
      severity: classifications.braquicefalia,
      diagnosis: `Braquicefalia ${severityText}`
    };
  }
  
  if (conditionType === "Dolicocefalia") {
    const severityText = classifications.dolicocefalia === "severa" ? "Grave" : classifications.dolicocefalia.charAt(0).toUpperCase() + classifications.dolicocefalia.slice(1);
    return {
      type: "Dolicocefalia",
      severity: classifications.dolicocefalia,
      diagnosis: `Dolicocefalia ${severityText}`
    };
  }
  
  // Caso Misto - aplicar o princípio da condição mais grave
  if (conditionType === "Misto") {
    const severityText = mostSevere === "severa" ? "Grave" : mostSevere.charAt(0).toUpperCase() + mostSevere.slice(1);
    return {
      type: "Misto",
      severity: mostSevere,
      diagnosis: `Misto ${severityText}`
    };
  }
  
  // Fallback
  return {
    type: "Normal",
    severity: "normal",
    diagnosis: "Normal"
  };
}

/**
 * Obtém a classificação individual para exibição
 */
export function getIndividualClassificationText(type: "plagiocefalia" | "braquicefalia" | "dolicocefalia", severity: CranialSeverity): string {
  if (severity === "normal") return "Normal";
  const severityText = severity.charAt(0).toUpperCase() + severity.slice(1);
  return `${severityText}`;
}

/**
 * Obtém informações de severidade para exibição na UI
 */
export function getSeverityInfo(severity: CranialSeverity) {
  switch (severity) {
    case "normal":
      return {
        label: "Normal",
        variant: "default",
        className: "bg-green-100 text-green-800"
      };
    case "leve":
      return {
        label: "Leve",
        variant: "secondary",
        className: "bg-yellow-100 text-yellow-800"
      };
    case "moderada":
      return {
        label: "Moderada", 
        variant: "destructive",
        className: "bg-orange-100 text-orange-800"
      };
    case "severa":
      return {
        label: "Severa",
        variant: "destructive", 
        className: "bg-red-100 text-red-800"
      };
    default:
      return {
        label: "Desconhecido",
        variant: "outline",
        className: "bg-gray-100 text-gray-800"
      };
  }
}

/**
 * Testa a lógica com o Exemplo 1 do guia
 * Dados: Comprimento: 143mm, Largura: 135mm, Diagonal D: 145mm, Diagonal E: 138mm
 * IC: 94.4%, CVAI: 4.83%
 * Resultado Esperado: "Misto Moderado"
 */
export function testExample1(): boolean {
  const comprimento = 143;
  const largura = 135;
  const diagonalD = 145;
  const diagonalE = 138;
  
  const indiceCraniano = (largura / comprimento) * 100; // 94.4%
  const cvai = ((diagonalD - diagonalE) / diagonalD) * 100; // 4.83%
  
  const diagnosis = generateCranialDiagnosis(indiceCraniano, cvai);
  
  // Deve retornar "Misto Moderado"
  return diagnosis.diagnosis === "Misto Moderado";
}
