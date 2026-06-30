import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GetConfig, UpdateConfig } from "@/requests/ConfigRequest";

function ConfigSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background">
      <div className="px-4 py-3 bg-primary/40 border-b border-border">
        <p className="text-sm font-medium text-black">{title}</p>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function ConfigRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-10 py-3 gap-4">
      <div>
        <p className="text-foreground text-xs flex items-center gap-2">
          {label}
        </p>
        {description && (
          <p className="text-sm text-gray-500! italic">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

interface ConfigForm {
  email: string;
  contactLink: string;
}

const EMPTY_CONFIG_FORM: ConfigForm = {
  email: "",
  contactLink: "",
};

function configToForm(config?: {
  sendEmail?: string;
  contactLink?: string;
}): ConfigForm {
  return {
    email: config?.sendEmail ?? "",
    contactLink: config?.contactLink ?? "",
  };
}

export function Configuracoes() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ConfigForm>(EMPTY_CONFIG_FORM);
  const [savedForm, setSavedForm] = useState<ConfigForm>(EMPTY_CONFIG_FORM);

  const {
    data: config,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["config"],
    queryFn: GetConfig,
    refetchOnWindowFocus: false,
  });

  const hasChanges = JSON.stringify(form) !== JSON.stringify(savedForm);

  useEffect(() => {
    if (!config || hasChanges) return;

    const nextForm = configToForm(config);

    let mounted = true;
    queueMicrotask(() => {
      if (mounted) {
        setForm(nextForm);
        setSavedForm(nextForm);
      }
    });

    return () => {
      mounted = false;
    };
  }, [config, hasChanges]);

  const updateConfigMutation = useMutation({
    mutationFn: (payload: ConfigForm) =>
      UpdateConfig({
        sendEmail: payload.email,
        contactLink: payload.contactLink,
      }),
    onSuccess: async (updatedConfig) => {
      const nextForm = configToForm(updatedConfig);
      setForm(nextForm);
      setSavedForm(nextForm);
      toast.success("Configurações salvas com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["config"] });
    },
    onError: () => {
      toast.error("Não foi possível salvar as configurações. Tente novamente.");
    },
  });

  const isSaving = updateConfigMutation.isPending;
  const fieldsDisabled = isLoading || isSaving;

  function updateField(field: keyof ConfigForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCancelChanges() {
    setForm(savedForm);
  }

  function handleSave() {
    updateConfigMutation.mutate(form);
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Configurações</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Preferências do estabelecimento
        </p>
      </div>

      <ConfigSection title="Estabelecimento">
        {isLoading && (
          <div className="px-10 py-3 text-sm text-muted-foreground">
            Carregando configurações...
          </div>
        )}

        {isError && (
          <div className="px-10 py-3 text-sm text-destructive">
            Não foi possível carregar as configurações.
          </div>
        )}

        <ConfigRow
          label="Email"
          description="Usado para enviar notificações de agendamento para clientes."
        >
          <Input
            type="email"
            className="w-48 bg-white"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            disabled={fieldsDisabled}
          />
        </ConfigRow>
        <ConfigRow
          label="Link para contato"
          description="Alterar link para contato"
        >
          <Input
            type="url"
            className="w-48 bg-white"
            value={form.contactLink}
            onChange={(e) => updateField("contactLink", e.target.value)}
            disabled={fieldsDisabled}
          />
        </ConfigRow>
      </ConfigSection>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleCancelChanges}
          disabled={!hasChanges || fieldsDisabled}
        >
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges || fieldsDisabled}>
          {isSaving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}
