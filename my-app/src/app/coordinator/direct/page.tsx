"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getStudents, getVacancies, type StudentResponse, type VacancyResponse } from "@/lib/core-api";
import { createApplication, getApplications, type VacancyApplicationResponse } from "@/lib/selection-api";
import { Users, Briefcase, Search, ChevronRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Step = "select-vacancy" | "select-student";

export default function CoordinatorDirectPage() {
  const [step, setStep] = useState<Step>("select-vacancy");
  const [vacancies, setVacancies] = useState<VacancyResponse[]>([]);
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [applications, setApplications] = useState<VacancyApplicationResponse[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVacancy, setSelectedVacancy] = useState<VacancyResponse | null>(null);
  const [pendingStudent, setPendingStudent] = useState<StudentResponse | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getVacancies({ size: 300, sort: "name,asc" }),
      getStudents({ size: 500, sort: "name,asc" }),
      getApplications({ size: 500, sort: "createdAt,desc" }),
    ])
      .then(([vacancyResponse, studentResponse, applicationResponse]) => {
        if (!mounted) return;
        setVacancies(vacancyResponse.filter((vacancy) => vacancy.status !== "CLOSED"));
        setStudents(studentResponse.filter((student) => student.statusStudent === "ENROLLED"));
        setApplications(applicationResponse);
      })
      .catch((requestError) => mounted && setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar o direcionamento."));
    return () => { mounted = false; };
  }, []);

  const filteredVacancies = useMemo(() => {
    const query = search.toLocaleLowerCase("pt-BR");
    return vacancies.filter((vacancy) => [vacancy.name, vacancy.area, vacancy.placeName].join(" ").toLocaleLowerCase("pt-BR").includes(query));
  }, [search, vacancies]);

  const filteredStudents = useMemo(() => {
    const query = search.toLocaleLowerCase("pt-BR");
    return students.filter((student) => [student.name, student.registration, student.course].join(" ").toLocaleLowerCase("pt-BR").includes(query));
  }, [search, students]);

  const confirmDirection = async () => {
    if (!pendingStudent || !selectedVacancy) return;
    setSaving(true);
    setError("");
    try {
      const created = await createApplication({ vacancyId: selectedVacancy.id, studentId: pendingStudent.id });
      setApplications((current) => [created, ...current]);
      setConfirmOpen(false);
      setNotice(`${pendingStudent.name} foi direcionado(a) para "${selectedVacancy.name}".`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível direcionar o aluno.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell breadcrumbs={[{ label: "Painel", href: "/dashboard" }, { label: "Direcionar Alunos" }]}>
      <div className="space-y-6">
        <PageHeader title="Direcionar Alunos para Vagas" description="Encaminhe alunos disponíveis para oportunidades abertas" />
        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}
        <div className="flex items-center gap-3 text-sm font-semibold"><Badge variant={step === "select-vacancy" ? "info" : "neutral"}>1 · Vaga</Badge><ChevronRight className="size-4" /><Badge variant={step === "select-student" ? "info" : "neutral"}>2 · Aluno</Badge></div>
        {selectedVacancy && step === "select-student" && <div className="flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50 p-4"><div><p className="text-xs text-primary-600">Vaga selecionada</p><p className="font-bold text-primary-900">{selectedVacancy.name}</p><p className="text-xs text-primary-700">{selectedVacancy.area} · {selectedVacancy.placeName}</p></div><Button variant="ghost" size="sm" onClick={() => { setSelectedVacancy(null); setStep("select-vacancy"); setSearch(""); }}><ArrowLeft className="size-4" /> Trocar</Button></div>}
        <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={step === "select-vacancy" ? "Buscar vaga..." : "Buscar aluno..."} /></div>

        {step === "select-vacancy" ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVacancies.map((vacancy) => <button key={vacancy.id} className="rounded-xl border bg-white p-5 text-left shadow-sm hover:border-primary-300" onClick={() => { setSelectedVacancy(vacancy); setStep("select-student"); setSearch(""); }}><div className="mb-3 flex justify-between"><Briefcase className="size-5 text-primary-700" /><Badge variant={vacancy.status === "URGENT" ? "danger" : "success"}>{vacancy.status === "URGENT" ? "Urgente" : "Aberta"}</Badge></div><h2 className="font-bold">{vacancy.name}</h2><p className="text-xs text-muted-foreground">{vacancy.area} · {vacancy.placeName}</p><p className="mt-3 text-xs font-medium">{vacancy.filledSpots} / {vacancy.numbersVacancies} preenchidas</p></button>)}
            {filteredVacancies.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma vaga aberta encontrada.</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => {
              const existing = applications.find((application) => application.studentId === student.id && application.vacancyId === selectedVacancy?.id);
              const initials = student.name.split(" ").map((part) => part[0]).slice(0, 2).join("");
              return <div key={student.id} className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4"><div className="flex items-center gap-3"><Avatar><AvatarFallback>{initials}</AvatarFallback></Avatar><div><p className="font-bold">{student.name}</p><p className="text-xs text-muted-foreground">{student.registration} · {student.className}</p><p className="text-xs text-muted-foreground">Frequência {student.attendanceRate}% · Nota {student.performanceGrade ?? "—"}</p></div></div>{existing ? <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="size-4" /> {existing.status}</span> : <Button size="sm" onClick={() => { setPendingStudent(student); setConfirmOpen(true); }}><Users className="size-4" /> Direcionar</Button>}</div>;
            })}
          </div>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}><DialogContent><DialogHeader><DialogTitle>Confirmar direcionamento</DialogTitle><DialogDescription>Direcionar <strong>{pendingStudent?.name}</strong> para <strong>{selectedVacancy?.name}</strong>? O gestor responsável verá o encaminhamento.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={saving}>Cancelar</Button><Button onClick={() => void confirmDirection()} disabled={saving}>{saving ? "Direcionando..." : "Confirmar"}</Button></DialogFooter></DialogContent></Dialog>
    </AppShell>
  );
}
