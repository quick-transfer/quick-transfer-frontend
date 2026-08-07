"use client";

import { type FormEvent, useEffect, useState } from 'react';

import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToastCard } from "@/components/ui/toast-card";
import type { ClassDTO, StudentDTO } from "@/types";
import Link from "next/link";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteAppUser, getAppStudents, getClasses, updateAppStudent } from '@/lib/application-api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface StudentEditForm {
  name: string;
  email: string;
  age: string;
  performanceGrade: string;
  status: StudentDTO['status'];
  classId: string;
}

const emptyEditForm: StudentEditForm = {
  name: '',
  email: '',
  age: '18',
  performanceGrade: '',
  status: 'ACTIVE',
  classId: '',
};

export default function AlunosPage() {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [classes, setClasses] = useState<ClassDTO[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingStudent, setEditingStudent] = useState<StudentDTO | null>(null);
  const [editForm, setEditForm] = useState<StudentEditForm>(emptyEditForm);
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    Promise.all([getAppStudents(), getClasses()])
      .then(([studentData, classData]) => {
        setStudents(studentData);
        setClasses(classData);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os alunos e as turmas.');
      });
  }, []);

  const openEditStudent = (student: StudentDTO) => {
    const currentClassId = student.classId ?? classes.find((item) =>
      item.code === student.className || item.name === student.className
    )?.id ?? '';
    setEditingStudent(student);
    setEditForm({
      name: student.name,
      email: student.email,
      age: String(student.age ?? 18),
      performanceGrade: student.performanceGrade == null ? '' : String(student.performanceGrade),
      status: student.status,
      classId: currentClassId,
    });
    setEditError('');
  };

  const handleEditStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingStudent) return;

    const age = Number(editForm.age);
    const grade = editForm.performanceGrade.trim() === ''
      ? undefined
      : Number(editForm.performanceGrade);
    const selectedClass = editForm.classId
      ? classes.find((item) => item.id === editForm.classId)
      : undefined;

    if (!editForm.name.trim() || !editForm.email.trim()) {
      setEditError('Preencha os dados obrigatórios.');
      return;
    }
    if (editForm.classId && !selectedClass) {
      setEditError('A turma selecionada não está mais disponível.');
      return;
    }
    if (!Number.isInteger(age) || age < 16 || age > 19) {
      setEditError('A idade do aluno deve estar entre 16 e 19 anos.');
      return;
    }
    if (grade !== undefined && (!Number.isFinite(grade) || grade < 0 || grade > 10)) {
      setEditError('A média de desempenho deve estar entre 0 e 10.');
      return;
    }

    setIsSaving(true);
    setEditError('');
    try {
      const updated = await updateAppStudent(
        {
          ...editingStudent,
          name: editForm.name.trim(),
          email: editForm.email.trim(),
          age,
          performanceGrade: grade,
          status: editForm.status,
          classId: selectedClass?.id,
          className: selectedClass?.code ?? '',
          courseName: selectedClass?.courseName ?? '',
        },
        { removeFromClass: !selectedClass },
      );
      setStudents((current) => current.map((student) =>
        student.id === updated.id ? updated : student
      ));
      setClasses((current) => current.map((classItem) => {
        const wasInClass = editingStudent.classId === classItem.id || editingStudent.className === classItem.code;
        const isInClass = updated.classId === classItem.id || updated.className === classItem.code;
        if (wasInClass === isInClass) return classItem;
        return {
          ...classItem,
          totalStudents: Math.max(0, classItem.totalStudents + (isInClass ? 1 : -1)),
        };
      }));
      setEditingStudent(null);
      setNotice(selectedClass
        ? `Aluno “${updated.name}” atualizado e vinculado à turma ${updated.className}.`
        : `Aluno “${updated.name}” atualizado e removido da turma.`
      );
      window.setTimeout(() => setNotice(''), 5000);
    } catch (saveError) {
      setEditError(saveError instanceof Error ? saveError.message : 'Não foi possível atualizar o aluno.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAppUser(studentToDelete.id);
    } catch {}
    setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
    setStudentToDelete(null);
    setIsDeleting(false);
  };

  const columns: DataTableColumn<StudentDTO>[] = [
    {
      key: "name",
      header: "Aluno",
      sortable: true,
      render: (student) => {
        return (
          <div className="flex items-center gap-3">
            <div>
              <p className="font-medium text-foreground">{student.name}</p>
              <p className="text-xs text-muted-foreground">Matrícula: {student.registration}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "courseName",
      header: "Curso / Turma",
      render: (student) => (
        <div>
          <p className="font-medium text-foreground">{student.courseName || 'Sem curso'}</p>
          <p className="text-xs text-muted-foreground">{student.className || 'Sem turma'}</p>
        </div>
      ),
    },
    {
      key: "attendanceRate",
      header: "Frequência",
      sortable: true,
      render: (student) => (
        <span className="text-sm font-semibold text-foreground">
          {student.attendanceRate == null ? "Não informado" : `${student.attendanceRate}%`}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (student) => {
        if (student.status === "ACTIVE") return <Badge variant="success">Ativo</Badge>;
        if (student.status === "COMPLETED") return <Badge variant="info">Concluído</Badge>;
        return <Badge variant="neutral">Pausado</Badge>;
      },
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (student) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/students/${student.id}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
          >
            <Eye className="size-3.5" /> Detalhes
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditStudent(student)}
            className="gap-1.5"
          >
            <Pencil className="size-3.5" /> Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStudentToDelete(student)}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Alunos" }]}>
      <div className="space-y-6">
        <PageHeader
          title="Diretório de Alunos Aprendizes"
          description="Consulte e gerencie os alunos cadastrados nos programas técnicos da unidade"
          actions={
            <Link href="/students/new">
              <Button className="gap-2"><Plus className="size-4" /> Novo aluno</Button>
            </Link>
          }
        />

        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <DataTable
          columns={columns}
          data={students}
          searchable
          searchPlaceholder="Buscar aluno por nome ou matrícula..."
          searchKeys={["name", "registration", "courseName"]}
          pageSize={10}
          getRowKey={(row) => row.id}
        />
      </div>

      <Dialog
        open={Boolean(editingStudent)}
        onOpenChange={(open) => {
          if (!open && !isSaving) setEditingStudent(null);
        }}
      >
        <DialogContent className="bg-white sm:max-w-xl">
          <form onSubmit={handleEditStudent} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Editar aluno</DialogTitle>
              <DialogDescription>
                Atualize os dados acadêmicos e selecione a turma do aluno.
              </DialogDescription>
            </DialogHeader>

            {editError && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {editError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-student-name">Nome completo</Label>
                <Input
                  id="edit-student-name"
                  value={editForm.name}
                  onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                  maxLength={100}
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-student-email">E-mail</Label>
                <Input
                  id="edit-student-email"
                  type="email"
                  value={editForm.email}
                  onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))}
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-student-age">Idade</Label>
                <Input
                  id="edit-student-age"
                  type="number"
                  min={16}
                  max={19}
                  value={editForm.age}
                  onChange={(event) => setEditForm((current) => ({ ...current, age: event.target.value }))}
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-student-grade">Média de desempenho</Label>
                <Input
                  id="edit-student-grade"
                  type="number"
                  min={0}
                  max={10}
                  step="0.1"
                  value={editForm.performanceGrade}
                  onChange={(event) => setEditForm((current) => ({ ...current, performanceGrade: event.target.value }))}
                  disabled={isSaving}
                  placeholder="Não informada"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-student-status">Status</Label>
                <select
                  id="edit-student-status"
                  value={editForm.status}
                  onChange={(event) => setEditForm((current) => ({
                    ...current,
                    status: event.target.value as StudentDTO['status'],
                  }))}
                  disabled={isSaving}
                  className="h-9 w-full rounded-lg border border-input bg-white px-2.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="PAUSED">Pausado</option>
                  <option value="COMPLETED">Concluído</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-student-class">Turma</Label>
                <select
                  id="edit-student-class"
                  value={editForm.classId}
                  onChange={(event) => setEditForm((current) => ({ ...current, classId: event.target.value }))}
                  disabled={isSaving}
                  className="h-9 w-full rounded-lg border border-input bg-white px-2.5 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"
                >
                  <option value="">Sem turma</option>
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.code} — {classItem.courseName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingStudent(null)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={!!studentToDelete} onOpenChange={(open) => { if (!open) setStudentToDelete(null); }}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Excluir Aluno</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Tem certeza que deseja excluir o aluno <strong className="text-slate-950">&quot;{studentToDelete?.name}&quot;</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setStudentToDelete(null)}>Cancelar</Button>
            <Button onClick={handleDeleteStudent} disabled={isDeleting} className="bg-red-600 text-white hover:bg-red-700">
              {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ToastCard message={notice} variant="success" />
    </AppShell>
  );
}
