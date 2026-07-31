"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarClock, CheckCircle2, Mail, UserRound, XCircle } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  getInterviews,
  getSkills,
  getStudent,
  interviewStatusLabels,
  updateStudentInterviewStatus,
  type Interview,
  type Skill,
  type Student,
} from "@/lib/manager-api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ManagerStudentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [student, setStudent] = useState<Student | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const studentData = await getStudent(id);
        const [skillData, interviewData] = await Promise.all([
          getSkills(studentData.name),
          getInterviews(),
        ]);
        if (!active) return;
        setStudent(studentData);
        setSkills(skillData);
        setInterviews(interviewData.filter((item) => item.nameStudent === studentData.name));
      } catch (requestError) {
        if (active) setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar o aluno.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [id]);

  const technicalSkills = useMemo(() => skills.filter((skill) => skill.skillType === "TECHNICAL"), [skills]);
  const socioemotionalSkills = useMemo(() => skills.filter((skill) => skill.skillType === "SOCIOEMOTIONAL"), [skills]);

  const handleStatus = async (status: "HIRED" | "DISAPPROVED" | "SEEN") => {
    if (!student) return;
    setUpdating(true);
    setError("");
    try {
      const updated = await updateStudentInterviewStatus(student.id, status);
      setStudent(updated);
      setNotice(`Situação atualizada para ${interviewStatusLabels[status]}.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar o aluno.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Alunos" }]}><div className="rounded-xl border bg-white p-10 text-center text-sm text-slate-500">Carregando perfil...</div></AppShell>;
  }

  if (!student) {
    return <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Alunos" }]}><div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">{error || "Aluno não encontrado."}</div></AppShell>;
  }

  const renderSkills = (items: Skill[], emptyText: string) => items.length === 0 ? (
    <p className="text-sm text-slate-500">{emptyText}</p>
  ) : items.map((skill) => {
    const percentage = Math.min(100, Math.max(0, (skill.grade || 0) * 10));
    return <div key={skill.id} className="space-y-1.5"><div className="flex justify-between text-sm"><span className="font-semibold text-slate-700">{skill.name}</span><span className="font-bold text-slate-900">{skill.grade?.toLocaleString("pt-BR", { minimumFractionDigits: 1 }) ?? "Sem nota"}</span></div><Progress value={percentage} className="h-2" /></div>;
  });

  return (
    <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Alunos", href: "/manager/students" }, { label: student.name }]}>
      <div className="space-y-6">
        <PageHeader
          title={student.name}
          description={`${student.course} · Turma ${student.acronym}`}
          actions={<Link href="/manager/students" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}><ArrowLeft className="size-4" /> Voltar</Link>}
        />

        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</div>}

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <Avatar className="mx-auto size-24 border-4 border-slate-100"><AvatarFallback className="bg-primary-800 text-2xl font-bold text-white">{student.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
              <h2 className="mt-4 text-lg font-bold text-slate-900">{student.name}</h2>
              <a href={`mailto:${student.email}`} className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary-800 hover:underline"><Mail className="size-3.5" /> {student.email}</a>
              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Idade</span><strong>{student.age} anos</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Média</span><strong>{student.averageGrade?.toLocaleString("pt-BR", { minimumFractionDigits: 1 }) ?? "—"}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Matrícula</span><Badge variant={student.statusStudent === "ENROLLED" ? "success" : "warning"}>{student.statusStudent}</Badge></div>
                <div className="flex justify-between gap-3"><span className="text-slate-500">Seleção</span><Badge variant="info">{interviewStatusLabels[student.statusStudentInterview] || student.statusStudentInterview}</Badge></div>
              </div>
              <div className="mt-5 grid gap-2 border-t border-slate-100 pt-4">
                <Button disabled={updating} onClick={() => void handleStatus("HIRED")} className="bg-emerald-700 text-white hover:bg-emerald-800"><CheckCircle2 className="size-4" /> Marcar como contratado</Button>
                <Button disabled={updating} variant="outline" onClick={() => void handleStatus("DISAPPROVED")} className="text-red-600"><XCircle className="size-4" /> Marcar como reprovado</Button>
                <Button disabled={updating} variant="ghost" onClick={() => void handleStatus("SEEN")}><UserRound className="size-4" /> Restaurar como disponível</Button>
              </div>
            </section>
          </aside>

          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-bold text-slate-900">Habilidades</h2>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Técnicas</h3>{renderSkills(technicalSkills, "Nenhuma habilidade técnica cadastrada.")}</div>
                <div className="space-y-4"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Socioemocionais</h3>{renderSkills(socioemotionalSkills, "Nenhuma habilidade socioemocional cadastrada.")}</div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2"><CalendarClock className="size-5 text-primary-800" /><h2 className="text-lg font-bold text-slate-900">Entrevistas</h2></div>
              {interviews.length === 0 ? <p className="text-sm text-slate-500">Nenhuma entrevista agendada para este aluno.</p> : <div className="space-y-3">{interviews.map((interview) => { const date = new Date(interview.dateTime); return <article key={interview.id} className="rounded-lg border border-slate-200 p-4"><div className="flex flex-col justify-between gap-2 sm:flex-row"><div><p className="font-bold text-slate-900">{date.toLocaleDateString("pt-BR")} às {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p><p className="text-sm text-slate-500">{interview.park} · {interview.section}</p></div><div className="text-sm sm:text-right"><p className="font-semibold text-slate-700">Gestor: {interview.nameManager}</p><p className="text-slate-500">Entrevistador: {interview.interviewerName}</p></div></div></article>; })}</div>}
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
