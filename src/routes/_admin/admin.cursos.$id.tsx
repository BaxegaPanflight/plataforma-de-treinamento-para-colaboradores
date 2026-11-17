import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { DisclaimerBanner } from "@/components/ui/disclaimer-banner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Video,
  FileText,
  Music,
  LayoutDashboard,
  Link2,
  AlignLeft,
  Check,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_admin/admin/cursos/$id")({ component: CourseEditor });

type LessonType = "panda" | "pdf" | "audio" | "slides" | "link" | "rich_text";

interface Course {
  id: string;
  titulo: string;
  descricao: string | null;
  capa_url: string | null;
  publicado: boolean;
  emite_certificado: boolean;
  progresso_minimo_pct: number;
  nota_minima: number;
  validade_meses: number;
  num_questoes: number;
  nr_codigo: string[];
  carga_horaria_horas: number;
  modalidade: "ead" | "presencial" | "hibrido";
}

interface Module {
  id: string;
  course_id: string;
  titulo: string;
  ordem: number;
}

interface Lesson {
  id: string;
  module_id: string;
  titulo: string;
  tipo: LessonType;
  ordem: number;
  obrigatoria: boolean;
  panda_lessons: { panda_video_id: string; duracao_seg: number | null }[] | null;
  file_lessons: { storage_path: string; mime_type: string | null }[] | null;
  link_lessons: { url: string }[] | null;
  rich_lessons: { conteudo_html: string }[] | null;
}

const LESSON_META: Record<LessonType, { label: string; emoji: string; Icon: typeof Video }> = {
  panda: { label: "Vídeo Panda", emoji: "🎬", Icon: Video },
  pdf: { label: "PDF", emoji: "📄", Icon: FileText },
  audio: { label: "Áudio", emoji: "🎵", Icon: Music },
  slides: { label: "Slides", emoji: "🖼️", Icon: LayoutDashboard },
  link: { label: "Link externo", emoji: "🔗", Icon: Link2 },
  rich_text: { label: "Texto rico", emoji: "📝", Icon: AlignLeft },
};

