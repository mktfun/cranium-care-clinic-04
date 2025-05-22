
// Tipos para configurações
export interface PerfilSettings {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  avatar?: string;
}

export interface NotificacaoSettings {
  email: boolean;
  browser: boolean;
  novosLeads: boolean;
  agendamentos: boolean;
  ordensCompletas: boolean;
}

export interface HorarioFuncionamento {
  abrir: string;
  fechar: string;
  fechado: boolean;
}

export interface HorariosSemana {
  segunda: HorarioFuncionamento;
  terca: HorarioFuncionamento;
  quarta: HorarioFuncionamento;
  quinta: HorarioFuncionamento;
  sexta: HorarioFuncionamento;
  sabado: HorarioFuncionamento;
  domingo: HorarioFuncionamento;
}

export interface Unidade {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  horarios: HorariosSemana;
  principal: boolean;
  criadoEm: string;
  atualizadoEm?: string;
}

export interface TemaSettings {
  modo: "claro" | "escuro";
  corPrimaria: string;
  corSecundaria: string;
  borderRadius: "nenhum" | "pequeno" | "medio" | "grande";
}

export interface ExibicaoSettings {
  itensPorPagina: number;
  formatoData: "dd/MM/yyyy" | "MM/dd/yyyy" | "yyyy-MM-dd";
  formatoHora: "12h" | "24h";
}

export interface ServicoOfertado {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  tempoEstimado: number;
}

export interface CategoriaVeiculo {
  id: string;
  nome: string;
  descricao: string;
}

export interface TaxaImposto {
  id: string;
  nome: string;
  percentual: number;
  aplicavelA: string[];
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  avatar?: string;
  permissoes: string[];
  criadoEm: string;
  ultimoAcesso?: string;
}

export interface MecanicaSettings {
  perfil: {
    usuario: PerfilSettings;
    notificacoes: NotificacaoSettings;
  };
  unidades: Unidade[];
  aplicativo: {
    tema: TemaSettings;
    exibicao: ExibicaoSettings;
    privacidade: {
      salvarSessao: boolean;
      limparDadosAoSair: boolean;
    };
  };
  negocio: {
    servicos: ServicoOfertado[];
    categorias: CategoriaVeiculo[];
    taxas: TaxaImposto[];
    termos: string;
  };
  usuarios: Usuario[];
}

// Valores padrão
const defaultSettings: MecanicaSettings = {
  perfil: {
    usuario: {
      nome: "Usuário",
      email: "usuario@mecanicapro.com",
      telefone: "",
      cargo: "Administrador"
    },
    notificacoes: {
      email: true,
      browser: true,
      novosLeads: true,
      agendamentos: true,
      ordensCompletas: true
    }
  },
  unidades: [],
  aplicativo: {
    tema: {
      modo: "claro",
      corPrimaria: "#2563eb",
      corSecundaria: "#f59e0b",
      borderRadius: "medio"
    },
    exibicao: {
      itensPorPagina: 10,
      formatoData: "dd/MM/yyyy",
      formatoHora: "24h"
    },
    privacidade: {
      salvarSessao: true,
      limparDadosAoSair: false
    }
  },
  negocio: {
    servicos: [],
    categorias: [],
    taxas: [],
    termos: "Termos e condições padrão da oficina mecânica."
  },
  usuarios: []
};

// Chave para armazenamento no localStorage
const SETTINGS_KEY = 'mecanicapro_settings';

// Funções para interagir com o localStorage
export const settingsStorage = {
  getAll: (): MecanicaSettings => {
    try {
      const settings = localStorage.getItem(SETTINGS_KEY);
      return settings ? JSON.parse(settings) : defaultSettings;
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      return defaultSettings;
    }
  },
  
  update: (newSettings: Partial<MecanicaSettings>): void => {
    try {
      const currentSettings = settingsStorage.getAll();
      const updatedSettings = { 
        ...currentSettings,
        ...newSettings,
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  },
  
  updateSection: <K extends keyof MecanicaSettings>(
    section: K, 
    data: Partial<MecanicaSettings[K]>
  ): void => {
    try {
      const currentSettings = settingsStorage.getAll();
      const updatedSettings = {
        ...currentSettings,
        [section]: {
          ...currentSettings[section],
          ...data
        }
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error(`Erro ao atualizar seção ${section}:`, error);
    }
  },
  
  reset: (): void => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    } catch (error) {
      console.error('Erro ao redefinir configurações:', error);
    }
  },
  
  export: (): string => {
    try {
      const settings = settingsStorage.getAll();
      return JSON.stringify(settings, null, 2);
    } catch (error) {
      console.error('Erro ao exportar configurações:', error);
      return JSON.stringify({ error: 'Falha ao exportar configurações' });
    }
  },
  
  import: (jsonData: string): boolean => {
    try {
      const settings = JSON.parse(jsonData);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Erro ao importar configurações:', error);
      return false;
    }
  }
};

// Inicializar configurações com valores padrão se não existirem
if (!localStorage.getItem(SETTINGS_KEY)) {
  settingsStorage.reset();
}
