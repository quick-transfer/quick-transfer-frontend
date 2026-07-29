"use client";

import { AppShell, PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockShifts } from "@/lib/mock-data";
import { SlidersHorizontal, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TurnosPage() {
  return (
    <AppShell breadcrumbs={[{ label: "Turnos" }]}>
      <div className="space-y-6">
        <PageHeader
          title="Turnos Técnico/Operacionais"
          description="Gestão de capacidade e ocupação por período de trabalho"
          actions={
            <Link
              href="/turnos/ajuste-manual"
              className={cn(buttonVariants({ variant: "default" }), "gap-2 bg-primary text-white hover:bg-primary-700")}
            >
              <SlidersHorizontal className="size-4" />
              Ajuste Manual
            </Link>
          }
        />

        {/* Shifts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockShifts.map((shift) => (
            <Card key={shift.id} className="overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold text-foreground">
                  {shift.name}
                </CardTitle>
                {shift.status === "FULL" && <Badge variant="danger">Lotado</Badge>}
                {shift.status === "HIGH_DEMAND" && <Badge variant="warning">Alta Demanda</Badge>}
                {shift.status === "NORMAL" && <Badge variant="success">Normal</Badge>}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-xs text-muted-foreground">
                  Código: <span className="font-mono font-medium text-foreground">{shift.code}</span> | Supervisão: {shift.supervisorName}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <Users className="size-4" /> Ocupação
                    </span>
                    <span className="font-semibold text-foreground">
                      {shift.currentOccupancy} / {shift.capacity} alunos ({shift.occupancyPercentage}%)
                    </span>
                  </div>
                  <Progress value={shift.occupancyPercentage} className="h-2.5" />
                </div>

                <div className="flex justify-end pt-2">
                  <Link
                    href={`/turnos/ajuste-manual?shiftId=${shift.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Gerenciar Alunos
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
