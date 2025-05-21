
/**
 * Scientific Cranial Measurements Utility
 * Baseado no Acordo Craniométrico de Frankfurt e estudos científicos recentes
 * Referências:
 * - "Antropometric cranial measurements of normal newborn in Sergipe - Northeast of Brazil" (Arq Neuropsiquiatr 2007;65(3-B):896-899)
 * - Kurtas NE et al. "Evaluation of the relationship between age, sex, and cephalic index" Egyptian Journal of Forensic Sciences (2020)
 * - Organização Mundial de Saúde (OMS) - Curvas de Crescimento
 */

// Tipos de classificação do formato craniano baseados no Índice Cefálico (IC)
export type CephalicType = 
  | "Hiperdolicocefalia" 
  | "Dolicocefalia" 
  | "Mesocefalia" 
  | "Braquicefalia" 
  | "Hiperbraquicefalia";

// Interface para armazenar medidas cranianas científicas
export interface ScientificCranialMeasurements {
  // Medidas básicas (em milímetros)
  comprimentoMaximo: number;         // Comprimento máximo craniano (glabela ao opistocrânio)
  larguraMaxima: number;             // Largura máxima craniana (distância biparietal)
  perimetroCefalico: number;         // Maior circunferência occipitofrontal
  distanciaBiauricular?: number;     // Distância entre pontos pré-auriculares
  distanciaAnteroposteriror?: number; // Distância glabela-occipital
  
  // Cálculos derivados
  indiceCefalico: number;            // Índice Cefálico (IC)
  
  // Metadados
  dataAvaliacao: string;             // Data da avaliação
  idadePacienteMeses: number;        // Idade do paciente em meses
}

// Limiares para classificação do Índice Cefálico (valores internacionalmente reconhecidos)
export const CEPHALIC_INDEX_THRESHOLDS = {
  HYPERDOLICHO_UPPER: 71,  // Abaixo desse valor: hiperdolicocefalia
  DOLICHO_UPPER: 75,       // Entre 71-75: dolicocefalia 
  MESO_UPPER: 80,          // Entre 75-80: mesocefalia (normal)
  BRACHY_UPPER: 85,        // Entre 80-85: braquicefalia
  // Acima de 85: hiperbraquicefalia
};

// Curvas de referência para perímetro cefálico por idade em meses (baseadas na OMS)
// Valores aproximados em milímetros para percentis P3, P50 e P97
export const PC_REFERENCE_CURVES = {
  MASCULINO: [
    { idade: 0, p3: 320, p50: 347, p97: 373 },
    { idade: 3, p3: 385, p50: 410, p97: 440 },
    { idade: 6, p3: 410, p50: 438, p97: 465 },
    { idade: 9, p3: 425, p50: 452, p97: 480 },
    { idade: 12, p3: 438, p50: 464, p97: 491 },
    { idade: 18, p3: 450, p50: 477, p97: 504 },
    { idade: 24, p3: 459, p50: 485, p97: 512 },
    { idade: 36, p3: 470, p50: 496, p97: 523 },
    { idade: 48, p3: 477, p50: 503, p97: 530 },
    { idade: 60, p3: 482, p50: 508, p97: 535 }
  ],
  FEMININO: [
    { idade: 0, p3: 313, p50: 340, p97: 366 },
    { idade: 3, p3: 378, p50: 400, p97: 430 },
    { idade: 6, p3: 403, p50: 427, p97: 453 },
    { idade: 9, p3: 417, p50: 442, p97: 467 },
    { idade: 12, p3: 430, p50: 454, p97: 479 },
    { idade: 18, p3: 442, p50: 467, p97: 492 },
    { idade: 24, p3: 451, p50: 476, p97: 501 },
    { idade: 36, p3: 463, p50: 487, p97: 512 },
    { idade: 48, p3: 470, p50: 494, p97: 518 },
    { idade: 60, p3: 475, p50: 499, p97: 523 }
  ]
};

