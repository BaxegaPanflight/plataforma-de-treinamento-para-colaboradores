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
