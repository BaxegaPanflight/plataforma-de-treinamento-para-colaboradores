import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { BookOpen, ArrowRight, Shield, Lock, CheckCircle2, AlertTriangle, Clock, Search, Ban } from "lucide-react";
import { Input } from "@/components/ui/input";
import ScrollReveal from "@/components/lp/ScrollReveal";

export const Route = createFileRoute("/_aluno/aluno/catalogo")({ component: Catalogo });

interface Course {
  id: string;
  titulo: string;
  descricao: string | null;
  capa_url: string | null;
  validade_meses: number;
  nr_codigo: string[];
  carga_horaria_horas: number;
}

type EnrollStatus = "ativo" | "expirando" | "vencido" | "concluido";

interface EnrollmentRow {
  course_id: string;
  status: EnrollStatus;
  due_date: string | null;
  bloqueado_acesso: boolean;
}

interface PathItem {
  course_id: string;
  ordem: number;
  obrigatorio: boolean;
  prerequisite_course_id: string | null;
  compliance_status: string;
  enrollment_status: EnrollStatus | null;
  due_date: string | null;
  curso_titulo: string;
  nr_codigo: string[];
}

function daysLeft(due: string | null) {
  if (!due) return null;
  return Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function Catalogo() {
  const { user } = useAuth();
  const [list, setList] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Map<string, EnrollmentRow>>(new Map());
  const [trail, setTrail] = useState<PathItem[]>([]);
  const [hasJobRole, setHasJobRole] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("courses")
      .select("id, titulo, descricao, capa_url, validade_meses, nr_codigo, carga_horaria_horas")
      .eq("publicado", true);
    setList((data ?? []) as Course[]);

    if (user) {
      const { data: en } = await supabase
        .from("enrollments")
        .select("course_id, status, due_date, bloqueado_acesso")
        .eq("user_id", user.id);
      const map = new Map<string, EnrollmentRow>();
      for (const e of (en ?? []) as EnrollmentRow[]) map.set(e.course_id, e);
      setEnrollments(map);

      // compliance view for "Minha Trilha"
      const { data: comp } = await supabase
        .from("vw_compliance")
        .select("course_id, ordem, obrigatorio, prerequisite_course_id, compliance_status, enrollment_status, due_date, curso_titulo, nr_codigo")
        .eq("user_id", user.id)
        .order("ordem");

      if (comp?.length) {
        setHasJobRole(true);
        setTrail(comp as PathItem[]);
      } else {
        // Check if user has a job_role_id at all (might have role but empty path)
        const { data: p } = await supabase.from("profiles").select("job_role_id").eq("id", user.id).maybeSingle();
        setHasJobRole(!!p?.job_role_id);
      }
    }
  };

  useEffect(() => { load(); }, [user]);

  const enroll = async (courseId: string, validade: number, titulo: string) => {
    if (!user) return;
    let due_date: string | null = null;
    if (validade > 0) {
      const due = new Date(); due.setMonth(due.getMonth() + validade);
      due_date = due.toISOString().slice(0, 10);
    }
    const { error } = await supabase.from("enrollments").insert({ user_id: user.id, course_id: courseId, due_date });
    if (error) return toast.error(error.message);
    toast.success("Matrícula realizada");
    supabase.functions.invoke("send-notification", {
      body: { template: "matricula_realizada", payload: { curso: titulo, due_date: due_date ?? null } },
    });
    load();
  };

  const statusBadge = (s: EnrollStatus) => {
    if (s === "expirando") return <Badge className="bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/15 border-yellow-500/30">Expirando</Badge>;
    if (s === "vencido") return <Badge variant="destructive">Vencido</Badge>;
    return null;
  };

  const complianceBadge = (status: string, due: string | null) => {
    const days = daysLeft(due);
    if (status === "concluido") return <Badge className="bg-accent-success/10 text-accent-success border-accent-success/20"><CheckCircle2 className="h-3 w-3 mr-1" />Concluído</Badge>;
    if (status === "vencido") return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Vencido</Badge>;
    if (status === "em_andamento") {
      if (days !== null && days <= 15) return <Badge className="bg-yellow-500/15 text-yellow-600 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" />{days}d restantes</Badge>;
      return <Badge variant="secondary">Em andamento</Badge>;
    }
    return <Badge variant="outline" className="text-text-tertiary">Pendente</Badge>;
  };

  // Determine if prerequisite is met for a trail item
  const isUnlocked = (item: PathItem) => {
    if (!item.prerequisite_course_id) return true;
    const prereq = trail.find((t) => t.course_id === item.prerequisite_course_id);
    return prereq?.compliance_status === "concluido";
  };

  const defaultTab = hasJobRole ? "trilha" : "catalogo";

  const q = search.toLowerCase().trim();
  const filtered = q
    ? list.filter((c) =>
        c.titulo.toLowerCase().includes(q) ||
        (c.descricao ?? "").toLowerCase().includes(q) ||
        (c.nr_codigo ?? []).some((nr) => nr.toLowerCase().includes(q))
      )
    : list;

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Treinamentos</span>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Catálogo</h1>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          {hasJobRole && <TabsTrigger value="trilha">Minha Trilha NR</TabsTrigger>}
          <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
        </TabsList>

        {/* ---- MINHA TRILHA ---- */}
        {hasJobRole && (
          <TabsContent value="trilha" className="pt-4">
            {!trail.length ? (
              <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm">
                Nenhum curso obrigatório definido para seu cargo ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {trail.map((item, idx) => {
                  const unlocked = isUnlocked(item);
                  const enr = enrollments.get(item.course_id);
                  const days = daysLeft(item.due_date);
                  return (
                    <ScrollReveal key={item.course_id} delay={idx * 0.05}>
                      <div className={`lp-solid-card p-4 sm:p-5 flex gap-4 items-start ${!unlocked ? "opacity-60" : ""}`}>
                        {/* Step number */}
                        <div className={`h-9 w-9 rounded-full shrink-0 grid place-items-center text-sm font-bold border-2 ${
                          item.compliance_status === "concluido" ? "bg-accent-success/10 border-accent-success text-accent-success" :
                          item.compliance_status === "vencido" ? "bg-destructive/10 border-destructive text-destructive" :
                          "bg-accent-primary/10 border-accent-primary text-accent-primary"
                        }`}>
                          {item.compliance_status === "concluido" ? <CheckCircle2 className="h-4 w-4" /> : !unlocked ? <Lock className="h-3.5 w-3.5" /> : item.ordem + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-text-primary">{item.curso_titulo}</span>
                            {item.obrigatorio && (
                              <Badge className="text-[10px] bg-destructive/10 text-destructive border-destructive/20 py-0">Obrigatório</Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {item.nr_codigo?.map((nr) => (
                              <Badge key={nr} variant="secondary" className="text-[10px] bg-accent-primary/10 text-accent-primary border-accent-primary/20 font-mono py-0">
                                <Shield className="h-2.5 w-2.5 mr-0.5" />{nr}
                              </Badge>
                            ))}
                            {complianceBadge(item.compliance_status, item.due_date)}
                            {item.due_date && item.compliance_status !== "concluido" && (
                              <span className="text-xs text-text-tertiary">Prazo: {fmt(item.due_date)}{days !== null && days <= 30 ? ` (${days}d)` : ""}</span>
                            )}
                          </div>

                          {!unlocked && (
                            <p className="text-xs text-text-tertiary mt-1.5">
                              Conclua o passo anterior para desbloquear.
                            </p>
                          )}
                        </div>

                        <div className="shrink-0">
                          {enr?.bloqueado_acesso ? (
                            <Button size="sm" variant="outline" disabled>
                              <Ban className="h-3.5 w-3.5 text-destructive mr-1" />Bloqueado
                            </Button>
                          ) : unlocked ? (
                            item.compliance_status === "pendente" && !enr ? (
                              <Button size="sm" variant="lp-primary" onClick={() => enroll(item.course_id, 0, item.curso_titulo)}>
                                Matricular
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" asChild>
                                <Link to="/aluno/curso/$id" params={{ id: item.course_id }}>
                                  {item.compliance_status === "concluido" ? "Rever" : "Continuar"} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                                </Link>
                              </Button>
                            )
                          ) : (
                            <Button size="sm" variant="outline" disabled>
                              <Lock className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            )}
          </TabsContent>
        )}

        {/* ---- CATÁLOGO LIVRE ---- */}
        <TabsContent value="catalogo" className="pt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, NR ou descrição…"
              className="pl-9"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((c, i) => {
              const enr = enrollments.get(c.id);
              return (
                <ScrollReveal key={c.id} delay={i * 0.06}>
                  <div className="lp-solid-card overflow-hidden flex flex-col h-full">
                    <Link to="/aluno/preview/$id" params={{ id: c.id }} className="aspect-[16/9] bg-gradient-to-br from-accent-primary/20 via-accent-primary/10 to-bg-surface-2 grid place-items-center overflow-hidden">
                      {c.capa_url ? (
                        <img src={c.capa_url} alt={c.titulo} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <BookOpen className="h-10 w-10 text-accent-primary/60" />
                      )}
                    </Link>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-widest">
                          {c.validade_meses ? `${c.validade_meses} meses` : "Sem validade"}
                        </Badge>
                        {c.carga_horaria_horas > 0 && (
                          <Badge variant="secondary" className="text-[10px]">{c.carga_horaria_horas}h</Badge>
                        )}
                        {c.nr_codigo?.map((nr) => (
                          <Badge key={nr} variant="secondary" className="text-[10px] bg-accent-primary/10 text-accent-primary border-accent-primary/20 font-mono py-0">
                            <Shield className="h-2.5 w-2.5 mr-0.5" />{nr}
                          </Badge>
                        ))}
                        {enr && statusBadge(enr.status)}
                      </div>
                      <Link to="/aluno/preview/$id" params={{ id: c.id }} className="hover:text-accent-primary transition-colors">
                        <h3 className="font-semibold text-text-primary leading-snug">{c.titulo}</h3>
                      </Link>
                      <p className="mt-1.5 text-sm text-text-secondary line-clamp-2 flex-1">{c.descricao}</p>
                      <div className="mt-4">
                        {enr?.bloqueado_acesso ? (
                          <Button variant="outline" className="w-full cursor-not-allowed opacity-70" disabled>
                            <Ban className="h-4 w-4 mr-2 text-destructive" />Acesso bloqueado
                          </Button>
                        ) : enr ? (
                          <Button asChild variant="lp-primary" className="w-full">
                            <Link to="/aluno/curso/$id" params={{ id: c.id }}>
                              Continuar curso <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                          </Button>
                        ) : (
                          <Button asChild variant="lp-primary" className="w-full">
                            <Link to="/aluno/preview/$id" params={{ id: c.id }}>
                              Ver detalhes <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
            {!filtered.length && (
              <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm sm:col-span-2">
                {search ? "Nenhum curso encontrado para esta busca." : "Nenhum curso publicado no momento."}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
