import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Servico } from "@/components/servicos/cards_servicos";

// ─── mock de horários por dia ─────────────────────────────────────────────────
const mockHorarios: Record<number, string[]> = {
  21: ["08:30", "09:30", "10:00", "10:15", "10:30"],
  22: ["10:00"],
  23: ["14:00"],
  27: ["10:00"],
};

// ─── props ────────────────────────────────────────────────────────────────────
interface AgendaInlineProps {
  servico: Servico;
  onFechar: () => void;
}

// ─── componente ───────────────────────────────────────────────────────────────
export function AgendaInline({ servico, onFechar }: AgendaInlineProps) {
  const navigate = useNavigate();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(
    null,
  );
  const [modalAberto, setModalAberto] = useState(false);

  // Derived — dia e mês formatados
  const diaSelecionado = date ? String(date.getDate()).padStart(2, "0") : null;
  const mesSelecionado = date
    ? String(date.getMonth() + 1).padStart(2, "0")
    : null;
  const diaNum = date ? date.getDate() : null;
  const horarios: string[] = diaNum ? (mockHorarios[diaNum] ?? []) : [];

  // Limpa horário quando muda o dia
  function handleSelectDate(novaData: Date | undefined) {
    setDate(novaData);
    setHorarioSelecionado(null);
  }

  // ─── formulário ────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { nome: "", email: "", celular: "" },
  });

  function onSubmit(dados: Record<string, string>) {
    setModalAberto(false);
    navigate("/confirmacao", {
      state: {
        agendamento: {
          servico,
          dia: diaSelecionado,
          mes: mesSelecionado,
          horario: horarioSelecionado,
          ...dados,
        },
      },
    });
  }

  function handleCelularChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatado = e.target.value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 15);
    setValue("celular", formatado);
  }

  // ─── render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full rounded-2xl bg-white/10 backdrop-blur-lg border border-red-100 shadow-xl p-6 md:p-8">
      {/* Cabeçalho da agenda */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onFechar}
            className="p-0 h-auto cursor-pointer text-red-400 hover:text-red-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="font-semibold text-foreground text-lg">
            Horários disponíveis
          </h2>
        </div>
      </div>

      {/* Badge do serviço selecionado */}
      <div className="rounded-2xl p-5 bg-white/80 border border-red-100 shadow-sm mb-8">
        <p className="text-xs uppercase tracking-wider text-red-400 font-semibold">
          Serviço selecionado
        </p>
        <h2 className="text-2xl font-bold mt-1">{servico.nome}</h2>
        <p className="text-sm mt-1 font-medium text-muted-foreground">
          R$ {servico.preco} • {servico.duracao} min
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Calendário */}
        <section className="space-y-4 max-w-sm mx-auto w-full">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-xs font-bold">
              1
            </span>
            Escolha o dia
          </h3>

          {/* AJUSTE AQUI: w-fit faz o background murchar ao tamanho exato do calendário */}
          <div className="w-fit mx-auto p-3 bg-white/70 rounded-xl border border-red-50 shadow-sm">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelectDate}
              captionLayout="dropdown"
              disabled={{
                before: new Date(),
                after: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
              }}
              className="rounded-lg"
            />
          </div>

          {diaSelecionado && (
            <p className="text-sm font-medium text-center text-muted-foreground">
              Data selecionada:{" "}
              <span className="text-accent font-semibold">
                {diaSelecionado}/{mesSelecionado}
              </span>
            </p>
          )}
        </section>

        {/* 2. Horários + botão */}
        <section className="space-y-6 flex flex-col">
          <div className="space-y-4">
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-xs font-bold">
                2
              </span>
              Escolha o horário
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {horarios.length === 0 && diaSelecionado && (
                <p className="col-span-3 text-sm text-center py-5 text-muted-foreground bg-muted/40 rounded-xl border border-dashed">
                  Nenhum horário disponível para esse dia
                </p>
              )}

              {!diaSelecionado && (
                <p className="col-span-3 text-sm text-center py-5 text-muted-foreground bg-muted/40 rounded-xl border border-dashed">
                  Selecione um dia primeiro
                </p>
              )}

              {horarios.map((hora) => {
                const ativo = horarioSelecionado === hora;
                return (
                  <Button
                    key={hora}
                    onClick={() => setHorarioSelecionado(hora)}
                    variant="outline"
                    className={`rounded-xl cursor-pointer h-12 transition-all font-semibold ${
                      ativo
                        ? "bg-button hover:bg-button text-white"
                        : "bg-white text-accent"
                    }`}
                  >
                    {hora}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Resumo + Próximo passo */}
          <div className="mt-auto space-y-4">
            {/* Dialog de cadastro */}
            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
              <DialogTrigger asChild>
                <Button
                  disabled={!diaSelecionado || !horarioSelecionado}
                  className="w-full h-14 cursor-pointer bg-button hover:bg-buttonhover text-white text-base font-bold rounded-2xl shadow-lg disabled:opacity-50 transition-all active:scale-95"
                >
                  Próximo passo
                </Button>
              </DialogTrigger>

              <DialogContent className="w-[95%] sm:max-w-md rounded-2xl bg-white/90 backdrop-blur-md border border-white/20 p-6 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold leading-tight text-left">
                    Para confirmar seu horário, precisamos de algumas
                    informações
                  </DialogTitle>
                </DialogHeader>

                {/* Resumo no topo do modal */}
                <div className="rounded-xl px-10 flex flex-row items-center justify-center gap-2 bg-secondary py-2 my-2 text-accent">
                  <span className="font-semibold text-sm">{servico.nome}</span>
                  <span className="text-sm font-semibold opacity-60"> - </span>
                  <span className="font-semibold text-sm">
                    {diaSelecionado}/{mesSelecionado}
                  </span>
                  <span className="text-sm font-semibold opacity-60">|</span>
                  <span className="font-bold text-sm">
                    {horarioSelecionado}h
                  </span>
                </div>

                {/* Formulário */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="grid gap-4 mt-2"
                >
                  <div className="grid gap-2">
                    <Label className="font-bold text-sm">Nome Completo</Label>
                    <Input
                      className="bg-white"
                      {...register("nome", {
                        required: "Nome é obrigatório",
                        minLength: { value: 3, message: "Nome muito curto" },
                      })}
                      placeholder="Ex: Maria Silva"
                    />
                    {errors.nome && (
                      <span className="text-red-500 text-xs">
                        {errors.nome.message}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label className="font-bold text-sm">E-mail</Label>
                    <Input
                      className="bg-white"
                      type="email"
                      {...register("email", {
                        required: "E-mail obrigatório",
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: "E-mail inválido",
                        },
                      })}
                      placeholder="exemplo@email.com"
                    />
                    {errors.email && (
                      <span className="text-red-500 text-xs">
                        {errors.email.message}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label className="font-bold text-sm">Celular</Label>
                    <Input
                      className="bg-white"
                      type="tel"
                      {...register("celular", {
                        required: "Celular é obrigatório",
                      })}
                      onChange={handleCelularChange}
                      placeholder="(47) 99999-9999"
                    />
                    {errors.celular && (
                      <span className="text-red-500 text-xs">
                        {errors.celular.message}
                      </span>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-buttonhover text-white rounded-xl h-12 mt-2 cursor-pointer"
                  >
                    Confirmar Agendamento
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </section>
      </div>
    </div>
  );
}
