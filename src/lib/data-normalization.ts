
// Data normalization utilities
// These functions help normalize data structure variations in our application

// Normalize paciente data
export function normalizePaciente(paciente: any) {
  return {
    id: paciente.id,
    nome: paciente.nome,
    dataNascimento: paciente.data_nascimento || paciente.dataNascimento || '',
    sexo: paciente.sexo || 'M',
    responsaveis: paciente.responsaveis || [],
    createdAt: paciente.created_at || paciente.createdAt || new Date().toISOString(),
    updatedAt: paciente.updated_at || paciente.updatedAt || new Date().toISOString()
  };
}

// Normalize medicao data
export function normalizeMedicao(medicao: any) {
  return {
    id: medicao.id,
    pacienteId: medicao.paciente_id || medicao.pacienteId,
    userId: medicao.user_id || medicao.userId,
    data: medicao.data,
    perimetroCefalico: medicao.perimetro_cefalico || medicao.perimetroCefalico || 0,
    comprimento: medicao.comprimento || 0,
    largura: medicao.largura || 0,
    diagonalD: medicao.diagonal_d || medicao.diagonalD || 0,
    diagonalE: medicao.diagonal_e || medicao.diagonalE || 0,
    diferencaDiagonais: medicao.diferenca_diagonais || medicao.diferencaDiagonais || 0,
    indiceCraniano: medicao.indice_craniano || medicao.indiceCraniano || 0,
    cvai: medicao.cvai || 0,
    status: medicao.status || 'normal',
    observacoes: medicao.observacoes || medicao.observações || '',
    recomendacoes: medicao.recomendacoes || medicao.recomendações || [],
    createdAt: medicao.created_at || medicao.createdAt || new Date().toISOString(),
    updatedAt: medicao.updated_at || medicao.updatedAt || new Date().toISOString()
  };
}

// Normalize task data
export function normalizeTask(task: any) {
  return {
    id: task.id,
    titulo: task.titulo || task.title || '',
    descricao: task.descricao || task.description || '',
    pacienteId: task.paciente_id || task.pacienteId || '',
    userId: task.user_id || task.userId || '',
    status: task.status || 'pendente',
    dueDate: task.due_date || task.dueDate || '',
    createdAt: task.created_at || task.createdAt || new Date().toISOString(),
    updatedAt: task.updated_at || task.updatedAt || new Date().toISOString()
  };
}

// Normalize notification data
export function normalizeNotification(notification: any) {
  return {
    id: notification.id,
    userId: notification.user_id || notification.userId || '',
    title: notification.title || '',
    message: notification.message || '',
    read: notification.read || false,
    createdAt: notification.created_at || notification.createdAt || new Date().toISOString()
  };
}

// Helper to ensure consistent data structure for empty values
export function ensureDataStructure(data: any, defaultStructure: any) {
  if (!data) return defaultStructure;
  
  const result = {...defaultStructure};
  
  for (const key in defaultStructure) {
    if (data[key] !== undefined) {
      result[key] = data[key];
    }
  }
  
  return result;
}
