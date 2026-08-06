"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createCourse,
  deleteCourse,
  getCourses,
  getUsers,
  updateCourse,
  type CoursePayload,
  type CourseResponse,
  type UserResponse,
} from "@/lib/core-api";
import { Edit, Plus, Trash2 } from "lucide-react";

const emptyForm: CoursePayload = {
  name: "",
  code: "",
  coordinatorId: "",
  status: "ACTIVE",
};

export default function CursosAdminPage() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [coordinators, setCoordinators] = useState<UserResponse[]>([]);
  const [filterTab, setFilterTab] = useState("ALL");
  const [editing, setEditing] = useState<CourseResponse | null>(null);
  const [form, setForm] = useState<CoursePayload>(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getCourses({ size: 200, sort: "name,asc" }),
      getUsers({ size: 200, sort: "name,asc" }),
    ])
      .then(([courseResponse, userResponse]) => {
        if (!mounted) return;
        setCourses(courseResponse);
        setCoordinators(userResponse.filter((user) => user.role === "COORDINATOR" && user.active));
      })
      .catch((requestError) => {
        if (mounted) {
          setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os cursos.");
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredCourses = courses.filter((course) =>
    filterTab === "ALL" ? true : course.status === filterTab,
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, coordinatorId: coordinators[0]?.id ?? "" });
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (course: CourseResponse) => {
    const coordinator = coordinators.find((item) => item.name === course.coordinatorName);
    setEditing(course);
    setForm({
      name: course.courseName,
      code: course.code,
      coordinatorId: coordinator?.id ?? "",
      status: course.status,
    });
    setError("");
    setDialogOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.coordinatorId) {
      setError("Selecione um coordenador ativo.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const saved = editing
        ? await updateCourse(editing.id, form)
        : await createCourse(form);
      setCourses((current) =>
        [...current.filter((course) => course.id !== saved.id), saved].sort((a, b) =>
          a.courseName.localeCompare(b.courseName),
        ),
      );
      setDialogOpen(false);
      setNotice(`Curso ${editing ? "atualizado" : "criado"} com sucesso.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível salvar o curso.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (course: CourseResponse) => {
    if (!window.confirm(`Excluir o curso "${course.courseName}"?`)) return;
    setError("");
    try {
      await deleteCourse(course.id);
      setCourses((current) => current.filter((item) => item.id !== course.id));
      setNotice(`Curso "${course.courseName}" excluído com sucesso.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível excluir o curso.");
    }
  };

  const columns: DataTableColumn<CourseResponse>[] = [
    {
      key: "courseName",
      header: "Curso Técnico",
      sortable: true,
      render: (course) => (
        <div>
          <p className="font-medium text-foreground">{course.courseName}</p>
          <p className="text-xs text-muted-foreground">Código: {course.code}</p>
        </div>
      ),
    },
    { key: "coordinatorName", header: "Coordenador Responsável", render: (course) => <span className="text-sm font-medium">{course.coordinatorName}</span> },
    { key: "totalStudents", header: "Total Alunos", sortable: true, render: (course) => <span className="text-sm font-semibold">{course.totalStudents} alunos</span> },
    {
      key: "status",
      header: "Status",
      render: (course) =>
        course.status === "ACTIVE" ? <Badge variant="success">Em andamento</Badge>
          : course.status === "COMPLETED" ? <Badge variant="neutral">Concluído</Badge>
            : <Badge variant="warning">Inativo</Badge>,
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (course) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(course)}><Edit className="size-3.5" /></Button>
          <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => void remove(course)}><Trash2 className="size-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Cursos" }]}>
      <div className="space-y-6">
        <PageHeader
          title="Cursos Técnicos e Profissionalizantes"
          description="Catálogo de programas de qualificação técnica oferecidos na unidade"
          actions={<Button className="gap-2" onClick={openCreate}><Plus className="size-4" /> Novo Curso</Button>}
        />
        {error && !dialogOpen && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}
        <Tabs value={filterTab} onValueChange={setFilterTab}>
          <TabsList><TabsTrigger value="ALL">Todos</TabsTrigger><TabsTrigger value="ACTIVE">Em andamento</TabsTrigger><TabsTrigger value="COMPLETED">Concluídos</TabsTrigger></TabsList>
        </Tabs>
        <DataTable columns={columns} data={filteredCourses} pageSize={10} searchable searchPlaceholder="Buscar curso por nome ou código..." searchKeys={["courseName", "code", "coordinatorName"]} getRowKey={(row) => row.id} />
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !saving && setDialogOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader><DialogTitle>{editing ? "Editar curso" : "Novo curso"}</DialogTitle><DialogDescription>Vincule o curso a um coordenador ativo.</DialogDescription></DialogHeader>
            {error && <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <Input required placeholder="Nome" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Input required placeholder="Código" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
            <select required className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.coordinatorId} onChange={(event) => setForm({ ...form, coordinatorId: event.target.value })}>
              <option value="">Selecione o coordenador</option>
              {coordinators.map((coordinator) => <option key={coordinator.id} value={coordinator.id}>{coordinator.name}</option>)}
            </select>
            <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as CoursePayload["status"] })}>
              <option value="ACTIVE">Em andamento</option><option value="INACTIVE">Inativo</option><option value="COMPLETED">Concluído</option>
            </select>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
