
import html2canvas from 'html2canvas';
import React from 'react';
import ReactDOM from 'react-dom/client';

interface ChartData {
  ageMonths: number;
  ic: number;
  cvai: number;
  perimeter: number;
  date: string;
}

// Função para calcular idade em meses
function calculateAgeInMonths(dataNascimento: string, dataMedicao: string): number {
  const nascimento = new Date(dataNascimento);
  const medicao = new Date(dataMedicao);
  
  const diffTime = medicao.getTime() - nascimento.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const diffMonths = diffDays / 30.44;
  
  return Math.max(0, diffMonths);
}

// Função principal para gerar imagens dos gráficos
export async function generateChartImages(
  medicoes: any[], 
  paciente: { data_nascimento: string; sexo: 'M' | 'F' }
): Promise<{
  icChart?: string;
  cvaiChart?: string;
  perimeterChart?: string;
}> {
  try {
    // Preparar dados para os gráficos
    const chartData: ChartData[] = medicoes.map(m => ({
      ageMonths: calculateAgeInMonths(paciente.data_nascimento, m.data),
      ic: m.indice_craniano || 0,
      cvai: m.cvai || 0,
      perimeter: m.perimetro_cefalico || m.perimetroCefalico || 0,
      date: m.data
    })).filter(item => item.ageMonths >= 0);

    if (chartData.length < 2) {
      console.warn('Dados insuficientes para gerar gráficos');
      return {};
    }

    const images: any = {};

    // Gerar gráfico de Índice Craniano
    if (chartData.some(d => d.ic > 0)) {
      images.icChart = await renderChartToBase64(
        createICChart(chartData),
        'ic-chart'
      );
    }

    // Gerar gráfico de CVAI
    if (chartData.some(d => d.cvai >= 0)) {
      images.cvaiChart = await renderChartToBase64(
        createCVAIChart(chartData),
        'cvai-chart'
      );
    }

    // Gerar gráfico de perímetro cefálico se houver dados
    if (chartData.some(d => d.perimeter > 0)) {
      images.perimeterChart = await renderChartToBase64(
        createPerimeterChart(chartData, paciente.sexo),
        'perimeter-chart'
      );
    }

    return images;
  } catch (error) {
    console.error('Erro ao gerar imagens dos gráficos:', error);
    return {};
  }
}

// Função para renderizar componente como imagem base64
async function renderChartToBase64(
  chartElement: React.ReactElement,
  containerId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Criar container temporário
      const container = document.createElement('div');
      container.id = containerId;
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '600px';
      container.style.height = '400px';
      container.style.backgroundColor = '#ffffff';
      
      document.body.appendChild(container);

      // Renderizar o componente
      const root = ReactDOM.createRoot(container);
      root.render(chartElement);

      // Aguardar um pouco para garantir que o componente foi renderizado
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(container, {
            width: 600,
            height: 400,
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true
          });
          
          const base64 = canvas.toDataURL('image/png');
          
          // Limpar
          root.unmount();
          document.body.removeChild(container);
          
          resolve(base64);
        } catch (error) {
          console.error('Erro ao capturar canvas:', error);
          root.unmount();
          document.body.removeChild(container);
          reject(error);
        }
      }, 1000);
    } catch (error) {
      console.error('Erro ao criar container:', error);
      reject(error);
    }
  });
}

// Componentes de gráfico simplificados para PDF
function createICChart(data: ChartData[]): React.ReactElement {
  return React.createElement('div', {
    style: {
      width: '100%',
      height: '100%',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }
  }, [
    React.createElement('h3', {
      key: 'title',
      style: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333'
      }
    }, 'Evolução do Índice Craniano'),
    React.createElement('div', {
      key: 'chart',
      style: {
        width: '100%',
        height: '300px',
        border: '1px solid #ccc',
        position: 'relative',
        backgroundColor: '#f9f9f9'
      }
    }, createSimpleLineChart(data.map(d => ({ x: d.ageMonths, y: d.ic })), 'IC (%)', '#e53935'))
  ]);
}

function createCVAIChart(data: ChartData[]): React.ReactElement {
  return React.createElement('div', {
    style: {
      width: '100%',
      height: '100%',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }
  }, [
    React.createElement('h3', {
      key: 'title',
      style: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333'
      }
    }, 'Evolução do CVAI'),
    React.createElement('div', {
      key: 'chart',
      style: {
        width: '100%',
        height: '300px',
        border: '1px solid #ccc',
        position: 'relative',
        backgroundColor: '#f9f9f9'
      }
    }, createSimpleLineChart(data.map(d => ({ x: d.ageMonths, y: d.cvai })), 'CVAI (%)', '#f9a825'))
  ]);
}

