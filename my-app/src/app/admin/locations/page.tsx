"use client";

import { FormEvent, useEffect, useState } from "react";
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
import {
  createPlace,
  deletePlace,
  getPlaces,
  updatePlace,
  type PlacePayload,
  type PlaceResponse,
} from "@/lib/core-api";
import { Edit, Plus, Trash2 } from "lucide-react";

const emptyForm: PlacePayload = {
  placeName: "",
  code: "",
  description: "",
  city: "",
  state: "",
  park: "WEG_I",
  section: "IT",
  status: "ACTIVE",
};

export default function LocaisPage() {
  const [places, setPlaces] = useState<PlaceResponse[]>([]);
  const [editing, setEditing] = useState<PlaceResponse | null>(null);
  const [form, setForm] = useState<PlacePayload>(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    getPlaces({ size: 200, sort: "placeName,asc" })
      .then((response) => mounted && setPlaces(response))
      .catch((requestError) => {
        if (mounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Não foi possível carregar os locais.",
          );
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (place: PlaceResponse) => {
    setEditing(place);
    setForm({
      placeName: place.placeName,
      code: place.code,
      description: place.description ?? "",
      city: place.city ?? "",
      state: place.state ?? "",
      park: place.park,
      section: place.section,
      status: place.status,
    });
    setError("");
    setDialogOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        ...form,
        placeName: form.placeName.trim(),
        code: form.code.trim(),
        state: form.state?.trim().toUpperCase(),
      };
      const saved = editing
        ? await updatePlace(editing.id, payload)
        : await createPlace(payload);
      setPlaces((current) =>
        [...current.filter((place) => place.id !== saved.id), saved].sort((a, b) =>
          a.placeName.localeCompare(b.placeName),
        ),
      );
      setDialogOpen(false);
      setNotice(`Local ${editing ? "atualizado" : "criado"} com sucesso.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível salvar o local.",
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (place: PlaceResponse) => {
    if (!window.confirm(`Excluir o local "${place.placeName}"?`)) return;
    setError("");
    try {
      await deletePlace(place.id);
      setPlaces((current) => current.filter((item) => item.id !== place.id));
      setNotice(`Local "${place.placeName}" excluído com sucesso.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível excluir o local.",
      );
    }
  };

  const columns: DataTableColumn<PlaceResponse>[] = [
    {
      key: "placeName",
      header: "Unidade / Local",
      sortable: true,
      render: (place) => (
        <div>
          <p className="font-medium text-foreground">{place.placeName}</p>
          <p className="text-xs text-muted-foreground">{place.description || "Sem descrição"}</p>
        </div>
      ),
    },
    {
      key: "code",
      header: "Código",
      render: (place) => <span className="font-mono text-xs font-semibold">{place.code}</span>,
    },
    {
      key: "location",
      header: "Cidade / UF",
      render: (place) => <span className="text-sm">{place.city || "—"}{place.state ? ` - ${place.state}` : ""}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (place) =>
        place.status === "ACTIVE" ? (
          <Badge variant="success">Ativo</Badge>
        ) : (
          <Badge variant="neutral">Inativo</Badge>
        ),
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (place) => (
        <div className="flex justify-end gap-1">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => openEdit(place)}>
            <Edit className="size-3.5" /> Editar
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => void remove(place)}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Locais" }]}>
      <div className="space-y-6">
        <PageHeader
          title="Gerenciar Locais Fabris"
          description="Unidades de produção e centros de formação integrados ao sistema"
          actions={
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="size-4" /> Novo Local
            </Button>
          }
        />

        {error && !dialogOpen && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}

        <DataTable
          columns={columns}
          data={places}
          pageSize={10}
          searchable
          searchPlaceholder="Buscar local por nome ou cidade..."
          searchKeys={["placeName", "city", "code"]}
          getRowKey={(row) => row.id}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !saving && setDialogOpen(open)}>
        <DialogContent className="sm:max-w-xl">
          <form onSubmit={submit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar local" : "Novo local"}</DialogTitle>
              <DialogDescription>Informe os dados usados para identificar a unidade.</DialogDescription>
            </DialogHeader>
            {error && <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div className="grid gap-3 sm:grid-cols-2">
              <Input required placeholder="Nome" value={form.placeName} onChange={(event) => setForm({ ...form, placeName: event.target.value })} />
              <Input required placeholder="Código" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
              <Input placeholder="Cidade" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
              <Input maxLength={2} placeholder="UF" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} />
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.park} onChange={(event) => setForm({ ...form, park: event.target.value as PlacePayload["park"] })}>
                <option value="WEG_I">WEG I</option>
                <option value="WEG_II">WEG II</option>
              </select>
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PlacePayload["status"] })}>
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
              </select>
              <Input className="sm:col-span-2" placeholder="Descrição" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
