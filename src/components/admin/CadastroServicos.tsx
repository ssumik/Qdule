import { useState, useRef } from "react";
import { Pencil, Trash2, Plus, ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTreatments,
  createTreatment,
  updateTreatment,
  deleteTreatment,
  minutesToDuration,
  durationToMinutes,
  type TreatmentResponse,
  type TreatmentPayload,
  type TreatmentStatus,
  type TreatmentType,
} from "@/requests/TreatmentAdminRequests";

const CATEGORIAS: { label: string; value: TreatmentType }[] = [
  { label: "Estética facial", value: "FACIAL" },
  { label: "Estética corporal", value: "BODY" },
  { label: "Massoterapia", value: "MASSAGE_THERAPY" },
];

const CATEGORIA_LABEL: Record<TreatmentType, string> = {
  FACIAL: "Estética facial",
  BODY: "Estética corporal",
  MASSAGE_THERAPY: "Massoterapia",
};

type FormState = {
  nome: string;
  duracao: string; // minutos como string
  preco: string;
  descricao: string;
  categoria: TreatmentType | "";
  imagemUrl: string;
  status: TreatmentStatus;
};

const FORM_VAZIO: FormState = {
  nome: "",
  duracao: "",
  preco: "",
  descricao: "",
  categoria: "",
  imagemUrl: "",
  status: "ACTIVE",
};


