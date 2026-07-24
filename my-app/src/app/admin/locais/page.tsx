"use client";

import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockPlaces } from "@/lib/mock-data";
import type { PlaceDTO } from "@/types";
import { Plus, Edit, MapPin } from "lucide-react";

export default function LocaisPage() {
  const columns: DataTableColumn<PlaceDTO>[] = [
    {
      key: "name",
      header: "Unidade / Local",
      sortable: true,
      render: (place) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
            <MapPin className="size-4" />
          </div>
          <div>
            <p className="font-medium text-foreground">{place.name}</p>
            <p className="text-xs text-muted-foreground">{place.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: "code",
      header: "Código",
      render: (place) => (
        <span className="font-mono text-xs font-semibold">{place.code}</span>
      ),
    },
    {
      key: "location",
      header: "Cidade / UF",
      render: (place) => (
        <span className="text-sm">{place.city} - {place.state}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (place) => (
        place.status === "ACTIVE" ? (
          <Badge variant="success">Ativo</Badge>
        ) : (
          <Badge variant="neutral">Inativo</Badge>
        )
      ),
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: () => (
        <Button variant="outline" size="sm" className="gap-1">
          <Edit className="size-3.5" /> Editar
        </Button>
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
          title="Gerenciar Locais Fabris"
          description="Unidades de produção e centros de formação integrados ao sistema"
          actions={
            <Button className="gap-2 bg-primary text-white hover:bg-primary-700">
              <Plus className="size-4" /> Novo Local
            </Button>
          }
        />

        <DataTable
          columns={columns}
          data={mockPlaces}
          pageSize={10}
          searchable
          searchPlaceholder="Buscar local por nome ou cidade..."
          searchKeys={["name", "city", "code"]}
          getRowKey={(row) => row.id}
        />
      </div>
    </AppShell>
  );
}
