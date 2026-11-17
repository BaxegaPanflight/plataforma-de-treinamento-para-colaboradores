-- Script único para colar no SQL Editor do Supabase (projeto przfzmvzmuqwjostxaqm).
-- Gerado a partir de supabase/migrations/*.sql. Roda tudo em uma transação: se falhar, nada é aplicado.
-- GRANT MAINTAIN removido (só existe no Postgres 17 e não afeta o app).
BEGIN;

-- ===== 20261117014700_schema_tables.sql =====
-- Schema-only baseline exported from live PostgreSQL catalogs on 2026-11-17 UTC.
-- For a NEW managed PostgreSQL database only; do not apply to the existing database.
-- No application rows, auth users, secret values or storage files are included.
SET search_path = public, extensions;

CREATE TYPE public.app_role AS ENUM ('admin', 'gestor', 'aluno');

CREATE TYPE public.enrollment_status AS ENUM ('ativo', 'expirando', 'vencido', 'concluido');

CREATE TYPE public.lesson_type AS ENUM ('panda', 'pdf', 'audio', 'slides', 'link', 'rich_text');

CREATE TYPE public.question_level AS ENUM ('facil', 'medio', 'dificil');

CREATE SEQUENCE public.cert_seq AS bigint INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1 NO CYCLE;

CREATE TABLE public.alternatives (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  question_id uuid NOT NULL,
  texto text NOT NULL,
  correta boolean DEFAULT false NOT NULL
);
GRANT DELETE ON TABLE public.alternatives TO anon;
GRANT INSERT ON TABLE public.alternatives TO anon;
GRANT REFERENCES ON TABLE public.alternatives TO anon;
GRANT SELECT ON TABLE public.alternatives TO anon;
GRANT TRIGGER ON TABLE public.alternatives TO anon;
GRANT TRUNCATE ON TABLE public.alternatives TO anon;
GRANT UPDATE ON TABLE public.alternatives TO anon;
GRANT DELETE ON TABLE public.alternatives TO authenticated;
GRANT INSERT ON TABLE public.alternatives TO authenticated;
GRANT REFERENCES ON TABLE public.alternatives TO authenticated;
GRANT SELECT ON TABLE public.alternatives TO authenticated;
GRANT TRIGGER ON TABLE public.alternatives TO authenticated;
GRANT TRUNCATE ON TABLE public.alternatives TO authenticated;
GRANT UPDATE ON TABLE public.alternatives TO authenticated;
GRANT DELETE ON TABLE public.alternatives TO service_role;
GRANT INSERT ON TABLE public.alternatives TO service_role;
GRANT REFERENCES ON TABLE public.alternatives TO service_role;
GRANT SELECT ON TABLE public.alternatives TO service_role;
GRANT TRIGGER ON TABLE public.alternatives TO service_role;
GRANT TRUNCATE ON TABLE public.alternatives TO service_role;
GRANT UPDATE ON TABLE public.alternatives TO service_role;
ALTER TABLE public.alternatives ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.api_keys_registry (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  service_name text NOT NULL,
  vault_secret_id uuid NOT NULL,
  label text,
  is_active boolean DEFAULT true NOT NULL,
  last_validated_at timestamp with time zone,
  last_validation_status text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.api_keys_registry TO anon;
GRANT INSERT ON TABLE public.api_keys_registry TO anon;
GRANT REFERENCES ON TABLE public.api_keys_registry TO anon;
GRANT SELECT ON TABLE public.api_keys_registry TO anon;
GRANT TRIGGER ON TABLE public.api_keys_registry TO anon;
GRANT TRUNCATE ON TABLE public.api_keys_registry TO anon;
GRANT UPDATE ON TABLE public.api_keys_registry TO anon;
GRANT DELETE ON TABLE public.api_keys_registry TO authenticated;
GRANT INSERT ON TABLE public.api_keys_registry TO authenticated;
GRANT REFERENCES ON TABLE public.api_keys_registry TO authenticated;
GRANT SELECT ON TABLE public.api_keys_registry TO authenticated;
GRANT TRIGGER ON TABLE public.api_keys_registry TO authenticated;
GRANT TRUNCATE ON TABLE public.api_keys_registry TO authenticated;
GRANT UPDATE ON TABLE public.api_keys_registry TO authenticated;
GRANT DELETE ON TABLE public.api_keys_registry TO service_role;
GRANT INSERT ON TABLE public.api_keys_registry TO service_role;
GRANT REFERENCES ON TABLE public.api_keys_registry TO service_role;
GRANT SELECT ON TABLE public.api_keys_registry TO service_role;
GRANT TRIGGER ON TABLE public.api_keys_registry TO service_role;
GRANT TRUNCATE ON TABLE public.api_keys_registry TO service_role;
GRANT UPDATE ON TABLE public.api_keys_registry TO service_role;
ALTER TABLE public.api_keys_registry ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.asos (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  tipo text DEFAULT 'admissional'::text NOT NULL,
  data_exame date NOT NULL,
  validade_ate date,
  resultado text DEFAULT 'apto'::text NOT NULL,
  medico_nome text,
  crm text,
  cargo_avaliado text,
  riscos_avaliados text[],
  arquivo_url text,
  observacoes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.asos TO anon;
GRANT INSERT ON TABLE public.asos TO anon;
GRANT REFERENCES ON TABLE public.asos TO anon;
GRANT SELECT ON TABLE public.asos TO anon;
GRANT TRIGGER ON TABLE public.asos TO anon;
GRANT TRUNCATE ON TABLE public.asos TO anon;
GRANT UPDATE ON TABLE public.asos TO anon;
GRANT DELETE ON TABLE public.asos TO authenticated;
GRANT INSERT ON TABLE public.asos TO authenticated;
GRANT REFERENCES ON TABLE public.asos TO authenticated;
GRANT SELECT ON TABLE public.asos TO authenticated;
GRANT TRIGGER ON TABLE public.asos TO authenticated;
GRANT TRUNCATE ON TABLE public.asos TO authenticated;
GRANT UPDATE ON TABLE public.asos TO authenticated;
GRANT DELETE ON TABLE public.asos TO service_role;
GRANT INSERT ON TABLE public.asos TO service_role;
GRANT REFERENCES ON TABLE public.asos TO service_role;
GRANT SELECT ON TABLE public.asos TO service_role;
GRANT TRIGGER ON TABLE public.asos TO service_role;
GRANT TRUNCATE ON TABLE public.asos TO service_role;
GRANT UPDATE ON TABLE public.asos TO service_role;
ALTER TABLE public.asos ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.attempt_answers (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  attempt_id uuid NOT NULL,
  question_id uuid NOT NULL,
  alternative_id uuid,
  correta boolean DEFAULT false NOT NULL
);
GRANT DELETE ON TABLE public.attempt_answers TO anon;
GRANT INSERT ON TABLE public.attempt_answers TO anon;
GRANT REFERENCES ON TABLE public.attempt_answers TO anon;
GRANT SELECT ON TABLE public.attempt_answers TO anon;
GRANT TRIGGER ON TABLE public.attempt_answers TO anon;
GRANT TRUNCATE ON TABLE public.attempt_answers TO anon;
GRANT UPDATE ON TABLE public.attempt_answers TO anon;
GRANT DELETE ON TABLE public.attempt_answers TO authenticated;
GRANT INSERT ON TABLE public.attempt_answers TO authenticated;
GRANT REFERENCES ON TABLE public.attempt_answers TO authenticated;
GRANT SELECT ON TABLE public.attempt_answers TO authenticated;
GRANT TRIGGER ON TABLE public.attempt_answers TO authenticated;
GRANT TRUNCATE ON TABLE public.attempt_answers TO authenticated;
GRANT UPDATE ON TABLE public.attempt_answers TO authenticated;
GRANT DELETE ON TABLE public.attempt_answers TO service_role;
GRANT INSERT ON TABLE public.attempt_answers TO service_role;
GRANT REFERENCES ON TABLE public.attempt_answers TO service_role;
GRANT SELECT ON TABLE public.attempt_answers TO service_role;
GRANT TRIGGER ON TABLE public.attempt_answers TO service_role;
GRANT TRUNCATE ON TABLE public.attempt_answers TO service_role;
GRANT UPDATE ON TABLE public.attempt_answers TO service_role;
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.attempts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  enrollment_id uuid NOT NULL,
  score numeric DEFAULT 0 NOT NULL,
  aprovado boolean DEFAULT false NOT NULL,
  ip text,
  user_agent text,
  course_version_hash text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  evidencias jsonb DEFAULT '[]'::jsonb NOT NULL
);
GRANT DELETE ON TABLE public.attempts TO anon;
GRANT INSERT ON TABLE public.attempts TO anon;
GRANT REFERENCES ON TABLE public.attempts TO anon;
GRANT SELECT ON TABLE public.attempts TO anon;
GRANT TRIGGER ON TABLE public.attempts TO anon;
GRANT TRUNCATE ON TABLE public.attempts TO anon;
GRANT UPDATE ON TABLE public.attempts TO anon;
GRANT DELETE ON TABLE public.attempts TO authenticated;
GRANT INSERT ON TABLE public.attempts TO authenticated;
GRANT REFERENCES ON TABLE public.attempts TO authenticated;
GRANT SELECT ON TABLE public.attempts TO authenticated;
GRANT TRIGGER ON TABLE public.attempts TO authenticated;
GRANT TRUNCATE ON TABLE public.attempts TO authenticated;
GRANT UPDATE ON TABLE public.attempts TO authenticated;
GRANT DELETE ON TABLE public.attempts TO service_role;
GRANT INSERT ON TABLE public.attempts TO service_role;
GRANT REFERENCES ON TABLE public.attempts TO service_role;
GRANT SELECT ON TABLE public.attempts TO service_role;
GRANT TRIGGER ON TABLE public.attempts TO service_role;
GRANT TRUNCATE ON TABLE public.attempts TO service_role;
GRANT UPDATE ON TABLE public.attempts TO service_role;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.audit_logs (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid,
  acao text NOT NULL,
  entidade text NOT NULL,
  entidade_id uuid,
  ip text,
  payload_json jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.audit_logs TO anon;
GRANT INSERT ON TABLE public.audit_logs TO anon;
GRANT REFERENCES ON TABLE public.audit_logs TO anon;
GRANT SELECT ON TABLE public.audit_logs TO anon;
GRANT TRIGGER ON TABLE public.audit_logs TO anon;
GRANT TRUNCATE ON TABLE public.audit_logs TO anon;
GRANT UPDATE ON TABLE public.audit_logs TO anon;
GRANT DELETE ON TABLE public.audit_logs TO authenticated;
GRANT INSERT ON TABLE public.audit_logs TO authenticated;
GRANT REFERENCES ON TABLE public.audit_logs TO authenticated;
GRANT SELECT ON TABLE public.audit_logs TO authenticated;
GRANT TRIGGER ON TABLE public.audit_logs TO authenticated;
GRANT TRUNCATE ON TABLE public.audit_logs TO authenticated;
GRANT UPDATE ON TABLE public.audit_logs TO authenticated;
GRANT DELETE ON TABLE public.audit_logs TO service_role;
GRANT INSERT ON TABLE public.audit_logs TO service_role;
GRANT REFERENCES ON TABLE public.audit_logs TO service_role;
GRANT SELECT ON TABLE public.audit_logs TO service_role;
GRANT TRIGGER ON TABLE public.audit_logs TO service_role;
GRANT TRUNCATE ON TABLE public.audit_logs TO service_role;
GRANT UPDATE ON TABLE public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.branding (
  id integer DEFAULT 1 NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#0A4F95'::text NOT NULL,
  domain text,
  email_from text,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  razao_social text,
  cnpj text,
  nome_empresa text,
  onboarding_completo boolean DEFAULT false NOT NULL
);
GRANT DELETE ON TABLE public.branding TO anon;
GRANT INSERT ON TABLE public.branding TO anon;
GRANT REFERENCES ON TABLE public.branding TO anon;
GRANT SELECT ON TABLE public.branding TO anon;
GRANT TRIGGER ON TABLE public.branding TO anon;
GRANT TRUNCATE ON TABLE public.branding TO anon;
GRANT UPDATE ON TABLE public.branding TO anon;
GRANT DELETE ON TABLE public.branding TO authenticated;
GRANT INSERT ON TABLE public.branding TO authenticated;
GRANT REFERENCES ON TABLE public.branding TO authenticated;
GRANT SELECT ON TABLE public.branding TO authenticated;
GRANT TRIGGER ON TABLE public.branding TO authenticated;
GRANT TRUNCATE ON TABLE public.branding TO authenticated;
GRANT UPDATE ON TABLE public.branding TO authenticated;
GRANT DELETE ON TABLE public.branding TO service_role;
GRANT INSERT ON TABLE public.branding TO service_role;
GRANT REFERENCES ON TABLE public.branding TO service_role;
GRANT SELECT ON TABLE public.branding TO service_role;
GRANT TRIGGER ON TABLE public.branding TO service_role;
GRANT TRUNCATE ON TABLE public.branding TO service_role;
GRANT UPDATE ON TABLE public.branding TO service_role;
ALTER TABLE public.branding ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cats (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  data_acidente date NOT NULL,
  hora_acidente time without time zone,
  local_acidente text NOT NULL,
  descricao text NOT NULL,
  parte_atingida text,
  agente_causador text,
  tipo text DEFAULT 'tipico'::text NOT NULL,
  afastamento boolean DEFAULT false,
  dias_afastamento integer DEFAULT 0,
  cid10 text,
  status_esocial text DEFAULT 'pendente'::text NOT NULL,
  protocolo_esocial text,
  medico_nome text,
  crm text,
  observacoes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.cats TO anon;
GRANT INSERT ON TABLE public.cats TO anon;
GRANT REFERENCES ON TABLE public.cats TO anon;
GRANT SELECT ON TABLE public.cats TO anon;
GRANT TRIGGER ON TABLE public.cats TO anon;
GRANT TRUNCATE ON TABLE public.cats TO anon;
GRANT UPDATE ON TABLE public.cats TO anon;
GRANT DELETE ON TABLE public.cats TO authenticated;
GRANT INSERT ON TABLE public.cats TO authenticated;
GRANT REFERENCES ON TABLE public.cats TO authenticated;
GRANT SELECT ON TABLE public.cats TO authenticated;
GRANT TRIGGER ON TABLE public.cats TO authenticated;
GRANT TRUNCATE ON TABLE public.cats TO authenticated;
GRANT UPDATE ON TABLE public.cats TO authenticated;
GRANT DELETE ON TABLE public.cats TO service_role;
GRANT INSERT ON TABLE public.cats TO service_role;
GRANT REFERENCES ON TABLE public.cats TO service_role;
GRANT SELECT ON TABLE public.cats TO service_role;
GRANT TRIGGER ON TABLE public.cats TO service_role;
GRANT TRUNCATE ON TABLE public.cats TO service_role;
GRANT UPDATE ON TABLE public.cats TO service_role;
ALTER TABLE public.cats ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.certificates (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  attempt_id uuid NOT NULL,
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  pdf_url text,
  qr_token text DEFAULT encode(extensions.gen_random_bytes(16), 'hex'::text) NOT NULL,
  emitido_at timestamp with time zone DEFAULT now() NOT NULL,
  expires_at timestamp with time zone,
  nr_codigos text[],
  carga_horaria_horas numeric,
  instrutor_nome text,
  instrutor_registro text,
  cnpj_empresa text,
  numero_certificado text,
  pdf_hash text
);
GRANT DELETE ON TABLE public.certificates TO anon;
GRANT INSERT ON TABLE public.certificates TO anon;
GRANT REFERENCES ON TABLE public.certificates TO anon;
GRANT SELECT ON TABLE public.certificates TO anon;
GRANT TRIGGER ON TABLE public.certificates TO anon;
GRANT TRUNCATE ON TABLE public.certificates TO anon;
GRANT UPDATE ON TABLE public.certificates TO anon;
GRANT DELETE ON TABLE public.certificates TO authenticated;
GRANT INSERT ON TABLE public.certificates TO authenticated;
GRANT REFERENCES ON TABLE public.certificates TO authenticated;
GRANT SELECT ON TABLE public.certificates TO authenticated;
GRANT TRIGGER ON TABLE public.certificates TO authenticated;
GRANT TRUNCATE ON TABLE public.certificates TO authenticated;
GRANT UPDATE ON TABLE public.certificates TO authenticated;
GRANT DELETE ON TABLE public.certificates TO service_role;
GRANT INSERT ON TABLE public.certificates TO service_role;
GRANT REFERENCES ON TABLE public.certificates TO service_role;
GRANT SELECT ON TABLE public.certificates TO service_role;
GRANT TRIGGER ON TABLE public.certificates TO service_role;
GRANT TRUNCATE ON TABLE public.certificates TO service_role;
GRANT UPDATE ON TABLE public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cipa_mandatos (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  numero integer NOT NULL,
  inicio_em date NOT NULL,
  fim_em date NOT NULL,
  ativo boolean DEFAULT true NOT NULL,
  ata_url text,
  observacoes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.cipa_mandatos TO anon;
GRANT INSERT ON TABLE public.cipa_mandatos TO anon;
GRANT REFERENCES ON TABLE public.cipa_mandatos TO anon;
GRANT SELECT ON TABLE public.cipa_mandatos TO anon;
GRANT TRIGGER ON TABLE public.cipa_mandatos TO anon;
GRANT TRUNCATE ON TABLE public.cipa_mandatos TO anon;
GRANT UPDATE ON TABLE public.cipa_mandatos TO anon;
GRANT DELETE ON TABLE public.cipa_mandatos TO authenticated;
GRANT INSERT ON TABLE public.cipa_mandatos TO authenticated;
GRANT REFERENCES ON TABLE public.cipa_mandatos TO authenticated;
GRANT SELECT ON TABLE public.cipa_mandatos TO authenticated;
GRANT TRIGGER ON TABLE public.cipa_mandatos TO authenticated;
GRANT TRUNCATE ON TABLE public.cipa_mandatos TO authenticated;
GRANT UPDATE ON TABLE public.cipa_mandatos TO authenticated;
GRANT DELETE ON TABLE public.cipa_mandatos TO service_role;
GRANT INSERT ON TABLE public.cipa_mandatos TO service_role;
GRANT REFERENCES ON TABLE public.cipa_mandatos TO service_role;
GRANT SELECT ON TABLE public.cipa_mandatos TO service_role;
GRANT TRIGGER ON TABLE public.cipa_mandatos TO service_role;
GRANT TRUNCATE ON TABLE public.cipa_mandatos TO service_role;
GRANT UPDATE ON TABLE public.cipa_mandatos TO service_role;
ALTER TABLE public.cipa_mandatos ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cipa_membros (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  mandato_id uuid NOT NULL,
  user_id uuid NOT NULL,
  cargo text NOT NULL,
  representacao text NOT NULL,
  estabilidade_ate date,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.cipa_membros TO anon;
GRANT INSERT ON TABLE public.cipa_membros TO anon;
GRANT REFERENCES ON TABLE public.cipa_membros TO anon;
GRANT SELECT ON TABLE public.cipa_membros TO anon;
GRANT TRIGGER ON TABLE public.cipa_membros TO anon;
GRANT TRUNCATE ON TABLE public.cipa_membros TO anon;
GRANT UPDATE ON TABLE public.cipa_membros TO anon;
GRANT DELETE ON TABLE public.cipa_membros TO authenticated;
GRANT INSERT ON TABLE public.cipa_membros TO authenticated;
GRANT REFERENCES ON TABLE public.cipa_membros TO authenticated;
GRANT SELECT ON TABLE public.cipa_membros TO authenticated;
GRANT TRIGGER ON TABLE public.cipa_membros TO authenticated;
GRANT TRUNCATE ON TABLE public.cipa_membros TO authenticated;
GRANT UPDATE ON TABLE public.cipa_membros TO authenticated;
GRANT DELETE ON TABLE public.cipa_membros TO service_role;
GRANT INSERT ON TABLE public.cipa_membros TO service_role;
GRANT REFERENCES ON TABLE public.cipa_membros TO service_role;
GRANT SELECT ON TABLE public.cipa_membros TO service_role;
GRANT TRIGGER ON TABLE public.cipa_membros TO service_role;
GRANT TRUNCATE ON TABLE public.cipa_membros TO service_role;
GRANT UPDATE ON TABLE public.cipa_membros TO service_role;
ALTER TABLE public.cipa_membros ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.courses (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  titulo text NOT NULL,
  descricao text,
  capa_url text,
  validade_meses integer DEFAULT 12 NOT NULL,
  nota_minima integer DEFAULT 70 NOT NULL,
  progresso_minimo_pct integer DEFAULT 80 NOT NULL,
  emite_certificado boolean DEFAULT true NOT NULL,
  publicado boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  num_questoes integer DEFAULT 10 NOT NULL,
  nr_codigo text[] DEFAULT '{}'::text[] NOT NULL,
  carga_horaria_horas numeric DEFAULT 0 NOT NULL,
  modalidade text DEFAULT 'ead'::text NOT NULL,
  modalidade_presencial_horas numeric DEFAULT 0 NOT NULL,
  instrutor_nome text,
  instrutor_habilitacao text
);
GRANT DELETE ON TABLE public.courses TO anon;
GRANT INSERT ON TABLE public.courses TO anon;
GRANT REFERENCES ON TABLE public.courses TO anon;
GRANT SELECT ON TABLE public.courses TO anon;
GRANT TRIGGER ON TABLE public.courses TO anon;
GRANT TRUNCATE ON TABLE public.courses TO anon;
GRANT UPDATE ON TABLE public.courses TO anon;
GRANT DELETE ON TABLE public.courses TO authenticated;
GRANT INSERT ON TABLE public.courses TO authenticated;
GRANT REFERENCES ON TABLE public.courses TO authenticated;
GRANT SELECT ON TABLE public.courses TO authenticated;
GRANT TRIGGER ON TABLE public.courses TO authenticated;
GRANT TRUNCATE ON TABLE public.courses TO authenticated;
GRANT UPDATE ON TABLE public.courses TO authenticated;
GRANT DELETE ON TABLE public.courses TO service_role;
GRANT INSERT ON TABLE public.courses TO service_role;
GRANT REFERENCES ON TABLE public.courses TO service_role;
GRANT SELECT ON TABLE public.courses TO service_role;
GRANT TRIGGER ON TABLE public.courses TO service_role;
GRANT TRUNCATE ON TABLE public.courses TO service_role;
GRANT UPDATE ON TABLE public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.empresa_membros (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text DEFAULT 'membro'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.empresa_membros TO anon;
GRANT INSERT ON TABLE public.empresa_membros TO anon;
GRANT REFERENCES ON TABLE public.empresa_membros TO anon;
GRANT SELECT ON TABLE public.empresa_membros TO anon;
GRANT TRIGGER ON TABLE public.empresa_membros TO anon;
GRANT TRUNCATE ON TABLE public.empresa_membros TO anon;
GRANT UPDATE ON TABLE public.empresa_membros TO anon;
GRANT DELETE ON TABLE public.empresa_membros TO authenticated;
GRANT INSERT ON TABLE public.empresa_membros TO authenticated;
GRANT REFERENCES ON TABLE public.empresa_membros TO authenticated;
GRANT SELECT ON TABLE public.empresa_membros TO authenticated;
GRANT TRIGGER ON TABLE public.empresa_membros TO authenticated;
GRANT TRUNCATE ON TABLE public.empresa_membros TO authenticated;
GRANT UPDATE ON TABLE public.empresa_membros TO authenticated;
GRANT DELETE ON TABLE public.empresa_membros TO service_role;
GRANT INSERT ON TABLE public.empresa_membros TO service_role;
GRANT REFERENCES ON TABLE public.empresa_membros TO service_role;
GRANT SELECT ON TABLE public.empresa_membros TO service_role;
GRANT TRIGGER ON TABLE public.empresa_membros TO service_role;
GRANT TRUNCATE ON TABLE public.empresa_membros TO service_role;
GRANT UPDATE ON TABLE public.empresa_membros TO service_role;
ALTER TABLE public.empresa_membros ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.empresas (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  razao_social text NOT NULL,
  cnpj text,
  logo_url text,
  status text DEFAULT 'ativa'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.empresas TO anon;
GRANT INSERT ON TABLE public.empresas TO anon;
GRANT REFERENCES ON TABLE public.empresas TO anon;
GRANT SELECT ON TABLE public.empresas TO anon;
GRANT TRIGGER ON TABLE public.empresas TO anon;
GRANT TRUNCATE ON TABLE public.empresas TO anon;
GRANT UPDATE ON TABLE public.empresas TO anon;
GRANT DELETE ON TABLE public.empresas TO authenticated;
GRANT INSERT ON TABLE public.empresas TO authenticated;
GRANT REFERENCES ON TABLE public.empresas TO authenticated;
GRANT SELECT ON TABLE public.empresas TO authenticated;
GRANT TRIGGER ON TABLE public.empresas TO authenticated;
GRANT TRUNCATE ON TABLE public.empresas TO authenticated;
GRANT UPDATE ON TABLE public.empresas TO authenticated;
GRANT DELETE ON TABLE public.empresas TO service_role;
GRANT INSERT ON TABLE public.empresas TO service_role;
GRANT REFERENCES ON TABLE public.empresas TO service_role;
GRANT SELECT ON TABLE public.empresas TO service_role;
GRANT TRIGGER ON TABLE public.empresas TO service_role;
GRANT TRUNCATE ON TABLE public.empresas TO service_role;
GRANT UPDATE ON TABLE public.empresas TO service_role;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.enrollments (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  status enrollment_status DEFAULT 'ativo'::enrollment_status NOT NULL,
  due_date date,
  enrolled_at timestamp with time zone DEFAULT now() NOT NULL,
  bloqueado_acesso boolean DEFAULT false NOT NULL
);
GRANT DELETE ON TABLE public.enrollments TO anon;
GRANT INSERT ON TABLE public.enrollments TO anon;
GRANT REFERENCES ON TABLE public.enrollments TO anon;
GRANT SELECT ON TABLE public.enrollments TO anon;
GRANT TRIGGER ON TABLE public.enrollments TO anon;
GRANT TRUNCATE ON TABLE public.enrollments TO anon;
GRANT UPDATE ON TABLE public.enrollments TO anon;
GRANT DELETE ON TABLE public.enrollments TO authenticated;
GRANT INSERT ON TABLE public.enrollments TO authenticated;
GRANT REFERENCES ON TABLE public.enrollments TO authenticated;
GRANT SELECT ON TABLE public.enrollments TO authenticated;
GRANT TRIGGER ON TABLE public.enrollments TO authenticated;
GRANT TRUNCATE ON TABLE public.enrollments TO authenticated;
GRANT UPDATE ON TABLE public.enrollments TO authenticated;
GRANT DELETE ON TABLE public.enrollments TO service_role;
GRANT INSERT ON TABLE public.enrollments TO service_role;
GRANT REFERENCES ON TABLE public.enrollments TO service_role;
GRANT SELECT ON TABLE public.enrollments TO service_role;
GRANT TRIGGER ON TABLE public.enrollments TO service_role;
GRANT TRUNCATE ON TABLE public.enrollments TO service_role;
GRANT UPDATE ON TABLE public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.epi_entregas (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  epi_id uuid NOT NULL,
  user_id uuid NOT NULL,
  quantidade integer DEFAULT 1 NOT NULL,
  data_entrega date DEFAULT CURRENT_DATE NOT NULL,
  assinatura_token text DEFAULT (gen_random_uuid())::text,
  assinado_em timestamp with time zone,
  devolvido boolean DEFAULT false,
  data_devolucao date,
  enrollment_id uuid,
  observacoes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.epi_entregas TO anon;
GRANT INSERT ON TABLE public.epi_entregas TO anon;
GRANT REFERENCES ON TABLE public.epi_entregas TO anon;
GRANT SELECT ON TABLE public.epi_entregas TO anon;
GRANT TRIGGER ON TABLE public.epi_entregas TO anon;
GRANT TRUNCATE ON TABLE public.epi_entregas TO anon;
GRANT UPDATE ON TABLE public.epi_entregas TO anon;
GRANT DELETE ON TABLE public.epi_entregas TO authenticated;
GRANT INSERT ON TABLE public.epi_entregas TO authenticated;
GRANT REFERENCES ON TABLE public.epi_entregas TO authenticated;
GRANT SELECT ON TABLE public.epi_entregas TO authenticated;
GRANT TRIGGER ON TABLE public.epi_entregas TO authenticated;
GRANT TRUNCATE ON TABLE public.epi_entregas TO authenticated;
GRANT UPDATE ON TABLE public.epi_entregas TO authenticated;
GRANT DELETE ON TABLE public.epi_entregas TO service_role;
GRANT INSERT ON TABLE public.epi_entregas TO service_role;
GRANT REFERENCES ON TABLE public.epi_entregas TO service_role;
GRANT SELECT ON TABLE public.epi_entregas TO service_role;
GRANT TRIGGER ON TABLE public.epi_entregas TO service_role;
GRANT TRUNCATE ON TABLE public.epi_entregas TO service_role;
GRANT UPDATE ON TABLE public.epi_entregas TO service_role;
ALTER TABLE public.epi_entregas ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.epis (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  nome text NOT NULL,
  descricao text,
  ca_numero text,
  ca_validade date,
  tipo text DEFAULT 'protecao_corpo'::text NOT NULL,
  ativo boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.epis TO anon;
GRANT INSERT ON TABLE public.epis TO anon;
GRANT REFERENCES ON TABLE public.epis TO anon;
GRANT SELECT ON TABLE public.epis TO anon;
GRANT TRIGGER ON TABLE public.epis TO anon;
GRANT TRUNCATE ON TABLE public.epis TO anon;
GRANT UPDATE ON TABLE public.epis TO anon;
GRANT DELETE ON TABLE public.epis TO authenticated;
GRANT INSERT ON TABLE public.epis TO authenticated;
GRANT REFERENCES ON TABLE public.epis TO authenticated;
GRANT SELECT ON TABLE public.epis TO authenticated;
GRANT TRIGGER ON TABLE public.epis TO authenticated;
GRANT TRUNCATE ON TABLE public.epis TO authenticated;
GRANT UPDATE ON TABLE public.epis TO authenticated;
GRANT DELETE ON TABLE public.epis TO service_role;
GRANT INSERT ON TABLE public.epis TO service_role;
GRANT REFERENCES ON TABLE public.epis TO service_role;
GRANT SELECT ON TABLE public.epis TO service_role;
GRANT TRIGGER ON TABLE public.epis TO service_role;
GRANT TRUNCATE ON TABLE public.epis TO service_role;
GRANT UPDATE ON TABLE public.epis TO service_role;
ALTER TABLE public.epis ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.esocial_queue (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  evento text NOT NULL,
  status text DEFAULT 'pendente'::text NOT NULL,
  user_id uuid,
  enrollment_id uuid,
  aso_id uuid,
  payload_json jsonb,
  xml_gerado text,
  protocolo text,
  resposta_gov text,
  erro_msg text,
  prazo_envio date,
  enviado_em timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.esocial_queue TO anon;
GRANT INSERT ON TABLE public.esocial_queue TO anon;
GRANT REFERENCES ON TABLE public.esocial_queue TO anon;
GRANT SELECT ON TABLE public.esocial_queue TO anon;
GRANT TRIGGER ON TABLE public.esocial_queue TO anon;
GRANT TRUNCATE ON TABLE public.esocial_queue TO anon;
GRANT UPDATE ON TABLE public.esocial_queue TO anon;
GRANT DELETE ON TABLE public.esocial_queue TO authenticated;
GRANT INSERT ON TABLE public.esocial_queue TO authenticated;
GRANT REFERENCES ON TABLE public.esocial_queue TO authenticated;
GRANT SELECT ON TABLE public.esocial_queue TO authenticated;
GRANT TRIGGER ON TABLE public.esocial_queue TO authenticated;
GRANT TRUNCATE ON TABLE public.esocial_queue TO authenticated;
GRANT UPDATE ON TABLE public.esocial_queue TO authenticated;
GRANT DELETE ON TABLE public.esocial_queue TO service_role;
GRANT INSERT ON TABLE public.esocial_queue TO service_role;
GRANT REFERENCES ON TABLE public.esocial_queue TO service_role;
GRANT SELECT ON TABLE public.esocial_queue TO service_role;
GRANT TRIGGER ON TABLE public.esocial_queue TO service_role;
GRANT TRUNCATE ON TABLE public.esocial_queue TO service_role;
GRANT UPDATE ON TABLE public.esocial_queue TO service_role;
ALTER TABLE public.esocial_queue ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.file_lessons (
  lesson_id uuid NOT NULL,
  storage_path text NOT NULL,
  mime_type text
);
GRANT DELETE ON TABLE public.file_lessons TO anon;
GRANT INSERT ON TABLE public.file_lessons TO anon;
GRANT REFERENCES ON TABLE public.file_lessons TO anon;
GRANT SELECT ON TABLE public.file_lessons TO anon;
GRANT TRIGGER ON TABLE public.file_lessons TO anon;
GRANT TRUNCATE ON TABLE public.file_lessons TO anon;
GRANT UPDATE ON TABLE public.file_lessons TO anon;
GRANT DELETE ON TABLE public.file_lessons TO authenticated;
GRANT INSERT ON TABLE public.file_lessons TO authenticated;
GRANT REFERENCES ON TABLE public.file_lessons TO authenticated;
GRANT SELECT ON TABLE public.file_lessons TO authenticated;
GRANT TRIGGER ON TABLE public.file_lessons TO authenticated;
GRANT TRUNCATE ON TABLE public.file_lessons TO authenticated;
GRANT UPDATE ON TABLE public.file_lessons TO authenticated;
GRANT DELETE ON TABLE public.file_lessons TO service_role;
GRANT INSERT ON TABLE public.file_lessons TO service_role;
GRANT REFERENCES ON TABLE public.file_lessons TO service_role;
GRANT SELECT ON TABLE public.file_lessons TO service_role;
GRANT TRIGGER ON TABLE public.file_lessons TO service_role;
GRANT TRUNCATE ON TABLE public.file_lessons TO service_role;
GRANT UPDATE ON TABLE public.file_lessons TO service_role;
ALTER TABLE public.file_lessons ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.invitations (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  token text DEFAULT encode(extensions.gen_random_bytes(24), 'hex'::text) NOT NULL,
  email text NOT NULL,
  nome text DEFAULT ''::text NOT NULL,
  role app_role DEFAULT 'gestor'::app_role NOT NULL,
  invited_by uuid,
  expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval) NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.invitations TO anon;
GRANT INSERT ON TABLE public.invitations TO anon;
GRANT REFERENCES ON TABLE public.invitations TO anon;
GRANT SELECT ON TABLE public.invitations TO anon;
GRANT TRIGGER ON TABLE public.invitations TO anon;
GRANT TRUNCATE ON TABLE public.invitations TO anon;
GRANT UPDATE ON TABLE public.invitations TO anon;
GRANT DELETE ON TABLE public.invitations TO authenticated;
GRANT INSERT ON TABLE public.invitations TO authenticated;
GRANT REFERENCES ON TABLE public.invitations TO authenticated;
GRANT SELECT ON TABLE public.invitations TO authenticated;
GRANT TRIGGER ON TABLE public.invitations TO authenticated;
GRANT TRUNCATE ON TABLE public.invitations TO authenticated;
GRANT UPDATE ON TABLE public.invitations TO authenticated;
GRANT DELETE ON TABLE public.invitations TO service_role;
GRANT INSERT ON TABLE public.invitations TO service_role;
GRANT REFERENCES ON TABLE public.invitations TO service_role;
GRANT SELECT ON TABLE public.invitations TO service_role;
GRANT TRIGGER ON TABLE public.invitations TO service_role;
GRANT TRUNCATE ON TABLE public.invitations TO service_role;
GRANT UPDATE ON TABLE public.invitations TO service_role;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.job_roles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  nome text NOT NULL,
  descricao text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.job_roles TO anon;
GRANT INSERT ON TABLE public.job_roles TO anon;
GRANT REFERENCES ON TABLE public.job_roles TO anon;
GRANT SELECT ON TABLE public.job_roles TO anon;
GRANT TRIGGER ON TABLE public.job_roles TO anon;
GRANT TRUNCATE ON TABLE public.job_roles TO anon;
GRANT UPDATE ON TABLE public.job_roles TO anon;
GRANT DELETE ON TABLE public.job_roles TO authenticated;
GRANT INSERT ON TABLE public.job_roles TO authenticated;
GRANT REFERENCES ON TABLE public.job_roles TO authenticated;
GRANT SELECT ON TABLE public.job_roles TO authenticated;
GRANT TRIGGER ON TABLE public.job_roles TO authenticated;
GRANT TRUNCATE ON TABLE public.job_roles TO authenticated;
GRANT UPDATE ON TABLE public.job_roles TO authenticated;
GRANT DELETE ON TABLE public.job_roles TO service_role;
GRANT INSERT ON TABLE public.job_roles TO service_role;
GRANT REFERENCES ON TABLE public.job_roles TO service_role;
GRANT SELECT ON TABLE public.job_roles TO service_role;
GRANT TRIGGER ON TABLE public.job_roles TO service_role;
GRANT TRUNCATE ON TABLE public.job_roles TO service_role;
GRANT UPDATE ON TABLE public.job_roles TO service_role;
ALTER TABLE public.job_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.lesson_progress (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  enrollment_id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  concluida boolean DEFAULT false NOT NULL,
  watch_pct numeric DEFAULT 0 NOT NULL,
  completed_at timestamp with time zone
);
GRANT DELETE ON TABLE public.lesson_progress TO anon;
GRANT INSERT ON TABLE public.lesson_progress TO anon;
GRANT REFERENCES ON TABLE public.lesson_progress TO anon;
GRANT SELECT ON TABLE public.lesson_progress TO anon;
GRANT TRIGGER ON TABLE public.lesson_progress TO anon;
GRANT TRUNCATE ON TABLE public.lesson_progress TO anon;
GRANT UPDATE ON TABLE public.lesson_progress TO anon;
GRANT DELETE ON TABLE public.lesson_progress TO authenticated;
GRANT INSERT ON TABLE public.lesson_progress TO authenticated;
GRANT REFERENCES ON TABLE public.lesson_progress TO authenticated;
GRANT SELECT ON TABLE public.lesson_progress TO authenticated;
GRANT TRIGGER ON TABLE public.lesson_progress TO authenticated;
GRANT TRUNCATE ON TABLE public.lesson_progress TO authenticated;
GRANT UPDATE ON TABLE public.lesson_progress TO authenticated;
GRANT DELETE ON TABLE public.lesson_progress TO service_role;
GRANT INSERT ON TABLE public.lesson_progress TO service_role;
GRANT REFERENCES ON TABLE public.lesson_progress TO service_role;
GRANT SELECT ON TABLE public.lesson_progress TO service_role;
GRANT TRIGGER ON TABLE public.lesson_progress TO service_role;
GRANT TRUNCATE ON TABLE public.lesson_progress TO service_role;
GRANT UPDATE ON TABLE public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.lessons (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  module_id uuid NOT NULL,
  titulo text NOT NULL,
  tipo lesson_type NOT NULL,
  ordem integer DEFAULT 0 NOT NULL,
  obrigatoria boolean DEFAULT true NOT NULL
);
GRANT DELETE ON TABLE public.lessons TO anon;
GRANT INSERT ON TABLE public.lessons TO anon;
GRANT REFERENCES ON TABLE public.lessons TO anon;
GRANT SELECT ON TABLE public.lessons TO anon;
GRANT TRIGGER ON TABLE public.lessons TO anon;
GRANT TRUNCATE ON TABLE public.lessons TO anon;
GRANT UPDATE ON TABLE public.lessons TO anon;
GRANT DELETE ON TABLE public.lessons TO authenticated;
GRANT INSERT ON TABLE public.lessons TO authenticated;
GRANT REFERENCES ON TABLE public.lessons TO authenticated;
GRANT SELECT ON TABLE public.lessons TO authenticated;
GRANT TRIGGER ON TABLE public.lessons TO authenticated;
GRANT TRUNCATE ON TABLE public.lessons TO authenticated;
GRANT UPDATE ON TABLE public.lessons TO authenticated;
GRANT DELETE ON TABLE public.lessons TO service_role;
GRANT INSERT ON TABLE public.lessons TO service_role;
GRANT REFERENCES ON TABLE public.lessons TO service_role;
GRANT SELECT ON TABLE public.lessons TO service_role;
GRANT TRIGGER ON TABLE public.lessons TO service_role;
GRANT TRUNCATE ON TABLE public.lessons TO service_role;
GRANT UPDATE ON TABLE public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.link_lessons (
  lesson_id uuid NOT NULL,
  url text NOT NULL
);
GRANT DELETE ON TABLE public.link_lessons TO anon;
GRANT INSERT ON TABLE public.link_lessons TO anon;
GRANT REFERENCES ON TABLE public.link_lessons TO anon;
GRANT SELECT ON TABLE public.link_lessons TO anon;
GRANT TRIGGER ON TABLE public.link_lessons TO anon;
GRANT TRUNCATE ON TABLE public.link_lessons TO anon;
GRANT UPDATE ON TABLE public.link_lessons TO anon;
GRANT DELETE ON TABLE public.link_lessons TO authenticated;
GRANT INSERT ON TABLE public.link_lessons TO authenticated;
GRANT REFERENCES ON TABLE public.link_lessons TO authenticated;
GRANT SELECT ON TABLE public.link_lessons TO authenticated;
GRANT TRIGGER ON TABLE public.link_lessons TO authenticated;
GRANT TRUNCATE ON TABLE public.link_lessons TO authenticated;
GRANT UPDATE ON TABLE public.link_lessons TO authenticated;
GRANT DELETE ON TABLE public.link_lessons TO service_role;
GRANT INSERT ON TABLE public.link_lessons TO service_role;
GRANT REFERENCES ON TABLE public.link_lessons TO service_role;
GRANT SELECT ON TABLE public.link_lessons TO service_role;
GRANT TRIGGER ON TABLE public.link_lessons TO service_role;
GRANT TRUNCATE ON TABLE public.link_lessons TO service_role;
GRANT UPDATE ON TABLE public.link_lessons TO service_role;
ALTER TABLE public.link_lessons ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.modules (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  course_id uuid NOT NULL,
  titulo text NOT NULL,
  ordem integer DEFAULT 0 NOT NULL
);
GRANT DELETE ON TABLE public.modules TO anon;
GRANT INSERT ON TABLE public.modules TO anon;
GRANT REFERENCES ON TABLE public.modules TO anon;
GRANT SELECT ON TABLE public.modules TO anon;
GRANT TRIGGER ON TABLE public.modules TO anon;
GRANT TRUNCATE ON TABLE public.modules TO anon;
GRANT UPDATE ON TABLE public.modules TO anon;
GRANT DELETE ON TABLE public.modules TO authenticated;
GRANT INSERT ON TABLE public.modules TO authenticated;
GRANT REFERENCES ON TABLE public.modules TO authenticated;
GRANT SELECT ON TABLE public.modules TO authenticated;
GRANT TRIGGER ON TABLE public.modules TO authenticated;
GRANT TRUNCATE ON TABLE public.modules TO authenticated;
GRANT UPDATE ON TABLE public.modules TO authenticated;
GRANT DELETE ON TABLE public.modules TO service_role;
GRANT INSERT ON TABLE public.modules TO service_role;
GRANT REFERENCES ON TABLE public.modules TO service_role;
GRANT SELECT ON TABLE public.modules TO service_role;
GRANT TRIGGER ON TABLE public.modules TO service_role;
GRANT TRUNCATE ON TABLE public.modules TO service_role;
GRANT UPDATE ON TABLE public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid,
  canal text DEFAULT 'email'::text NOT NULL,
  template text NOT NULL,
  payload_json jsonb,
  sent_at timestamp with time zone,
  status text DEFAULT 'pending'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  course_id uuid,
  lida boolean DEFAULT false NOT NULL
);
GRANT DELETE ON TABLE public.notifications TO anon;
GRANT INSERT ON TABLE public.notifications TO anon;
GRANT REFERENCES ON TABLE public.notifications TO anon;
GRANT SELECT ON TABLE public.notifications TO anon;
GRANT TRIGGER ON TABLE public.notifications TO anon;
GRANT TRUNCATE ON TABLE public.notifications TO anon;
GRANT UPDATE ON TABLE public.notifications TO anon;
GRANT DELETE ON TABLE public.notifications TO authenticated;
GRANT INSERT ON TABLE public.notifications TO authenticated;
GRANT REFERENCES ON TABLE public.notifications TO authenticated;
GRANT SELECT ON TABLE public.notifications TO authenticated;
GRANT TRIGGER ON TABLE public.notifications TO authenticated;
GRANT TRUNCATE ON TABLE public.notifications TO authenticated;
GRANT UPDATE ON TABLE public.notifications TO authenticated;
GRANT DELETE ON TABLE public.notifications TO service_role;
GRANT INSERT ON TABLE public.notifications TO service_role;
GRANT REFERENCES ON TABLE public.notifications TO service_role;
GRANT SELECT ON TABLE public.notifications TO service_role;
GRANT TRIGGER ON TABLE public.notifications TO service_role;
GRANT TRUNCATE ON TABLE public.notifications TO service_role;
GRANT UPDATE ON TABLE public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.nrs_catalog (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  numero text NOT NULL,
  titulo text NOT NULL,
  descricao text NOT NULL,
  objetivo text,
  horas_minimas numeric DEFAULT 0 NOT NULL,
  periodicidade_meses integer DEFAULT 0 NOT NULL,
  aplica_todos boolean DEFAULT false NOT NULL,
  setores text[] DEFAULT '{}'::text[] NOT NULL,
  conteudo_resumo text,
  vigente boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  conteudo_programatico text,
  requisitos text,
  publico_alvo text,
  base_legal text,
  ementa_padrao text
);
GRANT DELETE ON TABLE public.nrs_catalog TO anon;
GRANT INSERT ON TABLE public.nrs_catalog TO anon;
GRANT REFERENCES ON TABLE public.nrs_catalog TO anon;
GRANT SELECT ON TABLE public.nrs_catalog TO anon;
GRANT TRIGGER ON TABLE public.nrs_catalog TO anon;
GRANT TRUNCATE ON TABLE public.nrs_catalog TO anon;
GRANT UPDATE ON TABLE public.nrs_catalog TO anon;
GRANT DELETE ON TABLE public.nrs_catalog TO authenticated;
GRANT INSERT ON TABLE public.nrs_catalog TO authenticated;
GRANT REFERENCES ON TABLE public.nrs_catalog TO authenticated;
GRANT SELECT ON TABLE public.nrs_catalog TO authenticated;
GRANT TRIGGER ON TABLE public.nrs_catalog TO authenticated;
GRANT TRUNCATE ON TABLE public.nrs_catalog TO authenticated;
GRANT UPDATE ON TABLE public.nrs_catalog TO authenticated;
GRANT DELETE ON TABLE public.nrs_catalog TO service_role;
GRANT INSERT ON TABLE public.nrs_catalog TO service_role;
GRANT REFERENCES ON TABLE public.nrs_catalog TO service_role;
GRANT SELECT ON TABLE public.nrs_catalog TO service_role;
GRANT TRIGGER ON TABLE public.nrs_catalog TO service_role;
GRANT TRUNCATE ON TABLE public.nrs_catalog TO service_role;
GRANT UPDATE ON TABLE public.nrs_catalog TO service_role;
ALTER TABLE public.nrs_catalog ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.panda_lessons (
  lesson_id uuid NOT NULL,
  panda_video_id text NOT NULL,
  duracao_seg integer,
  thumbnail_url text
);
GRANT DELETE ON TABLE public.panda_lessons TO anon;
GRANT INSERT ON TABLE public.panda_lessons TO anon;
GRANT REFERENCES ON TABLE public.panda_lessons TO anon;
GRANT SELECT ON TABLE public.panda_lessons TO anon;
GRANT TRIGGER ON TABLE public.panda_lessons TO anon;
GRANT TRUNCATE ON TABLE public.panda_lessons TO anon;
GRANT UPDATE ON TABLE public.panda_lessons TO anon;
GRANT DELETE ON TABLE public.panda_lessons TO authenticated;
GRANT INSERT ON TABLE public.panda_lessons TO authenticated;
GRANT REFERENCES ON TABLE public.panda_lessons TO authenticated;
GRANT SELECT ON TABLE public.panda_lessons TO authenticated;
GRANT TRIGGER ON TABLE public.panda_lessons TO authenticated;
GRANT TRUNCATE ON TABLE public.panda_lessons TO authenticated;
GRANT UPDATE ON TABLE public.panda_lessons TO authenticated;
GRANT DELETE ON TABLE public.panda_lessons TO service_role;
GRANT INSERT ON TABLE public.panda_lessons TO service_role;
GRANT REFERENCES ON TABLE public.panda_lessons TO service_role;
GRANT SELECT ON TABLE public.panda_lessons TO service_role;
GRANT TRIGGER ON TABLE public.panda_lessons TO service_role;
GRANT TRUNCATE ON TABLE public.panda_lessons TO service_role;
GRANT UPDATE ON TABLE public.panda_lessons TO service_role;
ALTER TABLE public.panda_lessons ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.path_requirements (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  job_role_id uuid NOT NULL,
  course_id uuid NOT NULL,
  ordem smallint DEFAULT 0 NOT NULL,
  prerequisite_course_id uuid,
  obrigatorio boolean DEFAULT true NOT NULL
);
GRANT DELETE ON TABLE public.path_requirements TO anon;
GRANT INSERT ON TABLE public.path_requirements TO anon;
GRANT REFERENCES ON TABLE public.path_requirements TO anon;
GRANT SELECT ON TABLE public.path_requirements TO anon;
GRANT TRIGGER ON TABLE public.path_requirements TO anon;
GRANT TRUNCATE ON TABLE public.path_requirements TO anon;
GRANT UPDATE ON TABLE public.path_requirements TO anon;
GRANT DELETE ON TABLE public.path_requirements TO authenticated;
GRANT INSERT ON TABLE public.path_requirements TO authenticated;
GRANT REFERENCES ON TABLE public.path_requirements TO authenticated;
GRANT SELECT ON TABLE public.path_requirements TO authenticated;
GRANT TRIGGER ON TABLE public.path_requirements TO authenticated;
GRANT TRUNCATE ON TABLE public.path_requirements TO authenticated;
GRANT UPDATE ON TABLE public.path_requirements TO authenticated;
GRANT DELETE ON TABLE public.path_requirements TO service_role;
GRANT INSERT ON TABLE public.path_requirements TO service_role;
GRANT REFERENCES ON TABLE public.path_requirements TO service_role;
GRANT SELECT ON TABLE public.path_requirements TO service_role;
GRANT TRIGGER ON TABLE public.path_requirements TO service_role;
GRANT TRUNCATE ON TABLE public.path_requirements TO service_role;
GRANT UPDATE ON TABLE public.path_requirements TO service_role;
ALTER TABLE public.path_requirements ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  nome text DEFAULT ''::text NOT NULL,
  email text DEFAULT ''::text NOT NULL,
  cpf text,
  avatar_url text,
  ativo boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  cargo text,
  setor text,
  matricula_empresa text,
  job_role_id uuid,
  telefone text,
  empresa_id uuid
);
GRANT DELETE ON TABLE public.profiles TO anon;
GRANT INSERT ON TABLE public.profiles TO anon;
GRANT REFERENCES ON TABLE public.profiles TO anon;
GRANT SELECT ON TABLE public.profiles TO anon;
GRANT TRIGGER ON TABLE public.profiles TO anon;
GRANT TRUNCATE ON TABLE public.profiles TO anon;
GRANT UPDATE ON TABLE public.profiles TO anon;
GRANT DELETE ON TABLE public.profiles TO authenticated;
GRANT INSERT ON TABLE public.profiles TO authenticated;
GRANT REFERENCES ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT TRIGGER ON TABLE public.profiles TO authenticated;
GRANT TRUNCATE ON TABLE public.profiles TO authenticated;
GRANT UPDATE ON TABLE public.profiles TO authenticated;
GRANT DELETE ON TABLE public.profiles TO service_role;
GRANT INSERT ON TABLE public.profiles TO service_role;
GRANT REFERENCES ON TABLE public.profiles TO service_role;
GRANT SELECT ON TABLE public.profiles TO service_role;
GRANT TRIGGER ON TABLE public.profiles TO service_role;
GRANT TRUNCATE ON TABLE public.profiles TO service_role;
GRANT UPDATE ON TABLE public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.pt_apr (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  tipo text DEFAULT 'PT'::text NOT NULL,
  nr_ref text,
  titulo text NOT NULL,
  solicitante_id uuid,
  local_trabalho text,
  descricao_atividade text,
  riscos_identificados text,
  medidas_controle text,
  status text DEFAULT 'aberto'::text NOT NULL,
  bloqueado_vencimento boolean DEFAULT false,
  data_inicio date,
  data_fim date,
  assinaturas jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.pt_apr TO anon;
GRANT INSERT ON TABLE public.pt_apr TO anon;
GRANT REFERENCES ON TABLE public.pt_apr TO anon;
GRANT SELECT ON TABLE public.pt_apr TO anon;
GRANT TRIGGER ON TABLE public.pt_apr TO anon;
GRANT TRUNCATE ON TABLE public.pt_apr TO anon;
GRANT UPDATE ON TABLE public.pt_apr TO anon;
GRANT DELETE ON TABLE public.pt_apr TO authenticated;
GRANT INSERT ON TABLE public.pt_apr TO authenticated;
GRANT REFERENCES ON TABLE public.pt_apr TO authenticated;
GRANT SELECT ON TABLE public.pt_apr TO authenticated;
GRANT TRIGGER ON TABLE public.pt_apr TO authenticated;
GRANT TRUNCATE ON TABLE public.pt_apr TO authenticated;
GRANT UPDATE ON TABLE public.pt_apr TO authenticated;
GRANT DELETE ON TABLE public.pt_apr TO service_role;
GRANT INSERT ON TABLE public.pt_apr TO service_role;
GRANT REFERENCES ON TABLE public.pt_apr TO service_role;
GRANT SELECT ON TABLE public.pt_apr TO service_role;
GRANT TRIGGER ON TABLE public.pt_apr TO service_role;
GRANT TRUNCATE ON TABLE public.pt_apr TO service_role;
GRANT UPDATE ON TABLE public.pt_apr TO service_role;
ALTER TABLE public.pt_apr ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.questions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  course_id uuid NOT NULL,
  enunciado text NOT NULL,
  nivel question_level DEFAULT 'medio'::question_level NOT NULL,
  ativo boolean DEFAULT true NOT NULL
);
GRANT DELETE ON TABLE public.questions TO anon;
GRANT INSERT ON TABLE public.questions TO anon;
GRANT REFERENCES ON TABLE public.questions TO anon;
GRANT SELECT ON TABLE public.questions TO anon;
GRANT TRIGGER ON TABLE public.questions TO anon;
GRANT TRUNCATE ON TABLE public.questions TO anon;
GRANT UPDATE ON TABLE public.questions TO anon;
GRANT DELETE ON TABLE public.questions TO authenticated;
GRANT INSERT ON TABLE public.questions TO authenticated;
GRANT REFERENCES ON TABLE public.questions TO authenticated;
GRANT SELECT ON TABLE public.questions TO authenticated;
GRANT TRIGGER ON TABLE public.questions TO authenticated;
GRANT TRUNCATE ON TABLE public.questions TO authenticated;
GRANT UPDATE ON TABLE public.questions TO authenticated;
GRANT DELETE ON TABLE public.questions TO service_role;
GRANT INSERT ON TABLE public.questions TO service_role;
GRANT REFERENCES ON TABLE public.questions TO service_role;
GRANT SELECT ON TABLE public.questions TO service_role;
GRANT TRIGGER ON TABLE public.questions TO service_role;
GRANT TRUNCATE ON TABLE public.questions TO service_role;
GRANT UPDATE ON TABLE public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.rich_lessons (
  lesson_id uuid NOT NULL,
  conteudo_html text DEFAULT ''::text NOT NULL
);
GRANT DELETE ON TABLE public.rich_lessons TO anon;
GRANT INSERT ON TABLE public.rich_lessons TO anon;
GRANT REFERENCES ON TABLE public.rich_lessons TO anon;
GRANT SELECT ON TABLE public.rich_lessons TO anon;
GRANT TRIGGER ON TABLE public.rich_lessons TO anon;
GRANT TRUNCATE ON TABLE public.rich_lessons TO anon;
GRANT UPDATE ON TABLE public.rich_lessons TO anon;
GRANT DELETE ON TABLE public.rich_lessons TO authenticated;
GRANT INSERT ON TABLE public.rich_lessons TO authenticated;
GRANT REFERENCES ON TABLE public.rich_lessons TO authenticated;
GRANT SELECT ON TABLE public.rich_lessons TO authenticated;
GRANT TRIGGER ON TABLE public.rich_lessons TO authenticated;
GRANT TRUNCATE ON TABLE public.rich_lessons TO authenticated;
GRANT UPDATE ON TABLE public.rich_lessons TO authenticated;
GRANT DELETE ON TABLE public.rich_lessons TO service_role;
GRANT INSERT ON TABLE public.rich_lessons TO service_role;
GRANT REFERENCES ON TABLE public.rich_lessons TO service_role;
GRANT SELECT ON TABLE public.rich_lessons TO service_role;
GRANT TRIGGER ON TABLE public.rich_lessons TO service_role;
GRANT TRUNCATE ON TABLE public.rich_lessons TO service_role;
GRANT UPDATE ON TABLE public.rich_lessons TO service_role;
ALTER TABLE public.rich_lessons ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.riscos_psicossociais (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  setor text NOT NULL,
  descricao text NOT NULL,
  fator text NOT NULL,
  probabilidade text DEFAULT 'media'::text NOT NULL,
  severidade text DEFAULT 'media'::text NOT NULL,
  medidas_controle text,
  responsavel text,
  prazo date,
  status text DEFAULT 'identificado'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.riscos_psicossociais TO anon;
GRANT INSERT ON TABLE public.riscos_psicossociais TO anon;
GRANT REFERENCES ON TABLE public.riscos_psicossociais TO anon;
GRANT SELECT ON TABLE public.riscos_psicossociais TO anon;
GRANT TRIGGER ON TABLE public.riscos_psicossociais TO anon;
GRANT TRUNCATE ON TABLE public.riscos_psicossociais TO anon;
GRANT UPDATE ON TABLE public.riscos_psicossociais TO anon;
GRANT DELETE ON TABLE public.riscos_psicossociais TO authenticated;
GRANT INSERT ON TABLE public.riscos_psicossociais TO authenticated;
GRANT REFERENCES ON TABLE public.riscos_psicossociais TO authenticated;
GRANT SELECT ON TABLE public.riscos_psicossociais TO authenticated;
GRANT TRIGGER ON TABLE public.riscos_psicossociais TO authenticated;
GRANT TRUNCATE ON TABLE public.riscos_psicossociais TO authenticated;
GRANT UPDATE ON TABLE public.riscos_psicossociais TO authenticated;
GRANT DELETE ON TABLE public.riscos_psicossociais TO service_role;
GRANT INSERT ON TABLE public.riscos_psicossociais TO service_role;
GRANT REFERENCES ON TABLE public.riscos_psicossociais TO service_role;
GRANT SELECT ON TABLE public.riscos_psicossociais TO service_role;
GRANT TRIGGER ON TABLE public.riscos_psicossociais TO service_role;
GRANT TRUNCATE ON TABLE public.riscos_psicossociais TO service_role;
GRANT UPDATE ON TABLE public.riscos_psicossociais TO service_role;
ALTER TABLE public.riscos_psicossociais ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.sst_documentos (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  tipo text NOT NULL,
  nome text NOT NULL,
  versao text,
  arquivo_url text,
  validade date,
  responsavel_nome text,
  responsavel_crea text,
  vigente boolean DEFAULT true NOT NULL,
  observacoes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.sst_documentos TO anon;
GRANT INSERT ON TABLE public.sst_documentos TO anon;
GRANT REFERENCES ON TABLE public.sst_documentos TO anon;
GRANT SELECT ON TABLE public.sst_documentos TO anon;
GRANT TRIGGER ON TABLE public.sst_documentos TO anon;
GRANT TRUNCATE ON TABLE public.sst_documentos TO anon;
GRANT UPDATE ON TABLE public.sst_documentos TO anon;
GRANT DELETE ON TABLE public.sst_documentos TO authenticated;
GRANT INSERT ON TABLE public.sst_documentos TO authenticated;
GRANT REFERENCES ON TABLE public.sst_documentos TO authenticated;
GRANT SELECT ON TABLE public.sst_documentos TO authenticated;
GRANT TRIGGER ON TABLE public.sst_documentos TO authenticated;
GRANT TRUNCATE ON TABLE public.sst_documentos TO authenticated;
GRANT UPDATE ON TABLE public.sst_documentos TO authenticated;
GRANT DELETE ON TABLE public.sst_documentos TO service_role;
GRANT INSERT ON TABLE public.sst_documentos TO service_role;
GRANT REFERENCES ON TABLE public.sst_documentos TO service_role;
GRANT SELECT ON TABLE public.sst_documentos TO service_role;
GRANT TRIGGER ON TABLE public.sst_documentos TO service_role;
GRANT TRUNCATE ON TABLE public.sst_documentos TO service_role;
GRANT UPDATE ON TABLE public.sst_documentos TO service_role;
ALTER TABLE public.sst_documentos ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.terceiros (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  razao_social text NOT NULL,
  cnpj text,
  contato_nome text,
  contato_email text,
  contato_tel text,
  servico text,
  nrs_aplicaveis text[] DEFAULT '{}'::text[],
  status text DEFAULT 'ativo'::text NOT NULL,
  docs_ok boolean DEFAULT false,
  observacoes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.terceiros TO anon;
GRANT INSERT ON TABLE public.terceiros TO anon;
GRANT REFERENCES ON TABLE public.terceiros TO anon;
GRANT SELECT ON TABLE public.terceiros TO anon;
GRANT TRIGGER ON TABLE public.terceiros TO anon;
GRANT TRUNCATE ON TABLE public.terceiros TO anon;
GRANT UPDATE ON TABLE public.terceiros TO anon;
GRANT DELETE ON TABLE public.terceiros TO authenticated;
GRANT INSERT ON TABLE public.terceiros TO authenticated;
GRANT REFERENCES ON TABLE public.terceiros TO authenticated;
GRANT SELECT ON TABLE public.terceiros TO authenticated;
GRANT TRIGGER ON TABLE public.terceiros TO authenticated;
GRANT TRUNCATE ON TABLE public.terceiros TO authenticated;
GRANT UPDATE ON TABLE public.terceiros TO authenticated;
GRANT DELETE ON TABLE public.terceiros TO service_role;
GRANT INSERT ON TABLE public.terceiros TO service_role;
GRANT REFERENCES ON TABLE public.terceiros TO service_role;
GRANT SELECT ON TABLE public.terceiros TO service_role;
GRANT TRIGGER ON TABLE public.terceiros TO service_role;
GRANT TRUNCATE ON TABLE public.terceiros TO service_role;
GRANT UPDATE ON TABLE public.terceiros TO service_role;
ALTER TABLE public.terceiros ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
GRANT DELETE ON TABLE public.user_roles TO anon;
GRANT INSERT ON TABLE public.user_roles TO anon;
GRANT REFERENCES ON TABLE public.user_roles TO anon;
GRANT SELECT ON TABLE public.user_roles TO anon;
GRANT TRIGGER ON TABLE public.user_roles TO anon;
GRANT TRUNCATE ON TABLE public.user_roles TO anon;
GRANT UPDATE ON TABLE public.user_roles TO anon;
GRANT DELETE ON TABLE public.user_roles TO authenticated;
GRANT INSERT ON TABLE public.user_roles TO authenticated;
GRANT REFERENCES ON TABLE public.user_roles TO authenticated;
GRANT SELECT ON TABLE public.user_roles TO authenticated;
GRANT TRIGGER ON TABLE public.user_roles TO authenticated;
GRANT TRUNCATE ON TABLE public.user_roles TO authenticated;
GRANT UPDATE ON TABLE public.user_roles TO authenticated;
GRANT DELETE ON TABLE public.user_roles TO service_role;
GRANT INSERT ON TABLE public.user_roles TO service_role;
GRANT REFERENCES ON TABLE public.user_roles TO service_role;
GRANT SELECT ON TABLE public.user_roles TO service_role;
GRANT TRIGGER ON TABLE public.user_roles TO service_role;
GRANT TRUNCATE ON TABLE public.user_roles TO service_role;
GRANT UPDATE ON TABLE public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ===== 20261117014701_schema_constraints.sql =====
-- Schema-only baseline exported from live PostgreSQL catalogs on 2026-11-17 UTC.
-- For a NEW managed PostgreSQL database only; do not apply to the existing database.
-- No application rows, auth users, secret values or storage files are included.
SET search_path = public, extensions;

ALTER TABLE public.alternatives ADD CONSTRAINT alternatives_pkey PRIMARY KEY (id);

ALTER TABLE public.api_keys_registry ADD CONSTRAINT api_keys_registry_pkey PRIMARY KEY (id);

ALTER TABLE public.api_keys_registry ADD CONSTRAINT api_keys_registry_service_name_key UNIQUE (service_name);

ALTER TABLE public.asos ADD CONSTRAINT asos_pkey PRIMARY KEY (id);

ALTER TABLE public.asos ADD CONSTRAINT asos_resultado_check CHECK (resultado = ANY (ARRAY['apto'::text, 'apto_com_restricoes'::text, 'inapto'::text]));

ALTER TABLE public.asos ADD CONSTRAINT asos_tipo_check CHECK (tipo = ANY (ARRAY['admissional'::text, 'periodico'::text, 'retorno'::text, 'mudanca_funcao'::text, 'demissional'::text]));

ALTER TABLE public.attempt_answers ADD CONSTRAINT attempt_answers_pkey PRIMARY KEY (id);

ALTER TABLE public.attempts ADD CONSTRAINT attempts_pkey PRIMARY KEY (id);

ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);

ALTER TABLE public.branding ADD CONSTRAINT branding_id_check CHECK (id = 1);

ALTER TABLE public.branding ADD CONSTRAINT branding_pkey PRIMARY KEY (id);

ALTER TABLE public.cats ADD CONSTRAINT cats_pkey PRIMARY KEY (id);

ALTER TABLE public.cats ADD CONSTRAINT cats_status_esocial_check CHECK (status_esocial = ANY (ARRAY['pendente'::text, 'enviado'::text, 'erro'::text]));

ALTER TABLE public.cats ADD CONSTRAINT cats_tipo_check CHECK (tipo = ANY (ARRAY['tipico'::text, 'trajeto'::text, 'doenca_ocupacional'::text]));

ALTER TABLE public.certificates ADD CONSTRAINT certificates_numero_certificado_key UNIQUE (numero_certificado);

ALTER TABLE public.certificates ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);

ALTER TABLE public.certificates ADD CONSTRAINT certificates_qr_token_key UNIQUE (qr_token);

ALTER TABLE public.cipa_mandatos ADD CONSTRAINT cipa_mandatos_pkey PRIMARY KEY (id);

ALTER TABLE public.cipa_membros ADD CONSTRAINT cipa_membros_cargo_check CHECK (cargo = ANY (ARRAY['presidente'::text, 'vice_presidente'::text, 'secretario'::text, 'membro_efetivo'::text, 'membro_suplente'::text]));

ALTER TABLE public.cipa_membros ADD CONSTRAINT cipa_membros_mandato_id_user_id_key UNIQUE (mandato_id, user_id);

ALTER TABLE public.cipa_membros ADD CONSTRAINT cipa_membros_pkey PRIMARY KEY (id);

ALTER TABLE public.cipa_membros ADD CONSTRAINT cipa_membros_representacao_check CHECK (representacao = ANY (ARRAY['empregador'::text, 'empregado'::text]));

ALTER TABLE public.courses ADD CONSTRAINT courses_modalidade_check CHECK (modalidade = ANY (ARRAY['ead'::text, 'presencial'::text, 'hibrido'::text]));

ALTER TABLE public.courses ADD CONSTRAINT courses_pkey PRIMARY KEY (id);

ALTER TABLE public.empresa_membros ADD CONSTRAINT empresa_membros_empresa_id_user_id_key UNIQUE (empresa_id, user_id);

ALTER TABLE public.empresa_membros ADD CONSTRAINT empresa_membros_pkey PRIMARY KEY (id);

ALTER TABLE public.empresa_membros ADD CONSTRAINT empresa_membros_role_check CHECK (role = ANY (ARRAY['admin'::text, 'gestor'::text, 'membro'::text]));

ALTER TABLE public.empresas ADD CONSTRAINT empresas_pkey PRIMARY KEY (id);

ALTER TABLE public.empresas ADD CONSTRAINT empresas_status_check CHECK (status = ANY (ARRAY['ativa'::text, 'inativa'::text]));

ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);

ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_user_id_course_id_key UNIQUE (user_id, course_id);

ALTER TABLE public.epi_entregas ADD CONSTRAINT epi_entregas_assinatura_token_key UNIQUE (assinatura_token);

ALTER TABLE public.epi_entregas ADD CONSTRAINT epi_entregas_pkey PRIMARY KEY (id);

ALTER TABLE public.epis ADD CONSTRAINT epis_pkey PRIMARY KEY (id);

ALTER TABLE public.epis ADD CONSTRAINT epis_tipo_check CHECK (tipo = ANY (ARRAY['protecao_cabeca'::text, 'protecao_olhos'::text, 'protecao_auditiva'::text, 'protecao_respiratoria'::text, 'protecao_maos'::text, 'protecao_pes'::text, 'protecao_quedas'::text, 'protecao_corpo'::text, 'outro'::text]));

ALTER TABLE public.esocial_queue ADD CONSTRAINT esocial_queue_evento_check CHECK (evento = ANY (ARRAY['S-2210'::text, 'S-2220'::text, 'S-2240'::text, 'S-2245'::text]));

ALTER TABLE public.esocial_queue ADD CONSTRAINT esocial_queue_pkey PRIMARY KEY (id);

ALTER TABLE public.esocial_queue ADD CONSTRAINT esocial_queue_status_check CHECK (status = ANY (ARRAY['pendente'::text, 'processando'::text, 'enviado'::text, 'erro'::text, 'nao_aplicavel'::text]));

ALTER TABLE public.file_lessons ADD CONSTRAINT file_lessons_pkey PRIMARY KEY (lesson_id);

ALTER TABLE public.invitations ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);

ALTER TABLE public.invitations ADD CONSTRAINT invitations_token_key UNIQUE (token);

ALTER TABLE public.job_roles ADD CONSTRAINT job_roles_nome_key UNIQUE (nome);

ALTER TABLE public.job_roles ADD CONSTRAINT job_roles_pkey PRIMARY KEY (id);

ALTER TABLE public.lesson_progress ADD CONSTRAINT lesson_progress_enrollment_id_lesson_id_key UNIQUE (enrollment_id, lesson_id);

ALTER TABLE public.lesson_progress ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (id);

ALTER TABLE public.lessons ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);

ALTER TABLE public.link_lessons ADD CONSTRAINT link_lessons_pkey PRIMARY KEY (lesson_id);

ALTER TABLE public.modules ADD CONSTRAINT modules_pkey PRIMARY KEY (id);

ALTER TABLE public.notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);

ALTER TABLE public.nrs_catalog ADD CONSTRAINT nrs_catalog_numero_key UNIQUE (numero);

ALTER TABLE public.nrs_catalog ADD CONSTRAINT nrs_catalog_pkey PRIMARY KEY (id);

ALTER TABLE public.panda_lessons ADD CONSTRAINT panda_lessons_pkey PRIMARY KEY (lesson_id);

ALTER TABLE public.path_requirements ADD CONSTRAINT path_requirements_job_role_id_course_id_key UNIQUE (job_role_id, course_id);

ALTER TABLE public.path_requirements ADD CONSTRAINT path_requirements_pkey PRIMARY KEY (id);

ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

ALTER TABLE public.pt_apr ADD CONSTRAINT pt_apr_pkey PRIMARY KEY (id);

ALTER TABLE public.pt_apr ADD CONSTRAINT pt_apr_status_check CHECK (status = ANY (ARRAY['aberto'::text, 'aprovado'::text, 'encerrado'::text, 'cancelado'::text]));

ALTER TABLE public.pt_apr ADD CONSTRAINT pt_apr_tipo_check CHECK (tipo = ANY (ARRAY['PT'::text, 'APR'::text]));

ALTER TABLE public.questions ADD CONSTRAINT questions_pkey PRIMARY KEY (id);

ALTER TABLE public.rich_lessons ADD CONSTRAINT rich_lessons_pkey PRIMARY KEY (lesson_id);

ALTER TABLE public.riscos_psicossociais ADD CONSTRAINT riscos_psicossociais_fator_check CHECK (fator = ANY (ARRAY['carga_trabalho'::text, 'pressao_tempo'::text, 'conflito_papel'::text, 'falta_autonomia'::text, 'violencia_assedio'::text, 'relacionamento_interpessoal'::text, 'inseguranca_emprego'::text, 'trabalho_emocional'::text, 'jornada_excessiva'::text, 'outro'::text]));

ALTER TABLE public.riscos_psicossociais ADD CONSTRAINT riscos_psicossociais_pkey PRIMARY KEY (id);

ALTER TABLE public.riscos_psicossociais ADD CONSTRAINT riscos_psicossociais_probabilidade_check CHECK (probabilidade = ANY (ARRAY['baixa'::text, 'media'::text, 'alta'::text]));

ALTER TABLE public.riscos_psicossociais ADD CONSTRAINT riscos_psicossociais_severidade_check CHECK (severidade = ANY (ARRAY['baixa'::text, 'media'::text, 'alta'::text, 'muito_alta'::text]));

ALTER TABLE public.riscos_psicossociais ADD CONSTRAINT riscos_psicossociais_status_check CHECK (status = ANY (ARRAY['identificado'::text, 'em_tratamento'::text, 'controlado'::text, 'monitorando'::text]));

ALTER TABLE public.sst_documentos ADD CONSTRAINT sst_documentos_pkey PRIMARY KEY (id);

ALTER TABLE public.sst_documentos ADD CONSTRAINT sst_documentos_tipo_check CHECK (tipo = ANY (ARRAY['PGR'::text, 'PCMSO'::text, 'LTCAT'::text, 'PPP'::text, 'AET'::text, 'SPCT'::text, 'LIPE'::text, 'outro'::text]));

ALTER TABLE public.terceiros ADD CONSTRAINT terceiros_pkey PRIMARY KEY (id);

ALTER TABLE public.terceiros ADD CONSTRAINT terceiros_status_check CHECK (status = ANY (ARRAY['ativo'::text, 'suspenso'::text, 'encerrado'::text]));

ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);

ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);

ALTER TABLE public.alternatives ADD CONSTRAINT alternatives_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;

ALTER TABLE public.api_keys_registry ADD CONSTRAINT api_keys_registry_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.asos ADD CONSTRAINT asos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.attempt_answers ADD CONSTRAINT attempt_answers_alternative_id_fkey FOREIGN KEY (alternative_id) REFERENCES alternatives(id) ON DELETE SET NULL;

ALTER TABLE public.attempt_answers ADD CONSTRAINT attempt_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE;

ALTER TABLE public.attempt_answers ADD CONSTRAINT attempt_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;

ALTER TABLE public.attempts ADD CONSTRAINT attempts_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE;

ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.cats ADD CONSTRAINT cats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.certificates ADD CONSTRAINT certificates_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE;

ALTER TABLE public.certificates ADD CONSTRAINT certificates_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

ALTER TABLE public.certificates ADD CONSTRAINT certificates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.cipa_membros ADD CONSTRAINT cipa_membros_mandato_id_fkey FOREIGN KEY (mandato_id) REFERENCES cipa_mandatos(id) ON DELETE CASCADE;

ALTER TABLE public.cipa_membros ADD CONSTRAINT cipa_membros_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.empresa_membros ADD CONSTRAINT empresa_membros_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;

ALTER TABLE public.empresa_membros ADD CONSTRAINT empresa_membros_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.epi_entregas ADD CONSTRAINT epi_entregas_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE SET NULL;

ALTER TABLE public.epi_entregas ADD CONSTRAINT epi_entregas_epi_id_fkey FOREIGN KEY (epi_id) REFERENCES epis(id) ON DELETE CASCADE;

ALTER TABLE public.epi_entregas ADD CONSTRAINT epi_entregas_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.esocial_queue ADD CONSTRAINT esocial_queue_aso_id_fkey FOREIGN KEY (aso_id) REFERENCES asos(id) ON DELETE SET NULL;

ALTER TABLE public.esocial_queue ADD CONSTRAINT esocial_queue_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE SET NULL;

ALTER TABLE public.esocial_queue ADD CONSTRAINT esocial_queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.file_lessons ADD CONSTRAINT file_lessons_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;

ALTER TABLE public.invitations ADD CONSTRAINT invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.lesson_progress ADD CONSTRAINT lesson_progress_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE;

ALTER TABLE public.lesson_progress ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;

ALTER TABLE public.lessons ADD CONSTRAINT lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE;

ALTER TABLE public.link_lessons ADD CONSTRAINT link_lessons_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;

ALTER TABLE public.modules ADD CONSTRAINT modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.panda_lessons ADD CONSTRAINT panda_lessons_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;

ALTER TABLE public.path_requirements ADD CONSTRAINT path_requirements_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

ALTER TABLE public.path_requirements ADD CONSTRAINT path_requirements_job_role_id_fkey FOREIGN KEY (job_role_id) REFERENCES job_roles(id) ON DELETE CASCADE;

ALTER TABLE public.path_requirements ADD CONSTRAINT path_requirements_prerequisite_course_id_fkey FOREIGN KEY (prerequisite_course_id) REFERENCES courses(id);

ALTER TABLE public.profiles ADD CONSTRAINT profiles_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_job_role_id_fkey FOREIGN KEY (job_role_id) REFERENCES job_roles(id);

ALTER TABLE public.pt_apr ADD CONSTRAINT pt_apr_solicitante_id_fkey FOREIGN KEY (solicitante_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.questions ADD CONSTRAINT questions_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

ALTER TABLE public.rich_lessons ADD CONSTRAINT rich_lessons_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;

ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ===== 20261117014702_schema_functions.sql =====
-- Schema-only baseline exported from live PostgreSQL catalogs on 2026-11-17 UTC.
-- For a NEW managed PostgreSQL database only; do not apply to the existing database.
-- No application rows, auth users, secret values or storage files are included.
SET search_path = public, extensions;

CREATE OR REPLACE FUNCTION public.auto_enroll_on_role_assign()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.job_role_id IS NOT NULL AND (OLD.job_role_id IS DISTINCT FROM NEW.job_role_id) THEN
    INSERT INTO public.enrollments (user_id, course_id, due_date)
    SELECT NEW.id, pr.course_id,
      CASE WHEN c.validade_meses > 0
        THEN (CURRENT_DATE + (c.validade_meses || ' months')::interval)::date
        ELSE NULL END
    FROM path_requirements pr
    JOIN courses c ON c.id = pr.course_id
    WHERE pr.job_role_id = NEW.job_role_id AND pr.obrigatorio = true
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.bootstrap_self()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  _uid   uuid := auth.uid();
  _email text;
  _meta  jsonb;
  _role  public.app_role;
  _inv_role public.app_role;
begin
  if _uid is null then
    return;
  end if;

  select email, raw_user_meta_data into _email, _meta
    from auth.users where id = _uid;
  if _email is null then
    return;
  end if;

  insert into public.profiles (id, nome, email, cpf)
  values (_uid, coalesce(_meta->>'nome', ''), _email, _meta->>'cpf')
  on conflict (id) do nothing;

  if exists (select 1 from public.user_roles where user_id = _uid) then
    return;
  end if;

  if not exists (select 1 from public.user_roles where role = 'admin') then
    _role := 'admin';
  else
    select role into _inv_role
      from public.invitations
     where lower(email) = lower(_email)
       and used_at is null
       and expires_at > now()
     order by created_at desc
     limit 1;
    _role := coalesce(_inv_role, 'aluno');
  end if;

  insert into public.user_roles (user_id, role)
  values (_uid, _role)
  on conflict do nothing;
end
$function$;

CREATE OR REPLACE FUNCTION public.generate_cert_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.numero_certificado IS NULL THEN
    NEW.numero_certificado := 'CERT-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.cert_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_certificate(p_token text)
 RETURNS TABLE(qr_token text, emitido_at text, expires_at text, curso_titulo text, nr_codigos text[], carga_horaria_horas integer, modalidade text, aluno_nome text, aluno_cpf text, instrutor_nome text, instrutor_habilitacao text, cnpj_empresa text, numero_certificado text, pdf_hash text)
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT
    c.qr_token,
    c.emitido_at::TEXT,
    c.expires_at::TEXT,
    co.titulo,
    co.nr_codigo,
    co.carga_horaria_horas::INTEGER,
    co.modalidade,
    p.nome,
    p.cpf,
    co.instrutor_nome,
    co.instrutor_habilitacao,
    b.cnpj,
    c.numero_certificado,
    c.pdf_hash
  FROM public.certificates c
  JOIN public.courses      co ON co.id = c.course_id
  JOIN public.profiles     p  ON p.id = c.user_id
  LEFT JOIN public.branding b ON TRUE
  WHERE c.qr_token = p_token
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_minhas_empresas()
 RETURNS TABLE(id uuid, razao_social text, cnpj text, logo_url text, status text, meu_role text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT e.id, e.razao_social, e.cnpj, e.logo_url, e.status, em.role
  FROM public.empresas e
  JOIN public.empresa_membros em ON em.empresa_id = e.id
  WHERE em.user_id = auth.uid()
  ORDER BY e.razao_social;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  _role public.app_role;
  _inv_role public.app_role;
begin
  insert into public.profiles (id, nome, email, cpf)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', ''),
    new.email,
    new.raw_user_meta_data->>'cpf'
  )
  on conflict (id) do nothing;

  if not exists (select 1 from public.user_roles where role = 'admin') then
    _role := 'admin';
  else
    select role into _inv_role
      from public.invitations
     where lower(email) = lower(new.email)
       and used_at is null
       and expires_at > now()
     order by created_at desc
     limit 1;
    _role := coalesce(_inv_role, 'aluno');
  end if;

  insert into public.user_roles (user_id, role)
  values (new.id, _role)
  on conflict do nothing;

  return new;
end
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = 'admin'
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','gestor'))
$function$;

CREATE OR REPLACE FUNCTION public.notify_on_certificate()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_curso TEXT;
BEGIN
  SELECT titulo INTO v_curso FROM public.courses WHERE id = NEW.course_id;
  INSERT INTO public.notifications (user_id, template, canal, course_id, status, lida, payload_json)
  VALUES (NEW.user_id, 'certificado_emitido', 'inapp', NEW.course_id, 'sent', false,
          jsonb_build_object('curso', COALESCE(v_curso, '')));
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_on_enrollment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_curso TEXT;
BEGIN
  SELECT titulo INTO v_curso FROM public.courses WHERE id = NEW.course_id;
  INSERT INTO public.notifications (user_id, template, canal, course_id, status, lida, payload_json)
  VALUES (NEW.user_id, 'matricula_realizada', 'inapp', NEW.course_id, 'sent', false,
          jsonb_build_object('curso', COALESCE(v_curso, '')));
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.refresh_all_enrollment_statuses()
 RETURNS integer
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH updated AS (
    UPDATE public.enrollments
    SET status = CASE
      WHEN due_date IS NULL              THEN 'ativo'::public.enrollment_status
      WHEN due_date < CURRENT_DATE       THEN 'vencido'::public.enrollment_status
      WHEN due_date <= CURRENT_DATE + 30 THEN 'expirando'::public.enrollment_status
      ELSE                                    'ativo'::public.enrollment_status
    END
    WHERE status NOT IN ('concluido'::public.enrollment_status)
    RETURNING 1
  ) SELECT count(*)::int FROM updated;
$function$;

CREATE OR REPLACE FUNCTION public.refresh_enrollment_status(p_id uuid)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  UPDATE public.enrollments
  SET status = CASE
    WHEN due_date IS NULL              THEN 'ativo'::public.enrollment_status
    WHEN due_date < CURRENT_DATE       THEN 'vencido'::public.enrollment_status
    WHEN due_date <= CURRENT_DATE + 30 THEN 'expirando'::public.enrollment_status
    ELSE                                    'ativo'::public.enrollment_status
  END
  WHERE id = p_id AND status != 'concluido'::public.enrollment_status;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.signup_mode()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select case
    when not exists (select 1 from public.user_roles where role = 'admin')
      then 'bootstrap'
    else 'aberto'
  end
$function$;

CREATE OR REPLACE FUNCTION public.trigger_esocial_s2210()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.esocial_queue (evento, status, user_id, payload_json, prazo_envio)
  VALUES (
    'S-2210', 'pendente', NEW.user_id,
    jsonb_build_object('cat_id', NEW.id, 'data_acidente', NEW.data_acidente, 'tipo', NEW.tipo, 'afastamento', NEW.afastamento),
    (NEW.data_acidente + INTERVAL '1 day')::date
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_esocial_s2220()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.esocial_queue (evento, status, user_id, aso_id, payload_json, prazo_envio)
  VALUES (
    'S-2220', 'pendente', NEW.user_id, NEW.id,
    jsonb_build_object('tipo_aso', NEW.tipo, 'data_exame', NEW.data_exame, 'resultado', NEW.resultado, 'medico', NEW.medico_nome, 'crm', NEW.crm),
    (date_trunc('month', NEW.data_exame::timestamptz) + INTERVAL '1 month' + INTERVAL '14 days')::date
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_esocial_s2245()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.esocial_queue (evento, status, user_id, enrollment_id, payload_json, prazo_envio)
  SELECT 'S-2245', 'pendente', NEW.user_id, e.id,
    jsonb_build_object('curso_id', NEW.course_id, 'certificado_id', NEW.id, 'data_conclusao', NEW.emitido_at::date),
    (NEW.emitido_at::date + INTERVAL '15 days')::date
  FROM public.enrollments e
  WHERE e.user_id = NEW.user_id AND e.course_id = NEW.course_id LIMIT 1;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.vault_create_secret(p_name text, p_secret text, p_description text DEFAULT ''::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'vault', 'public'
AS $function$
DECLARE _id UUID;
BEGIN
  _id := vault.create_secret(p_secret, p_name, p_description);
  RETURN _id;
END $function$;

CREATE OR REPLACE FUNCTION public.vault_delete_secret(p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'vault', 'public'
AS $function$ BEGIN DELETE FROM vault.secrets WHERE id = p_id; END $function$;

CREATE OR REPLACE FUNCTION public.vault_read_secret(p_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'vault', 'public'
AS $function$
DECLARE _v TEXT;
BEGIN
  SELECT decrypted_secret INTO _v FROM vault.decrypted_secrets WHERE id = p_id;
  RETURN _v;
END $function$;

CREATE OR REPLACE FUNCTION public.vault_read_secret_by_name(p_name text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare _v text;
begin
  select decrypted_secret into _v
    from vault.decrypted_secrets
   where name = p_name;
  return _v;
end
$function$;

CREATE OR REPLACE FUNCTION public.vault_update_secret(p_id uuid, p_secret text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'vault', 'public'
AS $function$ BEGIN PERFORM vault.update_secret(p_id, p_secret); END $function$;

-- ===== 20261117014703_schema_policies_triggers_view.sql =====
-- Schema-only baseline exported from live PostgreSQL catalogs on 2026-11-17 UTC.
-- For a NEW managed PostgreSQL database only; do not apply to the existing database.
-- No application rows, auth users, secret values or storage files are included.
SET search_path = public, extensions;

CREATE POLICY "enrolled read alternatives" ON public.alternatives AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM (questions q
     JOIN enrollments e ON ((e.course_id = q.course_id)))
  WHERE ((q.id = alternatives.question_id) AND (e.user_id = auth.uid())))));

CREATE POLICY "staff manage alternatives" ON public.alternatives AS PERMISSIVE FOR ALL TO public USING (is_staff(auth.uid()));

CREATE POLICY "staff read alternatives" ON public.alternatives AS PERMISSIVE FOR SELECT TO public USING (is_staff(auth.uid()));

CREATE POLICY "admin manage api_keys_registry" ON public.api_keys_registry AS PERMISSIVE FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY asos_rw ON public.asos AS PERMISSIVE FOR ALL TO authenticated USING (((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'gestor'::app_role]))))) OR (user_id = auth.uid())));

CREATE POLICY "staff read all attempt_answers" ON public.attempt_answers AS PERMISSIVE FOR SELECT TO public USING (is_staff(auth.uid()));

CREATE POLICY "users create own attempt_answers" ON public.attempt_answers AS PERMISSIVE FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM (attempts a
     JOIN enrollments e ON ((e.id = a.enrollment_id)))
  WHERE ((a.id = attempt_answers.attempt_id) AND (e.user_id = auth.uid())))));

CREATE POLICY "users read own attempt_answers" ON public.attempt_answers AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM (attempts a
     JOIN enrollments e ON ((e.id = a.enrollment_id)))
  WHERE ((a.id = attempt_answers.attempt_id) AND (e.user_id = auth.uid())))));

CREATE POLICY "staff read all attempts" ON public.attempts AS PERMISSIVE FOR SELECT TO public USING (is_staff(auth.uid()));

CREATE POLICY "users create own attempts" ON public.attempts AS PERMISSIVE FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM enrollments e
  WHERE ((e.id = attempts.enrollment_id) AND (e.user_id = auth.uid())))));

CREATE POLICY "users read own attempts" ON public.attempts AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM enrollments e
  WHERE ((e.id = attempts.enrollment_id) AND (e.user_id = auth.uid())))));

CREATE POLICY "admin reads audit" ON public.audit_logs AS PERMISSIVE FOR SELECT TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "auth users insert audit" ON public.audit_logs AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() IS NOT NULL));

CREATE POLICY "admin updates branding" ON public.branding AS PERMISSIVE FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "anyone reads branding" ON public.branding AS PERMISSIVE FOR SELECT TO public USING (true);

CREATE POLICY cats_rw ON public.cats AS PERMISSIVE FOR ALL TO authenticated USING (((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'gestor'::app_role]))))) OR (user_id = auth.uid())));

CREATE POLICY "staff read all certificates" ON public.certificates AS PERMISSIVE FOR SELECT TO public USING (is_staff(auth.uid()));

CREATE POLICY "users insert own certificates" ON public.certificates AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "users read own certificates" ON public.certificates AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));

CREATE POLICY "users update own certificates" ON public.certificates AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id));

CREATE POLICY cipa_mandatos_rw ON public.cipa_mandatos AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'gestor'::app_role]))))));

CREATE POLICY cipa_membros_rw ON public.cipa_membros AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'gestor'::app_role]))))));

CREATE POLICY "anyone reads published courses" ON public.courses AS PERMISSIVE FOR SELECT TO public USING (((publicado = true) OR is_staff(auth.uid())));

CREATE POLICY "staff manage courses" ON public.courses AS PERMISSIVE FOR ALL TO public USING (is_staff(auth.uid()));

CREATE POLICY empresa_membros_admin ON public.empresa_membros AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'gestor'::app_role]))))));

CREATE POLICY empresas_admin ON public.empresas AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'gestor'::app_role]))))));

CREATE POLICY "staff manage enrollments" ON public.enrollments AS PERMISSIVE FOR ALL TO public USING (is_staff(auth.uid()));

CREATE POLICY "staff read all enrollments" ON public.enrollments AS PERMISSIVE FOR SELECT TO public USING (is_staff(auth.uid()));

CREATE POLICY "users create own enrollments" ON public.enrollments AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "users read own enrollments" ON public.enrollments AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));

CREATE POLICY epi_entregas_rw ON public.epi_entregas AS PERMISSIVE FOR ALL TO authenticated USING (((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'gestor'::app_role]))))) OR (user_id = auth.uid())));

CREATE POLICY epis_rw ON public.epis AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'gestor'::app_role]))))));

CREATE POLICY esocial_rw ON public.esocial_queue AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'gestor'::app_role]))))));

CREATE POLICY "anyone reads file_lessons" ON public.file_lessons AS PERMISSIVE FOR SELECT TO public USING (true);

CREATE POLICY "staff manage file_lessons" ON public.file_lessons AS PERMISSIVE FOR ALL TO public USING (is_staff(auth.uid()));

CREATE POLICY "admin manage invitations" ON public.invitations AS PERMISSIVE FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "auth read job_roles" ON public.job_roles AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() IS NOT NULL));

CREATE POLICY "staff manage job_roles" ON public.job_roles AS PERMISSIVE FOR ALL TO public USING (is_staff(auth.uid()));

CREATE POLICY "staff read all progress" ON public.lesson_progress AS PERMISSIVE FOR SELECT TO public USING (is_staff(auth.uid()));

CREATE POLICY "users read own progress" ON public.lesson_progress AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM enrollments e
  WHERE ((e.id = lesson_progress.enrollment_id) AND (e.user_id = auth.uid())))));

CREATE POLICY "users upsert own progress" ON public.lesson_progress AS PERMISSIVE FOR ALL TO public USING ((EXISTS ( SELECT 1
   FROM enrollments e
  WHERE ((e.id = lesson_progress.enrollment_id) AND (e.user_id = auth.uid())))));

CREATE POLICY "anyone reads lessons" ON public.lessons AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM (modules m
     JOIN courses c ON ((c.id = m.course_id)))
  WHERE ((m.id = lessons.module_id) AND (c.publicado OR is_staff(auth.uid()))))));

CREATE POLICY "staff manage lessons" ON public.lessons AS PERMISSIVE FOR ALL TO public USING (is_staff(auth.uid()));

CREATE POLICY "anyone reads link_lessons" ON public.link_lessons AS PERMISSIVE FOR SELECT TO public USING (true);

CREATE POLICY "staff manage link_lessons" ON public.link_lessons AS PERMISSIVE FOR ALL TO public USING (is_staff(auth.uid()));

CREATE POLICY "anyone reads modules" ON public.modules AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM courses c
  WHERE ((c.id = modules.course_id) AND (c.publicado OR is_staff(auth.uid()))))));

CREATE POLICY "staff manage modules" ON public.modules AS PERMISSIVE FOR ALL TO public USING (is_staff(auth.uid()));

CREATE POLICY "staff manage notifications" ON public.notifications AS PERMISSIVE FOR ALL TO public USING (is_staff(auth.uid()));

CREATE POLICY "staff read all notifications" ON public.notifications AS PERMISSIVE FOR SELECT TO public USING (is_staff(auth.uid()));

CREATE POLICY "users read own notifications" ON public.notifications AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));

CREATE POLICY users_read_own_notifications ON public.notifications AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));

CREATE POLICY users_update_lida ON public.notifications AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "admin manage nrs_catalog" ON public.nrs_catalog AS PERMISSIVE FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "authenticated read nrs_catalog" ON public.nrs_catalog AS PERMISSIVE FOR SELECT TO public USING ((auth.role() = 'authenticated'::text));

CREATE POLICY "anyone reads panda" ON public.panda_lessons AS PERMISSIVE FOR SELECT TO public USING (true);

CREATE POLICY "staff manage panda" ON public.panda_lessons AS PERMISSIVE FOR ALL TO public USING (is_staff(auth.uid()));

CREATE POLICY "auth read path_requirements" ON public.path_requirements AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() IS NOT NULL));

CREATE POLICY "staff manage path_requirements" ON public.path_requirements AS PERMISSIVE FOR ALL TO public USING (is_staff(auth.uid()));

CREATE POLICY "admin all profiles" ON public.profiles AS PERMISSIVE FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "staff read all profiles" ON public.profiles AS PERMISSIVE FOR SELECT TO public USING (is_staff(auth.uid()));

CREATE POLICY "users read own profile" ON public.profiles AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = id));

CREATE POLICY "users update own profile" ON public.profiles AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = id));

CREATE POLICY pt_apr_rw ON public.pt_apr AS PERMISSIVE FOR ALL TO authenticated USING (((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'gestor'::app_role]))))) OR (solicitante_id = auth.uid())));

CREATE POLICY "enrolled read questions" ON public.questions AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM enrollments e
  WHERE ((e.course_id = questions.course_id) AND (e.user_id = auth.uid())))));

CREATE POLICY "staff manage questions" ON public.questions AS PERMISSIVE FOR ALL TO public USING (is_staff(auth.uid()));

CREATE POLICY "staff read questions" ON public.questions AS PERMISSIVE FOR SELECT TO public USING (is_staff(auth.uid()));

CREATE POLICY "anyone reads rich_lessons" ON public.rich_lessons AS PERMISSIVE FOR SELECT TO public USING (true);

CREATE POLICY "staff manage rich_lessons" ON public.rich_lessons AS PERMISSIVE FOR ALL TO public USING (is_staff(auth.uid()));

CREATE POLICY riscos_rw ON public.riscos_psicossociais AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'gestor'::app_role]))))));

CREATE POLICY sst_documentos_rw ON public.sst_documentos AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'gestor'::app_role]))))));

CREATE POLICY terceiros_rw ON public.terceiros AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::app_role, 'gestor'::app_role]))))));

CREATE POLICY "admin manage roles" ON public.user_roles AS PERMISSIVE FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "users read own roles" ON public.user_roles AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = user_id));

CREATE POLICY "Authenticated users can delete from public bucket" ON storage.objects AS PERMISSIVE FOR DELETE TO authenticated USING ((bucket_id = 'public'::text));

CREATE POLICY "Authenticated users can update public bucket" ON storage.objects AS PERMISSIVE FOR UPDATE TO authenticated USING ((bucket_id = 'public'::text));

CREATE POLICY "Authenticated users can upload to public bucket" ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'public'::text));

CREATE POLICY "Public bucket is readable by everyone" ON storage.objects AS PERMISSIVE FOR SELECT TO public USING ((bucket_id = 'public'::text));

CREATE POLICY "admin delete branding" ON storage.objects AS PERMISSIVE FOR DELETE TO public USING (((bucket_id = 'branding'::text) AND has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "admin update branding" ON storage.objects AS PERMISSIVE FOR UPDATE TO public USING (((bucket_id = 'branding'::text) AND has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "admin write branding" ON storage.objects AS PERMISSIVE FOR INSERT TO public WITH CHECK (((bucket_id = 'branding'::text) AND has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "auth read lesson-files" ON storage.objects AS PERMISSIVE FOR SELECT TO public USING (((bucket_id = 'lesson-files'::text) AND (auth.uid() IS NOT NULL)));

CREATE POLICY "auth write certificates" ON storage.objects AS PERMISSIVE FOR INSERT TO public WITH CHECK (((bucket_id = 'certificates'::text) AND (auth.uid() IS NOT NULL)));

CREATE POLICY "public read branding" ON storage.objects AS PERMISSIVE FOR SELECT TO public USING ((bucket_id = 'branding'::text));

CREATE POLICY "public read certificates" ON storage.objects AS PERMISSIVE FOR SELECT TO public USING ((bucket_id = 'certificates'::text));

CREATE POLICY "public read course-assets" ON storage.objects AS PERMISSIVE FOR SELECT TO public USING ((bucket_id = 'course-assets'::text));

CREATE POLICY "staff delete course-assets" ON storage.objects AS PERMISSIVE FOR DELETE TO public USING (((bucket_id = 'course-assets'::text) AND is_staff(auth.uid())));

CREATE POLICY "staff delete lesson-files" ON storage.objects AS PERMISSIVE FOR DELETE TO public USING (((bucket_id = 'lesson-files'::text) AND is_staff(auth.uid())));

CREATE POLICY "staff manage lesson-files" ON storage.objects AS PERMISSIVE FOR INSERT TO public WITH CHECK (((bucket_id = 'lesson-files'::text) AND is_staff(auth.uid())));

CREATE POLICY "staff update course-assets" ON storage.objects AS PERMISSIVE FOR UPDATE TO public USING (((bucket_id = 'course-assets'::text) AND is_staff(auth.uid())));

CREATE POLICY "staff update lesson-files" ON storage.objects AS PERMISSIVE FOR UPDATE TO public USING (((bucket_id = 'lesson-files'::text) AND is_staff(auth.uid())));

CREATE POLICY "staff write course-assets" ON storage.objects AS PERMISSIVE FOR INSERT TO public WITH CHECK (((bucket_id = 'course-assets'::text) AND is_staff(auth.uid())));

CREATE TRIGGER trg_api_keys_registry_updated_at BEFORE UPDATE ON api_keys_registry FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_esocial_s2220 AFTER INSERT ON asos FOR EACH ROW EXECUTE FUNCTION trigger_esocial_s2220();

CREATE TRIGGER trg_esocial_s2210 AFTER INSERT ON cats FOR EACH ROW EXECUTE FUNCTION trigger_esocial_s2210();

CREATE TRIGGER trg_cert_number BEFORE INSERT ON certificates FOR EACH ROW EXECUTE FUNCTION generate_cert_number();

CREATE TRIGGER trg_esocial_s2245 AFTER INSERT ON certificates FOR EACH ROW EXECUTE FUNCTION trigger_esocial_s2245();

CREATE TRIGGER trg_notify_certificate AFTER INSERT ON certificates FOR EACH ROW EXECUTE FUNCTION notify_on_certificate();

CREATE TRIGGER trg_notify_enrollment AFTER INSERT ON enrollments FOR EACH ROW EXECUTE FUNCTION notify_on_enrollment();

CREATE TRIGGER trg_auto_enroll AFTER UPDATE OF job_role_id ON profiles FOR EACH ROW EXECUTE FUNCTION auto_enroll_on_role_assign();

CREATE VIEW public.vw_compliance AS
 SELECT p.id AS user_id,
    p.nome,
    p.cargo,
    p.setor,
    jr.id AS job_role_id,
    jr.nome AS job_role_nome,
    c.id AS course_id,
    c.titulo AS curso_titulo,
    c.nr_codigo,
    pr.obrigatorio,
    pr.ordem,
    pr.prerequisite_course_id,
    e.id AS enrollment_id,
    e.status AS enrollment_status,
    e.due_date,
        CASE
            WHEN e.id IS NULL THEN 'pendente'::text
            WHEN e.status::text = 'vencido'::text THEN 'vencido'::text
            WHEN e.status::text = 'concluido'::text THEN 'concluido'::text
            WHEN e.status::text = ANY (ARRAY['ativo'::text, 'expirando'::text]) THEN 'em_andamento'::text
            ELSE e.status::text
        END AS compliance_status
   FROM profiles p
     JOIN job_roles jr ON jr.id = p.job_role_id
     JOIN path_requirements pr ON pr.job_role_id = jr.id
     JOIN courses c ON c.id = pr.course_id
     LEFT JOIN enrollments e ON e.user_id = p.id AND e.course_id = c.id;

-- ===== 20261117014704_schema_grants.sql =====
-- Schema-only baseline exported from live PostgreSQL catalogs on 2026-11-17 UTC.
-- For a NEW managed PostgreSQL database only; do not apply to the existing database.
-- No application rows, auth users, secret values or storage files are included.
SET search_path = public, extensions;

GRANT EXECUTE ON FUNCTION public.auto_enroll_on_role_assign() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.auto_enroll_on_role_assign() TO anon;
GRANT EXECUTE ON FUNCTION public.auto_enroll_on_role_assign() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_enroll_on_role_assign() TO service_role;
GRANT EXECUTE ON FUNCTION public.bootstrap_self() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_self() TO anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_self() TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_self() TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_cert_number() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_cert_number() TO anon;
GRANT EXECUTE ON FUNCTION public.generate_cert_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_cert_number() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_certificate(p_token text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_certificate(p_token text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_certificate(p_token text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_certificate(p_token text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_minhas_empresas() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_minhas_empresas() TO anon;
GRANT EXECUTE ON FUNCTION public.get_minhas_empresas() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_minhas_empresas() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(_user_id uuid, _role app_role) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(_user_id uuid, _role app_role) TO anon;
GRANT EXECUTE ON FUNCTION public.has_role(_user_id uuid, _role app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(_user_id uuid, _role app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(_user_id uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(_user_id uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin(_user_id uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(_user_id uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(_user_id uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff(_user_id uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.is_staff(_user_id uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(_user_id uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.notify_on_certificate() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_on_certificate() TO anon;
GRANT EXECUTE ON FUNCTION public.notify_on_certificate() TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_certificate() TO service_role;
GRANT EXECUTE ON FUNCTION public.notify_on_enrollment() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_on_enrollment() TO anon;
GRANT EXECUTE ON FUNCTION public.notify_on_enrollment() TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_on_enrollment() TO service_role;
GRANT EXECUTE ON FUNCTION public.refresh_all_enrollment_statuses() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_all_enrollment_statuses() TO anon;
GRANT EXECUTE ON FUNCTION public.refresh_all_enrollment_statuses() TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_all_enrollment_statuses() TO service_role;
GRANT EXECUTE ON FUNCTION public.refresh_enrollment_status(p_id uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_enrollment_status(p_id uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.refresh_enrollment_status(p_id uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_enrollment_status(p_id uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO anon;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.signup_mode() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.signup_mode() TO anon;
GRANT EXECUTE ON FUNCTION public.signup_mode() TO authenticated;
GRANT EXECUTE ON FUNCTION public.signup_mode() TO service_role;
GRANT EXECUTE ON FUNCTION public.trigger_esocial_s2210() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.trigger_esocial_s2210() TO anon;
GRANT EXECUTE ON FUNCTION public.trigger_esocial_s2210() TO authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_esocial_s2210() TO service_role;
GRANT EXECUTE ON FUNCTION public.trigger_esocial_s2220() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.trigger_esocial_s2220() TO anon;
GRANT EXECUTE ON FUNCTION public.trigger_esocial_s2220() TO authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_esocial_s2220() TO service_role;
GRANT EXECUTE ON FUNCTION public.trigger_esocial_s2245() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.trigger_esocial_s2245() TO anon;
GRANT EXECUTE ON FUNCTION public.trigger_esocial_s2245() TO authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_esocial_s2245() TO service_role;
GRANT EXECUTE ON FUNCTION public.vault_create_secret(p_name text, p_secret text, p_description text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.vault_create_secret(p_name text, p_secret text, p_description text) TO anon;
GRANT EXECUTE ON FUNCTION public.vault_create_secret(p_name text, p_secret text, p_description text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vault_create_secret(p_name text, p_secret text, p_description text) TO service_role;
GRANT EXECUTE ON FUNCTION public.vault_delete_secret(p_id uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.vault_delete_secret(p_id uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.vault_delete_secret(p_id uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vault_delete_secret(p_id uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.vault_read_secret(p_id uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.vault_read_secret(p_id uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.vault_read_secret(p_id uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vault_read_secret(p_id uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.vault_read_secret_by_name(p_name text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.vault_read_secret_by_name(p_name text) TO anon;
GRANT EXECUTE ON FUNCTION public.vault_read_secret_by_name(p_name text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vault_read_secret_by_name(p_name text) TO service_role;
GRANT EXECUTE ON FUNCTION public.vault_update_secret(p_id uuid, p_secret text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.vault_update_secret(p_id uuid, p_secret text) TO anon;
GRANT EXECUTE ON FUNCTION public.vault_update_secret(p_id uuid, p_secret text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vault_update_secret(p_id uuid, p_secret text) TO service_role;
GRANT DELETE ON TABLE public.alternatives TO anon;
GRANT INSERT ON TABLE public.alternatives TO anon;
GRANT REFERENCES ON TABLE public.alternatives TO anon;
GRANT SELECT ON TABLE public.alternatives TO anon;
GRANT TRIGGER ON TABLE public.alternatives TO anon;
GRANT TRUNCATE ON TABLE public.alternatives TO anon;
GRANT UPDATE ON TABLE public.alternatives TO anon;
GRANT DELETE ON TABLE public.alternatives TO authenticated;
GRANT INSERT ON TABLE public.alternatives TO authenticated;
GRANT REFERENCES ON TABLE public.alternatives TO authenticated;
GRANT SELECT ON TABLE public.alternatives TO authenticated;
GRANT TRIGGER ON TABLE public.alternatives TO authenticated;
GRANT TRUNCATE ON TABLE public.alternatives TO authenticated;
GRANT UPDATE ON TABLE public.alternatives TO authenticated;
GRANT DELETE ON TABLE public.alternatives TO service_role;
GRANT INSERT ON TABLE public.alternatives TO service_role;
GRANT REFERENCES ON TABLE public.alternatives TO service_role;
GRANT SELECT ON TABLE public.alternatives TO service_role;
GRANT TRIGGER ON TABLE public.alternatives TO service_role;
GRANT TRUNCATE ON TABLE public.alternatives TO service_role;
GRANT UPDATE ON TABLE public.alternatives TO service_role;
GRANT DELETE ON TABLE public.api_keys_registry TO anon;
GRANT INSERT ON TABLE public.api_keys_registry TO anon;
GRANT REFERENCES ON TABLE public.api_keys_registry TO anon;
GRANT SELECT ON TABLE public.api_keys_registry TO anon;
GRANT TRIGGER ON TABLE public.api_keys_registry TO anon;
GRANT TRUNCATE ON TABLE public.api_keys_registry TO anon;
GRANT UPDATE ON TABLE public.api_keys_registry TO anon;
GRANT DELETE ON TABLE public.api_keys_registry TO authenticated;
GRANT INSERT ON TABLE public.api_keys_registry TO authenticated;
GRANT REFERENCES ON TABLE public.api_keys_registry TO authenticated;
GRANT SELECT ON TABLE public.api_keys_registry TO authenticated;
GRANT TRIGGER ON TABLE public.api_keys_registry TO authenticated;
GRANT TRUNCATE ON TABLE public.api_keys_registry TO authenticated;
GRANT UPDATE ON TABLE public.api_keys_registry TO authenticated;
GRANT DELETE ON TABLE public.api_keys_registry TO service_role;
GRANT INSERT ON TABLE public.api_keys_registry TO service_role;
GRANT REFERENCES ON TABLE public.api_keys_registry TO service_role;
GRANT SELECT ON TABLE public.api_keys_registry TO service_role;
GRANT TRIGGER ON TABLE public.api_keys_registry TO service_role;
GRANT TRUNCATE ON TABLE public.api_keys_registry TO service_role;
GRANT UPDATE ON TABLE public.api_keys_registry TO service_role;
GRANT DELETE ON TABLE public.asos TO anon;
GRANT INSERT ON TABLE public.asos TO anon;
GRANT REFERENCES ON TABLE public.asos TO anon;
GRANT SELECT ON TABLE public.asos TO anon;
GRANT TRIGGER ON TABLE public.asos TO anon;
GRANT TRUNCATE ON TABLE public.asos TO anon;
GRANT UPDATE ON TABLE public.asos TO anon;
GRANT DELETE ON TABLE public.asos TO authenticated;
GRANT INSERT ON TABLE public.asos TO authenticated;
GRANT REFERENCES ON TABLE public.asos TO authenticated;
GRANT SELECT ON TABLE public.asos TO authenticated;
GRANT TRIGGER ON TABLE public.asos TO authenticated;
GRANT TRUNCATE ON TABLE public.asos TO authenticated;
GRANT UPDATE ON TABLE public.asos TO authenticated;
GRANT DELETE ON TABLE public.asos TO service_role;
GRANT INSERT ON TABLE public.asos TO service_role;
GRANT REFERENCES ON TABLE public.asos TO service_role;
GRANT SELECT ON TABLE public.asos TO service_role;
GRANT TRIGGER ON TABLE public.asos TO service_role;
GRANT TRUNCATE ON TABLE public.asos TO service_role;
GRANT UPDATE ON TABLE public.asos TO service_role;
GRANT DELETE ON TABLE public.attempt_answers TO anon;
GRANT INSERT ON TABLE public.attempt_answers TO anon;
GRANT REFERENCES ON TABLE public.attempt_answers TO anon;
GRANT SELECT ON TABLE public.attempt_answers TO anon;
GRANT TRIGGER ON TABLE public.attempt_answers TO anon;
GRANT TRUNCATE ON TABLE public.attempt_answers TO anon;
GRANT UPDATE ON TABLE public.attempt_answers TO anon;
GRANT DELETE ON TABLE public.attempt_answers TO authenticated;
GRANT INSERT ON TABLE public.attempt_answers TO authenticated;
GRANT REFERENCES ON TABLE public.attempt_answers TO authenticated;
GRANT SELECT ON TABLE public.attempt_answers TO authenticated;
GRANT TRIGGER ON TABLE public.attempt_answers TO authenticated;
GRANT TRUNCATE ON TABLE public.attempt_answers TO authenticated;
GRANT UPDATE ON TABLE public.attempt_answers TO authenticated;
GRANT DELETE ON TABLE public.attempt_answers TO service_role;
GRANT INSERT ON TABLE public.attempt_answers TO service_role;
GRANT REFERENCES ON TABLE public.attempt_answers TO service_role;
GRANT SELECT ON TABLE public.attempt_answers TO service_role;
GRANT TRIGGER ON TABLE public.attempt_answers TO service_role;
GRANT TRUNCATE ON TABLE public.attempt_answers TO service_role;
GRANT UPDATE ON TABLE public.attempt_answers TO service_role;
GRANT DELETE ON TABLE public.attempts TO anon;
GRANT INSERT ON TABLE public.attempts TO anon;
GRANT REFERENCES ON TABLE public.attempts TO anon;
GRANT SELECT ON TABLE public.attempts TO anon;
GRANT TRIGGER ON TABLE public.attempts TO anon;
GRANT TRUNCATE ON TABLE public.attempts TO anon;
GRANT UPDATE ON TABLE public.attempts TO anon;
GRANT DELETE ON TABLE public.attempts TO authenticated;
GRANT INSERT ON TABLE public.attempts TO authenticated;
GRANT REFERENCES ON TABLE public.attempts TO authenticated;
GRANT SELECT ON TABLE public.attempts TO authenticated;
GRANT TRIGGER ON TABLE public.attempts TO authenticated;
GRANT TRUNCATE ON TABLE public.attempts TO authenticated;
GRANT UPDATE ON TABLE public.attempts TO authenticated;
GRANT DELETE ON TABLE public.attempts TO service_role;
GRANT INSERT ON TABLE public.attempts TO service_role;
GRANT REFERENCES ON TABLE public.attempts TO service_role;
GRANT SELECT ON TABLE public.attempts TO service_role;
GRANT TRIGGER ON TABLE public.attempts TO service_role;
GRANT TRUNCATE ON TABLE public.attempts TO service_role;
GRANT UPDATE ON TABLE public.attempts TO service_role;
GRANT DELETE ON TABLE public.audit_logs TO anon;
GRANT INSERT ON TABLE public.audit_logs TO anon;
GRANT REFERENCES ON TABLE public.audit_logs TO anon;
GRANT SELECT ON TABLE public.audit_logs TO anon;
GRANT TRIGGER ON TABLE public.audit_logs TO anon;
GRANT TRUNCATE ON TABLE public.audit_logs TO anon;
GRANT UPDATE ON TABLE public.audit_logs TO anon;
GRANT DELETE ON TABLE public.audit_logs TO authenticated;
GRANT INSERT ON TABLE public.audit_logs TO authenticated;
GRANT REFERENCES ON TABLE public.audit_logs TO authenticated;
GRANT SELECT ON TABLE public.audit_logs TO authenticated;
GRANT TRIGGER ON TABLE public.audit_logs TO authenticated;
GRANT TRUNCATE ON TABLE public.audit_logs TO authenticated;
GRANT UPDATE ON TABLE public.audit_logs TO authenticated;
GRANT DELETE ON TABLE public.audit_logs TO service_role;
GRANT INSERT ON TABLE public.audit_logs TO service_role;
GRANT REFERENCES ON TABLE public.audit_logs TO service_role;
GRANT SELECT ON TABLE public.audit_logs TO service_role;
GRANT TRIGGER ON TABLE public.audit_logs TO service_role;
GRANT TRUNCATE ON TABLE public.audit_logs TO service_role;
GRANT UPDATE ON TABLE public.audit_logs TO service_role;
GRANT DELETE ON TABLE public.branding TO anon;
GRANT INSERT ON TABLE public.branding TO anon;
GRANT REFERENCES ON TABLE public.branding TO anon;
GRANT SELECT ON TABLE public.branding TO anon;
GRANT TRIGGER ON TABLE public.branding TO anon;
GRANT TRUNCATE ON TABLE public.branding TO anon;
GRANT UPDATE ON TABLE public.branding TO anon;
GRANT DELETE ON TABLE public.branding TO authenticated;
GRANT INSERT ON TABLE public.branding TO authenticated;
GRANT REFERENCES ON TABLE public.branding TO authenticated;
GRANT SELECT ON TABLE public.branding TO authenticated;
GRANT TRIGGER ON TABLE public.branding TO authenticated;
GRANT TRUNCATE ON TABLE public.branding TO authenticated;
GRANT UPDATE ON TABLE public.branding TO authenticated;
GRANT DELETE ON TABLE public.branding TO service_role;
GRANT INSERT ON TABLE public.branding TO service_role;
GRANT REFERENCES ON TABLE public.branding TO service_role;
GRANT SELECT ON TABLE public.branding TO service_role;
GRANT TRIGGER ON TABLE public.branding TO service_role;
GRANT TRUNCATE ON TABLE public.branding TO service_role;
GRANT UPDATE ON TABLE public.branding TO service_role;
GRANT DELETE ON TABLE public.cats TO anon;
GRANT INSERT ON TABLE public.cats TO anon;
GRANT REFERENCES ON TABLE public.cats TO anon;
GRANT SELECT ON TABLE public.cats TO anon;
GRANT TRIGGER ON TABLE public.cats TO anon;
GRANT TRUNCATE ON TABLE public.cats TO anon;
GRANT UPDATE ON TABLE public.cats TO anon;
GRANT DELETE ON TABLE public.cats TO authenticated;
GRANT INSERT ON TABLE public.cats TO authenticated;
GRANT REFERENCES ON TABLE public.cats TO authenticated;
GRANT SELECT ON TABLE public.cats TO authenticated;
GRANT TRIGGER ON TABLE public.cats TO authenticated;
GRANT TRUNCATE ON TABLE public.cats TO authenticated;
GRANT UPDATE ON TABLE public.cats TO authenticated;
GRANT DELETE ON TABLE public.cats TO service_role;
GRANT INSERT ON TABLE public.cats TO service_role;
GRANT REFERENCES ON TABLE public.cats TO service_role;
GRANT SELECT ON TABLE public.cats TO service_role;
GRANT TRIGGER ON TABLE public.cats TO service_role;
GRANT TRUNCATE ON TABLE public.cats TO service_role;
GRANT UPDATE ON TABLE public.cats TO service_role;
GRANT SELECT ON SEQUENCE public.cert_seq TO anon;
GRANT UPDATE ON SEQUENCE public.cert_seq TO anon;
GRANT USAGE ON SEQUENCE public.cert_seq TO anon;
GRANT SELECT ON SEQUENCE public.cert_seq TO authenticated;
GRANT UPDATE ON SEQUENCE public.cert_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.cert_seq TO authenticated;
GRANT SELECT ON SEQUENCE public.cert_seq TO service_role;
GRANT UPDATE ON SEQUENCE public.cert_seq TO service_role;
GRANT USAGE ON SEQUENCE public.cert_seq TO service_role;
GRANT DELETE ON TABLE public.certificates TO anon;
GRANT INSERT ON TABLE public.certificates TO anon;
GRANT REFERENCES ON TABLE public.certificates TO anon;
GRANT SELECT ON TABLE public.certificates TO anon;
GRANT TRIGGER ON TABLE public.certificates TO anon;
GRANT TRUNCATE ON TABLE public.certificates TO anon;
GRANT UPDATE ON TABLE public.certificates TO anon;
GRANT DELETE ON TABLE public.certificates TO authenticated;
GRANT INSERT ON TABLE public.certificates TO authenticated;
GRANT REFERENCES ON TABLE public.certificates TO authenticated;
GRANT SELECT ON TABLE public.certificates TO authenticated;
GRANT TRIGGER ON TABLE public.certificates TO authenticated;
GRANT TRUNCATE ON TABLE public.certificates TO authenticated;
GRANT UPDATE ON TABLE public.certificates TO authenticated;
GRANT DELETE ON TABLE public.certificates TO service_role;
GRANT INSERT ON TABLE public.certificates TO service_role;
GRANT REFERENCES ON TABLE public.certificates TO service_role;
GRANT SELECT ON TABLE public.certificates TO service_role;
GRANT TRIGGER ON TABLE public.certificates TO service_role;
GRANT TRUNCATE ON TABLE public.certificates TO service_role;
GRANT UPDATE ON TABLE public.certificates TO service_role;
GRANT DELETE ON TABLE public.cipa_mandatos TO anon;
GRANT INSERT ON TABLE public.cipa_mandatos TO anon;
GRANT REFERENCES ON TABLE public.cipa_mandatos TO anon;
GRANT SELECT ON TABLE public.cipa_mandatos TO anon;
GRANT TRIGGER ON TABLE public.cipa_mandatos TO anon;
GRANT TRUNCATE ON TABLE public.cipa_mandatos TO anon;
GRANT UPDATE ON TABLE public.cipa_mandatos TO anon;
GRANT DELETE ON TABLE public.cipa_mandatos TO authenticated;
GRANT INSERT ON TABLE public.cipa_mandatos TO authenticated;
GRANT REFERENCES ON TABLE public.cipa_mandatos TO authenticated;
GRANT SELECT ON TABLE public.cipa_mandatos TO authenticated;
GRANT TRIGGER ON TABLE public.cipa_mandatos TO authenticated;
GRANT TRUNCATE ON TABLE public.cipa_mandatos TO authenticated;
GRANT UPDATE ON TABLE public.cipa_mandatos TO authenticated;
GRANT DELETE ON TABLE public.cipa_mandatos TO service_role;
GRANT INSERT ON TABLE public.cipa_mandatos TO service_role;
GRANT REFERENCES ON TABLE public.cipa_mandatos TO service_role;
GRANT SELECT ON TABLE public.cipa_mandatos TO service_role;
GRANT TRIGGER ON TABLE public.cipa_mandatos TO service_role;
GRANT TRUNCATE ON TABLE public.cipa_mandatos TO service_role;
GRANT UPDATE ON TABLE public.cipa_mandatos TO service_role;
GRANT DELETE ON TABLE public.cipa_membros TO anon;
GRANT INSERT ON TABLE public.cipa_membros TO anon;
GRANT REFERENCES ON TABLE public.cipa_membros TO anon;
GRANT SELECT ON TABLE public.cipa_membros TO anon;
GRANT TRIGGER ON TABLE public.cipa_membros TO anon;
GRANT TRUNCATE ON TABLE public.cipa_membros TO anon;
GRANT UPDATE ON TABLE public.cipa_membros TO anon;
GRANT DELETE ON TABLE public.cipa_membros TO authenticated;
GRANT INSERT ON TABLE public.cipa_membros TO authenticated;
GRANT REFERENCES ON TABLE public.cipa_membros TO authenticated;
GRANT SELECT ON TABLE public.cipa_membros TO authenticated;
GRANT TRIGGER ON TABLE public.cipa_membros TO authenticated;
GRANT TRUNCATE ON TABLE public.cipa_membros TO authenticated;
GRANT UPDATE ON TABLE public.cipa_membros TO authenticated;
GRANT DELETE ON TABLE public.cipa_membros TO service_role;
GRANT INSERT ON TABLE public.cipa_membros TO service_role;
GRANT REFERENCES ON TABLE public.cipa_membros TO service_role;
GRANT SELECT ON TABLE public.cipa_membros TO service_role;
GRANT TRIGGER ON TABLE public.cipa_membros TO service_role;
GRANT TRUNCATE ON TABLE public.cipa_membros TO service_role;
GRANT UPDATE ON TABLE public.cipa_membros TO service_role;
GRANT DELETE ON TABLE public.courses TO anon;
GRANT INSERT ON TABLE public.courses TO anon;
GRANT REFERENCES ON TABLE public.courses TO anon;
GRANT SELECT ON TABLE public.courses TO anon;
GRANT TRIGGER ON TABLE public.courses TO anon;
GRANT TRUNCATE ON TABLE public.courses TO anon;
GRANT UPDATE ON TABLE public.courses TO anon;
GRANT DELETE ON TABLE public.courses TO authenticated;
GRANT INSERT ON TABLE public.courses TO authenticated;
GRANT REFERENCES ON TABLE public.courses TO authenticated;
GRANT SELECT ON TABLE public.courses TO authenticated;
GRANT TRIGGER ON TABLE public.courses TO authenticated;
GRANT TRUNCATE ON TABLE public.courses TO authenticated;
GRANT UPDATE ON TABLE public.courses TO authenticated;
GRANT DELETE ON TABLE public.courses TO service_role;
GRANT INSERT ON TABLE public.courses TO service_role;
GRANT REFERENCES ON TABLE public.courses TO service_role;
GRANT SELECT ON TABLE public.courses TO service_role;
GRANT TRIGGER ON TABLE public.courses TO service_role;
GRANT TRUNCATE ON TABLE public.courses TO service_role;
GRANT UPDATE ON TABLE public.courses TO service_role;
GRANT DELETE ON TABLE public.empresa_membros TO anon;
GRANT INSERT ON TABLE public.empresa_membros TO anon;
GRANT REFERENCES ON TABLE public.empresa_membros TO anon;
GRANT SELECT ON TABLE public.empresa_membros TO anon;
GRANT TRIGGER ON TABLE public.empresa_membros TO anon;
GRANT TRUNCATE ON TABLE public.empresa_membros TO anon;
GRANT UPDATE ON TABLE public.empresa_membros TO anon;
GRANT DELETE ON TABLE public.empresa_membros TO authenticated;
GRANT INSERT ON TABLE public.empresa_membros TO authenticated;
GRANT REFERENCES ON TABLE public.empresa_membros TO authenticated;
GRANT SELECT ON TABLE public.empresa_membros TO authenticated;
GRANT TRIGGER ON TABLE public.empresa_membros TO authenticated;
GRANT TRUNCATE ON TABLE public.empresa_membros TO authenticated;
GRANT UPDATE ON TABLE public.empresa_membros TO authenticated;
GRANT DELETE ON TABLE public.empresa_membros TO service_role;
GRANT INSERT ON TABLE public.empresa_membros TO service_role;
GRANT REFERENCES ON TABLE public.empresa_membros TO service_role;
GRANT SELECT ON TABLE public.empresa_membros TO service_role;
GRANT TRIGGER ON TABLE public.empresa_membros TO service_role;
GRANT TRUNCATE ON TABLE public.empresa_membros TO service_role;
GRANT UPDATE ON TABLE public.empresa_membros TO service_role;
GRANT DELETE ON TABLE public.empresas TO anon;
GRANT INSERT ON TABLE public.empresas TO anon;
GRANT REFERENCES ON TABLE public.empresas TO anon;
GRANT SELECT ON TABLE public.empresas TO anon;
GRANT TRIGGER ON TABLE public.empresas TO anon;
GRANT TRUNCATE ON TABLE public.empresas TO anon;
GRANT UPDATE ON TABLE public.empresas TO anon;
GRANT DELETE ON TABLE public.empresas TO authenticated;
GRANT INSERT ON TABLE public.empresas TO authenticated;
GRANT REFERENCES ON TABLE public.empresas TO authenticated;
GRANT SELECT ON TABLE public.empresas TO authenticated;
GRANT TRIGGER ON TABLE public.empresas TO authenticated;
GRANT TRUNCATE ON TABLE public.empresas TO authenticated;
GRANT UPDATE ON TABLE public.empresas TO authenticated;
GRANT DELETE ON TABLE public.empresas TO service_role;
GRANT INSERT ON TABLE public.empresas TO service_role;
GRANT REFERENCES ON TABLE public.empresas TO service_role;
GRANT SELECT ON TABLE public.empresas TO service_role;
GRANT TRIGGER ON TABLE public.empresas TO service_role;
GRANT TRUNCATE ON TABLE public.empresas TO service_role;
GRANT UPDATE ON TABLE public.empresas TO service_role;
GRANT DELETE ON TABLE public.enrollments TO anon;
GRANT INSERT ON TABLE public.enrollments TO anon;
GRANT REFERENCES ON TABLE public.enrollments TO anon;
GRANT SELECT ON TABLE public.enrollments TO anon;
GRANT TRIGGER ON TABLE public.enrollments TO anon;
GRANT TRUNCATE ON TABLE public.enrollments TO anon;
GRANT UPDATE ON TABLE public.enrollments TO anon;
GRANT DELETE ON TABLE public.enrollments TO authenticated;
GRANT INSERT ON TABLE public.enrollments TO authenticated;
GRANT REFERENCES ON TABLE public.enrollments TO authenticated;
GRANT SELECT ON TABLE public.enrollments TO authenticated;
GRANT TRIGGER ON TABLE public.enrollments TO authenticated;
GRANT TRUNCATE ON TABLE public.enrollments TO authenticated;
GRANT UPDATE ON TABLE public.enrollments TO authenticated;
GRANT DELETE ON TABLE public.enrollments TO service_role;
GRANT INSERT ON TABLE public.enrollments TO service_role;
GRANT REFERENCES ON TABLE public.enrollments TO service_role;
GRANT SELECT ON TABLE public.enrollments TO service_role;
GRANT TRIGGER ON TABLE public.enrollments TO service_role;
GRANT TRUNCATE ON TABLE public.enrollments TO service_role;
GRANT UPDATE ON TABLE public.enrollments TO service_role;
GRANT DELETE ON TABLE public.epi_entregas TO anon;
GRANT INSERT ON TABLE public.epi_entregas TO anon;
GRANT REFERENCES ON TABLE public.epi_entregas TO anon;
GRANT SELECT ON TABLE public.epi_entregas TO anon;
GRANT TRIGGER ON TABLE public.epi_entregas TO anon;
GRANT TRUNCATE ON TABLE public.epi_entregas TO anon;
GRANT UPDATE ON TABLE public.epi_entregas TO anon;
GRANT DELETE ON TABLE public.epi_entregas TO authenticated;
GRANT INSERT ON TABLE public.epi_entregas TO authenticated;
GRANT REFERENCES ON TABLE public.epi_entregas TO authenticated;
GRANT SELECT ON TABLE public.epi_entregas TO authenticated;
GRANT TRIGGER ON TABLE public.epi_entregas TO authenticated;
GRANT TRUNCATE ON TABLE public.epi_entregas TO authenticated;
GRANT UPDATE ON TABLE public.epi_entregas TO authenticated;
GRANT DELETE ON TABLE public.epi_entregas TO service_role;
GRANT INSERT ON TABLE public.epi_entregas TO service_role;
GRANT REFERENCES ON TABLE public.epi_entregas TO service_role;
GRANT SELECT ON TABLE public.epi_entregas TO service_role;
GRANT TRIGGER ON TABLE public.epi_entregas TO service_role;
GRANT TRUNCATE ON TABLE public.epi_entregas TO service_role;
GRANT UPDATE ON TABLE public.epi_entregas TO service_role;
GRANT DELETE ON TABLE public.epis TO anon;
GRANT INSERT ON TABLE public.epis TO anon;
GRANT REFERENCES ON TABLE public.epis TO anon;
GRANT SELECT ON TABLE public.epis TO anon;
GRANT TRIGGER ON TABLE public.epis TO anon;
GRANT TRUNCATE ON TABLE public.epis TO anon;
GRANT UPDATE ON TABLE public.epis TO anon;
GRANT DELETE ON TABLE public.epis TO authenticated;
GRANT INSERT ON TABLE public.epis TO authenticated;
GRANT REFERENCES ON TABLE public.epis TO authenticated;
GRANT SELECT ON TABLE public.epis TO authenticated;
GRANT TRIGGER ON TABLE public.epis TO authenticated;
GRANT TRUNCATE ON TABLE public.epis TO authenticated;
GRANT UPDATE ON TABLE public.epis TO authenticated;
GRANT DELETE ON TABLE public.epis TO service_role;
GRANT INSERT ON TABLE public.epis TO service_role;
GRANT REFERENCES ON TABLE public.epis TO service_role;
GRANT SELECT ON TABLE public.epis TO service_role;
GRANT TRIGGER ON TABLE public.epis TO service_role;
GRANT TRUNCATE ON TABLE public.epis TO service_role;
GRANT UPDATE ON TABLE public.epis TO service_role;
GRANT DELETE ON TABLE public.esocial_queue TO anon;
GRANT INSERT ON TABLE public.esocial_queue TO anon;
GRANT REFERENCES ON TABLE public.esocial_queue TO anon;
GRANT SELECT ON TABLE public.esocial_queue TO anon;
GRANT TRIGGER ON TABLE public.esocial_queue TO anon;
GRANT TRUNCATE ON TABLE public.esocial_queue TO anon;
GRANT UPDATE ON TABLE public.esocial_queue TO anon;
GRANT DELETE ON TABLE public.esocial_queue TO authenticated;
GRANT INSERT ON TABLE public.esocial_queue TO authenticated;
GRANT REFERENCES ON TABLE public.esocial_queue TO authenticated;
GRANT SELECT ON TABLE public.esocial_queue TO authenticated;
GRANT TRIGGER ON TABLE public.esocial_queue TO authenticated;
GRANT TRUNCATE ON TABLE public.esocial_queue TO authenticated;
GRANT UPDATE ON TABLE public.esocial_queue TO authenticated;
GRANT DELETE ON TABLE public.esocial_queue TO service_role;
GRANT INSERT ON TABLE public.esocial_queue TO service_role;
GRANT REFERENCES ON TABLE public.esocial_queue TO service_role;
GRANT SELECT ON TABLE public.esocial_queue TO service_role;
GRANT TRIGGER ON TABLE public.esocial_queue TO service_role;
GRANT TRUNCATE ON TABLE public.esocial_queue TO service_role;
GRANT UPDATE ON TABLE public.esocial_queue TO service_role;
GRANT DELETE ON TABLE public.file_lessons TO anon;
GRANT INSERT ON TABLE public.file_lessons TO anon;
GRANT REFERENCES ON TABLE public.file_lessons TO anon;
GRANT SELECT ON TABLE public.file_lessons TO anon;
GRANT TRIGGER ON TABLE public.file_lessons TO anon;
GRANT TRUNCATE ON TABLE public.file_lessons TO anon;
GRANT UPDATE ON TABLE public.file_lessons TO anon;
GRANT DELETE ON TABLE public.file_lessons TO authenticated;
GRANT INSERT ON TABLE public.file_lessons TO authenticated;
GRANT REFERENCES ON TABLE public.file_lessons TO authenticated;
GRANT SELECT ON TABLE public.file_lessons TO authenticated;
GRANT TRIGGER ON TABLE public.file_lessons TO authenticated;
GRANT TRUNCATE ON TABLE public.file_lessons TO authenticated;
GRANT UPDATE ON TABLE public.file_lessons TO authenticated;
GRANT DELETE ON TABLE public.file_lessons TO service_role;
GRANT INSERT ON TABLE public.file_lessons TO service_role;
GRANT REFERENCES ON TABLE public.file_lessons TO service_role;
GRANT SELECT ON TABLE public.file_lessons TO service_role;
GRANT TRIGGER ON TABLE public.file_lessons TO service_role;
GRANT TRUNCATE ON TABLE public.file_lessons TO service_role;
GRANT UPDATE ON TABLE public.file_lessons TO service_role;
GRANT DELETE ON TABLE public.invitations TO anon;
GRANT INSERT ON TABLE public.invitations TO anon;
GRANT REFERENCES ON TABLE public.invitations TO anon;
GRANT SELECT ON TABLE public.invitations TO anon;
GRANT TRIGGER ON TABLE public.invitations TO anon;
GRANT TRUNCATE ON TABLE public.invitations TO anon;
GRANT UPDATE ON TABLE public.invitations TO anon;
GRANT DELETE ON TABLE public.invitations TO authenticated;
GRANT INSERT ON TABLE public.invitations TO authenticated;
GRANT REFERENCES ON TABLE public.invitations TO authenticated;
GRANT SELECT ON TABLE public.invitations TO authenticated;
GRANT TRIGGER ON TABLE public.invitations TO authenticated;
GRANT TRUNCATE ON TABLE public.invitations TO authenticated;
GRANT UPDATE ON TABLE public.invitations TO authenticated;
GRANT DELETE ON TABLE public.invitations TO service_role;
GRANT INSERT ON TABLE public.invitations TO service_role;
GRANT REFERENCES ON TABLE public.invitations TO service_role;
GRANT SELECT ON TABLE public.invitations TO service_role;
GRANT TRIGGER ON TABLE public.invitations TO service_role;
GRANT TRUNCATE ON TABLE public.invitations TO service_role;
GRANT UPDATE ON TABLE public.invitations TO service_role;
GRANT DELETE ON TABLE public.job_roles TO anon;
GRANT INSERT ON TABLE public.job_roles TO anon;
GRANT REFERENCES ON TABLE public.job_roles TO anon;
GRANT SELECT ON TABLE public.job_roles TO anon;
GRANT TRIGGER ON TABLE public.job_roles TO anon;
GRANT TRUNCATE ON TABLE public.job_roles TO anon;
GRANT UPDATE ON TABLE public.job_roles TO anon;
GRANT DELETE ON TABLE public.job_roles TO authenticated;
GRANT INSERT ON TABLE public.job_roles TO authenticated;
GRANT REFERENCES ON TABLE public.job_roles TO authenticated;
GRANT SELECT ON TABLE public.job_roles TO authenticated;
GRANT TRIGGER ON TABLE public.job_roles TO authenticated;
GRANT TRUNCATE ON TABLE public.job_roles TO authenticated;
GRANT UPDATE ON TABLE public.job_roles TO authenticated;
GRANT DELETE ON TABLE public.job_roles TO service_role;
GRANT INSERT ON TABLE public.job_roles TO service_role;
GRANT REFERENCES ON TABLE public.job_roles TO service_role;
GRANT SELECT ON TABLE public.job_roles TO service_role;
GRANT TRIGGER ON TABLE public.job_roles TO service_role;
GRANT TRUNCATE ON TABLE public.job_roles TO service_role;
GRANT UPDATE ON TABLE public.job_roles TO service_role;
GRANT DELETE ON TABLE public.lesson_progress TO anon;
GRANT INSERT ON TABLE public.lesson_progress TO anon;
GRANT REFERENCES ON TABLE public.lesson_progress TO anon;
GRANT SELECT ON TABLE public.lesson_progress TO anon;
GRANT TRIGGER ON TABLE public.lesson_progress TO anon;
GRANT TRUNCATE ON TABLE public.lesson_progress TO anon;
GRANT UPDATE ON TABLE public.lesson_progress TO anon;
GRANT DELETE ON TABLE public.lesson_progress TO authenticated;
GRANT INSERT ON TABLE public.lesson_progress TO authenticated;
GRANT REFERENCES ON TABLE public.lesson_progress TO authenticated;
GRANT SELECT ON TABLE public.lesson_progress TO authenticated;
GRANT TRIGGER ON TABLE public.lesson_progress TO authenticated;
GRANT TRUNCATE ON TABLE public.lesson_progress TO authenticated;
GRANT UPDATE ON TABLE public.lesson_progress TO authenticated;
GRANT DELETE ON TABLE public.lesson_progress TO service_role;
GRANT INSERT ON TABLE public.lesson_progress TO service_role;
GRANT REFERENCES ON TABLE public.lesson_progress TO service_role;
GRANT SELECT ON TABLE public.lesson_progress TO service_role;
GRANT TRIGGER ON TABLE public.lesson_progress TO service_role;
GRANT TRUNCATE ON TABLE public.lesson_progress TO service_role;
GRANT UPDATE ON TABLE public.lesson_progress TO service_role;
GRANT DELETE ON TABLE public.lessons TO anon;
GRANT INSERT ON TABLE public.lessons TO anon;
GRANT REFERENCES ON TABLE public.lessons TO anon;
GRANT SELECT ON TABLE public.lessons TO anon;
GRANT TRIGGER ON TABLE public.lessons TO anon;
GRANT TRUNCATE ON TABLE public.lessons TO anon;
GRANT UPDATE ON TABLE public.lessons TO anon;
GRANT DELETE ON TABLE public.lessons TO authenticated;
GRANT INSERT ON TABLE public.lessons TO authenticated;
GRANT REFERENCES ON TABLE public.lessons TO authenticated;
GRANT SELECT ON TABLE public.lessons TO authenticated;
GRANT TRIGGER ON TABLE public.lessons TO authenticated;
GRANT TRUNCATE ON TABLE public.lessons TO authenticated;
GRANT UPDATE ON TABLE public.lessons TO authenticated;
GRANT DELETE ON TABLE public.lessons TO service_role;
GRANT INSERT ON TABLE public.lessons TO service_role;
GRANT REFERENCES ON TABLE public.lessons TO service_role;
GRANT SELECT ON TABLE public.lessons TO service_role;
GRANT TRIGGER ON TABLE public.lessons TO service_role;
GRANT TRUNCATE ON TABLE public.lessons TO service_role;
GRANT UPDATE ON TABLE public.lessons TO service_role;
GRANT DELETE ON TABLE public.link_lessons TO anon;
GRANT INSERT ON TABLE public.link_lessons TO anon;
GRANT REFERENCES ON TABLE public.link_lessons TO anon;
GRANT SELECT ON TABLE public.link_lessons TO anon;
GRANT TRIGGER ON TABLE public.link_lessons TO anon;
GRANT TRUNCATE ON TABLE public.link_lessons TO anon;
GRANT UPDATE ON TABLE public.link_lessons TO anon;
GRANT DELETE ON TABLE public.link_lessons TO authenticated;
GRANT INSERT ON TABLE public.link_lessons TO authenticated;
GRANT REFERENCES ON TABLE public.link_lessons TO authenticated;
GRANT SELECT ON TABLE public.link_lessons TO authenticated;
GRANT TRIGGER ON TABLE public.link_lessons TO authenticated;
GRANT TRUNCATE ON TABLE public.link_lessons TO authenticated;
GRANT UPDATE ON TABLE public.link_lessons TO authenticated;
GRANT DELETE ON TABLE public.link_lessons TO service_role;
GRANT INSERT ON TABLE public.link_lessons TO service_role;
GRANT REFERENCES ON TABLE public.link_lessons TO service_role;
GRANT SELECT ON TABLE public.link_lessons TO service_role;
GRANT TRIGGER ON TABLE public.link_lessons TO service_role;
GRANT TRUNCATE ON TABLE public.link_lessons TO service_role;
GRANT UPDATE ON TABLE public.link_lessons TO service_role;
GRANT DELETE ON TABLE public.modules TO anon;
GRANT INSERT ON TABLE public.modules TO anon;
GRANT REFERENCES ON TABLE public.modules TO anon;
GRANT SELECT ON TABLE public.modules TO anon;
GRANT TRIGGER ON TABLE public.modules TO anon;
GRANT TRUNCATE ON TABLE public.modules TO anon;
GRANT UPDATE ON TABLE public.modules TO anon;
GRANT DELETE ON TABLE public.modules TO authenticated;
GRANT INSERT ON TABLE public.modules TO authenticated;
GRANT REFERENCES ON TABLE public.modules TO authenticated;
GRANT SELECT ON TABLE public.modules TO authenticated;
GRANT TRIGGER ON TABLE public.modules TO authenticated;
GRANT TRUNCATE ON TABLE public.modules TO authenticated;
GRANT UPDATE ON TABLE public.modules TO authenticated;
GRANT DELETE ON TABLE public.modules TO service_role;
GRANT INSERT ON TABLE public.modules TO service_role;
GRANT REFERENCES ON TABLE public.modules TO service_role;
GRANT SELECT ON TABLE public.modules TO service_role;
GRANT TRIGGER ON TABLE public.modules TO service_role;
GRANT TRUNCATE ON TABLE public.modules TO service_role;
GRANT UPDATE ON TABLE public.modules TO service_role;
GRANT DELETE ON TABLE public.notifications TO anon;
GRANT INSERT ON TABLE public.notifications TO anon;
GRANT REFERENCES ON TABLE public.notifications TO anon;
GRANT SELECT ON TABLE public.notifications TO anon;
GRANT TRIGGER ON TABLE public.notifications TO anon;
GRANT TRUNCATE ON TABLE public.notifications TO anon;
GRANT UPDATE ON TABLE public.notifications TO anon;
GRANT DELETE ON TABLE public.notifications TO authenticated;
GRANT INSERT ON TABLE public.notifications TO authenticated;
GRANT REFERENCES ON TABLE public.notifications TO authenticated;
GRANT SELECT ON TABLE public.notifications TO authenticated;
GRANT TRIGGER ON TABLE public.notifications TO authenticated;
GRANT TRUNCATE ON TABLE public.notifications TO authenticated;
GRANT UPDATE ON TABLE public.notifications TO authenticated;
GRANT DELETE ON TABLE public.notifications TO service_role;
GRANT INSERT ON TABLE public.notifications TO service_role;
GRANT REFERENCES ON TABLE public.notifications TO service_role;
GRANT SELECT ON TABLE public.notifications TO service_role;
GRANT TRIGGER ON TABLE public.notifications TO service_role;
GRANT TRUNCATE ON TABLE public.notifications TO service_role;
GRANT UPDATE ON TABLE public.notifications TO service_role;
GRANT DELETE ON TABLE public.nrs_catalog TO anon;
GRANT INSERT ON TABLE public.nrs_catalog TO anon;
GRANT REFERENCES ON TABLE public.nrs_catalog TO anon;
GRANT SELECT ON TABLE public.nrs_catalog TO anon;
GRANT TRIGGER ON TABLE public.nrs_catalog TO anon;
GRANT TRUNCATE ON TABLE public.nrs_catalog TO anon;
GRANT UPDATE ON TABLE public.nrs_catalog TO anon;
GRANT DELETE ON TABLE public.nrs_catalog TO authenticated;
GRANT INSERT ON TABLE public.nrs_catalog TO authenticated;
GRANT REFERENCES ON TABLE public.nrs_catalog TO authenticated;
GRANT SELECT ON TABLE public.nrs_catalog TO authenticated;
GRANT TRIGGER ON TABLE public.nrs_catalog TO authenticated;
GRANT TRUNCATE ON TABLE public.nrs_catalog TO authenticated;
GRANT UPDATE ON TABLE public.nrs_catalog TO authenticated;
GRANT DELETE ON TABLE public.nrs_catalog TO service_role;
GRANT INSERT ON TABLE public.nrs_catalog TO service_role;
GRANT REFERENCES ON TABLE public.nrs_catalog TO service_role;
GRANT SELECT ON TABLE public.nrs_catalog TO service_role;
GRANT TRIGGER ON TABLE public.nrs_catalog TO service_role;
GRANT TRUNCATE ON TABLE public.nrs_catalog TO service_role;
GRANT UPDATE ON TABLE public.nrs_catalog TO service_role;
GRANT DELETE ON TABLE public.panda_lessons TO anon;
GRANT INSERT ON TABLE public.panda_lessons TO anon;
GRANT REFERENCES ON TABLE public.panda_lessons TO anon;
GRANT SELECT ON TABLE public.panda_lessons TO anon;
GRANT TRIGGER ON TABLE public.panda_lessons TO anon;
GRANT TRUNCATE ON TABLE public.panda_lessons TO anon;
GRANT UPDATE ON TABLE public.panda_lessons TO anon;
GRANT DELETE ON TABLE public.panda_lessons TO authenticated;
GRANT INSERT ON TABLE public.panda_lessons TO authenticated;
GRANT REFERENCES ON TABLE public.panda_lessons TO authenticated;
GRANT SELECT ON TABLE public.panda_lessons TO authenticated;
GRANT TRIGGER ON TABLE public.panda_lessons TO authenticated;
GRANT TRUNCATE ON TABLE public.panda_lessons TO authenticated;
GRANT UPDATE ON TABLE public.panda_lessons TO authenticated;
GRANT DELETE ON TABLE public.panda_lessons TO service_role;
GRANT INSERT ON TABLE public.panda_lessons TO service_role;
GRANT REFERENCES ON TABLE public.panda_lessons TO service_role;
GRANT SELECT ON TABLE public.panda_lessons TO service_role;
GRANT TRIGGER ON TABLE public.panda_lessons TO service_role;
GRANT TRUNCATE ON TABLE public.panda_lessons TO service_role;
GRANT UPDATE ON TABLE public.panda_lessons TO service_role;
GRANT DELETE ON TABLE public.path_requirements TO anon;
GRANT INSERT ON TABLE public.path_requirements TO anon;
GRANT REFERENCES ON TABLE public.path_requirements TO anon;
GRANT SELECT ON TABLE public.path_requirements TO anon;
GRANT TRIGGER ON TABLE public.path_requirements TO anon;
GRANT TRUNCATE ON TABLE public.path_requirements TO anon;
GRANT UPDATE ON TABLE public.path_requirements TO anon;
GRANT DELETE ON TABLE public.path_requirements TO authenticated;
GRANT INSERT ON TABLE public.path_requirements TO authenticated;
GRANT REFERENCES ON TABLE public.path_requirements TO authenticated;
GRANT SELECT ON TABLE public.path_requirements TO authenticated;
GRANT TRIGGER ON TABLE public.path_requirements TO authenticated;
GRANT TRUNCATE ON TABLE public.path_requirements TO authenticated;
GRANT UPDATE ON TABLE public.path_requirements TO authenticated;
GRANT DELETE ON TABLE public.path_requirements TO service_role;
GRANT INSERT ON TABLE public.path_requirements TO service_role;
GRANT REFERENCES ON TABLE public.path_requirements TO service_role;
GRANT SELECT ON TABLE public.path_requirements TO service_role;
GRANT TRIGGER ON TABLE public.path_requirements TO service_role;
GRANT TRUNCATE ON TABLE public.path_requirements TO service_role;
GRANT UPDATE ON TABLE public.path_requirements TO service_role;
GRANT DELETE ON TABLE public.profiles TO anon;
GRANT INSERT ON TABLE public.profiles TO anon;
GRANT REFERENCES ON TABLE public.profiles TO anon;
GRANT SELECT ON TABLE public.profiles TO anon;
GRANT TRIGGER ON TABLE public.profiles TO anon;
GRANT TRUNCATE ON TABLE public.profiles TO anon;
GRANT UPDATE ON TABLE public.profiles TO anon;
GRANT DELETE ON TABLE public.profiles TO authenticated;
GRANT INSERT ON TABLE public.profiles TO authenticated;
GRANT REFERENCES ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT TRIGGER ON TABLE public.profiles TO authenticated;
GRANT TRUNCATE ON TABLE public.profiles TO authenticated;
GRANT UPDATE ON TABLE public.profiles TO authenticated;
GRANT DELETE ON TABLE public.profiles TO service_role;
GRANT INSERT ON TABLE public.profiles TO service_role;
GRANT REFERENCES ON TABLE public.profiles TO service_role;
GRANT SELECT ON TABLE public.profiles TO service_role;
GRANT TRIGGER ON TABLE public.profiles TO service_role;
GRANT TRUNCATE ON TABLE public.profiles TO service_role;
GRANT UPDATE ON TABLE public.profiles TO service_role;
GRANT DELETE ON TABLE public.pt_apr TO anon;
GRANT INSERT ON TABLE public.pt_apr TO anon;
GRANT REFERENCES ON TABLE public.pt_apr TO anon;
GRANT SELECT ON TABLE public.pt_apr TO anon;
GRANT TRIGGER ON TABLE public.pt_apr TO anon;
GRANT TRUNCATE ON TABLE public.pt_apr TO anon;
GRANT UPDATE ON TABLE public.pt_apr TO anon;
GRANT DELETE ON TABLE public.pt_apr TO authenticated;
GRANT INSERT ON TABLE public.pt_apr TO authenticated;
GRANT REFERENCES ON TABLE public.pt_apr TO authenticated;
GRANT SELECT ON TABLE public.pt_apr TO authenticated;
GRANT TRIGGER ON TABLE public.pt_apr TO authenticated;
GRANT TRUNCATE ON TABLE public.pt_apr TO authenticated;
GRANT UPDATE ON TABLE public.pt_apr TO authenticated;
GRANT DELETE ON TABLE public.pt_apr TO service_role;
GRANT INSERT ON TABLE public.pt_apr TO service_role;
GRANT REFERENCES ON TABLE public.pt_apr TO service_role;
GRANT SELECT ON TABLE public.pt_apr TO service_role;
GRANT TRIGGER ON TABLE public.pt_apr TO service_role;
GRANT TRUNCATE ON TABLE public.pt_apr TO service_role;
GRANT UPDATE ON TABLE public.pt_apr TO service_role;
GRANT DELETE ON TABLE public.questions TO anon;
GRANT INSERT ON TABLE public.questions TO anon;
GRANT REFERENCES ON TABLE public.questions TO anon;
GRANT SELECT ON TABLE public.questions TO anon;
GRANT TRIGGER ON TABLE public.questions TO anon;
GRANT TRUNCATE ON TABLE public.questions TO anon;
GRANT UPDATE ON TABLE public.questions TO anon;
GRANT DELETE ON TABLE public.questions TO authenticated;
GRANT INSERT ON TABLE public.questions TO authenticated;
GRANT REFERENCES ON TABLE public.questions TO authenticated;
GRANT SELECT ON TABLE public.questions TO authenticated;
GRANT TRIGGER ON TABLE public.questions TO authenticated;
GRANT TRUNCATE ON TABLE public.questions TO authenticated;
GRANT UPDATE ON TABLE public.questions TO authenticated;
GRANT DELETE ON TABLE public.questions TO service_role;
GRANT INSERT ON TABLE public.questions TO service_role;
GRANT REFERENCES ON TABLE public.questions TO service_role;
GRANT SELECT ON TABLE public.questions TO service_role;
GRANT TRIGGER ON TABLE public.questions TO service_role;
GRANT TRUNCATE ON TABLE public.questions TO service_role;
GRANT UPDATE ON TABLE public.questions TO service_role;
GRANT DELETE ON TABLE public.rich_lessons TO anon;
GRANT INSERT ON TABLE public.rich_lessons TO anon;
GRANT REFERENCES ON TABLE public.rich_lessons TO anon;
GRANT SELECT ON TABLE public.rich_lessons TO anon;
GRANT TRIGGER ON TABLE public.rich_lessons TO anon;
GRANT TRUNCATE ON TABLE public.rich_lessons TO anon;
GRANT UPDATE ON TABLE public.rich_lessons TO anon;
GRANT DELETE ON TABLE public.rich_lessons TO authenticated;
GRANT INSERT ON TABLE public.rich_lessons TO authenticated;
GRANT REFERENCES ON TABLE public.rich_lessons TO authenticated;
GRANT SELECT ON TABLE public.rich_lessons TO authenticated;
GRANT TRIGGER ON TABLE public.rich_lessons TO authenticated;
GRANT TRUNCATE ON TABLE public.rich_lessons TO authenticated;
GRANT UPDATE ON TABLE public.rich_lessons TO authenticated;
GRANT DELETE ON TABLE public.rich_lessons TO service_role;
GRANT INSERT ON TABLE public.rich_lessons TO service_role;
GRANT REFERENCES ON TABLE public.rich_lessons TO service_role;
GRANT SELECT ON TABLE public.rich_lessons TO service_role;
GRANT TRIGGER ON TABLE public.rich_lessons TO service_role;
GRANT TRUNCATE ON TABLE public.rich_lessons TO service_role;
GRANT UPDATE ON TABLE public.rich_lessons TO service_role;
GRANT DELETE ON TABLE public.riscos_psicossociais TO anon;
GRANT INSERT ON TABLE public.riscos_psicossociais TO anon;
GRANT REFERENCES ON TABLE public.riscos_psicossociais TO anon;
GRANT SELECT ON TABLE public.riscos_psicossociais TO anon;
GRANT TRIGGER ON TABLE public.riscos_psicossociais TO anon;
GRANT TRUNCATE ON TABLE public.riscos_psicossociais TO anon;
GRANT UPDATE ON TABLE public.riscos_psicossociais TO anon;
GRANT DELETE ON TABLE public.riscos_psicossociais TO authenticated;
GRANT INSERT ON TABLE public.riscos_psicossociais TO authenticated;
GRANT REFERENCES ON TABLE public.riscos_psicossociais TO authenticated;
GRANT SELECT ON TABLE public.riscos_psicossociais TO authenticated;
GRANT TRIGGER ON TABLE public.riscos_psicossociais TO authenticated;
GRANT TRUNCATE ON TABLE public.riscos_psicossociais TO authenticated;
GRANT UPDATE ON TABLE public.riscos_psicossociais TO authenticated;
GRANT DELETE ON TABLE public.riscos_psicossociais TO service_role;
GRANT INSERT ON TABLE public.riscos_psicossociais TO service_role;
GRANT REFERENCES ON TABLE public.riscos_psicossociais TO service_role;
GRANT SELECT ON TABLE public.riscos_psicossociais TO service_role;
GRANT TRIGGER ON TABLE public.riscos_psicossociais TO service_role;
GRANT TRUNCATE ON TABLE public.riscos_psicossociais TO service_role;
GRANT UPDATE ON TABLE public.riscos_psicossociais TO service_role;
GRANT DELETE ON TABLE public.sst_documentos TO anon;
GRANT INSERT ON TABLE public.sst_documentos TO anon;
GRANT REFERENCES ON TABLE public.sst_documentos TO anon;
GRANT SELECT ON TABLE public.sst_documentos TO anon;
GRANT TRIGGER ON TABLE public.sst_documentos TO anon;
GRANT TRUNCATE ON TABLE public.sst_documentos TO anon;
GRANT UPDATE ON TABLE public.sst_documentos TO anon;
GRANT DELETE ON TABLE public.sst_documentos TO authenticated;
GRANT INSERT ON TABLE public.sst_documentos TO authenticated;
GRANT REFERENCES ON TABLE public.sst_documentos TO authenticated;
GRANT SELECT ON TABLE public.sst_documentos TO authenticated;
GRANT TRIGGER ON TABLE public.sst_documentos TO authenticated;
GRANT TRUNCATE ON TABLE public.sst_documentos TO authenticated;
GRANT UPDATE ON TABLE public.sst_documentos TO authenticated;
GRANT DELETE ON TABLE public.sst_documentos TO service_role;
GRANT INSERT ON TABLE public.sst_documentos TO service_role;
GRANT REFERENCES ON TABLE public.sst_documentos TO service_role;
GRANT SELECT ON TABLE public.sst_documentos TO service_role;
GRANT TRIGGER ON TABLE public.sst_documentos TO service_role;
GRANT TRUNCATE ON TABLE public.sst_documentos TO service_role;
GRANT UPDATE ON TABLE public.sst_documentos TO service_role;
GRANT DELETE ON TABLE public.terceiros TO anon;
GRANT INSERT ON TABLE public.terceiros TO anon;
GRANT REFERENCES ON TABLE public.terceiros TO anon;
GRANT SELECT ON TABLE public.terceiros TO anon;
GRANT TRIGGER ON TABLE public.terceiros TO anon;
GRANT TRUNCATE ON TABLE public.terceiros TO anon;
GRANT UPDATE ON TABLE public.terceiros TO anon;
GRANT DELETE ON TABLE public.terceiros TO authenticated;
GRANT INSERT ON TABLE public.terceiros TO authenticated;
GRANT REFERENCES ON TABLE public.terceiros TO authenticated;
GRANT SELECT ON TABLE public.terceiros TO authenticated;
GRANT TRIGGER ON TABLE public.terceiros TO authenticated;
GRANT TRUNCATE ON TABLE public.terceiros TO authenticated;
GRANT UPDATE ON TABLE public.terceiros TO authenticated;
GRANT DELETE ON TABLE public.terceiros TO service_role;
GRANT INSERT ON TABLE public.terceiros TO service_role;
GRANT REFERENCES ON TABLE public.terceiros TO service_role;
GRANT SELECT ON TABLE public.terceiros TO service_role;
GRANT TRIGGER ON TABLE public.terceiros TO service_role;
GRANT TRUNCATE ON TABLE public.terceiros TO service_role;
GRANT UPDATE ON TABLE public.terceiros TO service_role;
GRANT DELETE ON TABLE public.user_roles TO anon;
GRANT INSERT ON TABLE public.user_roles TO anon;
GRANT REFERENCES ON TABLE public.user_roles TO anon;
GRANT SELECT ON TABLE public.user_roles TO anon;
GRANT TRIGGER ON TABLE public.user_roles TO anon;
GRANT TRUNCATE ON TABLE public.user_roles TO anon;
GRANT UPDATE ON TABLE public.user_roles TO anon;
GRANT DELETE ON TABLE public.user_roles TO authenticated;
GRANT INSERT ON TABLE public.user_roles TO authenticated;
GRANT REFERENCES ON TABLE public.user_roles TO authenticated;
GRANT SELECT ON TABLE public.user_roles TO authenticated;
GRANT TRIGGER ON TABLE public.user_roles TO authenticated;
GRANT TRUNCATE ON TABLE public.user_roles TO authenticated;
GRANT UPDATE ON TABLE public.user_roles TO authenticated;
GRANT DELETE ON TABLE public.user_roles TO service_role;
GRANT INSERT ON TABLE public.user_roles TO service_role;
GRANT REFERENCES ON TABLE public.user_roles TO service_role;
GRANT SELECT ON TABLE public.user_roles TO service_role;
GRANT TRIGGER ON TABLE public.user_roles TO service_role;
GRANT TRUNCATE ON TABLE public.user_roles TO service_role;
GRANT UPDATE ON TABLE public.user_roles TO service_role;
GRANT DELETE ON TABLE public.vw_compliance TO anon;
GRANT INSERT ON TABLE public.vw_compliance TO anon;
GRANT REFERENCES ON TABLE public.vw_compliance TO anon;
GRANT SELECT ON TABLE public.vw_compliance TO anon;
GRANT TRIGGER ON TABLE public.vw_compliance TO anon;
GRANT TRUNCATE ON TABLE public.vw_compliance TO anon;
GRANT UPDATE ON TABLE public.vw_compliance TO anon;
GRANT DELETE ON TABLE public.vw_compliance TO authenticated;
GRANT INSERT ON TABLE public.vw_compliance TO authenticated;
GRANT REFERENCES ON TABLE public.vw_compliance TO authenticated;
GRANT SELECT ON TABLE public.vw_compliance TO authenticated;
GRANT TRIGGER ON TABLE public.vw_compliance TO authenticated;
GRANT TRUNCATE ON TABLE public.vw_compliance TO authenticated;
GRANT UPDATE ON TABLE public.vw_compliance TO authenticated;
GRANT DELETE ON TABLE public.vw_compliance TO service_role;
GRANT INSERT ON TABLE public.vw_compliance TO service_role;
GRANT REFERENCES ON TABLE public.vw_compliance TO service_role;
GRANT SELECT ON TABLE public.vw_compliance TO service_role;
GRANT TRIGGER ON TABLE public.vw_compliance TO service_role;
GRANT TRUNCATE ON TABLE public.vw_compliance TO service_role;
GRANT UPDATE ON TABLE public.vw_compliance TO service_role;

-- ===== 20261117014705_storage_buckets.sql =====
-- Buckets de Storage usados pelo app (o export do Lovable trouxe só as policies de storage.objects).
-- Todos públicos porque o front-end e as Edge Functions usam getPublicUrl().
INSERT INTO storage.buckets (id, name, public) VALUES
  ('branding',      'branding',      true),
  ('certificates',  'certificates',  true),
  ('course-assets', 'course-assets', true),
  ('lesson-files',  'lesson-files',  true),
  ('public',        'public',        true)
ON CONFLICT (id) DO NOTHING;

COMMIT;
