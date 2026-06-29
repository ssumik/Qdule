import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import type { ExcecaoDia } from "@/components/admin/ConfigHorarios";
import { ScheduledTreatments } from "@/requests/CalendarRequest";
import { type CalendarResponse } from "@joao.sumi/qdule";
import { useQuery } from "@tanstack/react-query";
import { TreatmentById as GetTreatmentById } from "@/requests/TreatmentRequest";

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

type AppointmentInfo = {
  time: string;
  treatmentId?: number;
};

function ScheduleOption({ info }: { info: AppointmentInfo }) {
  const { data } = useQuery({
    queryKey: ["treatment", info.treatmentId],
    queryFn: () => GetTreatmentById(info.treatmentId!),
    enabled: info.treatmentId !== undefined,
  });

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors bg-white">
      <span className="text-xs text-muted-foreground pt-0.5 min-w-38px">
        {info.time}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          Agendamento
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {data?.name ?? `Tratamento #${info.treatmentId ?? "-"}`}
        </p>
      </div>
    </div>
  );
}

export function Acompanhamento({ excecoes }: AcompanhamentoProps) {
  const today = new Date();
  const [date, setDate] = useState<Date | undefined>(today);
  const [visibleMonth, setVisibleMonth] = useState(today);

  const { data, isLoading } = useQuery({
    queryKey: [
      "scheduled_treatments",
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
    ],
    queryFn: () =>
      ScheduledTreatments(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth() + 1,
      ),
  });

  const scheduledTreatments = data?.calendarList ?? [];
  const selectedDateKey = date ? formatDateToYYYYMMDD(date) : null;
  const todayDateKey = formatDateToYYYYMMDD(today);
  const agendamentos = getAppointmentsForDate(
    scheduledTreatments,
    selectedDateKey,
  );

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

  const todayAgendamentos = getAppointmentsForDate(
    scheduledTreatments,
    todayDateKey,
  );
  const weekAgendamentosCount = getAppointmentsCountForWeek(
    scheduledTreatments,
    today,
  );
  const daysWithEvents = new Set(
    scheduledTreatments
      .filter((schedule) => (schedule.hours?.length ?? 0) > 0)
      .map((schedule) => schedule.date)
      .filter(Boolean),
  );

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

  function formatDateToYYYYMMDD(date: Date) {
    return date.toLocaleDateString("en-CA");
  }

  function formatHour(hour: string) {
    return hour.slice(0, 5);
  }

  function getAppointmentsForDate(
    schedules: CalendarResponse[],
    dateKey: string | null,
  ) {
    if (!dateKey) return [];

    return schedules
      .filter((schedule) => schedule.date === dateKey)
      .flatMap((schedule) =>
        (schedule.hours ?? []).map((hour) => ({
          time: formatHour(hour),
          treatmentId: schedule.treatmentId,
        })),
      )
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  function getAppointmentsCountForWeek(
    schedules: CalendarResponse[],
    referenceDate: Date,
  ) {
    const weekStart = new Date(referenceDate);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(referenceDate.getDate() - referenceDate.getDay());

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return schedules.reduce((total, schedule) => {
      if (!schedule.date) return total;

      const scheduleDate = new Date(`${schedule.date}T00:00:00`);
      const isCurrentWeek =
        scheduleDate >= weekStart && scheduleDate <= weekEnd;

      return isCurrentWeek ? total + (schedule.hours?.length ?? 0) : total;
    }, 0);
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

      <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
        <MetricCard
          label="Hoje"
          value={String(todayAgendamentos.length)}
          sub="agendamentos"
        />
        <MetricCard
          label="Esta semana"
          value={String(weekAgendamentosCount)}
          sub="agendamentos"
        />
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
              loading={isLoading}
              className="[--cell-size:2.5rem] sm:[--cell-size:3rem] md:[--cell-size:3.5rem]"
              modifiers={{
                hasEvents: (d) => daysWithEvents.has(formatDateToYYYYMMDD(d)),
              }}
              modifiersClassNames={{
                hasEvents:
                  "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-ring",
              }}
              onMonthChange={setVisibleMonth}
            />
          </div>

          <div className="px-4 py-3 border-t border-border bg-muted/40">
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
              {isLoading
                ? "Carregando agendamentos"
                : agendamentos.length === 0
                  ? "Nenhum agendamento"
                  : ""}
            </p>
          </div>

          <div className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto">
            {!isLoading &&
              agendamentos.length === 0 &&
              (isFolga ? (
                <div className="flex flex-col items-center gap-2 py-8">
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

            {isLoading && (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-16 rounded-lg border border-border bg-muted/40 animate-pulse"
                  />
                ))}
              </div>
            )}

            {agendamentos.map((a, i) => (
              <ScheduleOption info={a} key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
