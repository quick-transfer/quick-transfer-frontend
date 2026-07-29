"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Vagas em aberto disponíveis para o gestor selecionar
const openVacancies = [
  { id: "vac-1", title: "Montador de Painéis Elétricos" },
  { id: "vac-2", title: "Técnico de Automação Jr" },
];

interface InterviewSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  vacancyTitle?: string;
  onConfirm: (data: { date: string; time: string; notes: string; vacancyId: string }) => void;
}

export function InterviewSchedulingModal({
  isOpen,
  onClose,
  candidateName,
  vacancyTitle,
  onConfirm,
}: InterviewSchedulingModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedVacancyId, setSelectedVacancyId] = useState(openVacancies[0]?.id ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simula a requisição à API e notificação por e-mail ao coordenador
    // TODO: Integrar endpoint de notificação ao coordenador responsável
    setTimeout(() => {
      onConfirm({ date, time, notes, vacancyId: selectedVacancyId });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Agendar Entrevista
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Agende uma entrevista com <strong className="text-slate-800">{candidateName}</strong>. O coordenador responsável será notificado por e-mail.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Seleção de Vaga em Aberto */}
          <div className="space-y-1.5">
            <Label htmlFor="interview-vacancy" className="text-xs font-semibold text-slate-700">
              Vaga em Aberto
            </Label>
            {vacancyTitle ? (
              <div className="h-10 px-3 flex items-center bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 font-medium">
                {vacancyTitle}
              </div>
            ) : (
              <select
                id="interview-vacancy"
                value={selectedVacancyId}
                onChange={(e) => setSelectedVacancyId(e.target.value)}
                required
                className="h-10 w-full px-3 bg-white border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {openVacancies.map((v) => (
                  <option key={v.id} value={v.id}>{v.title}</option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="interview-date" className="text-xs font-semibold text-slate-700">
                Data
              </Label>
              <Input
                id="interview-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 text-sm bg-white border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="interview-time" className="text-xs font-semibold text-slate-700">
                Horário
              </Label>
              <Input
                id="interview-time"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-10 text-sm bg-white border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="interview-notes" className="text-xs font-semibold text-slate-700">
              Observações / Pauta
            </Label>
            <textarea
              id="interview-notes"
              rows={3}
              placeholder="Adicione informações adicionais para o coordenador ou candidato..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-900 text-white hover:bg-primary-950"
            >
              {isSubmitting ? "Agendando..." : "Confirmar e Notificar Coordenador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

