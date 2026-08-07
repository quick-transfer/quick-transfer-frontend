"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

import { AppShell, PageHeader } from "@/components/layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAppStudent, getClasses } from "@/lib/application-api";
import { cn } from "@/lib/utils";
import type { ClassDTO } from "@/types";

export default function NewStudentPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassDTO[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("18");
  const [classId, setClassId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getClasses()
      .then((data) => {
        setClasses(data);
        setClassId(data[0]?.id ?? "");
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar as turmas.");
      });
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsedAge = Number(age);
    if (!classId || !Number.isInteger(parsedAge) || parsedAge <= 0) {
      setError("Selecione uma turma e informe uma idade válida.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await createAppStudent({
        name: name.trim(),
        email: email.trim(),
        age: parsedAge,
        classId,
      });
      router.push("/students");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível cadastrar o aluno.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell breadcrumbs={[{ label: "Alunos", href: "/students" }, { label: "Novo aluno" }]}>
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader
          title="Cadastrar aluno"
          description="O aluno é uma entidade acadêmica e não recebe acesso ao sistema."
          actions={
            <Link href="/students" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
              <ArrowLeft className="size-4" /> Voltar
            </Link>
          }
        />

        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <div className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Cadastrar Aluno</h2>
            <p className="text-xs text-slate-500">Preencha os dados do aluno para efetuar o cadastro.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
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
    </AppShell>
  );
}
