import { useState, type ReactNode } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ptBR } from "date-fns/locale";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { ExcecaoDia } from "@/components/adminComponents/ConfigHorarios";
import { CancelSchedule, GetSchedules } from "@/requests/ScheduleRequest";
import {
  ScheduleStatus,
  type ScheduleResponse,
  type ScheduleUpdateRequest,
} from "@joao.sumi/qdule";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TreatmentById as GetTreatmentById } from "@/requests/TreatmentRequest";
import { ClientById as GetClientById } from "@/requests/ClientRequest";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface AppointmentInfo extends ScheduleUpdateRequest {
  id: number;
  time: string;
  date: string;
  treatmentId?: number;
  clientId?: number;
}

function ScheduleOption({
  info,
  onSelect,
}: {
  info: AppointmentInfo;
  onSelect: (info: AppointmentInfo) => void;
}) {
  const { data: treatment, isLoading: isTreatmentLoading } = useQuery({
    queryKey: ["treatment", info.treatmentId],
    queryFn: () => GetTreatmentById(info.treatmentId!),
    enabled: info.treatmentId !== undefined,
  });

  const { data: client, isLoading: isClientLoading } = useQuery({
    queryKey: ["client", info.clientId],
    queryFn: () => GetClientById(info.clientId!),
    enabled: info.clientId !== undefined,
  });

  return (
    <div className="flex w-full items-start gap-2 rounded-lg border border-border bg-white p-3 text-left transition-colors hover:bg-muted/60 hover:text-white">
      <button
        type="button"
        onClick={() => onSelect(info)}
        className="flex min-w-0 flex-1 items-start gap-3 text-left"
      >
        <span className="min-w-10 pt-0.5 text-xs text-muted-foreground">
          {info.time}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {isClientLoading
              ? "Carregando..."
              : (client?.name ?? "Cliente não informado")}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {isTreatmentLoading ? "Carregando..." : (treatment?.name ?? "Agendamento")}
          </p>
        </div>
      </button>
    </div>
  );
}

function AppointmentDetails({
  info,
  onCancel,
  isCanceling,
}: {
  info: AppointmentInfo;
  onCancel: (info: AppointmentInfo) => void;
  isCanceling: boolean;
}) {
  const { data: treatment, isLoading: isTreatmentLoading } = useQuery({
    queryKey: ["treatment", info.treatmentId],
    queryFn: () => GetTreatmentById(info.treatmentId!),
    enabled: info.treatmentId !== undefined,
  });

  const { data: client, isLoading: isClientLoading } = useQuery({
    queryKey: ["client", info.clientId],
    queryFn: () => GetClientById(info.clientId!),
    enabled: info.clientId !== undefined,
  });

  return (
    <div className="grid gap-4 py-4 text-sm">
      <DetailRow label="Cliente">
        {isClientLoading ? "Carregando..." : (client?.name ?? "Não informado")}
      </DetailRow>
      {client?.email && <DetailRow label="E-mail">{client.email}</DetailRow>}
      {client?.cellPhone && (
        <DetailRow label="Telefone">{client.cellPhone}</DetailRow>
      )}
      <DetailRow label="Tratamento">
        {isTreatmentLoading ? "Carregando..." : (treatment?.name ?? "Não informado")}
      </DetailRow>
      {treatment?.duration !== undefined && treatment?.duration !== null && (
        <DetailRow label="Duração">
          {Math.round(Number(treatment.duration) / 60)} min
        </DetailRow>
      )}
      {treatment?.price !== undefined && (
        <DetailRow label="Valor">
          {treatment.price.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </DetailRow>
      )}
      <DetailRow label="Data">{formatDateLabel(info.date)}</DetailRow>
      <DetailRow label="Horário">{info.time}</DetailRow>

      <div className="flex justify-end pt-2 border-t border-border">
        <Button
          type="button"
          variant="destructive"
          onClick={() => onCancel(info)}
          disabled={isCanceling}
        >
          {isCanceling ? <Loader2 className="animate-spin" /> : <XCircle />}
          Cancelar agendamento
        </Button>
      </div>
    </div>
  );
}

function CancelScheduleDialog({
  appointment,
  open,
  isCanceling,
  onOpenChange,
  onConfirm,
}: {
  appointment: AppointmentInfo | null;
  open: boolean;
  isCanceling: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar agendamento</DialogTitle>
          <DialogDescription>
            Confirme o cancelamento antes de alterar o status do agendamento.
          </DialogDescription>
        </DialogHeader>

        {appointment && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <p className="font-medium text-foreground">
              {formatDateLabel(appointment.date)}
            </p>
            <p className="mt-1 text-muted-foreground">
              Horário: {appointment.time}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCanceling}
          >
            Manter agendamento
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isCanceling || !appointment}
          >
            {isCanceling && <Loader2 className="animate-spin" />}
            Cancelar agendamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <span className="text-right font-semibold text-muted-foreground">
        {label}:
      </span>
      <span className="col-span-3 text-foreground">{children}</span>
    </div>
  );
}

