import { BrowserRouter, Routes, Route } from "react-router-dom";
import Servico from "@/pages/Servicos";
import Admin from "@/pages/admin-dashboard/Admin";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Servico />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
