import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import ScrollReveal from "@/components/lp/ScrollReveal";
import { ArrowRight, Award, ShieldCheck, Sparkles, BarChart3, BookOpen, Users } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { loading, user, role } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Carregando…</div>;
  if (user) {
    if (role === "admin" || role === "gestor") return <Navigate to="/admin/dashboard" />;
    return <Navigate to="/aluno/catalogo" />;
  }

  const features = [
    { icon: BookOpen, title: "Cursos modulares", desc: "Aulas em vídeo, PDFs, links e textos ricos — tudo organizado por módulo." },
    { icon: ShieldCheck, title: "Compliance pronto", desc: "Trilhas de LGPD, segurança e código de conduta com validade configurável." },
    { icon: Award, title: "Certificados verificáveis", desc: "Emissão automática com QR code e página pública de validação." },
    { icon: Users, title: "Gestão por equipe", desc: "Admin convida gestores que gerenciam alunos, matrículas e relatórios." },
    { icon: BarChart3, title: "Relatórios completos", desc: "Acompanhe progresso, tentativas e conclusões por curso ou aluno." },
    { icon: Sparkles, title: "White-label", desc: "Cor primária, logo e identidade visual personalizáveis em tempo real." },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* HERO — dark */}
      <header className="lp-section-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top, oklch(0.62 0.214 274 / 0.35), transparent 60%)" }} />
        <nav className="relative max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-on-dark font-bold tracking-tight">
            <div className="h-8 w-8 rounded-lg bg-accent-primary grid place-items-center text-white">L</div>
            LMS Compliance
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-text-on-dark-muted hover:text-text-on-dark text-sm">Entrar</Link>
            <Link to="/login" className="lp-btn-primary-indigo text-sm !py-2 !px-4">Criar conta</Link>
          </div>
        </nav>

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
          <ScrollReveal delay={0.05}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-accent-primary-light border border-white/10 bg-white/5">
              <Sparkles className="h-3.5 w-3.5" /> Plataforma de treinamentos corporativos
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-on-dark">
              Treinamentos & compliance
              <span className="block bg-gradient-to-r from-accent-primary-light to-accent-primary bg-clip-text text-transparent">
                que sua equipe realmente conclui
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.25}>
            <p className="mt-6 text-lg text-text-on-dark-muted max-w-2xl mx-auto">
              LMS white-label para criar cursos, aplicar quizzes, emitir certificados verificáveis e gerenciar a jornada de cada colaborador.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.35}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="lp-btn-primary-indigo">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="lp-btn-ghost-clean">Já tenho conta</Link>
            </div>
          </ScrollReveal>
        </div>
      </header>

      {/* FEATURES — light */}
      <section className="lp-section-light lp-section-spacing">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent-primary">Recursos</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
                Tudo o que você precisa para escalar treinamentos
              </h2>
              <p className="mt-4 text-text-secondary">
                Da criação do conteúdo à emissão do certificado, em uma plataforma com a sua marca.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 0.08}>
                <div className="lp-solid-card p-6 h-full">
                  <div className="h-12 w-12 rounded-xl bg-accent-primary/10 text-accent-primary grid place-items-center mb-4">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary">{f.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — dark */}
      <section className="lp-section-dark lp-section-spacing">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal variant="scale-blur">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-on-dark">
              Pronto para certificar sua equipe?
            </h2>
            <p className="mt-4 text-text-on-dark-muted">
              Crie sua conta gratuita e publique seu primeiro curso em minutos.
            </p>
            <div className="mt-8">
              <Link to="/login" className="lp-btn-primary-indigo">
                Criar conta gratuita <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <footer className="lp-section-dark border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-text-on-dark-muted">
          © {new Date().getFullYear()} LMS Compliance — Plataforma white-label.
        </div>
      </footer>
    </div>
  );
}
