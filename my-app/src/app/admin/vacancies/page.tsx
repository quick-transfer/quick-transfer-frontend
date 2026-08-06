"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  createVacancy,
  deleteVacancy,
  getPlaces,
  getVacancies,
  updateVacancy,
  type PlaceResponse,
  type VacancyPayload,
  type VacancyResponse,
} from "@/lib/core-api";
import { Edit, Trash2, Plus } from "lucide-react";

const emptyForm: VacancyPayload = {
  name: "",
  description: "",
  numbersVacancies: 1,
  area: "IT",
  shift: "FIRST",
  placeId: "",
  status: "OPEN",
};

export default function VagasPage() {
  const [vacancies, setVacancies] = useState<VacancyResponse[]>([]);
  const [places, setPlaces] = useState<PlaceResponse[]>([]);
  const [editing, setEditing] = useState<VacancyResponse | null>(null);
  const [form, setForm] = useState<VacancyPayload>(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([getVacancies({ size: 200, sort: "name,asc" }), getPlaces({ size: 200, sort: "placeName,asc" })])
      .then(([vacancyResponse, placeResponse]) => {
        if (!mounted) return;
        setVacancies(vacancyResponse);
        setPlaces(placeResponse.filter((place) => place.status === "ACTIVE"));
      })
      .catch((requestError) => mounted && setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar as vagas."));
    return () => { mounted = false; };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, placeId: places[0]?.id ?? "" });
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (vacancy: VacancyResponse) => {
    const place = places.find((item) => item.placeName === vacancy.placeName);
    setEditing(vacancy);
    setForm({
      name: vacancy.name,
      description: vacancy.description,
      numbersVacancies: vacancy.numbersVacancies,
      area: vacancy.area,
      shift: vacancy.shift,
      placeId: place?.id ?? "",
      status: vacancy.status,
      managerId: vacancy.managerId,
      skillIds: vacancy.skills.map((skill) => skill.id),
    });
    setError("");
    setDialogOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.placeId) { setError("Selecione um local ativo."); return; }
    setSaving(true);
    setError("");
    try {
      const saved = editing ? await updateVacancy(editing.id, form) : await createVacancy(form);
      setVacancies((current) => [...current.filter((item) => item.id !== saved.id), saved].sort((a, b) => a.name.localeCompare(b.name)));
      setDialogOpen(false);
      setNotice(`Vaga ${editing ? "atualizada" : "criada"} com sucesso.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível salvar a vaga.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (vacancy: VacancyResponse) => {
    if (!window.confirm(`Excluir a vaga "${vacancy.name}"?`)) return;
    setError("");
    try {
      await deleteVacancy(vacancy.id);
      setVacancies((current) => current.filter((item) => item.id !== vacancy.id));
      setNotice(`Vaga "${vacancy.name}" excluída com sucesso.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível excluir a vaga.");
    }
  };

  const columns: DataTableColumn<VacancyResponse>[] = [
    { key: "name", header: "Título da Vaga", sortable: true, render: (vacancy) => <div><p className="font-medium">{vacancy.name}</p><p className="text-xs text-muted-foreground">{vacancy.area}</p></div> },
    { key: "placeName", header: "Localização", render: (vacancy) => <span className="text-sm font-medium">{vacancy.placeName || `${vacancy.park} / ${vacancy.section}`}</span> },
    { key: "spots", header: "Vagas Preenchidas", render: (vacancy) => { const percentage = Math.round((vacancy.filledSpots / vacancy.numbersVacancies) * 100); return <div className="space-y-1"><span className="text-xs font-semibold">{vacancy.filledSpots} / {vacancy.numbersVacancies} vagas</span><div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary-600" style={{ width: `${Math.min(percentage, 100)}%` }} /></div></div>; } },
    { key: "status", header: "Status", render: (vacancy) => vacancy.status === "OPEN" ? <Badge variant="success">Aberta</Badge> : vacancy.status === "URGENT" ? <Badge variant="danger">Urgente</Badge> : <Badge variant="neutral">Fechada</Badge> },
    { key: "actions", header: "Ações", className: "text-right", render: (vacancy) => <div className="flex justify-end gap-1"><Button variant="ghost" size="icon-sm" onClick={() => openEdit(vacancy)}><Edit className="size-3.5" /></Button><Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => void remove(vacancy)}><Trash2 className="size-3.5" /></Button></div> },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Vagas" }]}>
      <div className="space-y-6">
        <PageHeader title="Gerenciar Vagas" description="Abertura e controle de vagas para estagiários e aprendizes" actions={<Button className="gap-2" onClick={openCreate}><Plus className="size-4" /> Nova Vaga</Button>} />
        {error && !dialogOpen && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}
        <DataTable columns={columns} data={vacancies} pageSize={10} searchable searchPlaceholder="Buscar por título ou área..." searchKeys={["name", "area", "placeName"]} getRowKey={(row) => row.id} />
      </div>
      <Dialog open={dialogOpen} onOpenChange={(open) => !saving && setDialogOpen(open)}>
        <DialogContent className="sm:max-w-lg"><form onSubmit={submit} className="space-y-4"><DialogHeader><DialogTitle>{editing ? "Editar vaga" : "Nova vaga"}</DialogTitle><DialogDescription>Informe os dados da oportunidade.</DialogDescription></DialogHeader>{error && <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}<Input required placeholder="Título" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><Input required placeholder="Descrição" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><div className="grid grid-cols-2 gap-3"><Input required type="number" min={1} value={form.numbersVacancies} onChange={(event) => setForm({ ...form, numbersVacancies: Number(event.target.value) })} /><select className="h-10 rounded-md border px-3 text-sm" value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })}><option value="IT">TI</option><option value="MAINTENANCE">Manutenção</option><option value="TOOLING">Ferramentaria</option><option value="CHEMISTRY">Química</option></select><select className="h-10 rounded-md border px-3 text-sm" value={form.shift} onChange={(event) => setForm({ ...form, shift: event.target.value })}><option value="FIRST">Primeiro turno</option><option value="SECOND">Segundo turno</option><option value="THIRD">Terceiro turno</option><option value="FLEXIBLE_SHIFT">Flexível</option></select><select className="h-10 rounded-md border px-3 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as VacancyPayload["status"] })}><option value="OPEN">Aberta</option><option value="URGENT">Urgente</option><option value="CLOSED">Fechada</option></select></div><select required className="h-10 w-full rounded-md border px-3 text-sm" value={form.placeId} onChange={(event) => setForm({ ...form, placeId: event.target.value })}><option value="">Selecione o local</option>{places.map((place) => <option key={place.id} value={place.id}>{place.placeName}</option>)}</select><DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button></DialogFooter></form></DialogContent>
      </Dialog>
    </AppShell>
  );
}
