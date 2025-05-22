export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_otps: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          otp_code: string
          used: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          otp_code: string
          used?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          otp_code?: string
          used?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      admin_rate_limits: {
        Row: {
          attempts: number | null
          id: string
          last_attempt: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          id?: string
          last_attempt?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          id?: string
          last_attempt?: string | null
          user_id?: string
        }
        Relationships: []
      }
      colaboradores: {
        Row: {
          created_at: string | null
          email: string
          empresa_id: string
          empresa_nome: string | null
          id: string
          nome: string | null
          permissao: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          empresa_id: string
          empresa_nome?: string | null
          id?: string
          nome?: string | null
          permissao?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          empresa_id?: string
          empresa_nome?: string | null
          id?: string
          nome?: string | null
          permissao?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      consultas: {
        Row: {
          created_at: string | null
          data: string
          descricao: string
          diagnostico: string | null
          especialidade: string | null
          id: string
          motivo: string | null
          observacoes: string | null
          paciente_id: string
          profissional: string | null
          tipo: string
          tratamento: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data: string
          descricao: string
          diagnostico?: string | null
          especialidade?: string | null
          id?: string
          motivo?: string | null
          observacoes?: string | null
          paciente_id: string
          profissional?: string | null
          tipo: string
          tratamento?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string
          descricao?: string
          diagnostico?: string | null
          especialidade?: string | null
          id?: string
          motivo?: string | null
          observacoes?: string | null
          paciente_id?: string
          profissional?: string | null
          tipo?: string
          tratamento?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_medico: {
        Row: {
          created_at: string | null
          data: string
          descricao: string
          id: string
          observacoes: string | null
          paciente_id: string | null
          prontuario_id: string | null
          tipo: string
          tratamento: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: string
          descricao: string
          id?: string
          observacoes?: string | null
          paciente_id?: string | null
          prontuario_id?: string | null
          tipo: string
          tratamento?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string
          descricao?: string
          id?: string
          observacoes?: string | null
          paciente_id?: string | null
          prontuario_id?: string | null
          tipo?: string
          tratamento?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_medico_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_medico_prontuario_id_fkey"
            columns: ["prontuario_id"]
            isOneToOne: false
            referencedRelation: "prontuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      medicoes: {
        Row: {
          ap: number | null
          bp: number | null
          comprimento: number
          created_at: string | null
          cvai: number | null
          data: string
          diagonal_d: number
          diagonal_e: number
          diferenca_diagonais: number | null
          id: string
          indice_craniano: number | null
          largura: number
          observacoes: string | null
          paciente_id: string
          pd: number | null
          pe: number | null
          perimetro_cefalico: number | null
          recomendacoes: string[] | null
          status: Database["public"]["Enums"]["status_medicao"]
          tragus_d: number | null
          tragus_e: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ap?: number | null
          bp?: number | null
          comprimento: number
          created_at?: string | null
          cvai?: number | null
          data: string
          diagonal_d: number
          diagonal_e: number
          diferenca_diagonais?: number | null
          id?: string
          indice_craniano?: number | null
          largura: number
          observacoes?: string | null
          paciente_id: string
          pd?: number | null
          pe?: number | null
          perimetro_cefalico?: number | null
          recomendacoes?: string[] | null
          status: Database["public"]["Enums"]["status_medicao"]
          tragus_d?: number | null
          tragus_e?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ap?: number | null
          bp?: number | null
          comprimento?: number
          created_at?: string | null
          cvai?: number | null
          data?: string
          diagonal_d?: number
          diagonal_e?: number
          diferenca_diagonais?: number | null
          id?: string
          indice_craniano?: number | null
          largura?: number
          observacoes?: string | null
          paciente_id?: string
          pd?: number | null
          pe?: number | null
          perimetro_cefalico?: number | null
          recomendacoes?: string[] | null
          status?: Database["public"]["Enums"]["status_medicao"]
          tragus_d?: number | null
          tragus_e?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          created_at: string | null
          data_nascimento: string
          id: string
          nome: string
          responsaveis: Json | null
          sexo: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_nascimento: string
          id?: string
          nome: string
          responsaveis?: Json | null
          sexo?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_nascimento?: string
          id?: string
          nome?: string
          responsaveis?: Json | null
          sexo?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      prontuarios: {
        Row: {
          alergias: string | null
          altura: number | null
          created_at: string | null
          data_criacao: string | null
          id: string
          observacoes_gerais: string | null
          paciente_id: string
          peso: number | null
          tipo_sanguineo: string | null
          updated_at: string | null
        }
        Insert: {
          alergias?: string | null
          altura?: number | null
          created_at?: string | null
          data_criacao?: string | null
          id?: string
          observacoes_gerais?: string | null
          paciente_id: string
          peso?: number | null
          tipo_sanguineo?: string | null
          updated_at?: string | null
        }
        Update: {
          alergias?: string | null
          altura?: number | null
          created_at?: string | null
          data_criacao?: string | null
          id?: string
          observacoes_gerais?: string | null
          paciente_id?: string
          peso?: number | null
          tipo_sanguineo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prontuarios_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      security_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          data_type: string
          description: string | null
          id: string
          is_sensitive: boolean
          key: string
          updated_at: string
          updated_by: string | null
          value: Json | null
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          data_type?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          data_type?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      tarefas: {
        Row: {
          created_at: string | null
          descricao: string | null
          due_date: string
          id: string
          paciente_id: string
          responsible: string | null
          status: string
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          due_date: string
          id?: string
          paciente_id: string
          responsible?: string | null
          status?: string
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          due_date?: string
          id?: string
          paciente_id?: string
          responsible?: string | null
          status?: string
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          admin_role: boolean | null
          avatar_url: string | null
          clinica_logo: string | null
          clinica_nome: string | null
          created_at: string | null
          email: string
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          admin_role?: boolean | null
          avatar_url?: string | null
          clinica_logo?: string | null
          clinica_nome?: string | null
          created_at?: string | null
          email: string
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          admin_role?: boolean | null
          avatar_url?: string | null
          clinica_logo?: string | null
          clinica_nome?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      restore_default_system_settings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      status_medicao: "normal" | "leve" | "moderada" | "severa"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      status_medicao: ["normal", "leve", "moderada", "severa"],
    },
  },
} as const
