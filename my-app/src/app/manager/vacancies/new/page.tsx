"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { ToastCard } from "@/components/ui/toast-card";
import { useRouter } from "next/navigation";

export default function NovaVagaPage() {
  const router = useRouter();

  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("Produção");
  const [description, setDescription] = useState("");
  const [spots, setSpots] = useState(1);
  const [successMsg, setSuccessMsg] = useState("");

  const handleCreate = () => {
    if (!jobTitle.trim() || !description.trim()) {
      setSuccessMsg("Preencha todos os campos obrigatórios (*).");
      setTimeout(() => setSuccessMsg(""), 7000);
      return;
    }
    setSuccessMsg("Vaga criada com sucesso!");
    setTimeout(() => {
      setSuccessMsg("");
      router.push("/manager/vacancies");
    }, 2500);
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: "Gestor", href: "/manager/vacancies" },
        { label: "Minhas Vagas", href: "/manager/vacancies" },
        { label: "Nova Vaga" },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Abrir Nova Vaga</h1>
            <p className="text-sm text-slate-500">Cadastre uma vaga para receber indicações de alunos.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/manager/vacancies")}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!jobTitle.trim() || !description.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-primary-900 hover:bg-primary-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition"
            >
              Criar Vaga
            </button>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Informações Básicas</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Nome da Vaga <span className="text-red-500">*</span>
              </label>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ex: Aprendiz de Montagem Elétrica"
                className="h-10 bg-white border-slate-200 rounded-lg text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Setor / Departamento
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-10 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Produção">Produção</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Qualidade">Qualidade</option>
                <option value="Tecnologia da Informação">Tecnologia da Informação</option>
                <option value="Logística">Logística</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Descrição da Vaga <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as responsabilidades, atividades e perfil desejado do candidato..."
              className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="w-40">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Número de Vagas
            </label>
            <Input
              type="number"
              min={1}
              max={50}
              value={spots}
              onChange={(e) => setSpots(Number(e.target.value))}
              className="h-10 bg-white border-slate-200 rounded-lg text-sm font-medium"
            />
          </div>
        </div>

        {/* Requisitos */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Requisitos</h2>
            <button
              type="button"
              className="text-xs font-semibold text-primary-800 hover:text-primary-950 flex items-center gap-1 transition"
            >
              + Adicionar Requisito
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Nenhum requisito adicionado ainda. Clique em "+ Adicionar Requisito" para definir as competências e habilidades necessárias para a vaga.
          </p>
        </div>
      </div>

      {/* Notificação */}
      <ToastCard message={successMsg} variant="success" />
    </AppShell>
  );
}
