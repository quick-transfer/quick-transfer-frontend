"use client";

import { useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { SearchInput } from "@/components/shared/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockStudents, mockShifts } from "@/lib/mock-data";
import type { StudentDTO } from "@/types";
import { UserCheck, UserX, ArrowRightLeft } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function AjusteManualPage() {
  const [selectedStudent, setSelectedStudent] = useState<StudentDTO | null>(null);
  const [targetShift, setTargetShift] = useState<string>("");
  const [search, setSearch] = useState("");

  const filteredStudents = mockStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.registration.includes(search)
  );

  return (
    <AppShell
      breadcrumbs={[
        { label: "Turnos", href: "/turnos" },
        { label: "Ajuste Manual" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Ajuste Manual de Turnos"
          description="Alocação e redistribuição manual de alunos entre os turnos disponíveis"
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            placeholder="Buscar por nome ou matrícula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            wrapperClassName="w-full sm:w-80"
          />
        </div>

        {/* Student List */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">{student.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">Matrícula: {student.registration}</p>
                  </div>
                  <Badge variant={student.status === "ACTIVE" ? "success" : "warning"}>
                    {student.status === "ACTIVE" ? "Ativo" : "Em Transferência"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-2 text-xs">
                <div>
                  <span className="text-muted-foreground font-medium">Curso:</span> {student.courseName}
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Turno Atual:</span>{" "}
                  <span className="font-semibold text-primary">{student.shift}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 mt-2"
                  onClick={() => {
                    setSelectedStudent(student);
                    setTargetShift("");
                  }}
                >
                  <ArrowRightLeft className="size-3.5" />
                  Mudar Turno
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sheet / Drawer for Manual Shift Adjustment */}
        <Sheet open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Reajustar Turno de Aluno</SheetTitle>
              <SheetDescription>
                Selecione o novo turno de trabalho para o aluno selecionado.
              </SheetDescription>
            </SheetHeader>

            {selectedStudent && (
              <div className="space-y-6 pt-6">
                <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                  <p className="font-semibold text-foreground">{selectedStudent.name}</p>
                  <p className="text-xs text-muted-foreground">Matrícula: {selectedStudent.registration}</p>
                  <p className="text-xs text-muted-foreground">Turno Atual: {selectedStudent.shift}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shift-select">Novo Turno Desejado</Label>
                  <Select value={targetShift} onValueChange={(val) => setTargetShift(val ?? "")}>
                    <SelectTrigger id="shift-select">
                      <SelectValue placeholder="Selecione um turno" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockShifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.name} ({shift.currentOccupancy}/{shift.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4 justify-end">
                  <Button variant="outline" onClick={() => setSelectedStudent(null)}>
                    Cancelar
                  </Button>
                  <Button
                    disabled={!targetShift}
                    onClick={() => {
                      alert(`Turno de ${selectedStudent.name} reajustado com sucesso!`);
                      setSelectedStudent(null);
                    }}
                    className="bg-primary text-white hover:bg-primary-700"
                  >
                    Confirmar Troca
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}
