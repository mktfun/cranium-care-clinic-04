
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
  viewType?: "superior" | "frontal" | "lateral";
}

export default function CranialSilhouette({
  measurements,
  asymmetryType,
  severity,
  viewType = "superior"
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
    
    // Calcular proporções para visualização
    const maxDimension = Math.max(measurements.comprimento, measurements.largura);
    const scale = (width * 0.8) / maxDimension;
    
    // Parâmetros para desenhar a silhueta
    const scaledWidth = measurements.largura * scale;
    const scaledLength = measurements.comprimento * scale;
    const scaledDiagonalD = measurements.diagonalD * scale;
    const scaledDiagonalE = measurements.diagonalE * scale;
    
    // Grupo principal com transformação para centralizar
    const g = svg.append("g")
      .attr("transform", `translate(${centerX}, ${centerY})`);
    
    if (viewType === "superior") {
      // Desenhar silhueta vista superior
      if (asymmetryType === "Normal") {
        // Crânio normal - forma oval simétrica
        g.append("ellipse")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("rx", scaledWidth / 2)
          .attr("ry", scaledLength / 2)
          .attr("fill", "none")
          .attr("stroke", getSeverityColor(severity))
          .attr("stroke-width", 2)
          .attr("opacity", 0.8);
          
        // Área preenchida com opacidade
        g.append("ellipse")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("rx", scaledWidth / 2)
          .attr("ry", scaledLength / 2)
          .attr("fill", getSeverityColor(severity))
          .attr("opacity", 0.2);
      } 
      else if (asymmetryType === "Braquicefalia") {
        // Braquicefalia - crânio mais largo que comprido
        const path = d3.path();
        path.moveTo(-scaledWidth/2, 0);
        path.bezierCurveTo(
          -scaledWidth/2, -scaledLength/2.5, 
          -scaledWidth/4, -scaledLength/2, 
          0, -scaledLength/2
        );
        path.bezierCurveTo(
          scaledWidth/4, -scaledLength/2, 
          scaledWidth/2, -scaledLength/2.5, 
          scaledWidth/2, 0
        );
        path.bezierCurveTo(
          scaledWidth/2, scaledLength/2.5, 
          scaledWidth/4, scaledLength/2, 
          0, scaledLength/2
        );
        path.bezierCurveTo(
          -scaledWidth/4, scaledLength/2, 
          -scaledWidth/2, scaledLength/2.5, 
          -scaledWidth/2, 0
        );
        path.closePath();
        
        g.append("path")
          .attr("d", path.toString())
          .attr("fill", getSeverityColor(severity))
          .attr("opacity", 0.2)
          .attr("stroke", getSeverityColor(severity))
          .attr("stroke-width", 2);
      }
      else if (asymmetryType === "Dolicocefalia") {
        // Dolicocefalia - crânio mais comprido que largo
        const path = d3.path();
        path.moveTo(-scaledWidth/2, 0);
        path.bezierCurveTo(
          -scaledWidth/2, -scaledLength/1.8, 
          -scaledWidth/3, -scaledLength/2, 
          0, -scaledLength/2
        );
        path.bezierCurveTo(
          scaledWidth/3, -scaledLength/2, 
          scaledWidth/2, -scaledLength/1.8, 
          scaledWidth/2, 0
        );
        path.bezierCurveTo(
          scaledWidth/2, scaledLength/1.8, 
          scaledWidth/3, scaledLength/2, 
          0, scaledLength/2
        );
        path.bezierCurveTo(
          -scaledWidth/3, scaledLength/2, 
          -scaledWidth/2, scaledLength/1.8, 
          -scaledWidth/2, 0
        );
        path.closePath();
        
        g.append("path")
          .attr("d", path.toString())
          .attr("fill", getSeverityColor(severity))
          .attr("opacity", 0.2)
          .attr("stroke", getSeverityColor(severity))
          .attr("stroke-width", 2);
      }
      else if (asymmetryType === "Plagiocefalia" || asymmetryType === "Misto") {
        // Plagiocefalia - assimetria diagonal
        // Determinar qual diagonal é maior para desenhar a assimetria corretamente
        const isRightFlattened = measurements.diagonalD < measurements.diagonalE;
        
        const path = d3.path();
        if (isRightFlattened) {
          // Achatamento posterior direito
          path.moveTo(-scaledWidth/2, 0);
          path.bezierCurveTo(
            -scaledWidth/2, -scaledLength/2.2, 
            -scaledWidth/4, -scaledLength/2, 
            0, -scaledLength/2
          );
          path.bezierCurveTo(
            scaledWidth/4, -scaledLength/2, 
            scaledWidth/2, -scaledLength/3, 
            scaledWidth/2, 0
          );
          path.bezierCurveTo(
            scaledWidth/2, scaledLength/2.2, 
            scaledWidth/4, scaledLength/2, 
            0, scaledLength/2
          );
          path.bezierCurveTo(
            -scaledWidth/4, scaledLength/2, 
            -scaledWidth/2, scaledLength/2.2, 
            -scaledWidth/2, 0
          );
        } else {
          // Achatamento posterior esquerdo
          path.moveTo(-scaledWidth/2, 0);
          path.bezierCurveTo(
            -scaledWidth/2, -scaledLength/3, 
            -scaledWidth/4, -scaledLength/2, 
            0, -scaledLength/2
          );
          path.bezierCurveTo(
            scaledWidth/4, -scaledLength/2, 
            scaledWidth/2, -scaledLength/2.2, 
            scaledWidth/2, 0
          );
          path.bezierCurveTo(
            scaledWidth/2, scaledLength/2.2, 
            scaledWidth/4, scaledLength/2, 
            0, scaledLength/2
          );
          path.bezierCurveTo(
            -scaledWidth/4, scaledLength/2, 
            -scaledWidth/2, scaledLength/3, 
            -scaledWidth/2, 0
          );
        }
        path.closePath();
        
        g.append("path")
          .attr("d", path.toString())
          .attr("fill", getSeverityColor(severity))
          .attr("opacity", 0.2)
          .attr("stroke", getSeverityColor(severity))
          .attr("stroke-width", 2);
        
        // Destacar área de achatamento
        const flattenedArea = isRightFlattened ? 
          [[scaledWidth/4, -scaledLength/4], [scaledWidth/2, 0], [scaledWidth/4, scaledLength/4]] :
          [[-scaledWidth/4, -scaledLength/4], [-scaledWidth/2, 0], [-scaledWidth/4, scaledLength/4]];
          
        g.append("polygon")
          .attr("points", flattenedArea.map(p => p.join(",")).join(" "))
          .attr("fill", getSeverityColor(severity))
          .attr("opacity", 0.4)
          .attr("stroke", getSeverityColor(severity))
          .attr("stroke-width", 1);
      }
      
      // Adicionar linhas de medição
      g.append("line")
        .attr("x1", -scaledWidth/2)
        .attr("y1", 0)
        .attr("x2", scaledWidth/2)
        .attr("y2", 0)
        .attr("stroke", "#64748b")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4");
        
      g.append("line")
        .attr("x1", 0)
        .attr("y1", -scaledLength/2)
        .attr("x2", 0)
        .attr("y2", scaledLength/2)
        .attr("stroke", "#64748b")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4");
        
      // Adicionar rótulos
      g.append("text")
        .attr("x", 0)
        .attr("y", -scaledLength/2 - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#64748b")
        .text("Anterior");
        
      g.append("text")
        .attr("x", 0)
        .attr("y", scaledLength/2 + 15)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#64748b")
        .text("Posterior");
        
      g.append("text")
        .attr("x", -scaledWidth/2 - 10)
        .attr("y", 0)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#64748b")
        .text("Esquerda");
        
      g.append("text")
        .attr("x", scaledWidth/2 + 10)
        .attr("y", 0)
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#64748b")
        .text("Direita");
    }
    else if (viewType === "frontal") {
      // Vista frontal - mais simplificada com formato elíptico
      const frontAspectRatio = 1.2; // Proporção altura/largura para vista frontal
      const frontHeight = scaledWidth * frontAspectRatio;
      
      // Desenhar silhueta vista frontal
      g.append("ellipse")
        .attr("cx", 0)
        .attr("cy", -frontHeight * 0.1) // Deslocar um pouco para cima para deixar espaço para o pescoço
        .attr("rx", scaledWidth / 2)
        .attr("ry", frontHeight / 2)
        .attr("fill", getSeverityColor(severity))
        .attr("opacity", 0.2)
        .attr("stroke", getSeverityColor(severity))
        .attr("stroke-width", 2);
      
      // Esboço de pescoço
      g.append("path")
        .attr("d", `M${-scaledWidth/4},${frontHeight/2 - 15} v30 h${scaledWidth/2} v-30`)
        .attr("fill", getSeverityColor(severity))
        .attr("opacity", 0.1)
        .attr("stroke", getSeverityColor(severity))
        .attr("stroke-width", 1);
      
      // Linha de referência horizontal (altura máxima)
      g.append("line")
        .attr("x1", -scaledWidth/2 - 10)
        .attr("y1", -frontHeight/2)
        .attr("x2", scaledWidth/2 + 10)
        .attr("y2", -frontHeight/2)
        .attr("stroke", "#64748b")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4");
      
      // Linha de referência vertical
      g.append("line")
        .attr("x1", 0)
        .attr("y1", -frontHeight/2 - 10)
        .attr("x2", 0)
        .attr("y2", frontHeight/2 + 20)
        .attr("stroke", "#64748b")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4");
      
      // Se for plagiocefalia, mostrar assimetria facial
      if (asymmetryType === "Plagiocefalia" || asymmetryType === "Misto") {
        const isRightFlattened = measurements.diagonalD < measurements.diagonalE;
        const asymmetryFactor = 0.15;
        
        // Deslocar o centro ligeiramente
        const offsetX = isRightFlattened ? scaledWidth * asymmetryFactor : -scaledWidth * asymmetryFactor;
        
        // Adicionar indicação de assimetria
        g.append("path")
          .attr("d", isRightFlattened ? 
            `M${offsetX},${-frontHeight/4} c${scaledWidth/5},0 ${scaledWidth/3.5},${frontHeight/10} ${scaledWidth/3},${frontHeight/4}` :
            `M${offsetX},${-frontHeight/4} c${-scaledWidth/5},0 ${-scaledWidth/3.5},${frontHeight/10} ${-scaledWidth/3},${frontHeight/4}`
          )
          .attr("fill", "none")
          .attr("stroke", getSeverityColor(severity))
          .attr("stroke-width", 2)
          .attr("opacity", 0.8)
          .attr("stroke-dasharray", "6,3");
        
        // Texto explicativo
        g.append("text")
          .attr("x", isRightFlattened ? scaledWidth/3 : -scaledWidth/3)
          .attr("y", -frontHeight/2 - 20)
          .attr("text-anchor", isRightFlattened ? "end" : "start")
          .attr("font-size", "12px")
          .attr("fill", getSeverityColor(severity))
          .text(isRightFlattened ? "Assimetria à direita" : "Assimetria à esquerda");
      }
    }
    else if (viewType === "lateral") {
      // Vista lateral
      // Variáveis específicas para a vista lateral
      const profileHeight = scaledLength * 0.7;
      const profileWidth = scaledWidth * 0.6;
      
      // Forma básica para a vista lateral
      const lateralPath = d3.path();
      
      if (asymmetryType === "Braquicefalia") {
        // Braquicefalia - achatamento posterior mais acentuado
        lateralPath.moveTo(-profileWidth/2, profileHeight/2); // Pescoço
        lateralPath.lineTo(-profileWidth/2, 0); // Base do crânio
        lateralPath.bezierCurveTo(
          -profileWidth/2.2, -profileHeight/3, // Início da curva testa
          -profileWidth/6, -profileHeight/1.8, // Controle da curva testa
          0, -profileHeight/2 // Topo
        );
        lateralPath.bezierCurveTo(
          profileWidth/3, -profileHeight/2.2, // Controle posterior
          profileWidth/2, -profileHeight/3, // Controle posterior inferior
          profileWidth/2, 0 // Base posterior
        );
        lateralPath.lineTo(profileWidth/2, profileHeight/2); // Pescoço
      } 
      else if (asymmetryType === "Dolicocefalia") {
        // Dolicocefalia - crânio mais comprido
        lateralPath.moveTo(-profileWidth/2, profileHeight/2); // Pescoço
        lateralPath.lineTo(-profileWidth/2, 0); // Base do crânio
        lateralPath.bezierCurveTo(
          -profileWidth/2.2, -profileHeight/3, // Início da curva testa
          -profileWidth/5, -profileHeight/1.5, // Controle da curva testa
          0, -profileHeight/2 // Topo
        );
        lateralPath.bezierCurveTo(
          profileWidth/4, -profileHeight/1.8, // Controle posterior
          profileWidth/1.8, -profileHeight/4, // Controle posterior inferior
          profileWidth/1.5, 0 // Base posterior - mais alongada
        );
        lateralPath.lineTo(profileWidth/1.5, profileHeight/2); // Pescoço
      }
      else if (asymmetryType === "Plagiocefalia" || asymmetryType === "Misto") {
        // Plagiocefalia na vista lateral - achatamento assimétrico
        lateralPath.moveTo(-profileWidth/2, profileHeight/2); // Pescoço
        lateralPath.lineTo(-profileWidth/2, 0); // Base do crânio
        lateralPath.bezierCurveTo(
          -profileWidth/2.2, -profileHeight/3, // Início da curva testa
          -profileWidth/6, -profileHeight/1.8, // Controle da curva testa
          0, -profileHeight/2 // Topo
        );
        // Achatamento oblíquo
        lateralPath.bezierCurveTo(
          profileWidth/6, -profileHeight/2.5, // Controle posterior superior
          profileWidth/2.5, -profileHeight/8, // Controle posterior inferior - achatado
          profileWidth/2, 0 // Base posterior
        );
        lateralPath.lineTo(profileWidth/2, profileHeight/2); // Pescoço
      }
      else {
        // Forma normal
        lateralPath.moveTo(-profileWidth/2, profileHeight/2); // Pescoço
        lateralPath.lineTo(-profileWidth/2, 0); // Base do crânio
        lateralPath.bezierCurveTo(
          -profileWidth/2.2, -profileHeight/3, // Início da curva testa
          -profileWidth/6, -profileHeight/1.8, // Controle da curva testa
          0, -profileHeight/2 // Topo
        );
        lateralPath.bezierCurveTo(
          profileWidth/4, -profileHeight/1.8, // Controle posterior
          profileWidth/2, -profileHeight/3, // Controle posterior inferior
          profileWidth/2, 0 // Base posterior
        );
        lateralPath.lineTo(profileWidth/2, profileHeight/2); // Pescoço
      }
      
      // Desenhar o perfil
      g.append("path")
        .attr("d", lateralPath.toString())
        .attr("fill", getSeverityColor(severity))
        .attr("opacity", 0.2)
        .attr("stroke", getSeverityColor(severity))
        .attr("stroke-width", 2);
      
      // Destacar áreas de achatamento para braquicefalia e plagiocefalia
      if (asymmetryType === "Braquicefalia" || asymmetryType === "Plagiocefalia" || asymmetryType === "Misto") {
        const highlightPath = d3.path();
        highlightPath.moveTo(profileWidth/4, -profileHeight/4);
        highlightPath.bezierCurveTo(
          profileWidth/3, -profileHeight/5,
          profileWidth/2, -profileHeight/6,
          profileWidth/2, 0
        );
        
        g.append("path")
          .attr("d", highlightPath.toString())
          .attr("fill", "none")
          .attr("stroke", getSeverityColor(severity))
          .attr("stroke-width", 3)
          .attr("opacity", 0.8);
      }
      
      // Rótulos para orientação
      g.append("text")
        .attr("x", -profileWidth/2 - 10)
        .attr("y", 0)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#64748b")
        .text("Anterior");
        
      g.append("text")
        .attr("x", profileWidth/2 + 10)
        .attr("y", 0)
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#64748b")
        .text("Posterior");
    }
    
    // Adicionar legenda com classificação
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", getSeverityColor(severity))
      .text(`${asymmetryType} ${severity !== "normal" ? `(${severity})` : ""}`);
      
  }, [measurements, asymmetryType, severity, viewType]);
  
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
