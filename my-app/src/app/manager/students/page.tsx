"use client";

import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { getApplications, type VacancyApplicationResponse } from "@/lib/selection-api";
import Link from "next/link";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const statusLabel: Record<VacancyApplicationResponse["status"], string> = {
  REFERRED: "Encaminhado",
  INTERVIEW_SCHEDULED: "Entrevista agendada",
  HIRED: "Contratado",
  REJECTED: "Reprovado",
  WITHDRAWN: "Retirado",
};

export default function ManagerStudentsPage() {
  const [applications, setApplications] = useState<VacancyApplicationResponse[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    getApplications({ size: 500, sort: "createdAt,desc" })
      .then((response) => mounted && setApplications(response))
      .catch((requestError) => mounted && setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os alunos encaminhados."));
    return () => { mounted = false; };
  }, []);

  const columns: DataTableColumn<VacancyApplicationResponse>[] = [
    { key: "studentName", header: "Aluno", sortable: true, render: (application) => { const initials = application.studentName.split(" ").map((part) => part[0]).slice(0, 2).join(""); return <div className="flex items-center gap-3"><Avatar><AvatarFallback className="bg-primary-800 text-xs text-white">{initials}</AvatarFallback></Avatar><div><p className="font-bold">{application.studentName}</p><p className="text-xs text-muted-foreground">{application.registration} · {application.studentEmail}</p></div></div>; } },
    { key: "vacancyName", header: "Vaga", render: (application) => <span className="text-sm font-semibold">{application.vacancyName}</span> },
    { key: "coordinatorName", header: "Encaminhado por", render: (application) => <span className="text-sm">{application.coordinatorName}</span> },
    { key: "createdAt", header: "Data", sortable: true, render: (application) => <span className="text-sm">{new Date(application.createdAt).toLocaleDateString("pt-BR")}</span> },
    { key: "status", header: "Status", render: (application) => <Badge variant={application.status === "HIRED" ? "success" : application.status === "REJECTED" || application.status === "WITHDRAWN" ? "neutral" : "info"}>{statusLabel[application.status]}</Badge> },
    { key: "actions", header: "Ações", className: "text-right", render: (application) => <Link href={`/manager/students/${application.studentId}?applicationId=${application.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}><Eye className="size-3.5" /> Ver perfil</Link> },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Alunos" }]}>
      <div className="space-y-6"><PageHeader title="Alunos Encaminhados" description="Candidatos direcionados pelos coordenadores para suas vagas" />{error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}<div className="rounded-xl border bg-white p-6"><DataTable columns={columns} data={applications} searchable searchPlaceholder="Pesquisar aluno, matrícula ou vaga..." searchKeys={["studentName", "registration", "vacancyName"]} pageSize={10} getRowKey={(row) => row.id} /></div></div>
    </AppShell>
  );
}
