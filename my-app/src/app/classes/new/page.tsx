"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, PageHeader } from "@/components/layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createClass,
  getCourses,
  getStudents,
  updateStudent,
  type ClassPayload,
  type CourseResponse,
  type StudentResponse,
} from "@/lib/core-api";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const emptyForm: ClassPayload = {
  courseId: "",
  startDate: "",
  finishDate: "",
  status: "NOT_STARTED",
  shiftClass: "MORNING",
  acronym: "",
  name: "",
  maxStudents: 30,
};

export default function NovaTurmaPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [form, setForm] = useState<ClassPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getCourses({ size: 200, sort: "name,asc" }),
      getStudents({ size: 500, sort: "name,asc" }),
    ])
      .then(([courseResponse, studentResponse]) => {
        if (!mounted) return;
        setCourses(courseResponse.filter((course) => course.status === "ACTIVE"));
        setStudents(studentResponse.filter((student) => student.statusStudent === "ENROLLED"));
      })
      .catch((requestError) => {
        if (mounted) setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar o formulário.");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const toggleStudent = (id: string) => {
    setSelectedStudents((current) =>
      current.includes(id) ? current.filter((studentId) => studentId !== id) : [...current, id],
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedStudents.length > form.maxStudents) {
      setError("A quantidade de alunos selecionados excede a capacidade da turma.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const created = await createClass({
        ...form,
        acronym: form.acronym.trim().toUpperCase(),
        name: form.name.trim(),
      });
      await Promise.all(
        selectedStudents.map((studentId) => updateStudent(studentId, { classId: created.id })),
      );
      router.push("/admin/classes");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível criar a turma.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell breadcrumbs={[{ label: "Turmas", href: "/classes" }, { label: "Nova Turma" }]}>
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          title="Criar Nova Turma"
          description="Cadastre a turma e, se necessário, mova alunos matriculados para ela"
          actions={<Link href="/classes" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}><ArrowLeft className="size-4" /> Voltar</Link>}
        />
        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Informações da Turma</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2"><Label>Nome</Label><Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label className="space-y-2"><Label>Código</Label><Input required pattern="[A-Z0-9-]+" value={form.acronym} onChange={(event) => setForm({ ...form, acronym: event.target.value.toUpperCase() })} /></label>
              <label className="space-y-2"><Label>Curso</Label><select required className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.courseId} onChange={(event) => setForm({ ...form, courseId: event.target.value })}><option value="">Selecione</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.courseName} ({course.code})</option>)}</select></label>
              <label className="space-y-2"><Label>Turno</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.shiftClass} onChange={(event) => setForm({ ...form, shiftClass: event.target.value as ClassPayload["shiftClass"] })}><option value="MORNING">Matutino</option><option value="AFTERNOON">Vespertino</option><option value="NIGHT">Noturno</option></select></label>
              <label className="space-y-2"><Label>Data inicial</Label><Input required type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></label>
              <label className="space-y-2"><Label>Data final</Label><Input required type="date" value={form.finishDate} onChange={(event) => setForm({ ...form, finishDate: event.target.value })} /></label>
              <label className="space-y-2"><Label>Capacidade</Label><Input required type="number" min={1} value={form.maxStudents} onChange={(event) => setForm({ ...form, maxStudents: Number(event.target.value) })} /></label>
              <label className="space-y-2"><Label>Status</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ClassPayload["status"] })}><option value="NOT_STARTED">Planejada</option><option value="ON_GOING">Em andamento</option><option value="FINISHED">Finalizada</option></select></label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Vincular Alunos ({selectedStudents.length})</CardTitle></CardHeader>
            <CardContent className="max-h-80 space-y-2 overflow-y-auto">
              {students.map((student) => (
                <label key={student.id} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
                  <Checkbox checked={selectedStudents.includes(student.id)} onCheckedChange={() => toggleStudent(student.id)} />
                  <span><span className="block text-sm font-medium">{student.name}</span><span className="text-xs text-muted-foreground">{student.registration} · {student.course} / {student.className}</span></span>
                </label>
              ))}
              {students.length === 0 && <p className="text-sm text-muted-foreground">Nenhum aluno matriculado disponível.</p>}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3"><Link href="/classes" className={buttonVariants({ variant: "outline" })}>Cancelar</Link><Button type="submit" className="gap-2" disabled={saving}><Save className="size-4" /> {saving ? "Salvando..." : "Cadastrar Turma"}</Button></div>
        </form>
      </div>
    </AppShell>
  );
}
