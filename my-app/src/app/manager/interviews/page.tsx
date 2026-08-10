"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Mail,
  MapPin,
  Plus,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getInterviews,
  getStudents,
  sendInterviewEmail,
  type Interview,
  type Student,
} from "@/lib/manager-api";

export default function ManagerInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [referenceTime] = useState(() => Date.now());

  // Mantém a ordenação e a atualização de estado iguais na carga inicial e
  // nas atualizações solicitadas pelo gestor.
  const applyData = useCallback(
    (interviewData: Interview[], studentData: Student[]) => {
      setInterviews(
        [...interviewData].sort(
          (first, second) =>
            new Date(first.dateTime).getTime() -
            new Date(second.dateTime).getTime()
        )
      );
      setStudents(studentData);
    },
    []
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [interviewData, studentData] = await Promise.all([
        getInterviews(),
        getStudents(),
      ]);

      applyData(interviewData, studentData);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar as entrevistas."
      );
    } finally {
      setLoading(false);
    }
  }, [applyData]);

  useEffect(() => {
    let active = true;

    // O carregamento inicial atualiza o estado somente após a resposta da API,
    // respeitando a regra de efeitos do React e evitando atualização após unmount.
    Promise.all([getInterviews(), getStudents()])
      .then(([interviewData, studentData]) => {
        if (active) applyData(interviewData, studentData);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar as entrevistas."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [applyData]);

  const filteredInterviews = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    if (!query) return interviews;

    return interviews.filter((interview) =>
      [
        interview.nameStudent,
        interview.nameManager,
        interview.interviewerName,
        interview.park,
        interview.section,
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(query)
    );
  }, [interviews, search]);

  const handleSendInvitation = async (interview: Interview) => {
    // A entrevista retorna o nome do aluno, enquanto o endpoint de envio exige
    // o e-mail. Relacionamos os dados já carregados antes de chamar a API.
    const student = students.find(
      (item) => item.name === interview.nameStudent
    );

    if (!student) {
      setError("Não foi possível localizar o e-mail do aluno desta entrevista.");
      return;
    }

    setSendingId(interview.id);
    setError("");
    setNotice("");

    try {
      await sendInterviewEmail(interview.id, student.email);
      setNotice(`Convite enviado para ${student.email}.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível enviar o convite."
      );
    } finally {
      setSendingId(null);
    }
  };

  const upcomingInterviews = interviews.filter(
    (interview) => new Date(interview.dateTime).getTime() >= referenceTime
  ).length;

  return (
    <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Entrevistas" }]}>
      <div className="space-y-6">
        <PageHeader
          title="Entrevistas"
          description={`${upcomingInterviews} próxima${
            upcomingInterviews === 1 ? "" : "s"
          } entrevista${upcomingInterviews === 1 ? "" : "s"} agendada${
            upcomingInterviews === 1 ? "" : "s"
          }`}
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                className={'px-4 py-5'}
                onClick={() => void loadData()}
                disabled={loading}
              >
                <RefreshCw
                  className={`size-4 ${loading ? "animate-spin" : ""}`}
                />
                Atualizar
              </Button>
              <Link
                href="/manager/vacancies"
                className={cn(
                  buttonVariants(),
                  "gap-2 bg-primary-900 text-white px-4 py-5"
                )}
              >
                <Plus className="size-4" />
                Agendar pela vaga
              </Link>
            </div>
          }
        />

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            {notice}
          </div>
        )}

        <div className="max-w-md">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por aluno, gestor ou local..."
          />
        </div>

        {loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-slate-500">
            Carregando entrevistas...
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <CalendarClock className="mx-auto mb-3 size-9 text-slate-300" />
            <p className="font-semibold text-slate-800">
              Nenhuma entrevista encontrada
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInterviews.map((interview) => {
              const date = new Date(interview.dateTime);
              const isPast = date.getTime() < referenceTime;

              return (
                <article
                  key={interview.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`rounded-lg p-3 ${
                        isPast
                          ? "bg-slate-100 text-slate-500"
                          : "bg-primary-50 text-primary-800"
                      }`}
                    >
                      <CalendarClock className="size-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-slate-900">
                          {interview.nameStudent}
                        </h2>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            isPast
                              ? "bg-slate-100 text-slate-600"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {isPast ? "Realizada" : "Agendada"}
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {date.toLocaleDateString("pt-BR", {
                          dateStyle: "long",
                        })}{" "}
                        às{" "}
                        {date.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {interview.park} · {interview.section}
                        </span>
                        <span className="flex items-center gap-1">
                          <UserRound className="size-3.5" />
                          {interview.nameManager}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => void handleSendInvitation(interview)}
                    disabled={sendingId === interview.id}
                  >
                    <Mail className="size-4" />
                    {sendingId === interview.id
                      ? "Enviando..."
                      : "Enviar convite"}
                  </Button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
