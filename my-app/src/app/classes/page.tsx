"use client";

import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { mockClasses } from "@/lib/mock-data";
import type { ClassDTO } from "@/types";
import { Plus, GraduationCap, Eye } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TurmasPage() {
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
        <Link
          href={`/classes/${cls.id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
        >
          <Eye className="size-3.5" /> Ver Alunos
        </Link>
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
          actions={
            <Link
              href="/classes/new"
              className={cn(buttonVariants({ variant: "default" }), "gap-2 bg-primary text-white hover:bg-primary-700 px-4 py-5 text-[16px]")}
            >
              <Plus className="size-4" /> Nova Turma
            </Link>
          }
        />

        <DataTable
          columns={columns}
          data={mockClasses}
          pageSize={10}
          searchable
          searchPlaceholder="Buscar turma por nome, código ou curso..."
          searchKeys={["name", "code", "courseName"]}
          getRowKey={(row) => row.id}
        />
      </div>
    </AppShell>
  );
}
