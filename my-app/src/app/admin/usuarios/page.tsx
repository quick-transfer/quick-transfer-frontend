"use client";

import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockUsers } from "@/lib/mock-data";
import type { UserDTO } from "@/types";
import { UserPlus, Edit, Trash2 } from "lucide-react";

export default function UsuariosPage() {
  const columns: DataTableColumn<UserDTO>[] = [
    {
      key: "name",
      header: "Usuário",
      sortable: true,
      render: (user) => {
        const initials = user.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("");
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary-600 text-white font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      header: "Papel / Função",
      sortable: true,
      render: (user) => {
        if (user.role === "ADMIN") return <Badge variant="danger">Administrador</Badge>;
        if (user.role === "COORDINATOR") return <Badge variant="info">Coordenador</Badge>;
        if (user.role === "MANAGER") return <Badge variant="warning">Gestor / Supervisor</Badge>;
        return <Badge variant="neutral">Aluno</Badge>;
      },
    },
    {
      key: "active",
      header: "Status",
      render: (user) => (
        user.active ? (
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
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Editar usuário">
            <Edit className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-destructive" aria-label="Excluir usuário">
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
        { label: "Usuários" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Gerenciamento de Usuários"
          description="Controle de acessos, perfis e permissões dos operadores do sistema"
          actions={
            <Button className="gap-2 bg-primary text-white hover:bg-primary-700">
              <UserPlus className="size-4" /> Novo Usuário
            </Button>
          }
        />

        <DataTable
          columns={columns}
          data={mockUsers}
          pageSize={10}
          searchable
          searchPlaceholder="Buscar por nome ou e-mail..."
          searchKeys={["name", "email"]}
          getRowKey={(row) => row.id}
        />
      </div>
    </AppShell>
  );
}
