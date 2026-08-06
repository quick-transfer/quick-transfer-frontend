"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Briefcase, FileText, Plus, Users } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getStudents, getVacancies, type VacancyResponse } from "@/lib/core-api";
import { getTransferRequests } from "@/lib/operations-api";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [vacancies, setVacancies] = useState<VacancyResponse[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getVacancies({ size: 500, sort: "name,asc" }),
      getStudents({ size: 500 }),
      getTransferRequests({ size: 500, status: "PENDING" }),
    ])
      .then(([vacancyResponse, studentResponse, requestResponse]) => {
        if (!mounted) return;
        setVacancies(vacancyResponse);
        setTotalStudents(studentResponse.length);
        setPendingRequests(requestResponse.length);
      })
      .catch((requestError) => mounted && setError(
        requestError instanceof Error ? requestError.message : "Não foi possível carregar o painel.",
      ));
    return () => { mounted = false; };
  }, []);

  const vacancyColumns: DataTableColumn<VacancyResponse>[] = [
    { key: "name", header: "Vaga", sortable: true, render: (vacancy) => <div><p className="font-medium">{vacancy.name}</p><p className="text-xs text-muted-foreground">{vacancy.area} · {vacancy.placeName}</p></div> },
    { key: "filledSpots", header: "Preenchimento", render: (vacancy) => { const percentage = vacancy.numbersVacancies === 0 ? 0 : Math.round(vacancy.filledSpots / vacancy.numbersVacancies * 100); return <div className="w-48 space-y-1"><div className="flex justify-between text-xs font-medium"><span>{vacancy.filledSpots} / {vacancy.numbersVacancies} vagas</span><span>{percentage}%</span></div><Progress value={percentage} className="h-2" /></div>; } },
    { key: "status", header: "Status", render: (vacancy) => vacancy.status === "CLOSED" ? <Badge variant="neutral">Encerrada</Badge> : vacancy.status === "URGENT" ? <Badge variant="warning">Urgente</Badge> : <Badge variant="success">Aberta</Badge> },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Painel do Coordenador" }]}>
      <div className="space-y-6">
        <PageHeader title="Painel do Coordenador" description="Visão geral de vagas, alunos e solicitações" actions={<Link href="/classes/new" className={cn(buttonVariants(), "gap-2")}><Plus className="size-4" />Nova turma</Link>} />
        {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 rounded-xl bg-card p-6 shadow-sm lg:col-span-2"><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Vagas cadastradas</h2><p className="text-sm text-muted-foreground">Oportunidades disponíveis nas unidades</p></div><Link href="/coordinator/direct" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1")}>Direcionar alunos<ArrowUpRight className="size-4" /></Link></div><DataTable columns={vacancyColumns} data={vacancies} pageSize={5} getRowKey={(row) => row.id} /></div>
          <div className="flex flex-col gap-4"><StatCard label="Total de vagas" value={vacancies.length} icon={Briefcase} /><StatCard label="Alunos matriculados" value={totalStudents} icon={Users} /><StatCard label="Solicitações pendentes" value={pendingRequests} icon={FileText} trend={pendingRequests > 0 ? { value: "Requer atenção", positive: false } : undefined} /></div>
        </div>
      </div>
    </AppShell>
  );
}
