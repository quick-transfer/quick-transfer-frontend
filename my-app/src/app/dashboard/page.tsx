"use client";

import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import type { ClassDTO, StudentDTO, VacancyDTO } from "@/types";
import { getAdminVacancies, getAppStudents, getClasses } from '@/lib/application-api';
import { Users, GraduationCap, ArrowUpRight, Briefcase, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [vacancies, setVacancies] = useState<VacancyDTO[]>([]);
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [classes, setClasses] = useState<ClassDTO[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getAdminVacancies(), getAppStudents(), getClasses()])
      .then(([vacancyData, studentData, classData]) => {
        setVacancies(vacancyData);
        setStudents(studentData);
        setClasses(classData);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o painel.');
      });
  }, []);

  const totalStudents = students.length;
  const activeClasses = classes.filter((item) => item.status === "IN_PROGRESS").length;
  const totalVacancies = vacancies.length;

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
      render: () => (
        <Link
          href="/coordinator/direct"
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
          description="Visão geral de turmas, alunos e vagas"
          actions={
            <Link
              href="/classes#nova-turma"
              className={cn(buttonVariants({ variant: "default" }), "bg-primary text-white hover:bg-primary-700 px-4 py-5 text-[16px]")}
            >
              <Plus className="size-4" /> Nova Turma
            </Link>
          }
        />

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

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
              data={vacancies}
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
              label="Turmas Ativas"
              value={activeClasses}
              icon={GraduationCap}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
