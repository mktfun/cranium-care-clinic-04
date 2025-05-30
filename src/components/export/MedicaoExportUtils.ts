import React from "react";
import { formatAge } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { pdf } from "@react-pdf/renderer";
import { generateChartImages } from "@/lib/chart-to-image-utils";

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

// PDF Styles
const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#6E59A5',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  patientInfoSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 15,
  },
  patientInfoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: '35%',
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    width: '65%',
    color: '#666',
  },
  measurementSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#6E59A5',
    borderBottomWidth: 1,
    borderBottomColor: '#6E59A5',
    paddingBottom: 5,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: '#f8f9fa',
  },
  measurementRowAlt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  measurementLabel: {
    width: '65%',
    fontSize: 10,
  },
  measurementValue: {
    width: '35%',
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 10,
  },
  diagnosticSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f1f5f9',
    borderRadius: 5,
  },
  diagnosticText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 1.4,
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  recommendationItem: {
    marginBottom: 8,
    paddingLeft: 15,
    fontSize: 10,
    lineHeight: 1.3,
    color: '#475569',
  },
  chartsSection: {
    marginBottom: 25,
  },
  chartContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  chartImage: {
    width: 450,
    height: 300,
    objectFit: 'contain',
  },
  clinicInfo: {
    position: 'absolute',
    fontSize: 8,
    bottom: 30,
    left: 35,
    right: 35,
    textAlign: 'center',
    color: '#6b7280',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
});

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

      let chartImages;
      if (includeCharts && medicoes.length > 1) {
        try {
          chartImages = await generateChartImages(medicoes, paciente);
        } catch (error) {
          console.error('Erro ao gerar gráficos:', error);
        }
      }

      const formatarData = (dataString: string) => {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
      };
      
      // Criar o elemento PDF Document diretamente
      const pdfDocument = React.createElement(Document, {
        title: `Relatório de Avaliação Craniana - ${paciente.nome}`
      }, 
        React.createElement(Page, { size: "A4", style: styles.page },
          React.createElement(Text, { style: styles.title }, "Relatório de Avaliação Craniana"),
          React.createElement(Text, { style: styles.subtitle }, clinicaInfo.nome),
          
          // Informações do Paciente
          React.createElement(View, { style: styles.patientInfoSection },
            React.createElement(View, { style: styles.patientInfoRow },
              React.createElement(Text, { style: styles.label }, "Paciente:"),
              React.createElement(Text, { style: styles.value }, paciente.nome)
            ),
            React.createElement(View, { style: styles.patientInfoRow },
              React.createElement(Text, { style: styles.label }, "Data de Nascimento:"),
              React.createElement(Text, { style: styles.value }, formatarData(paciente.data_nascimento))
            ),
            React.createElement(View, { style: styles.patientInfoRow },
              React.createElement(Text, { style: styles.label }, "Sexo:"),
              React.createElement(Text, { style: styles.value }, paciente.sexo === 'M' ? 'Masculino' : 'Feminino')
            ),
            React.createElement(View, { style: styles.patientInfoRow },
              React.createElement(Text, { style: styles.label }, "Idade na Avaliação:"),
              React.createElement(Text, { style: styles.value }, idadeNaAvaliacao)
            ),
            React.createElement(View, { style: styles.patientInfoRow },
              React.createElement(Text, { style: styles.label }, "Data da Avaliação:"),
              React.createElement(Text, { style: styles.value }, formatarData(medicaoFormatada.data))
            )
          ),
          
          // Medições
          React.createElement(View, { style: styles.measurementSection },
            React.createElement(Text, { style: styles.sectionTitle }, "Medições Cranianas"),
            React.createElement(View, { style: styles.measurementRow },
              React.createElement(Text, { style: styles.measurementLabel }, "Comprimento Anteroposterior (AP):"),
              React.createElement(Text, { style: styles.measurementValue }, `${medicaoFormatada.comprimento.toFixed(1)} mm`)
            ),
            React.createElement(View, { style: styles.measurementRowAlt },
              React.createElement(Text, { style: styles.measurementLabel }, "Largura Mediolateral (ML):"),
              React.createElement(Text, { style: styles.measurementValue }, `${medicaoFormatada.largura.toFixed(1)} mm`)
            ),
            React.createElement(View, { style: styles.measurementRow },
              React.createElement(Text, { style: styles.measurementLabel }, "Diagonal Direita:"),
              React.createElement(Text, { style: styles.measurementValue }, `${medicaoFormatada.diagonal_d.toFixed(1)} mm`)
            ),
            React.createElement(View, { style: styles.measurementRowAlt },
              React.createElement(Text, { style: styles.measurementLabel }, "Diagonal Esquerda:"),
              React.createElement(Text, { style: styles.measurementValue }, `${medicaoFormatada.diagonal_e.toFixed(1)} mm`)
            ),
            medicaoFormatada.perimetro_cefalico ? React.createElement(View, { style: styles.measurementRow },
              React.createElement(Text, { style: styles.measurementLabel }, "Perímetro Cefálico:"),
              React.createElement(Text, { style: styles.measurementValue }, `${medicaoFormatada.perimetro_cefalico.toFixed(1)} mm`)
            ) : null,
            React.createElement(View, { style: styles.measurementRowAlt },
              React.createElement(Text, { style: styles.measurementLabel }, "Diferença de Diagonais:"),
              React.createElement(Text, { style: styles.measurementValue }, `${medicaoFormatada.diferenca_diagonais.toFixed(1)} mm`)
            ),
            React.createElement(View, { style: styles.measurementRow },
              React.createElement(Text, { style: styles.measurementLabel }, "Índice Craniano (CI):"),
              React.createElement(Text, { style: styles.measurementValue }, `${medicaoFormatada.indice_craniano.toFixed(1)}%`)
            ),
            React.createElement(View, { style: styles.measurementRowAlt },
              React.createElement(Text, { style: styles.measurementLabel }, "CVAI (Índice de Assimetria):"),
              React.createElement(Text, { style: styles.measurementValue }, `${medicaoFormatada.cvai.toFixed(1)}%`)
            )
          ),
          
          // Diagnóstico
          React.createElement(View, { style: styles.diagnosticSection },
            React.createElement(Text, { style: styles.sectionTitle }, "Diagnóstico"),
            React.createElement(Text, { style: styles.diagnosticText }, cranialStatus.diagnosis.diagnosis)
          ),

          // Gráficos (se incluídos)
          chartImages ? React.createElement(View, { style: styles.chartsSection },
            React.createElement(Text, { style: styles.sectionTitle }, "Evolução das Medições"),
            
            chartImages.icChart ? React.createElement(View, { style: styles.chartContainer },
              React.createElement(Text, { style: styles.chartTitle }, "Evolução do Índice Craniano"),
              React.createElement('Image', { src: chartImages.icChart, style: styles.chartImage })
            ) : null,
            
            chartImages.cvaiChart ? React.createElement(View, { style: styles.chartContainer },
              React.createElement(Text, { style: styles.chartTitle }, "Evolução do CVAI"),
              React.createElement('Image', { src: chartImages.cvaiChart, style: styles.chartImage })
            ) : null,
            
            chartImages.perimeterChart ? React.createElement(View, { style: styles.chartContainer },
              React.createElement(Text, { style: styles.chartTitle }, "Evolução do Perímetro Cefálico"),
              React.createElement('Image', { src: chartImages.perimeterChart, style: styles.chartImage })
            ) : null
          ) : null,
          
          // Recomendações
          recomendacoes.length > 0 ? React.createElement(View, { style: styles.recommendationsSection },
            React.createElement(Text, { style: styles.sectionTitle }, "Recomendações"),
            ...recomendacoes.map((recomendacao, index) => 
              React.createElement(Text, { key: index, style: styles.recommendationItem }, `• ${recomendacao}`)
            )
          ) : null,
          
          // Rodapé
          React.createElement(Text, { style: styles.clinicInfo, fixed: true }, 
            `Relatório gerado pelo sistema ${clinicaInfo.nome} em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}\nProfissional responsável: ${clinicaInfo.profissional} • © ${new Date().getFullYear()} ${clinicaInfo.nome} - Uso exclusivamente clínico`
          )
        )
      );
      
      // Gerar o PDF
      const blob = await pdf(pdfDocument).toBlob();
      
      // Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-craniano-${paciente.nome.replace(/\s+/g, '_').toLowerCase()}.pdf`;
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
