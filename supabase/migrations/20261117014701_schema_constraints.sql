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
