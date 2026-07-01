import { useRef, useState } from "react";
import { Sidebar } from "@/components/adminComponents/Sidebar";
import { Acompanhamento } from "@/components/adminComponents/Acompanhamento";
import { Servicos } from "@/components/adminComponents/CRUDServicos";
import { Configuracoes } from "@/components/adminComponents/Configuracoes";
import { ConfigHorarios } from "@/components/adminComponents/ConfigHorarios";
import type {
  ExcecaoDia,
  ConfigHorariosHandle,
} from "@/components/adminComponents/ConfigHorarios";

export type AdminPage =
  | "acompanhamento"
  | "horarios"
  | "servicos"
  | "configuracoes";

export default function Admin() {
  const [page, setPage] = useState<AdminPage>("acompanhamento");
  const [excecoes, setExcecoes] = useState<ExcecaoDia[]>([]);
  const configHorariosRef = useRef<ConfigHorariosHandle>(null);

  async function handlePageChange(novaPage: AdminPage) {
    // Se estamos saindo da aba de horários para outra, confere se há
    // alterações não salvas antes de liberar a troca.
    if (page === "horarios" && novaPage !== "horarios") {
      const podeSeguir = await configHorariosRef.current?.confirmarSaida();
      if (podeSeguir === false) return;
    }

    setPage(novaPage);
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-muted/30 overflow-hidden">
      <Sidebar current={page} onChange={handlePageChange} />

      <main className="flex-1 overflow-y-auto">
        {page === "acompanhamento" && <Acompanhamento excecoes={excecoes} />}
        {page === "servicos" && <Servicos />}
        {page === "configuracoes" && <Configuracoes />}
        {page === "horarios" && (
          <ConfigHorarios
            ref={configHorariosRef}
            excecoes={excecoes}
            onChange={setExcecoes}
          />
        )}
      </main>
    </div>
  );
}