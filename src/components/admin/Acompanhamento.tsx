import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { mockAgenda } from "@/components/admin/mockData";
import type { ExcecaoDia } from "@/components/admin/ConfigHorarios";

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

interface AcompanhamentoProps {
  excecoes: ExcecaoDia[];
}

export function Acompanhamento({ excecoes }: AcompanhamentoProps) {
  const today = new Date();
  const [date, setDate] = useState<Date | undefined>(today);

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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard
          label="Hoje"
          value={String(todayAgendamentos.length)}
          sub="agendamentos"
        />
        <MetricCard label="Esta semana" value="18" sub="agendamentos" />
        <MetricCard label="Receita estimada" value="R$ 920" sub="esta semana" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Calendário */}
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-primary/40">
            <p className="text-sm font-medium text-foreground">Calendário</p>
          </div>

          <div className="p-2 sm:p-3">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              captionLayout="dropdown"
              className="w-full"
              modifiers={{
                hasEvents: (d) => daysWithEvents.includes(d.getDate()),
              }}
              modifiersClassNames={{
                hasEvents:
                  "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-ring",
              }}
              classNames={{
                month: "w-full",
                table: "w-full",
                day: `
                  h-10 w-10
                  sm:h-12 sm:w-12
                  md:h-14 md:w-14
                  text-sm sm:text-base
                `,
              }}
            />
          </div>
          <div className="px-4 py-3 border-t border-border bg-muted/40">
            <p className="text-sm text-muted-foreground">
              *Dias marcados possuem pelo menos 1 agendamento.
            </p>
          </div>
        </div>

        {/* Agenda do dia */}
        <div className="border border-border rounded-xl overflow-hidden flex flex-col">
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

            {agendamentos.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors"
              >
                <span className="text-xs text-muted-foreground pt-0.5 min-w-38px">
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
        </div>
      </div>
    </div>
  );
}
