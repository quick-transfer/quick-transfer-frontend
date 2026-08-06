"use client";

import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  // Omitting href makes the segment render as the current page (non-clickable).
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
  // Take at most 2 initials — avoids displaying 3+ characters for long names.
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-card pl-6 pr-[5vw]">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Quick Transfer
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.map((segment, index) => (
            // Fragment keyed by label rather than index so React doesn't
            // destroy/recreate DOM nodes when breadcrumbs change between pages.
            <Fragment key={segment.label}>
              <BreadcrumbSeparator>
                <ChevronRight className="size-3.5" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {/* Last segment or segments without href render as static text. */}
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
      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-medium text-slate-700 sm:inline">{userName}</span>
        <Avatar className="size-9 border border-slate-200">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback className="bg-primary-800 text-xs font-bold text-white">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
