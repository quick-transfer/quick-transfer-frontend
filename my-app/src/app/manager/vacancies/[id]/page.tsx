"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Ban, CalendarPlus, CheckCircle2, Pencil, Save, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout";
import { InterviewSchedulingModal } from "@/components/features/manager/interview-scheduling-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  areaLabels,
  createInterview,
  deleteVacancy,
  getManagers,
  getPlaces,
  getStudents,
  getVacancy,
  interviewStatusLabels,
  sendInterviewEmail,
  shiftLabels,
  updateStudentInterviewStatus,
  updateVacancy,
  type Manager,
  type Place,
  type Student,
  type Vacancy,
  type VacancyArea,
  type VacancyShift,
} from "@/lib/manager-api";

interface PageProps {
  params: Promise<{ id: string }>;
}

function statusClass(status: string) {
  if (status === "HIRED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "DISAPPROVED" || status === "DISCARDED") return "bg-red-50 text-red-700 border-red-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

export default function ManagerVacancyDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingStudentId, setUpdatingStudentId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState<VacancyArea>("IT");
  const [shift, setShift] = useState<VacancyShift>("FIRST");
  const [placeId, setPlaceId] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
        getVacancy(id),
        getStudents(),
        getPlaces(),
        getManagers(),
      ])
      .then(([vacancyData, studentData, placeData, managerData]) => {
      if (!active) return;
      const currentPlace = placeData.find(
        (place) => place.park === vacancyData.park && place.section === vacancyData.section
      );
      setVacancy(vacancyData);
      setStudents(studentData);
      setPlaces(placeData);
      setManagers(managerData);
      setName(vacancyData.name);
      setDescription(vacancyData.description);
      setArea(vacancyData.area as VacancyArea);
      setShift(vacancyData.shift as VacancyShift);
      setPlaceId(currentPlace?.id || placeData[0]?.id || "");
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar a vaga.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  const candidates = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    if (!query) return students;
    return students.filter((student) =>
      [student.name, student.email, student.course, student.acronym]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(query)
    );
  }, [search, students]);

  const resetForm = () => {
    if (!vacancy) return;
    const currentPlace = places.find(
      (place) => place.park === vacancy.park && place.section === vacancy.section
    );
    setName(vacancy.name);
    setDescription(vacancy.description);
    setArea(vacancy.area as VacancyArea);
    setShift(vacancy.shift as VacancyShift);
    setPlaceId(currentPlace?.id || places[0]?.id || "");
    setEditing(false);
  };

  const handleSave = async () => {
    if (!vacancy || !name.trim() || !description.trim() || !placeId) {
      setError("Preencha todos os campos da vaga.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await updateVacancy(vacancy.id, {
        name: name.trim(),
        description: description.trim(),
        area,
        shift,
        placeId,
      });
      setVacancy(updated);
      setEditing(false);
      setNotice("Vaga atualizada com sucesso.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar a vaga.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!vacancy || !window.confirm(`Excluir a vaga “${vacancy.name}”? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteVacancy(vacancy.id);
      router.push("/manager/vacancies");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível excluir a vaga.");
    }
  };

  const handleStatus = async (student: Student, status: "HIRED" | "DISAPPROVED" | "SEEN") => {
    setUpdatingStudentId(student.id);
    setError("");
    try {
      const updated = await updateStudentInterviewStatus(student.id, status);
      setStudents((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(`Status de ${student.name} atualizado para ${interviewStatusLabels[status]}.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar o candidato.");
    } finally {
      setUpdatingStudentId(null);
    }
  };

  if (loading) {
    return <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Vaga" }]}><div className="rounded-xl border bg-white p-10 text-center text-sm text-slate-500">Carregando vaga...</div></AppShell>;
  }

  if (!vacancy) {
    return <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Vaga" }]}><div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{error || "Vaga não encontrada."}</div></AppShell>;
  }

  return (
    <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Minhas Vagas", href: "/manager/vacancies" }, { label: vacancy.name }]}>
      <div className="space-y-6 pb-10">
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <div>
            <Link href="/manager/vacancies" className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-primary-800"><ArrowLeft className="size-3.5" /> Minhas vagas</Link>
            <h1 className="text-xl font-bold text-slate-900">{vacancy.name}</h1>
            <p className="mt-1 text-sm text-slate-500">{areaLabels[vacancy.area] || vacancy.area} · {shiftLabels[vacancy.shift] || vacancy.shift} · {vacancy.park}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void handleDelete()} className="text-red-600 hover:bg-red-50"><Trash2 className="size-4" /> Excluir</Button>
            {editing ? (
              <><Button variant="outline" onClick={resetForm}>Cancelar</Button><Button onClick={() => void handleSave()} disabled={saving} className="bg-primary-900 text-white"><Save className="size-4" /> {saving ? "Salvando..." : "Salvar"}</Button></>
            ) : (
              <Button onClick={() => setEditing(true)} className="bg-primary-900 text-white"><Pencil className="size-4" /> Editar vaga</Button>
            )}
          </div>
        </div>

        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</div>}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.8fr)]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-slate-900">Informações da vaga</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-semibold text-slate-700">Nome</span><Input value={name} onChange={(event) => setName(event.target.value)} disabled={!editing} /></label>
              <label className="space-y-1.5"><span className="text-sm font-semibold text-slate-700">Área</span><select value={area} onChange={(event) => setArea(event.target.value as VacancyArea)} disabled={!editing} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-50">{Object.entries(areaLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className="space-y-1.5"><span className="text-sm font-semibold text-slate-700">Turno</span><select value={shift} onChange={(event) => setShift(event.target.value as VacancyShift)} disabled={!editing} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-50">{Object.entries(shiftLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className="space-y-1.5"><span className="text-sm font-semibold text-slate-700">Local</span><select value={placeId} onChange={(event) => setPlaceId(event.target.value)} disabled={!editing} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-50">{places.map((place) => <option key={place.id} value={place.id}>{place.placeName} · {place.park}</option>)}</select></label>
              <label className="space-y-1.5"><span className="text-sm font-semibold text-slate-700">Posições</span><Input value={vacancy.numbersVacancies} disabled /></label>
              <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-semibold text-slate-700">Descrição</span><textarea rows={7} value={description} onChange={(event) => setDescription(event.target.value)} disabled={!editing} className="w-full resize-y rounded-md border border-slate-200 bg-white p-3 text-sm disabled:bg-slate-50" /></label>
            </div>
            <p className="mt-4 text-xs text-slate-400">A API não permite alterar a quantidade de posições após o cadastro.</p>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">Candidatos</h2><p className="text-xs text-slate-500">Atualize o resultado ou agende uma entrevista.</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{students.length}</span></div>
            <div className="relative my-4"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar candidato..." className="pl-9" /></div>
            <div className="max-h-[590px] space-y-3 overflow-y-auto pr-1">
              {candidates.map((student) => (
                <article key={student.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/manager/students/${student.id}`} className="flex min-w-0 items-center gap-3 hover:opacity-80"><Avatar className="size-10"><AvatarFallback className="bg-primary-800 text-xs font-bold text-white">{student.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{student.name}</p><p className="truncate text-xs text-slate-500">{student.course} · {student.acronym}</p></div></Link>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold ${statusClass(student.statusStudentInterview)}`}>{interviewStatusLabels[student.statusStudentInterview] || student.statusStudentInterview}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
                    {student.statusStudentInterview === "HIRED" ? <Button size="sm" variant="outline" disabled={updatingStudentId === student.id} onClick={() => void handleStatus(student, "SEEN")}>Reabrir</Button> : <Button size="sm" variant="outline" disabled={updatingStudentId === student.id} onClick={() => void handleStatus(student, "HIRED")} className="text-emerald-700"><CheckCircle2 className="size-3.5" /> Contratar</Button>}
                    {student.statusStudentInterview === "DISAPPROVED" ? <Button size="sm" variant="outline" disabled={updatingStudentId === student.id} onClick={() => void handleStatus(student, "SEEN")}>Restaurar</Button> : <Button size="sm" variant="outline" disabled={updatingStudentId === student.id} onClick={() => void handleStatus(student, "DISAPPROVED")} className="text-red-600"><Ban className="size-3.5" /> Reprovar</Button>}
                    <Button size="sm" onClick={() => setSelectedStudent(student)} className="bg-primary-900 text-white"><CalendarPlus className="size-3.5" /> Entrevista</Button>
                  </div>
                </article>
              ))}
              {candidates.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Nenhum candidato encontrado.</p>}
            </div>
          </section>
        </div>
      </div>

      {selectedStudent && (
        <InterviewSchedulingModal
          isOpen
          onClose={() => setSelectedStudent(null)}
          candidateName={selectedStudent.name}
          vacancyTitle={vacancy.name}
          places={places}
          managers={managers}
          onConfirm={async (data) => {
            const interview = await createInterview({ ...data, studentId: selectedStudent.id, vacancyId: vacancy.id });
            try {
              await sendInterviewEmail(interview.id, selectedStudent.email);
              setNotice(`Entrevista agendada e convite enviado para ${selectedStudent.email}.`);
            } catch {
              setNotice("Entrevista agendada, mas o convite por e-mail não pôde ser enviado.");
            }
          }}
        />
      )}
    </AppShell>
  );
}
