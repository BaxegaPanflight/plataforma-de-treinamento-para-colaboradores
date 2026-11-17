import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, Clock, Shield, Award, ChevronDown, ChevronRight,
  Video, FileText, Music, Link2, AlignLeft, LayoutDashboard,
  ArrowLeft, UserCheck, GraduationCap, Loader2, Lock,
} from "lucide-react";
import { toast } from "sonner";
import ScrollReveal from "@/components/lp/ScrollReveal";

export const Route = createFileRoute("/_aluno/aluno/preview/$id")({ component: CoursePreview });

interface CourseDetail {
  id: string;
  titulo: string;
  descricao: string | null;
  capa_url: string | null;
  nr_codigo: string[] | null;
  carga_horaria_horas: number | null;
  validade_meses: number;
  modalidade: string | null;
  emite_certificado: boolean;
  nota_minima: number;
  instrutor_nome: string | null;
  instrutor_habilitacao: string | null;
}

interface ModuleLite {
  id: string;
  titulo: string;
  ordem: number;
  lessons: { id: string; titulo: string; tipo: string; obrigatoria: boolean }[];
}

const TIPO_ICON: Record<string, React.ElementType> = {
  panda: Video, pdf: FileText, audio: Music,
  slides: LayoutDashboard, link: Link2, rich_text: AlignLeft,
};

const TIPO_LABEL: Record<string, string> = {
  panda: "Vídeo", pdf: "PDF", audio: "Áudio",
  slides: "Slides", link: "Link", rich_text: "Texto",
};

const MODALIDADE_LABEL: Record<string, string> = {
  ead: "EAD — Online", presencial: "Presencial", hibrido: "Híbrido",
};

