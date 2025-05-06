
export type Status = "normal" | "leve" | "moderada" | "severa";

export interface Medicao {
  id: string;
  data: string;
  comprimento: number; // mm
  largura: number; // mm
  diagonalD: number; // mm
  diagonalE: number; // mm
  diferencaDiagonais: number; // mm
  indiceCraniano: number; // %
  cvai: number; // %
  status: Status;
  observacoes?: string;
  recomendacoes?: string[];
}

export interface Paciente {
  id: string;
  nome: string;
  dataNascimento: string;
  idadeEmMeses: number;
  sexo: "M" | "F";
  responsaveis: {
    nome: string;
    telefone: string;
    email: string;
  }[];
  medicoes: Medicao[];
}

export const pacientes: Paciente[] = [
  {
    id: "1",
    nome: "Lucas Silva",
    dataNascimento: "2023-10-15",
    idadeEmMeses: 7,
    sexo: "M",
    responsaveis: [
      {
        nome: "Maria Silva",
        telefone: "(11) 98765-4321",
        email: "maria.silva@email.com",
      },
      {
        nome: "João Silva",
        telefone: "(11) 98765-4322",
        email: "joao.silva@email.com",
      },
    ],
    medicoes: [
      {
        id: "m1",
        data: "2024-03-10",
        comprimento: 145,
        largura: 112,
        diagonalD: 158,
        diagonalE: 152,
        diferencaDiagonais: 6,
        indiceCraniano: 77.2,
        cvai: 3.8,
        status: "leve",
        recomendacoes: [
          "Aumentar o tempo de barriguinha para baixo (tummy time)",
          "Alternar posição da cabeça durante o sono",
          "Retornar em 1 mês para nova avaliação"
        ]
      },
      {
        id: "m2",
        data: "2024-04-12",
        comprimento: 148,
        largura: 113,
        diagonalD: 159,
        diagonalE: 155,
        diferencaDiagonais: 4,
        indiceCraniano: 76.4,
        cvai: 2.5,
        status: "leve",
        recomendacoes: [
          "Continuar com as recomendações anteriores",
          "Retornar em 1 mês para nova avaliação"
        ]
      },
    ],
  },
  {
    id: "2",
    nome: "Sofia Oliveira",
    dataNascimento: "2023-08-22",
    idadeEmMeses: 9,
    sexo: "F",
    responsaveis: [
      {
        nome: "Ana Oliveira",
        telefone: "(11) 97654-3210",
        email: "ana.oliveira@email.com",
      },
    ],
    medicoes: [
      {
        id: "m3",
        data: "2024-01-05",
        comprimento: 142,
        largura: 118,
        diagonalD: 160,
        diagonalE: 146,
        diferencaDiagonais: 14,
        indiceCraniano: 83.1,
        cvai: 8.8,
        status: "moderada",
        recomendacoes: [
          "Indicação para avaliação com fisioterapeuta especializado",
          "Considerar uso de órtese craniana",
          "Retornar em 2 semanas"
        ]
      },
      {
        id: "m4",
        data: "2024-01-19",
        comprimento: 144,
        largura: 118,
        diagonalD: 161,
        diagonalE: 150,
        diferencaDiagonais: 11,
        indiceCraniano: 82,
        cvai: 6.8,
        status: "moderada",
        recomendacoes: [
          "Iniciar uso de órtese craniana",
          "Manter fisioterapia 2x por semana",
          "Retornar em 1 mês"
        ]
      },
      {
        id: "m5",
        data: "2024-02-20",
        comprimento: 147,
        largura: 119,
        diagonalD: 163,
        diagonalE: 155,
        diferencaDiagonais: 8,
        indiceCraniano: 81,
        cvai: 4.9,
        status: "leve",
        recomendacoes: [
          "Manter uso de órtese craniana por 23h/dia",
          "Continuar com fisioterapia semanal",
          "Retornar em 1 mês"
        ]
      },
      {
        id: "m6",
        data: "2024-03-22",
        comprimento: 150,
        largura: 120,
        diagonalD: 165,
        diagonalE: 160,
        diferencaDiagonais: 5,
        indiceCraniano: 80,
        cvai: 3,
        status: "leve",
        recomendacoes: [
          "Manter uso de órtese craniana por 23h/dia",
          "Continuar com fisioterapia semanal",
          "Retornar em 1 mês"
        ]
      },
      {
        id: "m7",
        data: "2024-04-25",
        comprimento: 152,
        largura: 121,
        diagonalD: 166,
        diagonalE: 163,
        diferencaDiagonais: 3,
        indiceCraniano: 79.6,
        cvai: 1.8,
        status: "normal",
        recomendacoes: [
          "Reduzir uso de órtese craniana para 18h/dia",
          "Manter fisioterapia a cada 15 dias",
          "Retornar em 1 mês"
        ]
      },
    ],
  },
  {
    id: "3",
    nome: "Miguel Santos",
    dataNascimento: "2023-06-10",
    idadeEmMeses: 11,
    sexo: "M",
    responsaveis: [
      {
        nome: "Carla Santos",
        telefone: "(11) 96543-2109",
        email: "carla.santos@email.com",
      },
      {
        nome: "Roberto Santos",
        telefone: "(11) 96543-2110",
        email: "roberto.santos@email.com",
      },
    ],
    medicoes: [
      {
        id: "m8",
        data: "2023-12-15",
        comprimento: 150,
        largura: 132,
        diagonalD: 170,
        diagonalE: 155,
        diferencaDiagonais: 15,
        indiceCraniano: 88,
        cvai: 8.8,
        status: "moderada",
        observacoes: "Braquicefalia moderada com assimetria à direita",
        recomendacoes: [
          "Iniciar uso de órtese craniana",
          "Encaminhamento para fisioterapia especializada",
          "Retornar em 3 semanas"
        ]
      },
      {
        id: "m9",
        data: "2024-01-05",
        comprimento: 152,
        largura: 133,
        diagonalD: 171,
        diagonalE: 159,
        diferencaDiagonais: 12,
        indiceCraniano: 87.5,
        cvai: 7,
        status: "moderada",
        recomendacoes: [
          "Manter uso de órtese craniana 23h/dia",
          "Continuar fisioterapia 2x por semana",
          "Retornar em 1 mês"
        ]
      },
      {
        id: "m10",
        data: "2024-02-06",
        comprimento: 154,
        largura: 131,
        diagonalD: 172,
        diagonalE: 164,
        diferencaDiagonais: 8,
        indiceCraniano: 85.1,
        cvai: 4.7,
        status: "leve",
        recomendacoes: [
          "Manter uso de órtese craniana",
          "Continuar fisioterapia semanal",
          "Retornar em 1 mês"
        ]
      },
      {
        id: "m11",
        data: "2024-03-08",
        comprimento: 156,
        largura: 130,
        diagonalD: 173,
        diagonalE: 169,
        diferencaDiagonais: 4,
        indiceCraniano: 83.3,
        cvai: 2.3,
        status: "leve",
        recomendacoes: [
          "Reduzir uso de órtese craniana para 18h/dia",
          "Manter fisioterapia quinzenal",
          "Retornar em 1 mês"
        ]
      },
    ],
  },
  {
    id: "4",
    nome: "Laura Costa",
    dataNascimento: "2023-11-29",
    idadeEmMeses: 6,
    sexo: "F",
    responsaveis: [
      {
        nome: "Marcos Costa",
        telefone: "(11) 96543-8765",
        email: "marcos.costa@email.com",
      }
    ],
    medicoes: [
      {
        id: "m12",
        data: "2024-04-20",
        comprimento: 138,
        largura: 115,
        diagonalD: 150,
        diagonalE: 149,
        diferencaDiagonais: 1,
        indiceCraniano: 83.3,
        cvai: 0.7,
        status: "normal",
        recomendacoes: [
          "Manter acompanhamento preventivo",
          "Alternar posições durante o sono",
          "Retornar em 2 meses para acompanhamento"
        ]
      }
    ]
  },
  {
    id: "5",
    nome: "Pedro Alves",
    dataNascimento: "2023-07-15",
    idadeEmMeses: 10,
    sexo: "M",
    responsaveis: [
      {
        nome: "Juliana Alves",
        telefone: "(11) 98877-6655",
        email: "juliana.alves@email.com",
      }
    ],
    medicoes: [
      {
        id: "m13",
        data: "2024-01-10",
        comprimento: 148,
        largura: 125,
        diagonalD: 165,
        diagonalE: 148,
        diferencaDiagonais: 17,
        indiceCraniano: 84.5,
        cvai: 10.3,
        status: "severa",
        observacoes: "Plagiocefalia posicional severa à direita com componente de braquicefalia",
        recomendacoes: [
          "Indicação urgente para uso de órtese craniana",
          "Iniciar fisioterapia especializada 3x por semana",
          "Retornar em 2 semanas"
        ]
      },
      {
        id: "m14",
        data: "2024-01-24",
        comprimento: 149,
        largura: 125,
        diagonalD: 166,
        diagonalE: 150,
        diferencaDiagonais: 16,
        indiceCraniano: 84,
        cvai: 9.6,
        status: "severa",
        recomendacoes: [
          "Verificar adaptação à órtese craniana",
          "Manter fisioterapia 3x por semana",
          "Retornar em 2 semanas"
        ]
      },
      {
        id: "m15",
        data: "2024-02-07",
        comprimento: 150,
        largura: 125,
        diagonalD: 167,
        diagonalE: 154,
        diferencaDiagonais: 13,
        indiceCraniano: 83.3,
        cvai: 7.8,
        status: "moderada",
        recomendacoes: [
          "Manter uso de órtese craniana 23h/dia",
          "Continuar fisioterapia 3x por semana",
          "Retornar em 3 semanas"
        ]
      },
      {
        id: "m16",
        data: "2024-03-01",
        comprimento: 152,
        largura: 124,
        diagonalD: 168,
        diagonalE: 159,
        diferencaDiagonais: 9,
        indiceCraniano: 81.6,
        cvai: 5.4,
        status: "moderada",
        recomendacoes: [
          "Manter uso de órtese craniana 23h/dia",
          "Continuar fisioterapia 2x por semana",
          "Retornar em 4 semanas"
        ]
      },
      {
        id: "m17",
        data: "2024-03-30",
        comprimento: 153,
        largura: 123,
        diagonalD: 169,
        diagonalE: 163,
        diferencaDiagonais: 6,
        indiceCraniano: 80.4,
        cvai: 3.6,
        status: "leve",
        recomendacoes: [
          "Manter uso de órtese craniana 22h/dia",
          "Continuar fisioterapia semanal",
          "Retornar em 4 semanas"
        ]
      },
      {
        id: "m18",
        data: "2024-04-28",
        comprimento: 154,
        largura: 122,
        diagonalD: 170,
        diagonalE: 166,
        diferencaDiagonais: 4,
        indiceCraniano: 79.2,
        cvai: 2.4,
        status: "leve",
        recomendacoes: [
          "Reduzir uso de órtese craniana para 18h/dia",
          "Manter fisioterapia quinzenal",
          "Retornar em 4 semanas"
        ]
      }
    ]
  }
];

