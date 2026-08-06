"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, Users } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getOperationalShifts, type OperationalShiftResponse } from "@/lib/operations-api";
import { cn } from "@/lib/utils";

export default function TurnosPage() {
  const [shifts, setShifts] = useState<OperationalShiftResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    getOperationalShifts()
      .then((response) => mounted && setShifts(response.filter((shift) => shift.active)))
      .catch((requestError) => mounted && setError(
        requestError instanceof Error ? requestError.message : "Não foi possível carregar os turnos.",
      ))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <AppShell breadcrumbs={[{ label: "Turnos" }]}>
      <div className="space-y-6">
        <PageHeader
          title="Turnos Técnico/Operacionais"
          description="Gestão de capacidade e ocupação por período de trabalho"
          actions={
            <Link href="/shifts/manual-adjustment" className={cn(buttonVariants(), "gap-2")}>
              <SlidersHorizontal className="size-4" />Ajuste manual
            </Link>
          }
        />

        {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {loading ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-muted-foreground">Carregando turnos...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shifts.map((shift) => (
              <Card key={shift.id} className="overflow-hidden border-border shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-semibold">{shift.name}</CardTitle>
                  {shift.status === "FULL" && <Badge variant="danger">Lotado</Badge>}
                  {shift.status === "HIGH_DEMAND" && <Badge variant="warning">Alta demanda</Badge>}
                  {shift.status === "NORMAL" && <Badge variant="success">Normal</Badge>}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xs text-muted-foreground">
                    Código: <span className="font-mono font-medium text-foreground">{shift.code}</span>
                    {shift.supervisorName && <> · Supervisão: {shift.supervisorName}</>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-medium text-muted-foreground"><Users className="size-4" />Ocupação</span>
                      <span className="font-semibold">{shift.currentOccupancy} / {shift.capacity} alunos ({shift.occupancyPercentage}%)</span>
                    </div>
                    <Progress value={shift.occupancyPercentage} className="h-2.5" />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Link href={`/shifts/manual-adjustment?shiftId=${shift.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>Gerenciar alunos</Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            {shifts.length === 0 && <p className="text-sm text-muted-foreground">Nenhum turno ativo cadastrado.</p>}
          </div>
        )}
      </div>
    </AppShell>
  );
}
