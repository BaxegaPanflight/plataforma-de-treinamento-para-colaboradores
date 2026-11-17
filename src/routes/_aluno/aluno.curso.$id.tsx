import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Video, FileText, Music, LayoutDashboard, Link2, AlignLeft,
  Check, CheckCircle2, ArrowLeft, Download, ExternalLink, ListChecks, AlertTriangle, ChevronDown, Shield, Clock, Loader2, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_aluno/aluno/curso/$id")({ component: CoursePlayer });

type LessonType = "panda" | "pdf" | "audio" | "slides" | "link" | "rich_text";
type EnrollStatus = "ativo" | "concluido" | "expirando" | "vencido";

interface Course {
  id: string;
  titulo: string;
  descricao: string | null;
  progresso_minimo_pct: number;
  nota_minima: number;
  emite_certificado: boolean;
  validade_meses: number;
  nr_codigo: string[] | null;
  carga_horaria_horas: number | null;
}

interface Enrollment {
  id: string;
  status: EnrollStatus;
  due_date: string | null;
  courses: Course | null;
}

interface Lesson {
  id: string;
  module_id: string;
  titulo: string;
  tipo: LessonType;
  ordem: number;
  obrigatoria: boolean;
  panda_lessons: { panda_video_id: string; duracao_seg: number | null }[] | null;
  file_lessons: { storage_path: string; mime_type: string | null }[] | null;
  link_lessons: { url: string }[] | null;
  rich_lessons: { conteudo_html: string }[] | null;
}

interface Module {
  id: string;
  course_id: string;
  titulo: string;
  ordem: number;
  lessons: Lesson[];
}

const LESSON_ICON: Record<LessonType, typeof Video> = {
  panda: Video, pdf: FileText, audio: Music, slides: LayoutDashboard, link: Link2, rich_text: AlignLeft,
};