function CourseEditor() {
  const { id } = Route.useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});

  const loadAll = useCallback(async () => {
    const { data: c } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!c) { setLoading(false); return; }
    setCourse({
      id: c.id,
      titulo: c.titulo,
      descricao: c.descricao ?? null,
      capa_url: (c as any).capa_url ?? null,
      publicado: c.publicado ?? false,
      emite_certificado: (c as any).emite_certificado ?? true,
      progresso_minimo_pct: (c as any).progresso_minimo_pct ?? 80,
      nota_minima: (c as any).nota_minima ?? 70,
      validade_meses: (c as any).validade_meses ?? 0,
      num_questoes: (c as any).num_questoes ?? 5,
      nr_codigo: (c as any).nr_codigo ?? [],
      carga_horaria_horas: (c as any).carga_horaria_horas ?? 0,
      modalidade: (c as any).modalidade ?? "ead",
    });

    const { data: mods } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", id)
      .order("ordem");
    const modList = (mods ?? []) as Module[];
    setModules(modList);

    if (modList.length) {
      const { data: less } = await supabase
        .from("lessons")
        .select("*, panda_lessons(*), file_lessons(*), link_lessons(*), rich_lessons(*)")
        .in("module_id", modList.map((m) => m.id))
        .order("ordem");
      const grouped: Record<string, Lesson[]> = {};
      for (const m of modList) grouped[m.id] = [];
      for (const l of (less ?? []) as Lesson[]) {
        (grouped[l.module_id] ||= []).push(l);
      }
      setLessonsByModule(grouped);
    } else {
      setLessonsByModule({});
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (loading) {
    return <div className="text-text-secondary text-sm">Carregando…</div>;
  }

  if (!course) {
    return (
      <div className="lp-solid-card p-12 text-center space-y-4">
        <div className="text-text-primary font-semibold">Curso não encontrado</div>
        <Button variant="lp-primary" onClick={() => nav({ to: "/admin/cursos" })}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </div>
    );
  }

  const togglePublish = async (val: boolean) => {
    setCourse({ ...course, publicado: val });
    const { error } = await supabase.from("courses").update({ publicado: val }).eq("id", course.id);
    if (error) {
      toast.error(error.message);
      setCourse({ ...course, publicado: !val });
    } else {
      toast.success(val ? "Curso publicado" : "Movido para rascunho");
      logAudit(val ? "curso_publicado" : "curso_despublicado", "courses", course.id, { titulo: course.titulo });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <Link to="/admin/cursos" className="text-sm text-text-secondary hover:text-accent-primary inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Cursos
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">{course.titulo}</h1>
        </div>
        <div className="flex items-center gap-3 lp-solid-card px-4 py-2">
          <Badge variant={course.publicado ? "default" : "secondary"}>
            {course.publicado ? "Publicado" : "Rascunho"}
          </Badge>
          <Switch checked={course.publicado} onCheckedChange={togglePublish} />
        </div>
      </div>

      <Tabs defaultValue="conteudo">
        <TabsList>
          <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
          <TabsTrigger value="avaliacao">Avaliação</TabsTrigger>
        </TabsList>

        <TabsContent value="conteudo" className="space-y-4 pt-4">
          <ContentTab
            course={course}
            modules={modules}
            lessonsByModule={lessonsByModule}
            reload={loadAll}
          />
        </TabsContent>

        <TabsContent value="config" className="pt-4">
          <ConfigTab course={course} onSaved={(c) => setCourse(c)} />
        </TabsContent>

        <TabsContent value="avaliacao" className="pt-4">
          <AvaliacaoTab
            courseId={course.id}
            numQuestoes={course.num_questoes}
            onNumQuestoesChange={(n) => setCourse({ ...course, num_questoes: n })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* -------------------- Configurações -------------------- */

function ConfigTab({ course, onSaved }: { course: Course; onSaved: (c: Course) => void }) {
  const [form, setForm] = useState<Course>(course);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { setForm(course); }, [course]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("courses").update({
      titulo: form.titulo,
      descricao: form.descricao,
      capa_url: form.capa_url,
      emite_certificado: form.emite_certificado,
      progresso_minimo_pct: form.progresso_minimo_pct,
      nota_minima: form.nota_minima,
      validade_meses: form.validade_meses,
      num_questoes: form.num_questoes,
      nr_codigo: form.nr_codigo,
      carga_horaria_horas: form.carga_horaria_horas,
      modalidade: form.modalidade,
    }).eq("id", course.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Configurações salvas");
    onSaved(form);
  };

  const uploadCover = async (file: File) => {
    setUploading(true);
    const path = `${course.id}/cover-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("course-assets").upload(path, file, { upsert: true });
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data } = supabase.storage.from("course-assets").getPublicUrl(path);
    setForm({ ...form, capa_url: data.publicUrl });
    setUploading(false);
    toast.success("Capa enviada. Lembre de salvar.");
  };

  return (
    <div className="lp-solid-card p-6 space-y-5 max-w-2xl">
      <div className="space-y-1.5">
        <Label>Título</Label>
        <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
      </div>
      <div className="space-y-1.5">
        <Label>Descrição</Label>
        <Textarea value={form.descricao ?? ""} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={4} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Validade em meses (0 = sem validade)</Label>
          <Input type="number" min={0} value={form.validade_meses}
            onChange={(e) => setForm({ ...form, validade_meses: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label>Nota mínima (%)</Label>
          <Input type="number" min={0} max={100} value={form.nota_minima}
            onChange={(e) => setForm({ ...form, nota_minima: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label>Progresso mínimo (%)</Label>
          <Input type="number" min={0} max={100} value={form.progresso_minimo_pct}
            onChange={(e) => setForm({ ...form, progresso_minimo_pct: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label>Nº de questões por tentativa</Label>
          <Input type="number" min={1} value={form.num_questoes}
            onChange={(e) => setForm({ ...form, num_questoes: Number(e.target.value) })} />
        </div>
      </div>

      {/* NR / Conformidade */}
      <div className="rounded-lg border border-accent-primary/20 bg-accent-primary/5 p-4 space-y-4">
        <div className="text-xs uppercase tracking-widest text-accent-primary font-semibold">Conformidade NR</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Normas Regulamentadoras (NR)</Label>
            <Input
              value={form.nr_codigo.join(", ")}
              onChange={(e) => setForm({ ...form, nr_codigo: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              placeholder="Ex: NR-35, NR-10"
            />
            <p className="text-xs text-text-tertiary">Separe múltiplas NRs por vírgula.</p>
          </div>
          <div className="space-y-1.5">
            <Label>Carga horária (horas)</Label>
            <Input
              type="number" min={0} step={0.5}
              value={form.carga_horaria_horas}
              onChange={(e) => setForm({ ...form, carga_horaria_horas: Number(e.target.value) })}
              placeholder="Ex: 8"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Modalidade</Label>
          <Select value={form.modalidade} onValueChange={(v) => setForm({ ...form, modalidade: v as Course["modalidade"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ead">EAD — 100% online</SelectItem>
              <SelectItem value="presencial">Presencial</SelectItem>
              <SelectItem value="hibrido">Híbrido (online + presencial)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div>
          <div className="text-sm font-medium text-text-primary">Emitir certificado ao concluir</div>
        </div>
        <Switch checked={form.emite_certificado}
          onCheckedChange={(v) => setForm({ ...form, emite_certificado: v })} />
      </div>

      {form.emite_certificado && (
        <DisclaimerBanner title="Validade legal requer configuração">
          A plataforma gera o PDF com assinatura SHA-256 e QR Code de verificação pública.
          Para que o certificado tenha <strong>validade jurídica e trabalhista</strong>, o contratante deve garantir:
          instrutor com habilitação exigida pela NR, conteúdo programático aderente à norma, modalidade EAD/presencial
          conforme permitido, e registro do treinamento no eSocial (S-2245).
        </DisclaimerBanner>
      )}

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div>
          <div className="text-sm font-medium text-text-primary">Curso publicado no catálogo</div>
        </div>
        <Switch checked={form.publicado}
          onCheckedChange={async (v) => {
            setForm({ ...form, publicado: v });
            await supabase.from("courses").update({ publicado: v }).eq("id", course.id);
            onSaved({ ...form, publicado: v });
          }} />
      </div>

      <div className="space-y-2">
        <Label>Capa do curso</Label>
        {form.capa_url && (
          <img src={form.capa_url} alt="" className="w-full max-w-sm rounded-lg border border-border" />
        )}
        <label className="inline-flex">
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }} />
          <Button type="button" variant="outline" disabled={uploading} asChild>
            <span><Upload className="h-4 w-4 mr-2" />{uploading ? "Enviando…" : "Enviar imagem"}</span>
          </Button>
        </label>
      </div>

      <Button variant="lp-primary" onClick={save} disabled={saving}>
        {saving ? "Salvando…" : "Salvar configurações"}
      </Button>
    </div>
  );
}

/* -------------------- Conteúdo -------------------- */

function ContentTab({
  course, modules, lessonsByModule, reload,
}: {
  course: Course;
  modules: Module[];
  lessonsByModule: Record<string, Lesson[]>;
  reload: () => Promise<void>;
}) {
  const addModule = async () => {
    const ordem = modules.length ? Math.max(...modules.map((m) => m.ordem)) + 1 : 0;
    const { error } = await supabase.from("modules").insert({
      course_id: course.id, titulo: "Novo módulo", ordem,
    });
    if (error) return toast.error(error.message);
    await reload();
  };

  return (
    <div className="space-y-4">
      {modules.map((m, idx) => (
        <ModuleCard
          key={m.id}
          mod={m}
          lessons={lessonsByModule[m.id] ?? []}
          isFirst={idx === 0}
          isLast={idx === modules.length - 1}
          siblings={modules}
          reload={reload}
        />
      ))}
      {modules.length === 0 && (
        <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm">
          Nenhum módulo ainda. Crie o primeiro abaixo.
        </div>
      )}
      <Button variant="outline" onClick={addModule}>
        <Plus className="h-4 w-4 mr-2" /> Adicionar módulo
      </Button>
    </div>
  );
}

function ModuleCard({
  mod, lessons, isFirst, isLast, siblings, reload,
}: {
  mod: Module;
  lessons: Lesson[];
  isFirst: boolean;
  isLast: boolean;
  siblings: Module[];
  reload: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [titulo, setTitulo] = useState(mod.titulo);
  const [confirmDel, setConfirmDel] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);

  const saveTitle = async () => {
    setEditing(false);
    if (titulo === mod.titulo) return;
    const { error } = await supabase.from("modules").update({ titulo }).eq("id", mod.id);
    if (error) return toast.error(error.message);
    await reload();
  };

  const move = async (dir: -1 | 1) => {
    const idx = siblings.findIndex((s) => s.id === mod.id);
    const other = siblings[idx + dir];
    if (!other) return;
    await supabase.from("modules").update({ ordem: other.ordem }).eq("id", mod.id);
    await supabase.from("modules").update({ ordem: mod.ordem }).eq("id", other.id);
    await reload();
  };

  const remove = async () => {
    const { error } = await supabase.from("modules").delete().eq("id", mod.id);
    setConfirmDel(false);
    if (error) return toast.error(error.message);
    toast.success("Módulo removido");
    await reload();
  };

  return (
    <div className="lp-solid-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        {editing ? (
          <Input
            autoFocus
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); }}
            className="max-w-md"
          />
        ) : (
          <div className="font-semibold text-text-primary flex-1">{mod.titulo}</div>
        )}
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" disabled={isFirst} onClick={() => move(-1)}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" disabled={isLast} onClick={() => move(1)}>
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setConfirmDel(true)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 pl-2 border-l border-border">
        {lessons.map((l, li) => (
          <LessonRow
            key={l.id}
            lesson={l}
            isFirst={li === 0}
            isLast={li === lessons.length - 1}
            siblings={lessons}
            reload={reload}
          />
        ))}
        {lessons.length === 0 && (
          <div className="text-xs text-text-tertiary px-2 py-1">Sem aulas ainda.</div>
        )}
      </div>

      <Button size="sm" variant="outline" onClick={() => setLessonDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" /> Adicionar aula
      </Button>

      <LessonDialog
        open={lessonDialogOpen}
        onOpenChange={setLessonDialogOpen}
        moduleId={mod.id}
        nextOrdem={lessons.length ? Math.max(...lessons.map((l) => l.ordem)) + 1 : 0}
        onCreated={reload}
      />

      <AlertDialog open={confirmDel} onOpenChange={setConfirmDel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover módulo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o módulo e todas as suas aulas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LessonRow({
  lesson, isFirst, isLast, siblings, reload,
}: {
  lesson: Lesson;
  isFirst: boolean;
  isLast: boolean;
  siblings: Lesson[];
  reload: () => Promise<void>;
}) {
  const meta = LESSON_META[lesson.tipo];
  const Icon = meta.Icon;
  const [editing, setEditing] = useState(false);
  const [titulo, setTitulo] = useState(lesson.titulo);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);

  const saveTitle = async () => {
    setEditing(false);
    if (titulo === lesson.titulo) return;
    const { error } = await supabase.from("lessons").update({ titulo }).eq("id", lesson.id);
    if (error) return toast.error(error.message);
    await reload();
  };

  const move = async (dir: -1 | 1) => {
    const idx = siblings.findIndex((s) => s.id === lesson.id);
    const other = siblings[idx + dir];
    if (!other) return;
    await supabase.from("lessons").update({ ordem: other.ordem }).eq("id", lesson.id);
    await supabase.from("lessons").update({ ordem: lesson.ordem }).eq("id", other.id);
    await reload();
  };

  const remove = async () => {
    const { error } = await supabase.from("lessons").delete().eq("id", lesson.id);
    if (error) return toast.error(error.message);
    toast.success("Aula removida");
    await reload();
  };

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted/40">
        <div className="h-8 w-8 rounded-md bg-accent-primary/10 text-accent-primary grid place-items-center shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        {editing ? (
          <Input
            autoFocus
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); }}
            className="h-8"
          />
        ) : (
          <div className="flex-1 text-sm text-text-primary truncate">{lesson.titulo}</div>
        )}
        <div className="flex items-center gap-0.5">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {lesson.tipo === "rich_text" && (
            <Button size="icon" variant="ghost" className="h-7 w-7" title="Editar conteúdo" onClick={() => setContentDialogOpen(true)}>
              <AlignLeft className="h-3.5 w-3.5 text-accent-primary" />
            </Button>
          )}
          <Button size="icon" variant="ghost" className="h-7 w-7" disabled={isFirst} onClick={() => move(-1)}>
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" disabled={isLast} onClick={() => move(1)}>
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={remove}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </div>

      {lesson.tipo === "rich_text" && (
        <RichContentDialog
          open={contentDialogOpen}
          onOpenChange={setContentDialogOpen}
          lesson={lesson}
          onSaved={reload}
        />
      )}
    </>
  );
}

function RichContentDialog({
  open, onOpenChange, lesson, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lesson: Lesson;
  onSaved: () => Promise<void>;
}) {
  const [html, setHtml] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setHtml(lesson.rich_lessons?.[0]?.conteudo_html ?? "");
  }, [open, lesson]);

  const save = async () => {
    setSaving(true);
    const existingId = lesson.rich_lessons?.[0] ? undefined : null;
    if (existingId === null) {
      const { error } = await supabase.from("rich_lessons").insert({ lesson_id: lesson.id, conteudo_html: html });
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("rich_lessons").update({ conteudo_html: html }).eq("lesson_id", lesson.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    setSaving(false);
    toast.success("Conteúdo salvo");
    onOpenChange(false);
    await onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar conteúdo — {lesson.titulo}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-2">
          <RichTextEditor value={html} onChange={setHtml} minHeight={360} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button variant="lp-primary" onClick={save} disabled={saving}>
            {saving ? "Salvando…" : "Salvar conteúdo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------- Lesson Dialog -------------------- */

function LessonDialog({
  open, onOpenChange, moduleId, nextOrdem, onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  moduleId: string;
  nextOrdem: number;
  onCreated: () => Promise<void>;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [tipo, setTipo] = useState<LessonType | null>(null);
  const [titulo, setTitulo] = useState("");
  const [pandaId, setPandaId] = useState("");
  const [duracao, setDuracao] = useState<string>("");
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep(1); setTipo(null); setTitulo(""); setPandaId(""); setDuracao("");
      setUrl(""); setHtml(""); setFile(null); setSaving(false);
    }
  }, [open]);

  const pickType = (t: LessonType) => { setTipo(t); setStep(2); };

  const submit = async () => {
    if (!tipo || !titulo.trim()) return toast.error("Informe o título da aula");
    if (tipo === "panda" && !pandaId.trim()) return toast.error("Informe o ID do Panda");
    if (tipo === "link" && !url.trim()) return toast.error("Informe a URL");
    if ((tipo === "pdf" || tipo === "audio" || tipo === "slides") && !file) {
      return toast.error("Selecione um arquivo");
    }

    setSaving(true);
    const { data: lesson, error: lErr } = await supabase.from("lessons").insert({
      module_id: moduleId, titulo, tipo, ordem: nextOrdem, obrigatoria: true,
    }).select("id").single();
    if (lErr || !lesson) { setSaving(false); return toast.error(lErr?.message ?? "Erro ao criar aula"); }

    const lid = lesson.id;
    let childErr: { message: string } | null = null;

    if (tipo === "panda") {
      const { error } = await supabase.from("panda_lessons").insert({
        lesson_id: lid,
        panda_video_id: pandaId.trim(),
        duracao_seg: duracao ? Number(duracao) : null,
      });
      childErr = error;
    } else if (tipo === "link") {
      const { error } = await supabase.from("link_lessons").insert({ lesson_id: lid, url });
      childErr = error;
    } else if (tipo === "rich_text") {
      const { error } = await supabase.from("rich_lessons").insert({ lesson_id: lid, conteudo_html: html });
      childErr = error;
    } else if (file) {
      const path = `${moduleId}/${lid}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("lesson-files").upload(path, file, { upsert: true });
      if (upErr) { childErr = upErr; }
      else {
        const { error } = await supabase.from("file_lessons").insert({
          lesson_id: lid, storage_path: path, mime_type: file.type,
        });
        childErr = error;
      }
    }

    if (childErr) {
      await supabase.from("lessons").delete().eq("id", lid);
      setSaving(false);
      return toast.error(childErr.message);
    }

    setSaving(false);
    toast.success("Aula criada");
    onOpenChange(false);
    await onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{step === 1 ? "Nova aula — tipo" : `Nova aula — ${tipo ? LESSON_META[tipo].label : ""}`}</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            {(Object.keys(LESSON_META) as LessonType[]).map((t) => {
              const m = LESSON_META[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => pickType(t)}
                  className="lp-solid-card p-4 text-left hover:border-accent-primary/50 transition-colors"
                >
                  <div className="text-2xl mb-1">{m.emoji}</div>
                  <div className="font-medium text-text-primary text-sm">{m.label}</div>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && tipo && (
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Título</Label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} required autoFocus />
            </div>

            {tipo === "panda" && (
              <>
                <div className="space-y-1.5">
                  <Label>ID do vídeo no Panda Video</Label>
                  <Input value={pandaId} onChange={(e) => setPandaId(e.target.value)} placeholder="ex: 1abc23de-..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Duração em segundos (opcional)</Label>
                  <Input type="number" min={0} value={duracao} onChange={(e) => setDuracao(e.target.value)} />
                </div>
              </>
            )}

            {tipo === "link" && (
              <div className="space-y-1.5">
                <Label>URL</Label>
                <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
              </div>
            )}

            {tipo === "rich_text" && (
              <div className="space-y-1.5">
                <Label>Conteúdo</Label>
                <RichTextEditor value={html} onChange={setHtml} minHeight={220} />
              </div>
            )}

            {(tipo === "pdf" || tipo === "audio" || tipo === "slides") && (
              <div className="space-y-1.5">
                <Label>Arquivo</Label>
                <Input
                  type="file"
                  accept={tipo === "pdf" ? "application/pdf" : tipo === "audio" ? "audio/*" : "*"}
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {file && <div className="text-xs text-text-tertiary flex items-center gap-1"><Check className="h-3 w-3" />{file.name}</div>}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 2 && (
            <Button variant="ghost" onClick={() => setStep(1)}>Voltar</Button>
          )}
          {step === 2 && (
            <Button variant="lp-primary" onClick={submit} disabled={saving}>
              {saving ? "Criando…" : "Criar aula"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------- Avaliação -------------------- */

interface AltDraft { id?: string; texto: string; correta: boolean }
interface QuestionRow {
  id: string;
  enunciado: string;
  nivel: "facil" | "medio" | "dificil";
  alternatives: { id: string; texto: string; correta: boolean }[];
}
interface GeneratedQuestion {
  enunciado: string;
  nivel: "facil" | "medio" | "dificil";
  alternatives: { texto: string; correta: boolean }[];
}

function AvaliacaoTab({
  courseId, numQuestoes, onNumQuestoesChange,
}: {
  courseId: string;
  numQuestoes: number;
  onNumQuestoesChange: (n: number) => void;
}) {
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<QuestionRow | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedQuestion[] | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<Set<number>>(new Set());
  const [savingAi, setSavingAi] = useState(false);
  const [localNum, setLocalNum] = useState(numQuestoes);

  useEffect(() => { setLocalNum(numQuestoes); }, [numQuestoes]);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("id, enunciado, nivel, alternatives(id, texto, correta)")
      .eq("course_id", courseId)
      .eq("ativo", true)
      .order("id");
    if (error) toast.error(error.message);
    setQuestions((data ?? []) as QuestionRow[]);
    setLoading(false);
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const saveNum = async (n: number) => {
    setLocalNum(n);
    if (n < 1) return;
    const { error } = await supabase.from("courses").update({ num_questoes: n }).eq("id", courseId);
    if (error) return toast.error(error.message);
    onNumQuestoesChange(n);
  };

  const softDelete = async (qid: string) => {
    const { error } = await supabase.from("questions").update({ ativo: false }).eq("id", qid);
    if (error) return toast.error(error.message);
    toast.success("Questão removida");
    await load();
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ course_id: courseId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Falha ao gerar questões");
      const qs = (body.questions ?? []) as GeneratedQuestion[];
      if (!qs.length) throw new Error("Nenhuma questão retornada");
      setGenerated(qs);
      setSelectedIdx(new Set(qs.map((_, i) => i)));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setGenerating(false);
    }
  };

  const saveGenerated = async () => {
    if (!generated) return;
    setSavingAi(true);
    let ok = 0;
    for (const [i, q] of generated.entries()) {
      if (!selectedIdx.has(i)) continue;
      const { data: ins, error } = await supabase.from("questions").insert({
        course_id: courseId, enunciado: q.enunciado, nivel: q.nivel, ativo: true,
      }).select("id").single();
      if (error || !ins) continue;
      const { error: aErr } = await supabase.from("alternatives").insert(
        q.alternatives.map((a) => ({ question_id: ins.id, texto: a.texto, correta: a.correta }))
      );
      if (!aErr) ok++;
    }
    setSavingAi(false);
    toast.success(`${ok} questões salvas`);
    setGenerated(null);
    setSelectedIdx(new Set());
    await load();
  };

  if (loading) return <div className="text-text-secondary text-sm">Carregando…</div>;

  return (
    <div className="space-y-5">
      <div className="lp-solid-card p-5 flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between">
        <div className="space-y-1.5 max-w-xs">
          <Label>Nº de questões por tentativa</Label>
          <Input
            type="number"
            min={1}
            value={localNum}
            onChange={(e) => setLocalNum(Number(e.target.value))}
            onBlur={(e) => saveNum(Number(e.target.value))}
          />
        </div>
        <Button variant="outline" onClick={generate} disabled={generating}>
          <Sparkles className="h-4 w-4 mr-2" />
          {generating ? "Gerando…" : "Gerar questões com IA"}
        </Button>
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={q.id} className="lp-solid-card p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-xs text-text-tertiary mt-0.5">#{i + 1}</div>
              <div className="flex-1 space-y-2">
                <div className="font-medium text-text-primary">{q.enunciado}</div>
                <Badge variant="secondary" className="text-[10px] uppercase">{q.nivel}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(q); setDialogOpen(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => softDelete(q.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            <ul className="space-y-1 pl-7">
              {q.alternatives.map((a) => (
                <li
                  key={a.id}
                  className={`text-sm flex items-start gap-2 ${a.correta ? "text-green-600 font-medium" : "text-text-secondary"}`}
                >
                  {a.correta ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> : <span className="h-4 w-4 mt-0.5 shrink-0 rounded-full border border-border" />}
                  <span>{a.texto}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {questions.length === 0 && (
          <div className="lp-solid-card p-12 text-center text-text-tertiary text-sm">
            Nenhuma questão ainda. Adicione manualmente ou gere com IA.
          </div>
        )}
      </div>

      <Button variant="lp-primary" onClick={() => { setEditing(null); setDialogOpen(true); }}>
        <Plus className="h-4 w-4 mr-2" /> Adicionar questão
      </Button>

      <QuestionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        courseId={courseId}
        question={editing}
        onSaved={load}
      />

      <Dialog open={!!generated} onOpenChange={(o) => { if (!o) setGenerated(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Questões geradas pela IA</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {generated?.map((q, i) => (
              <label key={i} className="lp-solid-card p-4 flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={selectedIdx.has(i)}
                  onCheckedChange={(c) => {
                    setSelectedIdx((s) => {
                      const n = new Set(s);
                      if (c) n.add(i); else n.delete(i);
                      return n;
                    });
                  }}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="font-medium text-text-primary text-sm">{q.enunciado}</div>
                  <Badge variant="secondary" className="text-[10px] uppercase">{q.nivel}</Badge>
                  <ul className="space-y-0.5">
                    {q.alternatives.map((a, ai) => (
                      <li key={ai} className={`text-xs flex items-start gap-1 ${a.correta ? "text-green-600 font-medium" : "text-text-secondary"}`}>
                        {a.correta ? <Check className="h-3 w-3 mt-0.5 shrink-0" /> : <span className="w-3 shrink-0" />}
                        <span>{a.texto}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setGenerated(null)}>Cancelar</Button>
            <Button variant="lp-primary" onClick={saveGenerated} disabled={savingAi || selectedIdx.size === 0}>
              {savingAi ? "Salvando…" : `Salvar selecionadas (${selectedIdx.size})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuestionDialog({
  open, onOpenChange, courseId, question, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courseId: string;
  question: QuestionRow | null;
  onSaved: () => Promise<void>;
}) {
  const [enunciado, setEnunciado] = useState("");
  const [nivel, setNivel] = useState<"facil" | "medio" | "dificil">("medio");
  const [alts, setAlts] = useState<AltDraft[]>([
    { texto: "", correta: true },
    { texto: "", correta: false },
    { texto: "", correta: false },
    { texto: "", correta: false },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (question) {
      setEnunciado(question.enunciado);
      setNivel(question.nivel);
      const padded: AltDraft[] = [...question.alternatives.map((a) => ({ texto: a.texto, correta: a.correta }))];
      while (padded.length < 4) padded.push({ texto: "", correta: false });
      setAlts(padded.slice(0, 4));
    } else {
      setEnunciado("");
      setNivel("medio");
      setAlts([
        { texto: "", correta: true },
        { texto: "", correta: false },
        { texto: "", correta: false },
        { texto: "", correta: false },
      ]);
    }
  }, [open, question]);

  const setCorrect = (idx: number) => {
    setAlts((a) => a.map((x, i) => ({ ...x, correta: i === idx })));
  };

  const submit = async () => {
    if (!enunciado.trim()) return toast.error("Informe o enunciado");
    if (alts.some((a) => !a.texto.trim())) return toast.error("Preencha todas as alternativas");
    if (alts.filter((a) => a.correta).length !== 1) return toast.error("Marque exatamente 1 alternativa correta");

    setSaving(true);
    try {
      let qid = question?.id;
      if (question) {
        const { error } = await supabase.from("questions")
          .update({ enunciado, nivel })
          .eq("id", question.id);
        if (error) throw error;
        await supabase.from("alternatives").delete().eq("question_id", question.id);
      } else {
        const { data: ins, error } = await supabase.from("questions").insert({
          course_id: courseId, enunciado, nivel, ativo: true,
        }).select("id").single();
        if (error || !ins) throw error ?? new Error("Erro");
        qid = ins.id;
      }
      const { error: aErr } = await supabase.from("alternatives").insert(
        alts.map((a) => ({ question_id: qid!, texto: a.texto, correta: a.correta }))
      );
      if (aErr) throw aErr;
      toast.success(question ? "Questão atualizada" : "Questão criada");
      onOpenChange(false);
      await onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  };

  const correctIdx = alts.findIndex((a) => a.correta);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{question ? "Editar questão" : "Nova questão"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Enunciado</Label>
            <Textarea value={enunciado} onChange={(e) => setEnunciado(e.target.value)} rows={3} />
          </div>
          <div className="space-y-1.5 max-w-[12rem]">
            <Label>Nível</Label>
            <Select value={nivel} onValueChange={(v) => setNivel(v as typeof nivel)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="facil">Fácil</SelectItem>
                <SelectItem value="medio">Médio</SelectItem>
                <SelectItem value="dificil">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Alternativas (marque a correta)</Label>
            <RadioGroup value={String(correctIdx)} onValueChange={(v) => setCorrect(Number(v))} className="space-y-2">
              {alts.map((a, i) => (
                <div key={i} className="flex items-center gap-2">
                  <RadioGroupItem value={String(i)} id={`alt-${i}`} />
                  <Input
                    value={a.texto}
                    onChange={(e) => setAlts((arr) => arr.map((x, idx) => idx === i ? { ...x, texto: e.target.value } : x))}
                    placeholder={`Alternativa ${i + 1}`}
                  />
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="lp-primary" onClick={submit} disabled={saving}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}