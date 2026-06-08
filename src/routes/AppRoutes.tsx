import { BrowserRouter, Routes, Route } from "react-router-dom";
import Servico from "@/pages/Servicos";
import Cadastro from "@/pages/Cadastro";
import ConfirmaçãoHorário from "@/pages/ConfirmaçãoHorário";
import Sucesso from "@/pages/Sucesso";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Servico />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/confirmacao" element={<ConfirmaçãoHorário />} />
        <Route path="/sucesso" element={<Sucesso />} />
      </Routes>
    </BrowserRouter>
  );
}