export const obterPacientes = () => {
  return pacientes;
};

export const obterPacientePorId = (id: string) => {
  return pacientes.find((paciente) => paciente.id === id);
};

export const obterUltimaMedicao = (pacienteId: string) => {
  const paciente = pacientes.find((p) => p.id === pacienteId);
  if (!paciente || !paciente.medicoes.length) return null;
  
  const medicoes = [...paciente.medicoes].sort((a, b) => 
    new Date(b.data).getTime() - new Date(a.data).getTime()
  );
  
  return medicoes[0];
};

export const obterStatusDistribuicao = () => {
  const statusContagem = { normal: 0, leve: 0, moderada: 0, severa: 0 };
  
  pacientes.forEach(paciente => {
    const ultimaMedicao = obterUltimaMedicao(paciente.id);
    if (ultimaMedicao) {
      statusContagem[ultimaMedicao.status]++;
    }
  });
  
  return statusContagem;
};

export const obterMedicoesRecentes = () => {
  const todasMedicoes = pacientes.flatMap(paciente => 
    paciente.medicoes.map(medicao => ({
      ...medicao,
      pacienteId: paciente.id,
      pacienteNome: paciente.nome
    }))
  );
  
  return todasMedicoes.sort((a, b) => 
    new Date(b.data).getTime() - new Date(a.data).getTime()
  ).slice(0, 10); // Retorna as 10 medições mais recentes
};

// Helper para calcular a idade em meses
export const calcularIdadeEmMeses = (dataNascimento: string) => {
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  
  let meses = (hoje.getFullYear() - nascimento.getFullYear()) * 12;
  meses -= nascimento.getMonth();
  meses += hoje.getMonth();
  
  // Ajuste para dia do mês
  if (hoje.getDate() < nascimento.getDate()) {
    meses--;
  }
  
  return meses;
};