function CoursePreview() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [modules, setModules] = useState<ModuleLite[]>([]);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [enrolledStatus, setEnrolledStatus] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const [{ data: c }, { data: mods }] = await Promise.all([
        supabase.from("courses").select(
          "id, titulo, descricao, capa_url, nr_codigo, carga_horaria_horas, validade_meses, modalidade, emite_certificado, nota_minima, instrutor_nome, instrutor_habilitacao"
        ).eq("id", id).maybeSingle(),
        supabase.from("modules")
          .select("id, titulo, ordem, lessons(id, titulo, tipo, obrigatoria)")
          .eq("course_id", id)
          .order("ordem"),
      ]);

      if (!c) { nav({ to: "/aluno/catalogo" }); return; }
      setCourse(c as CourseDetail);

      const sorted = (mods ?? []).map((m: any) => ({
        ...m,
        lessons: [...(m.lessons ?? [])].sort((a: any, b: any) => (a.ordem ?? 0) - (b.ordem ?? 0)),
      })).sort((a: any, b: any) => a.ordem - b.ordem);
      setModules(sorted as ModuleLite[]);

      if (user) {
        const { data: enr } = await supabase
          .from("enrollments")
          .select("id, status")
          .eq("user_id", user.id)
          .eq("course_id", id)
          .maybeSingle();
        if (enr) { setEnrollmentId(enr.id); setEnrolledStatus(enr.status); }
      }

      setLoading(false);
      // Open first module by default
      if (sorted.length) setOpenModules(new Set([sorted[0].id]));
    })();
  }, [id, user]);

  const enroll = async () => {
    if (!user || !course) return;
    setEnrolling(true);
    let due_date: string | null = null;
    if (course.validade_meses > 0) {
      const d = new Date();
      d.setMonth(d.getMonth() + course.validade_meses);
      due_date = d.toISOString().slice(0, 10);
    }
    const { data, error } = await supabase
      .from("enrollments")
      .insert({ user_id: user.id, course_id: id, due_date })
      .select("id, status")
      .single();
    setEnrolling(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Matrícula realizada! Bom estudo.");
    setEnrollmentId(data.id);
    setEnrolledStatus(data.status);
  };

  const toggleModule = (mid: string) =>
    setOpenModules((prev) => {
      const s = new Set(prev);
      s.has(mid) ? s.delete(mid) : s.add(mid);
      return s;
    });

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-text-tertiary">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  const isEnrolled = !!enrollmentId;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <Link to="/aluno/catalogo" className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />Voltar ao catálogo
      </Link>

      {/* Hero */}
      <ScrollReveal variant="fade-up">
        <div className="lp-solid-card overflow-hidden">
          {course.capa_url ? (
            <div className="aspect-[21/6] overflow-hidden">
              <img src={course.capa_url} alt={course.titulo} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-[21/6] bg-gradient-to-br from-accent-primary/20 via-accent-primary/10 to-bg-surface-2 grid place-items-center">
              <BookOpen className="h-16 w-16 text-accent-primary/40" />
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {course.nr_codigo?.map((nr) => (
                <Badge key={nr} variant="secondary" className="text-xs bg-accent-primary/10 text-accent-primary border-accent-primary/20 font-mono">
                  <Shield className="h-3 w-3 mr-1" />{nr}
                </Badge>
              ))}
              {course.modalidade && (
                <Badge variant="outline" className="text-xs">{MODALIDADE_LABEL[course.modalidade] ?? course.modalidade}</Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">{course.titulo}</h1>

            {course.descricao && (
              <p className="mt-3 text-text-secondary leading-relaxed">{course.descricao}</p>
            )}

            {/* Meta row */}
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-text-secondary">
              {course.carga_horaria_horas != null && course.carga_horaria_horas > 0 && (
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-accent-primary" />{course.carga_horaria_horas}h de conteúdo</span>
              )}
              <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-accent-primary" />{modules.length} módulo{modules.length !== 1 ? "s" : ""} · {totalLessons} aula{totalLessons !== 1 ? "s" : ""}</span>
              {course.emite_certificado && (
                <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-accent-primary" />Certificado ao concluir</span>
              )}
              {course.validade_meses > 0 && (
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-text-tertiary" />Válido por {course.validade_meses} meses</span>
              )}
            </div>

            {/* Instructor */}
            {course.instrutor_nome && (
              <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
                <UserCheck className="h-4 w-4 text-accent-primary shrink-0" />
                <span><strong>{course.instrutor_nome}</strong>{course.instrutor_habilitacao ? ` — ${course.instrutor_habilitacao}` : ""}</span>
              </div>
            )}

            {/* CTA */}
            <div className="mt-6 flex items-center gap-3 flex-wrap">
              {isEnrolled ? (
                <Button variant="lp-primary" size="lg" asChild>
                  <Link to="/aluno/curso/$id" params={{ id }}>
                    <GraduationCap className="h-5 w-5 mr-2" />
                    {enrolledStatus === "concluido" ? "Rever curso" : "Continuar curso"}
                  </Link>
                </Button>
              ) : (
                <Button variant="lp-primary" size="lg" onClick={enroll} disabled={enrolling}>
                  {enrolling
                    ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Matriculando…</>
                    : <><GraduationCap className="h-5 w-5 mr-2" />Matricular-se gratuitamente</>
                  }
                </Button>
              )}
              {isEnrolled && (
                <Badge variant="secondary" className="bg-accent-success/10 text-accent-success border-accent-success/20 text-sm px-3 py-1">
                  ✓ Você está matriculado
                </Badge>
              )}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Module list */}
      <ScrollReveal variant="fade-up" delay={0.08}>
        <div className="lp-solid-card p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Conteúdo do curso</h2>
          <div className="space-y-2">
            {modules.length === 0 ? (
              <p className="text-sm text-text-tertiary">Nenhum módulo publicado ainda.</p>
            ) : modules.map((m) => {
              const open = openModules.has(m.id);
              return (
                <div key={m.id} className="rounded-xl border border-border-subtle overflow-hidden">
                  <button
                    onClick={() => toggleModule(m.id)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-bg-surface-2/50 hover:bg-muted/10 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {open ? <ChevronDown className="h-4 w-4 text-text-tertiary shrink-0" /> : <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />}
                      <span className="font-semibold text-sm text-text-primary truncate">{m.titulo}</span>
                    </div>
                    <span className="text-xs text-text-tertiary shrink-0 ml-3">{m.lessons.length} aula{m.lessons.length !== 1 ? "s" : ""}</span>
                  </button>

                  {open && (
                    <div className="divide-y divide-border-subtle">
                      {m.lessons.map((l) => {
                        const Icon = TIPO_ICON[l.tipo] ?? FileText;
                        return (
                          <div key={l.id} className="flex items-center gap-3 px-4 py-2.5">
                            <Lock className="h-3.5 w-3.5 text-text-tertiary/50 shrink-0" />
                            <Icon className="h-3.5 w-3.5 text-accent-primary/60 shrink-0" />
                            <span className="text-sm text-text-secondary flex-1 truncate">{l.titulo}</span>
                            <span className="text-[11px] text-text-tertiary shrink-0">{TIPO_LABEL[l.tipo] ?? l.tipo}</span>
                            {l.obrigatoria && (
                              <Badge variant="outline" className="text-[10px] py-0 shrink-0">Obrigatória</Badge>
                            )}
                          </div>
                        );
                      })}
                      {m.lessons.length === 0 && (
                        <p className="px-4 py-3 text-xs text-text-tertiary">Nenhuma aula neste módulo.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Bottom CTA */}
      {!isEnrolled && (
        <ScrollReveal variant="fade-up" delay={0.12}>
          <div className="lp-solid-card p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-semibold text-text-primary">Pronto para começar?</p>
              <p className="text-sm text-text-secondary mt-0.5">Matrícula gratuita — acesso imediato ao conteúdo.</p>
            </div>
            <Button variant="lp-primary" size="lg" onClick={enroll} disabled={enrolling}>
              {enrolling
                ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Matriculando…</>
                : <><GraduationCap className="h-5 w-5 mr-2" />Matricular-se</>
              }
            </Button>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
