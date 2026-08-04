"use client";

import { useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { StatCard } from "@/components/shared/stat-card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { Briefcase, Users, CalendarCheck, Search, Plus, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ManagerVacancy {
  id: string;
  title: string;
  department: string;
  spots: number;
  status: "ABERTA" | "EM_ANALISE" | "PREENCHIDA";
  recommendedCount: number;
  recommendedAvatars?: string[];
}

const mockManagerVacancies: ManagerVacancy[] = [
  {
    id: "vac-1",
    title: "Montador de Painéis Elétricos",
    department: "Produção",
    spots: 4,
    status: "ABERTA",
    recommendedCount: 15,
  },
  {
    id: "vac-2",
    title: "Técnico de Automação Jr",
    department: "Manutenção",
    spots: 2,
    status: "EM_ANALISE",
    recommendedCount: 7,
  },
  {
    id: "vac-3",
    title: "Analista de Qualidade I",
    department: "Qualidade",
    spots: 1,
    status: "PREENCHIDA",
    recommendedCount: 0,
  },
];

export default function ManagerVacanciesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredVacancies = mockManagerVacancies.filter((v) => {
    const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase()) || v.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "OPEN" && v.status === "ABERTA") ||
      (statusFilter === "ANALYSIS" && v.status === "EM_ANALISE") ||
      (statusFilter === "FILLED" && v.status === "PREENCHIDA");
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell
      breadcrumbs={[
        { label: "Gestor", href: "/manager/vacancies" },
        { label: "Minhas Vagas" },
      ]}
    >
      <div className="space-y-6">
        {/* Header Superior Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="VAGAS ABERTAS"
            value={12}
            icon={Briefcase}
          />
          <StatCard
            label="CANDIDATOS EM ANÁLISE"
            value={45}
            icon={Users}
          />
          <StatCard
            label="ENTREVISTAS AGENDADAS"
            value={8}
            icon={CalendarCheck}
          />
        </div>

        {/* Seção Minhas Vagas */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Minhas Vagas</h1>
            <Link
              href="/manager/vacancies/new"
              className={cn(
                buttonVariants({ variant: "default" }),
                "bg-primary-900 text-white hover:bg-primary-950 font-medium px-4 py-2 rounded-lg flex items-center gap-2 px-4 py-5"
              )}
            >
              <Plus className="size-4" /> Nova Vaga
            </Link>
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar vagas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-white border-slate-200 rounded-lg text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-48"
            >
              <option value="ALL">Todos os Status</option>
              <option value="OPEN">Aberta</option>
              <option value="ANALYSIS">Em Análise</option>
              <option value="FILLED">Preenchida</option>
            </select>
          </div>

          {/* Grid de Vagas */}
          <div className="grid gap-4 md:grid-cols-3">
            {filteredVacancies.map((vacancy) => (
              <Link
                key={vacancy.id}
                href={`/manager/vacancies/${vacancy.id}`}
                className="block bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {vacancy.title}
                    </h3>
                    {vacancy.status === "ABERTA" && (
                      <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 rounded-full shrink-0">
                        ABERTA
                      </span>
                    )}
                    {vacancy.status === "EM_ANALISE" && (
                      <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 rounded-full shrink-0">
                        EM ANÁLISE
                      </span>
                    )}
                    {vacancy.status === "PREENCHIDA" && (
                      <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 rounded-full shrink-0">
                        PREENCHIDA
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Briefcase className="size-3.5 text-slate-400" /> {vacancy.department}
                    </span>
                    <span>{vacancy.spots} {vacancy.spots === 1 ? "posição" : "posições"}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  {vacancy.status !== "PREENCHIDA" ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary-800">
                      <div className="flex -space-x-2">
                        <div className="size-6 rounded-full bg-blue-200 border-2 border-white"></div>
                        <div className="size-6 rounded-full bg-indigo-200 border-2 border-white"></div>
                        <div className="size-6 rounded-full bg-pink-200 border-2 border-white"></div>
                      </div>
                      <span>{vacancy.recommendedCount} candidatos recomendados</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      <span>Vaga concluída com sucesso</span>
                    </div>
                  )}
                  <ChevronRight className="size-5 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
