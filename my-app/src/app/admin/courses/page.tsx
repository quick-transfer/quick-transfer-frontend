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
import { mockCourses } from "@/lib/mock-data";
import type { CourseDTO } from "@/types";
import { ToastCard } from "@/components/ui/toast-card";
import { BookOpen, Edit, Plus, Trash2 } from "lucide-react";

export default function CursosAdminPage() {
  const [courses, setCourses] = useState<CourseDTO[]>(mockCourses);
  const [filterTab, setFilterTab] = useState<string>("ALL");
  const [editingCourse, setEditingCourse] = useState<CourseDTO | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<CourseDTO | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "destructive">("success");

  // Form state
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formCoordinator, setFormCoordinator] = useState("");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");

  const filteredCourses = courses.filter((course) => {
    if (filterTab === "ACTIVE") return course.status === "ACTIVE";
    if (filterTab === "COMPLETED") return course.status === "COMPLETED";
    return true;
  });

  const openEdit = (course: CourseDTO) => {
    setEditingCourse(course);
    setFormName(course.name);
    setFormCode(course.code);
    setFormCoordinator(course.coordinatorName);
    setFormStatus(course.status === "COMPLETED" ? "COMPLETED" : "ACTIVE");
    setIsEditOpen(true);
  };

  const openNew = () => {
    setFormName("");
    setFormCode("");
    setFormCoordinator("");
    setFormStatus("ACTIVE");
    setIsNewOpen(true);
  };

  const openDelete = (course: CourseDTO) => {
    setDeletingCourse(course);
    setIsDeleteOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingCourse) return;
    setCourses((prev) =>
      prev.map((c) =>
        c.id === editingCourse.id
          ? { ...c, name: formName, code: formCode, coordinatorName: formCoordinator, status: formStatus }
          : c
      )
    );
    setIsEditOpen(false);
    setToastVariant("success");
    setSuccessMsg("Curso atualizado com sucesso!");
    setTimeout(() => setSuccessMsg(""), 7000);
  };

  const handleCreate = () => {
    if (!formName.trim() || !formCode.trim()) return;
    const newCourse: CourseDTO = {
      id: `crs-${Date.now()}`,
      name: formName.trim(),
      code: formCode.trim(),
      coordinatorName: formCoordinator.trim(),
      totalStudents: 0,
      status: formStatus,
    };
    setCourses((prev) => [...prev, newCourse]);
    setIsNewOpen(false);
    setToastVariant("success");
    setSuccessMsg("Curso criado com sucesso!");
    setTimeout(() => setSuccessMsg(""), 7000);
  };

  const handleConfirmDelete = () => {
    if (!deletingCourse) return;
    setCourses((prev) => prev.filter((c) => c.id !== deletingCourse.id));
    setIsDeleteOpen(false);
    setToastVariant("destructive");
    setSuccessMsg(`Curso "${deletingCourse.name}" excluído com sucesso.`);
    setTimeout(() => setSuccessMsg(""), 7000);
  };

  const columns: DataTableColumn<CourseDTO>[] = [
    {
      key: "name",
      header: "Curso Técnico",
      sortable: true,
      render: (course) => (
        <div className="flex items-center gap-3">
          <div>
            <p className="font-medium text-foreground">{course.name}</p>
            <p className="text-xs text-muted-foreground">Código: {course.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: "coordinatorName",
      header: "Coordenador Responsável",
      render: (course) => (
        <span className="text-sm font-medium text-foreground">{course.coordinatorName}</span>
      ),
    },
    {
      key: "totalStudents",
      header: "Total Alunos",
      sortable: true,
      render: (course) => (
        <span className="text-sm font-semibold text-foreground">{course.totalStudents} alunos</span>
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
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Editar curso"
            onClick={() => openEdit(course)}
          >
            <Edit className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive hover:bg-red-50"
            aria-label="Excluir curso"
            onClick={() => openDelete(course)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Cursos" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Cursos Técnicos e Profissionalizantes"
          description="Catálogo de programas de qualificação técnica oferecidos na unidade"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Lado Esquerdo - Lista de Cursos */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full">
              <TabsList>
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

          {/* Lado Direito - Formulário de Novo Curso */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 h-fit sticky top-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Novo Curso</h2>
              <p className="text-xs text-slate-500">Preencha para cadastrar um novo curso.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Curso <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Técnico em Mecatrônica"
                  className="h-10 border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="MEC-2024"
                    className="h-10 border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as "ACTIVE" | "COMPLETED")}
                    className="h-10 w-full px-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="ACTIVE">Em Andamento</option>
                    <option value="COMPLETED">Concluído</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Coordenador</label>
                <Input
                  value={formCoordinator}
                  onChange={(e) => setFormCoordinator(e.target.value)}
                  placeholder="Nome do coordenador"
                  className="h-10 border-slate-200 text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={!formName.trim() || !formCode.trim()}
                className="w-full bg-primary-900 text-white hover:bg-primary-950 gap-2 h-10"
              >
                <Plus className="size-4" /> Criar Curso
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de Exclusão */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-sm bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Confirmar Exclusão</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Deseja realmente excluir o curso <strong className="text-slate-800">{deletingCourse?.name}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmDelete} className="bg-red-600 text-white hover:bg-red-700">Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastCard message={successMsg} variant={toastVariant} />
    </AppShell>
  );
}
