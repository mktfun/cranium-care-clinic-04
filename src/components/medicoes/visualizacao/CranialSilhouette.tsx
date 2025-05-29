
import React, { useEffect, useRef } from 'react';
import { AsymmetryType, SeverityLevel } from "@/types";

interface CranialSilhouetteProps {
  measurements: {
    comprimento: number;
    largura: number;
    diagonalD: number;
    diagonalE: number;
    perimetroCefalico?: number;
  };
  asymmetryType: AsymmetryType;
  severity: SeverityLevel;
  viewType?: "superior";
}

export default function CranialSilhouette({
  measurements,
  asymmetryType,
  severity
}: CranialSilhouetteProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Cores baseadas na severidade
  const getSeverityColor = (severity: SeverityLevel) => {
    switch(severity) {
      case "normal": return "#10b981"; // verde
      case "leve": return "#f59e0b";   // amarelo
      case "moderada": return "#f97316"; // laranja
      case "severa": return "#ef4444";  // vermelho
      default: return "#10b981";
    }
  };
  
  useEffect(() => {
    if (!svgRef.current || !measurements) return;
    
    const svg = svgRef.current;
    
    // Limpar SVG anterior
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    
    const svgNS = "http://www.w3.org/2000/svg";
    const { comprimento: C, largura: L, diagonalD: Dd, diagonalE: De } = measurements;
    
    // Configurações
    const padding = 18;
    const asymmetryFactor = 0.08; // Controla intensidade visual da assimetria
    
    // Calcular metades para pontos de ancoragem
    const halfC = C / 2;
    const halfL = L / 2;
    
    // Pontos de ancoragem principais
    const points = {
      anterior: { x: 0, y: -halfC },
      posterior: { x: 0, y: halfC },
      left: { x: -halfL, y: 0 },
      right: { x: halfL, y: 0 }
    };
    
    // Calcular diferença relativa das diagonais para ajustar assimetria
    const diagDiff = Dd - De;
    const avgDiag = (Dd + De) / 2;
    const relativeDiff = avgDiag !== 0 ? diagDiff / avgDiag : 0;
    
    // Fator de controle para curvas de Bézier (aproxima uma elipse)
    const kappa = 0.552284749831;
    const controlX = halfL * kappa;
    const controlY = halfC * kappa;
    
    // Ajustar pontos de controle para introduzir assimetria
    const adjustFactor = relativeDiff * asymmetryFactor;
    
    // Pontos de controle para as 4 curvas de Bézier
    const cp = {
      // Curva 1: Anterior -> Direita
      cp1_ad: { x: controlX * (1 - adjustFactor), y: points.anterior.y },
      cp2_ad: { x: points.right.x, y: -controlY * (1 - adjustFactor) },
      
      // Curva 2: Direita -> Posterior
      cp1_dp: { x: points.right.x, y: controlY * (1 + adjustFactor) },
      cp2_dp: { x: controlX * (1 + adjustFactor), y: points.posterior.y },
      
      // Curva 3: Posterior -> Esquerda
      cp1_pe: { x: -controlX * (1 + adjustFactor), y: points.posterior.y },
      cp2_pe: { x: points.left.x, y: controlY * (1 + adjustFactor) },
      
      // Curva 4: Esquerda -> Anterior
      cp1_ea: { x: points.left.x, y: -controlY * (1 - adjustFactor) },
      cp2_ea: { x: -controlX * (1 - adjustFactor), y: points.anterior.y }
    };
    
    // Construir string do caminho SVG
    const pathData = `
      M ${points.anterior.x},${points.anterior.y}
      C ${cp.cp1_ad.x},${cp.cp1_ad.y} ${cp.cp2_ad.x},${cp.cp2_ad.y} ${points.right.x},${points.right.y}
      C ${cp.cp1_dp.x},${cp.cp1_dp.y} ${cp.cp2_dp.x},${cp.cp2_dp.y} ${points.posterior.x},${points.posterior.y}
      C ${cp.cp1_pe.x},${cp.cp1_pe.y} ${cp.cp2_pe.x},${cp.cp2_pe.y} ${points.left.x},${points.left.y}
      C ${cp.cp1_ea.x},${cp.cp1_ea.y} ${cp.cp2_ea.x},${cp.cp2_ea.y} ${points.anterior.x},${points.anterior.y}
      Z
    `;
    
    // Função auxiliar para criar elementos SVG
    const createElement = (tag: string, attributes: Record<string, string | number>) => {
      const element = document.createElementNS(svgNS, tag);
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value.toString());
      });
      return element;
    };
    
    const createText = (x: number, y: number, text: string, className: string, anchor = "middle") => {
      const textEl = createElement("text", {
        x,
        y,
        class: className,
        "text-anchor": anchor
      }) as SVGTextElement;
      textEl.textContent = text;
      return textEl;
    };
    
    // 1. Desenhar eixos de referência
    const axisGroup = createElement("g", {}) as SVGGElement;
    
    // Eixo horizontal (largura)
    const lineX = createElement("line", {
      x1: -halfL - padding,
      y1: 0,
      x2: halfL + padding,
      y2: 0,
      stroke: "#ccc",
      "stroke-width": 1,
      "stroke-dasharray": "2 2"
    });
    axisGroup.appendChild(lineX);
    
    // Eixo vertical (comprimento)
    const lineY = createElement("line", {
      x1: 0,
      y1: -halfC - padding,
      x2: 0,
      y2: halfC + padding,
      stroke: "#ccc",
      "stroke-width": 1,
      "stroke-dasharray": "2 2"
    });
    axisGroup.appendChild(lineY);
    
    svg.appendChild(axisGroup);
    
    // 2. Desenhar a silhueta craniana tracejada
    const path = createElement("path", {
      d: pathData,
      stroke: getSeverityColor(severity),
      "stroke-width": 2,
      "stroke-dasharray": "4 4",
      fill: "none"
    });
    svg.appendChild(path);
    
    // 3. Adicionar rótulos e valores
    const labelsGroup = createElement("g", {}) as SVGGElement;
    
    // Rótulos das direções
    labelsGroup.appendChild(createText(0, -halfC - padding + 8, "Anterior", "text-xs font-semibold", "middle"));
    labelsGroup.appendChild(createText(0, halfC + padding - 2, "Posterior", "text-xs font-semibold", "middle"));
    labelsGroup.appendChild(createText(-halfL - padding + 2, 5, "Esquerda", "text-xs font-semibold", "start"));
    labelsGroup.appendChild(createText(halfL + padding - 2, 5, "Direita", "text-xs font-semibold", "end"));
    
    // Valores das medidas
    labelsGroup.appendChild(createText(0, -halfC - 5, `C: ${C}mm`, "text-xs fill-slate-600", "middle"));
    labelsGroup.appendChild(createText(halfL + 8, -10, `L: ${L}mm`, "text-xs fill-slate-600", "start"));
    
    // Valores das diagonais nos quadrantes posteriores
    const diagYOffset = halfC - 8;
    const diagXOffset = halfL - 8;
    labelsGroup.appendChild(createText(diagXOffset, diagYOffset, `De: ${De}mm`, "text-xs fill-slate-600", "end"));
    labelsGroup.appendChild(createText(-diagXOffset, diagYOffset, `Dd: ${Dd}mm`, "text-xs fill-slate-600", "start"));
    
    svg.appendChild(labelsGroup);
    
    // 4. Adicionar legenda com classificação
    const legendGroup = createElement("g", {}) as SVGGElement;
    const legendY = halfC + padding + 20;
    
    legendGroup.appendChild(createText(0, legendY, 
      `${asymmetryType}${severity !== "normal" ? ` (${severity})` : ""}`, 
      "text-sm font-bold", "middle"));
    
    // Aplicar cor da severidade ao texto da legenda
    const legendText = legendGroup.lastChild as SVGTextElement;
    legendText.setAttribute("fill", getSeverityColor(severity));
    
    svg.appendChild(legendGroup);
    
  }, [measurements, asymmetryType, severity]);
  
  // Calcular viewBox dinâmico baseado nas medições
  const { comprimento: C, largura: L } = measurements;
  const halfC = C / 2;
  const halfL = L / 2;
  const padding = 25;
  const extraBottom = 35; // Espaço extra para a legenda
  
  const viewBoxWidth = (halfL + padding) * 2;
  const viewBoxHeight = (halfC + padding) * 2 + extraBottom;
  const viewBoxX = -(halfL + padding);
  const viewBoxY = -(halfC + padding);
  
  return (
    <div className="flex flex-col items-center">
      <svg 
        ref={svgRef} 
        width="100%" 
        height="400" 
        viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
        className="border rounded-lg bg-gradient-to-br from-card/30 to-card/60 shadow-sm"
        style={{ overflow: 'visible' }}
      />
      
      {/* Informações adicionais abaixo do gráfico */}
      <div className="mt-4 text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          Visualização superior da forma craniana
        </p>
        <p className="text-xs text-muted-foreground">
          Tracejado representa contorno baseado nas medições reais
        </p>
      </div>
    </div>
  );
}
