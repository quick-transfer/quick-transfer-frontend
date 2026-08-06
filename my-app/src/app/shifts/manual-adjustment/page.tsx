"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { SearchInput } from "@/components/shared/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getStudents, type StudentResponse } from "@/lib/core-api";
import { assignStudentShift, getOperationalShifts, type OperationalShiftResponse } from "@/lib/operations-api";

export default function AjusteManualPage() {
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [shifts, setShifts] = useState<OperationalShiftResponse[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentResponse | null>(null);
  const [targetShift, setTargetShift] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getStudents({ size: 500, sort: "name,asc" }),
      getOperationalShifts(),
    ])
      .then(([studentResponse, shiftResponse]) => {
        if (!mounted) return;
        setStudents(studentResponse.filter((student) => student.statusStudent === "ENROLLED"));
        setShifts(shiftResponse.filter((shift) => shift.active));
      })
      .catch((requestError) => mounted && setError(
        requestError instanceof Error ? requestError.message : "Não foi possível carregar os dados de turno.",
      ));
    return () => { mounted = false; };
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.toLocaleLowerCase("pt-BR");
    return students.filter((student) =>
      [student.name, student.registration, student.course, student.shift]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(query),
    );
  }, [search, students]);

  const confirm = async () => {
    if (!selectedStudent || !targetShift) return;
    setSaving(true);
    setError("");
    try {
      const request = await assignStudentShift(selectedStudent.id, {
        targetShiftId: targetShift,
        reason: "Ajuste manual realizado pelo coordenador",
      });
      setStudents((current) => current.map((student) =>
        student.id === selectedStudent.id
          ? { ...student, operationalShiftId: request.targetShiftId, shift: request.targetShift }
          : student,
      ));
      const refreshedShifts = await getOperationalShifts();
      setShifts(refreshedShifts.filter((shift) => shift.active));
      setNotice(`Turno de ${selectedStudent.name} atualizado com sucesso.`);
      setSelectedStudent(null);
      setTargetShift("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível alterar o turno.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell breadcrumbs={[{ label: "Turnos", href: "/shifts" }, { label: "Ajuste manual" }]}>
      <div className="space-y-6">
        <PageHeader title="Ajuste Manual de Turnos" description="Redistribuição de alunos com validação automática de capacidade" />
        {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}
        <SearchInput placeholder="Buscar por nome, matrícula ou turno..." value={search} onChange={(event) => setSearch(event.target.value)} wrapperClassName="w-full sm:w-96" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="border-border shadow-sm">
              <CardHeader className="pb-2"><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-base">{student.name}</CardTitle><p className="text-xs text-muted-foreground">Matrícula: {student.registration}</p></div><Badge variant="success">Ativo</Badge></div></CardHeader>
              <CardContent className="space-y-3 pt-2 text-xs"><div><span className="font-medium text-muted-foreground">Curso:</span> {student.course}</div><div><span className="font-medium text-muted-foreground">Turno atual:</span> <strong>{student.shift}</strong></div><Button variant="outline" size="sm" className="mt-2 w-full gap-2" onClick={() => { setSelectedStudent(student); setTargetShift(""); }}><ArrowRightLeft className="size-3.5" />Mudar turno</Button></CardContent>
            </Card>
          ))}
        </div>

        <Sheet open={Boolean(selectedStudent)} onOpenChange={(open) => !open && !saving && setSelectedStudent(null)}>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader><SheetTitle>Reajustar turno do aluno</SheetTitle><SheetDescription>Selecione um turno ativo com capacidade disponível.</SheetDescription></SheetHeader>
            {selectedStudent && <div className="space-y-6 pt-6"><div className="space-y-2 rounded-lg bg-muted p-4 text-sm"><p className="font-semibold">{selectedStudent.name}</p><p className="text-xs text-muted-foreground">Matrícula: {selectedStudent.registration}</p><p className="text-xs text-muted-foreground">Turno atual: {selectedStudent.shift}</p></div><div className="space-y-2"><Label htmlFor="shift-select">Novo turno</Label><Select value={targetShift} onValueChange={(value) => setTargetShift(value ?? "")}><SelectTrigger id="shift-select"><SelectValue placeholder="Selecione um turno" /></SelectTrigger><SelectContent>{shifts.filter((shift) => shift.id !== selectedStudent.operationalShiftId && shift.status !== "FULL").map((shift) => <SelectItem key={shift.id} value={shift.id}>{shift.name} ({shift.currentOccupancy}/{shift.capacity})</SelectItem>)}</SelectContent></Select></div><div className="flex justify-end gap-2 pt-4"><Button variant="outline" disabled={saving} onClick={() => setSelectedStudent(null)}>Cancelar</Button><Button disabled={!targetShift || saving} onClick={() => void confirm()}>{saving ? "Salvando..." : "Confirmar troca"}</Button></div></div>}
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}
