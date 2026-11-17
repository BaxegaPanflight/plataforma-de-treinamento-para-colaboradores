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
