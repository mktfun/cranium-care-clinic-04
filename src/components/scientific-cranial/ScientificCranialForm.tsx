
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, FileText, AlertTriangle, Check, Info } from "lucide-react";
import { toast } from "sonner";
import { 
  calcularIndiceCefalico, 
  classificarFormatoCraniano,
  avaliarPerimetroCefalico,
  avaliarIndiceCefalico,
  getRecomendacoesCranianas,
  calcularMedidasCranianasCompletas,
  CephalicType
} from "@/lib/scientific-cranial-utils";

interface ScientificCranialFormProps {
  pacienteId: string;
  pacienteNome: string;
  pacienteDataNascimento: string;
  pacienteSexo: 'M' | 'F';
  onSaveMeasurement?: (data: any) => Promise<void>;
}

export default function ScientificCranialForm({
  pacienteId,
  pacienteNome,
  pacienteDataNascimento,
  pacienteSexo,
  onSaveMeasurement
}: ScientificCranialFormProps) {
  const [dataAvaliacao, setDataAvaliacao] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Medidas básicas
  const [comprimentoMaximo, setComprimentoMaximo] = useState<string>("");
  const [larguraMaxima, setLarguraMaxima] = useState<string>("");
  const [perimetroCefalico, setPerimetroCefalico] = useState<string>("");
  const [distanciaBiauricular, setDistanciaBiauricular] = useState<string>("");
  const [distanciaAnteroposteriror, setDistanciaAnteroposteriror] = useState<string>("");
  
  // Medidas calculadas
  const [indiceCefalico, setIndiceCefalico] = useState<number | null>(null);
  const [tipoCefalico, setTipoCefalico] = useState<CephalicType | null>(null);
  const [resultadoPC, setResultadoPC] = useState<{
    classificacao: 'abaixo' | 'normal' | 'acima';
    percentilAproximado: number;
  } | null>(null);
  const [resultadoIC, setResultadoIC] = useState<{
    classificacao: 'abaixo' | 'normal' | 'acima';
    percentilAproximado: number;
  } | null>(null);
  const [recomendacoes, setRecomendacoes] = useState<string[]>([]);
  
  // Estado para controlar visualização dos resultados
  const [showResults, setShowResults] = useState<boolean>(false);
  
  // Calcular a idade em meses
  const calcularIdadeEmMeses = (): number => {
    const hoje = new Date(dataAvaliacao);
    const nascimento = new Date(pacienteDataNascimento);
    return (hoje.getFullYear() - nascimento.getFullYear()) * 12 + 
           (hoje.getMonth() - nascimento.getMonth());
  };
  
  // Calcular resultados quando os valores necessários estiverem preenchidos
  useEffect(() => {
    if (comprimentoMaximo && larguraMaxima) {
      const comprimento = parseFloat(comprimentoMaximo);
      const largura = parseFloat(larguraMaxima);
      
      if (comprimento > 0 && largura > 0) {
        const ic = calcularIndiceCefalico(largura, comprimento);
        setIndiceCefalico(ic);
        setTipoCefalico(classificarFormatoCraniano(ic));
        
        // Calcular avaliação do índice cefálico
        const idadeMeses = calcularIdadeEmMeses();
        setResultadoIC(avaliarIndiceCefalico(ic, idadeMeses));
        
        // Se perímetro cefálico também estiver preenchido
        if (perimetroCefalico) {
          const pc = parseFloat(perimetroCefalico);
          if (pc > 0) {
            setResultadoPC(avaliarPerimetroCefalico(pc, idadeMeses, pacienteSexo));
            
            // Gerar recomendações
            if (tipoCefalico) {
              setRecomendacoes(getRecomendacoesCranianas(
                tipoCefalico, 
                idadeMeses, 
                resultadoPC?.classificacao || 'normal'
              ));
            }
          }
        }
      }
    }
  }, [comprimentoMaximo, larguraMaxima, perimetroCefalico, dataAvaliacao, tipoCefalico, resultadoPC]);
  
  const handleCalculate = () => {
    if (!comprimentoMaximo || !larguraMaxima || !perimetroCefalico) {
      toast.error("Preencha pelo menos os campos obrigatórios: Comprimento Máximo, Largura Máxima e Perímetro Cefálico");
      return;
    }
    
    setShowResults(true);
  };
  
  const handleSave = async () => {
    if (!onSaveMeasurement) return;
    
    try {
      // Preparar dados para salvar
      const comprimento = parseFloat(comprimentoMaximo);
      const largura = parseFloat(larguraMaxima);
      const perimetro = parseFloat(perimetroCefalico);
      const distBiauricular = distanciaBiauricular ? parseFloat(distanciaBiauricular) : undefined;
      const distAP = distanciaAnteroposteriror ? parseFloat(distanciaAnteroposteriror) : undefined;
      
      // Calcular medidas completas
      const medidasCompletas = calcularMedidasCranianasCompletas(
        comprimento,
        largura,
        perimetro,
        dataAvaliacao,
        pacienteDataNascimento,
        distBiauricular,
        distAP
      );
      
      // Formatar dados para o formato esperado pelo backend
      const dadosMedicao = {
        paciente_id: pacienteId,
        data: dataAvaliacao,
        comprimento: comprimento,
        largura: largura,
        perimetro_cefalico: perimetro,
        indice_craniano: medidasCompletas.indiceCefalico,
        tipo_cefalico: medidasCompletas.tipoCefalico,
        observacoes: `Avaliação científica craniana. Tipo: ${medidasCompletas.tipoCefalico}`,
        recomendacoes: recomendacoes,
        // Campos adicionais para compatibilidade com o sistema existente
        diagonal_d: 0,
        diagonal_e: 0,
        cvai: 0
      };
      
      // Salvar medição
      await onSaveMeasurement(dadosMedicao);
      toast.success("Medição craniana científica salva com sucesso!");
      
      // Limpar formulário após salvar
      setComprimentoMaximo("");
      setLarguraMaxima("");
      setPerimetroCefalico("");
      setDistanciaBiauricular("");
      setDistanciaAnteroposteriror("");
      setShowResults(false);
      
    } catch (error) {
      console.error("Erro ao salvar medição:", error);
      toast.error("Erro ao salvar medição. Tente novamente.");
    }
  };
  
  // Obter cor para o tipo cefálico
  const getCephalicTypeColor = (tipo: CephalicType | null): string => {
    if (!tipo) return "#F1F1F1";
    
    switch (tipo) {
      case "Mesocefalia":
        return "#F2FCE2";
      case "Braquicefalia":
        return "#FEF7CD";
      case "Hiperbraquicefalia":
        return "#FFDEE2";
      case "Dolicocefalia":
        return "#FEC6A1";
      case "Hiperdolicocefalia":
        return "#D3E4FD";
      default:
        return "#F1F1F1";
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-turquesa" />
            Avaliação Craniana Científica
          </CardTitle>
          <CardDescription>
            Baseado no Acordo Craniométrico de Frankfurt e estudos científicos recentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Dados básicos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-md">
              <div>
                <h3 className="font-medium">Paciente</h3>
                <p className="text-sm text-muted-foreground">{pacienteNome}</p>
              </div>
              <div>
                <h3 className="font-medium">Data de Nascimento</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(pacienteDataNascimento).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Idade</h3>
                <p className="text-sm text-muted-foreground">
                  {calcularIdadeEmMeses()} meses
                </p>
              </div>
            </div>
            
            {/* Data da avaliação */}
            <div className="space-y-2">
              <Label htmlFor="dataAvaliacao">Data da Avaliação</Label>
              <Input
                id="dataAvaliacao"
                type="date"
                value={dataAvaliacao}
                onChange={(e) => setDataAvaliacao(e.target.value)}
              />
            </div>
            
            <Separator />
            
            {/* Medidas obrigatórias */}
            <div>
              <h3 className="font-medium mb-4">Medidas Obrigatórias</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="comprimentoMaximo">
                    Comprimento Máximo (mm) *
                    <span className="ml-1 text-xs text-muted-foreground">(glabela-opistocrânio)</span>
                  </Label>
                  <Input
                    id="comprimentoMaximo"
                    type="number"
                    placeholder="Ex: 170"
                    value={comprimentoMaximo}
                    onChange={(e) => setComprimentoMaximo(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="larguraMaxima">
                    Largura Máxima (mm) *
                    <span className="ml-1 text-xs text-muted-foreground">(biparietal)</span>
                  </Label>
                  <Input
                    id="larguraMaxima"
                    type="number"
                    placeholder="Ex: 135"
                    value={larguraMaxima}
                    onChange={(e) => setLarguraMaxima(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="perimetroCefalico">
                    Perímetro Cefálico (mm) *
                    <span className="ml-1 text-xs text-muted-foreground">(maior circunferência)</span>
                  </Label>
                  <Input
                    id="perimetroCefalico"
                    type="number"
                    placeholder="Ex: 430"
                    value={perimetroCefalico}
                    onChange={(e) => setPerimetroCefalico(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Medidas complementares */}
            <div>
              <h3 className="font-medium mb-4">Medidas Complementares</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="distanciaBiauricular">
                    Distância Biauricular (mm)
                    <span className="ml-1 text-xs text-muted-foreground">(pontos pré-auriculares)</span>
                  </Label>
                  <Input
                    id="distanciaBiauricular"
                    type="number"
                    placeholder="Ex: 120"
                    value={distanciaBiauricular}
                    onChange={(e) => setDistanciaBiauricular(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="distanciaAnteroposteriror">
                    Distância Anteroposterior (mm)
                    <span className="ml-1 text-xs text-muted-foreground">(glabela-occipital)</span>
                  </Label>
                  <Input
                    id="distanciaAnteroposteriror"
                    type="number"
                    placeholder="Ex: 165"
                    value={distanciaAnteroposteriror}
                    onChange={(e) => setDistanciaAnteroposteriror(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            {/* Botão para calcular */}
            <div className="flex justify-center mt-6">
              <Button 
                onClick={handleCalculate}
                className="bg-turquesa hover:bg-turquesa/90"
                disabled={!comprimentoMaximo || !larguraMaxima || !perimetroCefalico}
              >
                <FileText className="h-4 w-4 mr-2" />
                Calcular e Analisar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Resultados */}
      {showResults && indiceCefalico !== null && tipoCefalico !== null && (
        <Card>
          <CardHeader style={{ backgroundColor: getCephalicTypeColor(tipoCefalico), borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}>
            <CardTitle className="flex items-center gap-2">
              Resultado da Análise Craniana
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Índice cefálico e classificação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium mb-2">Índice Cefálico (IC)</h3>
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold">{indiceCefalico.toFixed(1)}%</span>
                    <span className="text-lg text-muted-foreground pb-1">
                      {resultadoIC && `(${resultadoIC.percentilAproximado}º percentil)`}
                    </span>
                  </div>
                  
                  <div className="mt-2 mb-4">
                    <div className="text-sm flex items-center gap-1">
                      Fórmula: 
                      <span className="font-mono bg-slate-100 px-1 text-xs">
                        (Largura / Comprimento) × 100
                      </span>
                    </div>
                    <div className="text-sm flex items-center gap-1">
                      Cálculo: 
                      <span className="font-mono bg-slate-100 px-1 text-xs">
                        ({larguraMaxima} / {comprimentoMaximo}) × 100 = {indiceCefalico.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{tipoCefalico}</span>
                      {resultadoIC && resultadoIC.classificacao !== 'normal' && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          {resultadoIC.classificacao === 'abaixo' ? 'Abaixo do esperado' : 'Acima do esperado'}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3 grid grid-cols-5 gap-1 text-xs">
                      <div className="p-1 bg-blue-100 text-center rounded-l-md">
                        Hiperdolicocefalia<br/>&lt;71%
                      </div>
                      <div className="p-1 bg-orange-100 text-center">
                        Dolicocefalia<br/>71-75%
                      </div>
                      <div className="p-1 bg-green-100 text-center">
                        Mesocefalia<br/>75-80%
                      </div>
                      <div className="p-1 bg-yellow-100 text-center">
                        Braquicefalia<br/>80-85%
                      </div>
                      <div className="p-1 bg-red-100 text-center rounded-r-md">
                        Hiperbraquicefalia<br/>&gt;85%
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium mb-2">Perímetro Cefálico</h3>
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold">{perimetroCefalico} mm</span>
                    <span className="text-lg text-muted-foreground pb-1">
                      {resultadoPC && `(${resultadoPC.percentilAproximado}º percentil)`}
                    </span>
                  </div>
                  
                  {resultadoPC && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Classificação:</span>
                        {resultadoPC.classificacao === 'normal' ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Dentro do esperado para a idade
                          </span>
                        ) : resultadoPC.classificacao === 'abaixo' ? (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Abaixo do esperado para a idade
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Acima do esperado para a idade
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-1">Referência por idade e sexo</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="border rounded p-2">
                        <div className="font-medium mb-1">Percentil 3</div>
                        {pacienteSexo === 'M' ? '~410mm (0-6m)' : '~403mm (0-6m)'}<br/>
                        {pacienteSexo === 'M' ? '~438mm (6-12m)' : '~430mm (6-12m)'}<br/>
                        {pacienteSexo === 'M' ? '~459mm (1-2a)' : '~451mm (1-2a)'}
                      </div>
                      <div className="border rounded p-2">
                        <div className="font-medium mb-1">Percentil 97</div>
                        {pacienteSexo === 'M' ? '~465mm (0-6m)' : '~453mm (0-6m)'}<br/>
                        {pacienteSexo === 'M' ? '~491mm (6-12m)' : '~479mm (6-12m)'}<br/>
                        {pacienteSexo === 'M' ? '~512mm (1-2a)' : '~501mm (1-2a)'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recomendações */}
              {recomendacoes.length > 0 && (
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4 text-turquesa" />
                    Recomendações Clínicas
                  </h3>
                  
                  <ul className="space-y-2">
                    {recomendacoes.map((recomendacao, index) => (
                      <li key={index} className="flex items-start gap-2">
                        {!recomendacao.startsWith('-') && <Check className="h-4 w-4 text-green-600 mt-1" />}
                        <span className={recomendacao.startsWith('-') ? 'ml-6' : ''}>
                          {recomendacao}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 text-xs text-muted-foreground">
                    <p>* Recomendações baseadas nas curvas de crescimento da OMS e diretrizes da Academia Americana de Pediatria.</p>
                    <p>* Toda avaliação deve ser considerada dentro do contexto clínico completo do paciente.</p>
                  </div>
                </div>
              )}
              
              {/* Diagrama anatômico */}
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Pontos de Referência Anatômicos</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-sm space-y-2">
                    <p className="flex items-start gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-red-500 mt-1"></span>
                      <span><strong>Glabela:</strong> Ponto mais proeminente na linha média entre as sobrancelhas</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mt-1"></span>
                      <span><strong>Opistocrânio:</strong> Ponto mais proeminente no occipital</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500 mt-1"></span>
                      <span><strong>Pontos parietais:</strong> Pontos mais laterais nos ossos parietais</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mt-1"></span>
                      <span><strong>Pontos pré-auriculares:</strong> Pontos anteriores à inserção dos pavilhões auriculares</span>
                    </p>
                  </div>
                  
                  <div className="flex justify-center items-center">
                    <div className="p-2 border rounded bg-slate-50 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Diagrama ilustrativo</p>
                      <div className="w-48 h-48 rounded-full bg-slate-200 relative mx-auto">
                        {/* Representação simplificada da cabeça */}
                        <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-green-500 transform -translate-y-1/2 -translate-x-1/2"></div>
                        <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-green-500 transform -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-red-500 transform -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-1/2 w-2 h-2 rounded-full bg-blue-500 transform -translate-x-1/2 translate-y-1/2"></div>
                        <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-yellow-500 transform -translate-y-1/2 translate-x-3"></div>
                        <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-yellow-500 transform -translate-y-1/2 -translate-x-3"></div>
                        
                        {/* Linhas de medida */}
                        <div className="absolute top-0 left-1/2 h-full w-0 border-l border-dashed border-gray-400 transform -translate-x-1/2"></div>
                        <div className="absolute top-1/2 left-0 h-0 w-full border-t border-dashed border-gray-400 transform -translate-y-1/2"></div>
                      </div>
                      <p className="text-xs mt-2">Acordo Craniométrico de Frankfurt</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botão para salvar */}
              {onSaveMeasurement && (
                <div className="flex justify-center mt-6">
                  <Button 
                    onClick={handleSave}
                    className="bg-turquesa hover:bg-turquesa/90"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Salvar Avaliação
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
