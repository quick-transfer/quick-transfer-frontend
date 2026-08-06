"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  MapPin,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import { AppShell, PageHeader } from "@/components/layout";
import { StatCard } from "@/components/shared/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppUsers } from "@/lib/application-api";
import { cn } from "@/lib/utils";
import type { UserDTO } from "@/types";

const adminAreas = [
  {
    title: "Cursos",
    description: "Gerencie os cursos disponíveis para as turmas",
    href: "/admin/courses",
    icon: BookOpen,
    iconClassName: "bg-violet-500/10 text-violet-600",
  },
  {
    title: "Vagas",
    description: "Acompanhe as vagas cadastradas no sistema",
    href: "/admin/vacancies",
    icon: Briefcase,
    iconClassName: "bg-amber-500/10 text-amber-600",
  },
] as const;

export default function AdminPage() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getAppUsers()
      .then(setUsers)
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os usuários.");
      });
  }, []);

  const administrators = users.filter((user) => user.role === "ADMIN").length;
  const managers = users.filter((user) => user.role === "MANAGER").length;
  const coordinators = users.filter((user) => user.role === "COORDINATOR").length;

  return (
    <AppShell breadcrumbs={[{ label: "Painel de Administração" }]}>
      <div className="space-y-6">
        <PageHeader
          title="Painel de Administração"
          description="Gestão de contas, acessos, locais, cursos e vagas"
        />

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total de usuários" value={users.length} icon={Users} />
          <StatCard label="Administradores" value={administrators} icon={ShieldCheck} />
          <StatCard label="Gestores" value={managers} icon={UserCog} />
          <StatCard label="Coordenadores" value={coordinators} icon={Users} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Usuários</CardTitle>
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600"><Users className="size-5" /></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">{users.length} contas cadastradas</p>
              <Link
                href="/admin/users"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-between gap-1")}
              >
                Gerenciar usuários <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Locais</CardTitle>
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600"><MapPin className="size-5" /></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">Cadastre os locais disponíveis para as vagas</p>
              <Link
                href="/admin/locations"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-between gap-1")}
              >
                Gerenciar locais <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          {adminAreas.map((area) => {
            const Icon = area.icon;

            return (
              <Card key={area.href} className="border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-semibold">{area.title}</CardTitle>
                  <div className={`rounded-lg p-2 ${area.iconClassName}`}><Icon className="size-5" /></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground">{area.description}</p>
                  <Link
                    href={area.href}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-between gap-1")}
                  >
                    Gerenciar {area.title.toLowerCase()} <ArrowRight className="size-3.5" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
