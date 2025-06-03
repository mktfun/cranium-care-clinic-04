
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg } from '@react-pdf/renderer';
import { SVGChartGenerator, ChartDataPoint } from '@/lib/svg-chart-generator';

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
  chartSection: {
    marginBottom: 25,
    alignItems: 'center',
  },
  chartContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
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
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 15,
    left: 0,
    right: 35,
    textAlign: 'right',
    color: '#6b7280',
  },
  choaSection: {
    marginBottom: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 5,
  },
  choaTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  choaLevel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6E59A5',
    marginBottom: 5,
  },
  choaDescription: {
    fontSize: 10,
    lineHeight: 1.3,
    color: '#4b5563',
  }
});

interface CranialMeasurementPDFWithChartsProps {
  pacienteData: {
    nome: string;
    data_nascimento: string;
    sexo: 'M' | 'F';
  };
  medicaoData: {
    data: string;
    comprimento: number;
    largura: number;
    diagonal_d: number;
    diagonal_e: number;
    perimetro_cefalico?: number;
    indice_craniano: number;
    diferenca_diagonais: number;
    cvai: number;
  };
  idadeNaAvaliacao: string;
  diagnosis: {
    diagnosis: string;
    type: string;
    severity: string;
  };
  choaClassification?: {
    level: number;
    clinicalPresentation: string;
  };
  recomendacoes: string[];
  clinicaInfo: {
    nome: string;
    profissional: string;
  };
  medicoes: any[];
}

