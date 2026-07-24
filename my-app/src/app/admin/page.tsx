"use client";

import { AppShell, PageHeader } from "@/components/layout";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { mockUsers, mockPlaces, mockCourses, mockVacancies } from "@/lib/mock-data";
import { Users, MapPin, BookOpen, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const adminModules = [
    { title: "Usuários", href: "/admin/usuarios", count: `${mockUsers.length} usuários`, icon: Users, color: "bg-blue-500/10 text-blue-600" },
    { title: "Locais Fabris", href: "/admin/locais", count: `${mockPlaces.length} unidades`, icon: MapPin, color: "bg-green-500/10 text-green-600" },
    { title: "Cursos Técnicos", href: "/admin/cursos", count: `${mockCourses.length} cursos`, icon: BookOpen, color: "bg-purple-500/10 text-purple-600" },
    { title: "Vagas Abertas", href: "/admin/vagas", count: `${mockVacancies.length} vagas`, icon: Briefcase, color: "bg-amber-500/10 text-amber-600" },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Painel de Administração" }]}>
      <div className="space-y-6">
        <PageHeader
          title="Painel de Administração"
          description="Gestão central de parâmetros do sistema, controle de acesso, cadastros e vagas"
        />

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total de Usuários" value={mockUsers.length} icon={Users} />
          <StatCard label="Unidades Fabris" value={mockPlaces.length} icon={MapPin} />
          <StatCard label="Cursos Ativos" value={mockCourses.length} icon={BookOpen} />
          <StatCard label="Vagas Gerenciadas" value={mockVacancies.length} icon={Briefcase} />
        </div>

        {/* Quick Nav Modules */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {adminModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Card key={mod.title} className="border-border shadow-sm hover:shadow-md transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-semibold">{mod.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${mod.color}`}>
                    <Icon className="size-5" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground">{mod.count}</p>
                  <Link
                    href={mod.href}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full gap-1 justify-between")}
                  >
                    Acessar módulo <ArrowRight className="size-3.5" />
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
