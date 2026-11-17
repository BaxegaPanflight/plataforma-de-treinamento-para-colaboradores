import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { listApiKeys } from "@/lib/api-keys.functions";
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, BookOpen, Users, UserCog, FileBarChart, Settings, LogOut, KeyRound,
  HardHat, ShieldCheck, LayoutGrid, BookMarked, AlertTriangle,
  Package, Stethoscope, Radio, Users2, FolderArchive, ClipboardList, Building2, Brain, Wind, Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBranding, ONBOARDING_ADIADO_KEY } from "@/lib/branding-context";

export const Route = createFileRoute("/_admin")({ component: AdminLayout });

type NavItem = {
  to: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  gestorOnly?: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    label: "",
    items: [
      { to: "/admin/gestor",    label: "Meu Painel", icon: LayoutGrid,    gestorOnly: true },
      { to: "/admin/dashboard", label: "Dashboard",  icon: LayoutDashboard, adminOnly: true },
    ],
  },
  {
    label: "LMS",
    items: [
      { to: "/admin/cursos",     label: "Cursos",         icon: BookOpen                        },
      { to: "/admin/alunos",     label: "Alunos",         icon: Users                           },
      { to: "/admin/cargos",     label: "Cargos / NR",    icon: HardHat,    adminOnly: true      },
      { to: "/admin/nr-catalog", label: "Repositório NR", icon: BookMarked, adminOnly: true      },
    ],
  },
  {
    label: "Compliance & SST",
    items: [
      { to: "/admin/conformidade",          label: "Conformidade",    icon: ShieldCheck                     },
      { to: "/admin/epi",                   label: "EPIs",            icon: Package,    adminOnly: true      },
      { to: "/admin/aso",                   label: "ASOs",            icon: Stethoscope, adminOnly: true     },
      { to: "/admin/esocial",               label: "eSocial SST",     icon: Radio,      adminOnly: true      },
      { to: "/admin/cipa",                  label: "CIPA",            icon: Users2,     adminOnly: true      },
      { to: "/admin/sst-docs",              label: "Docs SST",        icon: FolderArchive, adminOnly: true   },
      { to: "/admin/pt-apr",                label: "PT / APR",        icon: ClipboardList, adminOnly: true   },
      { to: "/admin/terceiros",             label: "Terceiros",       icon: Building2,  adminOnly: true      },
      { to: "/admin/riscos-psicossociais",  label: "Riscos Psicoss.", icon: Brain,      adminOnly: true      },
      { to: "/admin/sst-ambiental",         label: "Cond. Ambientais", icon: Wind,      adminOnly: true      },
    ],
  },
  {
    label: "Plataforma",
    items: [
      { to: "/admin/empresas",      label: "Multi-CNPJ",    icon: Landmark,     adminOnly: true },
      { to: "/admin/funcionarios",  label: "Funcionários",  icon: Users2,       adminOnly: true },
      { to: "/admin/equipe",        label: "Equipe",        icon: UserCog,      adminOnly: true },
      { to: "/admin/relatorios",    label: "Relatórios",    icon: FileBarChart                  },
      { to: "/admin/api-keys",      label: "Chaves de API", icon: KeyRound,     adminOnly: true },
      { to: "/admin/configuracoes", label: "Configurações", icon: Settings,     adminOnly: true },
    ],
  },
];

const allItems = sections.flatMap((s) => s.items);

