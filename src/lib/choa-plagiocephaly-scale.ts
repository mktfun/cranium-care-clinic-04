
/**
 * Escala de Severidade da Plagiocefalia - Children's Healthcare of Atlanta (CHOA)
 * Baseada na tabela oficial para diagnóstico e recomendações de tratamento
 */

export type CHOALevel = 1 | 2 | 3 | 4 | 5;

export interface CHOAClassification {
  level: CHOALevel;
  clinicalPresentation: string;
  recommendation: string;
  cvaiRange: string;
  severity: "normal" | "leve" | "moderada" | "severa";
  needsTreatment: boolean;
  urgency: "none" | "monitoring" | "conservative" | "orthosis" | "urgent";
}

/**
 * Classifica o nível CHOA baseado no CVAI
 */
export function getCHOALevel(cvai: number): CHOALevel {
  if (cvai < 3.5) return 1;
  if (cvai >= 3.5 && cvai <= 6.25) return 2;
  if (cvai > 6.25 && cvai <= 8.75) return 3;
  if (cvai > 8.75 && cvai <= 11.0) return 4;
  return 5; // > 11.0
}

/**
 * Obtém a classificação completa CHOA
 */
export function getCHOAClassification(cvai: number): CHOAClassification {
  const level = getCHOALevel(cvai);
  
  switch (level) {
    case 1:
      return {
        level: 1,
        clinicalPresentation: "Simetria dentro dos limites normais",
        recommendation: "Nenhum tratamento necessário",
        cvaiRange: "< 3,5%",
        severity: "normal",
        needsTreatment: false,
        urgency: "none"
      };
      
    case 2:
      return {
        level: 2,
        clinicalPresentation: "Assimetria mínima em um quadrante posterior. Sem alterações secundárias.",
        recommendation: "Programa de reposicionamento. Fisioterapia se torcicolo associado.",
        cvaiRange: "3,5% a 6,25%",
        severity: "leve",
        needsTreatment: true,
        urgency: "monitoring"
      };
      
    case 3:
      return {
        level: 3,
        clinicalPresentation: "Envolvimento de dois quadrantes. Achatamento posterior moderado a severo. Mínimo desalinhamento auricular e/ou frontal.",
        recommendation: "Tratamento conservador: Reposicionamento intensivo, fisioterapia. Remodelação craniana baseada na idade e histórico.",
        cvaiRange: "6,25% a 8,75%",
        severity: "moderada",
        needsTreatment: true,
        urgency: "conservative"
      };
      
    case 4:
      return {
        level: 4,
        clinicalPresentation: "Envolvimento de dois ou três quadrantes. Achatamento posterior severo. Desalinhamento auricular moderado. Envolvimento anterior incluindo assimetria orbital perceptível.",
        recommendation: "Tratamento conservador: Órtese craniana geralmente recomendada. Fisioterapia.",
        cvaiRange: "8,75% a 11,0%",
        severity: "severa",
        needsTreatment: true,
        urgency: "orthosis"
      };
      
    case 5:
      return {
        level: 5,
        clinicalPresentation: "Envolvimento de três ou quatro quadrantes. Achatamento posterior severo. Desalinhamento auricular severo. Envolvimento anterior incluindo assimetria orbital e da bochecha.",
        recommendation: "Tratamento conservador: Órtese craniana fortemente recomendada. Fisioterapia.",
        cvaiRange: "> 11,0%",
        severity: "severa",
        needsTreatment: true,
        urgency: "urgent"
      };
      
    default:
      return getCHOAClassification(0); // Fallback para nível 1
  }
}

/**
 * Gera recomendações detalhadas baseadas no nível CHOA
 */
export function getCHOARecommendations(cvai: number, idadeEmMeses?: number): string[] {
  const classification = getCHOAClassification(cvai);
  const recommendations: string[] = [];
  
  switch (classification.level) {
    case 1:
      recommendations.push("Manter acompanhamento preventivo do desenvolvimento craniano");
      recommendations.push("Continuar práticas de prevenção (variação de posição durante o sono)");
      break;
      
    case 2:
      recommendations.push("Implementar programa de reposicionamento ativo");
      recommendations.push("Aumentar tempo supervisionado de barriga para baixo (tummy time)");
      recommendations.push("Orientação aos pais sobre posicionamento correto");
      if (idadeEmMeses && idadeEmMeses < 6) {
        recommendations.push("Avaliação para torcicolo muscular congênito");
      }
      break;
      
    case 3:
      recommendations.push("Programa intensivo de reposicionamento e fisioterapia");
      recommendations.push("Exercícios específicos para fortalecimento cervical");
      recommendations.push("Considerar uso de travesseiro terapêutico específico");
      if (idadeEmMeses && idadeEmMeses < 8) {
        recommendations.push("Avaliar necessidade de órtese craniana nas próximas 4-6 semanas");
      }
      recommendations.push("Reavaliação em 4-6 semanas para monitorar progresso");
      break;
      
    case 4:
      recommendations.push("Encaminhamento para avaliação de órtese craniana recomendado");
      recommendations.push("Fisioterapia especializada em desenvolvimento craniano");
      recommendations.push("Programa estruturado de reposicionamento");
      if (idadeEmMeses && idadeEmMeses >= 4 && idadeEmMeses <= 12) {
        recommendations.push("Órtese craniana (capacete) geralmente indicada nesta faixa etária");
      }
      recommendations.push("Acompanhamento mensal durante o tratamento");
      break;
      
    case 5:
      recommendations.push("Encaminhamento URGENTE para especialista em órtese craniana");
      recommendations.push("Avaliação multidisciplinar recomendada");
      recommendations.push("Fisioterapia intensiva imediata");
      if (idadeEmMeses && idadeEmMeses <= 15) {
        recommendations.push("Órtese craniana FORTEMENTE recomendada");
        recommendations.push("Iniciar tratamento o mais breve possível");
      }
      recommendations.push("Considerar avaliação com neurocirurgião pediátrico");
      break;
  }
  
  return recommendations;
}

/**
 * Gera diagnóstico textual baseado na escala CHOA
 */
export function getCHOADiagnosis(cvai: number): string {
  const classification = getCHOAClassification(cvai);
  
  if (classification.level === 1) {
    return "Desenvolvimento craniano normal";
  }
  
  const severityText = classification.severity === "severa" ? "Grave" : 
                      classification.severity.charAt(0).toUpperCase() + classification.severity.slice(1);
  
  return `Plagiocefalia Posicional ${severityText} (Nível CHOA ${classification.level})`;
}

/**
 * Verifica se necessita tratamento urgente
 */
export function needsUrgentCare(cvai: number): boolean {
  const classification = getCHOAClassification(cvai);
  return classification.urgency === "urgent" || classification.urgency === "orthosis";
}

/**
 * Obtém a cor de status baseada no nível CHOA
 */
export function getCHOAStatusColor(cvai: number): string {
  const level = getCHOALevel(cvai);
  
  switch (level) {
    case 1: return "text-green-600 bg-green-50 border-green-200";
    case 2: return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case 3: return "text-orange-600 bg-orange-50 border-orange-200";
    case 4: return "text-red-600 bg-red-50 border-red-200";
    case 5: return "text-red-800 bg-red-100 border-red-300";
    default: return "text-gray-600 bg-gray-50 border-gray-200";
  }
}
