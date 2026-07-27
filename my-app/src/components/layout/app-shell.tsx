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
      <div className="min-h-screen bg-background relative overflow-x-hidden">
        <Sidebar />
        <div className="lg:pl-60 flex min-h-screen flex-col">
          <Topbar breadcrumbs={breadcrumbs} userName="Admin" />
          <main className="flex-1 p-6 pr-[5vw]">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