// Curvas de referência para o índice cefálico por idade (baseadas em estudos populacionais)
// Valores aproximados para percentis P10, P50 e P90
export const IC_REFERENCE_CURVES = [
  { idade: 0, p10: 74, p50: 78, p90: 83 },
  { idade: 3, p10: 73, p50: 77.5, p90: 82 },
  { idade: 6, p10: 73, p50: 77, p90: 81.5 },
  { idade: 9, p10: 72.5, p50: 76.5, p90: 81 },
  { idade: 12, p10: 72, p50: 76, p90: 80.5 },
  { idade: 24, p10: 71.5, p50: 75.5, p90: 80 },
  { idade: 36, p10: 71, p50: 75, p90: 79.5 },
  { idade: 48, p10: 71, p50: 75, p90: 79 },
  { idade: 60, p10: 71, p50: 75, p90: 79 }
];

/**
 * Calcula o Índice Cefálico (IC)
 * Fórmula: IC = (Largura Máxima / Comprimento Máximo) × 100
 */
export function calcularIndiceCefalico(larguraMaxima: number, comprimentoMaximo: number): number {
  if (!larguraMaxima || !comprimentoMaximo || comprimentoMaximo === 0) {
    return 0;
  }
  return (larguraMaxima / comprimentoMaximo) * 100;
}

/**
 * Classifica o formato craniano com base no Índice Cefálico
 */
export function classificarFormatoCraniano(indiceCefalico: number): CephalicType {
  if (indiceCefalico < CEPHALIC_INDEX_THRESHOLDS.HYPERDOLICHO_UPPER) {
    return "Hiperdolicocefalia";
  } else if (indiceCefalico < CEPHALIC_INDEX_THRESHOLDS.DOLICHO_UPPER) {
    return "Dolicocefalia";
  } else if (indiceCefalico < CEPHALIC_INDEX_THRESHOLDS.MESO_UPPER) {
    return "Mesocefalia";
  } else if (indiceCefalico < CEPHALIC_INDEX_THRESHOLDS.BRACHY_UPPER) {
    return "Braquicefalia";
  } else {
    return "Hiperbraquicefalia";
  }
}

/**
 * Obtém a cor associada ao tipo cefálico para visualizações
 */
export function getColorForCephalicType(tipo: CephalicType): string {
  switch (tipo) {
    case "Mesocefalia":
      return "#F2FCE2"; // Verde suave - normal
    case "Braquicefalia":
      return "#FEF7CD"; // Amarelo suave
    case "Hiperbraquicefalia":
      return "#FFDEE2"; // Rosa suave
    case "Dolicocefalia":
      return "#FEC6A1"; // Laranja suave
    case "Hiperdolicocefalia":
      return "#D3E4FD"; // Azul suave
    default:
      return "#F1F1F1"; // Cinza neutro
  }
}

/**
 * Avalia se o perímetro cefálico está dentro das faixas normais para idade e sexo
 * @returns Objeto com classificação e percentil aproximado
 */
