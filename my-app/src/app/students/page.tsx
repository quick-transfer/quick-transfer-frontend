"use client";

import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { getStudents, type StudentResponse } from "@/lib/core-api";
import Link from "next/link";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const shiftLabel: Record<string, string> = { MORNING: "Matutino", AFTERNOON: "Vespertino", NIGHT: "Noturno" };

export default function AlunosPage() {
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    getStudents({ size: 500, sort: "name,asc" })
      .then((response) => mounted && setStudents(response))
      .catch((requestError) => mounted && setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os alunos."));
    return () => { mounted = false; };
  }, []);

  const columns: DataTableColumn<StudentResponse>[] = [
    {
      key: "name",
      header: "Aluno",
      sortable: true,
      render: (student) => {
        const initials = student.name.split(" ").map((part) => part[0]).slice(0, 2).join("");
        return <div className="flex items-center gap-3"><Avatar className="size-9"><AvatarFallback className="bg-primary-600 text-xs font-semibold text-white">{initials}</AvatarFallback></Avatar><div><p className="font-medium">{student.name}</p><p className="text-xs text-muted-foreground">Matrícula: {student.registration}</p></div></div>;
      },
    },
    { key: "course", header: "Curso / Turma", render: (student) => <div><p className="font-medium">{student.course}</p><p className="text-xs text-muted-foreground">{student.className}</p></div> },
    { key: "shift", header: "Turno Atual", render: (student) => <span className="text-sm font-medium">{shiftLabel[student.shift] ?? student.shift}</span> },
    { key: "attendanceRate", header: "Frequência", sortable: true, render: (student) => <span className="text-sm font-semibold">{student.attendanceRate}%</span> },
    { key: "statusStudent", header: "Status", render: (student) => student.statusStudent === "ENROLLED" ? <Badge variant="success">Ativo</Badge> : student.statusStudent === "LEFT" ? <Badge variant="info">Desligado</Badge> : <Badge variant="neutral">Demitido</Badge> },
    { key: "actions", header: "Ações", className: "text-right", render: (student) => <Link href={`/students/${student.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}><Eye className="size-3.5" /> Detalhes</Link> },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Alunos" }]}>
      <div className="space-y-6">
        <PageHeader title="Diretório de Alunos Aprendizes" description="Consulte os alunos cadastrados nos programas técnicos da unidade" />
        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <DataTable columns={columns} data={students} searchable searchPlaceholder="Buscar aluno por nome ou matrícula..." searchKeys={["name", "registration", "course"]} pageSize={10} getRowKey={(row) => row.id} />
      </div>
    </AppShell>
  );
}
