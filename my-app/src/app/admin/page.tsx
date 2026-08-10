"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  ShieldCheck, 
  UserCog, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Briefcase, 
  CalendarCheck, 
  Send,
  ArrowRight,
  Sparkles
} from "lucide-react";

import { AppShell, PageHeader } from "@/components/layout";
import { StatCard } from "@/components/shared/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { getAppUsers, getCourses, getClasses } from "@/lib/application-api";
import { getVacancies, getPlaces } from "@/lib/manager-api";
import { cn } from "@/lib/utils";
import type { UserDTO } from "@/types";

interface AdminCardProps {
  title: string;
  description: string;
  countLabel?: string;
  countValue?: number | string;
  icon: React.ElementType;
  href: string;
  badgeText?: string;
}

function AdminActionCard({
  title,
  description,
  countLabel,
  countValue,
  icon: Icon,
  href,
  badgeText,
}: AdminCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="p-2.5 rounded-xl border border-primary-100 bg-primary-50 text-primary-800">
            <Icon className="size-5" />
          </div>
          {badgeText && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {badgeText}
            </span>
          )}
        </div>

        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-primary-900 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        {countLabel && countValue !== undefined ? (
          <span className="text-xs font-semibold text-slate-600">
            {countValue} {countLabel}
          </span>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Acesso rápido</span>
        )}

        <Link
          href={href}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-8 px-3 text-xs font-semibold rounded-lg gap-1 border-slate-200 text-primary-900 hover:bg-primary-900 hover:text-white hover:border-primary-900 transition-all"
          )}
        >
          Acessar <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [coursesCount, setCoursesCount] = useState<number>(0);
  const [classesCount, setClassesCount] = useState<number>(0);
  const [vacanciesCount, setVacanciesCount] = useState<number>(0);
  const [placesCount, setPlacesCount] = useState<number>(0);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getAppUsers().catch(() => []),
      getCourses().catch(() => []),
      getClasses().catch(() => []),
      getVacancies().catch(() => []),
      getPlaces().catch(() => []),
    ]).then(([usersData, coursesData, classesData, vacanciesData, placesData]) => {
      setUsers(usersData);
      setCoursesCount(coursesData.length);
      setClassesCount(classesData.length);
      setVacanciesCount(vacanciesData.length);
      setPlacesCount(placesData.length);
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados do painel.");
    });
  }, []);

  const administrators = users.filter((user) => user.role === "ADMIN").length;
  const managers = users.filter((user) => user.role === "MANAGER").length;
  const coordinators = users.filter((user) => user.role === "COORDINATOR").length;

  return (
    <AppShell breadcrumbs={[{ label: "Painel de Administração" }]}>
      <div className="space-y-6 pb-12">
        <PageHeader
          title="Central do Administrador"
          description="Acesse e gerencie todos os módulos, cadastros, usuários e configurações do sistema Quick Transfer"
        />

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Resumo Estatístico Superior */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="TOTAL DE USUÁRIOS" value={users.length} icon={Users} />
          <StatCard label="ADMINISTRADORES" value={administrators} icon={ShieldCheck} />
          <StatCard label="GESTORES DE VAGAS" value={managers} icon={UserCog} />
          <StatCard label="COORDENADORES" value={coordinators} icon={Users} />
        </div>

        {/* Seção Principal de Cards de Ações/Módulos do Admin - Todas com Azul Padronizado */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="size-5 text-primary-800" />
              Módulos e Funcionalidades do Administrador
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              8 Módulos Disponíveis
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminActionCard
              title="Gerenciamento de Usuários"
              description="Cadastre, edite e controle o acesso de Gestores, Coordenadores e Administradores."
              countLabel="usuários"
              countValue={users.length}
              icon={Users}
              href="/admin/users"
              badgeText="Acessos"
            />

            <AdminActionCard
              title="Locais e Unidades"
              description="Gerencie os parques fabris e seções onde os aprendizes realizam as atividades."
              countLabel="locais"
              countValue={placesCount}
              icon={MapPin}
              href="/admin/locations"
              badgeText="Locais"
            />

            <AdminActionCard
              title="Cursos e Programas"
              description="Cadastre e edite cursos técnicos, vinculando coordenadores responsáveis."
              countLabel="cursos"
              countValue={coursesCount}
              icon={GraduationCap}
              href="/courses"
              badgeText="Acadêmico"
            />

            <AdminActionCard
              title="Turmas de Aprendizes"
              description="Crie e organize turmas, definindo períodos (matutino/vespertino) e alocando alunos."
              countLabel="turmas"
              countValue={classesCount}
              icon={BookOpen}
              href="/classes"
              badgeText="Turmas"
            />

            <AdminActionCard
              title="Vagas e Oportunidades"
              description="Abra novas vagas para os setores da fábrica e acompanhe o preenchimento de posições."
              countLabel="vagas"
              countValue={vacanciesCount}
              icon={Briefcase}
              href="/manager/vacancies"
              badgeText="Vagas"
            />

            <AdminActionCard
              title="Diretório de Alunos"
              description="Consulte e gerencie o cadastro geral de alunos aprendizes, frequências e notas."
              countLabel="cadastrados"
              countValue="Lista global"
              icon={Users}
              href="/students"
              badgeText="Alunos"
            />

            <AdminActionCard
              title="Direcionar Alunos"
              description="Selecione vagas abertas e direcione candidatos recomendados para os gestores."
              countLabel="direcionamento"
              countValue="Disponível"
              icon={Send}
              href="/coordinator/direct"
              badgeText="Alocação"
            />

            <AdminActionCard
              title="Entrevistas e Processos"
              description="Acompanhe o agendamento de entrevistas, convites e status das seleções."
              countLabel="agendamentos"
              countValue="Painel"
              icon={CalendarCheck}
              href="/admin/interviews"
              badgeText="Processos"
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
