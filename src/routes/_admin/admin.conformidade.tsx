import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2, AlertTriangle, Clock, XCircle, Loader2, Download, Search,
  ChevronDown, ChevronUp, Shield, Users, ShieldCheck,
} from "lucide-react";
import ScrollReveal from "@/components/lp/ScrollReveal";

export const Route = createFileRoute("/_admin/admin/conformidade")({ component: Conformidade });

interface CompRow {
  user_id: string;
  nome: string;
  cargo: string | null;
  setor: string | null;
  job_role_nome: string;
  course_id: string;
  curso_titulo: string;
  nr_codigo: string[] | null;
  compliance_status: string;
  due_date: string | null;
  obrigatorio: boolean;
}

interface UserComp {
  user_id: string;
  nome: string;
  cargo: string | null;
  setor: string | null;
  job_role_nome: string;
  total: number;
  concluido: number;
  em_andamento: number;
  vencido: number;
  pendente: number;
  items: CompRow[];
}

function statusColor(s: string) {
  if (s === "concluido")    return "bg-accent-success/10 text-accent-success border-accent-success/20";
  if (s === "vencido")      return "bg-destructive/10 text-destructive border-destructive/20";
  if (s === "em_andamento") return "bg-accent-primary/10 text-accent-primary border-accent-primary/20";
  return "bg-bg-surface-2 text-text-tertiary border-border-subtle";
}

function StatusIcon({ s }: { s: string }) {
  if (s === "concluido")    return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (s === "vencido")      return <AlertTriangle className="h-3.5 w-3.5" />;
  if (s === "em_andamento") return <Clock className="h-3.5 w-3.5" />;
  return <XCircle className="h-3.5 w-3.5" />;
}

function userOverallStatus(u: UserComp): "ok" | "warning" | "danger" {
  if (u.vencido > 0) return "danger";
  if (u.pendente > 0 || u.em_andamento > 0) return "warning";
  return "ok";
}

function daysLeft(due: string | null) {
  if (!due) return null;
  return Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
}

