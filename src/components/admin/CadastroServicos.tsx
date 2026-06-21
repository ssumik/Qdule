import { useState, useRef } from "react";
import { Pencil, Trash2, Plus, ImagePlus, X } from "lucide-react";
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
import { mockServicos, type Servico } from "@/components/admin/mockData";

const CATEGORIAS = [
  "Estética facial",
  "Estética corporal",
  "Massoterapia",
  "Outros",
];

// Extended Servico type with new fields
type ServicoCompleto = Servico & {
  descricao?: string;
  categoria?: string;
  imagemUrl?: string;
};

type FormState = {
  nome: string;
  duracao: string;
  preco: string;
  descricao: string;
  categoria: string;
  imagemUrl: string;
};

export function Servicos() {
  const [servicos, setServicos] = useState<ServicoCompleto[]>(mockServicos);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServicoCompleto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServicoCompleto | null>(null);
  const [form, setForm] = useState<FormState>({
    nome: "",
    duracao: "",
    preco: "",
    descricao: "",
    categoria: "",
    imagemUrl: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openNew() {
    setEditing(null);
    setForm({ nome: "", duracao: "", preco: "", descricao: "", categoria: "", imagemUrl: "" });
    setDialogOpen(true);
  }

  function openEdit(s: ServicoCompleto) {
    setEditing(s);
    setForm({
      nome: s.nome,
      duracao: String(s.duracao),
      preco: String(s.preco),
      descricao: s.descricao ?? "",
      categoria: s.categoria ?? "",
      imagemUrl: s.imagemUrl ?? "",
    });
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

  function handleSave() {
    if (!form.nome || !form.duracao || !form.preco) return;

    if (editing) {
      setServicos((prev) =>
        prev.map((s) =>
          s.id === editing.id
            ? {
                ...s,
                nome: form.nome,
                duracao: Number(form.duracao),
                preco: Number(form.preco),
                descricao: form.descricao,
                categoria: form.categoria,
                imagemUrl: form.imagemUrl,
              }
            : s,
        ),
      );
    } else {
      const newId = Math.max(...servicos.map((s) => s.id)) + 1;
      setServicos((prev) => [
        ...prev,
        {
          id: newId,
          nome: form.nome,
          duracao: Number(form.duracao),
          preco: Number(form.preco),
          descricao: form.descricao,
          categoria: form.categoria,
          imagemUrl: form.imagemUrl,
        },
      ]);
    }

    setDialogOpen(false);
  }

  function confirmDelete(s: ServicoCompleto) {
    setDeleteTarget(s);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setServicos((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Cadastro de serviços
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {servicos.length} serviço{servicos.length !== 1 ? "s" : ""}{" "}
            cadastrado{servicos.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo serviço
        </Button>
      </div>

      <div className="border border-border rounded-xl overflow-hidden bg-background">
        {/* Header */}
        <div className="grid grid-cols-[40px_2fr_1fr_1fr_1fr_80px] px-4 py-2.5 bg-primary/40 border-b border-border">
          <span />
          <span className="text-xs font-medium text-muted-foreground">Nome | Descrição</span>
          <span className="text-xs font-medium text-muted-foreground">Categoria</span>
          <span className="text-xs font-medium text-muted-foreground">Duração</span>
          <span className="text-xs font-medium text-muted-foreground">Preço</span>
          <span className="text-xs font-medium text-muted-foreground">Ações</span>
        </div>

        {servicos.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Nenhum serviço cadastrado.
          </p>
        )}

        {servicos.map((s, i) => (
          <div
            key={s.id}
            className={`grid grid-cols-[40px_2fr_1fr_1fr_1fr_80px] px-4 py-3 items-center hover:bg-muted/30 transition-colors ${
              i < servicos.length - 1 ? "border-b border-border" : ""
            }`}
          >
            {/* Thumbnail */}
            <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
              {s.imagemUrl ? (
                <img src={s.imagemUrl} alt={s.nome} className="w-full h-full object-cover" />
              ) : (
                <ImagePlus className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm text-foreground truncate">{s.nome}</span>
              {s.descricao && (
                <span className="text-xs text-muted-foreground truncate" title={s.descricao}>
                  {s.descricao.length > 60 ? s.descricao.slice(0, 60).trimEnd() + "…" : s.descricao}
                </span>
              )}
            </div>

            <span className="text-sm text-muted-foreground">
              {s.categoria || <span className="text-muted-foreground/40 italic">—</span>}
            </span>
            <span className="text-sm text-muted-foreground">{s.duracao} min</span>
            <span className="text-sm text-muted-foreground">
              R$ {s.preco.toFixed(2).replace(".", ",")}
            </span>
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
                onClick={() => confirmDelete(s)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar serviço" : "Novo serviço"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Image upload */}
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
                <div className="relative w-full rounded-lg overflow-hidden border border-border group" style={{ aspectRatio: "5 / 4" }}>
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
                      onClick={() => setForm((f) => ({ ...f, imagemUrl: "" }))}
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
                  <span className="text-sm">Clique para adicionar uma imagem</span>
                </button>
              )}
            </div>

            {/* Nome */}
            <div className="grid gap-2">
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Massagem"
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
                    onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                    className={`resize-none h-20 transition-colors ${
                      restante === 0 ? "border-destructive focus-visible:ring-destructive" : ""
                    }`}
                  />
                </div>
              );
            })()}

            {/* Categoria */}
            <div className="grid gap-2">
              <Label>Categoria</Label>
              <Select
                value={form.categoria}
                onValueChange={(val) => setForm((f) => ({ ...f, categoria: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duração e Preço */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Duração (min)</Label>
                <Input
                  type="number"
                  placeholder="60"
                  value={form.duracao}
                  onChange={(e) => setForm((f) => ({ ...f, duracao: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Preço (R$)</Label>
                <Input
                  type="number"
                  placeholder="80"
                  value={form.preco}
                  onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editing ? "Salvar alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir serviço</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Tem certeza que quer excluir{" "}
            <span className="font-medium text-foreground">{deleteTarget?.nome}</span>?
            Essa ação não pode ser desfeita.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}