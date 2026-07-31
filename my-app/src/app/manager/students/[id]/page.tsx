"use client";

import { use } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Calendar, Wrench, CheckCircle, UserPlus, ArrowLeft } from "lucide-react";
import { mockStudents } from "@/lib/mock-data";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ManagerStudentDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);

  const student = mockStudents.find((s) => s.id === resolvedParams.id) || mockStudents[0];

  return (
    <AppShell
      breadcrumbs={[
        { label: "Gestor" },
        { label: "Alunos", href: "/manager/students" },
        { label: student.name },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title={`Detalhes do Aluno: ${student.name}`}
          description={`Matrícula: ${student.registration}`}
          actions={
            <Link
              href="/manager/students"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <ArrowLeft className="size-4" /> Voltar
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Coluna Esquerda: Informações & Habilidades */}
          <div className="space-y-6">
            {/* Card Perfil Básico */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center space-y-4">
              <Avatar className="size-28 border-4 border-slate-100 shadow-md">
                <AvatarImage src={`https://i.pravatar.cc/150?u=${student.name}`} />
                <AvatarFallback className="bg-primary-800 text-white font-bold text-2xl">
                  {student.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>

              <div className="w-full space-y-2 text-sm pt-2 border-t border-slate-100">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 uppercase text-xs font-semibold">TURMA</span>
                  <span className="font-bold text-slate-800">{student.className}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 uppercase text-xs font-semibold">CURSO</span>
                  <span className="font-bold text-slate-800">{student.courseName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 uppercase text-xs font-semibold">STATUS</span>
                  <Badge variant="info" className="bg-blue-50 text-blue-700 border-blue-200">
                    Em Treinamento
                  </Badge>
                </div>
              </div>
            </div>

            {/* Card Habilidades e Evolução */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Habilidades e Evolução
              </h3>

              {/* Técnicas */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  HABILIDADES TÉCNICAS
                </p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>CLP e Automação</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2.5 bg-slate-100" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Desenho Técnico (CAD)</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2.5 bg-slate-100" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Manutenção Preventiva</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2.5 bg-slate-100" />
                </div>
              </div>

              {/* Socioemocionais */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  HABILIDADES SOCIOEMOCIONAIS
                </p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Trabalho em Equipe</span>
                    <span>95%</span>
                  </div>
                  <Progress value={95} className="h-2.5 bg-slate-100" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Resolução de Problemas</span>
                    <span>88%</span>
                  </div>
                  <Progress value={88} className="h-2.5 bg-slate-100" />
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Histórico e Ajustes Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              Histórico e Ajustes
            </h3>

            <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200">
              {/* Evento 1 */}
              <div className="relative flex items-start gap-4">
                <div className="size-8 rounded-full bg-primary-800 text-white flex items-center justify-center shrink-0 z-10">
                  <Calendar className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">Entrevista Agendada</h4>
                    <span className="text-xs text-slate-400">24 Out, 2023 - 14:30</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Entrevista técnica inicial com supervisor de manutenção da unidade fabril 3.
                  </p>
                </div>
              </div>

              {/* Evento 2 */}
              <div className="relative flex items-start gap-4">
                <div className="size-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 z-10">
                  <Wrench className="size-4" />
                </div>
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">Atualização de Perfil</h4>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-rose-700 text-white rounded">
                        AJUSTADO MANUALMENTE
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">15 Out, 2023</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Nota de avaliação técnica atualizada de 80 para 85 após revisão final do projeto integrador.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Por: Carlos Eduardo (Gestor)</p>
                </div>
              </div>

              {/* Evento 3 */}
              <div className="relative flex items-start gap-4">
                <div className="size-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 z-10">
                  <CheckCircle className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">Conclusão Módulo Básico</h4>
                    <span className="text-xs text-slate-400">10 Set, 2023</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Aluno aprovado em todos os requisitos do módulo introdutório de mecatrônica industrial.
                  </p>
                </div>
              </div>

              {/* Evento 4 */}
              <div className="relative flex items-start gap-4">
                <div className="size-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 z-10">
                  <Wrench className="size-4" />
                </div>
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">Correção de Presença</h4>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-rose-700 text-white rounded">
                        AJUSTADO MANUALMENTE
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">02 Set, 2023</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Justificativa médica aceita. Falta do dia 01/09 convertida para presença justificada.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Por: Secretaria Acadêmica</p>
                </div>
              </div>

              {/* Evento 5 */}
              <div className="relative flex items-start gap-4">
                <div className="size-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 z-10">
                  <UserPlus className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">Início do Curso</h4>
                    <span className="text-xs text-slate-400">15 Fev, 2023</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
