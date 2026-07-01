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
import { supabase } from "@/lib/supabase";

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
  duracao: string;
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

  const [uploadingImage, setUploadingImage] = useState(false);
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

  async function uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `servicos/${fileName}`;

    const { error } = await supabase.storage
      .from("treatments")
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("treatments")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, imagemUrl: url }));
    } catch (err) {
      console.error("Erro no upload da imagem:", err);
    } finally {
      setUploadingImage(false);
    }
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
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        <Button onClick={openNew} className="gap-2 w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4" />
          Novo serviço
        </Button>
      </div>

      {isError && (
        <p className="text-sm text-destructive">
          Erro ao carregar serviços. Verifique a conexão com o servidor.
        </p>
      )}

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

      {/* ── VISÃO DESKTOP (TABELA) ────────────────────────────────────────── */}
      {!isLoading && servicos.length > 0 && (
        <div className="hidden md:block border border-border rounded-xl overflow-hidden bg-background">
          <div className="grid grid-cols-[40px_2fr_1fr_1fr_1fr_1fr_80px] px-4 py-2.5 bg-primary/40 border-b border-border">
            <span />
            <span className="text-xs font-medium text-muted-foreground">Nome | Descrição</span>
            <span className="text-xs font-medium text-muted-foreground">Categoria</span>
            <span className="text-xs font-medium text-muted-foreground">Duração</span>
            <span className="text-xs font-medium text-muted-foreground">Preço</span>
            <span className="text-xs font-medium text-muted-foreground">Status</span>
            <span className="text-xs font-medium text-muted-foreground">Ações</span>
          </div>

          {servicos.map((s, i) => (
            <div
              key={s.id}
              className={`grid grid-cols-[40px_2fr_1fr_1fr_1fr_1fr_80px] px-4 py-3 items-center hover:bg-muted/30 transition-colors ${
                i < servicos.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
                {s.imagePath ? (
                  <img src={s.imagePath} alt={s.name} className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>

              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-sm text-foreground truncate">{s.name}</span>
                {s.description && (
                  <span className="text-xs text-muted-foreground truncate" title={s.description}>
                    {s.description}
                  </span>
                )}
              </div>

              <span className="text-sm text-muted-foreground">
                {s.type ? CATEGORIA_LABEL[s.type] : <span className="text-muted-foreground/40 italic">—</span>}
              </span>

              <span className="text-sm text-muted-foreground">{durationToMinutes(s.duration)} min</span>

              <span className="text-sm text-muted-foreground">
                {s.price === 0 ? "Consultar" : `R$ ${s.price.toFixed(2).replace(".", ",")}`}
              </span>

              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
                  s.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${s.status === "ACTIVE" ? "bg-green-500" : "bg-gray-400"}`} />
                {s.status === "ACTIVE" ? "Ativo" : "Inativo"}
              </span>

              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(s)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── VISÃO MOBILE (CARDS) ───────────────────────────────────────────── */}
      {!isLoading && servicos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
          {servicos.map((s) => (
            <div key={s.id} className="border border-border rounded-xl p-4 bg-background flex flex-col gap-3 shadow-sm relative">
              
              {/* Badge de Status no topo direito */}
              <div className="absolute top-4 right-4">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                    s.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${s.status === "ACTIVE" ? "bg-green-500" : "bg-gray-400"}`} />
                  {s.status === "ACTIVE" ? "Ativo" : "Inativo"}
                </span>
              </div>

              {/* Informações Principais */}
              <div className="flex gap-3 items-start">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
                  {s.imagePath ? (
                    <img src={s.imagePath} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex flex-col min-w-0 pl-5">
                  <span className="text-base font-bold text-accent truncate">{s.name}</span>
                  <span className="text-xs text-accent font-medium mt-0.5">
                    {s.type ? CATEGORIA_LABEL[s.type] : "Sem categoria"}
                  </span>
                </div>
              </div>

              {/* Descrição */}
              {s.description && (
                <span className="text-xs font-medium text-gray-500 p-2">
                  {s.description}
                </span>
              )}

              {/* Detalhes de Preço e Tempo */}
              <div className="flex items-center justify-between pt-2.5 mt-1 text-sm">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Duração</span>
                  <span className="font-semibold text-foreground">{durationToMinutes(s.duration)} min</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground">Preço</span>
                  <span className="font-semibold text-foreground">
                    {s.price === 0 ? "Consultar" : `R$ ${s.price.toFixed(2).replace(".", ",")}`}
                  </span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 border-t border-border pt-2 mt-1">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5 h-9 bg-white" onClick={() => openEdit(s)}>
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1.5 h-9 border-destructive text-destructive bg-white" onClick={() => setDeleteTarget(s)}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Dialog criar / editar ─────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {/* Adicionado max-w-[92vw] e sm:max-w-md para não quebrar no mobile */}
        <DialogContent className="max-w-[92vw] sm:max-w-md rounded-xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
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
              {uploadingImage ? (
                <div
                  className="w-full rounded-lg border flex items-center justify-center gap-2 text-muted-foreground"
                  style={{ aspectRatio: "5 / 4" }}
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando imagem...
                </div>
              ) : form.imagemUrl ? (
                <div
                  className="relative w-full rounded-lg overflow-hidden border border-border group"
                  style={{ aspectRatio: "5 / 4" }}
                >
                  <img
                    src={form.imagemUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-black/40 sm:opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
                  className="w-full rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground p-4"
                >
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-sm text-center">
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
                      {restante} caracteres
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
                      restante === 0 ? "border-destructive focus-visible:ring-destructive" : ""
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

            {/* Duração e Preço */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>
                  Duração (min) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Ex: 120"
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
                  placeholder="Ex: 80"
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

            {errorMsg && (
              <p className="text-sm text-destructive rounded-md px-3 py-2">
                {errorMsg}
              </p>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 w-full sm:w-auto justify-center">
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
        <DialogContent className="max-w-[92vw] sm:max-w-sm rounded-xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Excluir serviço</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground py-2">
            Tem certeza que quer excluir{" "}
            <span className="font-medium text-foreground">
              {deleteTarget?.name}
            </span>
            ? Essa ação não pode ser desfeita.
          </p>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="gap-2 w-full sm:w-auto justify-center"
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