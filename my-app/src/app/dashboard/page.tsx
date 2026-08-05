"use client";

import { AppShell, PageHeader } from "@/components/layout";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import { mockStudents, mockTransferRequests, mockVacancies } from "@/lib/mock-data";
import type { VacancyDTO } from "@/types";
import { Users, FileText, ArrowUpRight, Briefcase, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  // PENDING is the only actionable state for coordinators — APPROVED/REJECTED are terminal.
  const totalStudents = mockStudents.length;
  const pendingRequests = mockTransferRequests.filter((r) => r.status === "PENDING").length;
  const totalVacancies = mockVacancies.length;

  const vacancyColumns: DataTableColumn<VacancyDTO>[] = [
    {
      key: "title",
      header: "Vaga",
      sortable: true,
      render: (vacancy) => (
        <div>
          <p className="font-medium text-foreground">{vacancy.title}</p>
          {/* Department + location collapsed into one line to keep the row height consistent with other tables in the app. */}
          <p className="text-xs text-muted-foreground">{vacancy.department} · {vacancy.location}</p>
        </div>
      ),
    },
    {
      key: "filledSpots",
      header: "Preenchimento",
      render: (vacancy) => {
        // Math.round avoids displaying e.g. "66.666...%" when totalSpots doesn't divide evenly.
        const pct = Math.round((vacancy.filledSpots / vacancy.totalSpots) * 100);
        return (
          <div className="w-48 space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span>{vacancy.filledSpots} / {vacancy.totalSpots} vagas</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (vacancy) => {
        // URGENT takes priority in the else-if chain — it signals HR action needed,
        // whereas CLOSED is a terminal state that just needs acknowledgement.
        if (vacancy.status === "CLOSED") return <Badge variant="danger">Encerrada</Badge>;
        if (vacancy.status === "URGENT") return <Badge variant="warning">Urgente</Badge>;
        return <Badge variant="success">Aberta</Badge>;
      },
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (vacancy) => (
        <Link
          href={`/admin/vacancies?id=${vacancy.id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), 'gap-1')}
        >
          Detalhes
        </Link>
      ),
    },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Painel do Coordenador" }]}>
      <div className="space-y-6">
        <PageHeader
          title="Painel do Coordenador"
          description="Visão geral da ocupação de turnos, turmas ativas e solicitações pendentes"
          actions={
            <Link
              href="/classes/new"
              className={cn(buttonVariants({ variant: "default" }), "bg-primary text-white hover:bg-primary-700 px-4 py-5 text-[16px]")}
            >
              <Plus className="size-4" /> Nova Turma
            </Link>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vacancies table — spans 2 of 3 columns so the stat sidebar doesn't compete for attention. */}
          <div className="space-y-4 rounded-xl bg-card p-6 shadow-primary-900 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[20px] font-semibold text-foreground">Vagas Criadas</h2>
                <p className="text-sm text-muted-foreground">Visão geral das vagas abertas nas unidades fabris</p>
              </div>
              <Link
                href="/coordinator/direct"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-primary")}
              >
                Ver todos <ArrowUpRight className="size-4" />
              </Link>
            </div>

            {/* pageSize=5 is intentional: keeps the card within viewport height on 1080p without scrolling. */}
            <DataTable
              columns={vacancyColumns}
              data={mockVacancies}
              pageSize={5}
              getRowKey={(row) => row.id}
            />

          </div>
          {/* Stats Grid */}
          <div className="flex flex-col gap-4">
            <StatCard
              label="Total de Vagas Criadas"
              value={totalVacancies}
              icon={Briefcase}
            />
            <StatCard
              label="Alunos Matriculados"
              value={totalStudents}
              icon={Users}
            />
            <StatCard
              label="Solicitações Pendentes"
              value={pendingRequests}
              icon={FileText}
              // positive: false keeps the trend indicator red — pending requests always signal work outstanding.
              trend={{ value: "Requer atenção", positive: false }}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
