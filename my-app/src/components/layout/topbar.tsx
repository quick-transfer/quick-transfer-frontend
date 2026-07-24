"use client";

import { Bell, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface TopbarProps {
  breadcrumbs?: BreadcrumbSegment[];
  userName?: string;
  userAvatar?: string;
}

export function Topbar({
  breadcrumbs = [],
  userName = "Usuário",
  userAvatar,
}: TopbarProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Quick Transfer
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.map((segment, index) => (
            <Fragment key={segment.label}>
              <BreadcrumbSeparator>
                <ChevronRight className="size-3.5" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 || !segment.href ? (
                  <BreadcrumbPage className="text-sm font-medium">
                    {segment.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={segment.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    {segment.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger
            className="relative inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Notificações"
          >
            <Bell className="size-4" />
            {/* Notification dot */}
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
          </TooltipTrigger>
          <TooltipContent>Notificações</TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
            <AvatarFallback className="bg-primary-600 text-white text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-foreground sm:inline-block">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}