export const CranialMeasurementPDFWithCharts: React.FC<CranialMeasurementPDFWithChartsProps> = ({
  pacienteData,
  medicaoData,
  idadeNaAvaliacao,
  diagnosis,
  choaClassification,
  recomendacoes,
  clinicaInfo,
  medicoes
}) => {
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Transformar dados para os gráficos
  const transformMedicoesToChartData = (medicoes: any[], field: string): ChartDataPoint[] => {
    return medicoes
      .filter(m => m[field] != null)
      .map(m => {
        const nascimento = new Date(pacienteData.data_nascimento);
        const medicao = new Date(m.data);
        const diffTime = medicao.getTime() - nascimento.getTime();
        const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44);
        
        return {
          ageMonths: Math.max(0, diffMonths),
          value: m[field],
          date: m.data
        };
      })
      .sort((a, b) => a.ageMonths - b.ageMonths);
  };

  const icData = transformMedicoesToChartData(medicoes, 'indice_craniano');
  const cvaiData = transformMedicoesToChartData(medicoes, 'cvai');
  const perimeterData = transformMedicoesToChartData(medicoes, 'perimetro_cefalico');

  return (
    <Document title={`Relatório de Avaliação Craniana - ${pacienteData.nome}`}>
      {/* Página 1: Dados e Diagnóstico */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Relatório de Avaliação Craniana</Text>
        <Text style={styles.subtitle}>{clinicaInfo.nome}</Text>

        {/* Informações do Paciente */}
        <View style={styles.patientInfoSection}>
          <View style={styles.patientInfoRow}>
            <Text style={styles.label}>Paciente:</Text>
            <Text style={styles.value}>{pacienteData.nome}</Text>
          </View>
          <View style={styles.patientInfoRow}>
            <Text style={styles.label}>Data de Nascimento:</Text>
            <Text style={styles.value}>{formatarData(pacienteData.data_nascimento)}</Text>
          </View>
          <View style={styles.patientInfoRow}>
            <Text style={styles.label}>Sexo:</Text>
            <Text style={styles.value}>{pacienteData.sexo === 'M' ? 'Masculino' : 'Feminino'}</Text>
          </View>
          <View style={styles.patientInfoRow}>
            <Text style={styles.label}>Idade na Avaliação:</Text>
            <Text style={styles.value}>{idadeNaAvaliacao}</Text>
          </View>
          <View style={styles.patientInfoRow}>
            <Text style={styles.label}>Data da Avaliação:</Text>
            <Text style={styles.value}>{formatarData(medicaoData.data)}</Text>
          </View>
        </View>

        {/* Medições Cranianas */}
        <View style={styles.measurementSection}>
          <Text style={styles.sectionTitle}>Medições Cranianas</Text>
          
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Comprimento Anteroposterior (AP):</Text>
            <Text style={styles.measurementValue}>{medicaoData.comprimento.toFixed(1)} mm</Text>
          </View>
          
          <View style={styles.measurementRowAlt}>
            <Text style={styles.measurementLabel}>Largura Mediolateral (ML):</Text>
            <Text style={styles.measurementValue}>{medicaoData.largura.toFixed(1)} mm</Text>
          </View>
          
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Diagonal Direita:</Text>
            <Text style={styles.measurementValue}>{medicaoData.diagonal_d.toFixed(1)} mm</Text>
          </View>
          
          <View style={styles.measurementRowAlt}>
            <Text style={styles.measurementLabel}>Diagonal Esquerda:</Text>
            <Text style={styles.measurementValue}>{medicaoData.diagonal_e.toFixed(1)} mm</Text>
          </View>
          
          {medicaoData.perimetro_cefalico && (
            <View style={styles.measurementRow}>
              <Text style={styles.measurementLabel}>Perímetro Cefálico:</Text>
              <Text style={styles.measurementValue}>{medicaoData.perimetro_cefalico.toFixed(1)} mm</Text>
            </View>
          )}
          
          <View style={styles.measurementRowAlt}>
            <Text style={styles.measurementLabel}>Diferença de Diagonais:</Text>
            <Text style={styles.measurementValue}>{medicaoData.diferenca_diagonais.toFixed(1)} mm</Text>
          </View>
          
          <View style={styles.measurementRow}>
            <Text style={styles.measurementLabel}>Índice Craniano (CI):</Text>
            <Text style={styles.measurementValue}>{medicaoData.indice_craniano.toFixed(1)}%</Text>
          </View>
          
          <View style={styles.measurementRowAlt}>
            <Text style={styles.measurementLabel}>CVAI (Índice de Assimetria):</Text>
            <Text style={styles.measurementValue}>{medicaoData.cvai.toFixed(1)}%</Text>
          </View>
        </View>

        {/* Diagnóstico */}
        <View style={styles.diagnosticSection}>
          <Text style={styles.sectionTitle}>Diagnóstico</Text>
          <Text style={styles.diagnosticText}>{diagnosis.diagnosis}</Text>
        </View>

        {/* Classificação CHOA */}
        {choaClassification && (
          <View style={styles.choaSection}>
            <Text style={styles.choaTitle}>Classificação CHOA</Text>
            <Text style={styles.choaLevel}>Nível {choaClassification.level}</Text>
            <Text style={styles.choaDescription}>{choaClassification.clinicalPresentation}</Text>
          </View>
        )}

        {/* Recomendações */}
        {recomendacoes.length > 0 && (
          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>Recomendações</Text>
            {recomendacoes.map((recomendacao, index) => (
              <Text key={index} style={styles.recommendationItem}>
                • {recomendacao}
              </Text>
            ))}
          </View>
        )}

        {/* Rodapé */}
        <Text style={styles.clinicInfo} fixed>
          Relatório gerado pelo sistema {clinicaInfo.nome} em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
          {'\n'}Profissional responsável: {clinicaInfo.profissional} • © {new Date().getFullYear()} {clinicaInfo.nome} - Uso exclusivamente clínico
        </Text>
        
        <Text 
          style={styles.pageNumber} 
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} 
          fixed 
        />
      </Page>

      {/* Página 2: Gráficos de Evolução */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Evolução das Medições Cranianas</Text>
        <Text style={styles.subtitle}>Análise Temporal - {pacienteData.nome}</Text>

        <View style={styles.chartSection}>
          {/* Gráfico IC */}
          {icData.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Evolução do Índice Craniano</Text>
              <Svg style={{ width: 500, height: 200 }}>
                <Text>{SVGChartGenerator.generateICChart(icData)}</Text>
              </Svg>
            </View>
          )}

          {/* Gráfico CVAI */}
          {cvaiData.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Evolução do CVAI (Assimetria Craniana)</Text>
              <Svg style={{ width: 500, height: 200 }}>
                <Text>{SVGChartGenerator.generateCVAIChart(cvaiData)}</Text>
              </Svg>
            </View>
          )}

          {/* Gráfico Perímetro */}
          {perimeterData.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Evolução do Perímetro Cefálico</Text>
              <Svg style={{ width: 500, height: 200 }}>
                <Text>{SVGChartGenerator.generatePerimeterChart(perimeterData)}</Text>
              </Svg>
            </View>
          )}

          {/* Mensagem caso não haja dados suficientes */}
          {icData.length === 0 && cvaiData.length === 0 && perimeterData.length === 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Dados Insuficientes para Gráficos</Text>
              <Text style={styles.diagnosticText}>
                São necessárias pelo menos 2 medições para gerar gráficos de evolução.
                Esta é a primeira medição registrada para este paciente.
              </Text>
            </View>
          )}
        </View>

        {/* Rodapé */}
        <Text style={styles.clinicInfo} fixed>
          Gráficos gerados automaticamente com base no histórico de medições • {clinicaInfo.nome}
        </Text>
        
        <Text 
          style={styles.pageNumber} 
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} 
          fixed 
        />
      </Page>
    </Document>
  );
};