function createPerimeterChart(data: ChartData[], sexo: 'M' | 'F'): React.ReactElement {
  return React.createElement('div', {
    style: {
      width: '100%',
      height: '100%',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }
  }, [
    React.createElement('h3', {
      key: 'title',
      style: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333'
      }
    }, 'Evolução do Perímetro Cefálico'),
    React.createElement('div', {
      key: 'chart',
      style: {
        width: '100%',
        height: '300px',
        border: '1px solid #ccc',
        position: 'relative',
        backgroundColor: '#f9f9f9'
      }
    }, createSimpleLineChart(data.map(d => ({ x: d.ageMonths, y: d.perimeter })), 'Perímetro (mm)', '#2196f3'))
  ]);
}

// Função para criar gráfico de linha simples usando SVG
function createSimpleLineChart(
  data: { x: number; y: number }[],
  yLabel: string,
  color: string
): React.ReactElement {
  if (data.length === 0) return React.createElement('div', {}, 'Sem dados');

  const sortedData = [...data].sort((a, b) => a.x - b.x);
  const maxX = Math.max(...sortedData.map(d => d.x));
  const minX = Math.min(...sortedData.map(d => d.x));
  const maxY = Math.max(...sortedData.map(d => d.y));
  const minY = Math.min(...sortedData.map(d => d.y));
  
  const padding = 40;
  const chartWidth = 520;
  const chartHeight = 260;
  
  const scaleX = (x: number) => padding + ((x - minX) / (maxX - minX || 1)) * (chartWidth - 2 * padding);
  const scaleY = (y: number) => chartHeight - padding - ((y - minY) / (maxY - minY || 1)) * (chartHeight - 2 * padding);

  const pathData = sortedData.map((d, i) => 
    `${i === 0 ? 'M' : 'L'} ${scaleX(d.x)} ${scaleY(d.y)}`
  ).join(' ');

  return React.createElement('svg', {
    width: chartWidth,
    height: chartHeight,
    style: { display: 'block', margin: '0 auto' }
  }, [
    // Grid lines
    React.createElement('defs', { key: 'defs' }, 
      React.createElement('pattern', {
        id: 'grid',
        width: '20',
        height: '20',
        patternUnits: 'userSpaceOnUse'
      }, [
        React.createElement('path', {
          key: 'grid-path',
          d: 'M 20 0 L 0 0 0 20',
          fill: 'none',
          stroke: '#e0e0e0',
          strokeWidth: '1'
        })
      ])
    ),
    React.createElement('rect', {
      key: 'grid-rect',
      width: chartWidth - 2 * padding,
      height: chartHeight - 2 * padding,
      x: padding,
      y: padding,
      fill: 'url(#grid)'
    }),
    // Axes
    React.createElement('line', {
      key: 'x-axis',
      x1: padding,
      y1: chartHeight - padding,
      x2: chartWidth - padding,
      y2: chartHeight - padding,
      stroke: '#333',
      strokeWidth: 2
    }),
    React.createElement('line', {
      key: 'y-axis',
      x1: padding,
      y1: padding,
      x2: padding,
      y2: chartHeight - padding,
      stroke: '#333',
      strokeWidth: 2
    }),
    // Data line
    React.createElement('path', {
      key: 'data-line',
      d: pathData,
      fill: 'none',
      stroke: color,
      strokeWidth: 3
    }),
    // Data points
    ...sortedData.map((d, i) => 
      React.createElement('circle', {
        key: `point-${i}`,
        cx: scaleX(d.x),
        cy: scaleY(d.y),
        r: 4,
        fill: color
      })
    ),
    // Labels
    React.createElement('text', {
      key: 'x-label',
      x: chartWidth / 2,
      y: chartHeight - 5,
      textAnchor: 'middle',
      fontSize: '12',
      fill: '#333'
    }, 'Idade (meses)'),
    React.createElement('text', {
      key: 'y-label',
      x: 15,
      y: chartHeight / 2,
      textAnchor: 'middle',
      fontSize: '12',
      fill: '#333',
      transform: `rotate(-90, 15, ${chartHeight / 2})`
    }, yLabel)
  ]);
}
