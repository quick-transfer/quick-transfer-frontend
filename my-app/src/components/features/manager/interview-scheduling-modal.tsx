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

interface InterviewSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  // When provided, the vacancy is pre-selected and the dropdown is replaced with
  // a read-only display — used when opening the modal from a vacancy's student list.
  vacancyTitle: string;
  vacancyId: string;
  onConfirm: (data: { date: string; time: string; vacancyId: string }) => void | Promise<void>;
}

export function InterviewSchedulingModal({
  isOpen,
  onClose,
  candidateName,
  vacancyTitle,
  vacancyId,
  onConfirm,
}: InterviewSchedulingModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // "sv-SE" locale produces YYYY-MM-DD, which is the format <input type="date"> requires.
  const today = new Date();
  const todayStr = today.toLocaleDateString("sv-SE");

  // Business rule: interviews may not be scheduled more than 1 year out to
  // prevent phantom bookings from blocking calendar slots indefinitely.
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() + 1);
  const maxDateStr = maxDate.toLocaleDateString("sv-SE");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // String comparison works here because both dates are YYYY-MM-DD — ISO 8601
    // lexicographic order equals chronological order.
    if (date < todayStr || date > maxDateStr) {
      setError("Selecione uma data entre hoje e no máximo 1 ano a partir de hoje.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onConfirm({ date, time, vacancyId });
      setDate("");
      setTime("");
      setError("");
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível agendar a entrevista.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Agendar Entrevista
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Agende uma entrevista com <strong className="text-slate-800">{candidateName}</strong>.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Seleção de Vaga em Aberto */}
          <div className="space-y-1.5">
            <Label htmlFor="interview-vacancy" className="text-xs font-semibold text-slate-700">
              Vaga em Aberto
            </Label>
            <div className="h-10 px-3 flex items-center bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 font-medium">
              {vacancyTitle}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="interview-date"
                className="text-xs font-semibold text-slate-700"
              >
                Data
              </Label>
              <Input
                id="interview-date"
                type="date"
                required
                min={todayStr}
                max={maxDateStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 text-sm bg-white border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="interview-time"
                className="text-xs font-semibold text-slate-700"
              >
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
              {isSubmitting
                ? "Agendando..."
                : "Confirmar agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
