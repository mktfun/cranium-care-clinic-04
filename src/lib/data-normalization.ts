
// Utility function to normalize measurement data for consistency across the application
export function normalizeMedicao(medicao: any) {
  if (!medicao) return null;
  
  return {
    id: medicao.id,
    data: medicao.data,
    comprimento: medicao.comprimento,
    largura: medicao.largura,
    diagonalD: medicao.diagonal_d || medicao.diagonalD,
    diagonalE: medicao.diagonal_e || medicao.diagonalE,
    diferencaDiagonais: medicao.diferenca_diagonais || medicao.diferencaDiagonais,
    indiceCraniano: medicao.indice_craniano || medicao.indiceCraniano,
    cvai: medicao.cvai,
    perimetroCefalico: medicao.perimetro_cefalico || medicao.perimetroCefalico,
    recomendacoes: medicao.recomendacoes || [],
    observacoes: medicao.observacoes
  };
}

// Utility function to normalize patient data for consistency across the application
export function normalizePaciente(paciente: any) {
  if (!paciente) return null;
  
  return {
    id: paciente.id,
    nome: paciente.nome,
    dataNascimento: paciente.data_nascimento || paciente.dataNascimento,
    sexo: paciente.sexo || 'M',
    responsaveis: Array.isArray(paciente.responsaveis) ? paciente.responsaveis : []
  };
}
