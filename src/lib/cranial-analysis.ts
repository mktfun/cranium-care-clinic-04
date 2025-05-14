import { AsymmetryType, SeverityLevel } from "@/types";

// Interfaces for the measurement data
export interface CranialMeasurement {
  comprimento: number;
  largura: number;
  diagonalD: number;
  diagonalE: number;
  perimetroCefalico?: number;
  idade: number; // idade em meses
  data: string;
}

// Interface for the classification of the asymmetry
export interface AsymmetryClassification {
  type: AsymmetryType;
  severity: SeverityLevel;
  description: string;
}

// Function to calculate the cranial index
export function calculateCranialIndex(width: number, length: number): number {
  return (width / length) * 100;
}

// Function to calculate the CVAI (Cranial Vault Asymmetry Index)
export function calculateCVAI(diagonalA: number, diagonalB: number): number {
  const shortDiagonal = Math.min(diagonalA, diagonalB);
  const longDiagonal = Math.max(diagonalA, diagonalB);
  return ((longDiagonal - shortDiagonal) / longDiagonal) * 100;
}

// Function to determine the severity level of the asymmetry based on type and measurements
export function determineSeverityLevel(
  asymmetryType: AsymmetryType, 
  cranialIndex: number, 
  cvai: number
): SeverityLevel {
  if (asymmetryType === "Normal") {
    return "normal";
  }
  
  // For Braquicefalia/Dolicocefalia (according to protocol)
  if (asymmetryType === "Braquicefalia") {
    if (cranialIndex >= 90) return "severa";
    if (cranialIndex >= 85) return "moderada";
    return "leve";
  }
  
  if (asymmetryType === "Dolicocefalia") {
    if (cranialIndex <= 70) return "severa";
    if (cranialIndex <= 73) return "moderada";
    return "leve";
  }
  
  // For Plagiocefalia (according to protocol)
  if (asymmetryType === "Plagiocefalia" || asymmetryType === "Misto") {
    if (cvai >= 8.5) return "severa";
    if (cvai >= 6.25) return "moderada";
    return "leve";
  }
  
  return "leve"; // Default fallback
}

// Função para determinar o tipo de assimetria craniana com base no índice craniano e CVAI
export function determineAsymmetryType(cranialIndex: number, cvai: number): AsymmetryType {
  // Critérios baseados nos protocolos fornecidos
  const hasBrachy = cranialIndex >= 81;
  const hasDolich = cranialIndex <= 76;
  const hasPlagi = cvai >= 3.5;
  
  if (hasBrachy && hasPlagi) {
    return "Misto";
  } else if (hasDolich && hasPlagi) {
    return "Misto";
  } else if (hasBrachy) {
    return "Braquicefalia";
  } else if (hasDolich) {
    return "Dolicocefalia";
  } else if (hasPlagi) {
    return "Plagiocefalia";
  } else {
    return "Normal";
  }
}

// Função para traduzir a classificação para texto legível
export function formatAsymmetryStatus(asymmetryType: AsymmetryType, severity: SeverityLevel): string {
  if (asymmetryType === "Normal") {
    return "Normal";
  }
  
  return `${asymmetryType} (${severity === 'normal' ? 'leve' : severity})`;
}

// Função para obter as recomendações terapêuticas com base no tipo e severidade
export function getTherapeuticRecommendations(
  asymmetryType: AsymmetryType, 
  severity: SeverityLevel,
  ageInMonths: number,
  cranialIndexValue?: number
): string[] {
  const recommendations: string[] = [];
  
  if (asymmetryType === "Normal") {
    recommendations.push("Manter acompanhamento regular do desenvolvimento craniano.");
    return recommendations;
  }
  
  // Recomendações gerais por severidade
  if (severity === "leve") {
    recommendations.push("Reposicionamento ativo durante períodos de vigília.");
    recommendations.push("Exercícios de fisioterapia para fortalecimento cervical.");
    
    if (ageInMonths <= 6) {
      recommendations.push("Priorizar tempo de barriga para baixo (tummy time) supervisionado.");
    }
  }
  
  if (severity === "moderada") {
    recommendations.push("Programa intensivo de reposicionamento e fisioterapia.");
    recommendations.push("Considerar uso de travesseiro terapêutico específico.");
    
    if (ageInMonths >= 6 && ageInMonths <= 12) {
      recommendations.push("Avaliar necessidade de órtese craniana nas próximas 4-6 semanas se não houver melhora.");
    }
  }
  
  if (severity === "severa") {
    recommendations.push("Encaminhamento para avaliação especializada de órtese craniana.");
    
    if (asymmetryType === "Braquicefalia" && cranialIndexValue && cranialIndexValue >= 95) {
      recommendations.push("Considerar avaliação neurocirúrgica.");
    }
    
    if (asymmetryType === "Plagiocefalia" && ageInMonths <= 12) {
      recommendations.push("Iniciar tratamento com capacete ortopédico o mais breve possível.");
    }
  }
  
  // Recomendações específicas por tipo
  if (asymmetryType === "Braquicefalia" || asymmetryType === "Misto") {
    recommendations.push("Evitar longos períodos na posição supina (de costas).");
    recommendations.push("Alternar posição da cabeça durante o sono.");
  }
  
  if (asymmetryType === "Dolicocefalia") {
    recommendations.push("Evitar posicionamento lateral prolongado.");
    recommendations.push("Avaliar possível prematuridade e ajustar expectativas de desenvolvimento.");
  }
  
  if (asymmetryType === "Plagiocefalia" || asymmetryType === "Misto") {
    recommendations.push("Alternar lado da cabeça durante alimentação e sono.");
    recommendations.push("Verificar possível torcicolo ou preferência posicional.");
  }
  
  return recommendations;
}

