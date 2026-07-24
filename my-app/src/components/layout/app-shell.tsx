"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar, type BreadcrumbSegment } from "@/components/layout/topbar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbSegment[];
}

export function AppShell({ children, breadcrumbs }: AppShellProps) {
  return (
    <TooltipProvider delay={300}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:ml-60">
          <Topbar breadcrumbs={breadcrumbs} userName="Admin" />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
