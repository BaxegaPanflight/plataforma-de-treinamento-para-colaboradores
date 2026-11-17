import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Camera, CheckCircle2, XCircle, ListChecks } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_aluno/aluno/prova/$id")({ component: ProvaPage });

interface Alternative { id: string; texto: string; correta: boolean }
interface Question {
  id: string;
  enunciado: string;
  nivel: "facil" | "medio" | "dificil";
  alternatives: Alternative[];
}
interface CourseCfg {
  id: string;
  titulo: string;
  nota_minima: number;
  num_questoes: number;
  emite_certificado: boolean;
  nr_codigo: string[];
  carga_horaria_horas: number;
}

type Step = "intro" | "quiz" | "result";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ProvaPage() {
  const { id: courseId } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseCfg | null>(null);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [drawn, setDrawn] = useState<Question[]>([]);
  const [step, setStep] = useState<Step>("intro");

  // selfie
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [selfieCaptured, setSelfieCaptured] = useState(false);

  // quiz
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [submitting, setSubmitting] = useState(false);

  // result
  const [finalScore, setFinalScore] = useState(0);
  const [aprovado, setAprovado] = useState(false);
  const [certToken, setCertToken] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data: enr } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", courseId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!enr) { nav({ to: "/aluno/catalogo" }); return; }
    setEnrollmentId(enr.id);

    const { data: c } = await supabase
      .from("courses")
      .select("id, titulo, nota_minima, num_questoes, emite_certificado, nr_codigo, carga_horaria_horas")
      .eq("id", courseId)
      .maybeSingle();
    if (!c) { nav({ to: "/aluno/catalogo" }); return; }
    setCourse(c as CourseCfg);

    const { data: qs } = await supabase
      .from("questions")
      .select("id, enunciado, nivel, alternatives(id, texto, correta)")
      .eq("course_id", courseId)
      .eq("ativo", true);
    setAllQuestions((qs ?? []) as Question[]);
    setLoading(false);
  }, [courseId, user, nav]);

  useEffect(() => { load(); }, [load]);

  const drawQuestions = useCallback(() => {
    if (!course) return;
    const n = Math.min(course.num_questoes ?? 10, allQuestions.length);
    const picked = shuffle(allQuestions).slice(0, n).map((q) => ({
      ...q,
      alternatives: shuffle(q.alternatives),
    }));
    setDrawn(picked);
    setAnswers(new Map());
    setCurrent(0);
  }, [course, allQuestions]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = s;
      setStream(s);
    } catch {
      toast.error("Câmera não disponível. Você pode continuar sem foto.");
      setSelfieCaptured(true);
    }
  };

  useEffect(() => {
    if (step === "intro") startCamera();
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const captureSelfie = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);
    setSelfieDataUrl(canvas.toDataURL("image/jpeg", 0.8));
    setSelfieCaptured(true);
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
  };

  const startQuiz = () => {
    if (!allQuestions.length) return toast.error("Nenhuma questão cadastrada.");
    drawQuestions();
    setStep("quiz");
  };

  const selectAnswer = (qid: string, aid: string) => {
    setAnswers((m) => { const n = new Map(m); n.set(qid, aid); return n; });
  };

  const finish = async () => {
    if (!enrollmentId || !course) return;
    setSubmitting(true);
    let correct = 0;
    for (const q of drawn) {
      const aid = answers.get(q.id);
      if (q.alternatives.find((a) => a.id === aid)?.correta) correct++;
    }
    const score = Math.round((correct / drawn.length) * 100);
    const ap = score >= course.nota_minima;

    let selfieUrl: string | null = null;
    if (selfieDataUrl) {
      try {
        const blob = await (await fetch(selfieDataUrl)).blob();
        const path = `selfies/${enrollmentId}-${Date.now()}.jpg`;
        const { error: upErr } = await supabase.storage.from("certificates").upload(path, blob);
        if (!upErr) {
          selfieUrl = supabase.storage.from("certificates").getPublicUrl(path).data.publicUrl;
        }
      } catch { /* ignore */ }
    }

    const { data: attempt, error: aErr } = await supabase.from("attempts").insert({
      enrollment_id: enrollmentId,
      score,
      aprovado: ap,
      ip: null,
      user_agent: navigator.userAgent,
      evidencias: selfieUrl ? [{ type: "selfie_start", url: selfieUrl, captured_at: new Date().toISOString() }] : [],
    }).select("id").single();

    if (aErr || !attempt) { setSubmitting(false); return toast.error(aErr?.message ?? "Erro ao salvar tentativa"); }

    const rows = [...answers.entries()].map(([question_id, alternative_id]) => ({
      attempt_id: attempt.id,
      question_id,
      alternative_id,
      correta: drawn.find((q) => q.id === question_id)?.alternatives.find((a) => a.id === alternative_id)?.correta ?? false,
    }));
    if (rows.length) {
      const { error: ansErr } = await supabase.from("attempt_answers").insert(rows);
      if (ansErr) toast.error("Erro ao salvar respostas");
    }

    // Generate certificate when approved
    let newCertToken: string | null = null;
    if (ap && course.emite_certificado) {
      const { data: cert } = await supabase
        .from("certificates")
        .insert({
          attempt_id: attempt.id,
          user_id: user!.id,
          course_id: courseId,
          nr_codigos: course.nr_codigo,
          carga_horaria_horas: course.carga_horaria_horas,
        })
        .select("qr_token")
        .single();
      newCertToken = cert?.qr_token ?? null;
    }

    // Fire-and-forget notifications (don't await)
    if (ap) {
      supabase.functions.invoke("send-notification", {
        body: { template: "prova_aprovada", payload: { curso: course.titulo, score } },
      });
      if (course.emite_certificado && newCertToken) {
        supabase.functions.invoke("send-notification", {
          body: {
            template: "certificado_emitido",
            payload: { curso: course.titulo, cert_url: `${window.location.origin}/certificado/${newCertToken}` },
          },
        });
      }
    }

    setFinalScore(score);
    setAprovado(ap);
    setCertToken(newCertToken);
    setSubmitting(false);
    setStep("result");
  };

  const retry = () => {
    setSelfieDataUrl(null);
    setSelfieCaptured(false);
    setAnswers(new Map());
    setCurrent(0);
    setStep("intro");
  };

  if (loading || !course) return <div className="text-text-secondary text-sm">Carregando…</div>;

  if (!allQuestions.length) {
    return (
      <div className="space-y-4">
        <Link to="/aluno/curso/$id" params={{ id: courseId }} className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent-primary">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </Link>
        <div className="lp-solid-card p-12 text-center text-text-tertiary">
          Nenhuma questão cadastrada ainda.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {step === "intro" && (
        <>
          <Link to="/aluno/curso/$id" params={{ id: courseId }} className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-accent-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao curso
          </Link>
          <div className="lp-solid-card p-6 sm:p-8 space-y-4">
            <Badge variant="secondary" className="text-[10px] uppercase tracking-widest">
              <ListChecks className="h-3 w-3 mr-1" /> Prova Final
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">{course.titulo}</h1>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border p-3">
                <div className="text-text-tertiary text-xs">Nota mínima</div>
                <div className="font-semibold text-text-primary">{course.nota_minima}%</div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="text-text-tertiary text-xs">Nº de questões</div>
                <div className="font-semibold text-text-primary">{Math.min(course.num_questoes, allQuestions.length)}</div>
              </div>
            </div>
            <div className="rounded-lg bg-accent-primary/5 border border-accent-primary/30 p-3 text-sm text-text-secondary">
              É obrigatório capturar uma foto para comprovar sua identidade antes de iniciar a prova.
            </div>

            <div className="space-y-3">
              {!selfieDataUrl ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="aspect-video rounded-xl w-full max-w-sm mx-auto bg-bg-surface-2 border border-border"
                  />
                  <div className="flex justify-center">
                    <Button variant="outline" onClick={captureSelfie} disabled={!stream}>
                      <Camera className="h-4 w-4 mr-2" /> Capturar foto
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <img src={selfieDataUrl} alt="Selfie" className="aspect-video rounded-xl w-full max-w-sm mx-auto object-cover border border-border" />
                  <div className="flex justify-center">
                    <Button size="sm" variant="ghost" onClick={() => { setSelfieDataUrl(null); setSelfieCaptured(false); startCamera(); }}>
                      Tirar outra
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="lp-primary"
              className="w-full"
              disabled={!selfieCaptured}
              onClick={startQuiz}
            >
              Iniciar prova →
            </Button>
          </div>
        </>
      )}

      {step === "quiz" && drawn.length > 0 && (
        <div className="lp-solid-card p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-tertiary">Questão {current + 1} de {drawn.length}</div>
            <Badge variant="secondary" className="text-[10px] uppercase">{drawn[current].nivel}</Badge>
          </div>
          <div className="h-1.5 rounded-full bg-bg-surface-2 overflow-hidden">
            <div className="h-full bg-accent-primary transition-all" style={{ width: `${((current + 1) / drawn.length) * 100}%` }} />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-text-primary leading-snug">
            {drawn[current].enunciado}
          </h2>
          <RadioGroup
            value={answers.get(drawn[current].id) ?? ""}
            onValueChange={(v) => selectAnswer(drawn[current].id, v)}
            className="space-y-2"
          >
            {drawn[current].alternatives.map((a) => (
              <Label
                key={a.id}
                htmlFor={a.id}
                className="flex items-start gap-3 rounded-lg border border-border p-4 cursor-pointer hover:border-accent-primary/50 has-[:checked]:border-accent-primary has-[:checked]:bg-accent-primary/5 transition-colors"
              >
                <RadioGroupItem value={a.id} id={a.id} className="mt-0.5" />
                <span className="text-sm text-text-primary leading-snug flex-1">{a.texto}</span>
              </Label>
            ))}
          </RadioGroup>

          <div className="flex justify-between pt-2">
            <Button
              variant="ghost"
              disabled={current === 0}
              onClick={() => setCurrent((c) => c - 1)}
            >
              Anterior
            </Button>
            {current < drawn.length - 1 ? (
              <Button
                variant="lp-primary"
                disabled={!answers.has(drawn[current].id)}
                onClick={() => setCurrent((c) => c + 1)}
              >
                Próxima
              </Button>
            ) : (
              <Button
                variant="lp-primary"
                disabled={!answers.has(drawn[current].id) || submitting}
                onClick={finish}
              >
                {submitting ? "Enviando…" : "Finalizar prova"}
              </Button>
            )}
          </div>
        </div>
      )}

      {step === "result" && (
        <div className="lp-solid-card p-8 sm:p-12 text-center space-y-5">
          {aprovado ? (
            <>
              <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Parabéns! Você foi aprovado</h1>
              <div className="text-5xl font-bold text-text-primary tabular-nums">{finalScore}%</div>
              <div className="text-sm text-text-secondary">Sua nota</div>
              {course.emite_certificado && certToken && (
                <Link
                  to="/aluno/certificados"
                  className="inline-flex items-center gap-1.5 text-sm text-accent-primary hover:underline"
                >
                  Ver meu certificado →
                </Link>
              )}
              <Button variant="lp-primary" className="w-full sm:w-auto" onClick={() => nav({ to: "/aluno/meus-cursos" })}>
                Voltar aos meus cursos
              </Button>
            </>
          ) : (
            <>
              <XCircle className="h-20 w-20 text-destructive mx-auto" />
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Não foi dessa vez</h1>
              <div className="text-5xl font-bold text-text-primary tabular-nums">{finalScore}%</div>
              <div className="text-sm text-text-secondary">Nota mínima necessária: {course.nota_minima}%</div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="lp-primary" onClick={retry}>
                  Tentar novamente
                </Button>
                <Button variant="outline" onClick={() => nav({ to: "/aluno/meus-cursos" })}>
                  Voltar
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}