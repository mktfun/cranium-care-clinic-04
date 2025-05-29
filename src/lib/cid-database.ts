
// Base de dados local de códigos CID relevantes para pediatria e deformidades cranianas
export interface CIDCode {
  codigo: string;
  descricao: string;
  categoria: string;
}

export const cidDatabase: CIDCode[] = [
  // Deformidades cranianas e faciais
  { codigo: "Q67.0", descricao: "Assimetria facial", categoria: "Deformidades congênitas" },
  { codigo: "Q67.1", descricao: "Deformidade da cabeça não especificada", categoria: "Deformidades congênitas" },
  { codigo: "Q67.2", descricao: "Dolicocefalia", categoria: "Deformidades congênitas" },
  { codigo: "Q67.3", descricao: "Plagiocefalia", categoria: "Deformidades congênitas" },
  { codigo: "Q67.4", descricao: "Outras deformidades congênitas da mandíbula e dos ossos da face", categoria: "Deformidades congênitas" },
  { codigo: "Q67.8", descricao: "Outras deformidades congênitas da cabeça e da face", categoria: "Deformidades congênitas" },
  { codigo: "Q75.0", descricao: "Craniossinostose", categoria: "Deformidades congênitas" },
  { codigo: "Q75.1", descricao: "Síndrome de Crouzon", categoria: "Deformidades congênitas" },
  { codigo: "Q75.2", descricao: "Hipertelorismo", categoria: "Deformidades congênitas" },
  { codigo: "Q75.3", descricao: "Macrocefalia", categoria: "Deformidades congênitas" },
  { codigo: "Q75.4", descricao: "Disostose mandibulofacial", categoria: "Deformidades congênitas" },
  { codigo: "Q75.8", descricao: "Outras malformações congênitas dos ossos do crânio e da face", categoria: "Deformidades congênitas" },
  
  // Deformidades posicionais
  { codigo: "M43.8", descricao: "Outras deformidades da coluna vertebral e das costas especificadas", categoria: "Deformidades posicionais" },
  { codigo: "Q66.0", descricao: "Pé torto equinovaro congênito", categoria: "Deformidades posicionais" },
  { codigo: "Q66.1", descricao: "Pé torto calcaneovalgo congênito", categoria: "Deformidades posicionais" },
  { codigo: "Q68.0", descricao: "Torcicolo congênito", categoria: "Deformidades posicionais" },
  { codigo: "Q68.1", descricao: "Deformidade congênita da mão", categoria: "Deformidades posicionais" },
  
  // Condições neurológicas pediátricas
  { codigo: "G80.0", descricao: "Paralisia cerebral espástica quadriplégica", categoria: "Neurológicas" },
  { codigo: "G80.1", descricao: "Paralisia cerebral espástica diplégica", categoria: "Neurológicas" },
  { codigo: "G80.2", descricao: "Paralisia cerebral espástica hemiplégica", categoria: "Neurológicas" },
  { codigo: "G80.3", descricao: "Paralisia cerebral discinética", categoria: "Neurológicas" },
  { codigo: "G80.4", descricao: "Paralisia cerebral atáxica", categoria: "Neurológicas" },
  { codigo: "G80.8", descricao: "Outras formas de paralisia cerebral", categoria: "Neurológicas" },
  { codigo: "G80.9", descricao: "Paralisia cerebral não especificada", categoria: "Neurológicas" },
  
  // Atrasos do desenvolvimento
  { codigo: "F80.0", descricao: "Transtorno específico da articulação da fala", categoria: "Desenvolvimento" },
  { codigo: "F80.1", descricao: "Transtorno da linguagem expressiva", categoria: "Desenvolvimento" },
  { codigo: "F80.2", descricao: "Transtorno da linguagem receptiva", categoria: "Desenvolvimento" },
  { codigo: "F82", descricao: "Transtorno específico do desenvolvimento motor", categoria: "Desenvolvimento" },
  { codigo: "F84.0", descricao: "Autismo infantil", categoria: "Desenvolvimento" },
  { codigo: "F88", descricao: "Outros transtornos do desenvolvimento psicológico", categoria: "Desenvolvimento" },
  { codigo: "F89", descricao: "Transtorno do desenvolvimento psicológico não especificado", categoria: "Desenvolvimento" },
  
  // Condições pediátricas gerais
  { codigo: "P96.8", descricao: "Outras afecções especificadas originadas no período perinatal", categoria: "Perinatal" },
  { codigo: "R62.0", descricao: "Retardo do desenvolvimento fisiológico normal", categoria: "Sintomas gerais" },
  { codigo: "R62.8", descricao: "Outros retardos do desenvolvimento esperado", categoria: "Sintomas gerais" },
  { codigo: "Z00.1", descricao: "Exame de rotina da criança", categoria: "Fatores de saúde" },
  { codigo: "Z03.3", descricao: "Observação por suspeita de transtorno do sistema nervoso", categoria: "Fatores de saúde" }
];

export function searchCID(query: string): CIDCode[] {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return cidDatabase.filter(item => {
    const codigoMatch = item.codigo.toLowerCase().includes(normalizedQuery);
    const descricaoMatch = item.descricao.toLowerCase().includes(normalizedQuery);
    const categoriaMatch = item.categoria.toLowerCase().includes(normalizedQuery);
    
    return codigoMatch || descricaoMatch || categoriaMatch;
  }).slice(0, 8); // Limitar a 8 resultados para performance
}
