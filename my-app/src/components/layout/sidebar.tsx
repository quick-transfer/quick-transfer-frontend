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
  Users2,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { UserRole } from "@/types";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { apiFetch, AUTH_COOKIE_NAME } from "@/lib/api";
import { ROLE_COOKIE_NAME } from "@/lib/auth";

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
  Users2,
  CalendarClock,
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
        roles: ["COORDINATOR"],
      },
      {
        label: "Turnos",
        href: "/shifts",
        icon: "Clock",
        roles: ["COORDINATOR"],
      },
      {
        label: "Turmas",
        href: "/classes",
        icon: "GraduationCap",
        roles: ["COORDINATOR"],
      },
      {
        label: "Alunos",
        href: "/students",
        icon: "Users",
        roles: ["COORDINATOR"],
      },
      {
        label: "Cursos",
        href: "/courses",
        icon: "BookOpen",
        roles: ["COORDINATOR"],
      },
      {
        label: "Direcionar Alunos",
        href: "/coordinator/direct",
        icon: "Users2",
        roles: ["COORDINATOR"],
      },
    ],
  },
  {
    title: "Gestor",
    items: [
      {
        label: "Minhas Vagas",
        href: "/manager/vacancies",
        icon: "Briefcase",
        roles: ["MANAGER"],
      },
      {
        label: "Alunos",
        href: "/manager/students",
        icon: "Users",
        roles: ["MANAGER"],
      },
      {
        label: "Entrevistas",
        href: "/manager/interviews",
        icon: "CalendarClock",
        roles: ["MANAGER"],
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
        href: "/admin/users",
        icon: "Users",
        roles: ["ADMIN"],
      },
      {
        label: "Gestores",
        href: "/admin/sections",
        icon: "Briefcase",
        roles: ["ADMIN"],
      },
      {
        label: "Locais",
        href: "/admin/locations",
        icon: "MapPin",
        roles: ["ADMIN"],
      },
      {
        label: "Entrevistas",
        href: "/admin/interviews",
        icon: "CalendarCheck",
        roles: ["ADMIN"],
      },
      {
        label: "Cursos",
        href: "/admin/courses",
        icon: "BookOpen",
        roles: ["ADMIN"],
      },
      {
        label: "Turmas",
        href: "/admin/classes",
        icon: "GraduationCap",
        roles: ["ADMIN"],
      },
      {
        label: "Vagas",
        href: "/admin/vacancies",
        icon: "Briefcase",
        roles: ["ADMIN"],
      },
    ],
  },
];

function normalizeRole(roleStr?: UserRole | string | null): UserRole {
  if (!roleStr) return "ADMIN";
  const upper = roleStr.toUpperCase();
  if (upper === "COORDENADOR" || upper === "COORDINATOR") return "COORDINATOR";
  if (upper === "GESTOR" || upper === "MANAGER") return "MANAGER";
  return "ADMIN";
}

interface SidebarProps {
  currentRole?: UserRole | string;
}

export function Sidebar({ currentRole = "ADMIN" }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  const handleLogout = async () => {
    try {
      setSaindo(true);

      // Limpa os cookies locais (suporta o modo mock / fallback de teste)
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${ROLE_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

      // Requisição POST para o endpoint de logout do backend Spring Boot enviando credentials: "include"
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      // Ignora erros de rede no logout para garantir o redirecionamento
      console.warn("Erro ou backend indisponível no logout:", error);
    } finally {
      setSaindo(false);
      // Redireciona o usuário para a rota de login após a invalidação da sessão/cookie
      router.push("/login");
    }
  };

  const activeRole = normalizeRole(currentRole);

  const filteredNav = navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.roles.includes(activeRole)
      ),
    }))
    .filter((section) => section.items.length > 0);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5">
        <Image
          src="/assets/images/logo/logo-title-blue.svg"
          alt="Logo WEG"
          width={200}
          height={36}
          priority
        />
      </div>

      <Separator data-no-autosize className="bg-primary-800 w-2/10" style={{ width: '100%', marginLeft: 0 }} />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {filteredNav.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[14px] font-semibold uppercase tracking-wider text-primary-900">
                {section.title}
              </p>
              <Separator className="bg-primary-900 mb-2" />
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
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-primary-800",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-primary-800 hover:bg-primary-700 hover:text-sidebar-accent-foreground"
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

      <Separator data-no-autosize className="bg-primary-800 w-full" style={{ width: '100%', marginLeft: 0 }} />

      {/* Footer */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          disabled={saindo}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary-800 transition-colors hover:bg-primary-700 hover:text-sidebar-accent-foreground disabled:opacity-50"
          aria-label="Sair do sistema"
        >
          <LogOut className="size-4 shrink-0 " />
          <span>{saindo ? "Saindo..." : "Sair"}</span>
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

      {/* Sidebar - desktop: standard fixed left w-60 */}
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
