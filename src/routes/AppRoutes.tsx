// src/routes/AppRoutes.tsx

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Servico from "@/pages/Servicos";
import Admin from "@/pages/admin-dashboard/Admin";
import { Login } from "@/pages/admin-dashboard/Login";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { Toaster } from "@/components/ui/sonner";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" />
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Servico />} />
        <Route path="/admin/login" element={<Login />} />

        {/* Rotas protegidas — redireciona para /admin/login se não autenticado */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}