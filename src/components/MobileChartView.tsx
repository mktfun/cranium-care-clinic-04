import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, Maximize, MinusCircle, PlusCircle, ArrowLeftRight } from "lucide-react";
import { PacientesMedicoesChart } from "@/components/PacientesMedicoesChart";
import { cn } from "@/lib/utils";
import { MedicoesPorDiaChart } from "@/components/MedicoesPorDiaChart";
import { PacientesStatusChart } from "@/components/PacientesStatusChart";
import { MedicoesPacientesDiarioChart } from "@/components/MedicoesPacientesDiarioChart";
import { useIsMobileOrTabletPortrait } from "@/hooks/use-mobile";

export function MobileChartView() {
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  const [chartHeight, setChartHeight] = useState(300);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrollMode, setScrollMode] = useState<"free" | "locked">("free");
  const [chartTimePeriod, setChartTimePeriod] = useState("6months");
  const isMobileOrTablet = useIsMobileOrTabletPortrait();
  
  // Define chart types available - now with clinic-relevant metrics only
  const chartTypes = [
    {
      id: "pacientesMedicoes",
      title: "Pacientes x Medições",
      description: "Comparativo entre pacientes únicos e medições realizadas"
    },
    {
      id: "medicoesPorDia",
      title: "Medições por Dia",
      description: "Frequência de medições nos últimos 7 dias"
    },
    {
      id: "statusDistribuicao",
      title: "Status dos Pacientes",
      description: "Distribuição de pacientes por severidade craniana"
    },
    {
      id: "medicoesPacientesDiario14",
      title: "Atividade Diária (14 dias)",
      description: "Medições x Pacientes únicos - últimos 14 dias"
    },
    {
      id: "medicoesPacientesDiario7",
      title: "Atividade Diária (7 dias)",
      description: "Medições x Pacientes únicos - última semana"
    }
  ];
  
  const nextChart = () => {
    setCurrentChartIndex((prev) => (prev === chartTypes.length - 1 ? 0 : prev + 1));
  };
  
  const prevChart = () => {
    setCurrentChartIndex((prev) => (prev === 0 ? chartTypes.length - 1 : prev - 1));
  };

  const increaseHeight = () => {
    setChartHeight(prev => Math.min(prev + 50, 550));
  };

  const decreaseHeight = () => {
    setChartHeight(prev => Math.max(prev - 50, 200));
  };

  const resetZoom = () => {
    setChartHeight(300);
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setChartHeight(450);
    } else {
      setChartHeight(300);
    }
  };

  const toggleScrollMode = () => {
    setScrollMode(prev => prev === "free" ? "locked" : "free");
  };
  
  const currentChart = chartTypes[currentChartIndex];

  return (
    <Card className={cn(
      "h-full transition-all duration-300", 
      isFullscreen && "fixed inset-0 z-50 bg-card/95 backdrop-blur-sm"
    )}>
      <CardHeader className="pb-1">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{currentChart.title}</CardTitle>
            <CardDescription className="text-xs line-clamp-2">{currentChart.description}</CardDescription>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={decreaseHeight}>
              <MinusCircle className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={increaseHeight}>
              <PlusCircle className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetZoom}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleScrollMode} title={scrollMode === "free" ? "Bloquear scroll" : "Liberar scroll"}>
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleFullscreen}>
              <Maximize className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div 
          className={cn(
            "transition-all duration-200 overflow-y-hidden pb-2",
            scrollMode === "free" ? "touch-auto overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent" : "overflow-x-hidden touch-none",
            isFullscreen && "pb-8"
          )}
          style={{ height: chartHeight }}
        >
          {currentChart.id === "pacientesMedicoes" && (
            <PacientesMedicoesChart altura={chartHeight - 10} timePeriod={chartTimePeriod} />
          )}
          
          {currentChart.id === "medicoesPorDia" && (
            <MedicoesPorDiaChart altura={chartHeight - 10} />
          )}
          
          {currentChart.id === "statusDistribuicao" && (
            <PacientesStatusChart altura={chartHeight - 10} />
          )}

          {currentChart.id === "medicoesPacientesDiario14" && (
            <MedicoesPacientesDiarioChart altura={chartHeight - 10} dias={14} />
          )}

          {currentChart.id === "medicoesPacientesDiario7" && (
            <MedicoesPacientesDiarioChart altura={chartHeight - 10} dias={7} />
          )}
        </div>
        
        <div className="flex justify-between mt-3">
          <Button variant="outline" size="sm" onClick={prevChart} className="px-2 py-1 h-8 text-xs gap-1">
            <ChevronLeft className="h-4 w-4" /> 
            <span className="hidden xs:inline">Anterior</span>
          </Button>
          <div className="flex items-center">
            <span className="text-xs text-muted-foreground">
              {currentChartIndex + 1} / {chartTypes.length}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={nextChart} className="px-2 py-1 h-8 text-xs gap-1">
            <span className="hidden xs:inline">Próximo</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