function AdminLayout() {
  const { user, role, loading, signOut } = useAuth();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logoUrl, appName, onboardingCompleto } = useBranding();

  useEffect(() => {
    if (loading || onboardingCompleto === null) return;
    if (!user) { nav({ to: "/login" }); return; }
    if (role !== "admin" && role !== "gestor") { nav({ to: "/aluno/catalogo" }); return; }
    // Primeiro acesso vai direto ao wizard; se o admin escolheu "configurar
    // depois", o painel abre normal e o banner abaixo lembra o que falta.
    if (
      role === "admin" &&
      onboardingCompleto === false &&
      !localStorage.getItem(ONBOARDING_ADIADO_KEY)
    ) {
      nav({ to: "/onboarding" });
    }
  }, [user, role, loading, nav, onboardingCompleto, pathname]);

  if (loading || !user || (role !== "admin" && role !== "gestor")) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Carregando…</div>;
  }

  const current = allItems.find((i) => pathname.startsWith(i.to))?.label ?? "Admin";

  const visibleSections = sections.map((s) => ({
    ...s,
    items: s.items.filter((i) => (!i.adminOnly || role === "admin") && (!i.gestorOnly || role === "gestor")),
  })).filter((s) => s.items.length > 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-bg-base">
        <Sidebar collapsible="icon" className="border-r-0">
          <SidebarHeader className="px-4 py-4">
            <Link to="/admin/dashboard" className="flex items-center gap-2 text-text-on-dark font-bold">
              {logoUrl
                ? <img src={logoUrl} alt={appName} className="h-8 w-auto max-w-[120px] object-contain group-data-[collapsible=icon]:hidden" />
                : <>
                    <div className="h-8 w-8 rounded-lg bg-accent-primary grid place-items-center text-white shrink-0">{appName[0]}</div>
                    <span className="group-data-[collapsible=icon]:hidden">{appName} Admin</span>
                  </>
              }
            </Link>
          </SidebarHeader>

          <SidebarContent>
            {visibleSections.map((section) => (
              <SidebarGroup key={section.label || "__top"}>
                {section.label && (
                  <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-text-on-dark-muted/60 px-3 mb-0.5 group-data-[collapsible=icon]:hidden">
                    {section.label}
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((i) => {
                      const active = pathname.startsWith(i.to);
                      return (
                        <SidebarMenuItem key={i.to}>
                          <SidebarMenuButton
                            asChild
                            isActive={active}
                            className={
                              active
                                ? "bg-accent-primary/15 text-accent-primary-light hover:bg-accent-primary/20 hover:text-accent-primary-light"
                                : "text-text-on-dark-muted hover:bg-white/5 hover:text-text-on-dark"
                            }
                          >
                            <Link to={i.to} className="flex items-center gap-3">
                              <i.icon className="h-4 w-4" />
                              <span>{i.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="px-2 pb-3">
            <div className="px-2 py-3 rounded-lg bg-white/5 text-xs text-text-on-dark-muted group-data-[collapsible=icon]:hidden">
              <div className="font-semibold text-text-on-dark truncate">{user.email}</div>
              <Badge variant="secondary" className="mt-1 text-[10px] uppercase tracking-widest font-semibold w-fit bg-white/10 text-text-on-dark border-white/20">
                {role}
              </Badge>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border-subtle bg-bg-elevated flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <div className="text-xs uppercase tracking-widest text-text-tertiary">Painel</div>
                <div className="text-sm font-semibold text-text-primary">{current}</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); nav({ to: "/login" }); }}>
              <LogOut className="h-4 w-4 mr-1" />Sair
            </Button>
          </header>
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {role === "admin" && onboardingCompleto === false && <SetupPendenteBanner />}
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const REQUIRED_SERVICES: Record<string, string> = {
  panda_video: "Panda Video (vídeos das aulas)",
  resend: "Resend (emails de convite e alertas)",
};

/** Banner pós-login: lista o que ainda falta configurar e leva ao wizard. */
function SetupPendenteBanner() {
  const nav = useNavigate();
  const listKeys = useServerFn(listApiKeys);
  const [missing, setMissing] = useState<string[] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const entries = await listKeys();
        const active = new Set(entries.filter((e) => e.is_active).map((e) => e.service_name));
        const faltam = Object.entries(REQUIRED_SERVICES)
          .filter(([svc]) => !active.has(svc))
          .map(([, label]) => label);
        if (mounted) setMissing(faltam);
      } catch {
        if (mounted) setMissing([]);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mb-6 rounded-xl border border-accent-warm/40 bg-accent-warm/10 p-4 flex flex-wrap items-center gap-3">
      <AlertTriangle className="h-5 w-5 text-accent-warm shrink-0" />
      <div className="flex-1 min-w-[220px]">
        <p className="text-sm font-semibold text-text-primary">Configuração inicial incompleta</p>
        <p className="text-xs text-text-secondary">
          {missing === null
            ? "Verificando o que falta configurar…"
            : missing.length > 0
              ? `Faltando: ${missing.join(", ")}.`
              : "Finalize o assistente para concluir o setup da plataforma."}
        </p>
      </div>
      <Button size="sm" variant="lp-primary" onClick={() => nav({ to: "/onboarding" })}>
        Continuar configuração
      </Button>
    </div>
  );
}
