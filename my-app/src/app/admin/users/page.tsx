"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockUsers } from "@/lib/mock-data";
import {
  createCoordinator,
  createManager,
  getManagers,
  type Coordinator,
  type CoordinatorInput,
  type Manager,
  type ManagerInput,
  type ManagerSection,
} from "@/lib/manager-api";
import type { UserDTO } from "@/types";
import { UserPlus, Edit, Trash2 } from "lucide-react";

type CreatableUserRole = "MANAGER" | "COORDINATOR";

type CreateUserForm = CoordinatorInput & {
  role: CreatableUserRole;
  section: ManagerSection;
};

const initialUserForm: CreateUserForm = {
  role: "MANAGER",
  name: "",
  username: "",
  email: "",
  password: "",
  section: "IT",
};

const PASSWORD_REQUIREMENTS =
  "A senha deve ter no mínimo 14 caracteres, com letra maiúscula, minúscula, número e caractere especial.";

// A API de gestores não devolve status de atividade, então novos gestores são exibidos como ativos.
function managerToUser(manager: Manager): UserDTO {
  return {
    id: manager.id,
    name: manager.name,
    email: manager.email,
    role: "MANAGER",
    active: true,
  };
}

function coordinatorToUser(coordinator: Coordinator): UserDTO {
  return {
    id: coordinator.id,
    name: coordinator.name,
    email: coordinator.email,
    role: "COORDINATOR",
    active: true,
  };
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserDTO[]>(mockUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateUserForm>(initialUserForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    // Enquanto os demais perfis usam mocks, substituímos somente os gestores pelos dados reais da API.
    getManagers()
      .then((managers) => {
        if (!active) return;
        setUsers([
          ...mockUsers.filter((user) => user.role !== "MANAGER"),
          ...managers.map(managerToUser),
        ]);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar os gestores.",
        );
      });

    return () => {
      active = false;
    };
  }, []);

  const openCreateDialog = () => {
    setForm(initialUserForm);
    setError("");
    setNotice("");
    setDialogOpen(true);
  };

  const updateForm = <Field extends keyof CreateUserForm,>(
    field: Field,
    value: CreateUserForm[Field],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const commonPayload: CoordinatorInput = {
      name: form.name.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
    };

    if (
      !commonPayload.name ||
      !commonPayload.username ||
      !commonPayload.email ||
      !commonPayload.password ||
      (form.role === "MANAGER" && !form.section)
    ) {
      setError("Preencha todos os campos para criar o usuário.");
      return;
    }

    // Replica a regra dos DTOs de gestor e coordenador antes de chamar o backend.
    const passwordIsValid =
      commonPayload.password.length >= 14 &&
      /[A-Z]/.test(commonPayload.password) &&
      /[a-z]/.test(commonPayload.password) &&
      /\d/.test(commonPayload.password) &&
      /[^A-Za-z0-9]/.test(commonPayload.password);

    if (!passwordIsValid) {
      setError(PASSWORD_REQUIREMENTS);
      return;
    }

    setSaving(true);
    try {
      const createdUser =
        form.role === "MANAGER"
          ? managerToUser(
              await createManager({
                ...commonPayload,
                section: form.section,
              } satisfies ManagerInput),
            )
          : coordinatorToUser(await createCoordinator(commonPayload));

      setUsers((current) => [
        ...current.filter((user) => user.id !== createdUser.id),
        createdUser,
      ]);
      const roleLabel = form.role === "MANAGER" ? "Gestor" : "Coordenador";
      setNotice(`${roleLabel} “${createdUser.name}” criado com sucesso.`);
      setDialogOpen(false);
      setForm(initialUserForm);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível criar o usuário.",
      );
    } finally {
      setSaving(false);
    }
  };

  const columns: DataTableColumn<UserDTO>[] = [
    {
      key: "name",
      header: "Usuário",
      sortable: true,
      render: (user) => {
        const initials = user.name
          .split(" ")
          .map((namePart) => namePart[0])
          .slice(0, 2)
          .join("");
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary-600 text-xs font-semibold text-white">
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
      render: (user) =>
        user.active ? (
          <Badge variant="success">Ativo</Badge>
        ) : (
          <Badge variant="neutral">Inativo</Badge>
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
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive"
            aria-label="Excluir usuário"
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
        { label: "Usuários" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Gerenciamento de Usuários"
          description="Controle de acessos, perfis e permissões dos operadores do sistema"
          actions={
            <Button
              onClick={openCreateDialog}
              className="gap-2 bg-primary text-white hover:bg-primary-700"
            >
              <UserPlus className="size-4" /> Criar usuário
            </Button>
          }
        />

        {error && !dialogOpen && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}
        {notice && (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            {notice}
          </div>
        )}

        <DataTable
          columns={columns}
          data={users}
          pageSize={10}
          searchable
          searchPlaceholder="Buscar por nome ou e-mail..."
          searchKeys={["name", "email"]}
          getRowKey={(row) => row.id}
        />
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (saving) return;
          setDialogOpen(open);
          if (!open) setError("");
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreateUser} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Criar usuário</DialogTitle>
              <DialogDescription>
                Selecione o tipo de usuário e cadastre as credenciais para o primeiro acesso.
              </DialogDescription>
            </DialogHeader>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Tipo de usuário</legend>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={form.role === "MANAGER" ? "default" : "outline"}
                  aria-pressed={form.role === "MANAGER"}
                  onClick={() => updateForm("role", "MANAGER")}
                  disabled={saving}
                  className="h-10"
                >
                  Gestor
                </Button>
                <Button
                  type="button"
                  variant={form.role === "COORDINATOR" ? "default" : "outline"}
                  aria-pressed={form.role === "COORDINATOR"}
                  onClick={() => updateForm("role", "COORDINATOR")}
                  disabled={saving}
                  className="h-10"
                >
                  Coordenador
                </Button>
              </div>
            </fieldset>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium">
                <span>Nome completo</span>
                <Input
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  autoComplete="name"
                  maxLength={100}
                  disabled={saving}
                  required
                />
              </label>

              <label className="space-y-1.5 text-sm font-medium">
                <span>Usuário</span>
                <Input
                  value={form.username}
                  onChange={(event) => updateForm("username", event.target.value)}
                  autoComplete="username"
                  maxLength={100}
                  disabled={saving}
                  required
                />
              </label>

              <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
                <span>E-mail</span>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateForm("email", event.target.value)}
                  autoComplete="email"
                  disabled={saving}
                  required
                />
              </label>

              {form.role === "MANAGER" && (
                <label className="space-y-1.5 text-sm font-medium">
                  <span>Seção</span>
                  <Select
                    value={form.section}
                    onValueChange={(value) =>
                      updateForm("section", (value ?? "IT") as ManagerSection)
                    }
                    disabled={saving}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a seção" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Valores mantidos iguais ao enum Section do backend. */}
                      <SelectItem value="IT">Tecnologia da Informação</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              )}

              <label
                className={`space-y-1.5 text-sm font-medium ${
                  form.role === "COORDINATOR" ? "sm:col-span-2" : ""
                }`}
              >
                <span>Senha inicial</span>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(event) => updateForm("password", event.target.value)}
                  autoComplete="new-password"
                  minLength={14}
                  disabled={saving}
                  required
                />
              </label>
            </div>

            <p className="text-xs text-muted-foreground">{PASSWORD_REQUIREMENTS}</p>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Criando..."
                  : form.role === "MANAGER"
                    ? "Criar gestor"
                    : "Criar coordenador"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
