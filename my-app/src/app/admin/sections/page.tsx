"use client";

import { useState } from "react";
import { AppShell, PageHeader } from "@/components/layout";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
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
import { Plus, Briefcase, MapPin, Eye, Users, CalendarCheck } from "lucide-react";
import { ToastCard } from "@/components/ui/toast-card";

// ── Tipos do backend ──────────────────────────────────────────────────────────
type Park = "NORTE" | "SUL" | "CENTRO";
type Section = "PRODUCAO" | "MANUTENCAO" | "QUALIDADE" | "TI" | "LOGISTICA";

interface VacancyRef {
  id: string;
  title: string;
  status: "OPEN" | "CLOSED" | "URGENT";
}

interface InterviewRef {
  id: string;
  candidateName: string;
  scheduledDate: string;
  status: "SCHEDULED" | "APPROVED" | "REJECTED" | "PENDING";
}

interface ManagerSectionDTO {
  id: string;
  placeName: string;
  park: Park;
  section: Section;
  vacancies: VacancyRef[];
  interviews: InterviewRef[];
}

// ── Dados Mock alinhados ao backend ──────────────────────────────────────────
const mockSections: ManagerSectionDTO[] = [
  {
    id: "sec-1",
    placeName: "Unidade Fabril 1 - Jaraguá do Sul",
    park: "NORTE",
    section: "PRODUCAO",
    vacancies: [
      { id: "vac-1", title: "Aprendiz de Montagem Elétrica", status: "OPEN" },
      { id: "vac-2", title: "Operador CNC Aprendiz", status: "URGENT" },
    ],
    interviews: [
      { id: "int-1", candidateName: "Gabriel Santos", scheduledDate: "2026-07-25", status: "SCHEDULED" },
    ],
  },
  {
    id: "sec-2",
    placeName: "Unidade Fabril 2 - Guaramirim",
    park: "SUL",
    section: "MANUTENCAO",
    vacancies: [
      { id: "vac-3", title: "Técnico em Manutenção Preventiva", status: "CLOSED" },
    ],
    interviews: [
      { id: "int-2", candidateName: "Beatriz Lima", scheduledDate: "2026-07-24", status: "APPROVED" },
      { id: "int-3", candidateName: "Matheus Rocha", scheduledDate: "2026-07-22", status: "REJECTED" },
    ],
  },
  {
    id: "sec-3",
    placeName: "Centro de Treinamento Técnico",
    park: "CENTRO",
    section: "QUALIDADE",
    vacancies: [],
    interviews: [],
  },
];

const parkLabels: Record<Park, string> = {
  NORTE: "Parque Norte",
  SUL: "Parque Sul",
  CENTRO: "Centro",
};

