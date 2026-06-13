import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ptBR } from "date-fns/locale";
import { mockAgenda } from "@/components/admin/mockData";

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
    <div className="bg-muted/50 rounded-xl p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

export function Acompanhamento() {
  const today = new Date();
  const [date, setDate] = useState<Date | undefined>(today);

  const dayNum = date?.getDate();
  const agendamentos = dayNum ? (mockAgenda[dayNum] ?? []) : [];

  const isToday =
    date?.getDate() === today.getDate() &&
    date?.getMonth() === today.getMonth() &&
    date?.getFullYear() === today.getFullYear();

  const dayLabel = isToday
    ? "Hoje"
    : date
      ? date.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
        })
      : "Selecione um dia";

  const todayAgendamentos = mockAgenda[today.getDate()] ?? [];
  const daysWithEvents = Object.keys(mockAgenda).map(Number);

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
        <div className="border border-border rounded-xl overflow-hidden bg-background">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">Calendário</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dias com ponto têm agendamentos
            </p>
          </div>
          <div className="p-3 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              captionLayout="dropdown"
              modifiers={{
                hasEvents: (d) => daysWithEvents.includes(d.getDate()),
              }}
              modifiersClassNames={{
                hasEvents:
                  "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary",
              }}
            />
          </div>
        </div>

        {/* Agenda do dia */}
        <div className="border border-border rounded-xl overflow-hidden bg-background flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground capitalize">
              {dayLabel}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {agendamentos.length === 0
                ? "Nenhum agendamento"
                : `${agendamentos.length} agendamento${agendamentos.length > 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto">
            {agendamentos.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum agendamento para este dia.
              </p>
            )}

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
                <Badge
                  variant="secondary"
                  className={
                    a.status === "confirmed"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                  }
                >
                  {a.status === "confirmed" ? "Confirmado" : "Pendente"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