function CoursePlayer() {
  const { id: courseId } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [renewing, setRenewing] = useState(false);

  const flatLessons = useMemo(() => modules.flatMap((m) => m.lessons), [modules]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data: enr } = await supabase
      .from("enrollments")
      .select("id, status, due_date, courses(id, titulo, descricao, progresso_minimo_pct, nota_minima, emite_certificado, validade_meses, nr_codigo, carga_horaria_horas)")
      .eq("course_id", courseId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!enr) {
      nav({ to: "/aluno/catalogo" });
      return;
    }
    setEnrollment(enr as unknown as Enrollment);

    const { data: mods } = await supabase
      .from("modules")
      .select("*, lessons(*, panda_lessons(*), file_lessons(*), link_lessons(*), rich_lessons(*))")
      .eq("course_id", courseId)
      .order("ordem");

    const sorted = ((mods ?? []) as Module[]).map((m) => ({
      ...m,
      lessons: [...(m.lessons ?? [])].sort((a, b) => a.ordem - b.ordem),
    }));
    setModules(sorted);

    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id, concluida")
      .eq("enrollment_id", (enr as { id: string }).id);
    const doneSet = new Set((progress ?? []).filter((p) => p.concluida).map((p) => p.lesson_id));
    setCompleted(doneSet);

    // auto-select first incomplete or first lesson
    const all = sorted.flatMap((m) => m.lessons);
    const firstIncomplete = all.find((l) => !doneSet.has(l.id)) ?? all[0];
    if (firstIncomplete) setActiveLessonId((curr) => curr ?? firstIncomplete.id);

    setLoading(false);
  }, [courseId, user, nav]);

  useEffect(() => { load(); }, [load]);

  const activeLesson = useMemo(
    () => flatLessons.find((l) => l.id === activeLessonId) ?? null,
    [flatLessons, activeLessonId]
  );

  // when active lesson changes, ensure a progress row exists
  useEffect(() => {
    if (!enrollment || !activeLesson) return;
    if (completed.has(activeLesson.id)) return;
    supabase.from("lesson_progress").upsert(
      { enrollment_id: enrollment.id, lesson_id: activeLesson.id, concluida: false, watch_pct: 0 },
      { onConflict: "enrollment_id,lesson_id" }
    ).then(({ error }) => { if (error) console.error(error); });
  }, [activeLesson, enrollment, completed]);

  const markComplete = useCallback(async (lessonId: string) => {
    if (!enrollment) return;
    const { error } = await supabase.from("lesson_progress").upsert(
      {
        enrollment_id: enrollment.id, lesson_id: lessonId,
        concluida: true, watch_pct: 100, completed_at: new Date().toISOString(),
      },
      { onConflict: "enrollment_id,lesson_id" }
    );
    if (error) return toast.error("Erro ao salvar progresso");
    setCompleted((s) => new Set(s).add(lessonId));
  }, [enrollment]);

  const handleRenew = useCallback(async () => {
    if (!enrollment) return;
    setRenewing(true);
    try {
      const { error } = await supabase.functions.invoke("renew-enrollment", {
        body: { course_id: courseId },
      });
      if (error) throw new Error(error.message);
      toast.success("Matrícula renovada! Recomeçando o treinamento.");
      setCompleted(new Set());
      setActiveLessonId(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao renovar matrícula");
    } finally {
      setRenewing(false);
    }
  }, [enrollment, courseId, load]);

  if (loading || !enrollment || !enrollment.courses) {
    return <div className="text-text-secondary text-sm">Carregando…</div>;
  }

  const course = enrollment.courses;
  const total = flatLessons.length;
  const progressPct = total > 0 ? Math.round((completed.size / total) * 100) : 0;
  const canTakeExam = total > 0 && progressPct >= course.progresso_minimo_pct;

  const daysLeft = enrollment.due_date
    ? Math.ceil((new Date(enrollment.due_date).getTime() - Date.now()) / 86400000)
    : null;
  const isUrgent = enrollment.status === "expirando" || (daysLeft !== null && daysLeft <= 15 && daysLeft > 0);

  return (
    <div className="space-y-4">
      <div>
        <Link to="/aluno/meus-cursos" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent-primary">
          <ArrowLeft className="h-3.5 w-3.5" /> Meus cursos
        </Link>
      </div>

      {/* NR header bar */}
      {course.nr_codigo?.length ? (
        <div className="lp-solid-card px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-text-tertiary font-semibold shrink-0">Normas Regulamentadoras</span>
          <div className="flex flex-wrap gap-1.5">
            {course.nr_codigo.map((nr) => (
              <Badge key={nr} variant="secondary" className="text-xs bg-accent-primary/10 text-accent-primary border-accent-primary/20 font-mono">
                <Shield className="h-3 w-3 mr-1" />{nr}
              </Badge>
            ))}
          </div>
          {course.carga_horaria_horas ? (
            <span className="text-xs text-text-tertiary ml-auto shrink-0">{course.carga_horaria_horas}h</span>
          ) : null}
        </div>
      ) : null}

      {/* Urgency banner */}
      {isUrgent && enrollment.status !== "vencido" && (
        <div className="lp-solid-card p-4 flex items-start gap-3 border-yellow-500/40 bg-yellow-500/5">
          <Clock className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-semibold text-text-primary">
              {daysLeft !== null && daysLeft <= 15
                ? `Treinamento vence em ${daysLeft} dia${daysLeft !== 1 ? "s" : ""}!`
                : "Treinamento expirando em breve"}
            </div>
            <div className="text-text-secondary">Conclua o curso para manter a conformidade com as normas NR.</div>
          </div>
        </div>
      )}

      {enrollment.status === "vencido" && (
        <div className="lp-solid-card p-4 flex items-start gap-3 border-destructive/40">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm flex-1">
            <div className="font-semibold text-text-primary">Matrícula vencida</div>
            <div className="text-text-secondary">Renove para recomeçar o treinamento e emitir novo certificado.</div>
          </div>
          <Button size="sm" variant="destructive" onClick={handleRenew} disabled={renewing} className="shrink-0 gap-1.5">
            {renewing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {renewing ? "Renovando…" : "Renovar"}
          </Button>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[18rem_1fr] lg:gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="lp-solid-card p-4 sticky top-20 space-y-4">
            <div>
              <div className="font-semibold text-text-primary leading-snug">{course.titulo}</div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 rounded-full bg-bg-surface-2 overflow-hidden flex-1">
                  <div className="h-full bg-accent-primary transition-all" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="text-[11px] text-text-tertiary tabular-nums">{progressPct}%</span>
              </div>
              <div className="text-xs text-text-tertiary mt-1">{progressPct}% concluído</div>
            </div>
            <LessonList
              modules={modules}
              activeId={activeLessonId}
              completed={completed}
              onSelect={setActiveLessonId}
            />
            {canTakeExam ? (
              <Button asChild variant="lp-primary" className="w-full">
                <Link to="/aluno/prova/$id" params={{ id: courseId }}>
                  <ListChecks className="h-4 w-4 mr-2" />
                  Iniciar prova →
                </Link>
              </Button>
            ) : (
              <div className="text-xs text-text-tertiary text-center">
                Complete {course.progresso_minimo_pct}% do curso para liberar a prova
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="space-y-4">
          {activeLesson ? (
            <LessonPlayer
              lesson={activeLesson}
              completed={completed.has(activeLesson.id)}
              onComplete={() => markComplete(activeLesson.id)}
            />
          ) : (
            <div className="lp-solid-card p-12 text-center text-text-tertiary">Nenhuma aula disponível.</div>
          )}

          {canTakeExam && (
            <div className="lp-solid-card p-5 border-accent-primary/40 bg-accent-primary/5">
              <div className="font-semibold text-text-primary">Você atingiu o progresso mínimo!</div>
              <div className="text-sm text-text-secondary mb-3">Pronto para fazer a prova e conquistar o certificado.</div>
              <Button asChild variant="lp-primary">
                <Link to="/aluno/prova/$id" params={{ id: courseId }}>
                  <ListChecks className="h-4 w-4 mr-2" /> Iniciar prova →
                </Link>
              </Button>
            </div>
          )}

          {/* Mobile lesson list */}
          <div className="lg:hidden">
            <Collapsible>
              <div className="lp-solid-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-1.5 rounded-full bg-bg-surface-2 overflow-hidden flex-1">
                    <div className="h-full bg-accent-primary" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span className="text-[11px] text-text-tertiary tabular-nums">{progressPct}%</span>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <ChevronDown className="h-4 w-4 mr-2" /> Ver aulas
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <LessonList
                    modules={modules}
                    activeId={activeLessonId}
                    completed={completed}
                    onSelect={setActiveLessonId}
                  />
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        </main>
      </div>
    </div>
  );
}

function LessonList({
  modules, activeId, completed, onSelect,
}: {
  modules: Module[];
  activeId: string | null;
  completed: Set<string>;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {modules.map((m, i) => (
        <div key={m.id}>
          <div className="text-[11px] uppercase tracking-widest text-text-tertiary font-semibold px-1 mb-1">
            {i + 1}. {m.titulo}
          </div>
          <div className="space-y-0.5">
            {m.lessons.map((l) => {
              const Icon = LESSON_ICON[l.tipo];
              const isActive = l.id === activeId;
              const isDone = completed.has(l.id);
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onSelect(l.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm transition-colors ${
                    isActive
                      ? "bg-accent-primary/10 text-accent-primary font-medium"
                      : "text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate flex-1">{l.titulo}</span>
                  {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                </button>
              );
            })}
            {m.lessons.length === 0 && (
              <div className="text-xs text-text-tertiary px-2 py-1">Sem aulas</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function LessonPlayer({
  lesson, completed, onComplete,
}: {
  lesson: Lesson;
  completed: boolean;
  onComplete: () => void;
}) {
  const Icon = LESSON_ICON[lesson.tipo];

  // Auto-complete rich_text after 3s
  useEffect(() => {
    if (lesson.tipo !== "rich_text" || completed) return;
    const t = setTimeout(() => onComplete(), 3000);
    return () => clearTimeout(t);
  }, [lesson.id, lesson.tipo, completed, onComplete]);

  const completeBtn = (
    <Button
      variant={completed ? "secondary" : "lp-primary"}
      disabled={completed}
      onClick={onComplete}
      className={completed ? "bg-green-500/15 text-green-600 hover:bg-green-500/15" : ""}
    >
      <Check className="h-4 w-4 mr-2" />
      {completed ? "Aula concluída" : "Marcar aula como concluída"}
    </Button>
  );

  return (
    <div className="lp-solid-card p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-[10px] uppercase tracking-widest">
          <Icon className="h-3 w-3 mr-1" />
          {lesson.tipo}
        </Badge>
        {completed && <Badge className="bg-green-500/15 text-green-600 hover:bg-green-500/15 border-green-500/30 text-[10px]">Concluída</Badge>}
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">{lesson.titulo}</h2>

      <LessonBody lesson={lesson} onComplete={onComplete} />

      {["panda", "pdf", "slides", "link"].includes(lesson.tipo) && (
        <div className="pt-2">{completeBtn}</div>
      )}
    </div>
  );
}

function LessonBody({ lesson, onComplete }: { lesson: Lesson; onComplete: () => void }) {
  if (lesson.tipo === "panda") {
    const v = lesson.panda_lessons?.[0]?.panda_video_id;
    if (!v) return <Empty msg="Vídeo não configurado" />;
    const src = v.startsWith("http")
      ? v
      : `https://player-vz-e5a02b3b-2b4.tv.pandavideo.com.br/embed/?v=${v}`;
    return (
      <iframe
        src={src}
        width="100%"
        className="aspect-video rounded-xl border border-border-subtle"
        allow="autoplay; fullscreen"
        allowFullScreen
        title={lesson.titulo}
      />
    );
  }

  if (lesson.tipo === "pdf" || lesson.tipo === "slides") {
    const path = lesson.file_lessons?.[0]?.storage_path;
    if (!path) return <Empty msg="Arquivo não disponível" />;
    const { data } = supabase.storage.from("lesson-files").getPublicUrl(path);
    return (
      <div className="space-y-2">
        <iframe src={data.publicUrl} className="w-full h-[70vh] rounded-xl border border-border-subtle" title={lesson.titulo} />
        <a href={data.publicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-accent-primary hover:underline">
          <Download className="h-3.5 w-3.5" /> Baixar arquivo
        </a>
      </div>
    );
  }

  if (lesson.tipo === "audio") {
    const path = lesson.file_lessons?.[0]?.storage_path;
    if (!path) return <Empty msg="Áudio não disponível" />;
    const { data } = supabase.storage.from("lesson-files").getPublicUrl(path);
    return <audio controls className="w-full" src={data.publicUrl} onEnded={onComplete} />;
  }

  if (lesson.tipo === "link") {
    const url = lesson.link_lessons?.[0]?.url;
    if (!url) return <Empty msg="Link não configurado" />;
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="lp-solid-card p-6 flex items-center justify-between gap-4 hover:border-accent-primary/50 transition-colors"
      >
        <div className="min-w-0">
          <div className="font-semibold text-text-primary">Abrir link externo</div>
          <div className="text-sm text-text-secondary truncate">{url}</div>
        </div>
        <ExternalLink className="h-5 w-5 text-accent-primary shrink-0" />
      </a>
    );
  }

  if (lesson.tipo === "rich_text") {
    const html = lesson.rich_lessons?.[0]?.conteudo_html ?? "";
    return (
      <div
        className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-text-primary"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return null;
}

function Empty({ msg }: { msg: string }) {
  return <div className="lp-solid-card p-8 text-center text-text-tertiary text-sm">{msg}</div>;
}