function formatDateLabel(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function Acompanhamento({ excecoes }: AcompanhamentoProps) {
  const queryClient = useQueryClient();
  const today = new Date();
  const [date, setDate] = useState<Date | undefined>(today);
  const [visibleMonth, setVisibleMonth] = useState(today);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentInfo | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<AppointmentInfo | null>(null);

  const visibleYear = visibleMonth.getFullYear();
  const visibleMonthNumber = visibleMonth.getMonth() + 1;
  const scheduleQueryKey = [
    "schedules",
    "month",
    visibleYear,
    visibleMonthNumber,
  ];

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: scheduleQueryKey,
    queryFn: () => {
      const { start, end } = getMonthDateTimeRange(visibleMonth);

      return GetSchedules({
        start,
        end,
        size: 500,
      });
    },
  });

  const cancelScheduleMutation = useMutation({
    mutationFn: (info: AppointmentInfo) => CancelSchedule(info.id, info),
    onSuccess: async (_updatedSchedule, info) => {
      toast.success("Agendamento cancelado.");
      setAppointmentToCancel(null);
      setSelectedAppointment((current) =>
        current?.id === info.id ? null : current,
      );
      await queryClient.invalidateQueries({ queryKey: scheduleQueryKey });
    },
    onError: () => {
      toast.error("Não foi possível cancelar o agendamento. Tente novamente.");
    },
  });

  const plannedSchedules = schedules.filter(isPlannedSchedule);

  const selectedDateKey = date ? formatDateToYYYYMMDD(date) : null;
  const todayDateKey = formatDateToYYYYMMDD(today);
  const agendamentos = getAppointmentsForDate(
    plannedSchedules,
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
    plannedSchedules,
    todayDateKey,
  );
  const weekAgendamentosCount = getAppointmentsCountForWeek(
    plannedSchedules,
    today,
  );
  const daysWithEvents = new Set(
    plannedSchedules
      .map((schedule) =>
        schedule.startDateTime
          ? getDateFromDateTime(schedule.startDateTime)
          : null,
      )
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

  function formatDateTimeForApi(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  function getMonthDateTimeRange(monthDate: Date) {
    const start = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      1,
      0,
      0,
      0,
    );
    const end = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      1,
      0,
      0,
      0,
    );

    return {
      start: formatDateTimeForApi(start),
      end: formatDateTimeForApi(end),
    };
  }

  function getDateFromDateTime(dateTime: string) {
    return dateTime.split("T")[0] ?? "";
  }

  function formatHourFromDateTime(dateTime: string) {
    return (dateTime.split("T")[1] ?? dateTime).slice(0, 5);
  }

  function isPlannedSchedule(schedule: ScheduleResponse) {
    return (
      schedule.status === ScheduleStatus.Scheduled ||
      schedule.status === ScheduleStatus.Rescheduled
    );
  }

  function getAppointmentsForDate(
    schedules: ScheduleResponse[],
    dateKey: string | null,
  ) {
    if (!dateKey) return [];

    return schedules
      .filter(
        (schedule) =>
          schedule.id !== undefined &&
          schedule.startDateTime &&
          schedule.endDateTime &&
          getDateFromDateTime(schedule.startDateTime) === dateKey,
      )
      .map((schedule) => ({
        id: schedule.id!,
        time: formatHourFromDateTime(schedule.startDateTime!),
        date: getDateFromDateTime(schedule.startDateTime!),
        startDateTime: schedule.startDateTime!,
        endDateTime: schedule.endDateTime!,
        reason: schedule.reason,
        treatmentId: schedule.treatmentId,
        clientId: schedule.clientId,
        status: schedule.status,
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  function getAppointmentsCountForWeek(
    schedules: ScheduleResponse[],
    referenceDate: Date,
  ) {
    const weekStart = new Date(referenceDate);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(referenceDate.getDate() - referenceDate.getDay());

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return schedules.reduce((total, schedule) => {
      if (!schedule.startDateTime) return total;

      const scheduleDate = new Date(
        `${getDateFromDateTime(schedule.startDateTime)}T00:00:00`,
      );
      const isCurrentWeek =
        scheduleDate >= weekStart && scheduleDate <= weekEnd;

      return isCurrentWeek ? total + 1 : total;
    }, 0);
  }

  function handleCancelAppointment(info: AppointmentInfo) {
    setAppointmentToCancel(info);
  }

  function handleConfirmCancelAppointment() {
    if (!appointmentToCancel) return;

    cancelScheduleMutation.mutate(appointmentToCancel);
  }

  function handleCancelDialogChange(open: boolean) {
    if (cancelScheduleMutation.isPending) return;

    if (!open) {
      setAppointmentToCancel(null);
    }
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
              classNames={{
                day_button:
                  "data-[selected-single=true]:bg-transparent data-[selected-single=true]:text-foreground",
              }}
              modifiers={{
                hasEvents: (d) => daysWithEvents.has(formatDateToYYYYMMDD(d)),
              }}
              modifiersClassNames={{
                hasEvents:
                  "mx-auto flex aspect-square w-3/4 items-center justify-center rounded-full bg-ring text-white hover:bg-ring hover:text-white!",
              }}
              onMonthChange={setVisibleMonth}
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
              <ScheduleOption
                info={a}
                key={`${a.id}-${a.date}-${a.time}-${a.treatmentId ?? i}`}
                onSelect={setSelectedAppointment}
              />
            ))}
          </div>
          <div className="px-4 py-3 border-t border-border bg-white/60">
            <p className="text-sm text-muted-foreground">
              Selecione um agendamento para ver mais informações.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Agendamento */}
      <Dialog
        open={!!selectedAppointment}
        onOpenChange={(open) => !open && setSelectedAppointment(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
            <DialogDescription>
              Informações do tratamento agendado.
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <AppointmentDetails
              info={selectedAppointment}
              onCancel={handleCancelAppointment}
              isCanceling={
                cancelScheduleMutation.isPending &&
                cancelScheduleMutation.variables?.id === selectedAppointment.id
              }
            />
          )}
        </DialogContent>
      </Dialog>

      <CancelScheduleDialog
        appointment={appointmentToCancel}
        open={!!appointmentToCancel}
        isCanceling={cancelScheduleMutation.isPending}
        onOpenChange={handleCancelDialogChange}
        onConfirm={handleConfirmCancelAppointment}
      />
    </div>
  );
}