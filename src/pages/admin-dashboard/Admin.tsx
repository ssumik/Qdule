import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { Acompanhamento } from "@/components/admin/Acompanhamento";
import { Servicos } from "@/components/admin/CadastroServicos";
import { Configuracoes } from "@/components/admin/Configuracoes";
import { ConfigHorarios } from "@/components/admin/ConfigHorarios";
import type { ExcecaoDia } from "@/components/admin/ConfigHorarios";

export type AdminPage =
  | "acompanhamento"
  | "horarios"
  | "servicos"
  | "configuracoes";

export default function Admin() {
  const [page, setPage] = useState<AdminPage>("acompanhamento");
  const [excecoes, setExcecoes] = useState<ExcecaoDia[]>([]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-muted/30 overflow-hidden">
      <Sidebar current={page} onChange={setPage} />

      <main className="flex-1 overflow-y-auto">
        {page === "acompanhamento" && <Acompanhamento excecoes={excecoes} />}
        {page === "servicos" && <Servicos />}
        {page === "configuracoes" && <Configuracoes />}
        {page === "horarios" && (
          <ConfigHorarios excecoes={excecoes} onChange={setExcecoes} />
        )}
      </main>
    </div>
  );
}
