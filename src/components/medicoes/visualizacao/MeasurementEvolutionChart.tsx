
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useMediaQuery } from "@/hooks/use-media-query";
import ICEvolutionChart from './ICEvolutionChart';
import CVAIEvolutionChart from './CVAIEvolutionChart';
import PerimeterEvolutionChart from './PerimeterEvolutionChart';

interface MeasurementHistoryProps {
  measurementHistory: Array<{
    data: string;
    comprimento?: number;
    largura?: number;
    diagonalD?: number;
    diagonalE?: number;
    perimetroCefalico?: number;
    indice_craniano?: number;
    cvai?: number;
  }>;
  metricType: 'indiceCraniano' | 'cvai' | 'perimetroCefalico';
  colorTheme?: string;
  sexoPaciente?: 'M' | 'F';
  dataNascimento?: string;
}

// Função para calcular idade em meses com precisão decimal
function calcularIdadeEmMeses(dataNascimento: string, dataMedicao: string): number {
  const nascimento = new Date(dataNascimento);
  const medicao = new Date(dataMedicao);
  
  // Calcular diferença em milissegundos
  const diffTime = medicao.getTime() - nascimento.getTime();
  
  // Converter para meses (aproximadamente 30.44 dias por mês)
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const diffMonths = diffDays / 30.44;
  
  return Math.max(0, diffMonths);
}

export default function MeasurementEvolutionChart({
  measurementHistory,
  metricType = 'indiceCraniano',
  colorTheme = "blue",
  sexoPaciente,
  dataNascimento
}: MeasurementHistoryProps) {
  const isMobile = useMediaQuery(768);
  
  if (!measurementHistory || measurementHistory.length === 0) {
    return (
      <Card className="p-4 text-center text-muted-foreground">
        <CardContent className="pt-4">Sem dados históricos disponíveis</CardContent>
      </Card>
    );
  }
  
  // Ordenar medições por data
  const sortedHistory = [...measurementHistory].sort((a, b) => 
    new Date(a.data).getTime() - new Date(b.data).getTime()
  );
  
  // Transformar dados para o formato esperado pelos novos componentes
  const transformedData = sortedHistory.map(m => {
    let idadeEmMeses = 0;
    if (dataNascimento) {
      idadeEmMeses = calcularIdadeEmMeses(dataNascimento, m.data);
    } else {
      console.warn('Data de nascimento não fornecida para cálculo correto da idade');
      idadeEmMeses = sortedHistory.indexOf(m) * 2;
    }
    
    return {
      ageMonths: idadeEmMeses,
      ic: m.indice_craniano || 0,
      cvai: m.cvai || 0,
      perimeter: m.perimetroCefalico || 0,
      date: m.data
    };
  }).filter(item => {
    // Filtrar dados válidos baseado no tipo de métrica
    if (metricType === 'indiceCraniano') return item.ic > 0;
    if (metricType === 'cvai') return item.cvai >= 0;
    if (metricType === 'perimetroCefalico') return item.perimeter > 0;
    return true;
  });

  if (transformedData.length === 0) {
    return (
      <Card className="p-4 text-center text-muted-foreground">
        <CardContent className="pt-4">Dados insuficientes para este tipo de gráfico</CardContent>
      </Card>
    );
  }

  // Renderizar o componente apropriado baseado no tipo de métrica
  if (metricType === 'indiceCraniano') {
    return <ICEvolutionChart data={transformedData} />;
  }
  
  if (metricType === 'cvai') {
    return <CVAIEvolutionChart data={transformedData} />;
  }
  
  if (metricType === 'perimetroCefalico') {
    if (!sexoPaciente) {
      return (
        <Card className="p-4 text-center text-muted-foreground">
          <CardContent className="pt-4">
            Sexo do paciente necessário para exibir curvas de referência do perímetro cefálico
          </CardContent>
        </Card>
      );
    }
    return <PerimeterEvolutionChart patientData={transformedData} sex={sexoPaciente} />;
  }
  
  return (
    <Card className="p-4 text-center text-muted-foreground">
      <CardContent className="pt-4">Tipo de métrica não suportado</CardContent>
    </Card>
  );
}
