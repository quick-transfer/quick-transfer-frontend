"use client";

import { FormEvent, useEffect, useState } from 'react';

import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClassDTO, StudentDTO } from "@/types";
import Link from "next/link";
import { Eye, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { createAppStudent, getAppStudents, getClasses } from '@/lib/application-api';

export default function AlunosPage() {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [classes, setClasses] = useState<ClassDTO[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("18");
  const [classId, setClassId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    Promise.all([getAppStudents(), getClasses()])
      .then(([studentData, classData]) => {
        setStudents(studentData);
        setClasses(classData);
        setClassId(classData[0]?.id ?? "");
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os alunos.');
      });
  }, []);

  const handleCreateStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAge = Number(age);
    if (!classId || !Number.isInteger(parsedAge) || parsedAge <= 0) {
      setError("Selecione uma turma e informe uma idade válida.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const created = await createAppStudent({
        name: name.trim(),
        email: email.trim(),
        age: parsedAge,
        classId,
      });
      setStudents((current) => [created, ...current]);
      setName("");
      setEmail("");
      setAge("18");
      setSuccessMsg("Aluno cadastrado com sucesso!");
      setTimeout(() => setSuccessMsg(""), 7000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível cadastrar o aluno.");
    } finally {
      setSaving(false);
    }
  };
  const columns: DataTableColumn<StudentDTO>[] = [
    {
      key: "name",
      header: "Aluno",
      sortable: true,
      render: (student) => {
        return (
          <div className="flex items-center gap-3">
            <div>
              <p className="font-medium text-foreground">{student.name}</p>
              <p className="text-xs text-muted-foreground">Matrícula: {student.registration}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "courseName",
      header: "Curso / Turma",
      render: (student) => (
        <div>
          <p className="font-medium text-foreground">{student.courseName}</p>
          <p className="text-xs text-muted-foreground">{student.className}</p>
        </div>
      ),
    },
    {
      key: "attendanceRate",
      header: "Frequência",
      sortable: true,
      render: (student) => (
        <span className="text-sm font-semibold text-foreground">
          {student.attendanceRate == null ? "Não informado" : `${student.attendanceRate}%`}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (student) => {
        if (student.status === "ACTIVE") return <Badge variant="success">Ativo</Badge>;
        if (student.status === "COMPLETED") return <Badge variant="info">Concluído</Badge>;
        return <Badge variant="neutral">Pausado</Badge>;
      },
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (student) => (
        <Link
          href={`/students/${student.id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
        >
          <Eye className="size-3.5" /> Detalhes
        </Link>
      ),
    },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Alunos" }]}>
      <div className="space-y-6">
        <PageHeader
          title="Diretório de Alunos Aprendizes"
          description="Consulte e gerencie os alunos cadastrados nos programas técnicos da unidade"
        />

        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <DataTable
              columns={columns}
              data={students}
              searchable
              searchPlaceholder="Buscar aluno por nome ou matrícula..."
              searchKeys={["name", "registration", "courseName"]}
              pageSize={10}
              getRowKey={(row) => row.id}
            />
          </div>

          <div className="sticky top-6 h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Cadastrar Aluno</h2>
              <p className="text-xs text-slate-500">Preencha os dados do aluno para efetuar o cadastro.</p>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <Label htmlFor="student-name" className="text-xs font-semibold text-slate-700">
                  Nome <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="student-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex: João da Silva"
                  className="mt-1 h-10 border-slate-200 text-sm"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="student-email" className="text-xs font-semibold text-slate-700">
                  E-mail <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="student-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Ex: joao.silva@email.com"
                  className="mt-1 h-10 border-slate-200 text-sm"
                  required
                />
              </div>

              <div>
                <Label htmlFor="student-age" className="text-xs font-semibold text-slate-700">
                  Idade <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="student-age"
                  type="number"
                  min={1}
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  className="mt-1 h-10 border-slate-200 text-sm"
                  required
                />
              </div>

              <div>
                <Label htmlFor="student-class" className="text-xs font-semibold text-slate-700">
                  Turma <span className="text-red-500">*</span>
                </Label>
                <select
                  id="student-class"
                  value={classId}
                  onChange={(event) => setClassId(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Selecione uma turma</option>
                  {classes.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                disabled={saving || classes.length === 0}
                className="mt-2 h-10 w-full gap-2 bg-primary-900 text-white hover:bg-primary-950"
              >
                <Save className="size-4" /> {saving ? "Cadastrando..." : "Cadastrar Aluno"}
              </Button>
            </form>
          </div>
        </div>

        {successMsg && (
          <div className="fixed right-6 top-20 z-50 max-w-sm rounded-lg bg-emerald-800 p-4 text-sm font-medium text-white shadow-xl">
            {successMsg}
          </div>
        )}
      </div>
    </AppShell>
  );
}
