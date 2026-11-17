import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listApiKeys, deleteApiKey, validateApiKey } from "@/lib/api-keys.functions";
import { API_KEY_CATALOG, type ApiKeyService } from "@/lib/api-keys.catalog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, XCircle, MinusCircle, Loader2, Key, Trash2, Plug } from "lucide-react";
import { toast } from "sonner";
import ScrollReveal from "@/components/lp/ScrollReveal";
import { ApiKeyDialog } from "@/components/admin/ApiKeyDialog";

export const Route = createFileRoute("/_admin/admin/api-keys")({ component: ApiKeysPage });

type Entry = { service_name: string; label: string | null; last_validated_at: string | null; last_validation_status: "valid"|"invalid"|"error"|null; updated_at: string };

function StatusBadge({ status }: { status: Entry["last_validation_status"] | "missing" }) {
  if (status === "missing") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-bg-surface-2 text-text-tertiary">
      <MinusCircle className="h-3 w-3" /> Não configurada
    </span>
  );
  if (status === "valid") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-accent-success/15 text-accent-success">
      <CheckCircle2 className="h-3 w-3" /> Ativa
    </span>
  );
  if (status === "invalid") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-destructive/15 text-destructive">
      <XCircle className="h-3 w-3" /> Inválida
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-accent-warm/15 text-accent-warm">
      <Plug className="h-3 w-3" /> Configurada
    </span>
  );
}

function ApiKeysPage() {
  const list = useServerFn(listApiKeys);
  const del = useServerFn(deleteApiKey);
  const validate = useServerFn(validateApiKey);
  const qc = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => list({}),
  });

  const [editing, setEditing] = useState<ApiKeyService | null>(null);
  const [confirming, setConfirming] = useState<ApiKeyService | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const delMut = useMutation({
    mutationFn: (svc: string) => del({ data: { service_name: svc } }),
    onSuccess: () => { toast.success("Chave removida com sucesso."); qc.invalidateQueries({ queryKey: ["api-keys"] }); },
    onError: () => toast.error("Não foi possível remover a chave."),
    onSettled: () => setConfirming(null),
  });

  const onTest = async (svc: string) => {
    setTestingId(svc);
    try {
      const r = await validate({ data: { service_name: svc } });
      if (r.status === "valid") toast.success("Conexão válida!");
      else toast.error("Chave inválida ou serviço indisponível.");
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    } finally { setTestingId(null); }
  };

  const byService = new Map(entries.map((e: Entry) => [e.service_name, e]));

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Integrações</span>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Chaves de API</h1>
        <p className="text-sm text-text-secondary mt-1">
          Gerencie as chaves de integração dos serviços externos. As chaves ficam armazenadas em cofre seguro e nunca são exibidas após o salvamento.
        </p>
      </div>

      {isLoading ? (
        <div className="lp-solid-card p-12 text-center text-text-tertiary"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {API_KEY_CATALOG.map((svc, i) => {
            const entry = byService.get(svc.id) as Entry | undefined;
            const status = entry ? (entry.last_validation_status ?? null) : "missing";
            return (
              <ScrollReveal key={svc.id} delay={i * 0.06}>
                <div className="lp-solid-card p-5 flex flex-col gap-4 h-full">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-xl bg-accent-primary/10 text-accent-primary grid place-items-center shrink-0">
                      <Key className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-text-primary">{svc.label}</h3>
                        <StatusBadge status={status as never} />
                      </div>
                      <p className="text-sm text-text-secondary mt-1">{svc.description}</p>
                      {entry?.last_validated_at && (
                        <p className="text-xs text-text-tertiary mt-2">
                          Última verificação: {new Date(entry.last_validated_at).toLocaleString("pt-BR")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {entry ? (
                      <>
                        <Button size="sm" variant="lp-soft" onClick={() => setEditing(svc)}>Alterar chave</Button>
                        <Button size="sm" variant="outline" disabled={testingId === svc.id} onClick={() => onTest(svc.id)}>
                          {testingId === svc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                          Testar conexão
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirming(svc)}>
                          <Trash2 className="h-3.5 w-3.5" /> Remover
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="lp-primary" onClick={() => setEditing(svc)}>
                        Configurar chave
                      </Button>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}

      <ApiKeyDialog service={editing} onClose={() => setEditing(null)} />

      <AlertDialog open={!!confirming} onOpenChange={(o) => !o && setConfirming(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover chave de {confirming?.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta chave? A integração com {confirming?.label} será desativada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={delMut.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); if (confirming) delMut.mutate(confirming.id); }}
              disabled={delMut.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {delMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
