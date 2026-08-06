"use client";

import { FormEvent, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getVacancies, type VacancyResponse } from "@/lib/core-api";
import { createInterview, getCurrentUser, sendInterviewEmail, type InterviewResponse } from "@/lib/selection-api";

interface InterviewSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  applicationId?: string;
  vacancyId?: string;
  vacancyTitle?: string;
  onConfirm: (interview: InterviewResponse) => void;
}

export function InterviewSchedulingModal({
  isOpen,
  onClose,
  candidateId,
  candidateName,
  applicationId,
  vacancyId,
  vacancyTitle,
  onConfirm,
}: InterviewSchedulingModalProps) {
  const [vacancies, setVacancies] = useState<VacancyResponse[]>([]);
  const [interviewerName, setInterviewerName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedVacancyId, setSelectedVacancyId] = useState(vacancyId ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    Promise.all([getVacancies({ size: 200, sort: "name,asc" }), getCurrentUser()])
      .then(([vacancyResponse, user]) => {
        if (!mounted) return;
        const open = vacancyResponse.filter((vacancy) => vacancy.status !== "CLOSED");
        setVacancies(open);
        setInterviewerName(user.name);
        setSelectedVacancyId(vacancyId ?? open[0]?.id ?? "");
      })
      .catch((requestError) => mounted && setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar o agendamento."));
    return () => { mounted = false; };
  }, [isOpen, vacancyId]);

  const today = new Date().toLocaleDateString("sv-SE");
  const maxDateValue = new Date();
  maxDateValue.setFullYear(maxDateValue.getFullYear() + 1);
  const maxDate = maxDateValue.toLocaleDateString("sv-SE");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedVacancyId) { setError("Selecione uma vaga."); return; }
    setSubmitting(true);
    setError("");
    try {
      const interview = await createInterview({
        interviewerName,
        dateTime: `${date}T${time}:00`,
        studentId: candidateId,
        vacancyId: selectedVacancyId,
        applicationId,
        notes,
      });
      try {
        await sendInterviewEmail(interview.id);
      } catch {
        // The interview is already persisted; the manager can retry the invitation from the list.
      }
      onConfirm(interview);
      setDate("");
      setTime("");
      setNotes("");
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível agendar a entrevista.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !submitting && onClose()}>
      <DialogContent className="sm:max-w-md"><form onSubmit={submit} className="space-y-4"><DialogHeader><DialogTitle>Agendar Entrevista</DialogTitle><DialogDescription>Agende a entrevista com <strong>{candidateName}</strong>. O convite será enviado após a confirmação.</DialogDescription></DialogHeader>{error && <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}<label className="space-y-1.5"><Label>Vaga</Label>{vacancyId ? <div className="flex h-10 items-center rounded-md border bg-slate-50 px-3 text-sm">{vacancyTitle ?? vacancies.find((vacancy) => vacancy.id === vacancyId)?.name}</div> : <select required className="h-10 w-full rounded-md border px-3 text-sm" value={selectedVacancyId} onChange={(event) => setSelectedVacancyId(event.target.value)}><option value="">Selecione</option>{vacancies.map((vacancy) => <option key={vacancy.id} value={vacancy.id}>{vacancy.name}</option>)}</select>}</label><label className="space-y-1.5"><Label>Entrevistador</Label><Input required value={interviewerName} onChange={(event) => setInterviewerName(event.target.value)} /></label><div className="grid grid-cols-2 gap-3"><label className="space-y-1.5"><Label>Data</Label><Input required type="date" min={today} max={maxDate} value={date} onChange={(event) => setDate(event.target.value)} /></label><label className="space-y-1.5"><Label>Horário</Label><Input required type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label></div><label className="space-y-1.5"><Label>Observações</Label><textarea className="w-full rounded-md border p-2 text-sm" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} /></label><DialogFooter><Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button><Button type="submit" disabled={submitting}>{submitting ? "Agendando..." : "Agendar e enviar convite"}</Button></DialogFooter></form></DialogContent>
    </Dialog>
  );
}
