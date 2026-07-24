"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Users,
  GraduationCap,
  FileText,
  Settings,
  MapPin,
  CalendarCheck,
  BookOpen,
  Briefcase,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { UserRole } from "@/types";
import { useState } from "react";

// ── Icon map ──
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Clock,
  Users,
  GraduationCap,
  FileText,
  Settings,
  MapPin,
  CalendarCheck,
  BookOpen,
  Briefcase,
  ShieldCheck,
};

interface SidebarNavItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
}

interface SidebarNavSection {
  title: string;
  items: SidebarNavItem[];
}

const navigation: SidebarNavSection[] = [
  {
    title: "Coordenador",
    items: [
      {
        label: "Painel",
        href: "/dashboard",
        icon: "LayoutDashboard",
        roles: ["COORDINATOR", "ADMIN"],
      },
      {
        label: "Turnos",
        href: "/turnos",
        icon: "Clock",
        roles: ["COORDINATOR", "ADMIN"],
      },
      {
        label: "Turmas",
        href: "/turmas/nova",
        icon: "GraduationCap",
        roles: ["COORDINATOR", "ADMIN"],
      },
      {
        label: "Alunos",
        href: "/alunos",
        icon: "Users",
        roles: ["COORDINATOR", "ADMIN"],
      },
      {
        label: "Solicitações",
        href: "/solicitacoes",
        icon: "FileText",
        roles: ["COORDINATOR", "ADMIN"],
      },
    ],
  },
  {
    title: "Administração",
    items: [
      {
        label: "Painel Admin",
        href: "/admin",
        icon: "ShieldCheck",
        roles: ["ADMIN"],
      },
      {
        label: "Usuários",
        href: "/admin/usuarios",
        icon: "Users",
        roles: ["ADMIN"],
      },
      {
        label: "Locais",
        href: "/admin/locais",
        icon: "MapPin",
        roles: ["ADMIN"],
      },
      {
        label: "Entrevistas",
        href: "/admin/entrevistas",
        icon: "CalendarCheck",
        roles: ["ADMIN"],
      },
      {
        label: "Cursos",
        href: "/admin/cursos",
        icon: "BookOpen",
        roles: ["ADMIN"],
      },
      {
        label: "Turmas",
        href: "/admin/turmas",
        icon: "GraduationCap",
        roles: ["ADMIN"],
      },
      {
        label: "Vagas",
        href: "/admin/vagas",
        icon: "Briefcase",
        roles: ["ADMIN"],
      },
      {
        label: "Configurações",
        href: "/admin/configuracoes",
        icon: "Settings",
        roles: ["ADMIN"],
      },
    ],
  },
];

interface SidebarProps {
  currentRole?: UserRole;
}

export function Sidebar({ currentRole = "ADMIN" }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredNav = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.roles.includes(currentRole)
      ),
    }))
    .filter((section) => section.items.length > 0);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-sm">
          QT
        </div>
        <span className="text-lg font-light text-white tracking-wide">
          Quick Transfer
        </span>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {filteredNav.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = iconMap[item.icon] ?? LayoutDashboard;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      item.href !== "/admin" &&
                      pathname.startsWith(item.href));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <Separator className="bg-sidebar-border" />

      {/* Footer */}
      <div className="p-4">
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          aria-label="Sair do sistema"
        >
          <LogOut className="size-4 shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden text-foreground"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - desktop: fixed left, mobile: slide-in drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-60 transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
