"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Check,
  Mail,
  MapPin,
  Plus,
  RefreshCw,
  UserRound,
  X,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getInterviews,
  sendInterviewEmail,
  updateInterview,
  type InterviewResponse,
} from "@/lib/selection-api";
import { cn } from "@/lib/utils";

const outcomeLabels = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Reprovado",
} as const;

export default function ManagerInterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewResponse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [referenceTime] = useState(() => Date.now());

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getInterviews({ size: 500, sort: "dateTime,asc" });
      setInterviews(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar as entrevistas.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    getInterviews({ size: 500, sort: "dateTime,asc" })
      .then((data) => {
        if (active) setInterviews(data);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar as entrevistas.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredInterviews = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    if (!query) return interviews;

    return interviews.filter((interview) =>
      [
        interview.nameStudent,
        interview.studentEmail,
        interview.vacancyName,
        interview.interviewerName,
        interview.park,
        interview.section,
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(query),
    );
  }, [interviews, search]);

  const handleSendInvitation = async (interview: InterviewResponse) => {
    setWorkingId(interview.id);
    setError("");
    setNotice("");
    try {
      await sendInterviewEmail(interview.id);
      setNotice(`Convite reenviado para ${interview.studentEmail}.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível reenviar o convite.",
      );
    } finally {
      setWorkingId(null);
    }
  };

  const handleUpdate = async (
    interview: InterviewResponse,
    input: Parameters<typeof updateInterview>[1],
    successMessage: string,
  ) => {
    setWorkingId(interview.id);
    setError("");
    setNotice("");
    try {
      const updated = await updateInterview(interview.id, input);
      setInterviews((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setNotice(successMessage);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível atualizar a entrevista.",
      );
    } finally {
      setWorkingId(null);
    }
  };

  const upcomingInterviews = interviews.filter(
    (interview) =>
      interview.status === "SCHEDULED" &&
      new Date(interview.dateTime).getTime() >= referenceTime,
  ).length;

  return (
    <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Entrevistas" }]}>
      <div className="space-y-6">
        <PageHeader
          title="Entrevistas"
          description={`${upcomingInterviews} próxima${upcomingInterviews === 1 ? "" : "s"} entrevista${upcomingInterviews === 1 ? "" : "s"} agendada${upcomingInterviews === 1 ? "" : "s"}`}
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="px-4 py-5"
                onClick={() => void loadData()}
                disabled={loading}
              >
                <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
              <Link
                href="/manager/vacancies"
                className={cn(
                  buttonVariants(),
                  "gap-2 bg-primary-900 px-4 py-5 text-white",
                )}
              >
                <Plus className="size-4" />
                Agendar pela vaga
              </Link>
            </div>
          }
        />

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {notice}
          </div>
        )}

        <div className="max-w-md">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por aluno, vaga ou local..."
          />
        </div>

        {loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-slate-500">
            Carregando entrevistas...
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <CalendarClock className="mx-auto mb-3 size-9 text-slate-300" />
            <p className="font-semibold text-slate-800">Nenhuma entrevista encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInterviews.map((interview) => {
              const date = new Date(interview.dateTime);
              const disabled = workingId === interview.id;

              return (
                <article
                  key={interview.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary-50 p-3 text-primary-800">
                      <CalendarClock className="size-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-slate-900">{interview.nameStudent}</h2>
                        {interview.status === "CANCELLED" ? (
                          <Badge variant="neutral">Cancelada</Badge>
                        ) : interview.outcome === "APPROVED" ? (
                          <Badge variant="success">{outcomeLabels.APPROVED}</Badge>
                        ) : interview.outcome === "REJECTED" ? (
                          <Badge variant="danger">{outcomeLabels.REJECTED}</Badge>
                        ) : (
                          <Badge variant="info">{outcomeLabels.PENDING}</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {interview.vacancyName} · {date.toLocaleDateString("pt-BR", { dateStyle: "long" })} às {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="size-3.5" />{interview.park} · {interview.section}</span>
                        <span className="flex items-center gap-1"><UserRound className="size-3.5" />{interview.interviewerName}</span>
                        <span>{interview.studentEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {interview.status === "SCHEDULED" && interview.outcome === "PENDING" && (
                      <>
                        <Button
                          variant="outline"
                          disabled={disabled}
                          onClick={() => void handleUpdate(interview, { outcome: "APPROVED" }, "Candidato aprovado com sucesso.")}
                        >
                          <Check className="size-4" />Aprovar
                        </Button>
                        <Button
                          variant="outline"
                          disabled={disabled}
                          onClick={() => void handleUpdate(interview, { outcome: "REJECTED" }, "Resultado registrado com sucesso.")}
                        >
                          <X className="size-4" />Reprovar
                        </Button>
                        <Button
                          variant="ghost"
                          disabled={disabled}
                          onClick={() => void handleUpdate(interview, { status: "CANCELLED" }, "Entrevista cancelada.")}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                    {interview.status !== "CANCELLED" && (
                      <Button variant="outline" disabled={disabled} onClick={() => void handleSendInvitation(interview)}>
                        <Mail className="size-4" />
                        {disabled ? "Enviando..." : "Reenviar convite"}
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
