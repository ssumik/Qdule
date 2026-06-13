import { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
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

type DiaSemana = "Dom" | "Seg" | "Ter" | "Qua" | "Qui" | "Sex" | "Sáb";

interface SlotPadrao {
  inicio: string;
  fim: string;
}

interface DiaPadrao {
  ativo: boolean;
  slots: SlotPadrao[];
}

interface ExcecaoDia {
  date: Date;
  tipo: "folga" | "horario_especial";
  slots: SlotPadrao[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DIAS: DiaSemana[] = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const HORAS = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}:00`,
)
  .concat(
    Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:30`),
  )
  .sort();

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
        value={slot.inicio}
        onValueChange={(v) => onChange({ ...slot, inicio: v })}
      >
        <SelectTrigger className="w-28">
          <SelectValue />
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
        value={slot.fim}
        onValueChange={(v) => onChange({ ...slot, fim: v })}
      >
        <SelectTrigger className="w-28">
          <SelectValue />
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
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background">
      <div className="px-4 py-3 bg-muted/40 border-b border-border">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ConfigHorarios() {
  // Horário padrão por dia da semana
  const [padrao, setPadrao] = useState<Record<DiaSemana, DiaPadrao>>({
    Dom: { ativo: false, slots: [] },
    Seg: { ativo: true, slots: [{ inicio: "08:00", fim: "18:00" }] },
    Ter: { ativo: true, slots: [{ inicio: "08:00", fim: "18:00" }] },
    Qua: { ativo: true, slots: [{ inicio: "08:00", fim: "18:00" }] },
    Qui: { ativo: true, slots: [{ inicio: "08:00", fim: "18:00" }] },
    Sex: { ativo: true, slots: [{ inicio: "08:00", fim: "18:00" }] },
    Sáb: { ativo: true, slots: [{ inicio: "09:00", fim: "14:00" }] },
  });

  // Exceções por data
  const [excecoes, setExcecoes] = useState<ExcecaoDia[]>([]);

  // Dialog de nova exceção
  const [dialogOpen, setDialogOpen] = useState(false);
  const [excDate, setExcDate] = useState<Date | undefined>();
  const [excTipo, setExcTipo] = useState<"folga" | "horario_especial">("folga");
  const [excSlots, setExcSlots] = useState<SlotPadrao[]>([
    { inicio: "08:00", fim: "18:00" },
  ]);

  // ── Padrão helpers ──────────────────────────────────────────────────────────

  function toggleDia(dia: DiaSemana) {
    setPadrao((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        ativo: !prev[dia].ativo,
        slots:
          !prev[dia].ativo && prev[dia].slots.length === 0
            ? [{ inicio: "08:00", fim: "18:00" }]
            : prev[dia].slots,
      },
    }));
  }

  function updateSlot(dia: DiaSemana, idx: number, slot: SlotPadrao) {
    setPadrao((prev) => {
      const slots = [...prev[dia].slots];
      slots[idx] = slot;
      return { ...prev, [dia]: { ...prev[dia], slots } };
    });
  }

  function addSlot(dia: DiaSemana) {
    setPadrao((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        slots: [...prev[dia].slots, { inicio: "08:00", fim: "12:00" }],
      },
    }));
  }

  function removeSlot(dia: DiaSemana, idx: number) {
    setPadrao((prev) => {
      const slots = prev[dia].slots.filter((_, i) => i !== idx);
      return { ...prev, [dia]: { ...prev[dia], slots } };
    });
  }

  // ── Exceção helpers ─────────────────────────────────────────────────────────

  function openDialog() {
    setExcDate(undefined);
    setExcTipo("folga");
    setExcSlots([{ inicio: "08:00", fim: "18:00" }]);
    setDialogOpen(true);
  }

  function saveExcecao() {
    if (!excDate) return;
    setExcecoes((prev) => {
      const sem = prev.filter((e) => !isSameDay(e.date, excDate));
      return [
        ...sem,
        {
          date: excDate,
          tipo: excTipo,
          slots: excTipo === "folga" ? [] : excSlots,
        },
      ];
    });
    setDialogOpen(false);
  }

  function removeExcecao(date: Date) {
    setExcecoes((prev) => prev.filter((e) => !isSameDay(e.date, date)));
  }

  const excDates = excecoes.map((e) => e.date);

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Horários de atendimento
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure sua agenda padrão e exceções pontuais por data.
        </p>
      </div>

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
                          : "text-muted-foreground",
                      )}
                    >
                      {dia}
                    </span>
                    {!config.ativo && (
                      <span className="text-xs text-muted-foreground">
                        Fechado
                      </span>
                    )}
                  </div>

                  {config.ativo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1 h-7 text-muted-foreground"
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
                className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(exc.date)}
                    </p>
                    {exc.tipo === "folga" ? (
                      <Badge
                        variant="secondary"
                        className="mt-1 bg-red-100 text-red-800 hover:bg-red-100"
                      >
                        Folga
                      </Badge>
                    ) : (
                      <div className="flex flex-col gap-0.5 mt-1">
                        <Badge
                          variant="secondary"
                          className="w-fit bg-blue-100 text-blue-800 hover:bg-blue-100"
                        >
                          Horário especial
                        </Badge>
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
                  onClick={() => removeExcecao(exc.date)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}

          <Button
            variant="outline"
            className="gap-2 w-fit"
            onClick={openDialog}
          >
            <Plus className="w-4 h-4" /> Adicionar exceção
          </Button>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button>Salvar alterações</Button>
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
              <div className="flex justify-center border border-border rounded-xl p-2">
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
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  Folga
                </button>
                <button
                  onClick={() => setExcTipo("horario_especial")}
                  className={cn(
                    "flex-1 py-2 rounded-lg border text-sm transition-colors",
                    excTipo === "horario_especial"
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:bg-muted",
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
                    onChange={(s) => {
                      const next = [...excSlots];
                      next[idx] = s;
                      setExcSlots(next);
                    }}
                    onRemove={() =>
                      setExcSlots(excSlots.filter((_, i) => i !== idx))
                    }
                    removable={excSlots.length > 1}
                  />
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-fit gap-1 text-xs text-muted-foreground"
                  onClick={() =>
                    setExcSlots([
                      ...excSlots,
                      { inicio: "08:00", fim: "12:00" },
                    ])
                  }
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
    </div>
  );
}
