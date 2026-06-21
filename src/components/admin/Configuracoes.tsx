import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

function ConfigSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
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
  children: React.ReactNode;
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

export function Configuracoes() {
  const [email, setEmail] = useState("contato@studio.com");
  const [password, setPassword] = useState("");
  const [emailConfirmacao, setEmailConfirmacao] = useState(true);
  const [lembrete, setLembrete] = useState(true);
  const [alertaCancelamento, setAlertaCancelamento] = useState(false);

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Configurações</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Preferências do estabelecimento
        </p>
      </div>

      <ConfigSection title="Estabelecimento">
        <ConfigRow
           label="E-mail de contato"
          description="Usado para receber notificações"
        >
          <Input
            type="email"
            className="w-48 bg-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </ConfigRow>
        <ConfigRow
          label="Senha de acesso"
          description="Alterar senha de admin"
        >
          <Input
            type="password"
            className="w-48 bg-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </ConfigRow>
      </ConfigSection>

      <ConfigSection title="Notificações por e-mail">
        <ConfigRow
          label="Confirmação de agendamento"
          description="Envia e-mail ao cliente logo após o agendamento"
        >
          <Switch
            checked={emailConfirmacao}
            onCheckedChange={setEmailConfirmacao}
          />
        </ConfigRow>
        <ConfigRow
          label="Lembrete 24h antes"
          description="Envia lembrete automático um dia antes do horário"
        >
          <Switch checked={lembrete} onCheckedChange={setLembrete} />
        </ConfigRow>
        <ConfigRow
          label="Alerta de cancelamento"
          description="Notifica você por e-mail quando um cliente cancela"
        >
          <Switch
            checked={alertaCancelamento}
            onCheckedChange={setAlertaCancelamento}
          />
        </ConfigRow>
      </ConfigSection>

      <div className="flex justify-end">
        <Button>Salvar alterações</Button>
      </div>
    </div>
  );
}
