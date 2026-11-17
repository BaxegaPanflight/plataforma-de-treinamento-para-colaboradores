import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Building2, Users, Search, Plus, ChevronDown, ChevronUp, Loader2,
  Mail, BadgeCheck, UserMinus, Briefcase,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/funcionarios")({ component: FuncionariosPage });

interface Empresa {
  id: string;
  razao_social: string;
  cnpj: string | null;
  status: string;
}

interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cpf: string | null;
  cargo: string | null;
  setor: string | null;
  matricula_empresa: string | null;
  telefone: string | null;
  ativo: boolean;
  empresa_id: string | null;
}

function VincularDialog({
  open, onOpenChange, empresa, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  empresa: Empresa;
  onSaved: () => void;
}) {
  const [disponiveis, setDisponiveis] = useState<Funcionario[]>([]);
  const [userId, setUserId] = useState("");
  const [cargo, setCargo] = useState("");
  const [setor, setSetor] = useState("");
  const [matricula, setMatricula] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setUserId(""); setCargo(""); setSetor(""); setMatricula("");
    (supabase.from as any)("profiles")
      .select("id, nome, email, cpf, cargo, setor, matricula_empresa, telefone, ativo, empresa_id")
      .or(`empresa_id.is.null,empresa_id.neq.${empresa.id}`)
      .order("nome")
      .then(({ data }: { data: Funcionario[] | null }) => setDisponiveis(data ?? []));
  }, [open, empresa.id]);

  const submit = async () => {
    if (!userId) return toast.error("Selecione um colaborador");
    setSaving(true);
    const { error } = await (supabase.from as any)("profiles").update({
      empresa_id: empresa.id,
      cargo: cargo.trim() || null,
      setor: setor.trim() || null,
      matricula_empresa: matricula.trim() || null,
    }).eq("id", userId);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Funcionário vinculado");
    onSaved(); onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular funcionário — {empresa.razao_social}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label>Colaborador</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent>
                {disponiveis.length === 0 && (
                  <div className="px-3 py-2 text-xs text-text-tertiary">
                    Nenhum colaborador disponível. Cadastre alunos primeiro.
                  </div>
                )}
                {disponiveis.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome} <span className="text-text-tertiary">({p.email})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Cargo</Label>
              <Input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex.: Operador" />
            </div>
            <div className="space-y-1.5">
              <Label>Setor</Label>
              <Input value={setor} onChange={(e) => setSetor(e.target.value)} placeholder="Ex.: Produção" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Matrícula</Label>
            <Input value={matricula} onChange={(e) => setMatricula(e.target.value)} placeholder="Opcional" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button variant="lp-primary" onClick={submit} disabled={saving || !userId}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando…</> : "Vincular"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FuncionariosPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [vincularEmpresa, setVincularEmpresa] = useState<Empresa | null>(null);

  const load = async () => {
    const [empRes, profRes] = await Promise.all([
      (supabase.from as any)("empresas").select("id, razao_social, cnpj, status").order("razao_social"),
      (supabase.from as any)("profiles")
        .select("id, nome, email, cpf, cargo, setor, matricula_empresa, telefone, ativo, empresa_id")
        .order("nome"),
    ]);
    setEmpresas(empRes.data ?? []);
    setFuncionarios(profRes.data ?? []);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const desvincular = async (f: Funcionario) => {
    if (!confirm(`Desvincular ${f.nome} desta empresa?`)) return;
    const { error } = await (supabase.from as any)("profiles")
      .update({ empresa_id: null }).eq("id", f.id);
    if (error) return toast.error(error.message);
    toast.success("Funcionário desvinculado");
    load();
  };

  const porEmpresa = useMemo(() => {
    const map = new Map<string, Funcionario[]>();
    for (const f of funcionarios) {
      if (!f.empresa_id) continue;
      if (!map.has(f.empresa_id)) map.set(f.empresa_id, []);
      map.get(f.empresa_id)!.push(f);
    }
    return map;
  }, [funcionarios]);

  const semEmpresa = useMemo(() => funcionarios.filter((f) => !f.empresa_id), [funcionarios]);

  const q = search.trim().toLowerCase();
  const matchFunc = (f: Funcionario) =>
    !q || f.nome.toLowerCase().includes(q) || f.email.toLowerCase().includes(q) ||
    (f.cpf ?? "").includes(q) || (f.cargo ?? "").toLowerCase().includes(q) ||
    (f.setor ?? "").toLowerCase().includes(q) || (f.matricula_empresa ?? "").toLowerCase().includes(q);

  const matchEmp = (e: Empresa) =>
    !q || e.razao_social.toLowerCase().includes(q) || (e.cnpj ?? "").includes(q);

  const visibleEmpresas = empresas.filter((e) => {
    if (!q) return true;
    if (matchEmp(e)) return true;
    return (porEmpresa.get(e.id) ?? []).some(matchFunc);
  });

  const totalVinculados = funcionarios.filter((f) => f.empresa_id && f.ativo).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">RH / Multi-CNPJ</span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Funcionários por CNPJ</h1>
          <p className="text-sm text-text-secondary mt-1">
            {totalVinculados} vinculados em {empresas.length} empresa{empresas.length === 1 ? "" : "s"} · {semEmpresa.length} sem vínculo
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9"
          placeholder="Buscar empresa, funcionário, CPF, cargo…" />
      </div>

      {loading ? (
        <div className="lp-solid-card p-12 text-center text-text-tertiary">Carregando…</div>
      ) : empresas.length === 0 ? (
        <div className="lp-solid-card p-12 text-center text-sm text-text-tertiary">
          Nenhuma empresa cadastrada. Cadastre uma empresa em <strong>Multi-CNPJ</strong> primeiro.
        </div>
      ) : (
        <div className="space-y-2">
          {visibleEmpresas.map((emp) => {
            const all = porEmpresa.get(emp.id) ?? [];
            const list = q ? all.filter(matchFunc) : all;
            const isOpen = expanded.has(emp.id);
            const ativos = all.filter((f) => f.ativo).length;
            return (
              <div key={emp.id} className="lp-solid-card overflow-hidden">
                <div className="p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-accent-primary/10 grid place-items-center shrink-0">
                    <Building2 className="h-5 w-5 text-accent-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-text-primary truncate">{emp.razao_social}</div>
                    <div className="text-xs text-text-tertiary font-mono">{emp.cnpj ?? "—"}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="bg-bg-surface-2">
                      <Users className="h-3 w-3 mr-1" />{ativos}/{all.length}
                    </Badge>
                    <Badge variant={emp.status === "ativa" ? "secondary" : "outline"}
                      className={emp.status === "ativa" ? "bg-green-500/10 text-green-700" : ""}>
                      {emp.status === "ativa" ? "Ativa" : "Inativa"}
                    </Badge>
                    <Button variant="outline" size="sm" className="h-8 text-xs"
                      onClick={() => setVincularEmpresa(emp)}>
                      <Plus className="h-3 w-3 mr-1" />Vincular
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggle(emp.id)}>
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-border-subtle bg-bg-surface-2/50 px-5 py-4">
                    {list.length === 0 ? (
                      <p className="text-sm text-text-tertiary">
                        {q ? "Nenhum funcionário corresponde à busca." : "Nenhum funcionário vinculado."}
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {list.map((f) => (
                          <div key={f.id} className="flex items-center gap-3 bg-bg-elevated rounded-lg px-3 py-2">
                            <div className="h-8 w-8 rounded-full bg-accent-primary/10 text-accent-primary font-semibold grid place-items-center text-xs shrink-0">
                              {(f.nome || "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-text-primary truncate">{f.nome || "—"}</span>
                                {!f.ativo && <Badge variant="outline" className="text-[10px]">Inativo</Badge>}
                                {f.matricula_empresa && (
                                  <Badge variant="secondary" className="text-[10px] font-mono">
                                    <BadgeCheck className="h-3 w-3 mr-0.5" />{f.matricula_empresa}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-text-tertiary flex-wrap mt-0.5">
                                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{f.email}</span>
                                {f.cpf && <span className="font-mono">{f.cpf}</span>}
                                {(f.cargo || f.setor) && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="h-3 w-3" />
                                    {[f.cargo, f.setor].filter(Boolean).join(" · ")}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm"
                              className="h-7 px-2 text-xs text-destructive hover:text-destructive shrink-0"
                              onClick={() => desvincular(f)}>
                              <UserMinus className="h-3 w-3 mr-1" />Desvincular
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {semEmpresa.length > 0 && (
            <div className="lp-solid-card overflow-hidden border-dashed">
              <div className="p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-yellow-500/10 grid place-items-center shrink-0">
                  <Users className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text-primary">Sem empresa vinculada</div>
                  <div className="text-xs text-text-tertiary">
                    {semEmpresa.length} colaborador{semEmpresa.length === 1 ? "" : "es"} sem CNPJ associado
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggle("__none__")}>
                  {expanded.has("__none__") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              {expanded.has("__none__") && (
                <div className="border-t border-border-subtle bg-bg-surface-2/50 px-5 py-4 space-y-1.5">
                  {(q ? semEmpresa.filter(matchFunc) : semEmpresa).map((f) => (
                    <div key={f.id} className="flex items-center gap-3 bg-bg-elevated rounded-lg px-3 py-2">
                      <div className="h-8 w-8 rounded-full bg-yellow-500/10 text-yellow-700 font-semibold grid place-items-center text-xs shrink-0">
                        {(f.nome || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-primary truncate">{f.nome}</div>
                        <div className="text-xs text-text-tertiary truncate">{f.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {vincularEmpresa && (
        <VincularDialog
          empresa={vincularEmpresa}
          open={!!vincularEmpresa}
          onOpenChange={(v) => { if (!v) setVincularEmpresa(null); }}
          onSaved={load}
        />
      )}
    </div>
  );
}
