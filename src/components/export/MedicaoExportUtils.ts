import React from "react";
import { formatAge } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";
import { pdf } from "@react-pdf/renderer";
import { CranialMeasurementPDF } from "@/components/pdf/CranialMeasurementPDF";
import { CranialMeasurementPDFWithCharts } from "@/components/pdf/CranialMeasurementPDFWithCharts";

interface MedicaoExportable {
  data: string;
  indice_craniano?: number;
  cvai?: number;
  perimetro_cefalico?: number;
  comprimento_maximo?: number;
  largura_maxima?: number;
  diagonal_direita?: number;
  diagonal_esquerda?: number;
  diagonal_d?: number;
  diagonal_e?: number;
  diferenca_diagonais?: number;
  comprimento?: number;
  largura?: number;
}

interface PacienteExportable {
  nome: string;
  data_nascimento: string;
  sexo: 'M' | 'F';
}

export class MedicaoExportUtils {
  static exportToCSV(medicoes: MedicaoExportable[], paciente: PacienteExportable): void {
    if (!medicoes.length) return;

    const headers = [
      "Data", "Idade", "Perímetro Cefálico (mm)", "Comprimento Máximo (mm)", 
      "Largura Máxima (mm)", "Diagonal Direita (mm)", "Diagonal Esquerda (mm)", 
      "Diferença Diagonais (mm)", "Índice Craniano (%)", "CVAI (%)", 
      "Tipo de Assimetria", "Nível de Severidade"
    ];

    const rows = medicoes.map(medicao => {
      const { asymmetryType, severityLevel } = getCranialStatus(medicao.indice_craniano || 0, medicao.cvai || 0);
      const dataFormatada = new Date(medicao.data).toLocaleDateString('pt-BR');
      const idade = formatAge(paciente.data_nascimento, medicao.data);
      
      return [
        dataFormatada,
        idade,
        medicao.perimetro_cefalico || '',
        medicao.comprimento_maximo || medicao.comprimento || '',
        medicao.largura_maxima || medicao.largura || '',
        medicao.diagonal_direita || medicao.diagonal_d || '',
        medicao.diagonal_esquerda || medicao.diagonal_e || '',
        medicao.diferenca_diagonais || '',
        (medicao.indice_craniano || 0).toFixed(1),
        (medicao.cvai || 0).toFixed(1),
        this.translateAsymmetryType(asymmetryType),
        this.translateSeverityLevel(severityLevel)
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        if (cell && typeof cell === 'string' && cell.includes(',')) {
          return `"${cell}"`;
        }
        return cell;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `historico_medicoes_${paciente.nome.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async exportToPDF(
    medicao: MedicaoExportable, 
    paciente: PacienteExportable, 
    medicoes: MedicaoExportable[] = [],
    recomendacoes: string[] = [],
    clinicaInfo: { nome: string; profissional: string },
    includeCharts: boolean = false
  ): Promise<void> {
    try {
      const cranialStatus = getCranialStatus(medicao.indice_craniano || 0, medicao.cvai || 0);
      const idadeNaAvaliacao = formatAge(paciente.data_nascimento, medicao.data);
      
      const medicaoFormatada = {
        data: medicao.data,
        comprimento: medicao.comprimento || medicao.comprimento_maximo || 0,
        largura: medicao.largura || medicao.largura_maxima || 0,
        diagonal_d: medicao.diagonal_d || medicao.diagonal_direita || 0,
        diagonal_e: medicao.diagonal_e || medicao.diagonal_esquerda || 0,
        perimetro_cefalico: medicao.perimetro_cefalico,
        indice_craniano: medicao.indice_craniano || 0,
        diferenca_diagonais: medicao.diferenca_diagonais || 0,
        cvai: medicao.cvai || 0
      };

      // Escolher o componente PDF apropriado
      let pdfComponent;
      
      if (includeCharts && medicoes.length > 1) {
        // PDF com gráficos (2 páginas)
        pdfComponent = React.createElement(CranialMeasurementPDFWithCharts, {
          pacienteData: paciente,
          medicaoData: medicaoFormatada,
          idadeNaAvaliacao,
          diagnosis: cranialStatus.diagnosis,
          choaClassification: cranialStatus.choaClassification,
          recomendacoes,
          clinicaInfo,
          medicoes
        });
      } else {
        // PDF simples (1 página)
        pdfComponent = React.createElement(CranialMeasurementPDF, {
          pacienteData: paciente,
          medicaoData: medicaoFormatada,
          idadeNaAvaliacao,
          diagnosis: cranialStatus.diagnosis,
          choaClassification: cranialStatus.choaClassification,
          recomendacoes,
          clinicaInfo
        });
      }
      
      // Gerar o PDF
      const blob = await pdf(pdfComponent).toBlob();
      
      // Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const chartSuffix = includeCharts ? '-com-graficos' : '';
      link.download = `relatorio-craniano-${paciente.nome.replace(/\s+/g, '_').toLowerCase()}${chartSuffix}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      throw error;
    }
  }
  
  private static translateAsymmetryType(type: string): string {
    const translations: Record<string, string> = {
      "Normal": "Normal",
      "Plagiocefalia": "Plagiocefalia",
      "Braquicefalia": "Braquicefalia",
      "Dolicocefalia": "Dolicocefalia",
      "Misto": "Combinada"
    };
    return translations[type] || type;
  }
  
  private static translateSeverityLevel(level: string): string {
    const translations: Record<string, string> = {
      "normal": "Normal",
      "leve": "Leve",
      "moderada": "Moderada",
      "severa": "Severa"
    };
    return translations[level] || level;
  }
}
