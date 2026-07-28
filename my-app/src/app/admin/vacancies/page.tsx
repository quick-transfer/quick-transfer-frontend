"use client";

import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Fab } from "@/components/shared/fab";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockVacancies } from "@/lib/mock-data";
import type { VacancyDTO } from "@/types";
import { Briefcase, Edit, Trash2 } from "lucide-react";

export default function VagasPage() {
  const columns: DataTableColumn<VacancyDTO>[] = [
    {
      key: "title",
      header: "Título da Vaga",
      sortable: true,
      render: (vac) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
            <Briefcase className="size-4" />
          </div>
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
        <span className="text-xs font-semibold text-foreground">
          {vac.filledSpots} / {vac.totalSpots} vagas
        </span>
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
      render: () => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Editar vaga">
            <Edit className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-destructive" aria-label="Excluir vaga">
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
          title="Gerenciar Vagas (Manage Vacancies)"
          description="Abertura e controle de vagas para estagiários e aprendizes nas unidades"
        />

        <DataTable
          columns={columns}
          data={mockVacancies}
          pageSize={10}
          searchable
          searchPlaceholder="Buscar por título ou departamento..."
          searchKeys={["title", "department", "location"]}
          getRowKey={(row) => row.id}
        />

        {/* Floating Action Button (+) */}
        <Fab label="Nova Vaga" onClick={() => alert("Abrir formulário de nova vaga")} />
      </div>
    </AppShell>
  );
}
