"use client";

import { AppShell, PageHeader } from "@/components/layout";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import { mockShifts, mockStudents, mockTransferRequests } from "@/lib/mock-data";
import type { ShiftDTO } from "@/types";
import { Clock, Users, FileText, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const totalStudents = mockStudents.length;
  const pendingRequests = mockTransferRequests.filter((r) => r.status === "PENDING").length;

  const shiftColumns: DataTableColumn<ShiftDTO>[] = [
    {
      key: "name",
      header: "Turno",
      sortable: true,
      render: (shift) => (
        <div>
          <p className="font-medium text-foreground">{shift.name}</p>
          <p className="text-xs text-muted-foreground">Supervisão: {shift.supervisorName}</p>
        </div>
      ),
    },
    {
      key: "currentOccupancy",
      header: "Ocupação",
      render: (shift) => (
        <div className="w-48 space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span>{shift.currentOccupancy} / {shift.capacity} alunos</span>
            <span>{shift.occupancyPercentage}%</span>
          </div>
          <Progress value={shift.occupancyPercentage} className="h-2" />
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (shift) => {
        if (shift.status === "FULL") return <Badge variant="danger">Lotado</Badge>;
        if (shift.status === "HIGH_DEMAND") return <Badge variant="warning">Alta Demanda</Badge>;
        return <Badge variant="success">Disponível</Badge>;
      },
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (shift) => (
        <Link
          href={`/turnos?id=${shift.id}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
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
              href="/turmas/nova"
              className={cn(buttonVariants({ variant: "default" }), "bg-primary text-white hover:bg-primary-700")}
            >
              Nova Turma
            </Link>
          }
        />

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total de Turnos Ativos"
            value={mockShifts.length}
            icon={Clock}
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
            trend={{ value: "Requer atenção", positive: false }}
          />
        </div>

        {/* Active Shifts Table */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Turnos Ativos</h2>
              <p className="text-sm text-muted-foreground">Ocupação em tempo real nas unidades fabris</p>
            </div>
            <Link
              href="/turnos"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1 text-primary")}
            >
              Ver todos <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <DataTable
            columns={shiftColumns}
            data={mockShifts}
            pageSize={5}
            getRowKey={(row) => row.id}
          />
        </div>
      </div>
    </AppShell>
  );
}
