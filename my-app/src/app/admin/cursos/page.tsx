"use client";

import { useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Fab } from "@/components/shared/fab";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCourses } from "@/lib/mock-data";
import type { CourseDTO } from "@/types";
import { BookOpen, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CursosPage() {
  const [filterTab, setFilterTab] = useState<string>("ALL");

  const filteredCourses = mockCourses.filter((course) => {
    if (filterTab === "ACTIVE") return course.status === "ACTIVE";
    if (filterTab === "COMPLETED") return course.status === "COMPLETED";
    return true;
  });

  const columns: DataTableColumn<CourseDTO>[] = [
    {
      key: "name",
      header: "Curso Técnico",
      sortable: true,
      render: (course) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
            <BookOpen className="size-4" />
          </div>
          <div>
            <p className="font-medium text-foreground">{course.name}</p>
            <p className="text-xs text-muted-foreground">Código: {course.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: "coordinatorName",
      header: "Coordenador Responsável",
      render: (course) => (
        <span className="text-sm font-medium text-foreground">{course.coordinatorName}</span>
      ),
    },
    {
      key: "totalStudents",
      header: "Total Alunos",
      sortable: true,
      render: (course) => (
        <span className="text-sm font-semibold text-foreground">{course.totalStudents} alunos</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (course) => {
        if (course.status === "ACTIVE") return <Badge variant="success">Em Andamento</Badge>;
        if (course.status === "COMPLETED") return <Badge variant="neutral">Concluído</Badge>;
        return <Badge variant="warning">Planejado</Badge>;
      },
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
        { label: "Cursos" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Cursos Técnicos e Profissionalizantes"
          description="Catálogo de programas de qualificação técnica oferecidos na unidade"
        />

        <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="ALL">Todos os Cursos</TabsTrigger>
            <TabsTrigger value="ACTIVE">Em Andamento</TabsTrigger>
            <TabsTrigger value="COMPLETED">Concluídos</TabsTrigger>
          </TabsList>
        </Tabs>

        <DataTable
          columns={columns}
          data={filteredCourses}
          pageSize={10}
          searchable
          searchPlaceholder="Buscar curso por nome ou código..."
          searchKeys={["name", "code", "coordinatorName"]}
          getRowKey={(row) => row.id}
        />

        {/* Floating Action Button (+) */}
        <Fab label="Novo Curso" onClick={() => alert("Abrir formulário de novo curso")} />
      </div>
    </AppShell>
  );
}
