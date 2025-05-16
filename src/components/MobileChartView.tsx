
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, Maximize, MinusCircle, PlusCircle, ArrowLeftRight } from "lucide-react";
import { PacientesMedicoesChart } from "@/components/PacientesMedicoesChart";
import { cn } from "@/lib/utils";
import { MedicoesPorDiaChart } from "@/components/MedicoesPorDiaChart";

export function MobileChartView() {
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  const [chartHeight, setChartHeight] = useState(300);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrollMode, setScrollMode] = useState<"free" | "locked">("free");
  
  // Define chart types available - now with clinic-relevant metrics only
  const chartTypes = [
    {
      id: "pacientesMedicoes",
      title: "Pacientes x Medições",
      description: "Comparativo entre pacientes registrados e medições realizadas"
    },
    {
      id: "medicoesPorDia",
      title: "Medições por Dia",
      description: "Frequência de medições nos últimos 7 dias"
    },
    {
      id: "statusDistribuicao",
      title: "Status dos Pacientes",
      description: "Distribuição de pacientes por status de avaliação"
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
            <PacientesMedicoesChart altura={chartHeight - 10} />
          )}
          
          {currentChart.id === "medicoesPorDia" && (
            <MedicoesPorDiaChart altura={chartHeight - 10} />
          )}
          
          {currentChart.id === "statusDistribuicao" && (
            <StatusDistribuicaoChart altura={chartHeight - 10} />
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

// New component for status distribution chart
function StatusDistribuicaoChart({ altura = 300 }: { altura?: number }) {
  // Using recharts for consistency with other charts
  const statusData = [
    { name: 'Normal', valor: 65, fill: '#10b981' },
    { name: 'Leve', valor: 20, fill: '#f59e0b' },
    { name: 'Moderado', valor: 10, fill: '#f97316' },
    { name: 'Severo', valor: 5, fill: '#ef4444' },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="w-full max-w-md">
        {statusData.map((item) => (
          <div key={item.name} className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>{item.name}</span>
              <span className="font-medium">{item.valor}%</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full" 
                style={{ width: `${item.valor}%`, backgroundColor: item.fill }}
              />
            </div>
          </div>
        ))}
        <div className="text-xs text-center text-muted-foreground mt-4">
          Distribuição dos pacientes por severidade na avaliação craniana
        </div>
      </div>
    </div>
  );
}
