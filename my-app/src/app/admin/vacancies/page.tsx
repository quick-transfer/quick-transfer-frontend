"use client";

import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { mockVacancies } from "@/lib/mock-data";
import type { VacancyDTO } from "@/types";
import { Edit, Trash2, Plus } from "lucide-react";
import { deleteAdminVacancy, getAdminVacancies, updateAdminVacancy } from '@/lib/application-api';

export default function VagasPage() {
  const [vacancies, setVacancies] = useState<VacancyDTO[]>(mockVacancies);
  const [editingVacancy, setEditingVacancy] = useState<VacancyDTO | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingVacancy, setDeletingVacancy] = useState<VacancyDTO | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminVacancies().then(setVacancies).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar as vagas.');
    });
  }, []);

  // Form state para edição / criação
  const [formTitle, setFormTitle] = useState("");
  const [formDepartment, setFormDepartment] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formTotalSpots, setFormTotalSpots] = useState(1);
  const [formStatus, setFormStatus] = useState<"OPEN" | "CLOSED" | "URGENT">("OPEN");

  const openEdit = (vac: VacancyDTO) => {
    setEditingVacancy(vac);
    setFormTitle(vac.title);
    setFormDepartment(vac.department);
    setFormLocation(vac.location);
    setFormTotalSpots(vac.totalSpots);
    setFormStatus(vac.status);
    setIsEditOpen(true);
  };

  const openDelete = (vac: VacancyDTO) => {
    setDeletingVacancy(vac);
    setIsDeleteOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingVacancy) return;
    setSaving(true);
    setError('');
    try {
      const saved = await updateAdminVacancy({
        ...editingVacancy, title: formTitle.trim(), department: formDepartment.trim(),
        location: formLocation.trim(), totalSpots: formTotalSpots, status: formStatus,
      });
      setVacancies((prev) => prev.map((item) => item.id === saved.id ? saved : item));
      setIsEditOpen(false);
      setSuccessMsg('Vaga atualizada com sucesso!');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível atualizar a vaga.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = () => {
    if (!formTitle.trim()) return;
    const newVac: VacancyDTO = {
      id: `vac-${Date.now()}`,
      title: formTitle,
      department: formDepartment,
      location: formLocation,
      totalSpots: formTotalSpots,
      filledSpots: 0,
      status: formStatus,
    };
    setVacancies((prev) => [...prev, newVac]);
    setIsNewOpen(false);
    setSuccessMsg("Vaga criada com sucesso!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleConfirmDelete = async () => {
    if (!deletingVacancy) return;
    setSaving(true);
    setError('');
    try {
      await deleteAdminVacancy(deletingVacancy.id);
    setVacancies((prev) => prev.filter((v) => v.id !== deletingVacancy.id));
    setIsDeleteOpen(false);
    setSuccessMsg(`Vaga "${deletingVacancy.title}" excluída com sucesso.`);
    setTimeout(() => setSuccessMsg(""), 4000);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Não foi possível excluir a vaga.');
    } finally {
      setSaving(false);
    }
  };

  const columns: DataTableColumn<VacancyDTO>[] = [
    {
      key: "title",
      header: "Título da Vaga",
      sortable: true,
      render: (vac) => (
        <div className="flex items-center gap-3">
          <div>
            <p className="font-medium text-foreground">{vac.title}</p>
            <p className="text-xs text-muted-foreground">{vac.department}</p>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Localização",
      render: (vac) => (
        <span className="text-sm font-medium text-foreground">{vac.location}</span>
      ),
    },
    {
      key: "spots",
      header: "Vagas Preenchidas",
      render: (vac) => (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-foreground">
            {vac.filledSpots} / {vac.totalSpots} vagas
          </span>
          <div className="h-1.5 w-28 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-600"
              style={{ width: `${Math.round((vac.filledSpots / vac.totalSpots) * 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (vac) => {
        if (vac.status === "OPEN") return <Badge variant="success">Aberta</Badge>;
        if (vac.status === "URGENT") return <Badge variant="danger">Urgente</Badge>;
        return <Badge variant="neutral">Fechada</Badge>;
      },
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (vac) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Editar vaga"
            onClick={() => openEdit(vac)}
          >
            <Edit className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive hover:bg-red-50"
            aria-label="Excluir vaga"
            onClick={() => openDelete(vac)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Vagas" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Gerenciar Vagas"
          description="Abertura e controle de vagas para estagiários e aprendizes nas unidades"
          actions={
            <Button
              className="gap-2 bg-primary text-white hover:bg-primary-700"
              // The manager form provides all fields required by the API.
              onClick={() => window.location.assign(`/manager/vacancies/new`)}
            >
              <Plus className="size-4" /> Nova Vaga
            </Button>
          }
        />

        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <DataTable
          columns={columns}
          data={vacancies}
          pageSize={10}
          searchable
          searchPlaceholder="Buscar por título ou departamento..."
          searchKeys={["title", "department", "location"]}
          getRowKey={(row) => row.id}
        />
      </div>

      {/* Modal Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Editar Vaga</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Altere as informações da vaga e salve para atualizar o sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Título da Vaga</label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="h-10 border-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Departamento</label>
                <Input value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)} className="h-10 border-slate-200" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Localização</label>
                <Input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="h-10 border-slate-200" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Total de Vagas</label>
                <Input type="number" min={1} value={formTotalSpots} onChange={(e) => setFormTotalSpots(Number(e.target.value))} className="h-10 border-slate-200" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "OPEN" | "CLOSED" | "URGENT")}
                  className="h-10 w-full px-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="OPEN">Aberta</option>
                  <option value="URGENT">Urgente</option>
                  <option value="CLOSED">Fechada</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={() => void handleSaveEdit()} disabled={saving} className="bg-primary-900 text-white hover:bg-primary-950">{saving ? 'Salvando...' : 'Salvar Alterações'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Nova Vaga */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Nova Vaga</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Preencha as informações para abrir uma nova vaga no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Título da Vaga <span className="text-red-500">*</span></label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Ex: Aprendiz de Montagem Elétrica" className="h-10 border-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Departamento</label>
                <Input value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)} placeholder="Ex: Produção" className="h-10 border-slate-200" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Localização</label>
                <Input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} placeholder="Ex: Unidade Fabril 1" className="h-10 border-slate-200" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Total de Vagas</label>
                <Input type="number" min={1} value={formTotalSpots} onChange={(e) => setFormTotalSpots(Number(e.target.value))} className="h-10 border-slate-200" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as "OPEN" | "CLOSED" | "URGENT")}
                  className="h-10 w-full px-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="OPEN">Aberta</option>
                  <option value="URGENT">Urgente</option>
                  <option value="CLOSED">Fechada</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!formTitle.trim()} className="bg-primary-900 text-white hover:bg-primary-950">Criar Vaga</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmação Exclusão */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-sm bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Confirmar Exclusão</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Deseja realmente excluir a vaga <strong className="text-slate-800">{deletingVacancy?.title}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => void handleConfirmDelete()}
              disabled={saving}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast de sucesso */}
      {successMsg && (
        <div className="fixed top-20 right-6 z-50 max-w-sm p-4 bg-emerald-800 text-white rounded-lg shadow-xl text-sm font-medium">
          {successMsg}
        </div>
      )}
    </AppShell>
  );
}
