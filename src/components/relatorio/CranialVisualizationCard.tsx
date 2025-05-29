
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { AsymmetryType, SeverityLevel } from "@/types";
import { type CranialDiagnosis, type IndividualClassification } from "@/lib/cranial-classification-utils";
import CranialVisualization from "@/components/medicoes/visualizacao/CranialVisualization";

interface CranialVisualizationCardProps {
  medicao: any;
  medicoes: any[];
  asymmetryType: AsymmetryType;
  severity: SeverityLevel;
  sexoPaciente?: 'M' | 'F';
  diagnosis?: CranialDiagnosis;
  individualClassifications?: IndividualClassification;
  dataNascimento?: string;
}

// Função para obter a classe de cor baseada na severidade
const getSeverityColorClass = (severity: string) => {
  switch(severity) {
    case "normal": return "text-green-700 bg-green-50 border-green-200";
    case "leve": return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "moderada": return "text-orange-700 bg-orange-50 border-orange-200";
    case "severa": return "text-red-700 bg-red-50 border-red-200";
    default: return "text-gray-700 bg-gray-50 border-gray-200";
  }
};

// Função para obter o ícone baseado na severidade
const getSeverityIcon = (severity: string) => {
  switch(severity) {
    case "normal": return "✓";
    case "leve": return "⚠";
    case "moderada": return "⚠";
    case "severa": return "🚨";
    default: return "•";
  }
};

// Função para formatar a classificação para exibição
const formatClassificationText = (classification: string, severity: string) => {
  if (severity === "normal") return "Normal";
  const severityMap = {
    "leve": "Leve",
    "moderada": "Moderada", 
    "severa": "Grave"
  };
  return `${classification} ${severityMap[severity] || severity}`;
};

export default function CranialVisualizationCard({
  medicao,
  medicoes,
  asymmetryType,
  severity,
  sexoPaciente,
  diagnosis,
  individualClassifications,
  dataNascimento
}: CranialVisualizationCardProps) {
  const [activeTab, setActiveTab] = useState("resumo");

  // Calcular índices da medição atual
  const indiceCraniano = medicao.indice_craniano;
  const cvai = medicao.cvai;
  const diferencaDiagonais = medicao.diferenca_diagonais;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliação Craniana</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resumo">Parâmetros Cranianos</TabsTrigger>
            <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-6">
            {/* Seção consolidada única de Parâmetros Cranianos */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold mb-4">Parâmetros Cranianos</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Medições realizadas em {new Date(medicao.data).toLocaleDateString('pt-BR')}
              </p>
              
              {/* Medidas Brutas */}
              <div className="space-y-3">
                <h5 className="text-base font-medium text-slate-700">Medidas Brutas</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Comprimento</p>
                    <p className="text-sm font-medium">{medicao.comprimento} mm</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Largura</p>
                    <p className="text-sm font-medium">{medicao.largura} mm</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Diagonal D</p>
                    <p className="text-sm font-medium">{medicao.diagonal_d} mm</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Diagonal E</p>
                    <p className="text-sm font-medium">{medicao.diagonal_e} mm</p>
                  </div>
                  {medicao.perimetro_cefalico && (
                    <div className="p-3 bg-slate-50 rounded-lg border">
                      <p className="text-xs text-muted-foreground">Perímetro Cefálico</p>
                      <p className="text-sm font-medium">{medicao.perimetro_cefalico} mm</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Separador visual */}
              <div className="border-t border-slate-200 my-6"></div>

              {/* Índices e Classificações */}
              <div className="space-y-4">
                <h5 className="text-base font-medium text-slate-700">Índices e Classificações</h5>
                
                {/* Índice Craniano */}
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h6 className="text-sm font-semibold text-slate-800 mb-1">Índice Craniano (IC)</h6>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColorClass(individualClassifications?.braquicefalia || 'normal')}`}>
                          <span className="mr-1">{getSeverityIcon(individualClassifications?.braquicefalia || 'normal')}</span>
                          {individualClassifications?.braquicefalia !== 'normal' && indiceCraniano < 75 ? 
                            formatClassificationText('Dolicocefalia', individualClassifications?.dolicocefalia || 'normal') :
                            formatClassificationText('Braquicefalia', individualClassifications?.braquicefalia || 'normal')
                          }
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Valor: {indiceCraniano.toFixed(1)}% (Normal: 75-85%)
                      </p>
                    </div>
                  </div>
                </div>

                {/* CVAI */}
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h6 className="text-sm font-semibold text-slate-800 mb-1">CVAI</h6>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColorClass(individualClassifications?.plagiocefalia || 'normal')}`}>
                          <span className="mr-1">{getSeverityIcon(individualClassifications?.plagiocefalia || 'normal')}</span>
                          {formatClassificationText('Plagiocefalia', individualClassifications?.plagiocefalia || 'normal')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Valor: {cvai.toFixed(1)}% (Normal: &lt; 3.5%)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Diferença de Diagonais */}
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h6 className="text-sm font-semibold text-slate-800 mb-1">Diferença de Diagonais</h6>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColorClass(individualClassifications?.plagiocefalia || 'normal')}`}>
                          <span className="mr-1">{getSeverityIcon(individualClassifications?.plagiocefalia || 'normal')}</span>
                          {formatClassificationText('Plagiocefalia', individualClassifications?.plagiocefalia || 'normal')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Valor: {diferencaDiagonais.toFixed(1)} mm (Normal: 0-3 mm)
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        |Diagonal D - Diagonal E|
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Geral */}
              <div className="p-4 border rounded-lg bg-slate-50 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Diagnóstico Geral</p>
                    <p className="text-lg font-medium mt-1">
                      {diagnosis?.diagnosis || 'Normal'}
                    </p>
                  </div>
                  <StatusBadge 
                    status={severity} 
                    asymmetryType={asymmetryType}
                    diagnosis={diagnosis}
                    showAsymmetryType={true}
                    variant="enhanced"
                  />
                </div>
              </div>

              {/* Referência das Fórmulas */}
              <div className="mt-6 pt-4 border-t">
                <h6 className="text-sm font-medium text-muted-foreground mb-2">Fórmulas de Cálculo</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Índice Craniano:</span> (Largura ÷ Comprimento) × 100
                  </div>
                  <div>
                    <span className="font-medium">CVAI:</span> (|Diagonal D - Diagonal E| ÷ Diagonal Maior) × 100
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="evolucao" className="space-y-4">
            <CranialVisualization
              currentMeasurement={{
                comprimento: medicao.comprimento,
                largura: medicao.largura,
                diagonalD: medicao.diagonal_d,
                diagonalE: medicao.diagonal_e,
                perimetroCefalico: medicao.perimetro_cefalico,
                data: medicao.data
              }}
              measurementHistory={medicoes}
              asymmetryType={asymmetryType}
              severity={severity}
              sexoPaciente={sexoPaciente}
              diagnosis={diagnosis}
              individualClassifications={individualClassifications}
              dataNascimento={dataNascimento}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
