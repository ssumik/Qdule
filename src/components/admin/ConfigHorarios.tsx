import {
  forwardRef,
  useEffect,
  useImperativeHandle,
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

// ─── Tipos ────────────────────────────────────────────────────────────────────

type DiaSemana = "Domingo" | "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado";

interface SlotPadrao {
  inicio: string; // "" enquanto não preenchido
  fim: string; // "" enquanto não preenchido
}

interface DiaPadrao {
  ativo: boolean;
  slots: SlotPadrao[];
}

export interface ExcecaoDia {
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

const DIAS: DiaSemana[] = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const HORAS = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}:00`,
)
  .concat(
    Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:30`),
  )
  .sort();

const SLOT_VAZIO: SlotPadrao = { inicio: "", fim: "" };

const PADRAO_INICIAL: Record<DiaSemana, DiaPadrao> = {
  Domingo: { ativo: false, slots: [] },
  Segunda: { ativo: true, slots: [{ ...SLOT_VAZIO }] },
  Terça: { ativo: true, slots: [{ ...SLOT_VAZIO }] },
  Quarta: { ativo: true, slots: [{ ...SLOT_VAZIO }] },
  Quinta: { ativo: true, slots: [{ ...SLOT_VAZIO }] },
  Sexta: { ativo: true, slots: [{ ...SLOT_VAZIO }] },
  Sábado: { ativo: true, slots: [{ ...SLOT_VAZIO }] },
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

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SlotRow({
  slot,
  onChange,
  onRemove,
  removable,
}: {
  slot: SlotPadrao;
  onChange: (s: SlotPadrao) => void;
  onRemove: () => void;
  removable: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={slot.inicio || undefined}
        onValueChange={(v) => onChange({ ...slot, inicio: v })}
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
        disabled={!removable}
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

export const ConfigHorarios = forwardRef<ConfigHorariosHandle, ConfigHorariosProps>(
  function ConfigHorarios({ excecoes, onChange }, ref) {
    // Horário padrão por dia da semana — começa tudo vazio, a usuária preenche.
    const [padrao, setPadrao] = useState<Record<DiaSemana, DiaPadrao>>(PADRAO_INICIAL);

    // Dialog de nova exceção
    const [dialogOpen, setDialogOpen] = useState(false);
    const [excDate, setExcDate] = useState<Date | undefined>();
    const [excTipo, setExcTipo] = useState<"folga" | "horario_especial">("folga");
    const [excSlots, setExcSlots] = useState<SlotPadrao[]>([{ ...SLOT_VAZIO }]);

    // Dialog de confirmação de exclusão de exceção
    const [deleteExcTarget, setDeleteExcTarget] = useState<ExcecaoDia | null>(null);

    // Dialog de confirmação de saída sem salvar (acionado via ref pelo pai)
    const [confirmSaidaOpen, setConfirmSaidaOpen] = useState(false);
    const resolveConfirmSaidaRef = useRef<((value: boolean) => void) | null>(null);

    // ── Controle de alterações não salvas ─────────────────────────────────────
    // padraoRef sempre reflete o valor mais recente de `padrao` (evita
    // closures desatualizadas dentro de listeners/handles abaixo).
    const padraoRef = useRef(padrao);
    useEffect(() => {
      padraoRef.current = padrao;
    }, [padrao]);

    // padraoSalvoRef guarda o último estado que foi de fato salvo com sucesso.
    const padraoSalvoRef = useRef(padrao);

    function haAlteracoesNaoSalvas() {
      return JSON.stringify(padraoRef.current) !== JSON.stringify(padraoSalvoRef.current);
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

    // ── Padrão helpers ────────────────────────────────────────────────────────

    function toggleDia(dia: DiaSemana) {
      setPadrao((prev) => ({
        ...prev,
        [dia]: {
          ...prev[dia],
          ativo: !prev[dia].ativo,
          slots:
            !prev[dia].ativo && prev[dia].slots.length === 0
              ? [{ ...SLOT_VAZIO }]
              : prev[dia].slots,
        },
      }));
    }

    function updateSlot(dia: DiaSemana, idx: number, slot: SlotPadrao) {
      setPadrao((prev) => {
        const slots = [...prev[dia].slots];
        slots[idx] = slot;

        const erro = validarIntervalos(slots);
        if (erro) {
          toast.error(erro);
          return prev;
        }

        return { ...prev, [dia]: { ...prev[dia], slots } };
      });
    }

    function addSlot(dia: DiaSemana) {
      setPadrao((prev) => ({
        ...prev,
        [dia]: {
          ...prev[dia],
          slots: [...prev[dia].slots, { ...SLOT_VAZIO }],
        },
      }));
    }

    function removeSlot(dia: DiaSemana, idx: number) {
      setPadrao((prev) => {
        const slots = prev[dia].slots.filter((_, i) => i !== idx);
        return { ...prev, [dia]: { ...prev[dia], slots } };
      });
    }

    function handleSalvarAlteracoes() {
      for (const dia of DIAS) {
        if (!padrao[dia].ativo) continue;

        if (!todosCompletos(padrao[dia].slots)) {
          toast.error(`${dia}: preencha o início e o fim de todos os intervalos antes de salvar.`);
          return;
        }

        const erro = validarIntervalos(padrao[dia].slots);
        if (erro) {
          toast.error(`${dia}: ${erro}`);
          return;
        }
      }

      // marca o estado atual como "salvo" para o controle de alterações pendentes
      padraoSalvoRef.current = padrao;

      toast.success("Horários atualizados com sucesso!");
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
          toast.error("Preencha o início e o fim de todos os horários antes de salvar.");
          return;
        }

        const erro = validarIntervalos(excSlots);
        if (erro) {
          toast.error(erro);
          return;
        }
      }

      const sem = excecoes.filter((e) => !isSameDay(e.date, excDate));

      onChange([
        ...sem,
        {
          date: excDate,
          tipo: excTipo,
          slots: excTipo === "folga" ? [] : excSlots,
        },
      ]);

      setDialogOpen(false);
      toast.success("Exceção salva com sucesso.");
    }

    function confirmRemoveExcecao(exc: ExcecaoDia) {
      setDeleteExcTarget(exc);
    }

    function handleRemoveExcecao() {
      if (!deleteExcTarget) return;
      onChange(excecoes.filter((e) => !isSameDay(e.date, deleteExcTarget.date)));
      setDeleteExcTarget(null);
      toast.success("Exceção removida.");
    }

    const excDates = excecoes.map((e) => e.date);

    return (
      <div className="p-6 flex flex-col gap-6">
        {/* Horário padrão */}
        <SectionCard
          title="Horário padrão"
          description="Dias e horários que se repetem toda semana"
        >
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
                        onClick={() => addSlot(dia)}
                      >
                        <Plus className="w-3 h-3" /> Intervalo
                      </Button>
                    )}
                  </div>

                  {config.ativo && (
                    <div className="flex flex-col gap-2 pl-11">
                      {config.slots.map((slot, idx) => (
                        <SlotRow
                          key={idx}
                          slot={slot}
                          onChange={(s) => updateSlot(dia, idx, s)}
                          onRemove={() => removeSlot(dia, idx)}
                          removable={config.slots.length > 1}
                        />
                      ))}
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
            {excecoes.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">
                Nenhuma exceção cadastrada.
              </p>
            )}

            {excecoes
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
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}

            <Button
              variant="outline"
              className="gap-2 w-fit bg-white"
              onClick={openDialog}
            >
              <Plus className="w-4 h-4" /> Adicionar exceção
            </Button>
          </div>
        </SectionCard>

        <div className="flex justify-end">
          <Button onClick={handleSalvarAlteracoes}>Salvar alterações</Button>
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
              <Button onClick={saveExcecao} disabled={!excDate}>
                Salvar
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
              <Button variant="destructive" onClick={handleRemoveExcecao}>
                Remover
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
              Você tem alterações no horário padrão que ainda não foram
              salvas. Se sair agora, elas serão perdidas.
            </p>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleConfirmarSaida(false)}>
                Continuar editando
              </Button>
              <Button variant="destructive" onClick={() => handleConfirmarSaida(true)}>
                Sair sem salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  },
);