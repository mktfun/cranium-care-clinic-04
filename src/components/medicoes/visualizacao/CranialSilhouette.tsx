
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
    
    const width = 300;
    const height = 300;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Grupo principal com transformação para centralizar
    const g = svg.append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);
    
    // Calcular proporções reais baseadas nas medidas
    const { comprimento, largura, diagonalD, diagonalE } = measurements;
    
    // Calcular escala para que a visualização caiba no SVG (área útil de 80%)
    const maxDimension = Math.max(comprimento, largura);
    const scale = (width * 0.7) / maxDimension;
    
    // Dimensões escaladas
    const scaledLength = comprimento * scale; // Comprimento anteroposterior
    const scaledWidth = largura * scale;     // Largura biparietal
    
    // Calcular assimetria baseada nas diagonais
    const diagonalDiff = Math.abs(diagonalD - diagonalE);
    const longerDiagonal = Math.max(diagonalD, diagonalE);
    const cvai = (diagonalDiff / longerDiagonal) * 100;
    
    // Determinar qual lado está achatado (diagonal menor indica achatamento)
    const rightFlattened = diagonalD < diagonalE; // Diagonal D geralmente representa lado direito posterior
    
    // Fator de assimetria proporcional ao CVAI
    const asymmetryFactor = Math.min(cvai / 15, 0.3); // Normalizar para máximo de 30% de distorção
    
    // Criar path usando curvas de Bézier para representar a forma craniana
    const path = d3.path();
    
    // Raios base da elipse (representando a proporção IC)
    const radiusX = scaledWidth / 2;  // Raio horizontal (largura)
    const radiusY = scaledLength / 2; // Raio vertical (comprimento)
    
    // Pontos de controle para os quadrantes
    // Aplicar distorção baseada na assimetria
    const anteriorTop = { x: 0, y: -radiusY };
    const posteriorBottom = { x: 0, y: radiusY };
    const leftSide = { x: -radiusX, y: 0 };
    const rightSide = { x: radiusX, y: 0 };
    
    // Calcular distorção nos quadrantes posteriores baseada na assimetria
    let posteriorLeftControl = { x: -radiusX * 0.7, y: radiusY * 0.7 };
    let posteriorRightControl = { x: radiusX * 0.7, y: radiusY * 0.7 };
    
    if (cvai > 3.5) { // Apenas aplicar distorção visível se houver assimetria significativa
      if (rightFlattened) {
        // Achatamento no lado direito posterior
        posteriorRightControl.x *= (1 - asymmetryFactor * 0.5);
        posteriorRightControl.y *= (1 + asymmetryFactor * 0.3);
      } else {
        // Achatamento no lado esquerdo posterior
        posteriorLeftControl.x *= (1 - asymmetryFactor * 0.5);
        posteriorLeftControl.y *= (1 + asymmetryFactor * 0.3);
      }
    }
    
    // Construir o path da forma craniana
    path.moveTo(anteriorTop.x, anteriorTop.y); // Topo anterior
    
    // Quadrante anterior direito
    path.bezierCurveTo(
      radiusX * 0.6, -radiusY * 0.8,  // Controle 1
      radiusX * 0.8, -radiusY * 0.3,  // Controle 2
      rightSide.x, rightSide.y        // Ponto final (lado direito)
    );
    
    // Quadrante posterior direito
    path.bezierCurveTo(
      posteriorRightControl.x, posteriorRightControl.y * 0.3,  // Controle 1
      posteriorRightControl.x, posteriorRightControl.y,        // Controle 2
      posteriorBottom.x, posteriorBottom.y                     // Ponto final (posterior)
    );
    
    // Quadrante posterior esquerdo
    path.bezierCurveTo(
      posteriorLeftControl.x, posteriorLeftControl.y,        // Controle 1
      posteriorLeftControl.x, posteriorLeftControl.y * 0.3,  // Controle 2
      leftSide.x, leftSide.y                                 // Ponto final (lado esquerdo)
    );
    
    // Quadrante anterior esquerdo
    path.bezierCurveTo(
      -radiusX * 0.8, -radiusY * 0.3,  // Controle 1
      -radiusX * 0.6, -radiusY * 0.8,  // Controle 2
      anteriorTop.x, anteriorTop.y      // Ponto final (anterior)
    );
    
    path.closePath();
    
    // Desenhar a forma craniana
    g.append("path")
      .attr("d", path.toString())
      .attr("fill", getSeverityColor(severity))
      .attr("opacity", 0.2)
      .attr("stroke", getSeverityColor(severity))
      .attr("stroke-width", 2);
    
    // Destacar área de achatamento se houver assimetria significativa
    if (cvai > 3.5) {
      const highlightPath = d3.path();
      
      if (rightFlattened) {
        // Destacar achatamento direito
        highlightPath.moveTo(radiusX * 0.3, radiusY * 0.2);
        highlightPath.bezierCurveTo(
          posteriorRightControl.x * 0.8, posteriorRightControl.y * 0.5,
          posteriorRightControl.x, posteriorRightControl.y * 0.8,
          radiusX * 0.2, radiusY * 0.8
        );
        highlightPath.lineTo(radiusX * 0.5, radiusY * 0.5);
        highlightPath.closePath();
      } else {
        // Destacar achatamento esquerdo
        highlightPath.moveTo(-radiusX * 0.3, radiusY * 0.2);
        highlightPath.bezierCurveTo(
          posteriorLeftControl.x * 0.8, posteriorLeftControl.y * 0.5,
          posteriorLeftControl.x, posteriorLeftControl.y * 0.8,
          -radiusX * 0.2, radiusY * 0.8
        );
        highlightPath.lineTo(-radiusX * 0.5, radiusY * 0.5);
        highlightPath.closePath();
      }
      
      g.append("path")
        .attr("d", highlightPath.toString())
        .attr("fill", getSeverityColor(severity))
        .attr("opacity", 0.4)
        .attr("stroke", getSeverityColor(severity))
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,2");
    }
    
    // Adicionar linhas de referência dos eixos
    g.append("line")
      .attr("x1", -radiusX - 10)
      .attr("y1", 0)
      .attr("x2", radiusX + 10)
      .attr("y2", 0)
      .attr("stroke", "#64748b")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");
      
    g.append("line")
      .attr("x1", 0)
      .attr("y1", -radiusY - 10)
      .attr("x2", 0)
      .attr("y2", radiusY + 10)
      .attr("stroke", "#64748b")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");
    
    // Adicionar indicadores das medidas reais
    g.append("text")
      .attr("x", 0)
      .attr("y", -radiusY - 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#64748b")
      .text(`L: ${comprimento}mm`);
      
    g.append("text")
      .attr("x", radiusX + 15)
      .attr("y", 5)
      .attr("text-anchor", "start")
      .attr("font-size", "10px")
      .attr("fill", "#64748b")
      .text(`W: ${largura}mm`);
    
    // Indicar as diagonais se houver assimetria
    if (cvai > 3.5) {
      g.append("text")
        .attr("x", rightFlattened ? radiusX * 0.6 : -radiusX * 0.6)
        .attr("y", radiusY * 0.6)
        .attr("text-anchor", "middle")
        .attr("font-size", "9px")
        .attr("fill", getSeverityColor(severity))
        .text(`Dd: ${diagonalD}mm`);
        
      g.append("text")
        .attr("x", rightFlattened ? -radiusX * 0.6 : radiusX * 0.6)
        .attr("y", radiusY * 0.6)
        .attr("text-anchor", "middle")
        .attr("font-size", "9px")
        .attr("fill", getSeverityColor(severity))
        .text(`De: ${diagonalE}mm`);
    }
    
    // Adicionar rótulos de orientação
    g.append("text")
      .attr("x", 0)
      .attr("y", -radiusY - 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#64748b")
      .text("Anterior");
      
    g.append("text")
      .attr("x", 0)
      .attr("y", radiusY + 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#64748b")
      .text("Posterior");
      
    g.append("text")
      .attr("x", -radiusX - 25)
      .attr("y", 0)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#64748b")
      .text("Esquerda");
      
    g.append("text")
      .attr("x", radiusX + 25)
      .attr("y", 0)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#64748b")
      .text("Direita");
    
    // Adicionar legenda com classificação
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", getSeverityColor(severity))
      .text(`${asymmetryType} ${severity !== "normal" ? `(${severity})` : ""}`);
      
  }, [measurements, asymmetryType, severity]);
  
  return (
    <div className="flex flex-col items-center">
      <svg 
        ref={svgRef} 
        width="100%" 
        height="300" 
        viewBox="0 0 300 300" 
        className="border rounded-lg bg-card/50"
      />
    </div>
  );
}
