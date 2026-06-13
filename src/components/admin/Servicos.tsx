import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { mockServicos, type Servico } from "@/components/admin/mockData";

export function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>(mockServicos);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Servico | null>(null);
  const [form, setForm] = useState({ nome: "", duracao: "", preco: "" });

  function openNew() {
    setEditing(null);
    setForm({ nome: "", duracao: "", preco: "" });
    setDialogOpen(true);
  }

  function openEdit(s: Servico) {
    setEditing(s);
    setForm({
      nome: s.nome,
      duracao: String(s.duracao),
      preco: String(s.preco),
    });
    setDialogOpen(true);
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
        },
      ]);
    }

    setDialogOpen(false);
  }

  function handleDelete(id: number) {
    setServicos((prev) => prev.filter((s) => s.id !== id));
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
        <div className="grid grid-cols-[2fr_1fr_1fr_80px] px-4 py-2.5 bg-muted/40 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground">
            Nome
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Duração
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Preço
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Ações
          </span>
        </div>

        {servicos.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Nenhum serviço cadastrado.
          </p>
        )}

        {servicos.map((s, i) => (
          <div
            key={s.id}
            className={`grid grid-cols-[2fr_1fr_1fr_80px] px-4 py-3 items-center hover:bg-muted/30 transition-colors ${
              i < servicos.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span className="text-sm text-foreground">{s.nome}</span>
            <span className="text-sm text-muted-foreground">
              {s.duracao} min
            </span>
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
                onClick={() => handleDelete(s.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar serviço" : "Novo serviço"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Corte feminino"
                value={form.nome}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nome: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Duração (min)</Label>
                <Input
                  type="number"
                  placeholder="60"
                  value={form.duracao}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duracao: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Preço (R$)</Label>
                <Input
                  type="number"
                  placeholder="80"
                  value={form.preco}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, preco: e.target.value }))
                  }
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
    </div>
  );
}
