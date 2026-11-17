import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { storeApiKey } from "@/lib/api-keys.functions";
import type { ApiKeyService } from "@/lib/api-keys.catalog";

interface Props {
  service: ApiKeyService | null;
  onClose: () => void;
}

export function ApiKeyDialog({ service, onClose }: Props) {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [multiFields, setMultiFields] = useState<Record<string, string>>({});
  const qc = useQueryClient();
  const store = useServerFn(storeApiKey);

  const isMulti = !!service?.fields?.length;

  const handleClose = () => {
    setKey(""); setShow(false); setMultiFields({});
    onClose();
  };

  const mut = useMutation({
    mutationFn: (k: string) => store({ data: { service_name: service!.id, key: k, label: service!.label } }),
    onSuccess: () => {
      toast.success("Chave salva com sucesso!");
      qc.invalidateQueries({ queryKey: ["api-keys"] });
      handleClose();
    },
    onError: (e: Error) => toast.error(e.message || "Erro ao salvar a chave. Tente novamente."),
    onSettled: () => { setKey(""); setShow(false); setMultiFields({}); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMulti) {
      const allFilled = service!.fields!.every((f) => (multiFields[f.id] ?? "").trim());
      if (!allFilled) return;
      mut.mutate(JSON.stringify(multiFields));
    } else {
      if (key.trim()) mut.mutate(key.trim());
    }
  };

  const canSubmit = isMulti
    ? service?.fields?.every((f) => (multiFields[f.id] ?? "").trim())
    : !!key.trim();

  return (
    <Dialog open={!!service} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurar {service?.label}</DialogTitle>
          <DialogDescription>
            {isMulti
              ? `Preencha os dados de conexão para habilitar a integração com ${service?.label}.`
              : `Insira sua chave de API para habilitar a integração com ${service?.label}.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isMulti ? (
            service!.fields!.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label>{field.label}</Label>
                <div className="relative">
                  <Input
                    type={field.type === "password" && !show ? "password" : "text"}
                    value={multiFields[field.id] ?? ""}
                    onChange={(e) => setMultiFields((prev) => ({ ...prev, [field.id]: e.target.value }))}
                    placeholder={field.placeholder}
                    autoComplete="off"
                    spellCheck={false}
                    className={field.type === "password" ? "pr-10 font-mono" : ""}
                    required
                  />
                  {field.type === "password" && (
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                      aria-label={show ? "Ocultar" : "Mostrar"}
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-2">
              <Label>Chave de API</Label>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder={service?.placeholder}
                  autoComplete="off"
                  spellCheck={false}
                  className="pr-10 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  aria-label={show ? "Ocultar" : "Mostrar"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {service?.docsUrl && (
            <a
              href={service.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent-primary hover:underline"
            >
              Documentação da integração <ExternalLink className="h-3 w-3" />
            </a>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={mut.isPending}>
              Cancelar
            </Button>
            <Button type="submit" variant="lp-primary" disabled={mut.isPending || !canSubmit}>
              {mut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
