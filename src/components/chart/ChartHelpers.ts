
// Helper functions for chart rendering

import { calculateAge } from "@/lib/age-utils";

// Types
export interface ChartDataPoint {
  idadeEmMeses: number;
  idadeFormatada: string;
  comprimento?: number;
  largura?: number;
  diagonal_d?: number;
  diagonal_e?: number;
  diferenca_diagonais?: number;
  indice_craniano?: number;
  cvai?: number;
  perimetro_cefalico?: number;
  paciente: boolean | null;
  id?: string;
  [key: string]: any;
}

// Function to process medicoes data for charts
export function processChartData(medicoes: any[], dataNascimento: string): ChartDataPoint[] {
  return [...medicoes]
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .map((medicao) => {
      const { months, days } = calculateAge(dataNascimento, medicao.data);
      const idadeMeses = months + (days / 30); // Aproximada em meses decimais para gráfico
      
      return {
        ...medicao,
        idadeEmMeses: idadeMeses,
        idadeFormatada: `${months} ${months === 1 ? 'mês' : 'meses'}${days > 0 ? ` e ${days} ${days === 1 ? 'dia' : 'dias'}` : ''}`,
        comprimento: Number(medicao.comprimento),
        largura: Number(medicao.largura),
        diagonal_d: Number(medicao.diagonal_d || medicao.diagonalD),
        diagonal_e: Number(medicao.diagonal_e || medicao.diagonalE),
        diferenca_diagonais: Number(medicao.diferenca_diagonais || medicao.diferencaDiagonais),
        indice_craniano: Number(medicao.indice_craniano || medicao.indiceCraniano),
        cvai: Number(medicao.cvai),
        perimetro_cefalico: medicao.perimetro_cefalico || medicao.perimetroCefalico ? 
          Number(medicao.perimetro_cefalico || medicao.perimetroCefalico) : undefined,
        paciente: true, // Marcar que são pontos do paciente
        id: medicao.id || `medicao-${Math.random()}`, // Garantir que sempre tenha um ID único
      };
    });
}

// Function to add reference data points
export function addReferenceData(
  data: ChartDataPoint[], 
  tipo: string, 
  sexo: string
): ChartDataPoint[] {
  if (data.length === 0) return [];
  
  // Obter a faixa de idade
  const minAge = 0;
  const maxAge = Math.max(...data.map(d => d.idadeEmMeses), 18) + 3; // Adiciona 3 meses para visualização futura
  
  // Criar array com pontos de referência para cada mês
  const referencePoints = Array.from({ length: Math.ceil(maxAge) + 1 }, (_, i) => ({
    idadeEmMeses: i,
    idadeFormatada: `${i} ${i === 1 ? 'mês' : 'meses'}`,
    paciente: null // Marcar que não são pontos do paciente
  }));
  
  // Adicionar dados específicos conforme o tipo de gráfico
  if (tipo === "indiceCraniano") {
    return addIndiceReferenceData([...data, ...referencePoints]);
  } else if (tipo === "cvai") {
    return addCvaiReferenceData([...data, ...referencePoints]);
  } else if (tipo === "diagonais") {
    return addDiagonaisReferenceData([...data, ...referencePoints]);
  } else if (tipo === "perimetro") {
    return addPerimetroReferenceData([...data, ...referencePoints], sexo);
  }
  
  return data;
}

// Add reference data for Cranial Index
export function addIndiceReferenceData(data: ChartDataPoint[]): ChartDataPoint[] {
  return data.map(point => ({
    ...point,
    // Limites para classificação de braquicefalia/dolicocefalia
    normalLowerBound: 76,
    normalUpperBound: 80,
    braquiLeve: 84,
    braquiModerada: 90,
    dolicoLeve: 73,
    dolicoModerada: 70,
    mediaPopulacional: 78
  }));
}

// Add reference data for CVAI
export function addCvaiReferenceData(data: ChartDataPoint[]): ChartDataPoint[] {
  return data.map(point => ({
    ...point,
    // Limites para classificação de plagiocefalia
    normal: 3.5,
    leve: 6.25,
    moderada: 8.5,
    mediaPopulacional: 2
  }));
}

// Add reference data for diagonal differences
export function addDiagonaisReferenceData(data: ChartDataPoint[]): ChartDataPoint[] {
  return data.map(point => ({
    ...point,
    // Valores de referência para diferença de diagonais
    normal: 3,
    leve: 6,
    moderada: 10,
    mediaPopulacional: 1.5
  }));
}

// Add reference data for head circumference
export function addPerimetroReferenceData(data: ChartDataPoint[], sexo: string): ChartDataPoint[] {
  return data.map(point => {
    const idadeMeses = point.idadeEmMeses;
    
    // Valores aproximados baseados em curvas de crescimento
    const baseP50 = sexo === 'M' ? 35 : 34;
    const growthRate = sexo === 'M' ? 1.5 : 1.4;
    let p50 = 0;
    
    // Cálculo do perímetro dependendo da faixa etária
    if (idadeMeses === 0) {
      p50 = baseP50;
    } else if (idadeMeses <= 3) {
      p50 = baseP50 + (growthRate * idadeMeses);
    } else if (idadeMeses <= 6) {
      p50 = baseP50 + (growthRate * 3) + (0.8 * (idadeMeses - 3));
    } else if (idadeMeses <= 12) {
      p50 = baseP50 + (growthRate * 3) + (0.8 * 3) + (0.5 * (idadeMeses - 6));
    } else {
      p50 = baseP50 + (growthRate * 3) + (0.8 * 3) + (0.5 * 6) + (0.3 * (idadeMeses - 12));
    }
    
    return {
      ...point,
      p3: p50 * 0.94,
      p15: p50 * 0.97,
      p50,
      p85: p50 * 1.03,
      p97: p50 * 1.06,
    };
  });
}

// Get line color based on theme
export function getLineColor(theme: string = "blue"): string {
  const colors = {
    blue: "rgba(37, 99, 235, 1)",
    green: "rgba(22, 163, 74, 1)",
    red: "rgba(220, 38, 38, 1)",
    purple: "rgba(139, 92, 246, 1)",
    amber: "rgba(217, 119, 6, 1)",
    orange: "rgba(234, 88, 12, 1)",
    rose: "rgba(225, 29, 72, 1)",
  };
  return colors[theme as keyof typeof colors] || colors.blue;
}

// Format X-axis tick labels
export function formatXAxisTick(value: number): string {
  if (value === Math.floor(value)) {
    return `${value}m`;
  }
  return '';
}
