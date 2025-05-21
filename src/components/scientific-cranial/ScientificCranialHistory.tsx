
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from "recharts";
import { formatAge } from "@/lib/age-utils";
import { 
  CEPHALIC_INDEX_THRESHOLDS,
  getColorForCephalicType
} from "@/lib/scientific-cranial-utils";

interface ScientificCranialHistoryProps {
  medicoes: Array<{
    id: string;
    data: string;
    comprimento: number;
    largura: number;
    perimetro_cefalico?: number;
    indice_craniano: number;
    tipo_cefalico?: string;
  }>;
  dataNascimento: string;
  sexo?: 'M' | 'F';
}

export default function ScientificCranialHistory({
  medicoes,
  dataNascimento,
  sexo = 'M'
}: ScientificCranialHistoryProps) {
  // Ordenar medições por data
  const medicoesOrdenadas = [...medicoes].sort((a, b) => 
    new Date(a.data).getTime() - new Date(b.data).getTime()
  );
  
  // Preparar dados para o gráfico
  const dadosGrafico = medicoesOrdenadas.map(medicao => {
    const dataFormatada = new Date(medicao.data).toLocaleDateString('pt-BR');
    const idade = formatAge(dataNascimento, medicao.data);
    const idadeMeses = calcularIdadeEmMeses(dataNascimento, medicao.data);
    
    return {
      data: dataFormatada,
      idade,
      idadeMeses,
      indiceCraniano: medicao.indice_craniano,
      perimetroCefalico: medicao.perimetro_cefalico,
      tipo: medicao.tipo_cefalico || getTipoCefalico(medicao.indice_craniano)
    };
  });
  
  // Função para calcular idade em meses
  function calcularIdadeEmMeses(dataNascimento: string, dataAvaliacao: string): number {
    const nasc = new Date(dataNascimento);
    const aval = new Date(dataAvaliacao);
    return (aval.getFullYear() - nasc.getFullYear()) * 12 + 
           (aval.getMonth() - nasc.getMonth());
  }
  
  // Função para determinar o tipo cefálico baseado no índice
  function getTipoCefalico(indiceCraniano: number): string {
    if (indiceCraniano < CEPHALIC_INDEX_THRESHOLDS.HYPERDOLICHO_UPPER) {
      return "Hiperdolicocefalia";
    } else if (indiceCraniano < CEPHALIC_INDEX_THRESHOLDS.DOLICHO_UPPER) {
      return "Dolicocefalia";
    } else if (indiceCraniano < CEPHALIC_INDEX_THRESHOLDS.MESO_UPPER) {
      return "Mesocefalia";
    } else if (indiceCraniano < CEPHALIC_INDEX_THRESHOLDS.BRACHY_UPPER) {
      return "Braquicefalia";
    } else {
      return "Hiperbraquicefalia";
    }
  }

  // Função para formatar o tooltip do gráfico
  const formatTooltip = (value: number, name: string) => {
    if (name === "indiceCraniano") return `${value.toFixed(1)}%`;
    if (name === "perimetroCefalico") return `${value} mm`;
    return value;
  };
  
  if (medicoes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Nenhuma medição craniana registrada.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Gráfico de evolução do Índice Cefálico */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Índice Cefálico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dadosGrafico}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="idade" 
                  label={{ value: 'Idade', position: 'insideBottomRight', offset: -10 }} 
                />
                <YAxis 
                  domain={[65, 95]} 
                  label={{ value: 'Índice Cefálico (%)', angle: -90, position: 'insideLeft' }} 
                />
                <Tooltip formatter={formatTooltip} />
                <Legend />
                
                {/* Linhas de referência para os limites de classificação */}
                <ReferenceLine y={CEPHALIC_INDEX_THRESHOLDS.HYPERDOLICHO_UPPER} stroke="#D3E4FD" strokeWidth={2} />
                <ReferenceLine y={CEPHALIC_INDEX_THRESHOLDS.DOLICHO_UPPER} stroke="#FEC6A1" strokeWidth={2} />
                <ReferenceLine y={CEPHALIC_INDEX_THRESHOLDS.MESO_UPPER} stroke="#FEF7CD" strokeWidth={2} />
                <ReferenceLine y={CEPHALIC_INDEX_THRESHOLDS.BRACHY_UPPER} stroke="#FFDEE2" strokeWidth={2} />
                
                <Line 
                  type="monotone" 
                  dataKey="indiceCraniano" 
                  stroke="#9b87f5" 
                  strokeWidth={3}
                  name="Índice Cefálico" 
                  dot={{ r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legenda das classificações */}
          <div className="grid grid-cols-5 gap-1 mt-4 text-xs">
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
        </CardContent>
      </Card>
      
      {/* Gráfico de evolução do Perímetro Cefálico */}
      {dadosGrafico.some(d => d.perimetroCefalico) && (
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Perímetro Cefálico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dadosGrafico}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="idade" 
                    label={{ value: 'Idade', position: 'insideBottomRight', offset: -10 }} 
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    label={{ value: 'Perímetro Cefálico (mm)', angle: -90, position: 'insideLeft' }} 
                  />
                  <Tooltip formatter={formatTooltip} />
                  <Legend />
                  
                  <Line 
                    type="monotone" 
                    dataKey="perimetroCefalico" 
                    stroke="#ea384c" 
                    strokeWidth={3}
                    name="Perímetro Cefálico" 
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Tabela com histórico detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Medições Cranianas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Perímetro Cefálico</TableHead>
                  <TableHead>Índice Cefálico</TableHead>
                  <TableHead>Classificação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicoesOrdenadas.map((medicao) => {
                  const dataFormatada = new Date(medicao.data).toLocaleDateString('pt-BR');
                  const idade = formatAge(dataNascimento, medicao.data);
                  const tipoCefalico = medicao.tipo_cefalico || getTipoCefalico(medicao.indice_craniano);
                  const corFundo = getColorForCephalicType(tipoCefalico as any);
                  
                  return (
                    <TableRow key={medicao.id}>
                      <TableCell>{dataFormatada}</TableCell>
                      <TableCell>{idade}</TableCell>
                      <TableCell>
                        {medicao.perimetro_cefalico ? `${medicao.perimetro_cefalico} mm` : '-'}
                      </TableCell>
                      <TableCell>{medicao.indice_craniano.toFixed(1)}%</TableCell>
                      <TableCell>
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium" 
                          style={{ backgroundColor: corFundo }}
                        >
                          {tipoCefalico}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
