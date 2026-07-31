"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, RefreshCw } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getStudents,
  interviewStatusLabels,
  type Student,
} from "@/lib/manager-api";

function interviewBadgeVariant(status: string) {
  if (status === "HIRED") return "success" as const;
  if (status === "DISAPPROVED" || status === "DISCARDED") return "danger" as const;
  if (status === "NOT_SEEN" || status === "NOT_ASSOCIATED") return "warning" as const;
  return "info" as const;
}

export default function ManagerStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStudents(await getStudents());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os alunos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getStudents()
      .then((data) => active && setStudents(data))
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os alunos.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const columns: DataTableColumn<Student>[] = [
    {
      key: "name",
      header: "Aluno",
      sortable: true,
      render: (student) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-9 border border-slate-200">
            <AvatarFallback className="bg-primary-800 text-xs font-bold text-white">{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-slate-900">{student.name}</p>
            <p className="text-xs text-slate-500">{student.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "course",
      header: "Curso / Turma",
      sortable: true,
      render: (student) => <div><p className="font-semibold text-slate-900">{student.course}</p><p className="text-xs text-slate-500">{student.acronym}</p></div>,
    },
    {
      key: "averageGrade",
      header: "Média",
      sortable: true,
      render: (student) => <span className="font-bold text-slate-900">{student.averageGrade?.toLocaleString("pt-BR", { minimumFractionDigits: 1 }) ?? "—"}</span>,
    },
    {
      key: "statusStudentInterview",
      header: "Seleção",
      render: (student) => <Badge variant={interviewBadgeVariant(student.statusStudentInterview)}>{interviewStatusLabels[student.statusStudentInterview] || student.statusStudentInterview}</Badge>,
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (student) => <Link href={`/manager/students/${student.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}><Eye className="size-3.5" /> Ver perfil</Link>,
    },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Alunos" }]}>
      <div className="space-y-6">
        <PageHeader
          title="Diretório de alunos"
          description="Consulte dados acadêmicos, habilidades e situação no processo seletivo"
          actions={<Button variant="outline" onClick={() => void loadStudents()} disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Atualizar</Button>}
        />

        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">Carregando alunos...</div>
          ) : (
            <DataTable
              columns={columns}
              data={students}
              searchable
              searchPlaceholder="Pesquisar por nome, e-mail, curso ou turma..."
              searchKeys={["name", "email", "course", "acronym"]}
              emptyTitle="Nenhum aluno encontrado"
              pageSize={10}
              getRowKey={(row) => row.id}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
