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

// String-keyed map so nav items reference icons by name from JSON/config
// rather than importing every icon in every consumer.
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
        roles: ["COORDINATOR", "ADMIN"],
      },
      // Shifts route temporarily commented out — the shift management feature
      // is under review for the coordinator role.
      // {
      //   label: "Turnos",
      //   href: "/shifts",
      //   icon: "Clock",
      //   roles: ["COORDINATOR", "ADMIN"],
      // },
      {
        label: "Turmas",
        href: "/classes",
        icon: "GraduationCap",
        roles: ["COORDINATOR", "ADMIN"],
      },
      {
        label: "Alunos",
        href: "/students",
        icon: "Users",
        roles: ["COORDINATOR", "ADMIN"],
      },
      {
        label: "Cursos",
        href: "/courses",
        icon: "BookOpen",
        roles: ["COORDINATOR", "ADMIN"],
      },
      {
        label: "Direcionar Alunos",
        href: "/coordinator/direct",
        icon: "Users2",
        roles: ["COORDINATOR", "ADMIN"],
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
        roles: ["MANAGER", "ADMIN"],
      },
      {
        label: "Alunos",
        href: "/manager/students",
        icon: "Users",
        roles: ["MANAGER", "ADMIN"],
      },
      {
        label: "Entrevistas",
        href: "/manager/interviews",
        icon: "CalendarClock",
        roles: ["MANAGER", "ADMIN"],
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
      // Sections route hidden pending a redesign of the manager-section hierarchy.
      // {
      //   label: "Gestores",
      //   href: "/admin/sections",
      //   icon: "Briefcase",
      //   roles: ["ADMIN"],
      // },
      {
        label: "Locais",
        href: "/admin/locations",
        icon: "MapPin",
        roles: ["ADMIN"],
      },
      // Admin interviews view hidden — managers own the interview workflow.
      // {
      //   label: "Entrevistas",
      //   href: "/admin/interviews",
      //   icon: "CalendarCheck",
      //   roles: ["ADMIN"],
      // },
      {
        label: "Cursos",
        href: "/admin/courses",
        icon: "BookOpen",
        roles: ["ADMIN"],
      },
      // Admin class management hidden — coordinators own class creation.
      // {
      //   label: "Turmas",
      //   href: "/admin/classes",
      //   icon: "GraduationCap",
      //   roles: ["ADMIN"],
      // },
      {
        label: "Vagas",
        href: "/admin/vacancies",
        icon: "Briefcase",
        roles: ["ADMIN"],
      },
    ],
  },
];

// Accepts Portuguese aliases from the backend cookie value.
// Unmapped values default to ADMIN so the admin always sees everything —
// safer than hiding nav items for an unknown role.
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

      // Clear the JS-readable cookies immediately so the sidebar doesn't
      // briefly re-render with the old role if the backend call is slow.
      // This also covers the mock session, which never hits the backend.
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${ROLE_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

      // The backend POST invalidates the HttpOnly JWT cookie server-side.
      // Network errors are intentionally swallowed — even if the backend is
      // unreachable, the local cookies are already cleared and the redirect
      // to /login effectively ends the session from the frontend's perspective.
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.warn("Erro ou backend indisponível no logout:", error);
    } finally {
      setSaindo(false);
      router.push("/login");
    }
  };

  const activeRole = normalizeRole(currentRole);

  // Filter out sections that have no visible items for the current role,
  // rather than rendering empty section headers.
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

      <Separator className="bg-primary-800" style={{ width: '90%', marginLeft: '10%' }} />

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
                  // Fall back to LayoutDashboard if a new icon name is added to
                  // the nav config before being added to iconMap.
                  const Icon = iconMap[item.icon] ?? LayoutDashboard;
                  // /dashboard and /admin are exact-matched to avoid marking every
                  // sub-route as active when the user is on a child page.
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

      <Separator data-no-autosize className="bg-primary-800" style={{ width: '90%', marginLeft: '5%' }} />

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
      {/* Mobile hamburger — fixed position keeps it reachable when content scrolls */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden text-foreground"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {/* Mobile overlay — tap outside to close the drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — always visible on desktop; slides in/out on mobile */}
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
