import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell, GraduationCap, Award, CheckCircle2, XCircle, AlertTriangle, Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

interface Notif {
  id: string;
  template: string;
  course_id: string | null;
  created_at: string;
  lida: boolean;
  payload_json: Record<string, unknown> | null;
}

const NOTIF_META: Record<string, { title: string; color: string; icon: React.ElementType }> = {
  matricula_realizada:  { title: "Matrícula confirmada",       color: "text-accent-primary", icon: GraduationCap },
  certificado_emitido:  { title: "Certificado disponível",     color: "text-accent-success", icon: Award },
  prova_aprovada:       { title: "Avaliação aprovada!",        color: "text-accent-success", icon: CheckCircle2 },
  prova_reprovada:      { title: "Avaliação não aprovada",     color: "text-destructive",    icon: XCircle },
  treinamento_vencendo: { title: "Treinamento vence em breve", color: "text-yellow-600",     icon: AlertTriangle },
  treinamento_vencido:  { title: "Treinamento vencido",        color: "text-destructive",    icon: AlertTriangle },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)   return "agora";
  if (min < 60)  return `${min}min atrás`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24)  return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "ontem";
  return `${days}d atrás`;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen]   = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("id, template, course_id, created_at, lida, payload_json")
      .eq("user_id", user.id)
      .eq("canal", "inapp")
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifs((data ?? []) as Notif[]);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifs.filter((n) => !n.lida).length;

  const markAll = async () => {
    if (!user || unread === 0) return;
    await supabase
      .from("notifications")
      .update({ lida: true } as never)
      .eq("user_id", user.id)
      .eq("canal", "inapp")
      .eq("lida", false);
    setNotifs((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const markOne = async (id: string) => {
    await supabase.from("notifications").update({ lida: true } as never).eq("id", id);
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9"
        onClick={() => { setOpen((o) => !o); if (!open) load(); }}
        aria-label="Notificações"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-border-subtle bg-bg-elevated shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
            <span className="text-sm font-semibold text-text-primary">Notificações</span>
            {unread > 0 && (
              <button
                onClick={markAll}
                className="text-xs text-accent-primary hover:underline flex items-center gap-1"
              >
                <Check className="h-3 w-3" /> Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle/50">
            {notifs.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-text-tertiary">
                Nenhuma notificação ainda.
              </div>
            ) : (
              notifs.map((n) => {
                const meta = NOTIF_META[n.template] ?? { title: n.template, color: "text-text-secondary", icon: Bell };
                const Icon = meta.icon as React.ElementType;
                const curso = (n.payload_json as Record<string, unknown> | null)?.curso as string | undefined;
                return (
                  <button
                    key={n.id}
                    onClick={() => markOne(n.id)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-bg-surface-2 transition-colors ${!n.lida ? "bg-accent-primary/5" : ""}`}
                  >
                    <div className={`mt-0.5 shrink-0 ${meta.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary">{meta.title}</div>
                      {curso && <div className="text-xs text-text-tertiary truncate">{curso}</div>}
                      <div className="text-[11px] text-text-tertiary mt-0.5">{relativeTime(n.created_at)}</div>
                    </div>
                    {!n.lida && <div className="h-2 w-2 rounded-full bg-accent-primary mt-1.5 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
