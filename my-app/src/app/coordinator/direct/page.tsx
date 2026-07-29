"use client";

import { useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { mockStudents, mockVacancies } from "@/lib/mock-data";
import type { StudentDTO, VacancyDTO } from "@/types";
import { Users, Briefcase, Search, ChevronRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Step = "select-vacancy" | "select-student";

export default function CoordinatorDirectPage() {
  const [step, setStep] = useState<Step>("select-vacancy");
  const [searchVacancy, setSearchVacancy] = useState("");
  const [searchStudent, setSearchStudent] = useState("");
  const [selectedVacancy, setSelectedVacancy] = useState<VacancyDTO | null>(null);
  const [directedStudentId, setDirectedStudentId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingStudent, setPendingStudent] = useState<StudentDTO | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const openVacancies = mockVacancies.filter((v) => v.status === "OPEN" || v.status === "URGENT");
  const availableStudents = mockStudents.filter((s) => s.status === "ACTIVE" || s.status === "TRANSFERRING");

  const filteredVacancies = openVacancies.filter(
    (v) =>
      v.title.toLowerCase().includes(searchVacancy.toLowerCase()) ||
      v.department.toLowerCase().includes(searchVacancy.toLowerCase())
  );

  const filteredStudents = availableStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.registration.includes(searchStudent)
  );

  const handleSelectVacancy = (vacancy: VacancyDTO) => {
    setSelectedVacancy(vacancy);
    setStep("select-student");
  };

  const handleDirectStudent = (student: StudentDTO) => {
    setPendingStudent(student);
    setIsConfirmOpen(true);
  };

  const handleConfirmDirection = () => {
    if (!pendingStudent) return;
    setDirectedStudentId(pendingStudent.id);
    setIsConfirmOpen(false);
    setSuccessMsg(
      `${pendingStudent.name} foi direcionado(a) para a vaga "${selectedVacancy?.title}" com sucesso! O gestor responsável será notificado.`
    );
    setTimeout(() => setSuccessMsg(""), 6000);
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: "Painel", href: "/dashboard" },
        { label: "Direcionar Alunos" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Direcionar Alunos para Vagas"
          description="Visualize as vagas em aberto e direcione alunos disponíveis para as oportunidades de aprendizagem"
        />

        {/* Indicador de Steps */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 text-sm font-semibold ${step === "select-vacancy" ? "text-primary-800" : "text-slate-400"}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === "select-vacancy" ? "bg-primary-800 text-white" : "bg-slate-200 text-slate-500"}`}>
              1
            </div>
            Selecionar Vaga
          </div>
          <ChevronRight className="size-4 text-slate-300" />
          <div className={`flex items-center gap-2 text-sm font-semibold ${step === "select-student" ? "text-primary-800" : "text-slate-400"}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === "select-student" ? "bg-primary-800 text-white" : "bg-slate-200 text-slate-500"}`}>
              2
            </div>
            Selecionar Aluno
          </div>
        </div>

        {/* Step 1 - Vagas em Aberto */}
        {step === "select-vacancy" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Buscar vagas em aberto..."
                value={searchVacancy}
                onChange={(e) => setSearchVacancy(e.target.value)}
                className="pl-10 h-11 bg-white border-slate-200 rounded-xl text-sm"
              />
            </div>

            {filteredVacancies.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                <Briefcase className="size-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Nenhuma vaga em aberto encontrada.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredVacancies.map((vacancy) => (
                  <button
                    key={vacancy.id}
                    onClick={() => handleSelectVacancy(vacancy)}
                    className="text-left bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-primary-300 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
                        <Briefcase className="size-4" />
                      </div>
                      {vacancy.status === "URGENT" ? (
                        <Badge variant="danger">Urgente</Badge>
                      ) : (
                        <Badge variant="success">Aberta</Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1">{vacancy.title}</h3>
                    <p className="text-xs text-slate-500 mb-3">{vacancy.department} · {vacancy.location}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600">
                        {vacancy.filledSpots} / {vacancy.totalSpots} vagas preenchidas
                      </span>
                      <ChevronRight className="size-4 text-slate-300 group-hover:text-primary-600 transition" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2 - Alunos Disponíveis */}
        {step === "select-student" && selectedVacancy && (
          <div className="space-y-4">
            {/* Card da vaga selecionada */}
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-100 text-primary-700">
                  <Briefcase className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-primary-600 font-medium">Vaga Selecionada</p>
                  <p className="text-sm font-bold text-primary-900">{selectedVacancy.title}</p>
                  <p className="text-xs text-primary-700">{selectedVacancy.department} · {selectedVacancy.location}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-primary-700 hover:text-primary-900"
                onClick={() => { setStep("select-vacancy"); setDirectedStudentId(null); }}
              >
                <ArrowLeft className="size-3.5" /> Trocar vaga
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Buscar aluno por nome ou matrícula..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="pl-10 h-11 bg-white border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="space-y-3">
              {filteredStudents.map((student) => {
                const initials = student.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
                const isDirected = directedStudentId === student.id;

                return (
                  <div
                    key={student.id}
                    className={`bg-white rounded-xl border p-4 flex items-center justify-between gap-4 transition ${isDirected ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200"}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarImage src={student.avatarUrl} />
                        <AvatarFallback className="bg-primary-600 text-white text-xs font-bold">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500">Matrícula: {student.registration} · {student.className}</p>
                        <p className="text-xs text-slate-400">{student.courseName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-semibold text-slate-700">Frequência: {student.attendanceRate}%</p>
                        <p className="text-xs text-slate-500">Nota: {student.performanceGrade}</p>
                      </div>
                      {isDirected ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-full">
                          <CheckCircle2 className="size-3.5" /> Direcionado
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-primary-900 text-white hover:bg-primary-950 text-xs font-semibold"
                          onClick={() => handleDirectStudent(student)}
                        >
                          <Users className="size-3.5 mr-1" /> Direcionar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmação */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-sm bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Confirmar Direcionamento</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Deseja direcionar <strong className="text-slate-800">{pendingStudent?.name}</strong> para a vaga{" "}
              <strong className="text-slate-800">{selectedVacancy?.title}</strong>? O gestor responsável será notificado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmDirection} className="bg-primary-900 text-white hover:bg-primary-950">
              Confirmar Direcionamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast de sucesso */}
      {successMsg && (
        <div className="fixed top-20 right-6 z-50 max-w-md p-4 bg-emerald-800 text-white rounded-lg shadow-xl border border-emerald-700 text-sm font-medium">
          {successMsg}
        </div>
      )}
    </AppShell>
  );
}
