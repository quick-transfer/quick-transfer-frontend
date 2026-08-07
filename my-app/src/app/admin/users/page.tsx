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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createCoordinator,
  createManager,
  deleteCoordinator,
  deleteManager,
  getManagers,
  getCoordinators,
  type Coordinator,
  type CoordinatorInput,
  type Manager,
  type ManagerInput,
  type ManagerSection,
  updateCoordinator,
  updateManager,
} from "@/lib/manager-api";
import { deleteAppUser, getAppUsers, updateAppUser } from '@/lib/application-api';
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
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [form, setForm] = useState<CreateUserForm>(initialUserForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserDTO | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [actionSaving, setActionSaving] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([getManagers(), getCoordinators(), getAppUsers()])
      .then(([managers, coordinators, appUsers]) => {
        if (!active) return;
        setUsers([
          ...appUsers.filter((user) => user.role === "ADMIN"),
          ...managers.map(managerToUser),
          ...coordinators.map(coordinatorToUser),
        ]);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar os usuários.",
        );
      });

    return () => {
      active = false;
    };
  }, []);

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

  const openEditDialog = (user: UserDTO) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setError('');
  };

  const handleEditUser = async () => {
    if (!editingUser || !editName.trim()) return;
    setActionSaving(true);
    setError('');
    try {
      let updated: UserDTO;
      if (editingUser.role === 'MANAGER') {
        updated = managerToUser(await updateManager(editingUser.id, {
          name: editName.trim(), email: editEmail.trim(), section: 'IT',
        }));
      } else if (editingUser.role === 'COORDINATOR') {
        updated = coordinatorToUser(await updateCoordinator(editingUser.id, {
          name: editName.trim(), email: editEmail.trim(),
        }));
      } else {
        updated = await updateAppUser({ ...editingUser, name: editName.trim(), email: editEmail.trim() });
      }
      setUsers((current) => current.map((user) => user.id === updated.id ? updated : user));
      setEditingUser(null);
      setNotice('Usuário atualizado com sucesso.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível atualizar o usuário.');
    } finally {
      setActionSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setActionSaving(true);
    setError('');
    try {
      if (deletingUser.role === 'MANAGER') await deleteManager(deletingUser.id);
      else if (deletingUser.role === 'COORDINATOR') await deleteCoordinator(deletingUser.id);
      else await deleteAppUser(deletingUser.id);
      setUsers((current) => current.filter((user) => user.id !== deletingUser.id));
      setNotice('Usuário excluído com sucesso.');
      setDeletingUser(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Não foi possível excluir o usuário.');
    } finally {
      setActionSaving(false);
    }
  };

  const columns: DataTableColumn<UserDTO>[] = [
    {
      key: "name",
      header: "Usuário",
      sortable: true,
      render: (user) => (
          <div className="flex items-center gap-3">
            <div>
              <p className="font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
      ),
    },
    {
      key: "role",
      header: "Papel / Função",
      sortable: true,
      render: (user) => {
        if (user.role === "ADMIN") return <Badge variant="danger">Administrador</Badge>;
        if (user.role === "COORDINATOR") return <Badge variant="info">Coordenador</Badge>;
        if (user.role === "MANAGER") return <Badge variant="warning">Gestor / Supervisor</Badge>;
        return <Badge variant="neutral">Perfil desconhecido</Badge>;
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
      render: (user) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Editar usuário" onClick={() => openEditDialog(user)}>
            <Edit className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive"
            aria-label="Excluir usuário"
            onClick={() => setDeletingUser(user)}
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
        />

        {error && (
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

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
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

          <div className="sticky top-6 h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Criar Usuário</h2>
              <p className="text-xs text-slate-500">Cadastre as credenciais para o primeiro acesso.</p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <fieldset>
                <legend className="mb-1 text-xs font-semibold text-slate-700">
                  Tipo de Usuário <span className="text-red-500">*</span>
                </legend>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={form.role === "MANAGER" ? "default" : "outline"}
                  aria-pressed={form.role === "MANAGER"}
                  onClick={() => updateForm("role", "MANAGER")}
                  disabled={saving}
                  className="h-10 text-sm"
                >
                  Gestor
                </Button>
                <Button
                  type="button"
                  variant={form.role === "COORDINATOR" ? "default" : "outline"}
                  aria-pressed={form.role === "COORDINATOR"}
                  onClick={() => updateForm("role", "COORDINATOR")}
                  disabled={saving}
                  className="h-10 text-sm"
                >
                  Coordenador
                </Button>
              </div>
              </fieldset>

              <label className="block">
                <span className="text-xs font-semibold text-slate-700">
                  Nome Completo <span className="text-red-500">*</span>
                </span>
                <Input
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  autoComplete="name"
                  maxLength={100}
                  disabled={saving}
                  placeholder="Ex: Maria da Silva"
                  className="mt-1 h-10 border-slate-200 text-sm"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-700">
                  Usuário <span className="text-red-500">*</span>
                </span>
                <Input
                  value={form.username}
                  onChange={(event) => updateForm("username", event.target.value)}
                  autoComplete="username"
                  maxLength={100}
                  disabled={saving}
                  placeholder="Ex: maria.silva"
                  className="mt-1 h-10 border-slate-200 text-sm"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-700">
                  E-mail <span className="text-red-500">*</span>
                </span>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateForm("email", event.target.value)}
                  autoComplete="email"
                  disabled={saving}
                  placeholder="Ex: maria.silva@email.com"
                  className="mt-1 h-10 border-slate-200 text-sm"
                  required
                />
              </label>

              {form.role === "MANAGER" && (
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">
                    Seção <span className="text-red-500">*</span>
                  </span>
                  <Select
                    value={form.section}
                    onValueChange={(value) =>
                      updateForm("section", (value ?? "IT") as ManagerSection)
                    }
                    disabled={saving}
                    required
                  >
                    <SelectTrigger className="mt-1 h-10 w-full border-slate-200 text-sm">
                      <SelectValue placeholder="Selecione a seção" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Valores mantidos iguais ao enum Section do backend. */}
                      <SelectItem value="IT">Tecnologia da Informação</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              )}

              <label className="block">
                <span className="text-xs font-semibold text-slate-700">
                  Senha Inicial <span className="text-red-500">*</span>
                </span>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(event) => updateForm("password", event.target.value)}
                  autoComplete="new-password"
                  minLength={14}
                  disabled={saving}
                  className="mt-1 h-10 border-slate-200 text-sm"
                  required
                />
              </label>

              <p className="text-xs text-slate-500">{PASSWORD_REQUIREMENTS}</p>

              <Button
                type="submit"
                disabled={saving}
                className="mt-2 h-10 w-full gap-2 bg-primary-900 text-white hover:bg-primary-950"
              >
                <UserPlus className="size-4" />
                {saving
                  ? "Criando..."
                  : form.role === "MANAGER"
                    ? "Criar gestor"
                    : "Criar coordenador"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
            <DialogDescription>Atualize os dados cadastrais do usuário.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <label className="block space-y-1.5 text-sm font-medium">
              Nome
              <Input value={editName} onChange={(event) => setEditName(event.target.value)} />
            </label>
            <label className="block space-y-1.5 text-sm font-medium">
              E-mail <span className="text-xs font-normal text-muted-foreground">(somente leitura)</span>
              <Input type="email" value={editEmail} disabled />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
            <Button onClick={() => void handleEditUser()} disabled={actionSaving || !editName.trim()}>
              {actionSaving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingUser)} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <DialogContent className="bg-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir usuário</DialogTitle>
            <DialogDescription>Confirma a exclusão de {deletingUser?.name}? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)}>Cancelar</Button>
            <Button onClick={() => void handleDeleteUser()} disabled={actionSaving} className="bg-red-600 text-white hover:bg-red-700">
              {actionSaving ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
