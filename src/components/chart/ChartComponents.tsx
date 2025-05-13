
import React from "react";
import {
  Line,
  ReferenceLine,
  ReferenceArea,
  Dot
} from "recharts";
import { getLineColor } from "./ChartHelpers";

// Function to render custom dots on the chart
export const renderCustomDot = (fill: string) => (props: any) => {
  const { cx, cy, payload, index } = props;
  // Não renderizar pontos para dados de referência
  if (payload.paciente === null) return null;
  
  return (
    <Dot 
      key={`dot-${index}-${payload.idadeEmMeses || ""}`} 
      cx={cx} 
      cy={cy} 
      r={4} 
      fill={fill} 
      stroke="#fff" 
      strokeWidth={1} 
    />
  );
};

// Renders lines for Indice Craniano chart
export function IndiceLines({ lineColor = "blue" }) {
  const color = getLineColor(lineColor);
  
  return (
    <>
      <Line
        type="monotone"
        dataKey="indice_craniano"
        name="Índice Craniano"
        stroke={color}
        strokeWidth={3}
        dot={renderCustomDot(color)}
        activeDot={{ r: 7, fill: color }}
        connectNulls
        isAnimationActive={true}
      />
      <Line
        type="monotone"
        dataKey="mediaPopulacional"
        name="Média Populacional"
        stroke="#666666"
        strokeDasharray="5 5"
        dot={false}
        connectNulls
        isAnimationActive={false}
      />
      <ReferenceLine y={76} stroke="#22C55E" strokeDasharray="3 3" label={{ value: "Mín Normal", position: "insideBottomLeft" }} />
      <ReferenceLine y={80} stroke="#22C55E" strokeDasharray="3 3" label={{ value: "Máx Normal", position: "insideTopLeft" }} />
    </>
  );
}

// Renders lines for CVAI chart
export function CvaiLines({ lineColor = "amber" }) {
  const color = getLineColor(lineColor);
  
  return (
    <>
      <Line
        type="monotone"
        dataKey="cvai"
        name="CVAI"
        stroke={color}
        strokeWidth={3}
        dot={renderCustomDot(color)}
        activeDot={{ r: 7, fill: color }}
        connectNulls
        isAnimationActive={true}
      />
      <Line
        type="monotone"
        dataKey="mediaPopulacional"
        name="Média Populacional"
        stroke="#666666"
        strokeDasharray="5 5"
        dot={false}
        connectNulls
        isAnimationActive={false}
      />
      <ReferenceLine y={3.5} stroke="#22C55E" strokeDasharray="3 3" label={{ value: "Limite Normal", position: "insideBottomLeft" }} />
    </>
  );
}

// Renders lines for Diagonais chart
export function DiagonaisLines({ lineColor = "purple" }) {
  const color = getLineColor(lineColor);
  
  return (
    <>
      <Line
        type="monotone"
        dataKey="diferenca_diagonais"
        name="Diferença Diagonais"
        stroke={color}
        strokeWidth={3}
        dot={renderCustomDot(color)}
        activeDot={{ r: 7, fill: color }}
        connectNulls
        isAnimationActive={true}
      />
      <Line
        type="monotone"
        dataKey="mediaPopulacional"
        name="Média Populacional"
        stroke="#666666"
        strokeDasharray="5 5"
        dot={false}
        connectNulls
        isAnimationActive={false}
      />
      <ReferenceLine y={3} stroke="#22C55E" strokeDasharray="3 3" label={{ value: "Limite Normal", position: "insideBottomLeft" }} />
    </>
  );
}

// Renders lines for Perimetro chart
export function PerimetroLines({ lineColor = "green" }) {
  const color = getLineColor(lineColor);
  
  return (
    <>
      <Line
        type="monotone"
        dataKey="perimetro_cefalico"
        name="Perímetro Cefálico"
        stroke={color}
        strokeWidth={3}
        dot={renderCustomDot(color)}
        activeDot={{ r: 7, fill: color }}
        connectNulls
        isAnimationActive={true}
      />
      <Line
        type="monotone"
        dataKey="p3"
        name="P3"
        stroke="#9CA3AF"
        strokeDasharray="3 3"
        dot={false}
        connectNulls
        isAnimationActive={false}
      />
      <Line
        type="monotone"
        dataKey="p15"
        name="P15"
        stroke="#9CA3AF"
        dot={false}
        connectNulls
        isAnimationActive={false}
      />
      <Line
        type="monotone"
        dataKey="p50"
        name="P50"
        stroke="#4B5563"
        strokeWidth={2}
        dot={false}
        connectNulls
        isAnimationActive={false}
      />
      <Line
        type="monotone"
        dataKey="p85"
        name="P85"
        stroke="#9CA3AF"
        dot={false}
        connectNulls
        isAnimationActive={false}
      />
      <Line
        type="monotone"
        dataKey="p97"
        name="P97"
        stroke="#9CA3AF"
        strokeDasharray="3 3"
        dot={false}
        connectNulls
        isAnimationActive={false}
      />
    </>
  );
}

// Renders reference areas for Indice Craniano chart
export function IndiceAreas() {
  return (
    <>
      <ReferenceArea y1={90} y2={95} fill="#FECDD3" fillOpacity={0.6} />
      <ReferenceArea y1={84} y2={90} fill="#FED7AA" fillOpacity={0.6} />
      <ReferenceArea y1={80} y2={84} fill="#FEF08A" fillOpacity={0.6} />
      <ReferenceArea y1={76} y2={80} fill="#BBF7D0" fillOpacity={0.6} />
      <ReferenceArea y1={73} y2={76} fill="#FEF08A" fillOpacity={0.6} />
      <ReferenceArea y1={70} y2={73} fill="#FED7AA" fillOpacity={0.6} />
      <ReferenceArea y1={65} y2={70} fill="#FECDD3" fillOpacity={0.6} />
    </>
  );
}

// Renders reference areas for CVAI chart
export function CvaiAreas() {
  return (
    <>
      <ReferenceArea y1={8.5} y2={12} fill="#FECDD3" fillOpacity={0.6} />
      <ReferenceArea y1={6.25} y2={8.5} fill="#FED7AA" fillOpacity={0.6} />
      <ReferenceArea y1={3.5} y2={6.25} fill="#FEF08A" fillOpacity={0.6} />
      <ReferenceArea y1={0} y2={3.5} fill="#BBF7D0" fillOpacity={0.6} />
    </>
  );
}

// Renders reference areas for Diagonais chart
export function DiagonaisAreas() {
  return (
    <>
      <ReferenceArea y1={10} y2={15} fill="#FECDD3" fillOpacity={0.6} />
      <ReferenceArea y1={6} y2={10} fill="#FED7AA" fillOpacity={0.6} />
      <ReferenceArea y1={3} y2={6} fill="#FEF08A" fillOpacity={0.6} />
      <ReferenceArea y1={0} y2={3} fill="#BBF7D0" fillOpacity={0.6} />
    </>
  );
}
