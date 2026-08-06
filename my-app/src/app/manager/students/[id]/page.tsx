"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Award, Mail } from "lucide-react";

import { AppShell, PageHeader } from "@/components/layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAppStudents } from "@/lib/application-api";
import { cn } from "@/lib/utils";
import type { StudentDTO } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ManagerStudentDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const [student, setStudent] = useState<StudentDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAppStudents()
      .then((students) => {
        if (!active) return;
        const found = students.find((item) => item.id === id);
        if (found) setStudent(found);
        else setError("Aluno não encontrado.");
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o aluno.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Alunos", href: "/manager/students" }]}><p>Carregando aluno...</p></AppShell>;
  }

  if (!student) {
    return (
      <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Alunos", href: "/manager/students" }]}>
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "Aluno não encontrado."}
        </div>
        <Link href="/manager/students" className={cn(buttonVariants({ variant: "outline" }), "mt-4 gap-2")}>
          <ArrowLeft className="size-4" /> Voltar
        </Link>
      </AppShell>
    );
  }

  const initials = student.name.split(" ").map((part) => part[0]).slice(0, 2).join("");

  return (
    <AppShell breadcrumbs={[{ label: "Gestor" }, { label: "Alunos", href: "/manager/students" }, { label: student.name }]}>
      <div className="space-y-6">
        <PageHeader
          title={`Detalhes do Aluno: ${student.name}`}
          description={`Matrícula: ${student.registration}`}
          actions={
            <Link href="/manager/students" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
              <ArrowLeft className="size-4" /> Voltar
            </Link>
          }
        />

        <Card className="max-w-2xl border-border shadow-sm">
          <CardHeader className="text-center">
            <Avatar className="mx-auto size-24 border-2 border-primary">
              <AvatarFallback className="bg-primary-800 text-2xl font-bold text-white">{initials}</AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4 text-xl">{student.name}</CardTitle>
            <div><Badge variant="info">{student.status === "ACTIVE" ? "Ativo" : student.status === "COMPLETED" ? "Concluído" : "Pausado"}</Badge></div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="size-4 text-primary" />{student.email}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Award className="size-4 text-primary" />{student.courseName} · {student.className}</div>
            <div className="border-t pt-4">
              <div className="mb-1 flex justify-between text-xs font-medium">
                <span>Média de desempenho</span>
                <span>{student.performanceGrade == null ? "Não informada" : `${student.performanceGrade} / 10`}</span>
              </div>
              {student.performanceGrade != null && <Progress value={student.performanceGrade * 10} className="h-2" />}
            </div>
            <p className="border-t pt-4 text-xs text-muted-foreground">
              Habilidades, frequência e histórico não são retornados neste endpoint da API.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
