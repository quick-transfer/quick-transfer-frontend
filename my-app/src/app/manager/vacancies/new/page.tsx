"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, MapPin, Plus, X } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  areaLabels,
  createPlace,
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
  const [showTemporaryPlace, setShowTemporaryPlace] = useState(false);
  const [temporaryPlaceName, setTemporaryPlaceName] = useState("Local temporário");
  const [temporaryPark, setTemporaryPark] = useState<"WEG_I" | "WEG_II">("WEG_I");
  const [temporarySection, setTemporarySection] = useState("IT");
  const [creatingPlace, setCreatingPlace] = useState(false);
  const [placeNotice, setPlaceNotice] = useState("");
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
            : "Não foi possível carregar os locais."
        )
      )
      .finally(() => setLoadingPlaces(false));
  }, []);

  const handleCreateTemporaryPlace = async () => {
    setError("");
    setPlaceNotice("");

    if (!temporaryPlaceName.trim() || !temporarySection.trim()) {
      setError("Informe o nome e a seção do local temporário.");
      return;
    }

    setCreatingPlace(true);
    try {
      const place = await createPlace({
        placeName: temporaryPlaceName.trim(),
        park: temporaryPark,
        section: temporarySection.trim(),
      });
      setPlaces((current) => [...current, place]);
      setPlaceId(place.id);
      setPlaceNotice(`Local “${place.placeName}” criado e selecionado.`);
      setShowTemporaryPlace(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível criar o local temporário."
      );
    } finally {
      setCreatingPlace(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !description.trim() || !placeId) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!Number.isInteger(numbersVacancies) || numbersVacancies < 1) {
      setError("O número de vagas deve ser um inteiro maior que zero.");
      return;
    }

    setSubmitting(true);
    try {
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
          : "Não foi possível criar a vaga."
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
          description="Informe os dados que serão usados para apresentar a oportunidade aos candidatos"
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

        {placeNotice && (
          <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {placeNotice}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-primary-50 p-2 text-primary-800">
              <BriefcaseBusiness className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Dados da oportunidade</h2>
              <p className="text-xs text-slate-500">Todos os campos marcados são obrigatórios.</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Nome da vaga *</span>
              <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required placeholder="Ex.: Aprendiz de manutenção" />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Área *</span>
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

            <div className="space-y-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Local *</span>
                <select value={placeId} onChange={(event) => setPlaceId(event.target.value)} disabled={loadingPlaces} required className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-50">
                  <option value="">{loadingPlaces ? "Carregando locais..." : places.length === 0 ? "Nenhum local cadastrado" : "Selecione um local"}</option>
                  {places.map((place) => <option key={place.id} value={place.id}>{place.placeName} · {place.park} · {place.section}</option>)}
                </select>
              </label>
              <button type="button" onClick={() => setShowTemporaryPlace((current) => !current)} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-800 hover:text-primary-950">
                {showTemporaryPlace ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
                {showTemporaryPlace ? "Cancelar novo local" : "Criar local temporário"}
              </button>
            </div>

            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Número de posições *</span>
              <Input type="number" min={1} step={1} value={numbersVacancies} onChange={(event) => setNumbersVacancies(Number(event.target.value))} required />
            </label>

            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Descrição *</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={6} required placeholder="Descreva as atividades e o perfil esperado..." className="w-full resize-y rounded-md border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </label>

            {showTemporaryPlace && (
              <div className="space-y-4 rounded-lg border border-dashed border-primary-300 bg-primary-50/40 p-4 sm:col-span-2">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary-800" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Novo local temporário</h3>
                    <p className="text-xs text-slate-500">O local será cadastrado na API e selecionado automaticamente.</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="space-y-1.5 sm:col-span-3">
                    <span className="text-xs font-semibold text-slate-700">Nome do local</span>
                    <Input value={temporaryPlaceName} onChange={(event) => setTemporaryPlaceName(event.target.value)} placeholder="Ex.: Sala temporária 01" />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-700">Parque</span>
                    <select value={temporaryPark} onChange={(event) => setTemporaryPark(event.target.value as "WEG_I" | "WEG_II")} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
                      <option value="WEG_I">WEG I</option>
                      <option value="WEG_II">WEG II</option>
                    </select>
                  </label>
                  <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-xs font-semibold text-slate-700">Seção</span>
                    <Input value={temporarySection} onChange={(event) => setTemporarySection(event.target.value)} placeholder="Ex.: IT" />
                  </label>
                </div>
                <div className="flex justify-end">
                  <Button type="button" onClick={() => void handleCreateTemporaryPlace()} disabled={creatingPlace} className="bg-primary-900 text-white">
                    <MapPin className="size-4" /> {creatingPlace ? "Criando local..." : "Criar e selecionar local"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Button type="button" variant="outline" onClick={() => router.push("/manager/vacancies")}>Cancelar</Button>
            <Button type="submit" disabled={submitting || loadingPlaces || !placeId || creatingPlace} className="bg-primary-900 text-white">
              {submitting ? "Criando..." : "Criar vaga"}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
