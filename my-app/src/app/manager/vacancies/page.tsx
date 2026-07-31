"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  CalendarCheck,
  ChevronRight,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { StatCard } from "@/components/shared/stat-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  areaLabels,
  deleteVacancy,
  getInterviews,
  getVacancies,
  shiftLabels,
  type Vacancy,
} from "@/lib/manager-api";

export default function ManagerVacanciesPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [interviewCount, setInterviewCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getVacancies(), getInterviews()])
      .then(([vacancyData, interviewData]) => {
        if (!active) return;
        setVacancies(vacancyData);
        setInterviewCount(interviewData.length);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar as vagas."
        );
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const filteredVacancies = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("pt-BR");
    if (!query) return vacancies;
    return vacancies.filter((vacancy) =>
      [vacancy.name, vacancy.area, vacancy.park, vacancy.section]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(query)
    );
  }, [searchTerm, vacancies]);

  const totalSpots = vacancies.reduce(
    (total, vacancy) => total + vacancy.numbersVacancies,
    0
  );

  const handleDelete = async (vacancy: Vacancy) => {
    if (!window.confirm(`Excluir a vaga “${vacancy.name}”? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setDeletingId(vacancy.id);
    setError("");
    try {
      await deleteVacancy(vacancy.id);
      setVacancies((current) => current.filter((item) => item.id !== vacancy.id));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível excluir a vaga."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Minhas Vagas" }]}>
      <div className="space-y-6">
        <PageHeader
          title="Minhas Vagas"
          description="Cadastre, acompanhe e atualize as oportunidades da sua área"
          actions={
            <Link
              href="/manager/vacancies/new"
              className={cn(buttonVariants(), "gap-2 bg-primary-900 text-white")}
            >
              <Plus className="size-4" /> Nova vaga
            </Link>
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Vagas cadastradas" value={vacancies.length} icon={Briefcase} />
          <StatCard label="Posições disponíveis" value={totalSpots} icon={Users} />
          <StatCard label="Entrevistas agendadas" value={interviewCount} icon={CalendarCheck} />
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por vaga, área ou local..."
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              Carregando vagas...
            </div>
          ) : filteredVacancies.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Briefcase className="mx-auto mb-3 size-9 text-slate-300" />
              <p className="font-semibold text-slate-800">Nenhuma vaga encontrada</p>
              <p className="mt-1 text-sm text-slate-500">
                {searchTerm ? "Ajuste os termos da busca." : "Cadastre a primeira oportunidade da área."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredVacancies.map((vacancy) => (
                <article key={vacancy.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary-300 hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                        Ativa
                      </span>
                      <h2 className="mt-3 text-base font-bold text-slate-900">{vacancy.name}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{vacancy.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => void handleDelete(vacancy)}
                      disabled={deletingId === vacancy.id}
                      aria-label={`Excluir ${vacancy.name}`}
                      className="shrink-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="flex items-center gap-1.5"><Briefcase className="size-3.5" /> Área</dt>
                      <dd className="font-semibold text-slate-800">{areaLabels[vacancy.area] || vacancy.area}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="flex items-center gap-1.5"><Users className="size-3.5" /> Posições</dt>
                      <dd className="font-semibold text-slate-800">{vacancy.numbersVacancies}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="flex items-center gap-1.5"><MapPin className="size-3.5" /> Local</dt>
                      <dd className="font-semibold text-slate-800">{vacancy.park} · {vacancy.section}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt>Turno</dt>
                      <dd className="font-semibold text-slate-800">{shiftLabels[vacancy.shift] || vacancy.shift}</dd>
                    </div>
                  </dl>

                  <Link href={`/manager/vacancies/${vacancy.id}`} className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-primary-800 hover:text-primary-950">
                    Ver detalhes e candidatos <ChevronRight className="size-4" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
