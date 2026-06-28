//ainda sem integração com o backend
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { mockAgenda } from "@/components/admin/mockData";
import type { ExcecaoDia } from "@/components/admin/ConfigHorarios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-accent/40 rounded-xl p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

interface Agendamento {
  time: string;
  name: string;
  service: string;
  phone?: string;  
  email?: string;  
}

interface AcompanhamentoProps {
  excecoes: ExcecaoDia[];
}

export function Acompanhamento({ excecoes }: AcompanhamentoProps) {
  const today = new Date();
  const [date, setDate] = useState<Date | undefined>(today);
  
  // Estado para armazenar o agendamento selecionado para o modal
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);

  const dayNum = date?.getDate();
  const agendamentos = dayNum ? (mockAgenda[dayNum] ?? []) : [];

  const isToday =
    date?.getDate() === today.getDate() &&
    date?.getMonth() === today.getMonth() &&
    date?.getFullYear() === today.getFullYear();

  const dayLabel = isToday
    ? "Para hoje"
    : date
      ? date.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
        })
      : "Selecione um dia";

  const todayAgendamentos = mockAgenda[today.getDate()] ?? [];
  const daysWithEvents = Object.keys(mockAgenda).map(Number);

  // verifica se o dia selecionado é folga
  const excecaoDoDia = excecoes.find((e) => date && isSameDay(e.date, date));
  const isFolga = excecaoDoDia?.tipo === "folga";

  // helper (mesma função do ConfigHorarios)
  function isSameDay(a: Date, b: Date) {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }

  // Função para lidar com o cancelamento
  const handleCancelAgendamento = (agendamento: Agendamento) => {
    const confirmar = window.confirm(`Tem certeza que deseja cancelar o agendamento de ${agendamento.name}?`);
    if (confirmar) {
      // TODO: Integrar com sua API/Backend ou atualizar o estado local do mockAgenda
      console.log("Cancelando agendamento:", agendamento);
      
      // Fecha o modal após cancelar
      setSelectedAgendamento(null);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Acompanhamento mensal
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {today.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
        <MetricCard
          label="Hoje"
          value={String(todayAgendamentos.length)}
          sub="agendamentos"
        />
        <MetricCard label="Esta semana" value="18" sub="agendamentos" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Calendário */}
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-primary/40">
            <p className="text-sm font-medium text-foreground">Calendário</p>
          </div>

          <div className="p-2 sm:p-3 flex justify-center bg-background">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              captionLayout="dropdown"
              className="[--cell-size:2.5rem] sm:[--cell-size:3rem] md:[--cell-size:3.5rem]"
              modifiers={{
                hasEvents: (d) => daysWithEvents.includes(d.getDate()),
              }}
              modifiersClassNames={{
                hasEvents:
                  "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-ring",
              }}
            />
          </div>
          
          <div className="px-4 py-3 border-t border-border bg-white/40">
            <p className="text-sm text-muted-foreground">
              *Dias marcados possuem pelo menos 1 agendamento.
            </p>
          </div>
        </div>

        {/* Agenda do dia */}
        <div className="border border-border rounded-xl overflow-hidden flex flex-col bg-background">
          <div className="px-4 py-3 border-b border-border bg-primary/40">
            <p className="text-sm font-medium text-foreground capitalize">
              {dayLabel}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {agendamentos.length === 0 ? "Nenhum agendamento" : ""}
            </p>
          </div>

          <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto">
            {agendamentos.length === 0 &&
              (isFolga ? (
                <div className="flex flex-col items-center gap-2 py-8">
                  <span className="text-2xl">🌿</span>
                  <p className="text-sm font-medium text-foreground">
                    Dia de folga
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Nenhum atendimento programado para este dia.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum agendamento para este dia.
                </p>
              ))}

            {agendamentos.map((a: Agendamento, i: number) => (
              <div
                key={i}
                onClick={() => setSelectedAgendamento(a)} // Abre o modal ao clicar no card
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors bg-white cursor-pointer"
              >
                <span className="text-xs text-muted-foreground pt-0.5 min-w-9.5">
                  {a.time}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {a.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a.service}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-border bg-white/60">
            <p className="text-sm text-muted-foreground">
              Selecione um cliente para mais infos
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Agendamento */}
      <Dialog open={!!selectedAgendamento} onOpenChange={(open) => !open && setSelectedAgendamento(null)}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
            <DialogDescription>
              Informações do cliente e gerenciamento do horário.
            </DialogDescription>
          </DialogHeader>

          {selectedAgendamento && (
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="font-semibold text-muted-foreground text-right">Cliente:</span>
                <span className="col-span-3 text-foreground font-medium">{selectedAgendamento.name}</span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="font-semibold text-muted-foreground text-right">Telefone:</span>
                <span className="col-span-3 text-foreground">{selectedAgendamento.phone || "(47) 99999-9999"}</span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="font-semibold text-muted-foreground text-right">E-mail:</span>
                <span className="col-span-3 text-foreground break-all">{selectedAgendamento.email || "cliente@email.com"}</span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="font-semibold text-muted-foreground text-right">Serviço:</span>
                <span className="col-span-3 text-foreground">{selectedAgendamento.service}</span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="font-semibold text-muted-foreground text-right">Data:</span>
                <span className="col-span-3 text-foreground">Dia aqui</span>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="font-semibold text-muted-foreground text-right">Horário:</span>
                <span className="col-span-3 text-foreground">{selectedAgendamento.time}</span>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedAgendamento(null)}
              className="w-full sm:w-auto"
            >
              Fechar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => selectedAgendamento && handleCancelAgendamento(selectedAgendamento)}
              className="w-full sm:w-auto"
            >
              Cancelar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}