import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ptBR } from "date-fns/locale";
import type { Servico } from "@/components/servicos/cards_servicos";
import { CadastroAgendamento } from "@/components/modal/CadastroAgendamento";

// ─── mock de horários ─────────────────────────────────────────────────
const mockHorarios: Record<number, string[]> = {
  21: ["08:30", "09:30", "10:00", "10:15", "10:30"],
  22: ["10:00"],
  23: ["14:00"],
  27: ["10:00"],
};

interface AgendaInlineProps {
  servico: Servico;
  onFechar: () => void;
}

export function AgendaInline({ servico, onFechar }: AgendaInlineProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(
    null,
  );

  const [modalAberto, setModalAberto] = useState(false);

  // ─── Datas derivadas ──────────────────────────────────────────────

  const diaSelecionado = date ? String(date.getDate()).padStart(2, "0") : null;

  const mesSelecionado = date
    ? String(date.getMonth() + 1).padStart(2, "0")
    : null;

  const diaNum = date?.getDate();

  const horarios = diaNum ? (mockHorarios[diaNum] ?? []) : [];

  function handleSelectDate(novaData: Date | undefined) {
    setDate(novaData);
    setHorarioSelecionado(null);
  }

  // ─── Cadastro concluído ───────────────────────────────────────────

  function handleCadastroConcluido(dados: {
    nome: string;
    email: string;
    celular: string;
  }) {
    alert(`Agendamento realizado com sucesso para ${dados.nome}!`);

    setModalAberto(false);
  }

  // ─── Fechamento do modal ──────────────────────────────────────────

  function handleModalChange(open: boolean) {
    setModalAberto(open);
  }

  return (
    <div className="w-full rounded-2xl bg-ring/20 backdrop-blur-lg border border-red-100 shadow-xl p-6 md:p-8">
      {/* Cabeçalho */}
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

      {/* Serviço */}
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
        {/* Calendário */}
        <section className="space-y-4 max-w-sm mx-auto w-full">
          <h3 className="font-bold text-base flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-xs font-bold">
              1
            </span>
            Escolha o dia
          </h3>

          <div className="w-fit mx-auto p-3 bg-white/70 rounded-xl border border-red-50 shadow-sm">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelectDate}
              captionLayout="dropdown"
              locale={ptBR}
              disabled={{
                before: new Date(),
                after: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
              }}
            />
          </div>

          {diaSelecionado && (
            <p className="text-sm font-medium text-center text-muted-foreground">
              Data selecionada:
              <span className="text-accent font-semibold ml-1">
                {diaSelecionado}/{mesSelecionado}
              </span>
            </p>
          )}
        </section>

        {/* Horários */}
        <section className="space-y-6 flex flex-col">
          <div className="space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-xs font-bold">
                2
              </span>
              Escolha o horário
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {!diaSelecionado && (
                <p className="col-span-3 text-sm text-center py-5 text-muted-foreground bg-muted/40 rounded-xl border border-dashed">
                  Selecione um dia primeiro
                </p>
              )}

              {diaSelecionado && horarios.length === 0 && (
                <p className="col-span-3 text-sm text-center py-5 text-muted-foreground bg-muted/40 rounded-xl border border-dashed">
                  Nenhum horário disponível
                </p>
              )}

              {horarios.map((hora) => {
                const ativo = horarioSelecionado === hora;

                return (
                  <Button
                    key={hora}
                    onClick={() => setHorarioSelecionado(hora)}
                    variant="outline"
                    className={`rounded-xl cursor-pointer h-12 font-semibold ${
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

          {/* Modal */}
          <div className="mt-auto">
            <Dialog open={modalAberto} onOpenChange={handleModalChange}>
              <DialogTrigger asChild>
                <Button
                  disabled={!diaSelecionado || !horarioSelecionado}
                  className="w-full h-14 cursor-pointer bg-button hover:bg-buttonhover text-white text-base font-bold rounded-2xl shadow-lg"
                >
                  Próximo passo
                </Button>
              </DialogTrigger>

              <DialogContent
                className="
                  w-[95vw]
                  max-w-md
                  max-h-[85vh]
                  overflow-y-auto
                  rounded-2xl
                  bg-white/90
                  backdrop-blur-md
                  border
                  border-white/20
                  p-4 sm:p-6
                "
              >
                <CadastroAgendamento
                  servico={servico}
                  dia={diaSelecionado}
                  mes={mesSelecionado}
                  horario={horarioSelecionado}
                  onSubmit={handleCadastroConcluido}
                />
              </DialogContent>
            </Dialog>
          </div>
        </section>
      </div>
    </div>
  );
}
