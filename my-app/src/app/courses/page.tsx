"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Eye, Plus, Users } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createCourse, getCourses, getStudents, type CourseResponse, type StudentResponse } from "@/lib/core-api";
import { getCurrentUser } from "@/lib/selection-api";
import { cn } from "@/lib/utils";

export default function CoordinatorCoursesPage() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [coordinatorId, setCoordinatorId] = useState("");
  const [filterTab, setFilterTab] = useState("ALL");
  const [selectedCourse, setSelectedCourse] = useState<CourseResponse | null>(null);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getCourses({ size: 300, sort: "courseName,asc" }),
      getStudents({ size: 500, sort: "name,asc" }),
      getCurrentUser(),
    ])
      .then(([courseResponse, studentResponse, user]) => {
        if (!mounted) return;
        setCourses(courseResponse);
        setStudents(studentResponse);
        setCoordinatorId(user.id);
      })
      .catch((requestError) => mounted && setError(
        requestError instanceof Error ? requestError.message : "Não foi possível carregar os cursos.",
      ));
    return () => { mounted = false; };
  }, []);

  const filteredCourses = useMemo(() => courses.filter((course) =>
    filterTab === "ALL" || course.status === filterTab,
  ), [courses, filterTab]);
  const courseStudents = selectedCourse
    ? students.filter((student) => student.course === selectedCourse.courseName)
    : [];

  const handleCreate = async () => {
    if (!formName.trim() || !formCode.trim() || !coordinatorId) return;
    setSaving(true);
    setError("");
    try {
      const created = await createCourse({
        name: formName.trim(),
        code: formCode.trim(),
        coordinatorId,
        status: "ACTIVE",
      });
      setCourses((current) => [...current, created]);
      setFormName("");
      setFormCode("");
      setNewOpen(false);
      setNotice("Curso criado com sucesso.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível criar o curso.");
    } finally {
      setSaving(false);
    }
  };

  const columns: DataTableColumn<CourseResponse>[] = [
    { key: "courseName", header: "Curso técnico", sortable: true, render: (course) => <div className="flex items-center gap-3"><div className="rounded-lg bg-primary-50 p-2 text-primary-600"><BookOpen className="size-4" /></div><div><p className="font-medium">{course.courseName}</p><p className="text-xs text-muted-foreground">Código: {course.code}</p></div></div> },
    { key: "totalStudents", header: "Alunos matriculados", sortable: true, render: (course) => <span className="flex items-center gap-2 text-sm font-semibold"><Users className="size-3.5 text-slate-400" />{course.totalStudents} alunos</span> },
    { key: "status", header: "Status", render: (course) => course.status === "ACTIVE" ? <Badge variant="success">Em andamento</Badge> : course.status === "COMPLETED" ? <Badge variant="neutral">Concluído</Badge> : <Badge variant="warning">Inativo</Badge> },
    { key: "actions", header: "Ações", className: "text-right", render: (course) => <div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => { setSelectedCourse(course); setStudentsOpen(true); }}><Users className="size-3.5" />Ver alunos</Button><Link href={`/classes?course=${course.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-primary")}>Turmas<ArrowUpRight className="size-3.5" /></Link></div> },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Painel", href: "/dashboard" }, { label: "Cursos" }]}>
      <div className="space-y-6">
        <PageHeader title="Cursos" description="Gerencie os cursos técnicos e acompanhe seus alunos" actions={<Button onClick={() => setNewOpen(true)}><Plus className="size-4" />Novo curso</Button>} />
        {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}
        <Tabs value={filterTab} onValueChange={setFilterTab}><TabsList><TabsTrigger value="ALL">Todos</TabsTrigger><TabsTrigger value="ACTIVE">Em andamento</TabsTrigger><TabsTrigger value="COMPLETED">Concluídos</TabsTrigger></TabsList></Tabs>
        <DataTable columns={columns} data={filteredCourses} pageSize={10} searchable searchPlaceholder="Buscar curso..." searchKeys={["courseName", "code", "coordinatorName"]} getRowKey={(row) => row.id} />
      </div>

      <Dialog open={studentsOpen} onOpenChange={setStudentsOpen}><DialogContent><DialogHeader><DialogTitle>Alunos — {selectedCourse?.courseName}</DialogTitle><DialogDescription>Alunos matriculados neste curso.</DialogDescription></DialogHeader><div className="max-h-72 space-y-2 overflow-y-auto">{courseStudents.map((student) => <div key={student.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><div><p className="text-sm font-semibold">{student.name}</p><p className="text-xs text-muted-foreground">{student.registration} · {student.className}</p></div><Link href={`/students/${student.id}`} className={buttonVariants({ variant: "outline", size: "sm" })} onClick={() => setStudentsOpen(false)}><Eye className="size-3" />Detalhes</Link></div>)}{courseStudents.length === 0 && <p className="text-sm text-muted-foreground">Nenhum aluno encontrado.</p>}</div><DialogFooter><Button variant="outline" onClick={() => setStudentsOpen(false)}>Fechar</Button></DialogFooter></DialogContent></Dialog>

      <Dialog open={newOpen} onOpenChange={setNewOpen}><DialogContent><DialogHeader><DialogTitle>Novo curso</DialogTitle><DialogDescription>Cadastre um curso sob sua coordenação.</DialogDescription></DialogHeader><div className="space-y-4"><Input value={formName} onChange={(event) => setFormName(event.target.value)} placeholder="Nome do curso" /><Input value={formCode} onChange={(event) => setFormCode(event.target.value)} placeholder="Código" /></div><DialogFooter><Button variant="outline" onClick={() => setNewOpen(false)}>Cancelar</Button><Button disabled={saving || !formName.trim() || !formCode.trim()} onClick={() => void handleCreate()}>{saving ? "Criando..." : "Criar curso"}</Button></DialogFooter></DialogContent></Dialog>
    </AppShell>
  );
}
