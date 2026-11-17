import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "gestor" | "aluno";

const AUTH_TIMEOUT_MS = 5000;

async function withTimeout<T>(promise: PromiseLike<T>, ms = AUTH_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error("auth-timeout")), ms);
    }),
  ]);
}

async function fetchUserRole(userId: string): Promise<AppRole | null> {
  const { data, error } = await withTimeout(
    supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
  );
  if (error) return null;
  return (data?.role as AppRole) ?? null;
}

// Garante profile + papel para a sessão atual. Idempotente; repara usuário
// órfão quando o trigger de auth.users se perde (ex.: remix do projeto).
let bootstrappedFor: string | null = null;
async function ensureBootstrap(userId: string): Promise<void> {
  if (bootstrappedFor === userId) return;
  try {
    await withTimeout(supabase.rpc("bootstrap_self"));
    bootstrappedFor = userId;
  } catch {
    // não-fatal: o fetchUserRole seguinte apenas devolve null
  }
}

interface AuthCtx {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  // true enquanto o papel do usuário logado ainda não foi resolvido
  roleLoading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null, session: null, role: null, loading: true, roleLoading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        setRoleLoading(true);
        setTimeout(async () => {
          await ensureBootstrap(s.user.id);
          const nextRole = await fetchUserRole(s.user.id).catch(() => null);
          if (mounted) {
            setRole(nextRole);
            setRoleLoading(false);
          }
        }, 0);
      } else {
        setRole(null);
        setRoleLoading(false);
      }
    });

    (async () => {
      try {
        let { data: { session: s } } = await withTimeout(supabase.auth.getSession());
        if (!mounted) return;
        // getSession só lê o token salvo no navegador; confirma no servidor que o
        // usuário ainda existe. Se foi removido, descarta a sessão local.
        if (s) {
          // Falha de rede/timeout não derruba a sessão; só resposta de "usuário inválido".
          const error = await withTimeout(supabase.auth.getUser())
            .then((r) => r.error)
            .catch(() => null);
          if (!mounted) return;
          if (error && [401, 403, 404].includes(error.status ?? 0)) {
            await supabase.auth.signOut({ scope: "local" });
            s = null;
          }
        }
        setSession(s);
        if (s?.user) await ensureBootstrap(s.user.id);
        setRole(s?.user ? await fetchUserRole(s.user.id).catch(() => null) : null);
        setRoleLoading(false);
      } catch {
        if (!mounted) return;
        setSession(null);
        setRole(null);
        setRoleLoading(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Ctx.Provider value={{
      user: session?.user ?? null,
      session,
      role,
      loading,
      roleLoading,
      signOut: async () => { await supabase.auth.signOut(); },
    }}>{children}</Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);