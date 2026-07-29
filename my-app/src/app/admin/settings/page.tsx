"use client";

import { AppShell, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <AppShell
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Configurações" },
      ]}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        <PageHeader
          title="Configurações do Sistema"
          description="Parâmetros globais, políticas de capacidade de turno e integrações"
        />

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Parâmetros de Capacidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxShift">Capacidade Máxima Padrão por Turno</Label>
                <Input id="maxShift" type="number" defaultValue={50} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alertPercentage">Percentual para Alerta de Alta Demanda (%)</Label>
                <Input id="alertPercentage" type="number" defaultValue={85} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Notificações e E-mails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailSender">E-mail Remetente de Notificações</Label>
              <Input id="emailSender" type="email" defaultValue="notificacoes.quicktransfer@weg.net" />
            </div>

            <Separator />

            <div className="flex justify-end pt-2">
              <Button
                className="gap-2 bg-primary text-white hover:bg-primary-700"
                onClick={() => alert("Configurações salvas com sucesso!")}
              >
                <Save className="size-4" /> Salvar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
