"use client";

import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockInterviews } from "@/lib/mock-data";
import type { InterviewDTO } from "@/types";
import { CalendarPlus, Calendar, Clock } from "lucide-react";

export default function EntrevistasPage() {
  const columns: DataTableColumn<InterviewDTO>[] = [
    {
      key: "candidateName",
      header: "Candidato",
      sortable: true,
      render: (int) => (
        <div>
          <p className="font-medium text-foreground">{int.candidateName}</p>
          <p className="text-xs text-muted-foreground">{int.candidateEmail}</p>
        </div>
      ),
    },
    {
      key: "vacancyTitle",
      header: "Vaga Pretendida",
      render: (int) => (
        <span className="text-sm font-medium text-foreground">{int.vacancyTitle}</span>
      ),
    },
    {
      key: "scheduledDate",
      header: "Data / Horário",
      sortable: true,
      render: (int) => (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5 text-primary" /> {int.scheduledDate}
          </span>
          <span className="flex items-center gap-1 font-mono font-medium text-foreground">
            <Clock className="size-3.5 text-primary" /> {int.scheduledTime}
          </span>
        </div>
      ),
    },
    {
      key: "interviewerName",
      header: "Entrevistador",
      render: (int) => (
        <span className="text-xs font-medium text-foreground">{int.interviewerName}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (int) => {
        if (int.status === "APPROVED") return <Badge variant="success">Aprovado</Badge>;
        if (int.status === "REJECTED") return <Badge variant="danger">Reprovado</Badge>;
        if (int.status === "SCHEDULED") return <Badge variant="info">Agendada</Badge>;
        return <Badge variant="warning">Pendente</Badge>;
      },
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: () => (
        <Button variant="outline" size="sm">
          Reagendar
        </Button>
      ),
    },
  ];

  return (
    <AppShell
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Entrevistas" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Agendar e Gerenciar Entrevistas"
          description="Acompanhamento do processo seletivo dos novos aprendizes e técnicos"
          actions={
            <Button className="gap-2 bg-primary text-white hover:bg-primary-700">
              <CalendarPlus className="size-4" /> Nova Entrevista
            </Button>
          }
        />

        <DataTable
          columns={columns}
          data={mockInterviews}
          pageSize={10}
          searchable
          searchPlaceholder="Buscar candidato ou vaga..."
          searchKeys={["candidateName", "vacancyTitle", "interviewerName"]}
          getRowKey={(row) => row.id}
        />
      </div>
    </AppShell>
  );
}
