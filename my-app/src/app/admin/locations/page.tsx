"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Edit, MapPin, Plus, RefreshCw, Trash2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPlace,
  deletePlace,
  getPlaces,
  updatePlace,
  type Place,
  type PlaceInput,
} from "@/lib/manager-api";

const initialForm: PlaceInput = {
  placeName: "",
  park: "WEG_I",
  section: "IT",
};

export default function AdminLocationsPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [form, setForm] = useState<PlaceInput>(initialForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPlaces(await getPlaces());
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar os locais."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getPlaces()
      .then((data) => active && setPlaces(data))
      .catch((requestError) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Não foi possível carregar os locais."
          );
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const openEditDialog = (place: Place) => {
    setEditingPlace(place);
    setForm({
      placeName: place.placeName,
      park: place.park === "WEG_II" ? "WEG_II" : "WEG_I",
      section: place.section,
    });
    setError("");
    setDialogOpen(true);
  };

  const closeEditDialog = () => {
    setDialogOpen(false);
    setEditingPlace(null);
    setForm(initialForm);
    setError("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.placeName.trim() || !form.section.trim()) {
      setError("Informe o nome e a seção do local.");
      return;
    }

    const payload: PlaceInput = {
      ...form,
      placeName: form.placeName.trim(),
      section: form.section.trim(),
    };

    setSaving(true);
    try {
      // Mantém a lista em sincronia com a API, sem depender de dados mockados.
      if (editingPlace) {
        const updated = await updatePlace(editingPlace.id, payload);
        setPlaces((current) =>
          current.map((place) => (place.id === updated.id ? updated : place))
        );
        setNotice(`Local “${updated.placeName}” atualizado.`);
        setDialogOpen(false);
        setEditingPlace(null);
        setForm(initialForm);
      } else {
        const created = await createPlace(payload);
        setPlaces((current) => [...current, created]);
        setNotice(
          `Local “${created.placeName}” criado. Ele já está disponível para novas vagas.`
        );
        setForm(initialForm);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível salvar o local."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (place: Place) => {
    if (
      !window.confirm(
        `Excluir o local “${place.placeName}”? Locais associados a vagas podem não ser removidos.`
      )
    ) {
      return;
    }

    setDeletingId(place.id);
    setError("");
    setNotice("");
    try {
      await deletePlace(place.id);
      setPlaces((current) => current.filter((item) => item.id !== place.id));
      setNotice("Local excluído com sucesso.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível excluir o local."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const columns: DataTableColumn<Place>[] = [
    {
      key: "placeName",
      header: "Local",
      sortable: true,
      render: (place) => (
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary-50 p-2 text-primary-700">
            <MapPin className="size-4" />
          </div>
          <p className="font-semibold text-slate-900">{place.placeName}</p>
        </div>
      ),
    },
    {
      key: "park",
      header: "Parque",
      sortable: true,
      render: (place) => (
        <Badge variant="info">
          {place.park === "WEG_II" ? "WEG II" : "WEG I"}
        </Badge>
      ),
    },
    {
      key: "section",
      header: "Seção",
      sortable: true,
      render: (place) => (
        <span className="font-medium text-slate-700">{place.section}</span>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (place) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => openEditDialog(place)}>
            <Edit className="size-3.5" /> Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={deletingId === place.id}
            onClick={() => void handleDelete(place)}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="size-3.5" />
            {deletingId === place.id ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Locais" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Gerenciar locais"
          description="Locais cadastrados aqui ficam disponíveis na criação de vagas do gestor"
          actions={
            <Button variant="outline" onClick={() => void loadPlaces()} disabled={loading}>
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          }
        />

        {error && !dialogOpen && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {notice}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-500 shadow-sm">
                Carregando locais...
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={places}
                pageSize={10}
                searchable
                searchPlaceholder="Buscar por nome, parque ou seção..."
                searchKeys={["placeName", "park", "section"]}
                emptyTitle="Nenhum local cadastrado"
                emptyDescription="Crie um local para disponibilizá-lo nas vagas do gestor."
                getRowKey={(row) => row.id}
              />
            )}
          </div>

          <div className="sticky top-6 h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Novo Local</h2>
              <p className="text-xs text-slate-500">Cadastre um local para disponibilizá-lo nas vagas do gestor.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="new-place-name" className="text-xs font-semibold text-slate-700">
                  Nome do Local <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="new-place-name"
                  value={form.placeName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, placeName: event.target.value }))
                  }
                  placeholder="Ex: Centro de treinamento"
                  className="mt-1 h-10 border-slate-200 text-sm"
                  required
                />
              </div>

              <div>
                <Label htmlFor="new-place-park" className="text-xs font-semibold text-slate-700">
                  Parque <span className="text-red-500">*</span>
                </Label>
                <select
                  id="new-place-park"
                  value={form.park}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      park: event.target.value as "WEG_I" | "WEG_II",
                    }))
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="WEG_I">WEG I</option>
                  <option value="WEG_II">WEG II</option>
                </select>
              </div>

              <div>
                <Label htmlFor="new-place-section" className="text-xs font-semibold text-slate-700">
                  Seção <span className="text-red-500">*</span>
                </Label>
                <select
                  id="new-place-section"
                  value={form.section}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, section: event.target.value }))
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="IT">Tecnologia da Informação</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={saving || Boolean(editingPlace)}
                className="mt-2 h-10 w-full gap-2 bg-primary-900 text-white hover:bg-primary-950"
              >
                <Plus className="size-4" /> {saving && !editingPlace ? "Criando..." : "Criar Local"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="bg-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlace ? "Editar local" : "Criar novo local"}</DialogTitle>
            <DialogDescription>
              Este local será utilizado pelo gestor ao cadastrar uma vaga.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Nome do local *</span>
              <Input
                value={form.placeName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, placeName: event.target.value }))
                }
                placeholder="Ex.: Centro de treinamento"
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Parque *</span>
                <select
                  value={form.park}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      park: event.target.value as "WEG_I" | "WEG_II",
                    }))
                  }
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="WEG_I">WEG I</option>
                  <option value="WEG_II">WEG II</option>
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Seção *</span>
                <select
                  value={form.section}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, section: event.target.value }))
                  }
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  required
                >
                  <option value="IT">Tecnologia da Informação</option>
                </select>
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEditDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-primary-900 text-white">
                {saving ? "Salvando..." : editingPlace ? "Salvar alterações" : "Criar local"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
