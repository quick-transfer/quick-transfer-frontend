"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, PageHeader } from "@/components/layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { mockCourses, mockStudents } from "@/lib/mock-data";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function NovaTurmaPage() {
  const router = useRouter();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [course, setCourse] = useState("");
  const [period, setPeriod] = useState("");

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Turma "${className}" cadastrada com ${selectedStudents.length} alunos!`);
    router.push("/admin/turmas");
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: "Turmas", href: "/admin/turmas" },
        { label: "Nova Turma" },
      ]}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        <PageHeader
          title="Criar Nova Turma"
          description="Cadastre uma nova turma e vincule os alunos aprendizes"
          actions={
            <Link
              href="/admin/turmas"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <ArrowLeft className="size-4" /> Voltar
            </Link>
          }
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Informações da Turma</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="className">Nome da Turma</Label>
                <Input
                  id="className"
                  placeholder="Ex: Turma C - Eletromecânica"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classCode">Código da Turma</Label>
                <Input
                  id="classCode"
                  placeholder="Ex: TEL-C-2026"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Curso Associado</Label>
                <Select value={course} onValueChange={(val) => setCourse(val ?? "")} required>
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Selecione o curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCourses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Período de Aulas</Label>
                <Select value={period} onValueChange={(val) => setPeriod(val ?? "")} required>
                  <SelectTrigger id="period">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matutino">Matutino (07:30 - 11:30)</SelectItem>
                    <SelectItem value="Vespertino">Vespertino (13:30 - 17:30)</SelectItem>
                    <SelectItem value="Noturno">Noturno (18:30 - 22:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Student Selection List */}
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Vincular Alunos</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Selecione os alunos disponíveis para integrar esta turma ({selectedStudents.length} selecionados)
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`std-${student.id}`}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                    <div>
                      <Label htmlFor={`std-${student.id}`} className="font-medium cursor-pointer">
                        {student.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Matrícula: {student.registration} | Curso atual: {student.courseName}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link
              href="/admin/turmas"
              className={buttonVariants({ variant: "outline" })}
            >
              Cancelar
            </Link>
            <Button type="submit" className="gap-2 bg-primary text-white hover:bg-primary-700">
              <Save className="size-4" /> Cadastrar Turma
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
