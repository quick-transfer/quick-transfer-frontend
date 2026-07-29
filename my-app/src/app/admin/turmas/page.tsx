"use client";

import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { mockClasses } from "@/lib/mock-data";
import type { ClassDTO } from "@/types";
import { Plus, GraduationCap, Edit } from "lucide-react";
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
        <span className="text-xs font-semibold text-foreground">
          {cls.totalStudents} / {cls.maxStudents} alunos
        </span>
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
      render: () => (
        <Button variant="outline" size="sm" className="gap-1">
          <Edit className="size-3.5" /> Editar
        </Button>
      ),
    },
  ];

  return (
    <AppShell
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Turmas" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Gerenciar Turmas"
          description="Controle de turmas ativas, planejamento de turmas e matrículas"
          actions={
            <Link
              href="/turmas/nova"
              className={cn(buttonVariants({ variant: "default" }), "gap-2 bg-primary text-white hover:bg-primary-700")}
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
          searchPlaceholder="Buscar turma por nome ou código..."
          searchKeys={["name", "code", "courseName"]}
          getRowKey={(row) => row.id}
        />
      </div>
    </AppShell>
  );
}
