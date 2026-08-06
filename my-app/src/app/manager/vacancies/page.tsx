"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, CalendarCheck, ChevronRight, Plus, Search, Users } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getVacancies, type VacancyResponse } from "@/lib/core-api";
import { getApplications, getInterviews, type VacancyApplicationResponse } from "@/lib/selection-api";
import { cn } from "@/lib/utils";

export default function ManagerVacanciesPage() {
  const [vacancies, setVacancies] = useState<VacancyResponse[]>([]);
  const [applications, setApplications] = useState<VacancyApplicationResponse[]>([]);
  const [scheduledInterviews, setScheduledInterviews] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getVacancies({ size: 500, sort: "name,asc" }),
      getApplications({ size: 500 }),
      getInterviews({ size: 500 }),
    ])
      .then(([vacancyResponse, applicationResponse, interviewResponse]) => {
        if (!mounted) return;
        setVacancies(vacancyResponse);
        setApplications(applicationResponse);
        setScheduledInterviews(interviewResponse.filter((interview) => interview.status === "SCHEDULED").length);
      })
      .catch((requestError) => mounted && setError(
        requestError instanceof Error ? requestError.message : "Não foi possível carregar as vagas.",
      ));
    return () => { mounted = false; };
  }, []);

  const applicationCount = (vacancyId: string) => applications.filter((application) => application.vacancyId === vacancyId).length;
  const filteredVacancies = useMemo(() => {
    const query = search.toLocaleLowerCase("pt-BR");
    return vacancies.filter((vacancy) => {
      const matchesSearch = [vacancy.name, vacancy.area, vacancy.placeName].join(" ").toLocaleLowerCase("pt-BR").includes(query);
      const hasCandidates = applications.some((application) => application.vacancyId === vacancy.id && application.status !== "REJECTED");
      const matchesStatus = statusFilter === "ALL"
        || (statusFilter === "OPEN" && vacancy.status !== "CLOSED")
        || (statusFilter === "ANALYSIS" && hasCandidates && vacancy.status !== "CLOSED")
        || (statusFilter === "FILLED" && vacancy.filledSpots >= vacancy.numbersVacancies);
      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter, vacancies]);

  return (
    <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Minhas vagas" }]}>
      <div className="space-y-6">
        <PageHeader title="Minhas Vagas" description="Acompanhe suas oportunidades e candidatos" actions={<Link href="/manager/vacancies/new" className={cn(buttonVariants(), "gap-2")}><Plus className="size-4" />Nova vaga</Link>} />
        {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Vagas abertas" value={vacancies.filter((vacancy) => vacancy.status !== "CLOSED").length} icon={Briefcase} /><StatCard label="Candidatos em análise" value={applications.filter((application) => application.status === "REFERRED" || application.status === "INTERVIEW_SCHEDULED").length} icon={Users} /><StatCard label="Entrevistas agendadas" value={scheduledInterviews} icon={CalendarCheck} /></div>
        <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar vagas..." /></div><select className="h-10 rounded-md border px-3 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">Todos os status</option><option value="OPEN">Abertas</option><option value="ANALYSIS">Em análise</option><option value="FILLED">Preenchidas</option></select></div>
        <div className="grid gap-4 md:grid-cols-3">{filteredVacancies.map((vacancy) => { const candidates = applicationCount(vacancy.id); const filled = vacancy.filledSpots >= vacancy.numbersVacancies; return <Link key={vacancy.id} href={`/manager/vacancies/${vacancy.id}`} className="rounded-xl border bg-white p-5 shadow-sm transition hover:border-primary-300 hover:shadow-md"><div className="mb-3 flex items-start justify-between gap-2"><h2 className="font-bold">{vacancy.name}</h2>{filled ? <Badge variant="neutral">Preenchida</Badge> : vacancy.status === "URGENT" ? <Badge variant="warning">Urgente</Badge> : vacancy.status === "CLOSED" ? <Badge variant="neutral">Fechada</Badge> : <Badge variant="success">Aberta</Badge>}</div><p className="text-xs text-muted-foreground">{vacancy.area} · {vacancy.placeName}</p><p className="mt-2 text-xs">{vacancy.filledSpots}/{vacancy.numbersVacancies} posições preenchidas</p><div className="mt-4 flex items-center justify-between border-t pt-4 text-xs font-semibold text-primary"><span>{candidates} candidato{candidates === 1 ? "" : "s"} encaminhado{candidates === 1 ? "" : "s"}</span><ChevronRight className="size-5" /></div></Link>; })}</div>
      </div>
    </AppShell>
  );
}
