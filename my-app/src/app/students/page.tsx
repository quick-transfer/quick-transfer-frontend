"use client";

import { useEffect, useState } from 'react';

import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import type { StudentDTO } from "@/types";
import Link from "next/link";
import { Eye, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAppStudents } from '@/lib/application-api';

export default function AlunosPage() {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getAppStudents().then(setStudents).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os alunos.');
    });
  }, []);
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
          <p className="font-medium text-foreground">{student.courseName}</p>
          <p className="text-xs text-muted-foreground">{student.className}</p>
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
        <Link
          href={`/students/${student.id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
        >
          <Eye className="size-3.5" /> Detalhes
        </Link>
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
    </AppShell>
  );
}
