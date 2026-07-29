"use client";

import { use, useState } from "react";
import { AppShell } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Lock, Ban } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InterviewSchedulingModal } from "@/components/features/manager/interview-scheduling-modal";

interface Candidate {
  id: string;
  name: string;
  classGroup: string;
  matchPercentage: number;
  avatarUrl?: string;
}

const mockCandidates: Candidate[] = [
  { id: "std-1", name: "Carlos Silva", classGroup: "Turma TI-2023", matchPercentage: 92 },
  { id: "std-2", name: "Ana Paula", classGroup: "Turma ENG-2022", matchPercentage: 75 },
  { id: "std-3", name: "João Pedro", classGroup: "Turma LOG-2024", matchPercentage: 45 },
  { id: "std-4", name: "Carlos Silva", classGroup: "Turma TI-2023", matchPercentage: 92 },
  { id: "std-5", name: "Ana Paula", classGroup: "Turma ENG-2022", matchPercentage: 75 },
  { id: "std-6", name: "João Pedro", classGroup: "Turma LOG-2024", matchPercentage: 45 },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ManagerVacancyDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [jobTitle, setJobTitle] = useState("Analista de Dados Sênior");
  const [department, setDepartment] = useState("Tecnologia da Informação");
  const [description, setDescription] = useState(
    "Responsável por analisar grandes volumes de dados industriais, gerar relatórios de eficiência e propor otimizações em processos fabris."
  );
  const [spots] = useState(3);
  const [candidateSearch, setCandidateSearch] = useState("");

  const [req1Level, setReq1Level] = useState(8);
  const [req1Priority, setReq1Priority] = useState(true);

  const [req2Level, setReq2Level] = useState(7);
  const [req2Priority, setReq2Priority] = useState(false);

  // Suporta múltiplos alunos alocados respeitando o limite de vagas (spots)
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>(["std-1"]);
  const [rejectedStudentIds, setRejectedStudentIds] = useState<string[]>([]);
  const isEditing = resolvedParams.id !== "new" && resolvedParams.id !== "vac-new";

  // Estado do Modal de Agendamento de Entrevista e Notificações
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(mockCandidates[0]);
  const [interviewSuccessMessage, setInterviewSuccessMessage] = useState("");

  const handleOpenInterviewModal = (candidate?: Candidate) => {
    if (candidate) setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleConfirmInterview = (data: { date: string; time: string; notes: string }) => {
    setInterviewSuccessMessage(
      `Entrevista agendada com sucesso para ${selectedCandidate?.name} no dia ${data.date} às ${data.time}! O coordenador foi notificado por e-mail.`
    );
    setTimeout(() => setInterviewSuccessMessage(""), 6000);
  };

  const handleSaveVacancy = () => {
    setInterviewSuccessMessage(
      isEditing ? "Alterações da vaga salvas com sucesso!" : "Vaga criada com sucesso!"
    );
    setTimeout(() => setInterviewSuccessMessage(""), 5000);
  };

  const handleAssignStudent = (candidate: Candidate, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isAlreadyAssigned = assignedStudentIds.includes(candidate.id);

    if (isAlreadyAssigned) {
      setAssignedStudentIds((prev) => prev.filter((id) => id !== candidate.id));
      setInterviewSuccessMessage(`Aluno ${candidate.name} removido da vaga.`);
    } else {
      if (assignedStudentIds.length >= spots) {
        setInterviewSuccessMessage(
          `Limite máximo de vagas (${spots}) atingido! Remova um aluno para adicionar outro.`
        );
        setTimeout(() => setInterviewSuccessMessage(""), 5000);
        return;
      }
      setAssignedStudentIds((prev) => [...prev, candidate.id]);
      setRejectedStudentIds((prev) => prev.filter((id) => id !== candidate.id));
      setInterviewSuccessMessage(`Aluno ${candidate.name} alocado nesta vaga com sucesso! (${assignedStudentIds.length + 1}/${spots})`);
    }
    setTimeout(() => setInterviewSuccessMessage(""), 5000);
  };

  const handleRejectCandidate = (candidate: Candidate, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isRejected = rejectedStudentIds.includes(candidate.id);

    if (isRejected) {
      setRejectedStudentIds((prev) => prev.filter((id) => id !== candidate.id));
      setInterviewSuccessMessage(`Candidatura de ${candidate.name} restaurada para esta vaga.`);
    } else {
      setRejectedStudentIds((prev) => [...prev, candidate.id]);
      setAssignedStudentIds((prev) => prev.filter((id) => id !== candidate.id));
      setInterviewSuccessMessage(`Candidato ${candidate.name} recusado para esta vaga.`);
    }
    setTimeout(() => setInterviewSuccessMessage(""), 5000);
  };

  const filteredCandidates = mockCandidates.filter((c) =>
    c.name.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  return (
    <AppShell
      breadcrumbs={[
        { label: "Gestor" },
        { label: "Vagas", href: "/manager/vacancies" },
        { label: isEditing ? jobTitle : "Nova Vaga" },
      ]}
    >
      <div className="space-y-6 pb-12">
        {/* Cabeçalho da Vaga com título e botão Salvar / Criar no topo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditing ? `Editar Vaga: ${jobTitle}` : "Criar Nova Vaga"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? "Atualize as informações e requisitos da vaga para ajustar o perfil recomendado"
                : "Preencha os campos abaixo para disponibilizar uma nova vaga para os alunos"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/manager/vacancies")}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveVacancy}
              className="px-5 py-2 text-sm font-semibold text-white bg-primary-900 hover:bg-primary-950 rounded-lg shadow-sm transition"
            >
              {isEditing ? "Salvar Alterações" : "Criar Vaga"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Formulário Esquerdo - Detalhes da Vaga */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bloco 1: Informações Básicas */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Informações Básicas</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Nome da Vaga
                  </label>
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="h-10 bg-white border-slate-200 rounded-lg text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Setor
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="h-10 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Tecnologia da Informação">Tecnologia da Informação</option>
                    <option value="Produção">Produção</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Qualidade">Qualidade</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Descrição
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  Número de Vagas <Lock className="size-3.5 text-slate-400" />
                </label>
                <Input
                  disabled
                  value={spots}
                  className="h-10 w-32 bg-slate-100 border-slate-200 rounded-lg text-sm font-medium text-slate-600"
                />
              </div>
            </div>

            {/* Bloco 2: Requisitos */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Requisitos</h2>
                <button
                  type="button"
                  className="text-xs font-semibold text-primary-800 hover:text-primary-950 flex items-center gap-1"
                >
                  + Adicionar
                </button>
              </div>

              {/* Requisito 1 */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Python (Pandas, NumPy)</p>
                    <p className="text-xs text-slate-500">Técnico</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 w-48">
                      <span className="text-xs font-medium text-slate-600 shrink-0">
                        Nível Exigido
                      </span>
                      <Slider
                        value={[req1Level]}
                        max={10}
                        step={1}
                        onValueChange={(val) => setReq1Level(val[0])}
                        className="flex-1"
                      />
                      <span className="text-xs font-bold text-slate-900 w-3 text-right">
                        {req1Level}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-600">Prioridade</span>
                      <Switch
                        checked={req1Priority}
                        onCheckedChange={setReq1Priority}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Requisito 2 */}
              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Resolução de Problemas</p>
                    <p className="text-xs text-slate-500">Socioemocional</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 w-48">
                      <span className="text-xs font-medium text-slate-600 shrink-0">
                        Nível Exigido
                      </span>
                      <Slider
                        value={[req2Level]}
                        max={10}
                        step={1}
                        onValueChange={(val) => setReq2Level(val[0])}
                        className="flex-1"
                      />
                      <span className="text-xs font-bold text-slate-900 w-3 text-right">
                        {req2Level}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-600">Prioridade</span>
                      <Switch
                        checked={req2Priority}
                        onCheckedChange={setReq2Priority}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Painel Direito - Candidatos Recomendados */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Candidatos Recomendados</h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {assignedStudentIds.length} / {spots} Vagas Preenchidas
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar candidatos..."
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                className="pl-10 h-10 bg-white border-slate-200 rounded-full text-sm"
              />
            </div>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {filteredCandidates.map((candidate, idx) => {
                const isAssigned = assignedStudentIds.includes(candidate.id);
                const isRejected = rejectedStudentIds.includes(candidate.id);
                let badgeStyle = "text-emerald-600 border-emerald-300 bg-emerald-50";
                if (candidate.matchPercentage < 50) badgeStyle = "text-rose-600 border-rose-300 bg-rose-50";
                else if (candidate.matchPercentage < 80) badgeStyle = "text-amber-600 border-amber-300 bg-amber-50";

                return (
                  <div
                    key={`${candidate.id}-${idx}`}
                    className={`p-3 rounded-xl border transition ${
                      isRejected
                        ? "bg-rose-50/70 border-rose-200 opacity-75"
                        : isAssigned
                          ? "bg-emerald-50/70 border-emerald-300 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Link
                        href={`/manager/students/${candidate.id}`}
                        className="flex items-center gap-3 hover:opacity-80 transition"
                      >
                        <Avatar className="size-10 border border-slate-200">
                          <AvatarImage src={`https://i.pravatar.cc/150?u=${candidate.name}-${idx}`} />
                          <AvatarFallback className="bg-primary-700 text-white text-xs font-bold">
                            {candidate.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-snug">
                            {candidate.name}
                          </p>
                          <p className="text-xs text-slate-500">{candidate.classGroup}</p>
                        </div>
                      </Link>

                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${badgeStyle}`}
                      >
                        {candidate.matchPercentage}%
                      </span>
                    </div>

                    {/* Status do candidato + ações de alocação / recusa / entrevista */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      {isRejected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full">
                          Recusado
                        </span>
                      ) : isAssigned ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                          ✓ Alocado nesta Vaga
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Disponível</span>
                      )}

                      <div className="flex items-center gap-2">
                        {!isRejected && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => handleAssignStudent(candidate, e)}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition ${
                                isAssigned
                                  ? "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                                  : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                              }`}
                            >
                              {isAssigned ? "Remover" : "Colocar na Vaga"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenInterviewModal(candidate)}
                              className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary-900 text-white hover:bg-primary-950 transition"
                            >
                              Entrevista
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleRejectCandidate(candidate, e)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition flex items-center gap-1 ${
                            isRejected
                              ? "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                              : "bg-rose-600 text-white border-rose-600 hover:bg-rose-700"
                          }`}
                        >
                          <Ban className="size-3" />
                          {isRejected ? "Restaurar" : "Recusar"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal de Agendamento */}
        {selectedCandidate && (
          <InterviewSchedulingModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            candidateName={selectedCandidate.name}
            vacancyTitle={jobTitle}
            onConfirm={handleConfirmInterview}
          />
        )}

        {/* Banner de Notificação de Sucesso */}
        {interviewSuccessMessage && (
          <div className="fixed top-20 right-6 z-50 max-w-md p-4 bg-emerald-800 text-white rounded-lg shadow-xl border border-emerald-700 text-sm font-medium animate-in fade-in slide-in-from-top-4">
            {interviewSuccessMessage}
          </div>
        )}
      </div>
    </AppShell>
  );
}
