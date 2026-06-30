import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import GetShifts, { CreateShift, UpdateShift } from "@/requests/ShiftRequest";
import {
  CreateScheduleException,
  DeleteScheduleException,
  GetScheduleExceptions,
  UpdateScheduleException,
  type ScheduleExceptionPayload,
  type ScheduleExceptionResponse,
} from "@/requests/ScheduleExceptionRequest";
import {
  DayOfWeek,
  ShiftStatus,
  type DayOfWeek as ApiDayOfWeek,
  type ShiftCreateRequest,
  type ShiftResponse,
  type ShiftStatus as ApiShiftStatus,
  type ShiftUpdateRequest,
} from "@joao.sumi/qdule";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type DiaSemana =
  | "Domingo"
  | "Segunda"
  | "Terça"
  | "Quarta"
  | "Quinta"
  | "Sexta"
  | "Sábado";

interface SlotPadrao {
  inicio: string; // "" enquanto não preenchido
  fim: string; // "" enquanto não preenchido
}

interface DiaPadrao {
  ativo: boolean;
  inicio: string;
  fim: string;
  breaks: SlotPadrao[];
}

export interface ExcecaoDia {
  id?: number;
  date: Date;
  tipo: "folga" | "horario_especial";
  slots: SlotPadrao[];
}

export interface ConfigHorariosHandle {
  /**
   * Verifica se há alterações não salvas no horário padrão. Se houver, abre
   * um modal de confirmação aqui dentro e retorna uma Promise que resolve
   * para `true` se a usuária confirmar que quer sair mesmo assim, ou `false`
   * se ela optar por continuar editando. Se não houver alterações
   * pendentes, resolve `true` imediatamente (pode navegar livremente).
   *
   * Chame isso no componente pai ANTES de desmontar/trocar para outra aba:
   *
   *   const podeSeguir = await configHorariosRef.current?.confirmarSaida();
   *   if (!podeSeguir) return;
   *   trocarDeAba(novaAba);
   */
  confirmarSaida: () => Promise<boolean>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DIAS: DiaSemana[] = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const HORAS = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}:00`,
)
  .concat(
    Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:30`),
  )
  .sort();

const SLOT_VAZIO: SlotPadrao = { inicio: "", fim: "" };
const EMPTY_SCHEDULE_EXCEPTIONS: ScheduleExceptionResponse[] = [];

const PADRAO_INICIAL: Record<DiaSemana, DiaPadrao> = {
  Domingo: { ativo: false, inicio: "", fim: "", breaks: [] },
  Segunda: { ativo: false, inicio: "", fim: "", breaks: [] },
  Terça: { ativo: false, inicio: "", fim: "", breaks: [] },
  Quarta: { ativo: false, inicio: "", fim: "", breaks: [] },
  Quinta: { ativo: false, inicio: "", fim: "", breaks: [] },
  Sexta: { ativo: false, inicio: "", fim: "", breaks: [] },
  Sábado: { ativo: false, inicio: "", fim: "", breaks: [] },
};

const DEFAULT_REST_TIME_BETWEEN_APPOINTMENTS = "PT0M";

const REST_TIME_OPTIONS = [
  { label: "Sem descanso", value: "PT0M" },
  { label: "5 minutos", value: "PT5M" },
  { label: "10 minutos", value: "PT10M" },
  { label: "15 minutos", value: "PT15M" },
  { label: "20 minutos", value: "PT20M" },
  { label: "30 minutos", value: "PT30M" },
];

function minutosParaDuracao(minutos: number) {
  return `PT${minutos}M`;
}

function duracaoParaMinutos(duration?: unknown) {
  if (!duration) return null;

  if (typeof duration === "number") {
    return duration > 60 ? Math.round(duration / 60) : duration;
  }

  if (typeof duration !== "string") {
    return null;
  }

  const match = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return null;

  const horas = Number(match[1] ?? 0);
  const minutos = Number(match[2] ?? 0);
  const segundos = Number(match[3] ?? 0);

  return horas * 60 + minutos + Math.round(segundos / 60);
}

function normalizarRestTime(duration?: unknown) {
  const minutos = duracaoParaMinutos(duration);
  if (minutos === null) return DEFAULT_REST_TIME_BETWEEN_APPOINTMENTS;

  return minutosParaDuracao(minutos);
}

function formatRestTimeLabel(duration: string) {
  const opcao = REST_TIME_OPTIONS.find((item) => item.value === duration);
  if (opcao) return opcao.label;

  const minutos = duracaoParaMinutos(duration);
  if (minutos === null) return duration;
  if (minutos === 1) return "1 minuto";

  return `${minutos} minutos`;
}

