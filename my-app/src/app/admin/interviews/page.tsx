"use client";

import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getInterviews, updateInterview, type InterviewResponse } from "@/lib/selection-api";
import { Calendar, Clock, Check, X } from "lucide-react";

export default function EntrevistasPage() {
  const [interviews, setInterviews] = useState<InterviewResponse[]>([]);
  const [rescheduling, setRescheduling] = useState<InterviewResponse | null>(null);
  const [dateTime, setDateTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    getInterviews({ size: 500, sort: "dateTime,asc" })
      .then((response) => mounted && setInterviews(response))
      .catch((requestError) => mounted && setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar as entrevistas."));
    return () => { mounted = false; };
  }, []);

  const patchInterview = async (interview: InterviewResponse, input: Parameters<typeof updateInterview>[1]) => {
    setSaving(true);
    setError("");
    try {
      const updated = await updateInterview(interview.id, input);
      setInterviews((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice("Entrevista atualizada com sucesso.");
      setRescheduling(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar a entrevista.");
    } finally { setSaving(false); }
  };

  const columns: DataTableColumn<InterviewResponse>[] = [
    { key: "nameStudent", header: "Candidato", sortable: true, render: (interview) => <div><p className="font-medium">{interview.nameStudent}</p><p className="text-xs text-muted-foreground">{interview.studentEmail}</p></div> },
    { key: "vacancyName", header: "Vaga Pretendida", render: (interview) => <span className="text-sm font-medium">{interview.vacancyName}</span> },
    { key: "dateTime", header: "Data / Horário", sortable: true, render: (interview) => { const date = new Date(interview.dateTime); return <div className="flex gap-3 text-xs"><span className="flex items-center gap-1"><Calendar className="size-3.5" /> {date.toLocaleDateString("pt-BR")}</span><span className="flex items-center gap-1"><Clock className="size-3.5" /> {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span></div>; } },
    { key: "interviewerName", header: "Entrevistador", render: (interview) => <div><p className="text-sm">{interview.interviewerName}</p><p className="text-xs text-muted-foreground">Gestor: {interview.nameManager}</p></div> },
    { key: "outcome", header: "Status", render: (interview) => interview.outcome === "APPROVED" ? <Badge variant="success">Aprovado</Badge> : interview.outcome === "REJECTED" ? <Badge variant="danger">Reprovado</Badge> : interview.status === "CANCELLED" ? <Badge variant="neutral">Cancelada</Badge> : <Badge variant="info">Agendada</Badge> },
    { key: "actions", header: "Ações", className: "text-right", render: (interview) => <div className="flex justify-end gap-1"><Button variant="outline" size="sm" onClick={() => { setRescheduling(interview); setDateTime(interview.dateTime.slice(0, 16)); }}>Reagendar</Button>{interview.outcome === "PENDING" && <><Button variant="ghost" size="icon-sm" className="text-emerald-700" onClick={() => void patchInterview(interview, { outcome: "APPROVED" })}><Check className="size-4" /></Button><Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => void patchInterview(interview, { outcome: "REJECTED" })}><X className="size-4" /></Button></>}</div> },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Entrevistas" }]}>
      <div className="space-y-6"><PageHeader title="Gerenciar Entrevistas" description="Acompanhamento do processo seletivo dos aprendizes" />{error && !rescheduling && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}{notice && <div role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}<DataTable columns={columns} data={interviews} pageSize={10} searchable searchPlaceholder="Buscar candidato ou vaga..." searchKeys={["nameStudent", "vacancyName", "interviewerName"]} getRowKey={(row) => row.id} /></div>
      <Dialog open={Boolean(rescheduling)} onOpenChange={(open) => !open && setRescheduling(null)}><DialogContent><DialogHeader><DialogTitle>Reagendar entrevista</DialogTitle></DialogHeader>{error && <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}<Input type="datetime-local" value={dateTime} onChange={(event) => setDateTime(event.target.value)} /><DialogFooter><Button variant="outline" onClick={() => setRescheduling(null)}>Cancelar</Button><Button disabled={saving || !dateTime} onClick={() => rescheduling && void patchInterview(rescheduling, { dateTime: `${dateTime}:00`, status: "SCHEDULED", outcome: "PENDING" })}>{saving ? "Salvando..." : "Salvar"}</Button></DialogFooter></DialogContent></Dialog>
    </AppShell>
  );
}
