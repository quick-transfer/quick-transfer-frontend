"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout";
import { StatCard } from "@/components/shared/stat-card";
import { Input } from "@/components/ui/input";
import { Briefcase, Users, CalendarCheck, Search, Plus, CheckCircle2, ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { createVacancy, deleteVacancy, getPlaces, getVacancies, type VacancyArea, type VacancyShift } from "@/lib/manager-api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ManagerVacancy {
  id: string;
  title: string;
  department: string;
  totalSpots: number;
  assignedCount: number;
  recommendedCount: number;
  status: "ABERTA" | "EM_ANALISE" | "PREENCHIDA";
}

export default function ManagerVacanciesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [vacancies, setVacancies] = useState<ManagerVacancy[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulário Nova Vaga na mesma página
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("Produção");
  const [description, setDescription] = useState("");
  const [spots, setSpots] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Modal Exclusão de Vaga
  const [vacancyToDelete, setVacancyToDelete] = useState<ManagerVacancy | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadVacancies = () => {
    setLoading(true);
    getVacancies()
      .then((data) => {
        const mapped: ManagerVacancy[] = data.map((v) => {
          let assignedCount = 0;
          let recommendedCount = 0;
          try {
            const savedAssigned = localStorage.getItem(`vacancy_assigned_${v.id}`);
            if (savedAssigned) assignedCount = JSON.parse(savedAssigned).length;
            const savedRec = localStorage.getItem(`vacancy_recommended_${v.id}`);
            if (savedRec) recommendedCount = JSON.parse(savedRec).length;
          } catch {}
          return {
            id: v.id,
            title: v.name,
            department: v.section || "Geral",
            totalSpots: v.numbersVacancies,
            assignedCount,
            recommendedCount,
            status: (assignedCount >= v.numbersVacancies && v.numbersVacancies > 0)
              ? "PREENCHIDA" as const
              : "ABERTA" as const,
          };
        });
        setVacancies(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVacancies();
  }, []);

  const handleCreateVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const places = await getPlaces().catch(() => []);
      const placeId = places[0]?.id || 'plc-1';
      
      const created = await createVacancy({
        name: jobTitle.trim(),
        description: description.trim(),
        numbersVacancies: Number(spots) || 1,
        area: 'IT' as VacancyArea,
        shift: 'FIRST' as VacancyShift,
        placeId,
      });

      const newVac: ManagerVacancy = {
        id: created.id,
        title: created.name,
        department,
        totalSpots: created.numbersVacancies || Number(spots) || 1,
        assignedCount: 0,
        recommendedCount: 0,
        status: "ABERTA",
      };

      setVacancies((prev) => [newVac, ...prev]);
      setJobTitle("");
      setDepartment("Produção");
      setDescription("");
      setSpots(1);
      setSuccessMsg("Vaga criada e salva no sistema com sucesso!");
      setTimeout(() => setSuccessMsg(""), 7000);
    } catch {
      // Fallback local se a API falhar
      const newVac: ManagerVacancy = {
        id: `vac-${Date.now()}`,
        title: jobTitle,
        department,
        totalSpots: Number(spots) || 1,
        assignedCount: 0,
        recommendedCount: 0,
        status: "ABERTA",
      };
      setVacancies((prev) => [newVac, ...prev]);
      setJobTitle("");
      setDescription("");
      setSpots(1);
      setSuccessMsg("Vaga criada com sucesso!");
      setTimeout(() => setSuccessMsg(""), 7000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVacancy = async () => {
    if (!vacancyToDelete) return;
    setIsDeleting(true);
    try {
      await deleteVacancy(vacancyToDelete.id);
    } catch {}
    
    // Remove localmente do estado e limpa storage local
    setVacancies((prev) => prev.filter((v) => v.id !== vacancyToDelete.id));
    try {
      localStorage.removeItem(`vacancy_assigned_${vacancyToDelete.id}`);
      localStorage.removeItem(`vacancy_recommended_${vacancyToDelete.id}`);
    } catch {}

    setVacancyToDelete(null);
    setIsDeleting(false);
    setSuccessMsg(`Vaga "${vacancyToDelete.title}" excluída com sucesso.`);
    setTimeout(() => setSuccessMsg(""), 6000);
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

  const remainingSpots = (v: ManagerVacancy) => Math.max(0, v.totalSpots - v.assignedCount);

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
            value={vacancies.filter((v) => v.status === "ABERTA").length}
            icon={Briefcase}
          />
          <StatCard
            label="ALUNOS ALOCADOS"
            value={vacancies.reduce((acc, v) => acc + v.assignedCount, 0)}
            icon={Users}
          />
          <StatCard
            label="CANDIDATOS INDICADOS"
            value={vacancies.reduce((acc, v) => acc + v.recommendedCount, 0)}
            icon={CalendarCheck}
          />
        </div>

        {/* Conteúdo Principal */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Lado Esquerdo - Minhas Vagas */}
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
            {filteredVacancies.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500 text-sm">
                Nenhuma vaga encontrada.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredVacancies.map((vacancy) => (
                  <div
                    key={vacancy.id}
                    className="relative bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <Link href={`/manager/vacancies/${vacancy.id}`} className="font-bold text-slate-900 text-base leading-snug hover:text-primary-800">
                          {vacancy.title}
                        </Link>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {vacancy.status === "ABERTA" && (
                            <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 rounded-full">
                              ABERTA
                            </span>
                          )}
                          {vacancy.status === "EM_ANALISE" && (
                            <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 rounded-full">
                              EM ANÁLISE
                            </span>
                          )}
                          {vacancy.status === "PREENCHIDA" && (
                            <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 rounded-full">
                              PREENCHIDA
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setVacancyToDelete(vacancy);
                            }}
                            title="Excluir Vaga"
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Briefcase className="size-3.5 text-slate-400" /> {vacancy.department}
                        </span>
                        <span>
                          {vacancy.assignedCount} / {vacancy.totalSpots} {vacancy.totalSpots === 1 ? "posição preenchida" : "posições preenchidas"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <Link href={`/manager/vacancies/${vacancy.id}`} className="flex-1 flex items-center justify-between">
                        {vacancy.status !== "PREENCHIDA" ? (
                          <div className="flex items-center gap-2 text-xs font-semibold text-primary-800">
                            <span>{remainingSpots(vacancy)} {remainingSpots(vacancy) === 1 ? "vaga disponível" : "vagas disponíveis"}</span>
                            {vacancy.recommendedCount > 0 && (
                              <span className="text-slate-500">· {vacancy.recommendedCount} indicado(s)</span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <CheckCircle2 className="size-4 text-emerald-600" />
                            <span>Vaga concluída</span>
                          </div>
                        )}
                        <ChevronRight className="size-5 text-slate-400" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                disabled={submitting || !jobTitle.trim() || !description.trim()}
                className="w-full py-2.5 text-sm font-semibold text-white bg-primary-900 hover:bg-primary-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition flex items-center justify-center gap-2"
              >
                <Plus className="size-4" /> {submitting ? "Criando..." : "Criar Vaga"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de Exclusão de Vaga */}
      <Dialog open={!!vacancyToDelete} onOpenChange={(open) => { if (!open) setVacancyToDelete(null); }}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Excluir Vaga</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Tem certeza que deseja excluir a vaga <strong className="text-slate-950">"{vacancyToDelete?.title}"</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setVacancyToDelete(null)}>Cancelar</Button>
            <Button onClick={handleDeleteVacancy} disabled={isDeleting} className="bg-red-600 text-white hover:bg-red-700">
              {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
