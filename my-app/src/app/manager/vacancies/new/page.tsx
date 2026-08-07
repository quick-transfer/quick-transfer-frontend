"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
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
            : "Não foi possível carregar os locais."
        )
      )
      .finally(() => setLoadingPlaces(false));
  }, []);

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
      // A vaga só é considerada criada após a confirmação do backend.
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


        <div className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Abrir Nova Vaga</h2>
            <p className="text-xs text-slate-500">Preencha os dados da vaga para efetuar o cadastro.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Nome da Vaga <span className="text-red-500">*</span>
              </span>
              <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required placeholder="Ex: Aprendiz de manutenção" className="mt-1 h-10 border-slate-200 text-sm" />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Área <span className="text-red-500">*</span>
              </span>
              <select value={area} onChange={(event) => setArea(event.target.value as VacancyArea)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                {Object.entries(areaLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Turno <span className="text-red-500">*</span>
              </span>
              <select value={shift} onChange={(event) => setShift(event.target.value as VacancyShift)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                {Object.entries(shiftLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Local <span className="text-red-500">*</span>
              </span>
              <select value={placeId} onChange={(event) => setPlaceId(event.target.value)} disabled={loadingPlaces} required className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50">
                <option value="">{loadingPlaces ? "Carregando locais..." : places.length === 0 ? "Nenhum local cadastrado" : "Selecione um local"}</option>
                {places.map((place) => <option key={place.id} value={place.id}>{place.placeName} - {place.park} - {place.section}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Número de Posições <span className="text-red-500">*</span>
              </span>
              <Input type="number" min={1} step={1} value={numbersVacancies} onChange={(event) => setNumbersVacancies(Number(event.target.value))} required className="mt-1 h-10 border-slate-200 text-sm" />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Descrição <span className="text-red-500">*</span>
              </span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} required placeholder="Descreva as atividades e o perfil esperado..." className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </label>

            <Button type="submit" disabled={submitting || loadingPlaces || !placeId} className="mt-2 h-10 w-full gap-2 bg-primary-900 text-white hover:bg-primary-950">
              <Plus className="size-4" />
              {submitting ? "Criando..." : "Criar vaga"}
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
