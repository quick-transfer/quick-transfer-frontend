"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar, type BreadcrumbSegment } from "@/components/layout/topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ROLE_COOKIE_NAME } from "@/lib/auth";
import type { UserRole } from "@/types";

function getRoleFromCookie(): UserRole {
  if (typeof document === "undefined") return "ADMIN";
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${ROLE_COOKIE_NAME}=([^;]*)`));
  return (match?.[1] as UserRole) || "ADMIN";
}

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbSegment[];
}

export function AppShell({ children, breadcrumbs }: AppShellProps) {
  const role = getRoleFromCookie();

  const roleLabels: Record<UserRole, string> = {
    ADMIN: "Administrador",
    COORDINATOR: "Coordenador",
    MANAGER: "Gestor",
    STUDENT: "Aluno",
  };

  return (
    <TooltipProvider delay={300}>
      <div className="min-h-screen bg-white relative overflow-x-hidden">
        <Sidebar />
        <div className="lg:pl-60 flex min-h-screen flex-col">
          <Topbar breadcrumbs={breadcrumbs} userName={roleLabels[role] || "Usuário"} />
          <main className="flex-1 p-6 pr-[5vw]">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
