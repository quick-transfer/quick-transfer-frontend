"use client";

import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Ban } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InterviewSchedulingModal } from "@/components/features/manager/interview-scheduling-modal";
import {
  createInterview,
  areaLabels,
  shiftLabels,
  getManagers,
  getPlaces,
  getStudents,
  getVacancy,
  getVacancyRequirements,
  updateVacancy,
  type Manager,
  type Place,
  type VacancyArea,
  type VacancyShift,
  type VacancyRequirement,
} from '@/lib/manager-api';

interface Candidate {
  id: string;
  name: string;
  classGroup: string;
  matchPercentage?: number;
  email?: string;
  avatarUrl?: string;
}

import { USER_ID_COOKIE_NAME } from '@/lib/auth';

function currentUserId() {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${USER_ID_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

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
  const [spots, setSpots] = useState(0);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [placeId, setPlaceId] = useState("");
  const [shift, setShift] = useState<VacancyShift>('FIRST');
  const [area, setArea] = useState<VacancyArea>('IT');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [req1Level, setReq1Level] = useState(8);
  const [req1Priority, setReq1Priority] = useState(true);

  const [req2Level, setReq2Level] = useState(7);
  const [req2Priority, setReq2Priority] = useState(false);
  const [extraRequirements, setExtraRequirements] = useState<VacancyRequirement[]>([]);

  // Modo de visualização (somente leitura por padrão) vs modo de edição
  const [isViewMode, setIsViewMode] = useState(true);

  // Suporta múltiplos alunos alocados respeitando o limite de vagas (spots)
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([]);
  const [rejectedStudentIds, setRejectedStudentIds] = useState<string[]>([]);
  const isEditing = resolvedParams.id !== "new" && resolvedParams.id !== "vac-new";

  // Estado do Modal de Agendamento de Entrevista e Notificações
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [interviewSuccessMessage, setInterviewSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      getVacancy(resolvedParams.id),
      getStudents(),
      getPlaces(),
      getManagers(),
      getVacancyRequirements(resolvedParams.id),
    ]).then(([vacancy, studentData, placeData, managerData, requirements]) => {
      if (!active) return;
      setJobTitle(vacancy.name);
      setDepartment(areaLabels[vacancy.area] ?? vacancy.area);
      setArea(vacancy.area as VacancyArea);
      setDescription(vacancy.description);
      setSpots(vacancy.numbersVacancies);
      setShift(vacancy.shift as VacancyShift);
      setPlaces(placeData);
      const authenticatedManager = managerData.find((manager) => manager.id === currentUserId());
      setManagers(authenticatedManager ? [authenticatedManager] : []);
      const technical = requirements.find((item) => item.id === 'python');
      const socioemotional = requirements.find((item) => item.id === 'problem-solving');
      if (technical) {
        setReq1Level(technical.level);
        setReq1Priority(technical.priority);
      }
      if (socioemotional) {
        setReq2Level(socioemotional.level);
        setReq2Priority(socioemotional.priority);
      }
      setExtraRequirements(requirements.filter((item) => item.id !== 'python' && item.id !== 'problem-solving'));
      const selectedPlace = placeData.find(
        (item) => item.park === vacancy.park && item.section === vacancy.section
      );
      setPlaceId(selectedPlace?.id ?? placeData[0]?.id ?? '');
      setCandidates(studentData.map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        classGroup: student.course,
        matchPercentage: student.averageGrade == null
          ? undefined
          : Math.round(student.averageGrade * 10),
      })));
      setAssignedStudentIds([]);
      setRejectedStudentIds([]);
    }).catch((loadError) => {
      if (active) setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar a vaga.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [resolvedParams.id]);

  const handleOpenInterviewModal = (candidate?: Candidate) => {
    if (candidate) setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleConfirmInterview = async (data: { date: string; time: string; vacancyId: string }) => {
    if (!selectedCandidate) throw new Error('Selecione um candidato.');
    if (!managers[0]) throw new Error('Não foi possível identificar o gestor autenticado.');
    await createInterview({
      interviewerName: managers[0].name,
      dateTime: `${data.date}T${data.time}:00`,
      placeId,
      studentId: selectedCandidate.id,
      managerId: managers[0].id,
      vacancyId: resolvedParams.id,
    });
    setInterviewSuccessMessage(
      `Entrevista agendada com sucesso para ${selectedCandidate?.name} no dia ${data.date} às ${data.time}.`
    );
    setTimeout(() => setInterviewSuccessMessage(""), 6000);
  };

  const handleSaveVacancy = async () => {
    setError('');
    try {
      await updateVacancy(resolvedParams.id, {
        name: jobTitle.trim(),
        description: description.trim(),
        numbersVacancies: spots,
        area,
        shift,
        placeId,
      });
      setIsViewMode(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível atualizar a vaga.');
      return;
    }
    setInterviewSuccessMessage(
      isEditing ? "Alterações da vaga salvas com sucesso!" : "Vaga criada com sucesso!"
    );
    setTimeout(() => setInterviewSuccessMessage(""), 5000);
  };

  const handleAssignStudent = (candidate: Candidate, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(
      `Não é possível alocar ${candidate.name}: a API não informa a qual vaga o aluno está associado. A ação foi bloqueada para evitar um vínculo global incorreto.`
    );
  };

  const handleRejectCandidate = (candidate: Candidate, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(
      `Não é possível recusar ${candidate.name} nesta vaga: a API só permite alterar o status global do aluno.`
    );
  };

  const filteredCandidates = candidates.filter((c) =>
    c.name.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  return (
    <AppShell
      breadcrumbs={[
        { label: "Gestor", href: "/manager/vacancies" },
        { label: "Minhas Vagas", href: "/manager/vacancies" },
        { label: isEditing ? jobTitle : "Nova Vaga" },
      ]}
    >
      <div className="space-y-6 pb-12">
        {loading && (
          <div className="rounded-lg border bg-white p-4 text-sm text-slate-500">
            Carregando dados da vaga...
          </div>
        )}
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {/* Cabeçalho da Vaga */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditing ? jobTitle : "Criar Nova Vaga"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isViewMode
                ? "Visualização da vaga. Clique em \"Editar Vaga\" para realizar alterações."
                : isEditing
                ? "Atualize as informações e requisitos da vaga para ajustar o perfil recomendado"
                : "Preencha os campos abaixo para disponibilizar uma nova vaga para os alunos"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isViewMode ? (
              <button
                type="button"
                onClick={() => setIsViewMode(false)}
                className="px-5 py-2 text-sm font-semibold text-white bg-primary-900 hover:bg-primary-950 rounded-lg shadow-sm transition"
              >
                Editar Vaga
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { if (isEditing) setIsViewMode(true); else router.push("/manager/vacancies"); }}
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
              </>
            )}
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
                    disabled={isViewMode}
                    className="h-10 bg-white border-slate-200 rounded-lg text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Setor
                  </label>
                  <select
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      const selectedArea = Object.entries(areaLabels)
                        .find(([, label]) => label === e.target.value)?.[0];
                      if (selectedArea) setArea(selectedArea as VacancyArea);
                    }}
                    disabled={isViewMode}
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
                  disabled={isViewMode}
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  Número de Vagas
                </label>
                <Input
                  type="number"
                  min={1}
                  disabled={isViewMode}
                  value={spots}
                  onChange={(event) => setSpots(Math.max(1, Number(event.target.value)))}
                  className="h-10 w-32 border-slate-200 rounded-lg text-sm font-medium"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-xs font-semibold text-slate-600">
                  Local
                  <select
                    value={placeId}
                    onChange={(event) => setPlaceId(event.target.value)}
                    disabled={isViewMode}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                  >
                    {places.map((place) => (
                      <option key={place.id} value={place.id}>{place.placeName}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-slate-600">
                  Turno
                  <select
                    value={shift}
                    onChange={(event) => setShift(event.target.value as VacancyShift)}
                    disabled={isViewMode}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                  >
                    {Object.entries(shiftLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Requisitos ainda não possuem persistência completa no contrato atual. */}
            {false && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Requisitos</h2>
                <button
                  type="button"
                  disabled={isViewMode}
                  onClick={() => setExtraRequirements((current) => [
                    ...current,
                    { id: `req-${Date.now()}`, name: 'Novo requisito', level: 5, priority: false, type: 'TECHNICAL' },
                  ])}
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
                        disabled={isViewMode}
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
                        disabled={isViewMode}
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
                        disabled={isViewMode}
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
                        disabled={isViewMode}
                        onCheckedChange={setReq2Priority}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {extraRequirements.map((requirement) => (
                <div key={requirement.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Input
                      value={requirement.name}
                      disabled={isViewMode}
                      onChange={(event) => setExtraRequirements((current) => current.map((item) =>
                        item.id === requirement.id ? { ...item, name: event.target.value } : item
                      ))}
                      className="sm:max-w-xs"
                    />
                    <div className="flex flex-1 items-center gap-3">
                      <span className="text-xs font-medium">Nível {requirement.level}</span>
                      <Slider
                        value={[requirement.level]}
                        max={10}
                        step={1}
                        disabled={isViewMode}
                        onValueChange={(value) => setExtraRequirements((current) => current.map((item) =>
                          item.id === requirement.id ? { ...item, level: value[0] } : item
                        ))}
                      />
                      <Switch
                        checked={requirement.priority}
                        disabled={isViewMode}
                        onCheckedChange={(checked) => setExtraRequirements((current) => current.map((item) =>
                          item.id === requirement.id ? { ...item, priority: checked } : item
                        ))}
                      />
                    </div>
                    {!isViewMode && (
                      <button type="button" onClick={() => setExtraRequirements((current) => current.filter((item) => item.id !== requirement.id))} className="text-xs font-semibold text-red-600">
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
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
                let badgeStyle = "text-slate-600 border-slate-300 bg-slate-50";
                if (candidate.matchPercentage != null) {
                  badgeStyle = "text-emerald-600 border-emerald-300 bg-emerald-50";
                  if (candidate.matchPercentage < 50) badgeStyle = "text-rose-600 border-rose-300 bg-rose-50";
                  else if (candidate.matchPercentage < 80) badgeStyle = "text-amber-600 border-amber-300 bg-amber-50";
                }

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
                        {candidate.matchPercentage == null ? "Nota não informada" : `${candidate.matchPercentage}%`}
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
            vacancyId={resolvedParams.id}
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
