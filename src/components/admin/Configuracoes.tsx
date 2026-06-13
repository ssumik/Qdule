import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function ConfigSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background">
      <div className="px-4 py-3 bg-muted/40 border-b border-border">
        <p className="text-sm font-medium text-foreground">{title}</p>
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
    <div className="flex items-center justify-between px-4 py-3 gap-4">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function Configuracoes() {
  const [nome, setNome] = useState("Studio Exemplo");
  const [email, setEmail] = useState("contato@studio.com");
  const [fuso, setFuso] = useState("America/Sao_Paulo");

  const [emailConfirmacao, setEmailConfirmacao] = useState(true);
  const [lembrete, setLembrete] = useState(true);
  const [alertaCancelamento, setAlertaCancelamento] = useState(false);

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Preferências do estabelecimento
        </p>
      </div>

      <ConfigSection title="Estabelecimento">
        <ConfigRow
          label="Nome do salão"
          description="Aparece para os clientes na hora do agendamento"
        >
          <Input
            className="w-48"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </ConfigRow>
        <ConfigRow
          label="E-mail de contato"
          description="Usado para receber notificações"
        >
          <Input
            type="email"
            className="w-48"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </ConfigRow>
        <ConfigRow label="Fuso horário">
          <Select value={fuso} onValueChange={setFuso}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Sao_Paulo">
                America/Sao_Paulo
              </SelectItem>
              <SelectItem value="America/Manaus">America/Manaus</SelectItem>
              <SelectItem value="America/Belem">America/Belem</SelectItem>
              <SelectItem value="America/Fortaleza">
                America/Fortaleza
              </SelectItem>
            </SelectContent>
          </Select>
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

      <ConfigSection title="Horário de funcionamento">
        <ConfigRow label="Segunda a sexta">
          <span className="text-sm text-muted-foreground">08:00 – 18:00</span>
        </ConfigRow>
        <ConfigRow label="Sábado">
          <span className="text-sm text-muted-foreground">09:00 – 14:00</span>
        </ConfigRow>
        <ConfigRow label="Domingo">
          <span className="text-sm text-muted-foreground">Fechado</span>
        </ConfigRow>
      </ConfigSection>

      <div className="flex justify-end">
        <Button>Salvar alterações</Button>
      </div>
    </div>
  );
}
