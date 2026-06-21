import { BrowserRouter, Routes, Route } from "react-router-dom";
import Servico from "@/pages/Servicos";
import Admin from "@/pages/admin-dashboard/Admin";
import {Toaster} from "@/components/ui/sonner";

export default function AppRoutes() {
  return (
    <BrowserRouter>
    <Toaster richColors position="top-center" />
      <Routes>
        <Route path="/" element={<Servico />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
