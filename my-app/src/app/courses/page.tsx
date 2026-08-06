"use client";

import { useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCourses, mockStudents } from "@/lib/mock-data";
import type { CourseDTO, StudentDTO } from "@/types";
import { BookOpen, Users, Eye, ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function CoordinatorCoursesPage() {
  const [filterTab, setFilterTab] = useState<string>("ALL");
  const [selectedCourse, setSelectedCourse] = useState<CourseDTO | null>(null);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [courses, setCourses] = useState<CourseDTO[]>(mockCourses);

  const filteredCourses = courses.filter((c) => {
    if (filterTab === "ACTIVE") return c.status === "ACTIVE";
    if (filterTab === "COMPLETED") return c.status === "COMPLETED";
    return true;
  });

  const courseStudents = (course: CourseDTO): StudentDTO[] =>
    mockStudents.filter((s) => s.courseName === course.name);

  const handleViewStudents = (course: CourseDTO) => {
    setSelectedCourse(course);
    setIsStudentsOpen(true);
  };

  const handleCreate = () => {
    if (!formName.trim() || !formCode.trim()) return;
    const newCourse: CourseDTO = {
      id: `crs-${Date.now()}`,
      name: formName,
      code: formCode,
      coordinatorName: "Meu Coordenador",
      totalStudents: 0,
      status: "ACTIVE",
    };
    setCourses((prev) => [...prev, newCourse]);
    setIsNewOpen(false);
    setFormName("");
    setFormCode("");
    setSuccessMsg("Curso criado com sucesso!");
    setTimeout(() => setSuccessMsg(""), 7000);
  };

  const columns: DataTableColumn<CourseDTO>[] = [
    {
      key: "name",
      header: "Curso Técnico",
      sortable: true,
      render: (course) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
            <BookOpen className="size-4" />
          </div>
          <div>
            <p className="font-medium text-foreground">{course.name}</p>
            <p className="text-xs text-muted-foreground">Código: {course.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: "totalStudents",
      header: "Alunos Matriculados",
      sortable: true,
      render: (course) => (
        <div className="flex items-center gap-2">
          <Users className="size-3.5 text-slate-400" />
          <span className="text-sm font-semibold text-foreground">{course.totalStudents} alunos</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (course) => {
        if (course.status === "ACTIVE") return <Badge variant="success">Em Andamento</Badge>;
        if (course.status === "COMPLETED") return <Badge variant="neutral">Concluído</Badge>;
        return <Badge variant="warning">Planejado</Badge>;
      },
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (course) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => handleViewStudents(course)}
          >
            <Users className="size-3.5" /> Ver Alunos
          </Button>
          <Link
            href={`/classes?course=${course.id}`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-primary")}
          >
            Turmas <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <AppShell
      breadcrumbs={[
        { label: "Painel", href: "/dashboard" },
        { label: "Cursos" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Cursos"
          description="Gerencie os cursos técnicos e acompanhe os alunos matriculados em cada programa"
          actions={
            <Button
              className="gap-2 bg-primary text-white hover:bg-primary-700 px-4 py-5 text-[16px]"
              onClick={() => setIsNewOpen(true)}
            >
              <Plus className="size-4" /> Novo Curso
            </Button>
          }
        />

        <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full">
          <TabsList className="bg-white p-1">
            <TabsTrigger value="ALL">Todos os Cursos</TabsTrigger>
            <TabsTrigger value="ACTIVE">Em Andamento</TabsTrigger>
            <TabsTrigger value="COMPLETED">Concluídos</TabsTrigger>
          </TabsList>
        </Tabs>

        <DataTable
          columns={columns}
          data={filteredCourses}
          pageSize={10}
          searchable
          searchPlaceholder="Buscar curso por nome ou código..."
          searchKeys={["name", "code", "coordinatorName"]}
          getRowKey={(row) => row.id}
        />
      </div>

      {/* Modal - Alunos do Curso */}
      <Dialog open={isStudentsOpen} onOpenChange={setIsStudentsOpen}>
        <DialogContent className="sm:max-w-lg bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Alunos — {selectedCourse?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Alunos matriculados neste curso. Clique em "Ver Detalhes" para acessar o perfil completo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2 max-h-72 overflow-y-auto">
            {selectedCourse && courseStudents(selectedCourse).length === 0 ? (
              <p className="text-sm text-slate-400">Nenhum aluno encontrado para este curso.</p>
            ) : (
              selectedCourse &&
              courseStudents(selectedCourse).map((s) => (
                <div key={s.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-500">Mat: {s.registration} · {s.className}</p>
                  </div>
                  <Link
                    href={`/students/${s.id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
                    onClick={() => setIsStudentsOpen(false)}
                  >
                    <Eye className="size-3" /> Detalhes
                  </Link>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStudentsOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Curso */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Novo Curso</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Preencha as informações para criar um novo curso.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nome do Curso <span className="text-red-500">*</span>
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Técnico em Mecatrônica"
                className="h-10 border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Código <span className="text-red-500">*</span>
              </label>
              <Input
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="Ex: MEC-2024"
                className="h-10 border-slate-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleCreate}
              disabled={!formName.trim() || !formCode.trim()}
              className="bg-primary-900 text-white hover:bg-primary-950"
            >
              Criar Curso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {successMsg && (
        <div className="fixed top-20 right-6 z-50 max-w-sm p-4 bg-emerald-800 text-white rounded-lg shadow-xl text-sm font-medium">
          {successMsg}
        </div>
      )}
    </AppShell>
  );
}