// Função completa para análise craniana que combina todos os cálculos e avaliações
export function analyzeCranialMeasurement(measurement: CranialMeasurement): {
  cranialIndex: number;
  cvai: number;
  differentialDiagonal: number;
  asymmetryType: AsymmetryType;
  severity: SeverityLevel;
  formattedStatus: string;
  recommendations: string[];
} {
  const cranialIndex = calculateCranialIndex(measurement.largura, measurement.comprimento);
  const differentialDiagonal = Math.abs(measurement.diagonalD - measurement.diagonalE);
  const cvai = calculateCVAI(measurement.diagonalD, measurement.diagonalE);
  
  const asymmetryType = determineAsymmetryType(cranialIndex, cvai);
  const severity = determineSeverityLevel(asymmetryType, cranialIndex, cvai);
  const formattedStatus = formatAsymmetryStatus(asymmetryType, severity);
  const recommendations = getTherapeuticRecommendations(asymmetryType, severity, measurement.idade, cranialIndex);
  
  return {
    cranialIndex,
    cvai,
    differentialDiagonal,
    asymmetryType,
    severity,
    formattedStatus,
    recommendations,
  };
}

// Função para gerar dados para os gráficos de protocolos (referências)
export function generateProtocolReferenceData() {
  // Dados para o protocolo de Braquicefalia/Dolicocefalia (img 7)
  const brachyDolichoProtocolData = Array.from({ length: 19 }, (_, i) => {
    const ageInMonths = i;
    return {
      age: ageInMonths,
      normalLowerBound: 77,    // Limite inferior da zona normal
      normalUpperBound: 80,    // Limite superior da zona normal
      mildBrachyLowerBound: 81, // Braquicefalia leve - limite inferior
      mildBrachyUpperBound: 84, // Braquicefalia leve - limite superior
      moderateBrachyLowerBound: 85, // Braquicefalia moderada - limite inferior
      moderateBrachyUpperBound: 89, // Braquicefalia moderada - limite superior
      severeBrachyLowerBound: 90, // Braquicefalia severa - limite inferior
      mildDolichLowerBound: 74, // Dolicocefalia leve - limite inferior
      mildDolichUpperBound: 76, // Dolicocefalia leve - limite superior
      moderateDolichLowerBound: 71, // Dolicocefalia moderada - limite inferior
      moderateDolichUpperBound: 73, // Dolicocefalia moderada - limite superior
      severeDolichLowerBound: 70, // Dolicocefalia severa - limite inferior
      populationMean: 80      // Média da população (linha pontilhada)
    };
  });
  
  // Dados para o protocolo de Plagiocefalia (img 8)
  const plagioProtocolData = Array.from({ length: 19 }, (_, i) => {
    const ageInMonths = i;
    return {
      age: ageInMonths,
      normalUpperBound: 3.5, // Limite superior da zona normal
      mildLowerBound: 3.5,   // Plagiocefalia leve - limite inferior
      mildUpperBound: 6.25,  // Plagiocefalia leve - limite superior
      moderateLowerBound: 6.25, // Plagiocefalia moderada - limite inferior
      moderateUpperBound: 8.5,  // Plagiocefalia moderada - limite superior
      severeLowerBound: 8.5,    // Plagiocefalia severa - limite inferior
      populationMean: 2        // Média da população (linha pontilhada)
    };
  });
  
  return {
    brachyDolichoProtocolData,
    plagioProtocolData
  };
}

// Função para obter dados de curvas de crescimento por sexo
export function getHeadCircumferenceReferenceData(sex: 'M' | 'F') {
  // Valores aproximados baseados em curvas padrão WHO/CDC
  // Estes são valores simplificados para exemplo - em produção real, deve-se usar tabelas completas
  return Array.from({ length: 25 }, (_, i) => {
    const ageInMonths = i;
    
    // Valores diferentes para meninos e meninas
    const baseP50 = sex === 'M' ? 34.5 : 33.9; // Valor base para recém-nascidos
    const growthRate = sex === 'M' ? 0.7 : 0.65; // Taxa de crescimento mensal
    
    // Calcular valores de percentis para esta idade
    const p50 = baseP50 + (growthRate * ageInMonths * (1 - (ageInMonths * 0.01))); // Desacelera com a idade
    const p3 = p50 * 0.95;
    const p15 = p50 * 0.975;
    const p85 = p50 * 1.025;
    const p97 = p50 * 1.05;
    
    return {
      age: ageInMonths,
      p3,
      p15,
      p50,
      p85,
      p97,
      sex
    };
  });
}
