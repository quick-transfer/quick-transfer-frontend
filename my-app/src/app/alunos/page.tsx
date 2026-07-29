"use client";

import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { mockStudents } from "@/lib/mock-data";
import type { StudentDTO } from "@/types";
import Link from "next/link";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AlunosPage() {
  const columns: DataTableColumn<StudentDTO>[] = [
    {
      key: "name",
      header: "Aluno",
      sortable: true,
      render: (student) => {
        const initials = student.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("");
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              {student.avatarUrl && <AvatarImage src={student.avatarUrl} alt={student.name} />}
              <AvatarFallback className="bg-primary-600 text-white font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
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
      key: "shift",
      header: "Turno Atual",
      render: (student) => (
        <span className="text-sm font-medium text-foreground">{student.shift}</span>
      ),
    },
    {
      key: "attendanceRate",
      header: "Frequência",
      sortable: true,
      render: (student) => (
        <span className="text-sm font-semibold text-foreground">{student.attendanceRate}%</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (student) => {
        if (student.status === "ACTIVE") return <Badge variant="success">Ativo</Badge>;
        if (student.status === "TRANSFERRING") return <Badge variant="warning">Em Transferência</Badge>;
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
          href={`/alunos/${student.id}`}
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
        />

        <DataTable
          columns={columns}
          data={mockStudents}
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