export function avaliarPerimetroCefalico(
  perimetroCefalico: number, 
  idadeMeses: number, 
  sexo: 'M' | 'F'
): { classificacao: 'abaixo' | 'normal' | 'acima'; percentilAproximado: number } {
  // Seleciona a curva de referência correta
  const curvaSexo = sexo === 'M' ? PC_REFERENCE_CURVES.MASCULINO : PC_REFERENCE_CURVES.FEMININO;
  
  // Encontra o intervalo de idade mais próximo
  let idadeRef = curvaSexo[0];
  
  for (const faixa of curvaSexo) {
    if (faixa.idade <= idadeMeses) {
      idadeRef = faixa;
    } else {
      break;
    }
  }
  
  // Determina a classificação e percentil aproximado
  let classificacao: 'abaixo' | 'normal' | 'acima' = 'normal';
  let percentilAproximado = 50;
  
  if (perimetroCefalico < idadeRef.p3) {
    classificacao = 'abaixo';
    percentilAproximado = Math.max(0, Math.round((perimetroCefalico / idadeRef.p3) * 3));
  } else if (perimetroCefalico > idadeRef.p97) {
    classificacao = 'acima';
    percentilAproximado = Math.min(100, 97 + Math.round(((perimetroCefalico - idadeRef.p97) / (idadeRef.p97 * 0.05)) * 3));
  } else if (perimetroCefalico <= idadeRef.p50) {
    percentilAproximado = Math.round(3 + ((perimetroCefalico - idadeRef.p3) / (idadeRef.p50 - idadeRef.p3)) * 47);
  } else {
    percentilAproximado = Math.round(50 + ((perimetroCefalico - idadeRef.p50) / (idadeRef.p97 - idadeRef.p50)) * 47);
  }
  
  return { classificacao, percentilAproximado };
}

/**
 * Avalia se o índice cefálico está dentro das faixas normais para idade
 */
export function avaliarIndiceCefalico(
  indiceCefalico: number, 
  idadeMeses: number
): { classificacao: 'abaixo' | 'normal' | 'acima'; percentilAproximado: number } {
  // Encontra o intervalo de idade mais próximo
  let idadeRef = IC_REFERENCE_CURVES[0];
  
  for (const faixa of IC_REFERENCE_CURVES) {
    if (faixa.idade <= idadeMeses) {
      idadeRef = faixa;
    } else {
      break;
    }
  }
  
  // Determina a classificação e percentil aproximado
  let classificacao: 'abaixo' | 'normal' | 'acima' = 'normal';
  let percentilAproximado = 50;
  
  if (indiceCefalico < idadeRef.p10) {
    classificacao = 'abaixo';
    percentilAproximado = Math.max(0, Math.round((indiceCefalico / idadeRef.p10) * 10));
  } else if (indiceCefalico > idadeRef.p90) {
    classificacao = 'acima';
    percentilAproximado = Math.min(100, 90 + Math.round(((indiceCefalico - idadeRef.p90) / (idadeRef.p90 * 0.05)) * 10));
  } else if (indiceCefalico <= idadeRef.p50) {
    percentilAproximado = Math.round(10 + ((indiceCefalico - idadeRef.p10) / (idadeRef.p50 - idadeRef.p10)) * 40);
  } else {
    percentilAproximado = Math.round(50 + ((indiceCefalico - idadeRef.p50) / (idadeRef.p90 - idadeRef.p50)) * 40);
  }
  
  return { classificacao, percentilAproximado };
}

/**
 * Obtém recomendações clínicas baseadas nas medições
 */
