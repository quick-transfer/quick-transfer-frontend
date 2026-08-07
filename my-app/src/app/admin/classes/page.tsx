"use client";

import { useEffect, useState } from 'react';

import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import type { ClassDTO } from "@/types";
import { Plus, GraduationCap, Edit } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getClasses, updateClass } from '@/lib/application-api';

export default function TurmasPage() {
  const [classes, setClasses] = useState<ClassDTO[]>([]);
  const [editing, setEditing] = useState<ClassDTO | null>(null);
  const [formName, setFormName] = useState('');
  const [formPeriod, setFormPeriod] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getClasses().then(setClasses).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar as turmas.');
    });
  }, []);

  const openEdit = (item: ClassDTO) => {
    setEditing(item);
    setFormName(item.name);
    setFormPeriod(item.period);
  };

  const handleSave = async () => {
    if (!editing || !formName.trim() || !formPeriod.trim()) return;
    setSaving(true);
    try {
      const saved = await updateClass({ ...editing, name: formName.trim(), period: formPeriod.trim() });
      setClasses((current) => current.map((item) => item.id === saved.id ? saved : item));
      setEditing(null);
      setError('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível atualizar a turma.');
    } finally {
      setSaving(false);
    }
  };
  const columns: DataTableColumn<ClassDTO>[] = [
    {
      key: "name",
      header: "Turma",
      sortable: true,
      render: (cls) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
            <GraduationCap className="size-4" />
          </div>
          <div>
            <p className="font-medium text-foreground">{cls.name}</p>
            <p className="text-xs text-muted-foreground">Código: {cls.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: "courseName",
      header: "Curso Vinculado",
      render: (cls) => (
        <span className="text-sm font-medium text-foreground">{cls.courseName}</span>
      ),
    },
    {
      key: "period",
      header: "Período",
      render: (cls) => (
        <Badge variant="outline">{cls.period}</Badge>
      ),
    },
    {
      key: "occupancy",
      header: "Ocupação",
      render: (cls) => (
        <span className="text-xs font-semibold text-foreground">
          {cls.totalStudents} / {cls.maxStudents} alunos
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (cls) => {
        if (cls.status === "IN_PROGRESS") return <Badge variant="success">Em Andamento</Badge>;
        if (cls.status === "PLANNED") return <Badge variant="info">Planejada</Badge>;
        return <Badge variant="neutral">Finalizada</Badge>;
      },
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (item) => (
        <Button variant="outline" size="sm" className="gap-1" onClick={() => openEdit(item)}>
          <Edit className="size-3.5" /> Editar
        </Button>
      ),
    },
  ];

  return (
    <AppShell
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Turmas" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Gerenciar Turmas"
          description="Controle de turmas ativas, planejamento de turmas e matrículas"
          actions={
            <Link
              href="/classes/new"
              className={cn(buttonVariants({ variant: "default" }), "gap-2 bg-primary text-white hover:bg-primary-700")}
            >
              <Plus className="size-4" /> Nova Turma
            </Link>
          }
        />

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}
        <DataTable
          columns={columns}
          data={classes}
          pageSize={10}
          searchable
          searchPlaceholder="Buscar turma por nome ou código..."
          searchKeys={["name", "code", "courseName"]}
          getRowKey={(row) => row.id}
        />
      </div>
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader><DialogTitle>Editar turma</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <label className="block space-y-1.5 text-sm font-medium">
              Nome
              <Input value={formName} onChange={(event) => setFormName(event.target.value)} />
            </label>
            <label className="block space-y-1.5 text-sm font-medium">
              Período
              <Input value={formPeriod} onChange={(event) => setFormPeriod(event.target.value)} />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={() => void handleSave()} disabled={saving || !formName.trim()}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
