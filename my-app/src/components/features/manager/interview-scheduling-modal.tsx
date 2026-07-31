"use client";

import { FormEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Manager, Place } from "@/lib/manager-api";

interface InterviewFormData {
  dateTime: string;
  placeId: string;
  managerId: string;
  interviewerName: string;
}

interface InterviewSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  vacancyTitle: string;
  places: Place[];
  managers: Manager[];
  onConfirm: (data: InterviewFormData) => Promise<void>;
}

export function InterviewSchedulingModal({
  isOpen,
  onClose,
  candidateName,
  vacancyTitle,
  places,
  managers,
  onConfirm,
}: InterviewSchedulingModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [placeId, setPlaceId] = useState(places[0]?.id || "");
  const [managerId, setManagerId] = useState(managers[0]?.id || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const now = new Date();
  const today = now.toLocaleDateString("sv-SE");
  const maxDate = new Date(now);
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateValue = maxDate.toLocaleDateString("sv-SE");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!date || !time || !placeId || !managerId) {
      setError("Preencha data, horário, local e gestor.");
      return;
    }

    const dateTime = `${date}T${time}:00`;
    if (new Date(dateTime).getTime() <= Date.now()) {
      setError("Selecione um horário futuro.");
      return;
    }

    const manager = managers.find((item) => item.id === managerId);
    if (!manager) {
      setError("Selecione um gestor válido.");
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm({
        dateTime,
        placeId,
        managerId,
        interviewerName: manager.name,
      });
      setDate("");
      setTime("");
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível agendar a entrevista."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agendar entrevista</DialogTitle>
          <DialogDescription>
            Entrevista de <strong>{candidateName}</strong> para <strong>{vacancyTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="interview-date">Data</Label>
              <Input id="interview-date" type="date" min={today} max={maxDateValue} value={date} onChange={(event) => setDate(event.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="interview-time">Horário</Label>
              <Input id="interview-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="interview-place">Local</Label>
            <select id="interview-place" value={placeId} onChange={(event) => setPlaceId(event.target.value)} required className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
              <option value="">Selecione um local</option>
              {places.map((place) => <option key={place.id} value={place.id}>{place.placeName} · {place.park} · {place.section}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="interview-manager">Gestor responsável</Label>
            <select id="interview-manager" value={managerId} onChange={(event) => setManagerId(event.target.value)} required className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
              <option value="">Selecione um gestor</option>
              {managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.name} · {manager.section}</option>)}
            </select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={submitting || places.length === 0 || managers.length === 0} className="bg-primary-900 text-white">
              {submitting ? "Agendando..." : "Confirmar e enviar convite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
