"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deleteClass, getClasses, updateClass, type ClassResponse } from "@/lib/core-api";
import { cn } from "@/lib/utils";
import { Plus, GraduationCap, Edit, Trash2 } from "lucide-react";

export default function TurmasAdminPage() {
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [editing, setEditing] = useState<ClassResponse | null>(null);
  const [name, setName] = useState("");
  const [maxStudents, setMaxStudents] = useState(30);
  const [status, setStatus] = useState<ClassResponse["status"]>("NOT_STARTED");
  const [shift, setShift] = useState<ClassResponse["shiftClass"]>("MORNING");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    getClasses({ size: 200, sort: "startDate,desc" })
      .then((response) => mounted && setClasses(response))
      .catch((requestError) => mounted && setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar as turmas."));
    return () => { mounted = false; };
  }, []);

  const openEdit = (classEntity: ClassResponse) => {
    setEditing(classEntity);
    setName(classEntity.name);
    setMaxStudents(classEntity.maxStudents);
    setStatus(classEntity.status);
    setShift(classEntity.shiftClass);
    setError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const saved = await updateClass(editing.id, { name, maxStudents, status, shiftClass: shift });
      setClasses((current) => current.map((item) => item.id === saved.id ? saved : item));
      setEditing(null);
      setNotice("Turma atualizada com sucesso.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar a turma.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (classEntity: ClassResponse) => {
    if (!window.confirm(`Excluir a turma "${classEntity.name}"?`)) return;
    setError("");
    try {
      await deleteClass(classEntity.id);
      setClasses((current) => current.filter((item) => item.id !== classEntity.id));
      setNotice(`Turma "${classEntity.name}" excluída com sucesso.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível excluir a turma.");
    }
  };

  const columns: DataTableColumn<ClassResponse>[] = [
    { key: "name", header: "Turma", sortable: true, render: (classEntity) => <div className="flex items-center gap-3"><div className="rounded-lg bg-primary-50 p-2 text-primary-600"><GraduationCap className="size-4" /></div><div><p className="font-medium">{classEntity.name}</p><p className="text-xs text-muted-foreground">Código: {classEntity.acronym}</p></div></div> },
    { key: "courseName", header: "Curso Vinculado", render: (classEntity) => <span className="text-sm font-medium">{classEntity.courseName}</span> },
    { key: "period", header: "Período", render: (classEntity) => <div><Badge variant="outline">{classEntity.shiftClass}</Badge><p className="mt-1 text-xs text-muted-foreground">{classEntity.startDate} a {classEntity.finishDate}</p></div> },
    { key: "occupancy", header: "Ocupação", render: (classEntity) => <span className="text-xs font-semibold">{classEntity.totalStudents} / {classEntity.maxStudents} alunos</span> },
    { key: "status", header: "Status", render: (classEntity) => classEntity.status === "ON_GOING" ? <Badge variant="success">Em andamento</Badge> : classEntity.status === "NOT_STARTED" ? <Badge variant="info">Planejada</Badge> : <Badge variant="neutral">Finalizada</Badge> },
    { key: "actions", header: "Ações", className: "text-right", render: (classEntity) => <div className="flex justify-end gap-1"><Button variant="outline" size="sm" className="gap-1" onClick={() => openEdit(classEntity)}><Edit className="size-3.5" /> Editar</Button><Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => void remove(classEntity)}><Trash2 className="size-3.5" /></Button></div> },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Turmas" }]}>
      <div className="space-y-6">
        <PageHeader title="Gerenciar Turmas" description="Controle de turmas ativas, planejamento e matrículas" actions={<Link href="/classes/new" className={cn(buttonVariants(), "gap-2")}><Plus className="size-4" /> Nova Turma</Link>} />
        {error && !editing && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}
        <DataTable columns={columns} data={classes} pageSize={10} searchable searchPlaceholder="Buscar turma por nome ou código..." searchKeys={["name", "acronym", "courseName"]} getRowKey={(row) => row.id} />
      </div>
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && !saving && setEditing(null)}>
        <DialogContent><form onSubmit={submit} className="space-y-4"><DialogHeader><DialogTitle>Editar turma</DialogTitle></DialogHeader>{error && <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}<Input required value={name} onChange={(event) => setName(event.target.value)} /><Input required type="number" min={1} value={maxStudents} onChange={(event) => setMaxStudents(Number(event.target.value))} /><select className="h-10 w-full rounded-md border px-3 text-sm" value={shift} onChange={(event) => setShift(event.target.value as ClassResponse["shiftClass"])}><option value="MORNING">Matutino</option><option value="AFTERNOON">Vespertino</option><option value="NIGHT">Noturno</option></select><select className="h-10 w-full rounded-md border px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value as ClassResponse["status"])}><option value="NOT_STARTED">Planejada</option><option value="ON_GOING">Em andamento</option><option value="FINISHED">Finalizada</option></select><DialogFooter><Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={saving}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button></DialogFooter></form></DialogContent>
      </Dialog>
    </AppShell>
  );
}
