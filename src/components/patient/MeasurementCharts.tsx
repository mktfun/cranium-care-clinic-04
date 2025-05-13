
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronUp, ChevronDown } from "lucide-react";
import { MedicaoLineChart } from "@/components/MedicaoLineChart";

interface MeasurementChartsProps {
  medicoes: any[];
  dataNascimento: string;
  sexoPaciente: string;
}

export function MeasurementCharts({ medicoes, dataNascimento, sexoPaciente }: MeasurementChartsProps) {
  const [activeChartTab, setActiveChartTab] = useState("indiceCraniano");
  const [chartsExpanded, setChartsExpanded] = useState(true);

  const toggleChartsExpanded = () => {
    setChartsExpanded(!chartsExpanded);
  };

  if (medicoes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Evolução das Medições</CardTitle>
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
        <CardDescription>
          Selecione o parâmetro que deseja visualizar
        </CardDescription>
      </CardHeader>
      
      <CardContent className={chartsExpanded ? "transition-all duration-300 ease-in-out" : "h-0 overflow-hidden transition-all duration-300 ease-in-out"}>
        {chartsExpanded && (
          <Tabs defaultValue={activeChartTab} value={activeChartTab} onValueChange={setActiveChartTab} className="w-full">
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="indiceCraniano">Índice Craniano</TabsTrigger>
              <TabsTrigger value="cvai">Plagiocefalia (CVAI)</TabsTrigger>
              <TabsTrigger value="diagonais">Diagonais</TabsTrigger>
              <TabsTrigger value="perimetro">Perímetro Cefálico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="indiceCraniano" className="mt-0">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/20 dark:bg-gray-800/30">
                  <p><strong>O que é?</strong> O Índice Craniano mede a proporção entre largura e comprimento do crânio.</p>
                  <p><strong>Como interpretar:</strong> Valores entre 76% e 80% são considerados normais (zona verde no gráfico).</p>
                  <p><strong>Desvios:</strong> Valores acima de 80% indicam tendência à braquicefalia, enquanto valores abaixo de 76% indicam tendência à dolicocefalia.</p>
                </div>
                <MedicaoLineChart 
                  titulo="Evolução do Índice Craniano" 
                  medicoes={medicoes}
                  dataNascimento={dataNascimento}
                  tipoGrafico="indiceCraniano"
                  sexoPaciente={sexoPaciente}
                  linhaCorTheme="rose"
                  altura={400}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="cvai" className="mt-0">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/20 dark:bg-gray-800/30">
                  <p><strong>O que é?</strong> O índice CVAI (Cranial Vault Asymmetry Index) mede o grau de assimetria craniana.</p>
                  <p><strong>Como interpretar:</strong> Valores abaixo de 3.5% são considerados normais (zona verde no gráfico).</p>
                  <p><strong>Desvios:</strong> Valores entre 3.5% e 6.25% indicam plagiocefalia leve, entre 6.25% e 8.5% moderada, e acima de 8.5% severa.</p>
                </div>
                <MedicaoLineChart 
                  titulo="Evolução da Plagiocefalia (CVAI)" 
                  medicoes={medicoes}
                  dataNascimento={dataNascimento}
                  tipoGrafico="cvai"
                  sexoPaciente={sexoPaciente}
                  linhaCorTheme="amber"
                  altura={400}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="diagonais" className="mt-0">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/20 dark:bg-gray-800/30">
                  <p><strong>O que é?</strong> Este gráfico mostra a evolução da diferença entre as diagonais cranianas (assimetria).</p>
                  <p><strong>Como interpretar:</strong> A diferença ideal deve ser menor que 3mm (zona verde no gráfico).</p>
                  <p><strong>Evolução:</strong> Uma redução desta diferença ao longo do tratamento indica melhora na simetria craniana.</p>
                </div>
                <MedicaoLineChart 
                  titulo="Evolução das Diagonais" 
                  medicoes={medicoes}
                  dataNascimento={dataNascimento}
                  tipoGrafico="diagonais"
                  sexoPaciente={sexoPaciente}
                  linhaCorTheme="purple"
                  altura={400}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="perimetro" className="mt-0">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/20 dark:bg-gray-800/30">
                  <p><strong>O que é?</strong> O Perímetro Cefálico (PC) é a medida da circunferência da cabeça.</p>
                  <p><strong>Como interpretar:</strong> Acompanha-se o crescimento através de curvas de referência (OMS ou específicas), observando se o PC está dentro dos percentis esperados para a idade e sexo.</p>
                  <p><strong>Desvios:</strong> Valores muito abaixo (microcefalia) ou muito acima (macrocefalia) do esperado podem indicar condições que necessitam investigação.</p>
                </div>
                <MedicaoLineChart 
                  titulo="Evolução do Perímetro Cefálico"
                  medicoes={medicoes}
                  dataNascimento={dataNascimento}
                  tipoGrafico="perimetro"
                  sexoPaciente={sexoPaciente}
                  linhaCorTheme="green"
                  altura={400}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
