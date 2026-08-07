"use client";

import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import type { StudentDTO } from "@/types";
import Link from "next/link";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStudents } from '@/lib/manager-api';

export default function ManagerStudentsPage() {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getStudents().then((data) => {
      setStudents(data.map((student) => ({
        id: student.id,
        name: student.name,
        registration: student.acronym,
        email: student.email,
        courseName: student.course,
        className: student.course,
        status: 'ACTIVE',
        performanceGrade: student.averageGrade,
      })));
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os alunos.'));
  }, []);

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
            <Avatar className="size-9 border border-slate-200">
              <AvatarFallback className="bg-primary-800 text-white font-bold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900">{student.name}</p>
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
      key: "attendanceRate",
      header: "Frequência",
      sortable: true,
      render: (student) => (
        <span className="text-sm font-bold text-slate-900">
          {student.attendanceRate == null ? "Não informado" : `${student.attendanceRate}%`}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (student) => {
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

        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <DataTable
            columns={columns}
            data={students}
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
