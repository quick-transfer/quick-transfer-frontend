"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createVacancy, getPlaces, type PlaceResponse } from "@/lib/core-api";
import { getManager } from "@/lib/manager-api";
import { getCurrentUser } from "@/lib/selection-api";

export default function NovaVagaPage() {
  const router = useRouter();
  const [places, setPlaces] = useState<PlaceResponse[]>([]);
  const [name, setName] = useState("");
  const [area, setArea] = useState("IT");
  const [description, setDescription] = useState("");
  const [numbersVacancies, setNumbersVacancies] = useState(1);
  const [shift, setShift] = useState("FIRST");
  const [placeId, setPlaceId] = useState("");
  const [status, setStatus] = useState<"OPEN" | "URGENT">("OPEN");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([getPlaces({ size: 200, sort: "placeName,asc" }), getCurrentUser()])
      .then(async ([response, user]) => {
        if (!mounted) return;
        const manager = await getManager(user.id);
        if (!mounted) return;
        const active = response.filter((place) =>
          place.status === "ACTIVE" && place.section === manager.section,
        );
        setPlaces(active);
        setPlaceId(active[0]?.id ?? "");
      })
      .catch((requestError) => mounted && setError(
        requestError instanceof Error ? requestError.message : "Não foi possível carregar os locais.",
      ));
    return () => { mounted = false; };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createVacancy({ name, description, numbersVacancies, area, shift, placeId, status, skillIds: [] });
      router.replace("/manager/vacancies");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível criar a vaga.");
      setSaving(false);
    }
  };

  return (
    <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Minhas vagas", href: "/manager/vacancies" }, { label: "Nova vaga" }]}>
      <form onSubmit={submit} className="space-y-6 pb-12">
        <PageHeader title="Criar Nova Vaga" description="Disponibilize uma oportunidade para encaminhamento de alunos" actions={<div className="flex gap-2"><Button type="button" variant="outline" onClick={() => router.push("/manager/vacancies")}>Cancelar</Button><Button type="submit" disabled={saving || !placeId}>{saving ? "Criando..." : "Criar vaga"}</Button></div>} />
        {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <section className="space-y-5 rounded-xl border bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Informações básicas</h2><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-xs font-semibold">Nome da vaga<Input required value={name} onChange={(event) => setName(event.target.value)} /></label><label className="space-y-1.5 text-xs font-semibold">Área<select required className="h-10 w-full rounded-md border px-3 text-sm" value={area} onChange={(event) => setArea(event.target.value)}><option value="IT">Tecnologia da Informação</option><option value="MAINTENANCE">Manutenção</option><option value="TOOLING">Ferramentaria</option><option value="CHEMISTRY">Química</option></select></label><label className="space-y-1.5 text-xs font-semibold">Local<select required className="h-10 w-full rounded-md border px-3 text-sm" value={placeId} onChange={(event) => setPlaceId(event.target.value)}><option value="">Selecione</option>{places.map((place) => <option key={place.id} value={place.id}>{place.placeName} · {place.section}</option>)}</select></label><label className="space-y-1.5 text-xs font-semibold">Turno<select required className="h-10 w-full rounded-md border px-3 text-sm" value={shift} onChange={(event) => setShift(event.target.value)}><option value="FIRST">Primeiro turno</option><option value="SECOND">Segundo turno</option><option value="THIRD">Terceiro turno</option><option value="FLEXIBLE_SHIFT">Flexível</option></select></label><label className="space-y-1.5 text-xs font-semibold">Número de vagas<Input required type="number" min={1} max={50} value={numbersVacancies} onChange={(event) => setNumbersVacancies(Number(event.target.value))} /></label><label className="space-y-1.5 text-xs font-semibold">Prioridade<select className="h-10 w-full rounded-md border px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value as "OPEN" | "URGENT")}><option value="OPEN">Normal</option><option value="URGENT">Urgente</option></select></label></div><label className="block space-y-1.5 text-xs font-semibold">Descrição<textarea required rows={5} className="w-full rounded-md border p-3 text-sm" value={description} onChange={(event) => setDescription(event.target.value)} /></label></section>
      </form>
    </AppShell>
  );
}
