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
  const [vacancies, setVacancies] = useState<ManagerVacancy[]>(mockManagerVacancies);

  // Formulário Nova Vaga na mesma página
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("Produção");
  const [description, setDescription] = useState("");
  const [spots, setSpots] = useState(1);
  const [successMsg, setSuccessMsg] = useState("");

  const handleCreateVacancy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !description.trim()) return;

    const newVac: ManagerVacancy = {
      id: `vac-${Date.now()}`,
      title: jobTitle,
      department,
      spots: Number(spots) || 1,
      status: "ABERTA",
      recommendedCount: 0,
    };

    setVacancies((prev) => [newVac, ...prev]);
    setJobTitle("");
    setDepartment("Produção");
    setDescription("");
    setSpots(1);
    setSuccessMsg("Vaga criada com sucesso!");
    setTimeout(() => setSuccessMsg(""), 7000);
  };

  const filteredVacancies = vacancies.filter((v) => {
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
            value={vacancies.filter((v) => v.status === "ABERTA").length + 9}
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

        {/* Conteúdo Principal com Layout Lado a Lado (Minhas Vagas à esquerda + Nova Vaga à direita) */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Lado Esquerdo - Minhas Vagas (2 Colunas no Grid Principal) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Minhas Vagas</h1>
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
            <div className="grid gap-4 sm:grid-cols-2">
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
                        <span>{vacancy.recommendedCount} candidatos</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        <span>Vaga concluída</span>
                      </div>
                    )}
                    <ChevronRight className="size-5 text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Lado Direito - Formulário para Criar Nova Vaga */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 h-fit sticky top-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Abrir Nova Vaga</h2>
              <p className="text-xs text-slate-500">Cadastre uma vaga para receber indicações.</p>
            </div>

            <form onSubmit={handleCreateVacancy} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Vaga <span className="text-red-500">*</span>
                </label>
                <Input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ex: Aprendiz de Montagem Elétrica"
                  className="h-10 bg-white border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Setor / Departamento
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="h-10 w-full px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Produção">Produção</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Qualidade">Qualidade</option>
                  <option value="Tecnologia da Informação">Tecnologia da Informação</option>
                  <option value="Logística">Logística</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição da Vaga <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva as responsabilidades..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número de Vagas
                </label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={spots}
                  onChange={(e) => setSpots(Number(e.target.value))}
                  className="h-10 bg-white border-slate-200 rounded-lg text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={!jobTitle.trim() || !description.trim()}
                className="w-full py-2.5 text-sm font-semibold text-white bg-primary-900 hover:bg-primary-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition flex items-center justify-center gap-2"
              >
                <Plus className="size-4" /> Criar Vaga
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Notificação Toast */}
      {successMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#046A38] text-white px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-none border border-emerald-600">
            <CheckCircle2 className="size-4 text-white" />
            {successMsg}
          </div>
        </div>
      )}
    </AppShell>
  );
}
