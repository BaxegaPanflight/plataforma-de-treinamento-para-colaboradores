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
GRANT MAINTAIN ON TABLE public.alternatives TO anon;
GRANT REFERENCES ON TABLE public.alternatives TO anon;
GRANT SELECT ON TABLE public.alternatives TO anon;
GRANT TRIGGER ON TABLE public.alternatives TO anon;
GRANT TRUNCATE ON TABLE public.alternatives TO anon;
GRANT UPDATE ON TABLE public.alternatives TO anon;
GRANT DELETE ON TABLE public.alternatives TO authenticated;
GRANT INSERT ON TABLE public.alternatives TO authenticated;
GRANT MAINTAIN ON TABLE public.alternatives TO authenticated;
GRANT REFERENCES ON TABLE public.alternatives TO authenticated;
GRANT SELECT ON TABLE public.alternatives TO authenticated;
GRANT TRIGGER ON TABLE public.alternatives TO authenticated;
GRANT TRUNCATE ON TABLE public.alternatives TO authenticated;
GRANT UPDATE ON TABLE public.alternatives TO authenticated;
GRANT DELETE ON TABLE public.alternatives TO service_role;
GRANT INSERT ON TABLE public.alternatives TO service_role;
GRANT MAINTAIN ON TABLE public.alternatives TO service_role;
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
GRANT MAINTAIN ON TABLE public.api_keys_registry TO anon;
GRANT REFERENCES ON TABLE public.api_keys_registry TO anon;
GRANT SELECT ON TABLE public.api_keys_registry TO anon;
GRANT TRIGGER ON TABLE public.api_keys_registry TO anon;
GRANT TRUNCATE ON TABLE public.api_keys_registry TO anon;
GRANT UPDATE ON TABLE public.api_keys_registry TO anon;
GRANT DELETE ON TABLE public.api_keys_registry TO authenticated;
GRANT INSERT ON TABLE public.api_keys_registry TO authenticated;
GRANT MAINTAIN ON TABLE public.api_keys_registry TO authenticated;
GRANT REFERENCES ON TABLE public.api_keys_registry TO authenticated;
GRANT SELECT ON TABLE public.api_keys_registry TO authenticated;
GRANT TRIGGER ON TABLE public.api_keys_registry TO authenticated;
GRANT TRUNCATE ON TABLE public.api_keys_registry TO authenticated;
GRANT UPDATE ON TABLE public.api_keys_registry TO authenticated;
GRANT DELETE ON TABLE public.api_keys_registry TO service_role;
GRANT INSERT ON TABLE public.api_keys_registry TO service_role;
GRANT MAINTAIN ON TABLE public.api_keys_registry TO service_role;
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
GRANT MAINTAIN ON TABLE public.asos TO anon;
GRANT REFERENCES ON TABLE public.asos TO anon;
GRANT SELECT ON TABLE public.asos TO anon;
GRANT TRIGGER ON TABLE public.asos TO anon;
GRANT TRUNCATE ON TABLE public.asos TO anon;
GRANT UPDATE ON TABLE public.asos TO anon;
GRANT DELETE ON TABLE public.asos TO authenticated;
GRANT INSERT ON TABLE public.asos TO authenticated;
GRANT MAINTAIN ON TABLE public.asos TO authenticated;
GRANT REFERENCES ON TABLE public.asos TO authenticated;
GRANT SELECT ON TABLE public.asos TO authenticated;
GRANT TRIGGER ON TABLE public.asos TO authenticated;
GRANT TRUNCATE ON TABLE public.asos TO authenticated;
GRANT UPDATE ON TABLE public.asos TO authenticated;
GRANT DELETE ON TABLE public.asos TO service_role;
GRANT INSERT ON TABLE public.asos TO service_role;
GRANT MAINTAIN ON TABLE public.asos TO service_role;
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
GRANT MAINTAIN ON TABLE public.attempt_answers TO anon;
GRANT REFERENCES ON TABLE public.attempt_answers TO anon;
GRANT SELECT ON TABLE public.attempt_answers TO anon;
GRANT TRIGGER ON TABLE public.attempt_answers TO anon;
GRANT TRUNCATE ON TABLE public.attempt_answers TO anon;
GRANT UPDATE ON TABLE public.attempt_answers TO anon;
GRANT DELETE ON TABLE public.attempt_answers TO authenticated;
GRANT INSERT ON TABLE public.attempt_answers TO authenticated;
GRANT MAINTAIN ON TABLE public.attempt_answers TO authenticated;
GRANT REFERENCES ON TABLE public.attempt_answers TO authenticated;
GRANT SELECT ON TABLE public.attempt_answers TO authenticated;
GRANT TRIGGER ON TABLE public.attempt_answers TO authenticated;
GRANT TRUNCATE ON TABLE public.attempt_answers TO authenticated;
GRANT UPDATE ON TABLE public.attempt_answers TO authenticated;
GRANT DELETE ON TABLE public.attempt_answers TO service_role;
GRANT INSERT ON TABLE public.attempt_answers TO service_role;
GRANT MAINTAIN ON TABLE public.attempt_answers TO service_role;
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
GRANT MAINTAIN ON TABLE public.attempts TO anon;
GRANT REFERENCES ON TABLE public.attempts TO anon;
GRANT SELECT ON TABLE public.attempts TO anon;
GRANT TRIGGER ON TABLE public.attempts TO anon;
GRANT TRUNCATE ON TABLE public.attempts TO anon;
GRANT UPDATE ON TABLE public.attempts TO anon;
GRANT DELETE ON TABLE public.attempts TO authenticated;
GRANT INSERT ON TABLE public.attempts TO authenticated;
GRANT MAINTAIN ON TABLE public.attempts TO authenticated;
GRANT REFERENCES ON TABLE public.attempts TO authenticated;
GRANT SELECT ON TABLE public.attempts TO authenticated;
GRANT TRIGGER ON TABLE public.attempts TO authenticated;
GRANT TRUNCATE ON TABLE public.attempts TO authenticated;
GRANT UPDATE ON TABLE public.attempts TO authenticated;
GRANT DELETE ON TABLE public.attempts TO service_role;
GRANT INSERT ON TABLE public.attempts TO service_role;
GRANT MAINTAIN ON TABLE public.attempts TO service_role;
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
GRANT MAINTAIN ON TABLE public.audit_logs TO anon;
GRANT REFERENCES ON TABLE public.audit_logs TO anon;
GRANT SELECT ON TABLE public.audit_logs TO anon;
GRANT TRIGGER ON TABLE public.audit_logs TO anon;
GRANT TRUNCATE ON TABLE public.audit_logs TO anon;
GRANT UPDATE ON TABLE public.audit_logs TO anon;
GRANT DELETE ON TABLE public.audit_logs TO authenticated;
GRANT INSERT ON TABLE public.audit_logs TO authenticated;
GRANT MAINTAIN ON TABLE public.audit_logs TO authenticated;
GRANT REFERENCES ON TABLE public.audit_logs TO authenticated;
GRANT SELECT ON TABLE public.audit_logs TO authenticated;
GRANT TRIGGER ON TABLE public.audit_logs TO authenticated;
GRANT TRUNCATE ON TABLE public.audit_logs TO authenticated;
GRANT UPDATE ON TABLE public.audit_logs TO authenticated;
GRANT DELETE ON TABLE public.audit_logs TO service_role;
GRANT INSERT ON TABLE public.audit_logs TO service_role;
GRANT MAINTAIN ON TABLE public.audit_logs TO service_role;
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
GRANT MAINTAIN ON TABLE public.branding TO anon;
GRANT REFERENCES ON TABLE public.branding TO anon;
GRANT SELECT ON TABLE public.branding TO anon;
GRANT TRIGGER ON TABLE public.branding TO anon;
GRANT TRUNCATE ON TABLE public.branding TO anon;
GRANT UPDATE ON TABLE public.branding TO anon;
GRANT DELETE ON TABLE public.branding TO authenticated;
GRANT INSERT ON TABLE public.branding TO authenticated;
GRANT MAINTAIN ON TABLE public.branding TO authenticated;
GRANT REFERENCES ON TABLE public.branding TO authenticated;
GRANT SELECT ON TABLE public.branding TO authenticated;
GRANT TRIGGER ON TABLE public.branding TO authenticated;
GRANT TRUNCATE ON TABLE public.branding TO authenticated;
GRANT UPDATE ON TABLE public.branding TO authenticated;
GRANT DELETE ON TABLE public.branding TO service_role;
GRANT INSERT ON TABLE public.branding TO service_role;
GRANT MAINTAIN ON TABLE public.branding TO service_role;
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
GRANT MAINTAIN ON TABLE public.cats TO anon;
GRANT REFERENCES ON TABLE public.cats TO anon;
GRANT SELECT ON TABLE public.cats TO anon;
GRANT TRIGGER ON TABLE public.cats TO anon;
GRANT TRUNCATE ON TABLE public.cats TO anon;
GRANT UPDATE ON TABLE public.cats TO anon;
GRANT DELETE ON TABLE public.cats TO authenticated;
GRANT INSERT ON TABLE public.cats TO authenticated;
GRANT MAINTAIN ON TABLE public.cats TO authenticated;
GRANT REFERENCES ON TABLE public.cats TO authenticated;
GRANT SELECT ON TABLE public.cats TO authenticated;
GRANT TRIGGER ON TABLE public.cats TO authenticated;
GRANT TRUNCATE ON TABLE public.cats TO authenticated;
GRANT UPDATE ON TABLE public.cats TO authenticated;
GRANT DELETE ON TABLE public.cats TO service_role;
GRANT INSERT ON TABLE public.cats TO service_role;
GRANT MAINTAIN ON TABLE public.cats TO service_role;
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
GRANT MAINTAIN ON TABLE public.certificates TO anon;
GRANT REFERENCES ON TABLE public.certificates TO anon;
GRANT SELECT ON TABLE public.certificates TO anon;
GRANT TRIGGER ON TABLE public.certificates TO anon;
GRANT TRUNCATE ON TABLE public.certificates TO anon;
GRANT UPDATE ON TABLE public.certificates TO anon;
GRANT DELETE ON TABLE public.certificates TO authenticated;
GRANT INSERT ON TABLE public.certificates TO authenticated;
GRANT MAINTAIN ON TABLE public.certificates TO authenticated;
GRANT REFERENCES ON TABLE public.certificates TO authenticated;
GRANT SELECT ON TABLE public.certificates TO authenticated;
GRANT TRIGGER ON TABLE public.certificates TO authenticated;
GRANT TRUNCATE ON TABLE public.certificates TO authenticated;
GRANT UPDATE ON TABLE public.certificates TO authenticated;
GRANT DELETE ON TABLE public.certificates TO service_role;
GRANT INSERT ON TABLE public.certificates TO service_role;
GRANT MAINTAIN ON TABLE public.certificates TO service_role;
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
GRANT MAINTAIN ON TABLE public.cipa_mandatos TO anon;
GRANT REFERENCES ON TABLE public.cipa_mandatos TO anon;
GRANT SELECT ON TABLE public.cipa_mandatos TO anon;
GRANT TRIGGER ON TABLE public.cipa_mandatos TO anon;
GRANT TRUNCATE ON TABLE public.cipa_mandatos TO anon;
GRANT UPDATE ON TABLE public.cipa_mandatos TO anon;
GRANT DELETE ON TABLE public.cipa_mandatos TO authenticated;
GRANT INSERT ON TABLE public.cipa_mandatos TO authenticated;
GRANT MAINTAIN ON TABLE public.cipa_mandatos TO authenticated;
GRANT REFERENCES ON TABLE public.cipa_mandatos TO authenticated;
GRANT SELECT ON TABLE public.cipa_mandatos TO authenticated;
GRANT TRIGGER ON TABLE public.cipa_mandatos TO authenticated;
GRANT TRUNCATE ON TABLE public.cipa_mandatos TO authenticated;
GRANT UPDATE ON TABLE public.cipa_mandatos TO authenticated;
GRANT DELETE ON TABLE public.cipa_mandatos TO service_role;
GRANT INSERT ON TABLE public.cipa_mandatos TO service_role;
GRANT MAINTAIN ON TABLE public.cipa_mandatos TO service_role;
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
GRANT MAINTAIN ON TABLE public.cipa_membros TO anon;
GRANT REFERENCES ON TABLE public.cipa_membros TO anon;
GRANT SELECT ON TABLE public.cipa_membros TO anon;
GRANT TRIGGER ON TABLE public.cipa_membros TO anon;
GRANT TRUNCATE ON TABLE public.cipa_membros TO anon;
GRANT UPDATE ON TABLE public.cipa_membros TO anon;
GRANT DELETE ON TABLE public.cipa_membros TO authenticated;
GRANT INSERT ON TABLE public.cipa_membros TO authenticated;
GRANT MAINTAIN ON TABLE public.cipa_membros TO authenticated;
GRANT REFERENCES ON TABLE public.cipa_membros TO authenticated;
GRANT SELECT ON TABLE public.cipa_membros TO authenticated;
GRANT TRIGGER ON TABLE public.cipa_membros TO authenticated;
GRANT TRUNCATE ON TABLE public.cipa_membros TO authenticated;
GRANT UPDATE ON TABLE public.cipa_membros TO authenticated;
GRANT DELETE ON TABLE public.cipa_membros TO service_role;
GRANT INSERT ON TABLE public.cipa_membros TO service_role;
GRANT MAINTAIN ON TABLE public.cipa_membros TO service_role;
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
GRANT MAINTAIN ON TABLE public.courses TO anon;
GRANT REFERENCES ON TABLE public.courses TO anon;
GRANT SELECT ON TABLE public.courses TO anon;
GRANT TRIGGER ON TABLE public.courses TO anon;
GRANT TRUNCATE ON TABLE public.courses TO anon;
GRANT UPDATE ON TABLE public.courses TO anon;
GRANT DELETE ON TABLE public.courses TO authenticated;
GRANT INSERT ON TABLE public.courses TO authenticated;
GRANT MAINTAIN ON TABLE public.courses TO authenticated;
GRANT REFERENCES ON TABLE public.courses TO authenticated;
GRANT SELECT ON TABLE public.courses TO authenticated;
GRANT TRIGGER ON TABLE public.courses TO authenticated;
GRANT TRUNCATE ON TABLE public.courses TO authenticated;
GRANT UPDATE ON TABLE public.courses TO authenticated;
GRANT DELETE ON TABLE public.courses TO service_role;
GRANT INSERT ON TABLE public.courses TO service_role;
GRANT MAINTAIN ON TABLE public.courses TO service_role;
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
GRANT MAINTAIN ON TABLE public.empresa_membros TO anon;
GRANT REFERENCES ON TABLE public.empresa_membros TO anon;
GRANT SELECT ON TABLE public.empresa_membros TO anon;
GRANT TRIGGER ON TABLE public.empresa_membros TO anon;
GRANT TRUNCATE ON TABLE public.empresa_membros TO anon;
GRANT UPDATE ON TABLE public.empresa_membros TO anon;
GRANT DELETE ON TABLE public.empresa_membros TO authenticated;
GRANT INSERT ON TABLE public.empresa_membros TO authenticated;
GRANT MAINTAIN ON TABLE public.empresa_membros TO authenticated;
GRANT REFERENCES ON TABLE public.empresa_membros TO authenticated;
GRANT SELECT ON TABLE public.empresa_membros TO authenticated;
GRANT TRIGGER ON TABLE public.empresa_membros TO authenticated;
GRANT TRUNCATE ON TABLE public.empresa_membros TO authenticated;
GRANT UPDATE ON TABLE public.empresa_membros TO authenticated;
GRANT DELETE ON TABLE public.empresa_membros TO service_role;
GRANT INSERT ON TABLE public.empresa_membros TO service_role;
GRANT MAINTAIN ON TABLE public.empresa_membros TO service_role;
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
GRANT MAINTAIN ON TABLE public.empresas TO anon;
GRANT REFERENCES ON TABLE public.empresas TO anon;
GRANT SELECT ON TABLE public.empresas TO anon;
GRANT TRIGGER ON TABLE public.empresas TO anon;
GRANT TRUNCATE ON TABLE public.empresas TO anon;
GRANT UPDATE ON TABLE public.empresas TO anon;
GRANT DELETE ON TABLE public.empresas TO authenticated;
GRANT INSERT ON TABLE public.empresas TO authenticated;
GRANT MAINTAIN ON TABLE public.empresas TO authenticated;
GRANT REFERENCES ON TABLE public.empresas TO authenticated;
GRANT SELECT ON TABLE public.empresas TO authenticated;
GRANT TRIGGER ON TABLE public.empresas TO authenticated;
GRANT TRUNCATE ON TABLE public.empresas TO authenticated;
GRANT UPDATE ON TABLE public.empresas TO authenticated;
GRANT DELETE ON TABLE public.empresas TO service_role;
GRANT INSERT ON TABLE public.empresas TO service_role;
GRANT MAINTAIN ON TABLE public.empresas TO service_role;
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
GRANT MAINTAIN ON TABLE public.enrollments TO anon;
GRANT REFERENCES ON TABLE public.enrollments TO anon;
GRANT SELECT ON TABLE public.enrollments TO anon;
GRANT TRIGGER ON TABLE public.enrollments TO anon;
GRANT TRUNCATE ON TABLE public.enrollments TO anon;
GRANT UPDATE ON TABLE public.enrollments TO anon;
GRANT DELETE ON TABLE public.enrollments TO authenticated;
GRANT INSERT ON TABLE public.enrollments TO authenticated;
GRANT MAINTAIN ON TABLE public.enrollments TO authenticated;
GRANT REFERENCES ON TABLE public.enrollments TO authenticated;
GRANT SELECT ON TABLE public.enrollments TO authenticated;
GRANT TRIGGER ON TABLE public.enrollments TO authenticated;
GRANT TRUNCATE ON TABLE public.enrollments TO authenticated;
GRANT UPDATE ON TABLE public.enrollments TO authenticated;
GRANT DELETE ON TABLE public.enrollments TO service_role;
GRANT INSERT ON TABLE public.enrollments TO service_role;
GRANT MAINTAIN ON TABLE public.enrollments TO service_role;
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
GRANT MAINTAIN ON TABLE public.epi_entregas TO anon;
GRANT REFERENCES ON TABLE public.epi_entregas TO anon;
GRANT SELECT ON TABLE public.epi_entregas TO anon;
GRANT TRIGGER ON TABLE public.epi_entregas TO anon;
GRANT TRUNCATE ON TABLE public.epi_entregas TO anon;
GRANT UPDATE ON TABLE public.epi_entregas TO anon;
GRANT DELETE ON TABLE public.epi_entregas TO authenticated;
GRANT INSERT ON TABLE public.epi_entregas TO authenticated;
GRANT MAINTAIN ON TABLE public.epi_entregas TO authenticated;
GRANT REFERENCES ON TABLE public.epi_entregas TO authenticated;
GRANT SELECT ON TABLE public.epi_entregas TO authenticated;
GRANT TRIGGER ON TABLE public.epi_entregas TO authenticated;
GRANT TRUNCATE ON TABLE public.epi_entregas TO authenticated;
GRANT UPDATE ON TABLE public.epi_entregas TO authenticated;
GRANT DELETE ON TABLE public.epi_entregas TO service_role;
GRANT INSERT ON TABLE public.epi_entregas TO service_role;
GRANT MAINTAIN ON TABLE public.epi_entregas TO service_role;
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
GRANT MAINTAIN ON TABLE public.epis TO anon;
GRANT REFERENCES ON TABLE public.epis TO anon;
GRANT SELECT ON TABLE public.epis TO anon;
GRANT TRIGGER ON TABLE public.epis TO anon;
GRANT TRUNCATE ON TABLE public.epis TO anon;
GRANT UPDATE ON TABLE public.epis TO anon;
GRANT DELETE ON TABLE public.epis TO authenticated;
GRANT INSERT ON TABLE public.epis TO authenticated;
GRANT MAINTAIN ON TABLE public.epis TO authenticated;
GRANT REFERENCES ON TABLE public.epis TO authenticated;
GRANT SELECT ON TABLE public.epis TO authenticated;
GRANT TRIGGER ON TABLE public.epis TO authenticated;
GRANT TRUNCATE ON TABLE public.epis TO authenticated;
GRANT UPDATE ON TABLE public.epis TO authenticated;
GRANT DELETE ON TABLE public.epis TO service_role;
GRANT INSERT ON TABLE public.epis TO service_role;
GRANT MAINTAIN ON TABLE public.epis TO service_role;
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
GRANT MAINTAIN ON TABLE public.esocial_queue TO anon;
GRANT REFERENCES ON TABLE public.esocial_queue TO anon;
GRANT SELECT ON TABLE public.esocial_queue TO anon;
GRANT TRIGGER ON TABLE public.esocial_queue TO anon;
GRANT TRUNCATE ON TABLE public.esocial_queue TO anon;
GRANT UPDATE ON TABLE public.esocial_queue TO anon;
GRANT DELETE ON TABLE public.esocial_queue TO authenticated;
GRANT INSERT ON TABLE public.esocial_queue TO authenticated;
GRANT MAINTAIN ON TABLE public.esocial_queue TO authenticated;
GRANT REFERENCES ON TABLE public.esocial_queue TO authenticated;
GRANT SELECT ON TABLE public.esocial_queue TO authenticated;
GRANT TRIGGER ON TABLE public.esocial_queue TO authenticated;
GRANT TRUNCATE ON TABLE public.esocial_queue TO authenticated;
GRANT UPDATE ON TABLE public.esocial_queue TO authenticated;
GRANT DELETE ON TABLE public.esocial_queue TO service_role;
GRANT INSERT ON TABLE public.esocial_queue TO service_role;
GRANT MAINTAIN ON TABLE public.esocial_queue TO service_role;
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
GRANT MAINTAIN ON TABLE public.file_lessons TO anon;
GRANT REFERENCES ON TABLE public.file_lessons TO anon;
GRANT SELECT ON TABLE public.file_lessons TO anon;
GRANT TRIGGER ON TABLE public.file_lessons TO anon;
GRANT TRUNCATE ON TABLE public.file_lessons TO anon;
GRANT UPDATE ON TABLE public.file_lessons TO anon;
GRANT DELETE ON TABLE public.file_lessons TO authenticated;
GRANT INSERT ON TABLE public.file_lessons TO authenticated;
GRANT MAINTAIN ON TABLE public.file_lessons TO authenticated;
GRANT REFERENCES ON TABLE public.file_lessons TO authenticated;
GRANT SELECT ON TABLE public.file_lessons TO authenticated;
GRANT TRIGGER ON TABLE public.file_lessons TO authenticated;
GRANT TRUNCATE ON TABLE public.file_lessons TO authenticated;
GRANT UPDATE ON TABLE public.file_lessons TO authenticated;
GRANT DELETE ON TABLE public.file_lessons TO service_role;
GRANT INSERT ON TABLE public.file_lessons TO service_role;
GRANT MAINTAIN ON TABLE public.file_lessons TO service_role;
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
GRANT MAINTAIN ON TABLE public.invitations TO anon;
GRANT REFERENCES ON TABLE public.invitations TO anon;
GRANT SELECT ON TABLE public.invitations TO anon;
GRANT TRIGGER ON TABLE public.invitations TO anon;
GRANT TRUNCATE ON TABLE public.invitations TO anon;
GRANT UPDATE ON TABLE public.invitations TO anon;
GRANT DELETE ON TABLE public.invitations TO authenticated;
GRANT INSERT ON TABLE public.invitations TO authenticated;
GRANT MAINTAIN ON TABLE public.invitations TO authenticated;
GRANT REFERENCES ON TABLE public.invitations TO authenticated;
GRANT SELECT ON TABLE public.invitations TO authenticated;
GRANT TRIGGER ON TABLE public.invitations TO authenticated;
GRANT TRUNCATE ON TABLE public.invitations TO authenticated;
GRANT UPDATE ON TABLE public.invitations TO authenticated;
GRANT DELETE ON TABLE public.invitations TO service_role;
GRANT INSERT ON TABLE public.invitations TO service_role;
GRANT MAINTAIN ON TABLE public.invitations TO service_role;
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
GRANT MAINTAIN ON TABLE public.job_roles TO anon;
GRANT REFERENCES ON TABLE public.job_roles TO anon;
GRANT SELECT ON TABLE public.job_roles TO anon;
GRANT TRIGGER ON TABLE public.job_roles TO anon;
GRANT TRUNCATE ON TABLE public.job_roles TO anon;
GRANT UPDATE ON TABLE public.job_roles TO anon;
GRANT DELETE ON TABLE public.job_roles TO authenticated;
GRANT INSERT ON TABLE public.job_roles TO authenticated;
GRANT MAINTAIN ON TABLE public.job_roles TO authenticated;
GRANT REFERENCES ON TABLE public.job_roles TO authenticated;
GRANT SELECT ON TABLE public.job_roles TO authenticated;
GRANT TRIGGER ON TABLE public.job_roles TO authenticated;
GRANT TRUNCATE ON TABLE public.job_roles TO authenticated;
GRANT UPDATE ON TABLE public.job_roles TO authenticated;
GRANT DELETE ON TABLE public.job_roles TO service_role;
GRANT INSERT ON TABLE public.job_roles TO service_role;
GRANT MAINTAIN ON TABLE public.job_roles TO service_role;
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
GRANT MAINTAIN ON TABLE public.lesson_progress TO anon;
GRANT REFERENCES ON TABLE public.lesson_progress TO anon;
GRANT SELECT ON TABLE public.lesson_progress TO anon;
GRANT TRIGGER ON TABLE public.lesson_progress TO anon;
GRANT TRUNCATE ON TABLE public.lesson_progress TO anon;
GRANT UPDATE ON TABLE public.lesson_progress TO anon;
GRANT DELETE ON TABLE public.lesson_progress TO authenticated;
GRANT INSERT ON TABLE public.lesson_progress TO authenticated;
GRANT MAINTAIN ON TABLE public.lesson_progress TO authenticated;
GRANT REFERENCES ON TABLE public.lesson_progress TO authenticated;
GRANT SELECT ON TABLE public.lesson_progress TO authenticated;
GRANT TRIGGER ON TABLE public.lesson_progress TO authenticated;
GRANT TRUNCATE ON TABLE public.lesson_progress TO authenticated;
GRANT UPDATE ON TABLE public.lesson_progress TO authenticated;
GRANT DELETE ON TABLE public.lesson_progress TO service_role;
GRANT INSERT ON TABLE public.lesson_progress TO service_role;
GRANT MAINTAIN ON TABLE public.lesson_progress TO service_role;
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
GRANT MAINTAIN ON TABLE public.lessons TO anon;
GRANT REFERENCES ON TABLE public.lessons TO anon;
GRANT SELECT ON TABLE public.lessons TO anon;
GRANT TRIGGER ON TABLE public.lessons TO anon;
GRANT TRUNCATE ON TABLE public.lessons TO anon;
GRANT UPDATE ON TABLE public.lessons TO anon;
GRANT DELETE ON TABLE public.lessons TO authenticated;
GRANT INSERT ON TABLE public.lessons TO authenticated;
GRANT MAINTAIN ON TABLE public.lessons TO authenticated;
GRANT REFERENCES ON TABLE public.lessons TO authenticated;
GRANT SELECT ON TABLE public.lessons TO authenticated;
GRANT TRIGGER ON TABLE public.lessons TO authenticated;
GRANT TRUNCATE ON TABLE public.lessons TO authenticated;
GRANT UPDATE ON TABLE public.lessons TO authenticated;
GRANT DELETE ON TABLE public.lessons TO service_role;
GRANT INSERT ON TABLE public.lessons TO service_role;
GRANT MAINTAIN ON TABLE public.lessons TO service_role;
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
GRANT MAINTAIN ON TABLE public.link_lessons TO anon;
GRANT REFERENCES ON TABLE public.link_lessons TO anon;
GRANT SELECT ON TABLE public.link_lessons TO anon;
GRANT TRIGGER ON TABLE public.link_lessons TO anon;
GRANT TRUNCATE ON TABLE public.link_lessons TO anon;
GRANT UPDATE ON TABLE public.link_lessons TO anon;
GRANT DELETE ON TABLE public.link_lessons TO authenticated;
GRANT INSERT ON TABLE public.link_lessons TO authenticated;
GRANT MAINTAIN ON TABLE public.link_lessons TO authenticated;
GRANT REFERENCES ON TABLE public.link_lessons TO authenticated;
GRANT SELECT ON TABLE public.link_lessons TO authenticated;
GRANT TRIGGER ON TABLE public.link_lessons TO authenticated;
GRANT TRUNCATE ON TABLE public.link_lessons TO authenticated;
GRANT UPDATE ON TABLE public.link_lessons TO authenticated;
GRANT DELETE ON TABLE public.link_lessons TO service_role;
GRANT INSERT ON TABLE public.link_lessons TO service_role;
GRANT MAINTAIN ON TABLE public.link_lessons TO service_role;
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
GRANT MAINTAIN ON TABLE public.modules TO anon;
GRANT REFERENCES ON TABLE public.modules TO anon;
GRANT SELECT ON TABLE public.modules TO anon;
GRANT TRIGGER ON TABLE public.modules TO anon;
GRANT TRUNCATE ON TABLE public.modules TO anon;
GRANT UPDATE ON TABLE public.modules TO anon;
GRANT DELETE ON TABLE public.modules TO authenticated;
GRANT INSERT ON TABLE public.modules TO authenticated;
GRANT MAINTAIN ON TABLE public.modules TO authenticated;
GRANT REFERENCES ON TABLE public.modules TO authenticated;
GRANT SELECT ON TABLE public.modules TO authenticated;
GRANT TRIGGER ON TABLE public.modules TO authenticated;
GRANT TRUNCATE ON TABLE public.modules TO authenticated;
GRANT UPDATE ON TABLE public.modules TO authenticated;
GRANT DELETE ON TABLE public.modules TO service_role;
GRANT INSERT ON TABLE public.modules TO service_role;
GRANT MAINTAIN ON TABLE public.modules TO service_role;
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
GRANT MAINTAIN ON TABLE public.notifications TO anon;
GRANT REFERENCES ON TABLE public.notifications TO anon;
GRANT SELECT ON TABLE public.notifications TO anon;
GRANT TRIGGER ON TABLE public.notifications TO anon;
GRANT TRUNCATE ON TABLE public.notifications TO anon;
GRANT UPDATE ON TABLE public.notifications TO anon;
GRANT DELETE ON TABLE public.notifications TO authenticated;
GRANT INSERT ON TABLE public.notifications TO authenticated;
GRANT MAINTAIN ON TABLE public.notifications TO authenticated;
GRANT REFERENCES ON TABLE public.notifications TO authenticated;
GRANT SELECT ON TABLE public.notifications TO authenticated;
GRANT TRIGGER ON TABLE public.notifications TO authenticated;
GRANT TRUNCATE ON TABLE public.notifications TO authenticated;
GRANT UPDATE ON TABLE public.notifications TO authenticated;
GRANT DELETE ON TABLE public.notifications TO service_role;
GRANT INSERT ON TABLE public.notifications TO service_role;
GRANT MAINTAIN ON TABLE public.notifications TO service_role;
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
GRANT MAINTAIN ON TABLE public.nrs_catalog TO anon;
GRANT REFERENCES ON TABLE public.nrs_catalog TO anon;
GRANT SELECT ON TABLE public.nrs_catalog TO anon;
GRANT TRIGGER ON TABLE public.nrs_catalog TO anon;
GRANT TRUNCATE ON TABLE public.nrs_catalog TO anon;
GRANT UPDATE ON TABLE public.nrs_catalog TO anon;
GRANT DELETE ON TABLE public.nrs_catalog TO authenticated;
GRANT INSERT ON TABLE public.nrs_catalog TO authenticated;
GRANT MAINTAIN ON TABLE public.nrs_catalog TO authenticated;
GRANT REFERENCES ON TABLE public.nrs_catalog TO authenticated;
GRANT SELECT ON TABLE public.nrs_catalog TO authenticated;
GRANT TRIGGER ON TABLE public.nrs_catalog TO authenticated;
GRANT TRUNCATE ON TABLE public.nrs_catalog TO authenticated;
GRANT UPDATE ON TABLE public.nrs_catalog TO authenticated;
GRANT DELETE ON TABLE public.nrs_catalog TO service_role;
GRANT INSERT ON TABLE public.nrs_catalog TO service_role;
GRANT MAINTAIN ON TABLE public.nrs_catalog TO service_role;
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
GRANT MAINTAIN ON TABLE public.panda_lessons TO anon;
GRANT REFERENCES ON TABLE public.panda_lessons TO anon;
GRANT SELECT ON TABLE public.panda_lessons TO anon;
GRANT TRIGGER ON TABLE public.panda_lessons TO anon;
GRANT TRUNCATE ON TABLE public.panda_lessons TO anon;
GRANT UPDATE ON TABLE public.panda_lessons TO anon;
GRANT DELETE ON TABLE public.panda_lessons TO authenticated;
GRANT INSERT ON TABLE public.panda_lessons TO authenticated;
GRANT MAINTAIN ON TABLE public.panda_lessons TO authenticated;
GRANT REFERENCES ON TABLE public.panda_lessons TO authenticated;
GRANT SELECT ON TABLE public.panda_lessons TO authenticated;
GRANT TRIGGER ON TABLE public.panda_lessons TO authenticated;
GRANT TRUNCATE ON TABLE public.panda_lessons TO authenticated;
GRANT UPDATE ON TABLE public.panda_lessons TO authenticated;
GRANT DELETE ON TABLE public.panda_lessons TO service_role;
GRANT INSERT ON TABLE public.panda_lessons TO service_role;
GRANT MAINTAIN ON TABLE public.panda_lessons TO service_role;
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
GRANT MAINTAIN ON TABLE public.path_requirements TO anon;
GRANT REFERENCES ON TABLE public.path_requirements TO anon;
GRANT SELECT ON TABLE public.path_requirements TO anon;
GRANT TRIGGER ON TABLE public.path_requirements TO anon;
GRANT TRUNCATE ON TABLE public.path_requirements TO anon;
GRANT UPDATE ON TABLE public.path_requirements TO anon;
GRANT DELETE ON TABLE public.path_requirements TO authenticated;
GRANT INSERT ON TABLE public.path_requirements TO authenticated;
GRANT MAINTAIN ON TABLE public.path_requirements TO authenticated;
GRANT REFERENCES ON TABLE public.path_requirements TO authenticated;
GRANT SELECT ON TABLE public.path_requirements TO authenticated;
GRANT TRIGGER ON TABLE public.path_requirements TO authenticated;
GRANT TRUNCATE ON TABLE public.path_requirements TO authenticated;
GRANT UPDATE ON TABLE public.path_requirements TO authenticated;
GRANT DELETE ON TABLE public.path_requirements TO service_role;
GRANT INSERT ON TABLE public.path_requirements TO service_role;
GRANT MAINTAIN ON TABLE public.path_requirements TO service_role;
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
GRANT MAINTAIN ON TABLE public.profiles TO anon;
GRANT REFERENCES ON TABLE public.profiles TO anon;
GRANT SELECT ON TABLE public.profiles TO anon;
GRANT TRIGGER ON TABLE public.profiles TO anon;
GRANT TRUNCATE ON TABLE public.profiles TO anon;
GRANT UPDATE ON TABLE public.profiles TO anon;
GRANT DELETE ON TABLE public.profiles TO authenticated;
GRANT INSERT ON TABLE public.profiles TO authenticated;
GRANT MAINTAIN ON TABLE public.profiles TO authenticated;
GRANT REFERENCES ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT TRIGGER ON TABLE public.profiles TO authenticated;
GRANT TRUNCATE ON TABLE public.profiles TO authenticated;
GRANT UPDATE ON TABLE public.profiles TO authenticated;
GRANT DELETE ON TABLE public.profiles TO service_role;
GRANT INSERT ON TABLE public.profiles TO service_role;
GRANT MAINTAIN ON TABLE public.profiles TO service_role;
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
GRANT MAINTAIN ON TABLE public.pt_apr TO anon;
GRANT REFERENCES ON TABLE public.pt_apr TO anon;
GRANT SELECT ON TABLE public.pt_apr TO anon;
GRANT TRIGGER ON TABLE public.pt_apr TO anon;
GRANT TRUNCATE ON TABLE public.pt_apr TO anon;
GRANT UPDATE ON TABLE public.pt_apr TO anon;
GRANT DELETE ON TABLE public.pt_apr TO authenticated;
GRANT INSERT ON TABLE public.pt_apr TO authenticated;
GRANT MAINTAIN ON TABLE public.pt_apr TO authenticated;
GRANT REFERENCES ON TABLE public.pt_apr TO authenticated;
GRANT SELECT ON TABLE public.pt_apr TO authenticated;
GRANT TRIGGER ON TABLE public.pt_apr TO authenticated;
GRANT TRUNCATE ON TABLE public.pt_apr TO authenticated;
GRANT UPDATE ON TABLE public.pt_apr TO authenticated;
GRANT DELETE ON TABLE public.pt_apr TO service_role;
GRANT INSERT ON TABLE public.pt_apr TO service_role;
GRANT MAINTAIN ON TABLE public.pt_apr TO service_role;
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
GRANT MAINTAIN ON TABLE public.questions TO anon;
GRANT REFERENCES ON TABLE public.questions TO anon;
GRANT SELECT ON TABLE public.questions TO anon;
GRANT TRIGGER ON TABLE public.questions TO anon;
GRANT TRUNCATE ON TABLE public.questions TO anon;
GRANT UPDATE ON TABLE public.questions TO anon;
GRANT DELETE ON TABLE public.questions TO authenticated;
GRANT INSERT ON TABLE public.questions TO authenticated;
GRANT MAINTAIN ON TABLE public.questions TO authenticated;
GRANT REFERENCES ON TABLE public.questions TO authenticated;
GRANT SELECT ON TABLE public.questions TO authenticated;
GRANT TRIGGER ON TABLE public.questions TO authenticated;
GRANT TRUNCATE ON TABLE public.questions TO authenticated;
GRANT UPDATE ON TABLE public.questions TO authenticated;
GRANT DELETE ON TABLE public.questions TO service_role;
GRANT INSERT ON TABLE public.questions TO service_role;
GRANT MAINTAIN ON TABLE public.questions TO service_role;
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
GRANT MAINTAIN ON TABLE public.rich_lessons TO anon;
GRANT REFERENCES ON TABLE public.rich_lessons TO anon;
GRANT SELECT ON TABLE public.rich_lessons TO anon;
GRANT TRIGGER ON TABLE public.rich_lessons TO anon;
GRANT TRUNCATE ON TABLE public.rich_lessons TO anon;
GRANT UPDATE ON TABLE public.rich_lessons TO anon;
GRANT DELETE ON TABLE public.rich_lessons TO authenticated;
GRANT INSERT ON TABLE public.rich_lessons TO authenticated;
GRANT MAINTAIN ON TABLE public.rich_lessons TO authenticated;
GRANT REFERENCES ON TABLE public.rich_lessons TO authenticated;
GRANT SELECT ON TABLE public.rich_lessons TO authenticated;
GRANT TRIGGER ON TABLE public.rich_lessons TO authenticated;
GRANT TRUNCATE ON TABLE public.rich_lessons TO authenticated;
GRANT UPDATE ON TABLE public.rich_lessons TO authenticated;
GRANT DELETE ON TABLE public.rich_lessons TO service_role;
GRANT INSERT ON TABLE public.rich_lessons TO service_role;
GRANT MAINTAIN ON TABLE public.rich_lessons TO service_role;
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
GRANT MAINTAIN ON TABLE public.riscos_psicossociais TO anon;
GRANT REFERENCES ON TABLE public.riscos_psicossociais TO anon;
GRANT SELECT ON TABLE public.riscos_psicossociais TO anon;
GRANT TRIGGER ON TABLE public.riscos_psicossociais TO anon;
GRANT TRUNCATE ON TABLE public.riscos_psicossociais TO anon;
GRANT UPDATE ON TABLE public.riscos_psicossociais TO anon;
GRANT DELETE ON TABLE public.riscos_psicossociais TO authenticated;
GRANT INSERT ON TABLE public.riscos_psicossociais TO authenticated;
GRANT MAINTAIN ON TABLE public.riscos_psicossociais TO authenticated;
GRANT REFERENCES ON TABLE public.riscos_psicossociais TO authenticated;
GRANT SELECT ON TABLE public.riscos_psicossociais TO authenticated;
GRANT TRIGGER ON TABLE public.riscos_psicossociais TO authenticated;
GRANT TRUNCATE ON TABLE public.riscos_psicossociais TO authenticated;
GRANT UPDATE ON TABLE public.riscos_psicossociais TO authenticated;
GRANT DELETE ON TABLE public.riscos_psicossociais TO service_role;
GRANT INSERT ON TABLE public.riscos_psicossociais TO service_role;
GRANT MAINTAIN ON TABLE public.riscos_psicossociais TO service_role;
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
GRANT MAINTAIN ON TABLE public.sst_documentos TO anon;
GRANT REFERENCES ON TABLE public.sst_documentos TO anon;
GRANT SELECT ON TABLE public.sst_documentos TO anon;
GRANT TRIGGER ON TABLE public.sst_documentos TO anon;
GRANT TRUNCATE ON TABLE public.sst_documentos TO anon;
GRANT UPDATE ON TABLE public.sst_documentos TO anon;
GRANT DELETE ON TABLE public.sst_documentos TO authenticated;
GRANT INSERT ON TABLE public.sst_documentos TO authenticated;
GRANT MAINTAIN ON TABLE public.sst_documentos TO authenticated;
GRANT REFERENCES ON TABLE public.sst_documentos TO authenticated;
GRANT SELECT ON TABLE public.sst_documentos TO authenticated;
GRANT TRIGGER ON TABLE public.sst_documentos TO authenticated;
GRANT TRUNCATE ON TABLE public.sst_documentos TO authenticated;
GRANT UPDATE ON TABLE public.sst_documentos TO authenticated;
GRANT DELETE ON TABLE public.sst_documentos TO service_role;
GRANT INSERT ON TABLE public.sst_documentos TO service_role;
GRANT MAINTAIN ON TABLE public.sst_documentos TO service_role;
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
GRANT MAINTAIN ON TABLE public.terceiros TO anon;
GRANT REFERENCES ON TABLE public.terceiros TO anon;
GRANT SELECT ON TABLE public.terceiros TO anon;
GRANT TRIGGER ON TABLE public.terceiros TO anon;
GRANT TRUNCATE ON TABLE public.terceiros TO anon;
GRANT UPDATE ON TABLE public.terceiros TO anon;
GRANT DELETE ON TABLE public.terceiros TO authenticated;
GRANT INSERT ON TABLE public.terceiros TO authenticated;
GRANT MAINTAIN ON TABLE public.terceiros TO authenticated;
GRANT REFERENCES ON TABLE public.terceiros TO authenticated;
GRANT SELECT ON TABLE public.terceiros TO authenticated;
GRANT TRIGGER ON TABLE public.terceiros TO authenticated;
GRANT TRUNCATE ON TABLE public.terceiros TO authenticated;
GRANT UPDATE ON TABLE public.terceiros TO authenticated;
GRANT DELETE ON TABLE public.terceiros TO service_role;
GRANT INSERT ON TABLE public.terceiros TO service_role;
GRANT MAINTAIN ON TABLE public.terceiros TO service_role;
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
GRANT MAINTAIN ON TABLE public.user_roles TO anon;
GRANT REFERENCES ON TABLE public.user_roles TO anon;
GRANT SELECT ON TABLE public.user_roles TO anon;
GRANT TRIGGER ON TABLE public.user_roles TO anon;
GRANT TRUNCATE ON TABLE public.user_roles TO anon;
GRANT UPDATE ON TABLE public.user_roles TO anon;
GRANT DELETE ON TABLE public.user_roles TO authenticated;
GRANT INSERT ON TABLE public.user_roles TO authenticated;
GRANT MAINTAIN ON TABLE public.user_roles TO authenticated;
GRANT REFERENCES ON TABLE public.user_roles TO authenticated;
GRANT SELECT ON TABLE public.user_roles TO authenticated;
GRANT TRIGGER ON TABLE public.user_roles TO authenticated;
GRANT TRUNCATE ON TABLE public.user_roles TO authenticated;
GRANT UPDATE ON TABLE public.user_roles TO authenticated;
GRANT DELETE ON TABLE public.user_roles TO service_role;
GRANT INSERT ON TABLE public.user_roles TO service_role;
GRANT MAINTAIN ON TABLE public.user_roles TO service_role;
GRANT REFERENCES ON TABLE public.user_roles TO service_role;
GRANT SELECT ON TABLE public.user_roles TO service_role;
GRANT TRIGGER ON TABLE public.user_roles TO service_role;
GRANT TRUNCATE ON TABLE public.user_roles TO service_role;
GRANT UPDATE ON TABLE public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
