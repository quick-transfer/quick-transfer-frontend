"use client";

import { useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { mockStudents } from "@/lib/mock-data";
import type { StudentDTO } from "@/types";
import Link from "next/link";
import { Eye, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ManagerStudentsPage() {
  const [assignedStudents] = useState<Record<string, string>>({
    "std-1": "Analista de Dados Sênior",
  });

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
        const isAssigned = Boolean(assignedStudents[student.id]);

        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-9 border border-slate-200">
              <AvatarImage src={`https://i.pravatar.cc/150?u=${student.name}`} alt={student.name} />
              <AvatarFallback className="bg-primary-800 text-white font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900">{student.name}</p>
                {isAssigned && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <UserCheck className="size-3" /> Na Vaga: {assignedStudents[student.id]}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Matrícula: {student.registration}</p>
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
          <p className="font-semibold text-slate-900">{student.courseName}</p>
          <p className="text-xs text-slate-500">{student.className}</p>
        </div>
      ),
    },
    {
      key: "shift",
      header: "Turno",
      render: (student) => (
        <span className="text-sm font-medium text-slate-700">{student.shift}</span>
      ),
    },
    {
      key: "attendanceRate",
      header: "Frequência",
      sortable: true,
      render: (student) => (
        <span className="text-sm font-bold text-slate-900">{student.attendanceRate}%</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (student) => {
        if (assignedStudents[student.id]) {
          return <Badge variant="success">Alocado em Vaga</Badge>;
        }
        if (student.status === "ACTIVE") return <Badge variant="info">Disponível</Badge>;
        return <Badge variant="warning">Em Análise</Badge>;
      },
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (student) => (
        <Link
          href={`/manager/students/${student.id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 border-slate-200 text-slate-700 hover:bg-primary-900")}
        >
          <Eye className="size-3.5" /> Ver Perfil
        </Link>
      ),
    },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Alunos" }]}>
      <div className="space-y-6">
        <PageHeader
          title="Diretório de Alunos Aprendizes"
          description="Pesquise e consulte o perfil técnico e a disponibilidade de alunos candidatos às vagas"
        />

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <DataTable
            columns={columns}
            data={mockStudents}
            searchable
            searchPlaceholder="Pesquisar aluno por nome, matrícula ou curso..."
            searchKeys={["name", "registration", "courseName"]}
            pageSize={10}
            getRowKey={(row) => row.id}
          />
        </div>
      </div>
    </AppShell>
  );
}