function exportCSV(users: UserComp[]) {
  const rows = [
    ["Nome", "Cargo", "Setor", "Trilha NR", "Total", "Concluídos", "Em andamento", "Vencidos", "Pendentes", "Status"],
    ...users.map((u) => [
      u.nome, u.cargo ?? "", u.setor ?? "", u.job_role_nome,
      u.total, u.concluido, u.em_andamento, u.vencido, u.pendente,
      userOverallStatus(u) === "ok" ? "Conforme" : userOverallStatus(u) === "warning" ? "Atenção" : "Não conforme",
    ]),
  ];
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `conformidade-nr-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

function Conformidade() {
  const [rows, setRows] = useState<CompRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSetor, setFilterSetor] = useState("__all__");
  const [filterCargo, setFilterCargo] = useState("__all__");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("vw_compliance")
      .select("user_id, nome, cargo, setor, job_role_nome, course_id, curso_titulo, nr_codigo, compliance_status, due_date, obrigatorio")
      .order("nome")
      .then(({ data }) => { setRows((data ?? []) as CompRow[]); setLoading(false); });
  }, []);

  const users: UserComp[] = useMemo(() => {
    const map = new Map<string, UserComp>();
    for (const r of rows) {
      if (!map.has(r.user_id)) {
        map.set(r.user_id, { user_id: r.user_id, nome: r.nome, cargo: r.cargo, setor: r.setor, job_role_nome: r.job_role_nome, total: 0, concluido: 0, em_andamento: 0, vencido: 0, pendente: 0, items: [] });
      }
      const u = map.get(r.user_id)!;
      u.total++;
      u.items.push(r);
      if (r.compliance_status === "concluido")    u.concluido++;
      else if (r.compliance_status === "vencido") u.vencido++;
      else if (r.compliance_status === "em_andamento") u.em_andamento++;
      else u.pendente++;
    }
    return [...map.values()];
  }, [rows]);

  const setores = useMemo(() => [...new Set(users.map((u) => u.setor).filter(Boolean))].sort() as string[], [users]);
  const cargos  = useMemo(() => [...new Set(users.map((u) => u.cargo).filter(Boolean))].sort() as string[], [users]);

  const filtered = useMemo(() => users.filter((u) => {
    if (filterSetor !== "__all__" && u.setor !== filterSetor) return false;
    if (filterCargo !== "__all__" && u.cargo !== filterCargo) return false;
    if (search && !u.nome.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [users, filterSetor, filterCargo, search]);

  // KPIs
  const total   = users.length;
  const ok      = users.filter((u) => userOverallStatus(u) === "ok").length;
  const danger  = users.filter((u) => userOverallStatus(u) === "danger").length;
  const warning = users.filter((u) => userOverallStatus(u) === "warning").length;
  const pctOk   = total > 0 ? Math.round((ok / total) * 100) : 0;

  const kpis = [
    { label: "Colaboradores na trilha", value: total,   icon: Users,       tint: "accent-primary" },
    { label: "Em conformidade",         value: `${pctOk}%`, icon: ShieldCheck, tint: "accent-success" },
    { label: "Com atenção",             value: warning, icon: Clock,        tint: "accent-warm" },
    { label: "Não conformes",           value: danger,  icon: AlertTriangle, tint: "destructive" },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">SST / NR</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Painel de Conformidade</h1>
          <p className="text-sm text-text-secondary mt-1">Matriz de conformidade NR por colaborador — status em tempo real.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportCSV(filtered)} disabled={!filtered.length}>
          <Download className="h-4 w-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      {/* KPI cards */}
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <Input className="pl-9 w-56" placeholder="Buscar colaborador…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterSetor} onValueChange={setFilterSetor}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Setor" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos os setores</SelectItem>
            {setores.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCargo} onValueChange={setFilterCargo}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Cargo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos os cargos</SelectItem>
            {cargos.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        {(filterSetor !== "__all__" || filterCargo !== "__all__" || search) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterSetor("__all__"); setFilterCargo("__all__"); setSearch(""); }}>
            Limpar filtros
          </Button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="lp-solid-card p-12 flex items-center justify-center gap-2 text-text-tertiary text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      ) : !filtered.length ? (
        <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm">
          {total === 0 ? "Nenhum colaborador com trilha NR atribuída." : "Nenhum resultado para os filtros aplicados."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => {
            const overall = userOverallStatus(u);
            const open = expanded === u.user_id;
            return (
              <ScrollReveal key={u.user_id}>
                <div className="lp-solid-card overflow-hidden">
                  <div
                    className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-bg-surface-1 transition-colors"
                    onClick={() => setExpanded(open ? null : u.user_id)}
                  >
                    {/* Status dot */}
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${overall === "ok" ? "bg-accent-success" : overall === "danger" ? "bg-destructive" : "bg-accent-warm"}`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-text-primary">{u.nome}</span>
                        {u.cargo && <span className="text-xs text-text-tertiary">{u.cargo}</span>}
                        {u.setor && <span className="text-xs text-text-tertiary">· {u.setor}</span>}
                      </div>
                      <div className="text-xs text-text-tertiary mt-0.5">Trilha: {u.job_role_nome}</div>
                    </div>

                    {/* Mini progress */}
                    <div className="hidden sm:flex items-center gap-3 shrink-0 text-xs text-text-tertiary">
                      <span className="text-accent-success font-medium">{u.concluido} ✓</span>
                      {u.em_andamento > 0 && <span className="text-accent-primary">{u.em_andamento} ⏳</span>}
                      {u.vencido > 0 && <span className="text-destructive font-medium">{u.vencido} ✗</span>}
                      {u.pendente > 0 && <span>{u.pendente} pend.</span>}
                      <span className="text-text-tertiary">/ {u.total}</span>
                    </div>

                    {open ? <ChevronUp className="h-4 w-4 text-text-tertiary shrink-0" /> : <ChevronDown className="h-4 w-4 text-text-tertiary shrink-0" />}
                  </div>

                  {open && (
                    <div className="border-t border-border-subtle px-5 py-4 space-y-2 bg-bg-surface-1/50">
                      {u.items.map((item) => {
                        const days = daysLeft(item.due_date);
                        return (
                          <div key={item.course_id} className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-elevated p-3">
                            <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border shrink-0 ${statusColor(item.compliance_status)}`}>
                              <StatusIcon s={item.compliance_status} />
                              {item.compliance_status === "concluido" ? "Concluído" :
                               item.compliance_status === "vencido" ? "Vencido" :
                               item.compliance_status === "em_andamento" ? "Em andamento" : "Pendente"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-text-primary truncate">{item.curso_titulo}</div>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {item.nr_codigo?.map((nr) => (
                                  <Badge key={nr} variant="secondary" className="text-[10px] bg-accent-primary/10 text-accent-primary border-accent-primary/20 font-mono py-0">
                                    <Shield className="h-2.5 w-2.5 mr-0.5" />{nr}
                                  </Badge>
                                ))}
                                {item.due_date && item.compliance_status !== "concluido" && (
                                  <span className={`text-[10px] ${days !== null && days <= 7 ? "text-destructive font-medium" : "text-text-tertiary"}`}>
                                    Prazo: {new Date(item.due_date).toLocaleDateString("pt-BR")}{days !== null ? ` (${days}d)` : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Link
                              to="/admin/alunos"
                              className="text-xs text-accent-primary hover:underline shrink-0"
                            >
                              Ver aluno →
                            </Link>
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
  );
}
