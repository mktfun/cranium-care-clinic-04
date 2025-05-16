
import { StatusBadge } from "@/components/StatusBadge";
import { formatAge } from "@/lib/age-utils";
import { getCranialStatus } from "@/lib/cranial-utils";
import { ArrowUpDown, Calendar, ChevronDown, CircleOff } from "lucide-react";
import { useState } from "react";

interface Medicao {
  id: string;
  data: string;
  comprimento: number;
  largura: number;
  diagonal_d: number;
  diagonal_e: number;
  diferenca_diagonais: number;
  cvai: number;
  indice_craniano: number;
  perimetro_cefalico?: number;
  recomendacoes?: string[];
}

interface MedicoesHistoricoTableProps {
  medicoes: Medicao[];
  dataNascimento: string;
  className?: string;
}

export function MedicoesHistoricoTable({ 
  medicoes,
  dataNascimento,
  className = ""
}: MedicoesHistoricoTableProps) {
  // Estados para ordenação e exibição de dados
  const [sortField, setSortField] = useState<keyof Medicao>('data');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // Função para alternar ordenação
  const toggleSort = (field: keyof Medicao) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Função para formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  // Ordenar medicoes
  const medicoesOrdenadas = [...medicoes].sort((a, b) => {
    let valorA: string | number = a[sortField] as string | number;
    let valorB: string | number = b[sortField] as string | number;
    
    if (sortField === 'data') {
      valorA = new Date(a.data).getTime();
      valorB = new Date(b.data).getTime();
    }
    
    if (valorA < valorB) return sortDirection === 'asc' ? -1 : 1;
    if (valorA > valorB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Expandir/colapsar linha
  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };
  
  // Renderizar ícone de ordenação
  const renderSortIcon = (field: keyof Medicao) => {
    if (field !== sortField) return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
    return <ArrowUpDown size={14} className="ml-1 text-primary" />;
  };
  
  // Obter estilo de célula com base em valores
  const getCellStyle = (field: string, value: number) => {
    if (field === 'cvai') {
      if (value > 8.75) return 'text-red-600 dark:text-red-400 font-semibold';
      if (value > 6.25) return 'text-orange-600 dark:text-orange-400 font-medium';
      if (value > 3.5) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-green-600 dark:text-green-400';
    }
    
    if (field === 'indice_craniano') {
      if (value > 90) return 'text-red-600 dark:text-red-400 font-semibold';
      if (value > 81) return 'text-orange-600 dark:text-orange-400 font-medium';
      if (value < 76) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-green-600 dark:text-green-400';
    }
    
    if (field === 'diferenca_diagonais') {
      if (value > 12) return 'text-red-600 dark:text-red-400 font-semibold';
      if (value > 10) return 'text-orange-600 dark:text-orange-400 font-medium';
      if (value > 3) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-green-600 dark:text-green-400';
    }
    
    return '';
  };
  
  return (
    <div className={`overflow-x-auto rounded-md border shadow-sm bg-card ${className}`}>
      {medicoes.length > 0 ? (
        <table className="min-w-full border-collapse enhanced-table">
          <thead>
            <tr className="bg-primary/5 dark:bg-primary/10 text-primary">
              <th className="p-2 text-left text-xs font-medium cursor-pointer" onClick={() => toggleSort('data')}>
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1" /> Data {renderSortIcon('data')}
                </div>
              </th>
              <th className="p-2 text-left text-xs font-medium">Idade</th>
              <th className="p-2 text-left text-xs font-medium cursor-pointer" onClick={() => toggleSort('comprimento')}>
                <div className="flex items-center">Comp. {renderSortIcon('comprimento')}</div>
              </th>
              <th className="p-2 text-left text-xs font-medium cursor-pointer" onClick={() => toggleSort('largura')}>
                <div className="flex items-center">Larg. {renderSortIcon('largura')}</div>
              </th>
              <th className="p-2 text-left text-xs font-medium">Diag. D</th>
              <th className="p-2 text-left text-xs font-medium">Diag. E</th>
              <th className="p-2 text-left text-xs font-medium cursor-pointer" onClick={() => toggleSort('diferenca_diagonais')}>
                <div className="flex items-center">Dif. {renderSortIcon('diferenca_diagonais')}</div>
              </th>
              <th className="p-2 text-left text-xs font-medium cursor-pointer" onClick={() => toggleSort('cvai')}>
                <div className="flex items-center">CVAI {renderSortIcon('cvai')}</div>
              </th>
              <th className="p-2 text-left text-xs font-medium cursor-pointer" onClick={() => toggleSort('indice_craniano')}>
                <div className="flex items-center">IC {renderSortIcon('indice_craniano')}</div>
              </th>
              <th className="p-2 text-left text-xs font-medium">PC</th>
              <th className="p-2 text-left text-xs font-medium">Status</th>
              <th className="p-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {medicoesOrdenadas.map((med, index) => {
              const { asymmetryType, severityLevel } = getCranialStatus(
                med.indice_craniano,
                med.cvai
              );
              
              return (
                <>
                  <tr 
                    key={med.id} 
                    className={`group ${
                      index % 2 === 0 
                        ? "bg-background" 
                        : "bg-muted/30"
                    } hover:bg-primary/5 transition-colors cursor-pointer`}
                    onClick={() => toggleRow(med.id)}
                  >
                    <td className="p-2 text-xs font-medium">{formatarData(med.data)}</td>
                    <td className="p-2 text-xs">{formatAge(dataNascimento, med.data)}</td>
                    <td className="p-2 text-xs">{med.comprimento}</td>
                    <td className="p-2 text-xs">{med.largura}</td>
                    <td className="p-2 text-xs">{med.diagonal_d}</td>
                    <td className="p-2 text-xs">{med.diagonal_e}</td>
                    <td className={`p-2 text-xs ${getCellStyle('diferenca_diagonais', med.diferenca_diagonais)}`}>
                      {med.diferenca_diagonais}
                    </td>
                    <td className={`p-2 text-xs ${getCellStyle('cvai', med.cvai)}`}>
                      {med.cvai}%
                    </td>
                    <td className={`p-2 text-xs ${getCellStyle('indice_craniano', med.indice_craniano)}`}>
                      {med.indice_craniano}%
                    </td>
                    <td className="p-2 text-xs">{med.perimetro_cefalico || "-"}</td>
                    <td className="p-2">
                      <StatusBadge 
                        status={severityLevel} 
                        asymmetryType={asymmetryType} 
                        showAsymmetryType={true}
                        variant="enhanced"
                        className="text-xs"
                      />
                    </td>
                    <td className="p-2 relative w-10">
                      <ChevronDown 
                        size={16} 
                        className={`mx-auto transition-transform ${expandedRow === med.id ? 'rotate-180' : ''}`} 
                      />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-primary/5 to-transparent transition-opacity"></div>
                    </td>
                  </tr>
                  {expandedRow === med.id && (
                    <tr className="animate-fade-in">
                      <td colSpan={12} className="p-0">
                        <div className="p-4 bg-muted/20 border-t border-b">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Detalhes da Medição</h4>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="font-medium">Índice Craniano:</div>
                                <div>{med.indice_craniano}%</div>
                                
                                <div className="font-medium">CVAI (Plagiocefalia):</div>
                                <div>{med.cvai}%</div>
                                
                                <div className="font-medium">Diferença Diagonais:</div>
                                <div>{med.diferenca_diagonais} mm</div>
                                
                                <div className="font-medium">Tipo de Assimetria:</div>
                                <div>{asymmetryType}</div>
                                
                                <div className="font-medium">Severidade:</div>
                                <div>{severityLevel.charAt(0).toUpperCase() + severityLevel.slice(1)}</div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-2">Recomendações</h4>
                              {med.recomendacoes && med.recomendacoes.length > 0 ? (
                                <ul className="text-xs space-y-1 list-disc list-inside">
                                  {med.recomendacoes.map((rec, idx) => (
                                    <li key={idx}>{rec}</li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <CircleOff size={14} className="mr-1" />
                                  Nenhuma recomendação registrada
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
          <CircleOff size={24} className="mb-2 opacity-50" />
          <p>Não há medições disponíveis</p>
        </div>
      )}
    </div>
  );
}
