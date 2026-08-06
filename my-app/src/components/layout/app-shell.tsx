"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar, type BreadcrumbSegment } from "@/components/layout/topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ROLE_COOKIE_NAME } from "@/lib/auth";
import type { UserRole } from "@/types";
import { Separator } from "@base-ui/react/separator";
import { useSyncExternalStore } from "react";
import { ConnectivityBanner } from "@/components/shared/connectivity-banner";

// Accepts Portuguese aliases from the backend alongside the canonical English values.
function normalizeRole(roleStr?: string | null): UserRole {
  if (!roleStr) return "ADMIN";
  const upper = roleStr.toUpperCase();
  if (upper === "COORDENADOR" || upper === "COORDINATOR") return "COORDINATOR";
  if (upper === "GESTOR" || upper === "MANAGER") return "MANAGER";
  return "ADMIN";
}

// Reads the role from the JS-readable cookie rather than from a server prop.
// The role cookie is intentionally not HttpOnly so that client components can
// use it to render role-specific UI without a server round-trip.
// SSR guard (`typeof document === "undefined"`) prevents crashes during Next.js
// static generation, which runs in Node where `document` doesn't exist.
function getRoleFromCookie(): UserRole {
  if (typeof document === "undefined") return "ADMIN";
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${ROLE_COOKIE_NAME}=([^;]*)`));
  return normalizeRole(match?.[1]);
}

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbSegment[];
}

export function AppShell({ children, breadcrumbs }: AppShellProps) {
  const role = useSyncExternalStore<UserRole>(
    () => () => undefined,
    getRoleFromCookie,
    () => 'ADMIN' as UserRole
  );

  const roleLabels: Record<UserRole, string> = {
    ADMIN: "Administrador",
    COORDINATOR: "Coordenador",
    MANAGER: "Gestor",
  };

  return (
    <TooltipProvider delay={300}>
      <div className="min-h-screen bg-white relative overflow-x-hidden">
        <Sidebar currentRole={role} />
        <div className="lg:pl-60 flex min-h-screen flex-col">
          <Topbar breadcrumbs={breadcrumbs} userName={roleLabels[role] || "Usuário"} />
          <Separator className="bg-primary-800 h-px" style={{ width: '93%', marginLeft: '1.7%', marginRight: '5%' }}/>
          <ConnectivityBanner />
          <main className="flex-1 p-6 pr-[5vw]">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