export function Servicos() {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TreatmentResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TreatmentResponse | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VAZIO);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: page,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["treatments-admin"],
    queryFn: () => fetchTreatments({ page: 1, size: 100 }),
  });

  const servicos = page?.content ?? [];


  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["treatments-admin"] });
    // Invalida também a query usada pelo CardServicos público
    queryClient.invalidateQueries({ queryKey: ["treatments"] });
    setDialogOpen(false);
    setErrorMsg(null);
  };

  const onError = (err: unknown) => {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? "Erro ao salvar. Tente novamente.";
    setErrorMsg(msg);
  };

  const createMutation = useMutation({
    mutationFn: (payload: TreatmentPayload) => createTreatment(payload),
    onSuccess,
    onError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TreatmentPayload }) =>
      updateTreatment(id, payload),
    onSuccess,
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTreatment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatments-admin"] });
      queryClient.invalidateQueries({ queryKey: ["treatments"] });
      setDeleteTarget(null);
    },
    onError,
  });

  function openNew() {
    setEditing(null);
    setForm(FORM_VAZIO);
    setErrorMsg(null);
    setDialogOpen(true);
  }

  function openEdit(s: TreatmentResponse) {
    setEditing(s);
    setForm({
      nome: s.name,
      duracao: String(durationToMinutes(s.duration)),
      preco: String(s.price),
      descricao: s.description ?? "",
      categoria: s.type ?? "",
      imagemUrl: s.imagePath ?? "",
      status: s.status ?? "ACTIVE",
    });
    setErrorMsg(null);
    setDialogOpen(true);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, imagemUrl: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }

  function buildPayload(): TreatmentPayload | null {
    if (!form.nome || !form.duracao || !form.preco || !form.categoria) {
      setErrorMsg("Preencha todos os campos obrigatórios.");
      return null;
    }
    return {
      name: form.nome,
      description: form.descricao,
      duration: minutesToDuration(Number(form.duracao)),
      price: Number(form.preco),
      imagePath: form.imagemUrl,
      status: form.status,
      type: form.categoria as TreatmentType,
    };
  }

  function handleSave() {
    const payload = buildPayload();
    if (!payload) return;

    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Cadastro de serviços
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading
              ? "Carregando..."
              : `${servicos.length} serviço${servicos.length !== 1 ? "s" : ""} cadastrado${servicos.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo serviço
        </Button>
      </div>

      {isError && (
        <p className="text-sm text-destructive">
          Erro ao carregar serviços. Verifique a conexão com o servidor.
        </p>
      )}

      {/* Tabela */}
      <div className="border border-border rounded-xl overflow-hidden bg-background">
        {/* Header */}
        <div className="grid grid-cols-[40px_2fr_1fr_1fr_1fr_1fr_80px] px-4 py-2.5 bg-primary/40 border-b border-border">
          <span />
          <span className="text-xs font-medium text-muted-foreground">
            Nome | Descrição
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Categoria
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Duração
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Preço
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Status
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Ações
          </span>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando serviços...
          </div>
        )}

        {/* Vazio */}
        {!isLoading && servicos.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Nenhum serviço cadastrado.
          </p>
        )}

        {/* Linhas */}
        {servicos.map((s, i) => (
          <div
            key={s.id}
            className={`grid grid-cols-[40px_2fr_1fr_1fr_1fr_1fr_80px] px-4 py-3 items-center hover:bg-muted/30 transition-colors ${
              i < servicos.length - 1 ? "border-b border-border" : ""
            }`}
          >
            {/* Thumbnail */}
            <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
              {s.imagePath ? (
                <img
                  src={s.imagePath}
                  alt={s.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImagePlus className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>

            {/* Nome + Descrição */}
            <div className="flex flex-col min-w-0">
              <span className="text-sm text-foreground truncate">{s.name}</span>
              {s.description && (
                <span
                  className="text-xs text-muted-foreground truncate"
                  title={s.description}
                >
                  {s.description.length > 60
                    ? s.description.slice(0, 60).trimEnd() + "…"
                    : s.description}
                </span>
              )}
            </div>

            {/* Categoria */}
            <span className="text-sm text-muted-foreground">
              {s.type ? (
                CATEGORIA_LABEL[s.type]
              ) : (
                <span className="text-muted-foreground/40 italic">—</span>
              )}
            </span>

            {/* Duração */}
            <span className="text-sm text-muted-foreground">
              {durationToMinutes(s.duration)} min
            </span>

            {/* Preço */}
            <span className="text-sm text-muted-foreground">
              {s.price === 0
                ? "Consultar"
                : `R$ ${s.price.toFixed(2).replace(".", ",")}`}
            </span>

            {/* Status */}
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
                s.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  s.status === "ACTIVE" ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              {s.status === "ACTIVE" ? "Ativo" : "Inativo"}
            </span>

            {/* Ações */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => openEdit(s)}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(s)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Dialog criar / editar ─────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar serviço" : "Novo serviço"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Imagem */}
            <div className="grid gap-2">
              <Label>Imagem</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {form.imagemUrl ? (
                <div
                  className="relative w-full rounded-lg overflow-hidden border border-border group"
                  style={{ aspectRatio: "5 / 4" }}
                >
                  <img
                    src={form.imagemUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Trocar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        setForm((f) => ({ ...f, imagemUrl: "" }))
                      }
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ aspectRatio: "5 / 4" }}
                  className="w-full rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
                >
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-sm">
                    Clique para adicionar uma imagem
                  </span>
                </button>
              )}
            </div>

            {/* Nome */}
            <div className="grid gap-2">
              <Label>
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Ex: Massagem relaxante"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              />
            </div>

            {/* Descrição */}
            {(() => {
              const MAX = 160;
              const restante = MAX - form.descricao.length;
              const quaseNoLimite = restante <= 20;
              return (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Descrição</Label>
                    <span
                      className={`text-xs tabular-nums transition-colors ${
                        restante === 0
                          ? "text-destructive font-medium"
                          : quaseNoLimite
                          ? "text-amber-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {restante} caracteres restantes
                    </span>
                  </div>
                  <Textarea
                    placeholder="Descreva brevemente o serviço..."
                    value={form.descricao}
                    maxLength={MAX}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, descricao: e.target.value }))
                    }
                    className={`resize-none h-20 transition-colors ${
                      restante === 0
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                  />
                </div>
              );
            })()}

            {/* Categoria */}
            <div className="grid gap-2">
              <Label>
                Categoria <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.categoria}
                onValueChange={(val) =>
                  setForm((f) => ({ ...f, categoria: val as TreatmentType }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duração, Preço e Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>
                  Duração (min) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="45"
                  value={form.duracao}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duracao: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>
                  Preço (R$) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="80"
                  value={form.preco}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, preco: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(val) =>
                  setForm((f) => ({
                    ...f,
                    status: val as TreatmentStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="INACTIVE">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Erro */}
            {errorMsg && (
              <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
                {errorMsg}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editing ? "Salvar alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog excluir ────────────────────────────────────────────────────── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir serviço</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Tem certeza que quer excluir{" "}
            <span className="font-medium text-foreground">
              {deleteTarget?.name}
            </span>
            ? Essa ação não pode ser desfeita.
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="gap-2"
            >
              {deleteMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}