const DIA_PARA_API: Record<DiaSemana, ApiDayOfWeek> = {
  Domingo: DayOfWeek.Sunday,
  Segunda: DayOfWeek.Monday,
  Terça: DayOfWeek.Tuesday,
  Quarta: DayOfWeek.Wednesday,
  Quinta: DayOfWeek.Thursday,
  Sexta: DayOfWeek.Friday,
  Sábado: DayOfWeek.Saturday,
};

const API_PARA_DIA: Record<ApiDayOfWeek, DiaSemana> = {
  [DayOfWeek.Sunday]: "Domingo",
  [DayOfWeek.Monday]: "Segunda",
  [DayOfWeek.Tuesday]: "Terça",
  [DayOfWeek.Wednesday]: "Quarta",
  [DayOfWeek.Thursday]: "Quinta",
  [DayOfWeek.Friday]: "Sexta",
  [DayOfWeek.Saturday]: "Sábado",
};

const NOME_DIA_SHIFT: Record<DiaSemana, string> = {
  Domingo: "Domingo",
  Segunda: "Segunda-feira",
  Terça: "Terça-feira",
  Quarta: "Quarta-feira",
  Quinta: "Quinta-feira",
  Sexta: "Sexta-feira",
  Sábado: "Sábado",
};

function formatDate(d: Date) {
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function paraMinutos(horario: string) {
  const [h, m] = horario.split(":").map(Number);
  return h * 60 + m;
}

function intervaloCompleto(slot: SlotPadrao) {
  return slot.inicio !== "" && slot.fim !== "";
}

function todosCompletos(slots: SlotPadrao[]) {
  return slots.every(intervaloCompleto);
}

/**
 * Valida uma lista de intervalos de horário, considerando apenas os que já
 * têm início e fim preenchidos (intervalos incompletos são ignorados aqui —
 * a checagem de "está tudo preenchido" é feita separadamente, na hora de salvar):
 * - cada intervalo completo precisa ter início antes do fim
 * - intervalos completos não podem se sobrepor entre si (encostados, ex:
 *   08:00–12:00 seguido de 12:00–18:00, são permitidos)
 * Retorna null se tudo estiver ok, ou uma mensagem de erro caso contrário.
 */
function validarIntervalos(slots: SlotPadrao[]): string | null {
  const completos = slots.filter(intervaloCompleto);

  for (const slot of completos) {
    if (paraMinutos(slot.inicio) >= paraMinutos(slot.fim)) {
      return `O horário ${slot.inicio} – ${slot.fim} é inválido: o início precisa ser antes do fim.`;
    }
  }

  const ordenados = [...completos].sort(
    (a, b) => paraMinutos(a.inicio) - paraMinutos(b.inicio),
  );

  for (let i = 0; i < ordenados.length - 1; i++) {
    const atual = ordenados[i];
    const proximo = ordenados[i + 1];
    if (paraMinutos(proximo.inicio) < paraMinutos(atual.fim)) {
      return `Os horários ${atual.inicio}–${atual.fim} e ${proximo.inicio}–${proximo.fim} se sobrepõem.`;
    }
  }

  return null;
}

function clonePadrao(padrao: Record<DiaSemana, DiaPadrao>) {
  return DIAS.reduce(
    (acc, dia) => {
      acc[dia] = {
        ativo: padrao[dia].ativo,
        inicio: padrao[dia].inicio,
        fim: padrao[dia].fim,
        breaks: padrao[dia].breaks.map((intervalo) => ({ ...intervalo })),
      };
      return acc;
    },
    {} as Record<DiaSemana, DiaPadrao>,
  );
}

function normalizarHorarioApi(horario?: string) {
  if (!horario) return "";
  const match = horario.match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : horario;
}

function formatDateToYYYYMMDD(date: Date) {
  return date.toLocaleDateString("en-CA");
}

function dateTimeToDate(dateTime?: string) {
  const datePart = dateTime?.split("T")[0];
  return datePart ? new Date(`${datePart}T00:00:00`) : null;
}

function dateTimeToTime(dateTime?: string) {
  if (!dateTime) return "";
  const timePart = dateTime.includes("T") ? dateTime.split("T")[1] : dateTime;
  return normalizarHorarioApi(timePart);
}

function montarDateTime(date: Date, horario: string) {
  return `${formatDateToYYYYMMDD(date)}T${horario}:00`;
}

function ordenarSlots(slots: SlotPadrao[]) {
  return [...slots].sort(
    (a, b) => paraMinutos(a.inicio) - paraMinutos(b.inicio),
  );
}

function shiftParaBreaks(shift: ShiftResponse): SlotPadrao[] {
  return [...(shift.breaks ?? [])]
    .map((intervalo) => ({
      inicio: normalizarHorarioApi(intervalo.startTime),
      fim: normalizarHorarioApi(intervalo.endTime),
    }))
    .filter(intervaloCompleto)
    .sort((a, b) => paraMinutos(a.inicio) - paraMinutos(b.inicio));
}

function shiftParaDiaPadrao(shift: ShiftResponse): DiaPadrao {
  return {
    ativo: shift.status !== ShiftStatus.Disabled,
    inicio: normalizarHorarioApi(shift.startTime),
    fim: normalizarHorarioApi(shift.endTime),
    breaks: shiftParaBreaks(shift),
  };
}

function shiftsParaPadrao(shifts: ShiftResponse[] = []) {
  const next = clonePadrao(PADRAO_INICIAL);
  const shiftsPorDia = criarMapaShiftsPorDia(shifts);

  for (const [dia, shift] of shiftsPorDia) {
    next[dia] = shiftParaDiaPadrao(shift);
  }

  return next;
}

function validarDiaPadrao(dia: DiaSemana, config: DiaPadrao): string | null {
  if (!config.inicio || !config.fim) {
    return `${dia}: preencha o início e o fim do turno antes de salvar.`;
  }

  if (paraMinutos(config.inicio) >= paraMinutos(config.fim)) {
    return `${dia}: o início do turno precisa ser antes do fim.`;
  }

  if (!todosCompletos(config.breaks)) {
    return `${dia}: preencha o início e o fim de todas as pausas antes de salvar.`;
  }

  const erroBreaks = validarIntervalos(config.breaks);
  if (erroBreaks) {
    return `${dia}: ${erroBreaks}`;
  }

  for (const intervalo of config.breaks) {
    if (
      paraMinutos(intervalo.inicio) < paraMinutos(config.inicio) ||
      paraMinutos(intervalo.fim) > paraMinutos(config.fim)
    ) {
      return `${dia}: as pausas precisam ficar dentro do horário do turno.`;
    }
  }

  return null;
}

function diaPadraoParaPayload(
  dia: DiaSemana,
  config: DiaPadrao,
  status: ApiShiftStatus,
  restTimeBetweenAppointments: string,
): ShiftCreateRequest {
  const breaks = ordenarSlots(config.breaks);

  return {
    name: NOME_DIA_SHIFT[dia],
    startTime: config.inicio,
    endTime: config.fim,
    restTimeBetweenAppointments,
    breaks: breaks.map((intervalo) => ({
      startTime: intervalo.inicio,
      endTime: intervalo.fim,
    })),
    dayOfWeek: DIA_PARA_API[dia],
    status,
  };
}

function shiftParaPayloadComparavel(
  dia: DiaSemana,
  shift: ShiftResponse,
): ShiftUpdateRequest {
  return diaPadraoParaPayload(
    dia,
    shiftParaDiaPadrao(shift),
    shift.status ?? ShiftStatus.Enabled,
    shift.restTimeBetweenAppointments ?? DEFAULT_REST_TIME_BETWEEN_APPOINTMENTS,
  );
}

function payloadsIguais(
  a: ShiftCreateRequest | ShiftUpdateRequest,
  b: ShiftCreateRequest | ShiftUpdateRequest,
) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function criarMapaShiftsPorDia(shifts: ShiftResponse[] = []) {
  const mapa = new Map<DiaSemana, ShiftResponse>();

  if (!Array.isArray(shifts)) {
    return mapa;
  }

  for (const shift of shifts) {
    if (!shift.dayOfWeek) continue;
    const dia = API_PARA_DIA[shift.dayOfWeek];
    if (dia && !mapa.has(dia)) {
      mapa.set(dia, shift);
    }
  }

  return mapa;
}

function exceptionParaSlots(exception: ScheduleExceptionResponse): SlotPadrao[] {
  const startTime = dateTimeToTime(exception.startDateTime);
  const endTime = dateTimeToTime(exception.endDateTime);

  if (!startTime || !endTime) return [];

  const breaks = [...(exception.breaks ?? [])]
    .map((intervalo) => ({
      inicio: dateTimeToTime(intervalo.startDateTime),
      fim: dateTimeToTime(intervalo.endDateTime),
    }))
    .filter(intervaloCompleto)
    .sort((a, b) => paraMinutos(a.inicio) - paraMinutos(b.inicio));

  const slots: SlotPadrao[] = [];
  let inicioAtual = startTime;

  for (const intervalo of breaks) {
    if (paraMinutos(inicioAtual) < paraMinutos(intervalo.inicio)) {
      slots.push({ inicio: inicioAtual, fim: intervalo.inicio });
    }
    inicioAtual = intervalo.fim;
  }

  if (paraMinutos(inicioAtual) < paraMinutos(endTime)) {
    slots.push({ inicio: inicioAtual, fim: endTime });
  }

  return slots;
}

function exceptionParaExcecaoDia(
  exception: ScheduleExceptionResponse,
): ExcecaoDia | null {
  const date = dateTimeToDate(exception.startDateTime);
  if (!date) return null;

  const tipo =
    exception.reason?.toLowerCase() === "folga"
      ? "folga"
      : "horario_especial";

  return {
    id: exception.id,
    date,
    tipo,
    slots: tipo === "folga" ? [] : exceptionParaSlots(exception),
  };
}

function exceptionsParaExcecoes(
  exceptions: ScheduleExceptionResponse[] = [],
) {
  return exceptions
    .map(exceptionParaExcecaoDia)
    .filter((exception): exception is ExcecaoDia => exception !== null);
}

function excecaoParaPayload(excecao: ExcecaoDia): ScheduleExceptionPayload {
  if (excecao.tipo === "folga") {
    return {
      startDateTime: `${formatDateToYYYYMMDD(excecao.date)}T00:00:00`,
      endDateTime: `${formatDateToYYYYMMDD(excecao.date)}T23:59:59`,
      reason: "folga",
      breaks: [],
    };
  }

  const slots = ordenarSlots(excecao.slots);
  const primeiro = slots[0];
  const ultimo = slots[slots.length - 1];

  return {
    startDateTime: montarDateTime(excecao.date, primeiro.inicio),
    endDateTime: montarDateTime(excecao.date, ultimo.fim),
    reason: "horario_especial",
    breaks: slots.slice(0, -1).flatMap((slot, idx) => {
      const proximo = slots[idx + 1];
      if (slot.fim === proximo.inicio) return [];

      return [
        {
          startDateTime: montarDateTime(excecao.date, slot.fim),
          endDateTime: montarDateTime(excecao.date, proximo.inicio),
        },
      ];
    }),
  };
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SlotRow({
  slot,
  onChange,
  onRemove,
  removable,
  disabled = false,
}: {
  slot: SlotPadrao;
  onChange: (s: SlotPadrao) => void;
  onRemove: () => void;
  removable: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={slot.inicio || undefined}
        onValueChange={(v) => onChange({ ...slot, inicio: v })}
        disabled={disabled}
      >
        <SelectTrigger className="w-28">
          <SelectValue placeholder="Início" />
        </SelectTrigger>
        <SelectContent>
          {HORAS.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-xs text-muted-foreground">até</span>

      <Select
        value={slot.fim || undefined}
        onValueChange={(v) => onChange({ ...slot, fim: v })}
        disabled={disabled}
      >
        <SelectTrigger className="w-28">
          <SelectValue placeholder="Fim" />
        </SelectTrigger>
        <SelectContent>
          {HORAS.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
        disabled={!removable || disabled}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-primary/40">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="p-4 bg-background">{children}</div>
    </div>
  );
}

interface ConfigHorariosProps {
  excecoes: ExcecaoDia[];
  onChange: (excecoes: ExcecaoDia[]) => void;
}

export const ConfigHorarios = forwardRef<
  ConfigHorariosHandle,
  ConfigHorariosProps
>(function ConfigHorarios({ excecoes, onChange }, ref) {
  const queryClient = useQueryClient();

  // Horário padrão por dia da semana — começa tudo vazio, a usuária preenche.
  const [padrao, setPadrao] =
    useState<Record<DiaSemana, DiaPadrao>>(PADRAO_INICIAL);
  const [restTimeBetweenAppointments, setRestTimeBetweenAppointments] =
    useState(DEFAULT_REST_TIME_BETWEEN_APPOINTMENTS);

  const {
    data: shifts,
    isLoading: carregandoShifts,
    isError: erroAoCarregarShifts,
  } = useQuery({
    queryKey: ["shifts"],
    queryFn: () => GetShifts(),
    refetchOnWindowFocus: false,
  });

  const {
    data: scheduleExceptions = EMPTY_SCHEDULE_EXCEPTIONS,
    isLoading: carregandoExcecoes,
    isError: erroAoCarregarExcecoes,
  } = useQuery({
    queryKey: ["schedule-exceptions"],
    queryFn: () => GetScheduleExceptions({ page: 1, size: 100 }),
    refetchOnWindowFocus: false,
  });

  const shiftsPorDia = useMemo(() => criarMapaShiftsPorDia(shifts), [shifts]);
  const restTimeOptions = useMemo(() => {
    if (
      REST_TIME_OPTIONS.some(
        (option) => option.value === restTimeBetweenAppointments,
      )
    ) {
      return REST_TIME_OPTIONS;
    }

    return [
      ...REST_TIME_OPTIONS,
      {
        label: formatRestTimeLabel(restTimeBetweenAppointments),
        value: restTimeBetweenAppointments,
      },
    ];
  }, [restTimeBetweenAppointments]);

  // Dialog de nova exceção
  const [dialogOpen, setDialogOpen] = useState(false);
  const [excDate, setExcDate] = useState<Date | undefined>();
  const [excTipo, setExcTipo] = useState<"folga" | "horario_especial">("folga");
  const [excSlots, setExcSlots] = useState<SlotPadrao[]>([{ ...SLOT_VAZIO }]);

  // Dialog de confirmação de exclusão de exceção
  const [deleteExcTarget, setDeleteExcTarget] = useState<ExcecaoDia | null>(
    null,
  );

  // Dialog de confirmação de saída sem salvar (acionado via ref pelo pai)
  const [confirmSaidaOpen, setConfirmSaidaOpen] = useState(false);
  const resolveConfirmSaidaRef = useRef<((value: boolean) => void) | null>(
    null,
  );

  // ── Controle de alterações não salvas ─────────────────────────────────────
  // padraoRef sempre reflete o valor mais recente de `padrao` (evita
  // closures desatualizadas dentro de listeners/handles abaixo).
  const padraoRef = useRef(padrao);
  useEffect(() => {
    padraoRef.current = padrao;
  }, [padrao]);

  // padraoSalvoRef guarda o último estado que foi de fato salvo com sucesso.
  const padraoSalvoRef = useRef(padrao);
  const restTimeRef = useRef(restTimeBetweenAppointments);
  const restTimeSalvoRef = useRef(restTimeBetweenAppointments);

  useEffect(() => {
    restTimeRef.current = restTimeBetweenAppointments;
  }, [restTimeBetweenAppointments]);

  useEffect(() => {
    if (carregandoShifts || erroAoCarregarShifts) return;

    const padraoCarregado = shiftsParaPadrao(shifts);
    const restTimeCarregado = normalizarRestTime(
      shifts?.find((shift) => shift.restTimeBetweenAppointments)
        ?.restTimeBetweenAppointments,
    );

    padraoRef.current = padraoCarregado;
    padraoSalvoRef.current = padraoCarregado;
    restTimeRef.current = restTimeCarregado;
    restTimeSalvoRef.current = restTimeCarregado;

    let mounted = true;
    queueMicrotask(() => {
      if (mounted) {
        setPadrao(padraoCarregado);
        setRestTimeBetweenAppointments(restTimeCarregado);
      }
    });

    return () => {
      mounted = false;
    };
  }, [carregandoShifts, erroAoCarregarShifts, shifts]);

  useEffect(() => {
    if (carregandoExcecoes || erroAoCarregarExcecoes) return;

    const excecoesCarregadas = exceptionsParaExcecoes(scheduleExceptions);
    onChange(excecoesCarregadas);
  }, [
    carregandoExcecoes,
    erroAoCarregarExcecoes,
    onChange,
    scheduleExceptions,
  ]);

  function haAlteracoesNaoSalvas() {
    return (
      JSON.stringify(padraoRef.current) !==
        JSON.stringify(padraoSalvoRef.current) ||
      restTimeRef.current !== restTimeSalvoRef.current
    );
  }

  // Trava 1: fechar a aba, atualizar a página ou sair do site.
  // O navegador ignora mensagens customizadas e sempre mostra um diálogo
  // nativo genérico — por isso não dá pra usar o texto do toast aqui.
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (haAlteracoesNaoSalvas()) {
        e.preventDefault();
        e.returnValue = "";
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Trava 2: navegação dentro do app (trocar de aba no admin). O componente
  // pai deve chamar `confirmarSaida()` (via ref) antes de desmontar este
  // componente — veja a interface ConfigHorariosHandle no topo do arquivo.
  useImperativeHandle(ref, () => ({
    confirmarSaida: () => {
      if (!haAlteracoesNaoSalvas()) {
        return Promise.resolve(true);
      }

      return new Promise<boolean>((resolve) => {
        resolveConfirmSaidaRef.current = resolve;
        setConfirmSaidaOpen(true);
      });
    },
  }));

  function handleConfirmarSaida(decisao: boolean) {
    setConfirmSaidaOpen(false);
    resolveConfirmSaidaRef.current?.(decisao);
    resolveConfirmSaidaRef.current = null;
  }

  const salvarShiftsMutation = useMutation({
    mutationFn: async ({
      padraoAtual,
      restTimeAtual,
    }: {
      padraoAtual: Record<DiaSemana, DiaPadrao>;
      restTimeAtual: string;
    }) => {
      const requests: Array<Promise<ShiftResponse>> = [];

      for (const dia of DIAS) {
        const config = padraoAtual[dia];
        const shiftExistente = shiftsPorDia.get(dia);

        if (config.ativo) {
          const payload = diaPadraoParaPayload(
            dia,
            config,
            ShiftStatus.Enabled,
            restTimeAtual,
          );

          if (!shiftExistente) {
            requests.push(CreateShift(payload));
            continue;
          }

          if (shiftExistente.id === undefined) {
            throw new Error(`Shift de ${dia} não possui id para atualização.`);
          }

          if (
            !payloadsIguais(
              payload,
              shiftParaPayloadComparavel(dia, shiftExistente),
            )
          ) {
            requests.push(UpdateShift(shiftExistente.id, payload));
          }
          continue;
        }

        if (!shiftExistente) continue;

        if (shiftExistente.id === undefined) {
          throw new Error(`Shift de ${dia} não possui id para atualização.`);
        }

        const payload = diaPadraoParaPayload(
          dia,
          config.inicio && config.fim
            ? config
            : shiftParaDiaPadrao(shiftExistente),
          ShiftStatus.Disabled,
          restTimeAtual,
        );

        if (
          !payloadsIguais(
            payload,
            shiftParaPayloadComparavel(dia, shiftExistente),
          )
        ) {
          requests.push(UpdateShift(shiftExistente.id, payload));
        }
      }

      await Promise.all(requests);
    },
    onSuccess: async (_data, { padraoAtual, restTimeAtual }) => {
      const snapshot = clonePadrao(padraoAtual);
      padraoSalvoRef.current = snapshot;
      padraoRef.current = snapshot;
      restTimeSalvoRef.current = restTimeAtual;
      restTimeRef.current = restTimeAtual;

      toast.success("Horários atualizados com sucesso!");
      await queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
    onError: () => {
      toast.error("Não foi possível salvar os horários. Tente novamente.");
    },
  });

  const salvarExcecaoMutation = useMutation({
    mutationFn: async (excecao: ExcecaoDia) => {
      const payload = excecaoParaPayload(excecao);

      if (excecao.id !== undefined) {
        return UpdateScheduleException(excecao.id, payload);
      }

      return CreateScheduleException(payload);
    },
    onSuccess: async () => {
      setDialogOpen(false);
      toast.success("Exceção salva com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["schedule-exceptions"] });
    },
    onError: () => {
      toast.error("Não foi possível salvar a exceção. Tente novamente.");
    },
  });

  const removerExcecaoMutation = useMutation({
    mutationFn: (excecao: ExcecaoDia) => {
      if (excecao.id === undefined) {
        return Promise.resolve();
      }

      return DeleteScheduleException(excecao.id);
    },
    onSuccess: async (_data, excecao) => {
      setDeleteExcTarget(null);

      if (excecao.id === undefined) {
        onChange(excecoes.filter((e) => !isSameDay(e.date, excecao.date)));
      } else {
        await queryClient.invalidateQueries({
          queryKey: ["schedule-exceptions"],
        });
      }

      toast.success("Exceção removida.");
    },
    onError: () => {
      toast.error("Não foi possível remover a exceção. Tente novamente.");
    },
  });

  // ── Padrão helpers ────────────────────────────────────────────────────────

  function toggleDia(dia: DiaSemana) {
    setPadrao((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        ativo: !prev[dia].ativo,
      },
    }));
  }

  function updateTurno(dia: DiaSemana, field: "inicio" | "fim", value: string) {
    setPadrao((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [field]: value,
      },
    }));
  }

  function updateBreak(dia: DiaSemana, idx: number, slot: SlotPadrao) {
    setPadrao((prev) => {
      const breaks = [...prev[dia].breaks];
      breaks[idx] = slot;

      const erro = validarIntervalos(breaks);
      if (erro) {
        toast.error(erro);
        return prev;
      }

      return { ...prev, [dia]: { ...prev[dia], breaks } };
    });
  }

  function addBreak(dia: DiaSemana) {
    setPadrao((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        breaks: [...prev[dia].breaks, { ...SLOT_VAZIO }],
      },
    }));
  }

  function removeBreak(dia: DiaSemana, idx: number) {
    setPadrao((prev) => {
      const breaks = prev[dia].breaks.filter((_, i) => i !== idx);
      return { ...prev, [dia]: { ...prev[dia], breaks } };
    });
  }

  function handleSalvarAlteracoes() {
    for (const dia of DIAS) {
      if (!padrao[dia].ativo) continue;

      const erro = validarDiaPadrao(dia, padrao[dia]);
      if (erro) {
        toast.error(erro);
        return;
      }
    }

    salvarShiftsMutation.mutate({
      padraoAtual: clonePadrao(padrao),
      restTimeAtual: restTimeBetweenAppointments,
    });
  }

  // ── Exceção helpers ───────────────────────────────────────────────────────

  function openDialog() {
    setExcDate(undefined);
    setExcTipo("folga");
    setExcSlots([{ ...SLOT_VAZIO }]);
    setDialogOpen(true);
  }

  function updateExcSlot(idx: number, slot: SlotPadrao) {
    const next = [...excSlots];
    next[idx] = slot;

    const erro = validarIntervalos(next);
    if (erro) {
      toast.error(erro);
      return;
    }

    setExcSlots(next);
  }

  function addExcSlot() {
    setExcSlots((prev) => [...prev, { ...SLOT_VAZIO }]);
  }

  function saveExcecao() {
    if (!excDate) {
      toast.error("Selecione uma data para a exceção.");
      return;
    }

    if (excTipo === "horario_especial") {
      if (!todosCompletos(excSlots)) {
        toast.error(
          "Preencha o início e o fim de todos os horários antes de salvar.",
        );
        return;
      }

      const erro = validarIntervalos(excSlots);
      if (erro) {
        toast.error(erro);
        return;
      }
    }

    const excecaoExistente = excecoes.find((e) => isSameDay(e.date, excDate));

    salvarExcecaoMutation.mutate({
      id: excecaoExistente?.id,
      date: excDate,
      tipo: excTipo,
      slots: excTipo === "folga" ? [] : excSlots,
    });
  }

  function confirmRemoveExcecao(exc: ExcecaoDia) {
    setDeleteExcTarget(exc);
  }

  function handleRemoveExcecao() {
    if (!deleteExcTarget) return;
    removerExcecaoMutation.mutate(deleteExcTarget);
  }

  const excDates = excecoes.map((e) => e.date);
  const salvandoShifts = salvarShiftsMutation.isPending;
  const salvandoExcecao = salvarExcecaoMutation.isPending;
  const removendoExcecao = removerExcecaoMutation.isPending;
  const controlesPadraoDesabilitados = carregandoShifts || salvandoShifts;
  const controlesExcecoesDesabilitados =
    carregandoExcecoes || salvandoExcecao || removendoExcecao;

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Horário padrão */}
      <SectionCard
        title="Horário padrão"
        description="Dias e horários que se repetem toda semana"
      >
        {carregandoShifts && (
          <p className="text-sm text-muted-foreground py-2">
            Carregando horários...
          </p>
        )}

        {erroAoCarregarShifts && (
          <p className="text-sm text-destructive py-2">
            Não foi possível carregar os horários padrão.
          </p>
        )}

        <div className="pb-4 mb-1 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Descanso entre tratamentos
          </p>
          <Select
            value={restTimeBetweenAppointments}
            onValueChange={setRestTimeBetweenAppointments}
            disabled={controlesPadraoDesabilitados}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {restTimeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col divide-y divide-border -my-1">
          {DIAS.map((dia) => {
            const config = padrao[dia];
            return (
              <div key={dia} className="py-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={config.ativo}
                      onCheckedChange={() => toggleDia(dia)}
                      disabled={controlesPadraoDesabilitados}
                    />
                    <span
                      className={cn(
                        "text-sm w-8 font-medium",
                        config.ativo
                          ? "text-foreground"
                          : "text-accent line-through",
                      )}
                    >
                      {dia}
                    </span>
                    {!config.ativo && (
                      <span className="text-xs text-muted-foreground px-3">
                        Fechado
                      </span>
                    )}
                  </div>

                  {config.ativo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1 h-7 text-muted-foreground bg-primary/80"
                      onClick={() => addBreak(dia)}
                      disabled={controlesPadraoDesabilitados}
                    >
                      <Plus className="w-3 h-3" /> Pausa
                    </Button>
                  )}
                </div>

                {config.ativo && (
                  <div className="flex flex-col gap-3 pl-11">
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Turno
                      </p>
                      <div className="flex items-center gap-2">
                        <Select
                          value={config.inicio || undefined}
                          onValueChange={(value) =>
                            updateTurno(dia, "inicio", value)
                          }
                          disabled={controlesPadraoDesabilitados}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue placeholder="Início" />
                          </SelectTrigger>
                          <SelectContent>
                            {HORAS.map((h) => (
                              <SelectItem key={h} value={h}>
                                {h}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <span className="text-xs text-muted-foreground">
                          até
                        </span>

                        <Select
                          value={config.fim || undefined}
                          onValueChange={(value) =>
                            updateTurno(dia, "fim", value)
                          }
                          disabled={controlesPadraoDesabilitados}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue placeholder="Fim" />
                          </SelectTrigger>
                          <SelectContent>
                            {HORAS.map((h) => (
                              <SelectItem key={h} value={h}>
                                {h}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {config.breaks.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Pausas
                        </p>
                        {config.breaks.map((slot, idx) => (
                          <SlotRow
                            key={idx}
                            slot={slot}
                            onChange={(s) => updateBreak(dia, idx, s)}
                            onRemove={() => removeBreak(dia, idx)}
                            removable={!controlesPadraoDesabilitados}
                            disabled={controlesPadraoDesabilitados}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Exceções */}
      <SectionCard
        title="Exceções pontuais"
        description="Folgas ou horários especiais em datas específicas"
      >
        <div className="flex flex-col gap-3">
          {carregandoExcecoes && (
            <p className="text-sm text-muted-foreground py-2">
              Carregando exceções...
            </p>
          )}

          {erroAoCarregarExcecoes && (
            <p className="text-sm text-destructive py-2">
              Não foi possível carregar as exceções.
            </p>
          )}

          {!carregandoExcecoes && excecoes.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">
              Nenhuma exceção cadastrada.
            </p>
          )}

          {[...excecoes]
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((exc) => (
              <div
                key={exc.date.toISOString()}
                className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-white"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(exc.date)}
                    </p>

                    {exc.tipo === "folga" ? (
                      <div className="flex flex-col gap-0.5 mt-1">
                        <span className="inline-block w-fit text-xs font-medium px-2 py-0.5 rounded-md bg-red-100 text-red-800">
                          Folga
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Dia inteiro
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-0.5 mt-1">
                        <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                          Horário especial
                        </span>
                        {exc.slots.map((s, i) => (
                          <p key={i} className="text-xs text-muted-foreground">
                            {s.inicio} – {s.fim}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => confirmRemoveExcecao(exc)}
                  disabled={controlesExcecoesDesabilitados}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}

          <Button
            variant="outline"
            className="gap-2 w-fit bg-white"
            onClick={openDialog}
            disabled={controlesExcecoesDesabilitados}
          >
            <Plus className="w-4 h-4" /> Adicionar exceção
          </Button>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button
          onClick={handleSalvarAlteracoes}
          disabled={controlesPadraoDesabilitados}
        >
          {salvandoShifts ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>

      {/* Dialog nova exceção */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova exceção</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-1">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Selecione o dia
              </p>
              <div className="flex justify-center rounded-xl p-2">
                <Calendar
                  mode="single"
                  selected={excDate}
                  onSelect={setExcDate}
                  locale={ptBR}
                  disabled={{ before: new Date() }}
                  modifiers={{ hasException: excDates }}
                  modifiersClassNames={{
                    hasException: "bg-amber-100 text-amber-800 rounded-md",
                  }}
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Tipo
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setExcTipo("folga")}
                  className={cn(
                    "flex-1 py-2 rounded-lg border text-sm transition-colors",
                    excTipo === "folga"
                      ? "bg-ring text-white font-medium"
                      : "border-secondary text-ring hover:bg-primary",
                  )}
                >
                  Folga
                </button>
                <button
                  onClick={() => setExcTipo("horario_especial")}
                  className={cn(
                    "flex-1 py-2 rounded-lg border text-sm transition-colors",
                    excTipo === "horario_especial"
                      ? "bg-ring text-white font-medium"
                      : "border-secondary text-ring hover:bg-primary",
                  )}
                >
                  Horário especial
                </button>
              </div>
            </div>

            {excTipo === "horario_especial" && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Horários
                </p>
                {excSlots.map((slot, idx) => (
                  <SlotRow
                    key={idx}
                    slot={slot}
                    onChange={(s) => updateExcSlot(idx, s)}
                    onRemove={() =>
                      setExcSlots(excSlots.filter((_, i) => i !== idx))
                    }
                    removable={excSlots.length > 1}
                  />
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-fit gap-1 text-xs text-muted-foreground bg-primary/80"
                  onClick={addExcSlot}
                >
                  <Plus className="w-3 h-3" /> Intervalo
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={saveExcecao}
              disabled={!excDate || salvandoExcecao}
            >
              {salvandoExcecao ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmação de exclusão de exceção */}
      <Dialog
        open={!!deleteExcTarget}
        onOpenChange={(open) => !open && setDeleteExcTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover exceção</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Tem certeza que quer remover a exceção de{" "}
            <span className="font-medium text-foreground">
              {deleteExcTarget ? formatDate(deleteExcTarget.date) : ""}
            </span>
            ? Essa ação não pode ser desfeita.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteExcTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveExcecao}
              disabled={removendoExcecao}
            >
              {removendoExcecao ? "Removendo..." : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmação de saída sem salvar (acionado via confirmarSaida) */}
      <Dialog
        open={confirmSaidaOpen}
        onOpenChange={(open) => !open && handleConfirmarSaida(false)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sair sem salvar?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Você tem alterações no horário padrão que ainda não foram salvas. Se
            sair agora, elas serão perdidas.
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleConfirmarSaida(false)}
            >
              Continuar editando
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleConfirmarSaida(true)}
            >
              Sair sem salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});
