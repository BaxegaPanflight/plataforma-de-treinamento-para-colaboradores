import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  Users, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, CalendarDays,
  ChevronDown, ChevronUp, ArrowRight, Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ScrollReveal from "@/components/lp/ScrollReveal";

export const Route = createFileRoute("/_admin/admin/gestor")({ component: GestorHome });

interface GestorProfile { setor: string | null; cargo: string | null; nome: string | null }

interface CompRow {
  user_id: string;
  nome: string;
  cargo: string | null;
  job_role_nome: string;
  course_id: string;
  curso_titulo: string;
  nr_codigo: string[] | null;
  compliance_status: string;
  due_date: string | null;
}

interface ColabItem {
  user_id: string;
  nome: string;
  cargo: string | null;
  job_role_nome: string;
  total: number;
  concluido: number;
  vencido: number;
  pendente: number;
  em_andamento: number;
  items: CompRow[];
}

function daysLeft(due: string | null) {
  if (!due) return null;
  return Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
}

function overallStatus(u: ColabItem): "ok" | "warning" | "danger" {
  if (u.vencido > 0) return "danger";
  if (u.pendente > 0 || u.em_andamento > 0) return "warning";
  return "ok";
}

function GestorHome() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<GestorProfile | null>(null);
  const [rows, setRows] = useState<CompRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("setor, cargo, nome")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(prof as GestorProfile | null);

      if (!prof?.setor) { setLoading(false); return; }

      const { data } = await supabase
        .from("vw_compliance")
        .select("user_id, nome, cargo, job_role_nome, course_id, curso_titulo, nr_codigo, compliance_status, due_date")
        .eq("setor", prof.setor)
        .order("nome");

      setRows((data ?? []) as CompRow[]);
      setLoading(false);
    })();
  }, [user]);

  const colabs: ColabItem[] = useMemo(() => {
    const map = new Map<string, ColabItem>();
    for (const r of rows) {
      if (!map.has(r.user_id)) {
        map.set(r.user_id, {
          user_id: r.user_id, nome: r.nome, cargo: r.cargo, job_role_nome: r.job_role_nome,
          total: 0, concluido: 0, vencido: 0, pendente: 0, em_andamento: 0, items: [],
        });
      }
      const u = map.get(r.user_id)!;
      u.total++;
      u.items.push(r);
      if (r.compliance_status === "concluido")       u.concluido++;
      else if (r.compliance_status === "vencido")    u.vencido++;
      else if (r.compliance_status === "em_andamento") u.em_andamento++;
      else                                            u.pendente++;
    }
    return [...map.values()].sort((a, b) => {
      const order = { danger: 0, warning: 1, ok: 2 };
      return order[overallStatus(a)] - order[overallStatus(b)];
    });
  }, [rows]);

  const total     = colabs.length;
  const conforme  = colabs.filter((u) => overallStatus(u) === "ok").length;
  const vencidos  = colabs.filter((u) => overallStatus(u) === "danger").length;
  const expirando = rows.filter((r) => {
    if (r.compliance_status === "concluido") return false;
    const d = daysLeft(r.due_date);
    return d !== null && d >= 0 && d <= 30;
  }).length;
  const pctOk = total > 0 ? Math.round((conforme / total) * 100) : 0;

  const kpis = [
    { label: "Colaboradores",   value: total,           icon: Users,       tint: "accent-primary" },
    { label: "Em conformidade", value: `${pctOk}%`,     icon: ShieldCheck, tint: "accent-success" },
    { label: "Expirando (30d)", value: expirando,       icon: ShieldAlert, tint: "accent-warm" },
    { label: "Não conformes",   value: vencidos,        icon: ShieldX,     tint: "destructive" },
  ] as const;

  const setor = profile?.setor;

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Gestor</span>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Meu Painel</h1>
        {setor && (
          <p className="text-sm text-text-secondary mt-1">
            Setor: <span className="font-semibold text-text-primary">{setor}</span>
          </p>
        )}
        {!setor && !loading && (
          <p className="text-sm text-text-secondary mt-1">
            Seu perfil não tem setor atribuído.{" "}
            <Link to="/aluno/perfil" className="text-accent-primary hover:underline">Atualizar perfil</Link>
          </p>
        )}
      </div>

      {loading ? (
        <div className="lp-solid-card p-12 flex items-center justify-center gap-2 text-text-tertiary text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      ) : !setor ? null : (
        <>
          {/* KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k, i) => (
              <ScrollReveal key={k.label} delay={i * 0.07}>
                <div className="lp-solid-card p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-widest text-text-tertiary font-semibold">{k.label}</div>
                    <div className={`h-9 w-9 rounded-lg bg-${k.tint}/10 text-${k.tint} grid place-items-center`}>
                      <k.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4 text-3xl font-bold text-text-primary tabular-nums">{k.value}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Team compliance list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-text-primary">Equipe — Conformidade NR</h2>
              <Link to="/admin/conformidade" className="text-xs text-accent-primary hover:underline flex items-center gap-1">
                Ver painel completo <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {colabs.length === 0 ? (
              <div className="lp-solid-card p-10 text-center text-sm text-text-tertiary">
                Nenhum colaborador com trilha NR atribuída neste setor.
              </div>
            ) : (
              <div className="space-y-2">
                {colabs.map((u) => {
                  const overall = overallStatus(u);
                  const open = expanded === u.user_id;
                  return (
                    <ScrollReveal key={u.user_id}>
                      <div className="lp-solid-card overflow-hidden">
                        <div
                          className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-bg-surface-1 transition-colors"
                          onClick={() => setExpanded(open ? null : u.user_id)}
                        >
                          <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${overall === "ok" ? "bg-accent-success" : overall === "danger" ? "bg-destructive" : "bg-accent-warm"}`} />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-text-primary">{u.nome}</div>
                            <div className="text-xs text-text-tertiary mt-0.5">
                              {u.cargo && <span>{u.cargo} · </span>}Trilha: {u.job_role_nome}
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-3 text-xs text-text-tertiary shrink-0">
                            <span className="text-accent-success font-medium">{u.concluido} ✓</span>
                            {u.em_andamento > 0 && <span className="text-accent-primary">{u.em_andamento} ⏳</span>}
                            {u.vencido > 0 && <span className="text-destructive font-medium">{u.vencido} ✗</span>}
                            {u.pendente > 0 && <span>{u.pendente} pend.</span>}
                            <span>/ {u.total}</span>
                          </div>
                          {open ? <ChevronUp className="h-4 w-4 text-text-tertiary shrink-0" /> : <ChevronDown className="h-4 w-4 text-text-tertiary shrink-0" />}
                        </div>

                        {open && (
                          <div className="border-t border-border-subtle px-5 py-4 space-y-2 bg-bg-surface-1/50">
                            {u.items.map((item) => {
                              const days = daysLeft(item.due_date);
                              const sc =
                                item.compliance_status === "concluido" ? "bg-accent-success/10 text-accent-success border-accent-success/20" :
                                item.compliance_status === "vencido"   ? "bg-destructive/10 text-destructive border-destructive/20" :
                                item.compliance_status === "em_andamento" ? "bg-accent-primary/10 text-accent-primary border-accent-primary/20" :
                                "bg-bg-surface-2 text-text-tertiary border-border-subtle";
                              const label =
                                item.compliance_status === "concluido" ? "Concluído" :
                                item.compliance_status === "vencido"   ? "Vencido" :
                                item.compliance_status === "em_andamento" ? "Em andamento" : "Pendente";
                              return (
                                <div key={item.course_id} className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-elevated p-3">
                                  <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border shrink-0 ${sc}`}>
                                    {label}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-text-primary truncate">{item.curso_titulo}</div>
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                      {item.nr_codigo?.map((nr) => (
                                        <Badge key={nr} variant="secondary" className="text-[10px] bg-accent-primary/10 text-accent-primary border-accent-primary/20 font-mono py-0">
                                          {nr}
                                        </Badge>
                                      ))}
                                      {item.due_date && item.compliance_status !== "concluido" && (
                                        <span className={`text-[10px] flex items-center gap-0.5 ${days !== null && days <= 7 ? "text-destructive font-medium" : "text-text-tertiary"}`}>
                                          <CalendarDays className="h-3 w-3" />
                                          {new Date(item.due_date).toLocaleDateString("pt-BR")}
                                          {days !== null && ` (${days}d)`}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {(item.compliance_status === "vencido" || (days !== null && days <= 7 && days >= 0)) && (
                                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Alunos",       sub: "Gerenciar matrículas",        to: "/admin/alunos",       icon: Users },
              { label: "Conformidade", sub: "Painel NR completo",           to: "/admin/conformidade", icon: ShieldCheck },
              { label: "Relatórios",   sub: "Exportar dados do setor",      to: "/admin/relatorios",   icon: ShieldAlert },
            ].map((link) => (
              <Link key={link.to} to={link.to}>
                <div className="lp-solid-card p-4 flex items-center gap-3 hover:border-accent-primary/30 transition-colors group">
                  <link.icon className="h-5 w-5 text-accent-primary/60 group-hover:text-accent-primary transition-colors" />
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{link.label}</div>
                    <div className="text-xs text-text-tertiary">{link.sub}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-accent-primary ml-auto transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
