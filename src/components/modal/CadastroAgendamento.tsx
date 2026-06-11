import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import type { Servico } from "@/components/servicos/cards_servicos";

interface CadastroAgendamentoProps {
  servico: Servico;
  dia: string | null;
  mes: string | null;
  horario: string | null;

  onSubmit: (dados: { nome: string; email: string; celular: string }) => void;
}

interface FormData {
  nome: string;
  email: string;
  celular: string;
}

export function CadastroAgendamento({
  servico,
  dia,
  mes,
  horario,
  onSubmit,
}: CadastroAgendamentoProps) {
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      nome: "",
      email: "",
      celular: "",
    },
  });

  function handleCelularChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatado = e.target.value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 15);

    setValue("celular", formatado);
  }

  return (
    <>
      <h2 className="text-xl font-semibold leading-tight text-left">
        Para confirmar seu horário, precisamos de algumas informações
      </h2>

      {/* Resumo */}
      <div className="bg-primary rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 text-white">
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm text-black">Você selecionou o serviço:</p>

          <h2 className="font-bold text-accent wrap-break-words">
            {servico?.nome}
          </h2>

          <p className="text-sm text-accent">
            R$ {Number(servico?.preco).toFixed(2).replace(".", ",")} •{" "}
            {servico?.duracao} min
          </p>
        </div>

        <div className="bg-accent rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center gap-2 text-white w-full sm:w-auto justify-center">
          <span className="font-bold">
            {dia}/{mes}
          </span>

          <span className="hidden sm:block font-semibold">|</span>

          <span className="font-bold">{horario}h</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 mt-2">
        <div className="grid gap-2">
          <Label className="font-bold text-sm">Nome Completo</Label>

          <Input
            className="bg-white"
            placeholder="Ex: Maria Silva"
            {...register("nome", {
              required: "Nome é obrigatório",
              minLength: {
                value: 3,
                message: "Nome muito curto",
              },
            })}
          />

          {errors.nome && (
            <span className="text-red-500 text-xs">{errors.nome.message}</span>
          )}
        </div>

        <div className="grid gap-2">
          <Label className="font-bold text-sm">E-mail</Label>

          <Input
            type="email"
            className="bg-white"
            placeholder="exemplo@email.com"
            {...register("email", {
              required: "E-mail obrigatório",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "E-mail inválido",
              },
            })}
          />

          {errors.email && (
            <span className="text-red-500 text-xs">{errors.email.message}</span>
          )}
        </div>

        <div className="grid gap-2">
          <Label className="font-bold text-sm">Celular</Label>

          <Input
            type="tel"
            className="bg-white"
            placeholder="(47) 99999-9999"
            {...register("celular", {
              required: "Celular é obrigatório",
            })}
            onChange={handleCelularChange}
          />

          {errors.celular && (
            <span className="text-red-500 text-xs">
              {errors.celular.message}
            </span>
          )}
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="termos"
            checked={aceitouTermos}
            onCheckedChange={(checked) => setAceitouTermos(checked === true)}
            className="border-accent mt-1"
          />

          <Label
            htmlFor="termos"
            className="text-sm leading-relaxed cursor-pointer"
          >
            Entendo que ao confirmar meu horário, taxas poderão ser aplicadas em
            caso de cancelamento.
          </Label>
        </div>

        <Button
          type="submit"
          disabled={!aceitouTermos}
          className="w-full bg-accent hover:bg-buttonhover text-white rounded-xl h-12 mt-2 cursor-pointer"
        >
          Continuar
        </Button>
      </form>
    </>
  );
}
