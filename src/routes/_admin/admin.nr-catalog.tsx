import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Search, Clock, RotateCw, Users, Copy, Check, BookOpen, FileText, Shield, Scale } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/nr-catalog")({ component: NRCatalog });

interface NR {
  id: string; numero: string; titulo: string; descricao: string;
  objetivo: string | null; horas_minimas: number; periodicidade_meses: number;
  aplica_todos: boolean; setores: string[]; conteudo_resumo: string | null;
  conteudo_programatico: string | null;
  requisitos: string | null;
  publico_alvo: string | null;
  base_legal: string | null;
  ementa_padrao: string | null;
}

type DetailTab = "conteudo" | "requisitos" | "publico" | "base_legal";

const TABS: { key: DetailTab; label: string; icon: React.ElementType }[] = [
  { key: "conteudo",   label: "Conteúdo Programático", icon: BookOpen  },
  { key: "requisitos", label: "Requisitos",             icon: Shield    },
  { key: "publico",    label: "Público-Alvo",           icon: Users     },
  { key: "base_legal", label: "Base Legal",             icon: Scale     },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Ementa copiada para a área de transferência");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="outline" size="sm" onClick={copy} className="shrink-0 gap-1.5 text-xs">
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copiado!" : "Copiar ementa"}
    </Button>
  );
}

function NRModal({ nr, onClose }: { nr: NR; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<DetailTab>("conteudo");

  const tabContent: Record<DetailTab, string | null> = {
    conteudo: nr.conteudo_programatico ?? nr.conteudo_resumo,
    requisitos: nr.requisitos,
    publico: nr.publico_alvo,
    base_legal: nr.base_legal,
  };

  const availableTabs = TABS.filter((t) => tabContent[t.key]);

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle shrink-0">
          <div className="flex items-start gap-3">
            <Badge className="font-mono text-sm shrink-0 mt-0.5">{nr.numero}</Badge>
            <div>
              <DialogTitle className="text-base font-semibold text-text-primary leading-snug">
                {nr.titulo}
              </DialogTitle>
              <p className="text-sm text-text-secondary mt-1">{nr.descricao}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {nr.horas_minimas > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-text-tertiary">
                <Clock className="h-3 w-3" />{nr.horas_minimas}h mínimas
              </span>
            )}
            {nr.periodicidade_meses > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-text-tertiary">
                <RotateCw className="h-3 w-3" />Reciclagem a cada {nr.periodicidade_meses} meses
              </span>
            )}
            {nr.aplica_todos && (
              <Badge variant="secondary" className="text-[10px]">
                <Users className="h-3 w-3 mr-1" />Aplica a todos
              </Badge>
            )}
            {nr.setores.length > 0 && nr.setores.map((s) => (
              <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
            ))}
          </div>
        </DialogHeader>

        {/* Tabs nav */}
        {availableTabs.length > 0 && (
          <div className="flex gap-0 border-b border-border-subtle shrink-0 overflow-x-auto">
            {availableTabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === key
                    ? "border-accent-primary text-accent-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {tabContent[activeTab] && (
            <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
              {tabContent[activeTab]}
            </p>
          )}

          {/* Ementa Padrão */}
          {nr.ementa_padrao && (
            <div className="rounded-lg border border-accent-primary/20 bg-accent-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-accent-primary" />
                  <span className="text-xs font-semibold text-accent-primary uppercase tracking-widest">
                    Ementa Padrão
                  </span>
                </div>
                <CopyButton text={nr.ementa_padrao} />
              </div>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {nr.ementa_padrao}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NRCatalog() {
  const [nrs, setNrs] = useState<NR[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<NR | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase.from as any)("nrs_catalog").select("*").eq("vigente", true).order("numero")
      .then(({ data, error }: { data: NR[] | null; error: unknown }) => {
        if (error) console.error("nrs_catalog fetch error:", error);
        setNrs(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = nrs.filter((n) => {
    const q = search.toLowerCase();
    return n.numero.toLowerCase().includes(q) || n.titulo.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Legislação</span>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Repositório de NRs</h1>
        <p className="text-sm text-text-secondary mt-1">
          {nrs.length} Normas Regulamentadoras do Ministério do Trabalho e Emprego
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" placeholder="Buscar por número ou título…" />
      </div>

      {loading ? (
        <div className="lp-solid-card p-12 text-center text-text-tertiary">Carregando…</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((nr) => (
            <button
              key={nr.id}
              type="button"
              onClick={() => setSelected(nr)}
              className="lp-solid-card p-5 text-left hover:bg-muted/20 transition-colors w-full group"
            >
              <div className="flex items-start gap-3">
                <Badge className="shrink-0 font-mono">{nr.numero}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text-primary text-sm leading-snug group-hover:text-accent-primary transition-colors">
                    {nr.titulo}
                  </div>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{nr.descricao}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                {nr.horas_minimas > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-text-tertiary">
                    <Clock className="h-3 w-3" />{nr.horas_minimas}h
                  </span>
                )}
                {nr.periodicidade_meses > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-text-tertiary">
                    <RotateCw className="h-3 w-3" />{nr.periodicidade_meses}m
                  </span>
                )}
                {nr.aplica_todos && (
                  <Badge variant="secondary" className="text-[10px]">
                    <Users className="h-3 w-3 mr-1" />Todos
                  </Badge>
                )}
                {(nr.conteudo_programatico || nr.ementa_padrao) && (
                  <Badge variant="outline" className="text-[10px] border-accent-primary/30 text-accent-primary">
                    Conteúdo completo
                  </Badge>
                )}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="md:col-span-2 lp-solid-card p-12 text-center text-text-tertiary text-sm">
              {search ? `Nenhuma NR encontrada para "${search}".` : "Nenhuma NR cadastrada."}
            </div>
          )}
        </div>
      )}

      {selected && <NRModal nr={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
