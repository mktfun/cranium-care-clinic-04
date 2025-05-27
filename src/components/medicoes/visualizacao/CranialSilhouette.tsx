
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
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
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Limpar SVG
    
    const width = 350;
    const height = 350;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Grupo principal com transformação para centralizar
    const g = svg.append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);
    
    // Calcular proporções reais baseadas nas medidas
    const { comprimento, largura, diagonalD, diagonalE } = measurements;
    
    // Calcular índices
    const indiceCraniano = (largura / comprimento) * 100;
    const diagonalDiff = Math.abs(diagonalD - diagonalE);
    const longerDiagonal = Math.max(diagonalD, diagonalE);
    const cvai = (diagonalDiff / longerDiagonal) * 100;
    
    // Calcular escala para que a visualização caiba no SVG
    const maxDimension = Math.max(comprimento, largura);
    const scale = (width * 0.6) / maxDimension; // Área útil de 60%
    
    // Dimensões escaladas
    const scaledLength = comprimento * scale; // Eixo anteroposterior
    const scaledWidth = largura * scale;     // Eixo biparietal
    
    // Raios base para construção da forma orgânica
    const baseRadiusX = scaledWidth / 2;  // Raio horizontal
    const baseRadiusY = scaledLength / 2; // Raio vertical
    
    // Determinar assimetria
    const rightFlattened = diagonalD < diagonalE;
    const asymmetryFactor = Math.min(cvai / 12, 0.4); // Normalizar para máximo de 40% de distorção
    
    // Pontos chave para construir a forma orgânica da cabeça
    // Anterior (testa) - geralmente mais estreito
    const anteriorWidth = baseRadiusX * 0.7; // 70% da largura máxima
    const anteriorY = -baseRadiusY;
    
    // Posterior (occipital) - geralmente mais largo
    const posteriorWidth = baseRadiusX * 0.95; // 95% da largura máxima
    const posteriorY = baseRadiusY * 0.8; // Ligeiramente mais para frente que o extremo
    
    // Pontos laterais máximos (parietais)
    const maxWidth = baseRadiusX;
    const lateralY = -baseRadiusY * 0.1; // Ligeiramente anterior ao centro
    
    // Pontos temporais (transição suave)
    const temporalWidth = baseRadiusX * 0.85;
    const temporalY = baseRadiusY * 0.3;
    
    // Aplicar assimetria se significativa (CVAI > 3.5%)
    let leftPosteriorAdjust = 1.0;
    let rightPosteriorAdjust = 1.0;
    let leftTemporalAdjust = 1.0;
    let rightTemporalAdjust = 1.0;
    
    if (cvai > 3.5) {
      if (rightFlattened) {
        // Achatamento no lado direito posterior
        rightPosteriorAdjust = 1 - (asymmetryFactor * 0.6);
        rightTemporalAdjust = 1 - (asymmetryFactor * 0.3);
        leftPosteriorAdjust = 1 + (asymmetryFactor * 0.2);
      } else {
        // Achatamento no lado esquerdo posterior
        leftPosteriorAdjust = 1 - (asymmetryFactor * 0.6);
        leftTemporalAdjust = 1 - (asymmetryFactor * 0.3);
        rightPosteriorAdjust = 1 + (asymmetryFactor * 0.2);
      }
    }
    
    // Construir o path SVG usando curvas de Bézier para forma orgânica
    const path = d3.path();
    
    // Começar no ponto anterior (testa)
    path.moveTo(0, anteriorY);
    
    // Curva anterior direita (testa para têmpora direita)
    path.bezierCurveTo(
      anteriorWidth * 0.8, anteriorY,           // Controle 1: expansão gradual da testa
      temporalWidth * 0.9, anteriorY * 0.7,    // Controle 2: transição suave
      temporalWidth * rightTemporalAdjust, lateralY * 0.7 // Ponto temporal direito
    );
    
    // Curva temporal direita para parietal direito
    path.bezierCurveTo(
      maxWidth * rightTemporalAdjust, lateralY * 0.3, // Controle 1
      maxWidth * 1.05, lateralY,                      // Controle 2: ligeira projeção
      maxWidth, lateralY                              // Ponto parietal máximo direito
    );
    
    // Curva parietal direita para occipital direito
    path.bezierCurveTo(
      maxWidth * 0.95, temporalY * 0.7,                    // Controle 1
      posteriorWidth * rightPosteriorAdjust, temporalY,    // Controle 2
      posteriorWidth * rightPosteriorAdjust * 0.7, posteriorY * 0.9 // Ponto occipital direito
    );
    
    // Curva occipital (região posterior)
    path.bezierCurveTo(
      posteriorWidth * rightPosteriorAdjust * 0.3, posteriorY * 1.05, // Controle 1
      -posteriorWidth * leftPosteriorAdjust * 0.3, posteriorY * 1.05, // Controle 2
      -posteriorWidth * leftPosteriorAdjust * 0.7, posteriorY * 0.9   // Ponto occipital esquerdo
    );
    
    // Curva occipital esquerdo para parietal esquerdo
    path.bezierCurveTo(
      -posteriorWidth * leftPosteriorAdjust, temporalY,    // Controle 1
      -maxWidth * 0.95, temporalY * 0.7,                   // Controle 2
      -maxWidth, lateralY                                  // Ponto parietal máximo esquerdo
    );
    
    // Curva parietal esquerdo para temporal esquerdo
    path.bezierCurveTo(
      -maxWidth * 1.05, lateralY,                        // Controle 1: ligeira projeção
      -maxWidth * leftTemporalAdjust, lateralY * 0.3,    // Controle 2
      -temporalWidth * leftTemporalAdjust, lateralY * 0.7 // Ponto temporal esquerdo
    );
    
    // Curva temporal esquerda para anterior (fechamento)
    path.bezierCurveTo(
      -temporalWidth * 0.9, anteriorY * 0.7,   // Controle 1: transição suave
      -anteriorWidth * 0.8, anteriorY,         // Controle 2: contração para testa
      0, anteriorY                             // Retorno ao ponto inicial
    );
    
    path.closePath();
    
    // Desenhar a forma craniana principal
    g.append("path")
      .attr("d", path.toString())
      .attr("fill", getSeverityColor(severity))
      .attr("opacity", 0.15)
      .attr("stroke", getSeverityColor(severity))
      .attr("stroke-width", 2.5)
      .attr("filter", "url(#softGlow)");
    
    // Adicionar filtro de brilho suave
    const defs = svg.append("defs");
    const filter = defs.append("filter")
      .attr("id", "softGlow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "2")
      .attr("result", "coloredBlur");
    
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    
    // Destacar área de achatamento se houver assimetria significativa
    if (cvai > 6.25) { // Apenas para assimetria moderada/severa
      const highlightPath = d3.path();
      
      if (rightFlattened) {
        // Área achatada direita
        const x1 = posteriorWidth * rightPosteriorAdjust * 0.4;
        const y1 = temporalY;
        const x2 = posteriorWidth * rightPosteriorAdjust * 0.7;
        const y2 = posteriorY * 0.9;
        
        highlightPath.moveTo(x1, y1);
        highlightPath.bezierCurveTo(x2 * 0.8, y1 + (y2 - y1) * 0.3, x2, y2 * 0.7, x2, y2);
        highlightPath.lineTo(x1 + (x2 - x1) * 0.5, y2 * 0.8);
        highlightPath.closePath();
      } else {
        // Área achatada esquerda
        const x1 = -posteriorWidth * leftPosteriorAdjust * 0.4;
        const y1 = temporalY;
        const x2 = -posteriorWidth * leftPosteriorAdjust * 0.7;
        const y2 = posteriorY * 0.9;
        
        highlightPath.moveTo(x1, y1);
        highlightPath.bezierCurveTo(x2 * 0.8, y1 + (y2 - y1) * 0.3, x2, y2 * 0.7, x2, y2);
        highlightPath.lineTo(x1 + (x2 - x1) * 0.5, y2 * 0.8);
        highlightPath.closePath();
      }
      
      g.append("path")
        .attr("d", highlightPath.toString())
        .attr("fill", getSeverityColor(severity))
        .attr("opacity", 0.3)
        .attr("stroke", getSeverityColor(severity))
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,3");
    }
    
    // Adicionar linhas de referência dos eixos (mais sutis)
    g.append("line")
      .attr("x1", -maxWidth - 15)
      .attr("y1", lateralY)
      .attr("x2", maxWidth + 15)
      .attr("y2", lateralY)
      .attr("stroke", "#64748b")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.6);
      
    g.append("line")
      .attr("x1", 0)
      .attr("y1", anteriorY - 15)
      .attr("x2", 0)
      .attr("y2", posteriorY + 15)
      .attr("stroke", "#64748b")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.6);
    
    // Adicionar indicadores das medidas reais (mais elegantes)
    g.append("text")
      .attr("x", 0)
      .attr("y", anteriorY - 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .attr("fill", "#475569")
      .text(`C: ${comprimento}mm`);
      
    g.append("text")
      .attr("x", maxWidth + 20)
      .attr("y", lateralY + 4)
      .attr("text-anchor", "start")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .attr("fill", "#475569")
      .text(`L: ${largura}mm`);
    
    // Indicar as diagonais se houver assimetria significativa
    if (cvai > 3.5) {
      const diagColor = getSeverityColor(severity);
      
      g.append("text")
        .attr("x", rightFlattened ? maxWidth * 0.6 : -maxWidth * 0.6)
        .attr("y", posteriorY * 0.4)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .attr("fill", diagColor)
        .text(`Dd: ${diagonalD}mm`);
        
      g.append("text")
        .attr("x", rightFlattened ? -maxWidth * 0.6 : maxWidth * 0.6)
        .attr("y", posteriorY * 0.4)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .attr("fill", diagColor)
        .text(`De: ${diagonalE}mm`);
    }
    
    // Adicionar rótulos de orientação (mais limpos)
    g.append("text")
      .attr("x", 0)
      .attr("y", anteriorY - 35)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .attr("fill", "#334155")
      .text("Anterior");
      
    g.append("text")
      .attr("x", 0)
      .attr("y", posteriorY + 35)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .attr("fill", "#334155")
      .text("Posterior");
      
    g.append("text")
      .attr("x", -maxWidth - 35)
      .attr("y", lateralY)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .attr("fill", "#334155")
      .text("Esquerda");
      
    g.append("text")
      .attr("x", maxWidth + 35)
      .attr("y", lateralY)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .attr("fill", "#334155")
      .text("Direita");
    
    // Adicionar legenda com classificação (mais prominente)
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "15px")
      .attr("font-weight", "700")
      .attr("fill", getSeverityColor(severity))
      .text(`${asymmetryType}${severity !== "normal" ? ` (${severity})` : ""}`);
      
  }, [measurements, asymmetryType, severity]);
  
  return (
    <div className="flex flex-col items-center">
      <svg 
        ref={svgRef} 
        width="100%" 
        height="350" 
        viewBox="0 0 350 350" 
        className="border rounded-lg bg-gradient-to-br from-card/30 to-card/60 shadow-sm"
      />
    </div>
  );
}
