"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AppShell, PageHeader } from "@/components/layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

        <Card>
          <CardHeader><CardTitle>Dados do aluno</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-name">Nome *</Label>
                <Input id="student-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-email">E-mail *</Label>
                <Input id="student-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-age">Idade *</Label>
                <Input id="student-age" type="number" min={1} value={age} onChange={(event) => setAge(event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-class">Turma *</Label>
                <select
                  id="student-class"
                  value={classId}
                  onChange={(event) => setClassId(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                  required
                >
                  <option value="">Selecione uma turma</option>
                  {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>
              <Button type="submit" disabled={saving || classes.length === 0} className="w-full">
                {saving ? "Cadastrando..." : "Cadastrar aluno"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
