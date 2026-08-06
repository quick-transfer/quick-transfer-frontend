"use client";

import { ChevronRight } from "lucide-react";
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
}

export function Topbar({
  breadcrumbs = [],
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-card pl-6 pr-[5vw]">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Quick Transfer
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs.map((segment, index) => (
            <Fragment key={`${segment.label}-${index}`}>
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
    </header>
  );
}
