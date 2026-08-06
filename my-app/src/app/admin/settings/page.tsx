"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getSystemSettings, updateSystemSettings } from "@/lib/operations-api";

export default function ConfiguracoesPage() {
  const [defaultShiftCapacity, setDefaultShiftCapacity] = useState(50);
  const [highDemandPercentage, setHighDemandPercentage] = useState(85);
  const [emailSender, setEmailSender] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    getSystemSettings()
      .then((settings) => {
        if (!mounted) return;
        setDefaultShiftCapacity(settings.defaultShiftCapacity);
        setHighDemandPercentage(settings.highDemandPercentage);
        setEmailSender(settings.emailSender);
      })
      .catch((requestError) => mounted && setError(
        requestError instanceof Error ? requestError.message : "Não foi possível carregar as configurações.",
      ));
    return () => { mounted = false; };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const settings = await updateSystemSettings({ defaultShiftCapacity, highDemandPercentage, emailSender });
      setDefaultShiftCapacity(settings.defaultShiftCapacity);
      setHighDemandPercentage(settings.highDemandPercentage);
      setEmailSender(settings.emailSender);
      setNotice("Configurações salvas com sucesso.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível salvar as configurações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Configurações" }]}>
      <form onSubmit={submit} className="mx-auto max-w-4xl space-y-6">
        <PageHeader title="Configurações do Sistema" description="Parâmetros globais de capacidade e notificações" />
        {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}
        <Card><CardHeader><CardTitle className="text-base">Parâmetros de capacidade</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="maxShift">Capacidade máxima padrão por turno</Label><Input id="maxShift" required min={1} type="number" value={defaultShiftCapacity} onChange={(event) => setDefaultShiftCapacity(Number(event.target.value))} /></div><div className="space-y-2"><Label htmlFor="alertPercentage">Alerta de alta demanda (%)</Label><Input id="alertPercentage" required min={1} max={100} type="number" value={highDemandPercentage} onChange={(event) => setHighDemandPercentage(Number(event.target.value))} /></div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Notificações e e-mails</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="emailSender">E-mail remetente</Label><Input id="emailSender" required type="email" value={emailSender} onChange={(event) => setEmailSender(event.target.value)} /></div><Separator /><div className="flex justify-end"><Button type="submit" disabled={saving}><Save className="size-4" />{saving ? "Salvando..." : "Salvar configurações"}</Button></div></CardContent></Card>
      </form>
    </AppShell>
  );
}
