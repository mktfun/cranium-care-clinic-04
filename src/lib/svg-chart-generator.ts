
export interface ChartDataPoint {
  ageMonths: number;
  value: number;
  date: string;
}

export interface SVGChartOptions {
  width: number;
  height: number;
  title: string;
  yAxisLabel: string;
  normalRanges?: Array<{
    min: number;
    max: number;
    color: string;
    label: string;
  }>;
  referenceLines?: Array<{
    value: number;
    color: string;
    label: string;
  }>;
}

export class SVGChartGenerator {
  static generateLineChart(
    data: ChartDataPoint[],
    options: SVGChartOptions
  ): string {
    const { width, height, title, yAxisLabel, normalRanges = [], referenceLines = [] } = options;
    
    // Margins
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    if (data.length === 0) {
      return this.generateEmptyChart(width, height, title, "Sem dados disponíveis");
    }
    
    // Calculate scales
    const xValues = data.map(d => d.ageMonths);
    const yValues = data.map(d => d.value);
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues, ...normalRanges.flatMap(r => [r.min, r.max]));
    const yMax = Math.max(...yValues, ...normalRanges.flatMap(r => [r.min, r.max]));
    
    // Add padding
    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;
    const xPadding = xRange * 0.1;
    const yPadding = yRange * 0.1;
    
    const xScale = (value: number) => ((value - (xMin - xPadding)) / (xRange + 2 * xPadding)) * chartWidth;
    const yScale = (value: number) => chartHeight - ((value - (yMin - yPadding)) / (yRange + 2 * yPadding)) * chartHeight;
    
    // Generate path for line
    const pathData = data.map((d, i) => {
      const x = xScale(d.ageMonths);
      const y = yScale(d.value);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    // Generate grid lines
    const gridLines = [];
    const numXTicks = 5;
    const numYTicks = 5;
    
    for (let i = 0; i <= numXTicks; i++) {
      const x = (chartWidth / numXTicks) * i;
      gridLines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${chartHeight}" stroke="#e0e0e0" stroke-width="0.5"/>`);
    }
    
    for (let i = 0; i <= numYTicks; i++) {
      const y = (chartHeight / numYTicks) * i;
      gridLines.push(`<line x1="0" y1="${y}" x2="${chartWidth}" y2="${y}" stroke="#e0e0e0" stroke-width="0.5"/>`);
    }
    
    // Generate normal ranges
    const rangeAreas = normalRanges.map(range => {
      const y1 = yScale(range.max);
      const y2 = yScale(range.min);
      const height = y2 - y1;
      return `<rect x="0" y="${y1}" width="${chartWidth}" height="${height}" fill="${range.color}" opacity="0.3"/>`;
    }).join('');
    
    // Generate reference lines
    const refLines = referenceLines.map(ref => {
      const y = yScale(ref.value);
      return `<line x1="0" y1="${y}" x2="${chartWidth}" y2="${y}" stroke="${ref.color}" stroke-width="1" stroke-dasharray="5,5"/>`;
    }).join('');
    
    // Generate axis labels
    const xLabels = [];
    const yLabels = [];
    
    for (let i = 0; i <= numXTicks; i++) {
      const value = (xMin - xPadding) + ((xRange + 2 * xPadding) / numXTicks) * i;
      const x = (chartWidth / numXTicks) * i;
      xLabels.push(`<text x="${x}" y="${chartHeight + 20}" text-anchor="middle" font-size="10" fill="#666">${value.toFixed(0)}m</text>`);
    }
    
    for (let i = 0; i <= numYTicks; i++) {
      const value = (yMin - yPadding) + ((yRange + 2 * yPadding) / numYTicks) * i;
      const y = chartHeight - (chartHeight / numYTicks) * i;
      yLabels.push(`<text x="-10" y="${y + 3}" text-anchor="end" font-size="10" fill="#666">${value.toFixed(1)}</text>`);
    }
    
    // Generate data points
    const dataPoints = data.map(d => {
      const x = xScale(d.ageMonths);
      const y = yScale(d.value);
      return `<circle cx="${x}" cy="${y}" r="3" fill="#e53935"/>`;
    }).join('');
    
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="white"/>
        
        <!-- Title -->
        <text x="${width/2}" y="25" text-anchor="middle" font-size="14" font-weight="bold" fill="#333">${title}</text>
        
        <!-- Chart area -->
        <g transform="translate(${margin.left}, ${margin.top})">
          <!-- Grid -->
          ${gridLines.join('')}
          
          <!-- Normal ranges -->
          ${rangeAreas}
          
          <!-- Reference lines -->
          ${refLines}
          
          <!-- Data line -->
          <path d="${pathData}" stroke="#e53935" stroke-width="2" fill="none"/>
          
          <!-- Data points -->
          ${dataPoints}
          
          <!-- Axis labels -->
          ${xLabels.join('')}
          ${yLabels.join('')}
          
          <!-- Axes -->
          <line x1="0" y1="${chartHeight}" x2="${chartWidth}" y2="${chartHeight}" stroke="#333" stroke-width="1"/>
          <line x1="0" y1="0" x2="0" y2="${chartHeight}" stroke="#333" stroke-width="1"/>
        </g>
        
        <!-- Axis titles -->
        <text x="${width/2}" y="${height - 10}" text-anchor="middle" font-size="12" fill="#333">Idade (meses)</text>
        <text x="15" y="${height/2}" text-anchor="middle" font-size="12" fill="#333" transform="rotate(-90, 15, ${height/2})">${yAxisLabel}</text>
      </svg>
    `;
  }
  
  static generateEmptyChart(width: number, height: number, title: string, message: string): string {
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="white"/>
        <text x="${width/2}" y="25" text-anchor="middle" font-size="14" font-weight="bold" fill="#333">${title}</text>
        <text x="${width/2}" y="${height/2}" text-anchor="middle" font-size="12" fill="#666">${message}</text>
      </svg>
    `;
  }
  
  static generateICChart(data: ChartDataPoint[]): string {
    return this.generateLineChart(data, {
      width: 500,
      height: 200,
      title: "Evolução do Índice Craniano",
      yAxisLabel: "IC (%)",
      normalRanges: [
        { min: 76, max: 80.9, color: "#4caf50", label: "Normal" }
      ],
      referenceLines: [
        { value: 81, color: "#ff9800", label: "Braquicefalia" },
        { value: 75, color: "#ff9800", label: "Dolicocefalia" }
      ]
    });
  }
  
  static generateCVAIChart(data: ChartDataPoint[]): string {
    return this.generateLineChart(data, {
      width: 500,
      height: 200,
      title: "Evolução do CVAI",
      yAxisLabel: "CVAI (%)",
      normalRanges: [
        { min: 0, max: 3.5, color: "#4caf50", label: "Normal" },
        { min: 3.5, max: 6.25, color: "#ffeb3b", label: "Leve" },
        { min: 6.25, max: 8.75, color: "#ff9800", label: "Moderada" }
      ]
    });
  }
  
  static generatePerimeterChart(data: ChartDataPoint[]): string {
    return this.generateLineChart(data, {
      width: 500,
      height: 200,
      title: "Evolução do Perímetro Cefálico",
      yAxisLabel: "PC (mm)",
      normalRanges: [] // Seria necessário implementar curvas de crescimento específicas
    });
  }
}
