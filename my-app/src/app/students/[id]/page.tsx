"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Award, Clock, Mail } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { TimelineItem } from "@/components/shared/timeline-item";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getStudent, type StudentResponse } from "@/lib/core-api";
import { createTransferRequest, getOperationalShifts, getStudentTimeline, type OperationalShiftResponse, type StudentTimelineResponse } from "@/lib/operations-api";
import { cn } from "@/lib/utils";

interface PageProps { params: Promise<{ id: string }>; }

export default function AlunoDetalhesPage({ params }: PageProps) {
  const { id } = use(params);
  const [student, setStudent] = useState<StudentResponse | null>(null);
  const [timeline, setTimeline] = useState<StudentTimelineResponse[]>([]);
  const [shifts, setShifts] = useState<OperationalShiftResponse[]>([]);
  const [targetShiftId, setTargetShiftId] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([getStudent(id), getStudentTimeline(id), getOperationalShifts()])
      .then(([studentResponse, timelineResponse, shiftResponse]) => {
        if (!mounted) return;
        setStudent(studentResponse);
        setTimeline(timelineResponse);
        setShifts(shiftResponse.filter((shift) => shift.active));
      })
      .catch((requestError) => mounted && setError(
        requestError instanceof Error ? requestError.message : "Não foi possível carregar o aluno.",
      ));
    return () => { mounted = false; };
  }, [id]);

  const requestTransfer = async () => {
    if (!student || !targetShiftId || !reason.trim()) return;
    setSaving(true);
    setError("");
    try {
      await createTransferRequest({ studentId: student.id, targetShiftId, reason });
      const refreshedTimeline = await getStudentTimeline(student.id);
      setTimeline(refreshedTimeline);
      setTargetShiftId("");
      setReason("");
      setNotice("Solicitação de troca de turno registrada.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível criar a solicitação.");
    } finally {
      setSaving(false);
    }
  };

  if (!student) {
    return <AppShell><div className="p-8 text-sm text-muted-foreground">{error || "Carregando aluno..."}</div></AppShell>;
  }
  const initials = student.name.split(" ").map((part) => part[0]).slice(0, 2).join("");

  return (
    <AppShell breadcrumbs={[{ label: "Alunos", href: "/students" }, { label: student.name }]}>
      <div className="space-y-6">
        <PageHeader title={`Detalhes do Aluno: ${student.name}`} description={`Matrícula: ${student.registration}`} actions={<Link href="/students" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}><ArrowLeft className="size-4" />Voltar</Link>} />
        {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1"><CardHeader className="pb-2 text-center"><Avatar className="mx-auto size-24 border-2 border-primary"><AvatarFallback className="bg-primary-600 text-2xl font-bold text-white">{initials}</AvatarFallback></Avatar><CardTitle className="mt-4 text-xl">{student.name}</CardTitle><div className="flex justify-center pt-1"><Badge variant={student.statusStudent === "ENROLLED" ? "success" : "neutral"}>{student.statusStudent === "ENROLLED" ? "Ativo" : student.statusStudent}</Badge></div></CardHeader><CardContent className="space-y-4 pt-4 text-sm"><div className="flex items-center gap-2 text-muted-foreground"><Mail className="size-4 text-primary" />{student.email}</div><div className="flex items-center gap-2 text-muted-foreground"><Award className="size-4 text-primary" />{student.course}</div><div className="flex items-center gap-2 text-muted-foreground"><Clock className="size-4 text-primary" />{student.shift}</div><div className="space-y-3 border-t pt-4"><div><div className="mb-1 flex justify-between text-xs"><span>Frequência escolar</span><strong>{student.attendanceRate}%</strong></div><Progress value={student.attendanceRate} /></div><div><div className="mb-1 flex justify-between text-xs"><span>Média de desempenho</span><strong>{student.performanceGrade ?? 0} / 10</strong></div><Progress value={(student.performanceGrade ?? 0) * 10} /></div></div></CardContent></Card>

          <div className="space-y-6 md:col-span-2">
            <Card><CardHeader><CardTitle className="text-base">Solicitar troca de turno</CardTitle></CardHeader><CardContent className="space-y-3"><select className="h-10 w-full rounded-md border px-3 text-sm" value={targetShiftId} onChange={(event) => setTargetShiftId(event.target.value)}><option value="">Selecione o turno desejado</option>{shifts.filter((shift) => shift.id !== student.operationalShiftId && shift.status !== "FULL").map((shift) => <option key={shift.id} value={shift.id}>{shift.name} ({shift.currentOccupancy}/{shift.capacity})</option>)}</select><textarea className="w-full rounded-md border p-3 text-sm" rows={3} placeholder="Justificativa da solicitação" value={reason} onChange={(event) => setReason(event.target.value)} /><div className="flex justify-end"><Button disabled={saving || !targetShiftId || !reason.trim()} onClick={() => void requestTransfer()}>{saving ? "Enviando..." : "Registrar solicitação"}</Button></div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Histórico de notificações e ocorrências</CardTitle></CardHeader><CardContent className="pt-2">{timeline.map((item, index) => <TimelineItem key={item.id} title={item.title} description={item.description} date={new Date(item.date).toLocaleString("pt-BR")} badgeLabel={item.type} badgeVariant={item.status} isLast={index === timeline.length - 1} />)}{timeline.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma ocorrência registrada.</p>}</CardContent></Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
