
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronUp, ChevronDown, ZoomIn, ZoomOut, ArrowLeftRight } from "lucide-react";
import { MedicaoLineChart } from "@/components/MedicaoLineChart";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";  // Added missing import

interface MeasurementChartsProps {
  medicoes: any[];
  dataNascimento: string;
  sexoPaciente: string;
}

export function MeasurementCharts({ medicoes, dataNascimento, sexoPaciente }: MeasurementChartsProps) {
  const [activeChartTab, setActiveChartTab] = useState("indiceCraniano");
  const [chartsExpanded, setChartsExpanded] = useState(true);
  const [chartHeight, setChartHeight] = useState(400);
  const [scrollMode, setScrollMode] = useState<"free" | "locked">("free");
  const isMobile = useIsMobile();

  const toggleChartsExpanded = () => {
    setChartsExpanded(!chartsExpanded);
  };
  
  const increaseHeight = () => {
    setChartHeight(prev => Math.min(prev + 50, 550));
  };

  const decreaseHeight = () => {
    setChartHeight(prev => Math.max(prev - 50, 250));
  };
  
  const toggleScrollMode = () => {
    setScrollMode(prev => prev === "free" ? "locked" : "free");
  };

  if (medicoes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Evolução das Medições</CardTitle>
            {!isMobile && (
              <CardDescription>
                Selecione o parâmetro que deseja visualizar
              </CardDescription>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {isMobile && (
              <>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={decreaseHeight}>
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={increaseHeight}>
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleScrollMode} title={scrollMode === "free" ? "Bloquear scroll" : "Liberar scroll"}>
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleChartsExpanded}
              className="flex items-center gap-1"
            >
              {chartsExpanded ? (
                <>Minimizar <ChevronUp className="h-4 w-4" /></>
              ) : (
                <>Expandir <ChevronDown className="h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>
        {isMobile && chartsExpanded && (
          <CardDescription className="text-xs mt-1">
            Selecione o parâmetro abaixo
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className={chartsExpanded ? "transition-all duration-300 ease-in-out p-2 pt-0" : "h-0 overflow-hidden transition-all duration-300 ease-in-out"}>
        {chartsExpanded && (
          <Tabs defaultValue={activeChartTab} value={activeChartTab} onValueChange={setActiveChartTab} className="w-full">
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="indiceCraniano" className={isMobile ? "text-xs py-1" : ""}>Índ. Craniano</TabsTrigger>
              <TabsTrigger value="cvai" className={isMobile ? "text-xs py-1" : ""}>Plagiocefalia</TabsTrigger>
              <TabsTrigger value="diagonais" className={isMobile ? "text-xs py-1" : ""}>Diagonais</TabsTrigger>
              <TabsTrigger value="perimetro" className={isMobile ? "text-xs py-1" : ""}>Perimetro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="indiceCraniano" className="mt-0">
              <div className="space-y-4">
                {!isMobile && (
                <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/20 dark:bg-gray-800/30">
                  <p><strong>O que é?</strong> O Índice Craniano mede a proporção entre largura e comprimento do crânio.</p>
                  <p><strong>Como interpretar:</strong> Valores entre 76% e 80% são considerados normais (zona verde no gráfico).</p>
                  <p><strong>Desvios:</strong> Valores acima de 80% indicam tendência à braquicefalia, enquanto valores abaixo de 76% indicam tendência à dolicocefalia.</p>
                </div>
                )}
                {isMobile && (
                <div className="text-xs text-muted-foreground p-2 border rounded-md bg-muted/20 dark:bg-gray-800/30">
                  <p><strong>Normal:</strong> 76-80% | <strong>Alto:</strong> &gt;80% (braquicefalia) | <strong>Baixo:</strong> &lt;76% (dolicocefalia)</p>
                </div>
                )}
                <div 
                  className={cn(
                    "overflow-y-hidden",
                    scrollMode === "free" ? "touch-auto overflow-x-auto" : "overflow-x-hidden touch-none"
                  )}
                >
                  <MedicaoLineChart 
                    titulo="Evolução do Índice Craniano" 
                    medicoes={medicoes}
                    dataNascimento={dataNascimento}
                    tipoGrafico="indiceCraniano"
                    sexoPaciente={sexoPaciente}
                    linhaCorTheme="rose"
                    altura={isMobile ? chartHeight : 400}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="cvai" className="mt-0">
              <div className="space-y-4">
                {!isMobile && (
                <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/20 dark:bg-gray-800/30">
                  <p><strong>O que é?</strong> O índice CVAI (Cranial Vault Asymmetry Index) mede o grau de assimetria craniana.</p>
                  <p><strong>Como interpretar:</strong> Valores abaixo de 3.5% são considerados normais (zona verde no gráfico).</p>
                  <p><strong>Desvios:</strong> Valores entre 3.5% e 6.25% indicam plagiocefalia leve, entre 6.25% e 8.5% moderada, e acima de 8.5% severa.</p>
                </div>
                )}
                {isMobile && (
                <div className="text-xs text-muted-foreground p-2 border rounded-md bg-muted/20 dark:bg-gray-800/30">
                  <p><strong>Normal:</strong> &lt;3.5% | <strong>Leve:</strong> 3.5-6.25% | <strong>Moderada:</strong> 6.25-8.5% | <strong>Severa:</strong> &gt;8.5%</p>
                </div>
                )}
                <div 
                  className={cn(
                    "overflow-y-hidden",
                    scrollMode === "free" ? "touch-auto overflow-x-auto" : "overflow-x-hidden touch-none"
                  )}
                >
                  <MedicaoLineChart 
                    titulo="Evolução da Plagiocefalia (CVAI)" 
                    medicoes={medicoes}
                    dataNascimento={dataNascimento}
                    tipoGrafico="cvai"
                    sexoPaciente={sexoPaciente}
                    linhaCorTheme="amber"
                    altura={isMobile ? chartHeight : 400}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="diagonais" className="mt-0">
              <div className="space-y-4">
                {!isMobile && (
                <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/20 dark:bg-gray-800/30">
                  <p><strong>O que é?</strong> Este gráfico mostra a evolução da diferença entre as diagonais cranianas (assimetria).</p>
                  <p><strong>Como interpretar:</strong> A diferença ideal deve ser menor que 3mm (zona verde no gráfico).</p>
                  <p><strong>Evolução:</strong> Uma redução desta diferença ao longo do tratamento indica melhora na simetria craniana.</p>
                </div>
                )}
                {isMobile && (
                <div className="text-xs text-muted-foreground p-2 border rounded-md bg-muted/20 dark:bg-gray-800/30">
                  <p><strong>Ideal:</strong> diferença &lt;3mm | Redução da diferença indica melhora na simetria.</p>
                </div>
                )}
                <div 
                  className={cn(
                    "overflow-y-hidden",
                    scrollMode === "free" ? "touch-auto overflow-x-auto" : "overflow-x-hidden touch-none"
                  )}
                >
                  <MedicaoLineChart 
                    titulo="Evolução das Diagonais" 
                    medicoes={medicoes}
                    dataNascimento={dataNascimento}
                    tipoGrafico="diagonais"
                    sexoPaciente={sexoPaciente}
                    linhaCorTheme="purple"
                    altura={isMobile ? chartHeight : 400}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="perimetro" className="mt-0">
              <div className="space-y-4">
                {!isMobile && (
                <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/20 dark:bg-gray-800/30">
                  <p><strong>O que é?</strong> O Perímetro Cefálico (PC) é a medida da circunferência da cabeça.</p>
                  <p><strong>Como interpretar:</strong> Acompanha-se o crescimento através de curvas de referência (OMS ou específicas), observando se o PC está dentro dos percentis esperados para a idade e sexo.</p>
                  <p><strong>Desvios:</strong> Valores muito abaixo (microcefalia) ou muito acima (macrocefalia) do esperado podem indicar condições que necessitam investigação.</p>
                </div>
                )}
                {isMobile && (
                <div className="text-xs text-muted-foreground p-2 border rounded-md bg-muted/20 dark:bg-gray-800/30">
                  <p>Valores dentro dos percentis 3-97 são normais. Extremos podem indicar condições que requerem investigação.</p>
                </div>
                )}
                <div 
                  className={cn(
                    "overflow-y-hidden",
                    scrollMode === "free" ? "touch-auto overflow-x-auto" : "overflow-x-hidden touch-none"
                  )}
                >
                  <MedicaoLineChart 
                    titulo="Evolução do Perímetro Cefálico"
                    medicoes={medicoes}
                    dataNascimento={dataNascimento}
                    tipoGrafico="perimetro"
                    sexoPaciente={sexoPaciente}
                    linhaCorTheme="green"
                    altura={isMobile ? chartHeight : 400}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