export function getRecomendacoesCranianas(
  tipoCefalico: CephalicType, 
  idadeMeses: number, 
  classificacaoPC: 'abaixo' | 'normal' | 'acima'
): string[] {
  const recomendacoes: string[] = [];
  
  // Recomendações gerais baseadas no tipo cefálico
  if (tipoCefalico === "Mesocefalia") {
    recomendacoes.push("Formato craniano dentro da normalidade. Manter acompanhamento de rotina.");
  } 
  else if (tipoCefalico === "Braquicefalia") {
    recomendacoes.push("Braquicefalia identificada. Recomenda-se:");
    
    if (idadeMeses < 6) {
      recomendacoes.push("- Implementar programa de reposicionamento ativo supervisionado");
      recomendacoes.push("- Aumentar tempo de barriga para baixo durante momentos de vigília (tummy time)");
      recomendacoes.push("- Evitar tempo prolongado em dispositivos de retenção (bebê conforto, carrinhos)");
    } else if (idadeMeses < 12) {
      recomendacoes.push("- Continuar com reposicionamento ativo");
      recomendacoes.push("- Considerar avaliação especializada para possível terapia com órtese craniana");
    } else {
      recomendacoes.push("- Acompanhamento com especialista para avaliar necessidade de intervenção");
    }
  } 
  else if (tipoCefalico === "Hiperbraquicefalia") {
    recomendacoes.push("Hiperbraquicefalia identificada. Recomenda-se com urgência:");
    recomendacoes.push("- Avaliação com especialista (neurocirurgião pediátrico ou fisioterapeuta especializado)");
    recomendacoes.push("- Descartar possibilidade de cranioestenose");
    
    if (idadeMeses < 12) {
      recomendacoes.push("- Considerar terapia com órtese craniana após avaliação especializada");
    }
  } 
  else if (tipoCefalico === "Dolicocefalia") {
    recomendacoes.push("Dolicocefalia identificada. Recomenda-se:");
    
    if (idadeMeses < 6) {
      recomendacoes.push("- Avaliar possível preferência posicional lateral");
      recomendacoes.push("- Implementar estratégias de reposicionamento");
    }
    
    if (idadeMeses < 3) {
      recomendacoes.push("- Comum em bebês prematuros, geralmente resolve com o crescimento normal");
    }
  } 
  else if (tipoCefalico === "Hiperdolicocefalia") {
    recomendacoes.push("Hiperdolicocefalia identificada. Recomenda-se:");
    recomendacoes.push("- Avaliação com especialista para descartar cranioestenose sagital");
    recomendacoes.push("- Considerar exames complementares de imagem");
  }
  
  // Recomendações baseadas no perímetro cefálico
  if (classificacaoPC === 'abaixo') {
    recomendacoes.push("Perímetro cefálico abaixo do esperado para idade. Considerar:");
    recomendacoes.push("- Avaliação de padrão de crescimento global");
    recomendacoes.push("- Acompanhamento regular do desenvolvimento neuropsicomotor");
    
    if (idadeMeses < 12) {
      recomendacoes.push("- Avaliação nutricional e de ingesta calórica");
    }
  } 
  else if (classificacaoPC === 'acima') {
    recomendacoes.push("Perímetro cefálico acima do esperado para idade. Considerar:");
    recomendacoes.push("- Avaliação com neuropediatra para descartar hidrocefalia ou outras condições");
    recomendacoes.push("- Monitoramento mais frequente do crescimento craniano");
  }
  
  return recomendacoes;
}

/**
 * Calcula todas as medidas cranianas científicas a partir dos dados básicos
 */
export function calcularMedidasCranianasCompletas(
  comprimentoMaximo: number,
  larguraMaxima: number,
  perimetroCefalico: number,
  dataAvaliacao: string,
  dataNascimento: string,
  distanciaBiauricular?: number,
  distanciaAnteroposteriror?: number
): ScientificCranialMeasurements & { 
  tipoCefalico: CephalicType,
  corRepresentativa: string 
} {
  // Calcular idade em meses
  const dataAval = new Date(dataAvaliacao);
  const dataNasc = new Date(dataNascimento);
  const idadeMeses = 
    (dataAval.getFullYear() - dataNasc.getFullYear()) * 12 + 
    (dataAval.getMonth() - dataNasc.getMonth());
  
  // Calcular índice cefálico
  const indiceCefalico = calcularIndiceCefalico(larguraMaxima, comprimentoMaximo);
  
  // Classificar tipo cefálico
  const tipoCefalico = classificarFormatoCraniano(indiceCefalico);
  
  // Determinar cor representativa
  const corRepresentativa = getColorForCephalicType(tipoCefalico);
  
  // Construir e retornar o objeto com todas as medidas
  return {
    comprimentoMaximo,
    larguraMaxima,
    perimetroCefalico,
    distanciaBiauricular,
    distanciaAnteroposteriror,
    indiceCefalico,
    dataAvaliacao,
    idadePacienteMeses: idadeMeses,
    tipoCefalico,
    corRepresentativa
  };
}
