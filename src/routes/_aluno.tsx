import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { BookOpen, GraduationCap, Award, LogOut, User, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/aluno/NotificationBell";
import { useBranding } from "@/lib/branding-context";

export const Route = createFileRoute("/_aluno")({ component: AlunoLayout });

const items = [
  { to: "/aluno/catalogo", label: "Catálogo", icon: BookOpen },
  { to: "/aluno/meus-cursos", label: "Meus cursos", icon: GraduationCap },
  { to: "/aluno/minha-trilha", label: "Minha Trilha", icon: HardHat },
  { to: "/aluno/certificados", label: "Certificados", icon: Award },
  { to: "/aluno/perfil", label: "Perfil", icon: User },
];

function AlunoLayout() {
  const { user, loading, signOut } = useAuth();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logoUrl, appName } = useBranding();

  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/login" });
  }, [user, loading, nav]);

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Carregando…</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      <header className="h-14 border-b border-border-subtle bg-bg-elevated/95 backdrop-blur sticky top-0 z-20 flex items-center justify-between px-4">
        <Link to="/aluno/catalogo" className="flex items-center gap-2 font-bold text-text-primary">
          {logoUrl
            ? <img src={logoUrl} alt={appName} className="h-7 w-auto max-w-[120px] object-contain" />
            : <><div className="h-7 w-7 rounded-md bg-accent-primary grid place-items-center text-white text-xs shrink-0">{appName[0]}</div><span className="hidden sm:inline">{appName}</span></>
          }
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {items.map((i) => {
            const active = pathname.startsWith(i.to);
            return (
              <Link
                key={i.to}
                to={i.to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-accent-primary/10 text-accent-primary font-semibold"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-surface-2"
                }`}
              >
                <i.icon className="h-4 w-4" />
                {i.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <NotificationBell />
          <Button variant="ghost" size="sm" onClick={async () => { await signOut(); nav({ to: "/login" }); }}>
            <LogOut className="h-4 w-4 md:mr-1" /><span className="hidden md:inline">Sair</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-6 pb-24 md:pb-10 max-w-5xl mx-auto w-full"><Outlet /></main>

      {/* mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-darkest border-t border-white/10 flex justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map((i) => {
          const active = pathname.startsWith(i.to);
          return (
            <Link
              key={i.to}
              to={i.to}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 text-[11px] font-medium ${
                active ? "text-accent-primary-light" : "text-text-on-dark-muted"
              }`}
            >
              <i.icon className="h-5 w-5" />
              {i.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
