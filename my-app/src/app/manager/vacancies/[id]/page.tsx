"use client";

import { FormEvent, use, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { InterviewSchedulingModal } from "@/components/features/manager/interview-scheduling-modal";
import { getPlaces, getVacancy, updateVacancy, type PlaceResponse, type VacancyPayload, type VacancyResponse } from "@/lib/core-api";
import { getApplications, updateApplication, type InterviewResponse, type VacancyApplicationResponse } from "@/lib/selection-api";
import { ArrowLeft, CalendarClock, Save, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps { params: Promise<{ id: string }>; }

export default function ManagerVacancyDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [vacancy, setVacancy] = useState<VacancyResponse | null>(null);
  const [places, setPlaces] = useState<PlaceResponse[]>([]);
  const [applications, setApplications] = useState<VacancyApplicationResponse[]>([]);
  const [form, setForm] = useState<VacancyPayload | null>(null);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<VacancyApplicationResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([getVacancy(id), getApplications({ size: 500, sort: "createdAt,desc" }), getPlaces({ size: 200 })])
      .then(([vacancyResponse, applicationResponse, placeResponse]) => {
        if (!mounted) return;
        setVacancy(vacancyResponse);
        setApplications(applicationResponse.filter((application) => application.vacancyId === id));
        setPlaces(placeResponse.filter((place) => place.status === "ACTIVE"));
        setForm({ name: vacancyResponse.name, description: vacancyResponse.description, numbersVacancies: vacancyResponse.numbersVacancies, area: vacancyResponse.area, shift: vacancyResponse.shift, placeId: vacancyResponse.placeId, status: vacancyResponse.status, skillIds: vacancyResponse.skills.map((skill) => skill.id) });
      })
      .catch((requestError) => mounted && setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar a vaga."));
    return () => { mounted = false; };
  }, [id]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!vacancy || !form) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateVacancy(vacancy.id, form);
      setVacancy(updated);
      setEditing(false);
      setNotice("Vaga atualizada com sucesso.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar a vaga.");
    } finally { setSaving(false); }
  };

  const reject = async (application: VacancyApplicationResponse) => {
    if (!window.confirm(`Recusar a candidatura de ${application.studentName}?`)) return;
    try {
      const updated = await updateApplication(application.id, { status: "REJECTED" });
      setApplications((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice("Candidatura recusada.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível recusar a candidatura.");
    }
  };

  const interviewCreated = (interview: InterviewResponse) => {
    setApplications((current) => current.map((application) => application.id === interview.applicationId ? { ...application, status: "INTERVIEW_SCHEDULED", interviewId: interview.id } : application));
    setNotice(`Entrevista com ${interview.nameStudent} agendada com sucesso.`);
  };

  if (!vacancy || !form) return <AppShell><div className="p-8 text-sm text-muted-foreground">{error || "Carregando vaga..."}</div></AppShell>;

  return (
    <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Minhas Vagas", href: "/manager/vacancies" }, { label: vacancy.name }]}>
      <div className="space-y-6">
        <PageHeader title={vacancy.name} description={`${vacancy.area} · ${vacancy.placeName} · ${vacancy.filledSpots}/${vacancy.numbersVacancies} preenchidas`} actions={<div className="flex gap-2"><Link href="/manager/vacancies" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}><ArrowLeft className="size-4" /> Voltar</Link><Button onClick={() => setEditing((value) => !value)}>{editing ? "Cancelar edição" : "Editar vaga"}</Button></div>} />
        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}

        <form onSubmit={save} className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input disabled={!editing} required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Input disabled={!editing} required type="number" min={1} value={form.numbersVacancies} onChange={(event) => setForm({ ...form, numbersVacancies: Number(event.target.value) })} />
            <Input className="sm:col-span-2" disabled={!editing} required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            <select disabled={!editing} className="h-10 rounded-md border px-3 text-sm" value={form.shift} onChange={(event) => setForm({ ...form, shift: event.target.value })}><option value="FIRST">Primeiro turno</option><option value="SECOND">Segundo turno</option><option value="THIRD">Terceiro turno</option><option value="FLEXIBLE_SHIFT">Flexível</option></select>
            <select disabled={!editing} className="h-10 rounded-md border px-3 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as VacancyPayload["status"] })}><option value="OPEN">Aberta</option><option value="URGENT">Urgente</option><option value="CLOSED">Fechada</option></select>
            <select disabled={!editing} className="h-10 rounded-md border px-3 text-sm" value={form.placeId} onChange={(event) => setForm({ ...form, placeId: event.target.value })}>{places.map((place) => <option key={place.id} value={place.id}>{place.placeName}</option>)}</select>
          </div>
          {editing && <div className="mt-4 flex justify-end"><Button type="submit" disabled={saving}><Save className="size-4" /> {saving ? "Salvando..." : "Salvar alterações"}</Button></div>}
        </form>

        <section className="space-y-3"><div><h2 className="text-lg font-bold">Candidatos encaminhados</h2><p className="text-sm text-muted-foreground">Agende entrevistas ou recuse encaminhamentos pendentes.</p></div>{applications.map((application) => { const initials = application.studentName.split(" ").map((part) => part[0]).slice(0, 2).join(""); return <article key={application.id} className="flex flex-col justify-between gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><Avatar><AvatarFallback>{initials}</AvatarFallback></Avatar><div><p className="font-bold">{application.studentName}</p><p className="text-xs text-muted-foreground">{application.registration} · encaminhado por {application.coordinatorName}</p></div></div><div className="flex items-center gap-2"><Badge variant={application.status === "HIRED" ? "success" : application.status === "REJECTED" ? "neutral" : "info"}>{application.status}</Badge>{application.status === "REFERRED" && <><Button size="sm" onClick={() => { setSelected(application); setModalOpen(true); }}><CalendarClock className="size-4" /> Entrevistar</Button><Button size="sm" variant="outline" className="text-destructive" onClick={() => void reject(application)}><UserX className="size-4" /> Recusar</Button></>}</div></article>; })}{applications.length === 0 && <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Nenhum aluno foi encaminhado para esta vaga.</div>}</section>
      </div>
      {selected && <InterviewSchedulingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} candidateId={selected.studentId} candidateName={selected.studentName} applicationId={selected.id} vacancyId={vacancy.id} vacancyTitle={vacancy.name} onConfirm={interviewCreated} />}
    </AppShell>
  );
}
