"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, PageHeader } from "@/components/layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { InterviewSchedulingModal } from "@/components/features/manager/interview-scheduling-modal";
import { getStudent, type StudentResponse } from "@/lib/core-api";
import { getSkills, type Skill } from "@/lib/manager-api";
import { getApplications, type InterviewResponse, type VacancyApplicationResponse } from "@/lib/selection-api";
import { ArrowLeft, CalendarClock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps { params: Promise<{ id: string }>; }

export default function ManagerStudentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [applications, setApplications] = useState<VacancyApplicationResponse[]>([]);
  const [selected, setSelected] = useState<VacancyApplicationResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([getStudent(id), getApplications({ size: 500 }), getSkills()])
      .then(([studentResponse, applicationResponse, skillResponse]) => {
        if (!mounted) return;
        setStudent(studentResponse);
        setApplications(applicationResponse.filter((application) => application.studentId === id));
        setSkills(skillResponse.filter((skill) => skill.studentName === studentResponse.name));
      })
      .catch((requestError) => mounted && setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar o aluno."));
    return () => { mounted = false; };
  }, [id]);

  const interviewCreated = (interview: InterviewResponse) => {
    setApplications((current) => current.map((application) => application.id === interview.applicationId ? { ...application, status: "INTERVIEW_SCHEDULED", interviewId: interview.id } : application));
    setNotice(`Entrevista para ${interview.vacancyName} agendada com sucesso.`);
  };

  if (!student) return <AppShell><div className="p-8 text-sm text-muted-foreground">{error || "Carregando aluno..."}</div></AppShell>;
  const initials = student.name.split(" ").map((part) => part[0]).slice(0, 2).join("");

  return (
    <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Alunos", href: "/manager/students" }, { label: student.name }]}>
      <div className="space-y-6">
        <PageHeader title={`Detalhes do Aluno: ${student.name}`} description={`Matrícula: ${student.registration}`} actions={<Link href="/manager/students" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}><ArrowLeft className="size-4" /> Voltar</Link>} />
        {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="space-y-4 rounded-xl border bg-white p-6 text-center"><Avatar className="mx-auto size-24"><AvatarFallback className="bg-primary-800 text-xl text-white">{initials}</AvatarFallback></Avatar><div><h2 className="text-xl font-bold">{student.name}</h2><p className="flex items-center justify-center gap-1 text-sm text-muted-foreground"><Mail className="size-4" /> {student.email}</p></div><Badge variant={student.statusStudent === "ENROLLED" ? "success" : "neutral"}>{student.statusStudent}</Badge><div className="space-y-2 border-t pt-4 text-left text-sm"><p><strong>Curso:</strong> {student.course}</p><p><strong>Turma:</strong> {student.className}</p><p><strong>Turno:</strong> {student.shift}</p></div><div className="space-y-3 border-t pt-4 text-left"><div><div className="mb-1 flex justify-between text-xs"><span>Frequência</span><strong>{student.attendanceRate}%</strong></div><Progress value={student.attendanceRate} /></div><div><div className="mb-1 flex justify-between text-xs"><span>Desempenho</span><strong>{student.performanceGrade ?? 0}/10</strong></div><Progress value={(student.performanceGrade ?? 0) * 10} /></div></div></section>
          <section className="space-y-4 rounded-xl border bg-white p-6 lg:col-span-2"><h2 className="text-lg font-bold">Habilidades avaliadas</h2>{skills.map((skill) => <div key={skill.id}><div className="mb-1 flex justify-between text-sm"><span>{skill.name} <small className="text-muted-foreground">({skill.skillType})</small></span><strong>{skill.grade ?? 0}/10</strong></div><Progress value={(skill.grade ?? 0) * 10} /></div>)}{skills.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma habilidade avaliada.</p>}<h2 className="border-t pt-5 text-lg font-bold">Encaminhamentos</h2>{applications.map((application) => <article key={application.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-semibold">{application.vacancyName}</p><p className="text-xs text-muted-foreground">{application.coordinatorName} · {new Date(application.createdAt).toLocaleDateString("pt-BR")}</p></div><div className="flex items-center gap-2"><Badge variant={application.status === "HIRED" ? "success" : application.status === "REJECTED" ? "neutral" : "info"}>{application.status}</Badge>{application.status === "REFERRED" && <Button size="sm" onClick={() => { setSelected(application); setModalOpen(true); }}><CalendarClock className="size-4" /> Agendar</Button>}</div></article>)}</section>
        </div>
      </div>
      {selected && <InterviewSchedulingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} candidateId={student.id} candidateName={student.name} applicationId={selected.id} vacancyId={selected.vacancyId} vacancyTitle={selected.vacancyName} onConfirm={interviewCreated} />}
    </AppShell>
  );
}
