// src/hooks/useAuth.ts
// Hook separado do AuthContext para satisfazer Fast Refresh

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}