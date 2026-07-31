"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  areaLabels,
  createVacancy,
  getPlaces,
  shiftLabels,
  type Place,
  type VacancyArea,
  type VacancyShift,
} from "@/lib/manager-api";

export default function NewVacancyPage() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [numbersVacancies, setNumbersVacancies] = useState(1);
  const [area, setArea] = useState<VacancyArea>("IT");
  const [shift, setShift] = useState<VacancyShift>("FIRST");
  const [placeId, setPlaceId] = useState("");
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getPlaces()
      .then((data) => {
        setPlaces(data);
        setPlaceId(data[0]?.id || "");
      })
      .catch((requestError) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : "NÃ£o foi possÃ­vel carregar os locais."
        )
      )
      .finally(() => setLoadingPlaces(false));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !description.trim() || !placeId) {
      setError("Preencha todos os campos obrigatÃ³rios.");
      return;
    }

    if (!Number.isInteger(numbersVacancies) || numbersVacancies < 1) {
      setError("O nÃºmero de vagas deve ser um inteiro maior que zero.");
      return;
    }

    setSubmitting(true);
    try {
      // A vaga sÃ³ Ã© considerada criada apÃ³s a confirmaÃ§Ã£o do backend.
      const vacancy = await createVacancy({
        name: name.trim(),
        description: description.trim(),
        numbersVacancies,
        area,
        shift,
        placeId,
      });
      router.push(`/manager/vacancies/${vacancy.id}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "NÃ£o foi possÃ­vel criar a vaga."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Minhas Vagas", href: "/manager/vacancies" }, { label: "Nova Vaga" }]}>
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          title="Criar nova vaga"
          description="Informe os dados que serÃ£o usados para apresentar a oportunidade aos candidatos"
          actions={
            <Button variant="outline" onClick={() => router.push("/manager/vacancies")}>
              <ArrowLeft className="size-4" /> Voltar
            </Button>
          }
        />

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}


        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-primary-50 p-2 text-primary-800">
              <BriefcaseBusiness className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Dados da oportunidade</h2>
              <p className="text-xs text-slate-500">Todos os campos marcados sÃ£o obrigatÃ³rios.</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Nome da vaga *</span>
              <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required placeholder="Ex.: Aprendiz de manutenÃ§Ã£o" />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Ãrea *</span>
              <select value={area} onChange={(event) => setArea(event.target.value as VacancyArea)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                {Object.entries(areaLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Turno *</span>
              <select value={shift} onChange={(event) => setShift(event.target.value as VacancyShift)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                {Object.entries(shiftLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Local *</span>
              <select value={placeId} onChange={(event) => setPlaceId(event.target.value)} disabled={loadingPlaces} required className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-50">
                <option value="">{loadingPlaces ? "Carregando locais..." : places.length === 0 ? "Nenhum local cadastrado" : "Selecione um local"}</option>
                {places.map((place) => <option key={place.id} value={place.id}>{place.placeName} - {place.park} - {place.section}</option>)}
              </select>
              {/* Locais sao cadastrados somente pelo fluxo administrativo. */}
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">NÃºmero de posiÃ§Ãµes *</span>
              <Input type="number" min={1} step={1} value={numbersVacancies} onChange={(event) => setNumbersVacancies(Number(event.target.value))} required />
            </label>

            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700">DescriÃ§Ã£o *</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={6} required placeholder="Descreva as atividades e o perfil esperado..." className="w-full resize-y rounded-md border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </label>

          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Button type="button" variant="outline" onClick={() => router.push("/manager/vacancies")}>Cancelar</Button>
            <Button type="submit" disabled={submitting || loadingPlaces || !placeId} className="bg-primary-900 text-white">
              {submitting ? "Criando..." : "Criar vaga"}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
