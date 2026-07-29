"use client";

import { useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockTransferRequests } from "@/lib/mock-data";
import type { TransferRequestDTO } from "@/types";
import { Check, X } from "lucide-react";

export default function SolicitacoesPage() {
  const [requests, setRequests] = useState<TransferRequestDTO[]>(mockTransferRequests);

  const handleAction = (id: string, status: "APPROVED" | "REJECTED") => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const columns: DataTableColumn<TransferRequestDTO>[] = [
    {
      key: "studentName",
      header: "Aluno Solicitante",
      sortable: true,
      render: (req) => (
        <div>
          <p className="font-medium text-foreground">{req.studentName}</p>
          <p className="text-xs text-muted-foreground">Solicitado em: {req.requestedAt}</p>
        </div>
      ),
    },
    {
      key: "shifts",
      header: "Mudança Solicitada",
      render: (req) => (
        <div className="text-xs">
          <p className="text-muted-foreground">De: <span className="font-medium text-foreground">{req.currentShift}</span></p>
          <p className="text-primary font-medium">Para: <span>{req.targetShift}</span></p>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Motivo / Justificativa",
      render: (req) => (
        <p className="text-xs text-muted-foreground max-w-xs">{req.reason}</p>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (req) => {
        if (req.status === "APPROVED") return <Badge variant="success">Aprovada</Badge>;
        if (req.status === "REJECTED") return <Badge variant="danger">Rejeitada</Badge>;
        return <Badge variant="warning">Pendente</Badge>;
      },
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (req) => (
        req.status === "PENDING" ? (
          <div className="flex justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction(req.id, "APPROVED")}
              className="text-status-success-foreground border-status-success-foreground/30 hover:bg-status-success gap-1"
            >
              <Check className="size-3.5" /> Aprovar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction(req.id, "REJECTED")}
              className="text-status-danger-foreground border-status-danger-foreground/30 hover:bg-status-danger gap-1"
            >
              <X className="size-3.5" /> Rejeitar
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">Finalizada</span>
        )
      ),
    },
  ];

  return (
    <AppShell breadcrumbs={[{ label: "Solicitações Pendentes" }]}>
      <div className="space-y-6">
        <PageHeader
          title="Solicitações de Transferência"
          description="Analise e gerencie pedidos de troca de turno enviados por alunos e supervisores"
        />

        <DataTable
          columns={columns}
          data={requests}
          pageSize={10}
          searchable
          searchPlaceholder="Buscar por aluno..."
          searchKeys={["studentName", "reason"]}
          getRowKey={(row) => row.id}
        />
      </div>
    </AppShell>
  );
}
