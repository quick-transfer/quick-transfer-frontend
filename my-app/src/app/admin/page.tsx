"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Briefcase, MapPin, Users } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { StatCard } from "@/components/shared/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCourses, getPlaces, getUsers, getVacancies } from "@/lib/core-api";
import { cn } from "@/lib/utils";

interface AdminCounts { users: number; places: number; courses: number; vacancies: number; }

export default function AdminPage() {
  const [counts, setCounts] = useState<AdminCounts>({ users: 0, places: 0, courses: 0, vacancies: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getUsers({ size: 500 }),
      getPlaces({ size: 500 }),
      getCourses({ size: 500 }),
      getVacancies({ size: 500 }),
    ])
      .then(([users, places, courses, vacancies]) => mounted && setCounts({
        users: users.length,
        places: places.length,
        courses: courses.filter((course) => course.status === "ACTIVE").length,
        vacancies: vacancies.length,
      }))
      .catch((requestError) => mounted && setError(
        requestError instanceof Error ? requestError.message : "Não foi possível carregar o painel administrativo.",
      ));
    return () => { mounted = false; };
  }, []);

  const modules = [
    { title: "Usuários", href: "/admin/users", count: `${counts.users} usuários`, icon: Users, color: "bg-blue-500/10 text-blue-600" },
    { title: "Locais fabris", href: "/admin/locations", count: `${counts.places} unidades`, icon: MapPin, color: "bg-green-500/10 text-green-600" },
    { title: "Cursos técnicos", href: "/admin/courses", count: `${counts.courses} ativos`, icon: BookOpen, color: "bg-purple-500/10 text-purple-600" },
    { title: "Vagas", href: "/admin/vacancies", count: `${counts.vacancies} cadastradas`, icon: Briefcase, color: "bg-amber-500/10 text-amber-600" },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Painel de Administração" }]}>
      <div className="space-y-6">
        <PageHeader title="Painel de Administração" description="Gestão central de acessos, cadastros e vagas" />
        {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Total de usuários" value={counts.users} icon={Users} /><StatCard label="Unidades fabris" value={counts.places} icon={MapPin} /><StatCard label="Cursos ativos" value={counts.courses} icon={BookOpen} /><StatCard label="Vagas gerenciadas" value={counts.vacancies} icon={Briefcase} /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{modules.map((module) => { const Icon = module.icon; return <Card key={module.title} className="transition-shadow hover:shadow-md"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-base">{module.title}</CardTitle><div className={`rounded-lg p-2 ${module.color}`}><Icon className="size-5" /></div></CardHeader><CardContent className="space-y-4"><p className="text-xs text-muted-foreground">{module.count}</p><Link href={module.href} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-between")}>Acessar módulo<ArrowRight className="size-3.5" /></Link></CardContent></Card>; })}</div>
      </div>
    </AppShell>
  );
}
