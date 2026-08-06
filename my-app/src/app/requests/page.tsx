"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTransferRequests, resolveTransferRequest, type TransferRequestResponse } from "@/lib/operations-api";

export default function SolicitacoesPage() {
  const [requests, setRequests] = useState<TransferRequestResponse[]>([]);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;
    getTransferRequests({ size: 500, sort: "requestedAt,desc" })
      .then((response) => mounted && setRequests(response))
      .catch((requestError) => mounted && setError(
        requestError instanceof Error ? requestError.message : "Não foi possível carregar as solicitações.",
      ));
    return () => { mounted = false; };
  }, []);

  const handleAction = async (request: TransferRequestResponse, status: "APPROVED" | "REJECTED") => {
    setWorkingId(request.id);
    setError("");
    setNotice("");
    try {
      const updated = await resolveTransferRequest(request.id, { status });
      setRequests((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(status === "APPROVED" ? "Transferência aprovada e turno atualizado." : "Solicitação rejeitada.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível concluir a solicitação.");
    } finally {
      setWorkingId(null);
    }
  };

  const columns: DataTableColumn<TransferRequestResponse>[] = [
    { key: "studentName", header: "Aluno solicitante", sortable: true, render: (request) => <div><p className="font-medium">{request.studentName}</p><p className="text-xs text-muted-foreground">{request.registration} · {new Date(request.requestedAt).toLocaleDateString("pt-BR")}</p></div> },
    { key: "shifts", header: "Mudança solicitada", render: (request) => <div className="text-xs"><p>De: <strong>{request.currentShift}</strong></p><p className="text-primary">Para: <strong>{request.targetShift}</strong></p></div> },
    { key: "reason", header: "Motivo / justificativa", render: (request) => <p className="max-w-xs text-xs text-muted-foreground">{request.reason}</p> },
    { key: "requestedByName", header: "Solicitado por", render: (request) => <span className="text-sm">{request.requestedByName}</span> },
    { key: "status", header: "Status", render: (request) => request.status === "APPROVED" ? <Badge variant="success">Aprovada</Badge> : request.status === "REJECTED" ? <Badge variant="danger">Rejeitada</Badge> : <Badge variant="warning">Pendente</Badge> },
    { key: "actions", header: "Ações", className: "text-right", render: (request) => request.status === "PENDING" ? <div className="flex justify-end gap-1.5"><Button variant="outline" size="sm" disabled={workingId === request.id} onClick={() => void handleAction(request, "APPROVED")}><Check className="size-3.5" />Aprovar</Button><Button variant="outline" size="sm" className="text-destructive" disabled={workingId === request.id} onClick={() => void handleAction(request, "REJECTED")}><X className="size-3.5" />Rejeitar</Button></div> : <span className="text-xs italic text-muted-foreground">Finalizada</span> },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Solicitações" }]}>
      <div className="space-y-6">
        <PageHeader title="Solicitações de Transferência" description="Analise pedidos de troca de turno com controle de capacidade" />
        {error && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div>}
        <DataTable columns={columns} data={requests} pageSize={10} searchable searchPlaceholder="Buscar por aluno ou motivo..." searchKeys={["studentName", "registration", "reason"]} getRowKey={(row) => row.id} />
      </div>
    </AppShell>
  );
}
