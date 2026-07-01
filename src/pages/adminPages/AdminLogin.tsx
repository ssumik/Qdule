// src/pages/admin/Login.tsx
// Tela de login do painel admin

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "@/context/AuthRequest";
import { useAuth } from "@/hooks/UseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: ({ token }) => {
      login(token);
      navigate("/admin");
    },
    onError: () => {
      setErrorMsg("E-mail ou senha inválidos.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg("Preencha e-mail e senha.");
      return;
    }
    mutation.mutate({ email, password });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-rose-50 to-pink-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
        {/* Logo / título */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Painel Admin
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Entre com suas credenciais para continuar
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={mutation.isPending}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={mutation.isPending}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Erro */}
          {errorMsg && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}

          <Button
            type="submit"
            className="w-full gap-2 mt-1"
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}