const sectionLabels: Record<Section, string> = {
  PRODUCAO: "Produção",
  MANUTENCAO: "Manutenção",
  QUALIDADE: "Qualidade",
  TI: "Tecnologia da Informação",
  LOGISTICA: "Logística",
};

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<ManagerSectionDTO[]>(mockSections);
  const [detailSection, setDetailSection] = useState<ManagerSectionDTO | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState("");
  const [newPark, setNewPark] = useState<Park>("NORTE");
  const [newSection, setNewSection] = useState<Section>("PRODUCAO");
  const [successMsg, setSuccessMsg] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "destructive">("success");

  const handleViewDetail = (section: ManagerSectionDTO) => {
    setDetailSection(section);
    setIsDetailOpen(true);
  };

  const handleCreateSection = () => {
    if (!newPlaceName.trim()) return;
    const newItem: ManagerSectionDTO = {
      id: `sec-${Date.now()}`,
      placeName: newPlaceName.trim(),
      park: newPark,
      section: newSection,
      vacancies: [],
      interviews: [],
    };
    setSections((prev) => [...prev, newItem]);
    setNewPlaceName("");
    setIsNewOpen(false);
    setToastVariant("success");
    setSuccessMsg("Seção de gestor cadastrada com sucesso!");
    setTimeout(() => setSuccessMsg(""), 7000);
  };

  const columns: DataTableColumn<ManagerSectionDTO>[] = [
    {
      key: "placeName",
      header: "Unidade / Local",
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
            <MapPin className="size-4" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{s.placeName}</p>
            <p className="text-xs text-muted-foreground">
              {parkLabels[s.park]} · {sectionLabels[s.section]}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "park",
      header: "Parque",
      render: (s) => (
        <Badge variant="outline">{parkLabels[s.park]}</Badge>
      ),
    },
    {
      key: "section",
      header: "Seção",
      render: (s) => (
        <Badge variant="info">{sectionLabels[s.section]}</Badge>
      ),
    },
    {
      key: "vacancies",
      header: "Vagas",
      render: (s) => (
        <div className="flex items-center gap-2">
          <Briefcase className="size-3.5 text-slate-400" />
          <span className="text-sm font-semibold text-foreground">{s.vacancies.length}</span>
          {s.vacancies.some((v) => v.status === "URGENT") && (
            <Badge variant="danger">Urgente</Badge>
          )}
          {s.vacancies.some((v) => v.status === "OPEN") && !s.vacancies.some((v) => v.status === "URGENT") && (
            <Badge variant="success">Abertas</Badge>
          )}
        </div>
      ),
    },
    {
      key: "interviews",
      header: "Entrevistas",
      render: (s) => (
        <div className="flex items-center gap-2">
          <CalendarCheck className="size-3.5 text-slate-400" />
          <span className="text-sm font-semibold text-foreground">{s.interviews.length}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      className: "text-right",
      render: (s) => (
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => handleViewDetail(s)}
        >
          <Eye className="size-3.5" /> Detalhes
        </Button>
      ),
    },
  ];

  return (
    <AppShell
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Gestores / Seções" },
      ]}
    >
      <div className="space-y-6">
        <PageHeader
          title="Gestores e Seções"
          description="Controle das unidades fabris, parques, seções e seus respectivos gestores, vagas e entrevistas"
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Lado Esquerdo - Tabela e Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stat Cards rápidos */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Total de Seções</p>
                <p className="text-3xl font-bold text-slate-900">{sections.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Vagas Cadastradas</p>
                <p className="text-3xl font-bold text-slate-900">
                  {sections.reduce((acc, s) => acc + s.vacancies.length, 0)}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Entrevistas Registradas</p>
                <p className="text-3xl font-bold text-slate-900">
                  {sections.reduce((acc, s) => acc + s.interviews.length, 0)}
                </p>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={sections}
              pageSize={10}
              searchable
              searchPlaceholder="Buscar por local ou seção..."
              searchKeys={["placeName", "park", "section"]}
              getRowKey={(row) => row.id}
            />
          </div>

          {/* Lado Direito - Nova Seção */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 h-fit sticky top-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Nova Seção</h2>
              <p className="text-xs text-slate-500">Preencha os campos para cadastrar uma nova seção.</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateSection();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Local / Unidade <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  placeholder="Ex: Unidade Fabril 3 - Blumenau"
                  className="h-10 border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Parque</label>
                  <select
                    value={newPark}
                    onChange={(e) => setNewPark(e.target.value as Park)}
                    className="h-10 w-full px-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="NORTE">Parque Norte</option>
                    <option value="SUL">Parque Sul</option>
                    <option value="CENTRO">Centro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Seção</label>
                  <select
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value as Section)}
                    className="h-10 w-full px-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="PRODUCAO">Produção</option>
                    <option value="MANUTENCAO">Manutenção</option>
                    <option value="QUALIDADE">Qualidade</option>
                    <option value="TI">Tecnologia da Informação</option>
                    <option value="LOGISTICA">Logística</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!newPlaceName.trim()}
                className="w-full bg-primary-900 text-white hover:bg-primary-950 gap-2 h-10"
              >
                <Plus className="size-4" /> Cadastrar Seção
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-lg bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {detailSection?.placeName}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {detailSection && `${parkLabels[detailSection.park]} · ${sectionLabels[detailSection.section]}`}
            </DialogDescription>
          </DialogHeader>

          {detailSection && (
            <div className="space-y-4 py-2">
              {/* Info base */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 font-medium">ID</p>
                  <p className="text-sm font-mono font-semibold text-slate-800 mt-0.5">{detailSection.id}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 font-medium">Parque</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{parkLabels[detailSection.park]}</p>
                </div>
              </div>

              {/* Vagas */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="size-4 text-primary-600" />
                  <h3 className="text-sm font-bold text-slate-900">Vagas ({detailSection.vacancies.length})</h3>
                </div>
                {detailSection.vacancies.length === 0 ? (
                  <p className="text-xs text-slate-400">Nenhuma vaga cadastrada nesta seção.</p>
                ) : (
                  <div className="space-y-1.5">
                    {detailSection.vacancies.map((v) => (
                      <div key={v.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                        <span className="text-xs font-medium text-slate-700">{v.title}</span>
                        {v.status === "OPEN" && <Badge variant="success">Aberta</Badge>}
                        {v.status === "URGENT" && <Badge variant="danger">Urgente</Badge>}
                        {v.status === "CLOSED" && <Badge variant="neutral">Fechada</Badge>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Entrevistas */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarCheck className="size-4 text-primary-600" />
                  <h3 className="text-sm font-bold text-slate-900">Entrevistas ({detailSection.interviews.length})</h3>
                </div>
                {detailSection.interviews.length === 0 ? (
                  <p className="text-xs text-slate-400">Nenhuma entrevista registrada nesta seção.</p>
                ) : (
                  <div className="space-y-1.5">
                    {detailSection.interviews.map((i) => (
                      <div key={i.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{i.candidateName}</p>
                          <p className="text-[11px] text-slate-500">{i.scheduledDate}</p>
                        </div>
                        {i.status === "SCHEDULED" && <Badge variant="info">Agendada</Badge>}
                        {i.status === "APPROVED" && <Badge variant="success">Aprovada</Badge>}
                        {i.status === "REJECTED" && <Badge variant="danger">Reprovada</Badge>}
                        {i.status === "PENDING" && <Badge variant="warning">Pendente</Badge>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast de sucesso */}
      <ToastCard message={successMsg} variant={toastVariant} />
    </AppShell>
  );
}
