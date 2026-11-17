export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      alternatives: {
        Row: {
          correta: boolean
          id: string
          question_id: string
          texto: string
        }
        Insert: {
          correta?: boolean
          id?: string
          question_id: string
          texto: string
        }
        Update: {
          correta?: boolean
          id?: string
          question_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "alternatives_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys_registry: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          label: string | null
          last_validated_at: string | null
          last_validation_status: string | null
          service_name: string
          updated_at: string
          vault_secret_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          last_validated_at?: string | null
          last_validation_status?: string | null
          service_name: string
          updated_at?: string
          vault_secret_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          last_validated_at?: string | null
          last_validation_status?: string | null
          service_name?: string
          updated_at?: string
          vault_secret_id?: string
        }
        Relationships: []
      }
      asos: {
        Row: {
          arquivo_url: string | null
          cargo_avaliado: string | null
          created_at: string
          crm: string | null
          data_exame: string
          id: string
          medico_nome: string | null
          observacoes: string | null
          resultado: string
          riscos_avaliados: string[] | null
          tipo: string
          user_id: string
          validade_ate: string | null
        }
        Insert: {
          arquivo_url?: string | null
          cargo_avaliado?: string | null
          created_at?: string
          crm?: string | null
          data_exame: string
          id?: string
          medico_nome?: string | null
          observacoes?: string | null
          resultado?: string
          riscos_avaliados?: string[] | null
          tipo?: string
          user_id: string
          validade_ate?: string | null
        }
        Update: {
          arquivo_url?: string | null
          cargo_avaliado?: string | null
          created_at?: string
          crm?: string | null
          data_exame?: string
          id?: string
          medico_nome?: string | null
          observacoes?: string | null
          resultado?: string
          riscos_avaliados?: string[] | null
          tipo?: string
          user_id?: string
          validade_ate?: string | null
        }
        Relationships: []
      }
      attempt_answers: {
        Row: {
          alternative_id: string | null
          attempt_id: string
          correta: boolean
          id: string
          question_id: string
        }
        Insert: {
          alternative_id?: string | null
          attempt_id: string
          correta?: boolean
          id?: string
          question_id: string
        }
        Update: {
          alternative_id?: string | null
          attempt_id?: string
          correta?: boolean
          id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_alternative_id_fkey"
            columns: ["alternative_id"]
            isOneToOne: false
            referencedRelation: "alternatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          aprovado: boolean
          course_version_hash: string | null
          created_at: string
          enrollment_id: string
          evidencias: Json
          id: string
          ip: string | null
          score: number
          user_agent: string | null
        }
        Insert: {
          aprovado?: boolean
          course_version_hash?: string | null
          created_at?: string
          enrollment_id: string
          evidencias?: Json
          id?: string
          ip?: string | null
          score?: number
          user_agent?: string | null
        }
        Update: {
          aprovado?: boolean
          course_version_hash?: string | null
          created_at?: string
          enrollment_id?: string
          evidencias?: Json
          id?: string
          ip?: string | null
          score?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attempts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "vw_compliance"
            referencedColumns: ["enrollment_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          acao: string
          created_at: string
          entidade: string
          entidade_id: string | null
          id: string
          ip: string | null
          payload_json: Json | null
          user_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          entidade: string
          entidade_id?: string | null
          id?: string
          ip?: string | null
          payload_json?: Json | null
          user_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          entidade?: string
          entidade_id?: string | null
          id?: string
          ip?: string | null
          payload_json?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      branding: {
        Row: {
          cnpj: string | null
          domain: string | null
          email_from: string | null
          id: number
          logo_url: string | null
          nome_empresa: string | null
          onboarding_completo: boolean
          primary_color: string
          razao_social: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          domain?: string | null
          email_from?: string | null
          id?: number
          logo_url?: string | null
          nome_empresa?: string | null
          onboarding_completo?: boolean
          primary_color?: string
          razao_social?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          domain?: string | null
          email_from?: string | null
          id?: number
          logo_url?: string | null
          nome_empresa?: string | null
          onboarding_completo?: boolean
          primary_color?: string
          razao_social?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cats: {
        Row: {
          afastamento: boolean | null
          agente_causador: string | null
          cid10: string | null
          created_at: string
          crm: string | null
          data_acidente: string
          descricao: string
          dias_afastamento: number | null
          hora_acidente: string | null
          id: string
          local_acidente: string
          medico_nome: string | null
          observacoes: string | null
          parte_atingida: string | null
          protocolo_esocial: string | null
          status_esocial: string
          tipo: string
          user_id: string
        }
        Insert: {
          afastamento?: boolean | null
          agente_causador?: string | null
          cid10?: string | null
          created_at?: string
          crm?: string | null
          data_acidente: string
          descricao: string
          dias_afastamento?: number | null
          hora_acidente?: string | null
          id?: string
          local_acidente: string
          medico_nome?: string | null
          observacoes?: string | null
          parte_atingida?: string | null
          protocolo_esocial?: string | null
          status_esocial?: string
          tipo?: string
          user_id: string
        }
        Update: {
          afastamento?: boolean | null
          agente_causador?: string | null
          cid10?: string | null
          created_at?: string
          crm?: string | null
          data_acidente?: string
          descricao?: string
          dias_afastamento?: number | null
          hora_acidente?: string | null
          id?: string
          local_acidente?: string
          medico_nome?: string | null
          observacoes?: string | null
          parte_atingida?: string | null
          protocolo_esocial?: string | null
          status_esocial?: string
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          attempt_id: string
          carga_horaria_horas: number | null
          cnpj_empresa: string | null
          course_id: string
          emitido_at: string
          expires_at: string | null
          id: string
          instrutor_nome: string | null
          instrutor_registro: string | null
          nr_codigos: string[] | null
          numero_certificado: string | null
          pdf_hash: string | null
          pdf_url: string | null
          qr_token: string
          user_id: string
        }
        Insert: {
          attempt_id: string
          carga_horaria_horas?: number | null
          cnpj_empresa?: string | null
          course_id: string
          emitido_at?: string
          expires_at?: string | null
          id?: string
          instrutor_nome?: string | null
          instrutor_registro?: string | null
          nr_codigos?: string[] | null
          numero_certificado?: string | null
          pdf_hash?: string | null
          pdf_url?: string | null
          qr_token?: string
          user_id: string
        }
        Update: {
          attempt_id?: string
          carga_horaria_horas?: number | null
          cnpj_empresa?: string | null
          course_id?: string
          emitido_at?: string
          expires_at?: string | null
          id?: string
          instrutor_nome?: string | null
          instrutor_registro?: string | null
          nr_codigos?: string[] | null
          numero_certificado?: string | null
          pdf_hash?: string | null
          pdf_url?: string | null
          qr_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "vw_compliance"
            referencedColumns: ["course_id"]
          },
        ]
      }
      cipa_mandatos: {
        Row: {
          ata_url: string | null
          ativo: boolean
          created_at: string
          fim_em: string
          id: string
          inicio_em: string
          numero: number
          observacoes: string | null
        }
        Insert: {
          ata_url?: string | null
          ativo?: boolean
          created_at?: string
          fim_em: string
          id?: string
          inicio_em: string
          numero: number
          observacoes?: string | null
        }
        Update: {
          ata_url?: string | null
          ativo?: boolean
          created_at?: string
          fim_em?: string
          id?: string
          inicio_em?: string
          numero?: number
          observacoes?: string | null
        }
        Relationships: []
      }
      cipa_membros: {
        Row: {
          cargo: string
          created_at: string
          estabilidade_ate: string | null
          id: string
          mandato_id: string
          representacao: string
          user_id: string
        }
        Insert: {
          cargo: string
          created_at?: string
          estabilidade_ate?: string | null
          id?: string
          mandato_id: string
          representacao: string
          user_id: string
        }
        Update: {
          cargo?: string
          created_at?: string
          estabilidade_ate?: string | null
          id?: string
          mandato_id?: string
          representacao?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cipa_membros_mandato_id_fkey"
            columns: ["mandato_id"]
            isOneToOne: false
            referencedRelation: "cipa_mandatos"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          capa_url: string | null
          carga_horaria_horas: number
          created_at: string
          descricao: string | null
          emite_certificado: boolean
          id: string
          instrutor_habilitacao: string | null
          instrutor_nome: string | null
          modalidade: string
          modalidade_presencial_horas: number
          nota_minima: number
          nr_codigo: string[]
          num_questoes: number
          progresso_minimo_pct: number
          publicado: boolean
          titulo: string
          validade_meses: number
        }
        Insert: {
          capa_url?: string | null
          carga_horaria_horas?: number
          created_at?: string
          descricao?: string | null
          emite_certificado?: boolean
          id?: string
          instrutor_habilitacao?: string | null
          instrutor_nome?: string | null
          modalidade?: string
          modalidade_presencial_horas?: number
          nota_minima?: number
          nr_codigo?: string[]
          num_questoes?: number
          progresso_minimo_pct?: number
          publicado?: boolean
          titulo: string
          validade_meses?: number
        }
        Update: {
          capa_url?: string | null
          carga_horaria_horas?: number
          created_at?: string
          descricao?: string | null
          emite_certificado?: boolean
          id?: string
          instrutor_habilitacao?: string | null
          instrutor_nome?: string | null
          modalidade?: string
          modalidade_presencial_horas?: number
          nota_minima?: number
          nr_codigo?: string[]
          num_questoes?: number
          progresso_minimo_pct?: number
          publicado?: boolean
          titulo?: string
          validade_meses?: number
        }
        Relationships: []
      }
      empresa_membros: {
        Row: {
          created_at: string
          empresa_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresa_membros_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string | null
          created_at: string
          id: string
          logo_url: string | null
          razao_social: string
          status: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          razao_social: string
          status?: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          razao_social?: string
          status?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          bloqueado_acesso: boolean
          course_id: string
          due_date: string | null
          enrolled_at: string
          id: string
          status: Database["public"]["Enums"]["enrollment_status"]
          user_id: string
        }
        Insert: {
          bloqueado_acesso?: boolean
          course_id: string
          due_date?: string | null
          enrolled_at?: string
          id?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          user_id: string
        }
        Update: {
          bloqueado_acesso?: boolean
          course_id?: string
          due_date?: string | null
          enrolled_at?: string
          id?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "vw_compliance"
            referencedColumns: ["course_id"]
          },
        ]
      }
      epi_entregas: {
        Row: {
          assinado_em: string | null
          assinatura_token: string | null
          created_at: string
          data_devolucao: string | null
          data_entrega: string
          devolvido: boolean | null
          enrollment_id: string | null
          epi_id: string
          id: string
          observacoes: string | null
          quantidade: number
          user_id: string
        }
        Insert: {
          assinado_em?: string | null
          assinatura_token?: string | null
          created_at?: string
          data_devolucao?: string | null
          data_entrega?: string
          devolvido?: boolean | null
          enrollment_id?: string | null
          epi_id: string
          id?: string
          observacoes?: string | null
          quantidade?: number
          user_id: string
        }
        Update: {
          assinado_em?: string | null
          assinatura_token?: string | null
          created_at?: string
          data_devolucao?: string | null
          data_entrega?: string
          devolvido?: boolean | null
          enrollment_id?: string | null
          epi_id?: string
          id?: string
          observacoes?: string | null
          quantidade?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "epi_entregas_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epi_entregas_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "vw_compliance"
            referencedColumns: ["enrollment_id"]
          },
          {
            foreignKeyName: "epi_entregas_epi_id_fkey"
            columns: ["epi_id"]
            isOneToOne: false
            referencedRelation: "epis"
            referencedColumns: ["id"]
          },
        ]
      }
      epis: {
        Row: {
          ativo: boolean
          ca_numero: string | null
          ca_validade: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          ativo?: boolean
          ca_numero?: string | null
          ca_validade?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          tipo?: string
        }
        Update: {
          ativo?: boolean
          ca_numero?: string | null
          ca_validade?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      esocial_queue: {
        Row: {
          aso_id: string | null
          created_at: string
          enrollment_id: string | null
          enviado_em: string | null
          erro_msg: string | null
          evento: string
          id: string
          payload_json: Json | null
          prazo_envio: string | null
          protocolo: string | null
          resposta_gov: string | null
          status: string
          user_id: string | null
          xml_gerado: string | null
        }
        Insert: {
          aso_id?: string | null
          created_at?: string
          enrollment_id?: string | null
          enviado_em?: string | null
          erro_msg?: string | null
          evento: string
          id?: string
          payload_json?: Json | null
          prazo_envio?: string | null
          protocolo?: string | null
          resposta_gov?: string | null
          status?: string
          user_id?: string | null
          xml_gerado?: string | null
        }
        Update: {
          aso_id?: string | null
          created_at?: string
          enrollment_id?: string | null
          enviado_em?: string | null
          erro_msg?: string | null
          evento?: string
          id?: string
          payload_json?: Json | null
          prazo_envio?: string | null
          protocolo?: string | null
          resposta_gov?: string | null
          status?: string
          user_id?: string | null
          xml_gerado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esocial_queue_aso_id_fkey"
            columns: ["aso_id"]
            isOneToOne: false
            referencedRelation: "asos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esocial_queue_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esocial_queue_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "vw_compliance"
            referencedColumns: ["enrollment_id"]
          },
        ]
      }
      file_lessons: {
        Row: {
          lesson_id: string
          mime_type: string | null
          storage_path: string
        }
        Insert: {
          lesson_id: string
          mime_type?: string | null
          storage_path: string
        }
        Update: {
          lesson_id?: string
          mime_type?: string | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_lessons_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          nome: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          nome?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          nome?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      job_roles: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          concluida: boolean
          enrollment_id: string
          id: string
          lesson_id: string
          watch_pct: number
        }
        Insert: {
          completed_at?: string | null
          concluida?: boolean
          enrollment_id: string
          id?: string
          lesson_id: string
          watch_pct?: number
        }
        Update: {
          completed_at?: string | null
          concluida?: boolean
          enrollment_id?: string
          id?: string
          lesson_id?: string
          watch_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "vw_compliance"
            referencedColumns: ["enrollment_id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          obrigatoria: boolean
          ordem: number
          tipo: Database["public"]["Enums"]["lesson_type"]
          titulo: string
        }
        Insert: {
          id?: string
          module_id: string
          obrigatoria?: boolean
          ordem?: number
          tipo: Database["public"]["Enums"]["lesson_type"]
          titulo: string
        }
        Update: {
          id?: string
          module_id?: string
          obrigatoria?: boolean
          ordem?: number
          tipo?: Database["public"]["Enums"]["lesson_type"]
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      link_lessons: {
        Row: {
          lesson_id: string
          url: string
        }
        Insert: {
          lesson_id: string
          url: string
        }
        Update: {
          lesson_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_lessons_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          id: string
          ordem: number
          titulo: string
        }
        Insert: {
          course_id: string
          id?: string
          ordem?: number
          titulo: string
        }
        Update: {
          course_id?: string
          id?: string
          ordem?: number
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "vw_compliance"
            referencedColumns: ["course_id"]
          },
        ]
      }
      notifications: {
        Row: {
          canal: string
          course_id: string | null
          created_at: string
          id: string
          lida: boolean
          payload_json: Json | null
          sent_at: string | null
          status: string
          template: string
          user_id: string | null
        }
        Insert: {
          canal?: string
          course_id?: string | null
          created_at?: string
          id?: string
          lida?: boolean
          payload_json?: Json | null
          sent_at?: string | null
          status?: string
          template: string
          user_id?: string | null
        }
        Update: {
          canal?: string
          course_id?: string | null
          created_at?: string
          id?: string
          lida?: boolean
          payload_json?: Json | null
          sent_at?: string | null
          status?: string
          template?: string
          user_id?: string | null
        }
        Relationships: []
      }
      nrs_catalog: {
        Row: {
          aplica_todos: boolean
          base_legal: string | null
          conteudo_programatico: string | null
          conteudo_resumo: string | null
          created_at: string
          descricao: string
          ementa_padrao: string | null
          horas_minimas: number
          id: string
          numero: string
          objetivo: string | null
          periodicidade_meses: number
          publico_alvo: string | null
          requisitos: string | null
          setores: string[]
          titulo: string
          vigente: boolean
        }
        Insert: {
          aplica_todos?: boolean
          base_legal?: string | null
          conteudo_programatico?: string | null
          conteudo_resumo?: string | null
          created_at?: string
          descricao: string
          ementa_padrao?: string | null
          horas_minimas?: number
          id?: string
          numero: string
          objetivo?: string | null
          periodicidade_meses?: number
          publico_alvo?: string | null
          requisitos?: string | null
          setores?: string[]
          titulo: string
          vigente?: boolean
        }
        Update: {
          aplica_todos?: boolean
          base_legal?: string | null
          conteudo_programatico?: string | null
          conteudo_resumo?: string | null
          created_at?: string
          descricao?: string
          ementa_padrao?: string | null
          horas_minimas?: number
          id?: string
          numero?: string
          objetivo?: string | null
          periodicidade_meses?: number
          publico_alvo?: string | null
          requisitos?: string | null
          setores?: string[]
          titulo?: string
          vigente?: boolean
        }
        Relationships: []
      }
      panda_lessons: {
        Row: {
          duracao_seg: number | null
          lesson_id: string
          panda_video_id: string
          thumbnail_url: string | null
        }
        Insert: {
          duracao_seg?: number | null
          lesson_id: string
          panda_video_id: string
          thumbnail_url?: string | null
        }
        Update: {
          duracao_seg?: number | null
          lesson_id?: string
          panda_video_id?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "panda_lessons_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      path_requirements: {
        Row: {
          course_id: string
          id: string
          job_role_id: string
          obrigatorio: boolean
          ordem: number
          prerequisite_course_id: string | null
        }
        Insert: {
          course_id: string
          id?: string
          job_role_id: string
          obrigatorio?: boolean
          ordem?: number
          prerequisite_course_id?: string | null
        }
        Update: {
          course_id?: string
          id?: string
          job_role_id?: string
          obrigatorio?: boolean
          ordem?: number
          prerequisite_course_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "path_requirements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "path_requirements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "vw_compliance"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "path_requirements_job_role_id_fkey"
            columns: ["job_role_id"]
            isOneToOne: false
            referencedRelation: "job_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "path_requirements_job_role_id_fkey"
            columns: ["job_role_id"]
            isOneToOne: false
            referencedRelation: "vw_compliance"
            referencedColumns: ["job_role_id"]
          },
          {
            foreignKeyName: "path_requirements_prerequisite_course_id_fkey"
            columns: ["prerequisite_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "path_requirements_prerequisite_course_id_fkey"
            columns: ["prerequisite_course_id"]
            isOneToOne: false
            referencedRelation: "vw_compliance"
            referencedColumns: ["course_id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          cargo: string | null
          cpf: string | null
          created_at: string
          email: string
          empresa_id: string | null
          id: string
          job_role_id: string | null
          matricula_empresa: string | null
          nome: string
          setor: string | null
          telefone: string | null
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          cargo?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          empresa_id?: string | null
          id: string
          job_role_id?: string | null
          matricula_empresa?: string | null
          nome?: string
          setor?: string | null
          telefone?: string | null
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          cargo?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          empresa_id?: string | null
          id?: string
          job_role_id?: string | null
          matricula_empresa?: string | null
          nome?: string
          setor?: string | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_job_role_id_fkey"
            columns: ["job_role_id"]
            isOneToOne: false
            referencedRelation: "job_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_job_role_id_fkey"
            columns: ["job_role_id"]
            isOneToOne: false
            referencedRelation: "vw_compliance"
            referencedColumns: ["job_role_id"]
          },
        ]
      }
      pt_apr: {
        Row: {
          assinaturas: Json | null
          bloqueado_vencimento: boolean | null
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          descricao_atividade: string | null
          id: string
          local_trabalho: string | null
          medidas_controle: string | null
          nr_ref: string | null
          riscos_identificados: string | null
          solicitante_id: string | null
          status: string
          tipo: string
          titulo: string
        }
        Insert: {
          assinaturas?: Json | null
          bloqueado_vencimento?: boolean | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao_atividade?: string | null
          id?: string
          local_trabalho?: string | null
          medidas_controle?: string | null
          nr_ref?: string | null
          riscos_identificados?: string | null
          solicitante_id?: string | null
          status?: string
          tipo?: string
          titulo: string
        }
        Update: {
          assinaturas?: Json | null
          bloqueado_vencimento?: boolean | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao_atividade?: string | null
          id?: string
          local_trabalho?: string | null
          medidas_controle?: string | null
          nr_ref?: string | null
          riscos_identificados?: string | null
          solicitante_id?: string | null
          status?: string
          tipo?: string
          titulo?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          ativo: boolean
          course_id: string
          enunciado: string
          id: string
          nivel: Database["public"]["Enums"]["question_level"]
        }
        Insert: {
          ativo?: boolean
          course_id: string
          enunciado: string
          id?: string
          nivel?: Database["public"]["Enums"]["question_level"]
        }
        Update: {
          ativo?: boolean
          course_id?: string
          enunciado?: string
          id?: string
          nivel?: Database["public"]["Enums"]["question_level"]
        }
        Relationships: [
          {
            foreignKeyName: "questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "vw_compliance"
            referencedColumns: ["course_id"]
          },
        ]
      }
      rich_lessons: {
        Row: {
          conteudo_html: string
          lesson_id: string
        }
        Insert: {
          conteudo_html?: string
          lesson_id: string
        }
        Update: {
          conteudo_html?: string
          lesson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rich_lessons_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      riscos_psicossociais: {
        Row: {
          created_at: string
          descricao: string
          fator: string
          id: string
          medidas_controle: string | null
          prazo: string | null
          probabilidade: string
          responsavel: string | null
          setor: string
          severidade: string
          status: string
        }
        Insert: {
          created_at?: string
          descricao: string
          fator: string
          id?: string
          medidas_controle?: string | null
          prazo?: string | null
          probabilidade?: string
          responsavel?: string | null
          setor: string
          severidade?: string
          status?: string
        }
        Update: {
          created_at?: string
          descricao?: string
          fator?: string
          id?: string
          medidas_controle?: string | null
          prazo?: string | null
          probabilidade?: string
          responsavel?: string | null
          setor?: string
          severidade?: string
          status?: string
        }
        Relationships: []
      }
      sst_documentos: {
        Row: {
          arquivo_url: string | null
          created_at: string
          id: string
          nome: string
          observacoes: string | null
          responsavel_crea: string | null
          responsavel_nome: string | null
          tipo: string
          validade: string | null
          versao: string | null
          vigente: boolean
        }
        Insert: {
          arquivo_url?: string | null
          created_at?: string
          id?: string
          nome: string
          observacoes?: string | null
          responsavel_crea?: string | null
          responsavel_nome?: string | null
          tipo: string
          validade?: string | null
          versao?: string | null
          vigente?: boolean
        }
        Update: {
          arquivo_url?: string | null
          created_at?: string
          id?: string
          nome?: string
          observacoes?: string | null
          responsavel_crea?: string | null
          responsavel_nome?: string | null
          tipo?: string
          validade?: string | null
          versao?: string | null
          vigente?: boolean
        }
        Relationships: []
      }
      terceiros: {
        Row: {
          cnpj: string | null
          contato_email: string | null
          contato_nome: string | null
          contato_tel: string | null
          created_at: string
          docs_ok: boolean | null
          id: string
          nrs_aplicaveis: string[] | null
          observacoes: string | null
          razao_social: string
          servico: string | null
          status: string
        }
        Insert: {
          cnpj?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_tel?: string | null
          created_at?: string
          docs_ok?: boolean | null
          id?: string
          nrs_aplicaveis?: string[] | null
          observacoes?: string | null
          razao_social: string
          servico?: string | null
          status?: string
        }
        Update: {
          cnpj?: string | null
          contato_email?: string | null
          contato_nome?: string | null
          contato_tel?: string | null
          created_at?: string
          docs_ok?: boolean | null
          id?: string
          nrs_aplicaveis?: string[] | null
          observacoes?: string | null
          razao_social?: string
          servico?: string | null
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      vw_compliance: {
        Row: {
          cargo: string | null
          compliance_status: string | null
          course_id: string | null
          curso_titulo: string | null
          due_date: string | null
          enrollment_id: string | null
          enrollment_status:
            | Database["public"]["Enums"]["enrollment_status"]
            | null
          job_role_id: string | null
          job_role_nome: string | null
          nome: string | null
          nr_codigo: string[] | null
          obrigatorio: boolean | null
          ordem: number | null
          prerequisite_course_id: string | null
          setor: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "path_requirements_prerequisite_course_id_fkey"
            columns: ["prerequisite_course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "path_requirements_prerequisite_course_id_fkey"
            columns: ["prerequisite_course_id"]
            isOneToOne: false
            referencedRelation: "vw_compliance"
            referencedColumns: ["course_id"]
          },
        ]
      }
    }
    Functions: {
      bootstrap_self: { Args: never; Returns: undefined }
      get_certificate: {
        Args: { p_token: string }
        Returns: {
          aluno_cpf: string
          aluno_nome: string
          carga_horaria_horas: number
          cnpj_empresa: string
          curso_titulo: string
          emitido_at: string
          expires_at: string
          instrutor_habilitacao: string
          instrutor_nome: string
          modalidade: string
          nr_codigos: string[]
          numero_certificado: string
          pdf_hash: string
          qr_token: string
        }[]
      }
      get_minhas_empresas: {
        Args: never
        Returns: {
          cnpj: string
          id: string
          logo_url: string
          meu_role: string
          razao_social: string
          status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id?: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      refresh_all_enrollment_statuses: { Args: never; Returns: number }
      refresh_enrollment_status: { Args: { p_id: string }; Returns: undefined }
      signup_mode: { Args: never; Returns: string }
      vault_create_secret: {
        Args: { p_description?: string; p_name: string; p_secret: string }
        Returns: string
      }
      vault_delete_secret: { Args: { p_id: string }; Returns: undefined }
      vault_read_secret: { Args: { p_id: string }; Returns: string }
      vault_read_secret_by_name: { Args: { p_name: string }; Returns: string }
      vault_update_secret: {
        Args: { p_id: string; p_secret: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "gestor" | "aluno"
      enrollment_status: "ativo" | "expirando" | "vencido" | "concluido"
      lesson_type: "panda" | "pdf" | "audio" | "slides" | "link" | "rich_text"
      question_level: "facil" | "medio" | "dificil"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "gestor", "aluno"],
      enrollment_status: ["ativo", "expirando", "vencido", "concluido"],
      lesson_type: ["panda", "pdf", "audio", "slides", "link", "rich_text"],
      question_level: ["facil", "medio", "dificil"],
    },
  },
} as const
