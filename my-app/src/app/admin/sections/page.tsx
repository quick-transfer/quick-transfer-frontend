"use client";

import { useEffect, useState } from "react";
import { Briefcase, CalendarCheck, Eye, MapPin, Users } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPlaces, getVacancies, type PlaceResponse, type VacancyResponse } from "@/lib/core-api";
import { getManagers, type Manager } from "@/lib/manager-api";
import { getInterviews, type InterviewResponse } from "@/lib/selection-api";

interface SectionSummary {
  id: string;
  placeName: string;
  section: string;
  place: PlaceResponse;
  managers: Manager[];
  vacancies: VacancyResponse[];
  interviews: InterviewResponse[];
}

const parkLabels = { WEG_I: "WEG I", WEG_II: "WEG II" } as const;

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [selected, setSelected] = useState<SectionSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getPlaces({ size: 500, sort: "placeName,asc" }),
      getVacancies({ size: 500 }),
      getManagers({ size: 500 }),
      getInterviews({ size: 500 }),
    ])
      .then(([places, vacancies, managers, interviews]) => {
        if (!mounted) return;
        setSections(places.map((place) => ({
          id: place.id,
          placeName: place.placeName,
          section: place.section,
          place,
          managers: managers.filter((manager) => manager.section === place.section),
          vacancies: vacancies.filter((vacancy) => vacancy.placeId === place.id),
          interviews: interviews.filter((interview) => interview.placeId === place.id),
        })));
      })
      .catch((requestError) => mounted && setError(
        requestError instanceof Error ? requestError.message : "Não foi possível carregar gestores e seções.",
      ));
    return () => { mounted = false; };
  }, []);

  const columns: DataTableColumn<SectionSummary>[] = [
    { key: "place", header: "Unidade / local", sortable: true, render: (summary) => <div className="flex items-center gap-3"><div className="rounded-lg bg-primary-50 p-2 text-primary-600"><MapPin className="size-4" /></div><div><p className="font-semibold">{summary.place.placeName}</p><p className="text-xs text-muted-foreground">{summary.place.city || "Cidade não informada"} · {summary.place.section}</p></div></div> },
    { key: "park", header: "Parque", render: (summary) => <Badge variant="outline">{parkLabels[summary.place.park]}</Badge> },
    { key: "managers", header: "Gestores", render: (summary) => <span className="flex items-center gap-2 text-sm font-semibold"><Users className="size-3.5 text-slate-400" />{summary.managers.length}</span> },
    { key: "vacancies", header: "Vagas", render: (summary) => <span className="flex items-center gap-2 text-sm font-semibold"><Briefcase className="size-3.5 text-slate-400" />{summary.vacancies.length}</span> },
    { key: "interviews", header: "Entrevistas", render: (summary) => <span className="flex items-center gap-2 text-sm font-semibold"><CalendarCheck className="size-3.5 text-slate-400" />{summary.interviews.length}</span> },
    { key: "actions", header: "Ações", className: "text-right", render: (summary) => <Button variant="outline" size="sm" onClick={() => setSelected(summary)}><Eye className="size-3.5" />Detalhes</Button> },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Gestores / Seções" }]}>
      <div className="space-y-6">
        <PageHeader title="Gestores e Seções" description="Visão consolidada de locais, gestores, vagas e entrevistas" />
        {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl border bg-white p-5"><p className="text-xs font-semibold uppercase text-muted-foreground">Locais e seções</p><p className="text-3xl font-bold">{sections.length}</p></div><div className="rounded-xl border bg-white p-5"><p className="text-xs font-semibold uppercase text-muted-foreground">Vagas cadastradas</p><p className="text-3xl font-bold">{sections.reduce((total, item) => total + item.vacancies.length, 0)}</p></div><div className="rounded-xl border bg-white p-5"><p className="text-xs font-semibold uppercase text-muted-foreground">Entrevistas</p><p className="text-3xl font-bold">{sections.reduce((total, item) => total + item.interviews.length, 0)}</p></div></div>
        <DataTable columns={columns} data={sections} pageSize={10} searchable searchPlaceholder="Buscar local ou seção..." searchKeys={["placeName", "section"]} getRowKey={(row) => row.id} />
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{selected?.place.placeName}</DialogTitle><DialogDescription>{selected && `${parkLabels[selected.place.park]} · ${selected.place.section}`}</DialogDescription></DialogHeader>{selected && <div className="space-y-5"><section><h3 className="mb-2 text-sm font-bold">Gestores ({selected.managers.length})</h3>{selected.managers.map((manager) => <div key={manager.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm"><strong>{manager.name}</strong><p className="text-xs text-muted-foreground">{manager.email}</p></div>)}{selected.managers.length === 0 && <p className="text-xs text-muted-foreground">Nenhum gestor associado à seção.</p>}</section><section><h3 className="mb-2 text-sm font-bold">Vagas ({selected.vacancies.length})</h3>{selected.vacancies.map((vacancy) => <div key={vacancy.id} className="mb-1 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"><span>{vacancy.name}</span><Badge variant={vacancy.status === "URGENT" ? "warning" : vacancy.status === "CLOSED" ? "neutral" : "success"}>{vacancy.status}</Badge></div>)}</section><section><h3 className="mb-2 text-sm font-bold">Entrevistas ({selected.interviews.length})</h3>{selected.interviews.map((interview) => <div key={interview.id} className="mb-1 rounded-lg bg-slate-50 px-3 py-2 text-xs"><strong>{interview.nameStudent}</strong><p className="text-muted-foreground">{new Date(interview.dateTime).toLocaleString("pt-BR")}</p></div>)}</section></div>}<DialogFooter><Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button></DialogFooter></DialogContent></Dialog>
    </AppShell>
  );
}
