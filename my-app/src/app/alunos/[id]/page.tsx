"use client";

import { use } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { TimelineItem } from "@/components/shared/timeline-item";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { buttonVariants } from "@/components/ui/button";
import { mockStudents, mockTimeline } from "@/lib/mock-data";
import { ArrowLeft, Mail, Award, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AlunoDetalhesPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const student = mockStudents.find((s) => s.id === resolvedParams.id) || mockStudents[0];
  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <AppShell
      breadcrumbs={[
        { label: "Alunos", href: "/alunos" },
        { label: student.name },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title={`Detalhes do Aluno: ${student.name}`}
          description={`Matrícula: ${student.registration}`}
          actions={
            <Link
              href="/alunos"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <ArrowLeft className="size-4" /> Voltar
            </Link>
          }
        />

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="border-border shadow-sm md:col-span-1">
            <CardHeader className="text-center pb-2">
              <Avatar className="mx-auto size-24 border-2 border-primary">
                {student.avatarUrl && <AvatarImage src={student.avatarUrl} alt={student.name} />}
                <AvatarFallback className="bg-primary-600 text-white font-bold text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4 text-xl font-semibold">{student.name}</CardTitle>
              <div className="flex justify-center pt-1">
                <Badge variant={student.status === "ACTIVE" ? "success" : "warning"}>
                  {student.status === "ACTIVE" ? "Ativo" : "Em Transferência"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4 text-primary" />
                <span>{student.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="size-4 text-primary" />
                <span>{student.courseName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4 text-primary" />
                <span>{student.shift}</span>
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Frequência Escolar</span>
                    <span className="font-semibold text-foreground">{student.attendanceRate}%</span>
                  </div>
                  <Progress value={student.attendanceRate} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Média Desempenho</span>
                    <span className="font-semibold text-foreground">{student.performanceGrade} / 10</span>
                  </div>
                  <Progress value={student.performanceGrade * 10} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications & Activity Timeline */}
          <Card className="border-border shadow-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Histórico de Notificações e Ocorrências</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-1">
                {mockTimeline.map((item, idx) => (
                  <TimelineItem
                    key={item.id}
                    title={item.title}
                    description={item.description}
                    date={item.date}
                    badgeLabel={item.type}
                    badgeVariant={item.status}
                    isLast={idx === mockTimeline.length - 1}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
