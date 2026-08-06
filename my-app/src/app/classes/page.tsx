"use client";

import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getClasses, type ClassResponse } from "@/lib/core-api";
import { Plus, GraduationCap, Eye } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const shiftLabel = { MORNING: "Matutino", AFTERNOON: "Vespertino", NIGHT: "Noturno" };

export default function TurmasPage() {
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    getClasses({ size: 200, sort: "startDate,desc" })
      .then((response) => mounted && setClasses(response))
      .catch((requestError) => mounted && setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar as turmas."));
    return () => { mounted = false; };
  }, []);

  const columns: DataTableColumn<ClassResponse>[] = [
    {
      key: "name",
      header: "Turma",
      sortable: true,
      render: (classEntity) => (
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-50 p-2 text-primary-600"><GraduationCap className="size-4" /></div>
          <div><p className="font-medium">{classEntity.name}</p><p className="text-xs text-muted-foreground">Código: {classEntity.acronym}</p></div>
        </div>
      ),
    },
    { key: "courseName", header: "Curso Vinculado", render: (classEntity) => <span className="text-sm font-medium">{classEntity.courseName}</span> },
    { key: "period", header: "Período", render: (classEntity) => <div><Badge variant="outline">{shiftLabel[classEntity.shiftClass]}</Badge><p className="mt-1 text-xs text-muted-foreground">{classEntity.startDate} a {classEntity.finishDate}</p></div> },
    {
      key: "occupancy",
      header: "Ocupação",
      render: (classEntity) => {
        const percentage = classEntity.maxStudents > 0 ? Math.round((classEntity.totalStudents / classEntity.maxStudents) * 100) : 0;
        return <div className="space-y-1"><div className="flex justify-between text-xs font-medium"><span>{classEntity.totalStudents} / {classEntity.maxStudents}</span><span>{percentage}%</span></div><div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary-600" style={{ width: `${Math.min(percentage, 100)}%` }} /></div></div>;
      },
    },
    { key: "status", header: "Status", render: (classEntity) => classEntity.status === "ON_GOING" ? <Badge variant="success">Em andamento</Badge> : classEntity.status === "NOT_STARTED" ? <Badge variant="info">Planejada</Badge> : <Badge variant="neutral">Finalizada</Badge> },
    { key: "actions", header: "Ações", className: "text-right", render: () => <Link href="/students" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}><Eye className="size-3.5" /> Ver alunos</Link> },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Painel", href: "/dashboard" }, { label: "Turmas" }]}>
      <div className="space-y-6">
        <PageHeader title="Turmas" description="Gerenciamento das turmas ativas e planejadas dos programas de aprendizagem" actions={<Link href="/classes/new" className={cn(buttonVariants(), "gap-2")}><Plus className="size-4" /> Nova Turma</Link>} />
        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <DataTable columns={columns} data={classes} pageSize={10} searchable searchPlaceholder="Buscar turma por nome, código ou curso..." searchKeys={["name", "acronym", "courseName"]} getRowKey={(row) => row.id} />
      </div>
    </AppShell>
  );
}
