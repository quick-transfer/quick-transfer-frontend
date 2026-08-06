"use client";

import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ToastCard } from "@/components/ui/toast-card";
import type { ClassDTO } from "@/types";
import { GraduationCap, Eye, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getClasses } from '@/lib/application-api';
import { mockCourses } from "@/lib/mock-data";

export default function TurmasPage() {
  const [classes, setClasses] = useState<ClassDTO[]>([]);
  const [error, setError] = useState('');
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [course, setCourse] = useState("");
  const [period, setPeriod] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "destructive">("success");
  const [deletingClass, setDeletingClass] = useState<ClassDTO | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    getClasses().then(setClasses).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar as turmas.');
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim() || !classCode.trim() || !course || !period) {
      setToastVariant("destructive");
      setSuccessMsg("Preencha todos os campos obrigatórios (*).");
      setTimeout(() => setSuccessMsg(""), 7000);
      return;
    }
    const newClass: ClassDTO = {
      id: `cls-${Date.now()}`,
      name: className.trim(),
      code: classCode.trim(),
      courseName: mockCourses.find((c) => c.id === course)?.name || "Curso Geral",
      period: period as any,
      maxStudents: 30,
      totalStudents: 0,
      status: "PLANNED",
    };
    setClasses((prev) => [newClass, ...prev]);
    setClassName("");
    setClassCode("");
    setCourse("");
    setPeriod("");
    setToastVariant("success");
    setSuccessMsg("Turma cadastrada com sucesso!");
    setTimeout(() => setSuccessMsg(""), 7000);
  };

  const openDelete = (cls: ClassDTO) => {
    setDeletingClass(cls);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingClass) return;
    setClasses((prev) => prev.filter((c) => c.id !== deletingClass.id));
    setIsDeleteOpen(false);
    setToastVariant("destructive");
    setSuccessMsg(`Turma "${deletingClass.name}" excluída com sucesso.`);
    setTimeout(() => setSuccessMsg(""), 7000);
  };

  const columns: DataTableColumn<ClassDTO>[] = [
    {
      key: "name",
      header: "Turma",
      sortable: true,
      render: (cls) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
            <GraduationCap className="size-4" />
          </div>
          <div>
            <p className="font-medium text-foreground">{cls.name}</p>
            <p className="text-xs text-muted-foreground">Código: {cls.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: "courseName",
      header: "Curso Vinculado",
      render: (cls) => (
        <span className="text-sm font-medium text-foreground">{cls.courseName}</span>
      ),
    },
    {
      key: "period",
      header: "Período",
      render: (cls) => (
        <Badge variant="outline">{cls.period}</Badge>
      ),
    },
    {
      key: "occupancy",
      header: "Ocupação",
      render: (cls) => (
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium text-foreground">
            <span>{cls.totalStudents} / {cls.maxStudents}</span>
            <span>{Math.round((cls.totalStudents / cls.maxStudents) * 100)}%</span>
          </div>
          <div className="h-1.5 w-32 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-600 transition-all"
              style={{ width: `${Math.round((cls.totalStudents / cls.maxStudents) * 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (cls) => {
        if (cls.status === "IN_PROGRESS") return <Badge variant="success">Em Andamento</Badge>;
        if (cls.status === "PLANNED") return <Badge variant="info">Planejada</Badge>;
        return <Badge variant="neutral">Finalizada</Badge>;
      },
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (cls) => (
        <div className="flex justify-end items-center gap-1">
          <Link
            href={`/classes/${cls.id}`}
            className={cn("inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors", "gap-1")}
          >
            <Eye className="size-3.5" /> Ver Alunos
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive hover:bg-red-50"
            aria-label="Excluir turma"
            onClick={() => openDelete(cls)}
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
        { label: "Painel", href: "/dashboard" },
        { label: "Turmas" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Turmas"
          description="Gerenciamento das turmas ativas e planejadas dos programas de aprendizagem"
        />

        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Lado Esquerdo - Tabela de Turmas */}
          <div className="lg:col-span-2 space-y-4">
            <DataTable
              columns={columns}
              data={classes}
              pageSize={10}
              searchable
              searchPlaceholder="Buscar turma por nome, código ou curso..."
              searchKeys={["name", "code", "courseName"]}
              getRowKey={(row) => row.id}
            />
          </div>

          {/* Lado Direito - Cadastrar Turma */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 h-fit sticky top-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Cadastrar Turma</h2>
              <p className="text-xs text-slate-500">Preencha os dados da turma para efetuar o cadastro.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="className" className="text-xs font-semibold text-slate-700">
                  Nome da Turma <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="className"
                  placeholder="Ex: Turma - Desenvolvimento Web"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="mt-1 h-10 border-slate-200 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="classCode" className="text-xs font-semibold text-slate-700">
                  Código da Turma <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="classCode"
                  placeholder="Ex: MI79"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="mt-1 h-10 border-slate-200 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="course" className="text-xs font-semibold text-slate-700">
                  Curso Associado <span className="text-red-500">*</span>
                </Label>
                <Select value={course} onValueChange={(val) => setCourse(val ?? "")}>
                  <SelectTrigger id="course" className="mt-1 h-10 border-slate-200 text-sm">
                    <SelectValue placeholder="Selecione o curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCourses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="period" className="text-xs font-semibold text-slate-700">
                  Período de Aulas <span className="text-red-500">*</span>
                </Label>
                <Select value={period} onValueChange={(val) => setPeriod(val ?? "")}>
                  <SelectTrigger id="period" className="mt-1 h-10 border-slate-200 text-sm">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matutino">Matutino (07:30 - 11:30)</SelectItem>
                    <SelectItem value="Vespertino">Vespertino (13:30 - 17:30)</SelectItem>
                    <SelectItem value="Noturno">Noturno (18:30 - 22:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={!className.trim() || !classCode.trim() || !course || !period}
                className="w-full bg-primary-900 text-white hover:bg-primary-950 gap-2 h-10 mt-2"
              >
                <Save className="size-4" /> Cadastrar Turma
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
              Deseja realmente excluir a turma <strong className="text-slate-800">{deletingClass?.name}</strong>? Esta ação não pode ser desfeita.
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


