import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Award, ExternalLink, Loader2 } from "lucide-react";
import ScrollReveal from "@/components/lp/ScrollReveal";

export const Route = createFileRoute("/_aluno/aluno/certificados")({ component: Certs });

function Certs() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;
    supabase.from("certificates").select("*, courses(titulo)").eq("user_id", user.id).then(({ data }) => {
      setList(data ?? []);
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Conquistas</span>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Certificados</h1>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {loading ? (
          <div className="lp-solid-card p-12 flex items-center justify-center gap-2 text-text-tertiary text-sm sm:col-span-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando certificados…
          </div>
        ) : null}
        {!loading && list.map((c, i) => (
          <ScrollReveal key={c.id} delay={i * 0.06}>
            <div className="lp-solid-card confetti-card p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-accent-warm/15 text-accent-warm grid place-items-center">
                  <Award className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-text-primary truncate">{c.courses?.titulo}</div>
                  <div className="text-xs text-text-tertiary">
                    Emitido em {new Date(c.emitido_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
              <a
                className="mt-4 inline-flex items-center gap-1 text-sm text-accent-primary hover:underline font-semibold"
                href={`/certificado/${c.qr_token}`}
                target="_blank"
                rel="noreferrer"
              >
                Verificar certificado <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </ScrollReveal>
        ))}
        {!loading && !list.length && (
          <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm sm:col-span-2">
            Você ainda não tem certificados.
          </div>
        )}
      </div>
    </div>
  );
}
