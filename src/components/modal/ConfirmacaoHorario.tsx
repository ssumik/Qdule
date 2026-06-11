import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Props {
  agendamento: any;
  onConfirmar: () => void;
  onCancelar: () => void;
  onVoltar: () => void;
}

export function ConfirmacaoHorario({
  agendamento,
  onConfirmar,
  onCancelar,
  onVoltar,
}: Props) {
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const { servico, dia, mes, horario, nome } = agendamento;

  return (
    <div className="flex flex-col gap-5 w-full">
      <h2 className="text-lg sm:text-xl font-semibold text-left sm:text-left px-2">
        Confirme os detalhes do seu horário
      </h2>

      <div>
        <h2 className="text-lg font-bold wrap-break-words">
          <span className="text-muted-foreground">Olá, </span>
          {nome}
        </h2>
      </div>

      <div className="bg-primary rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 text-white">
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm text-black">Você selecionou o serviço:</p>

          <h2 className="font-bold text-accent wrap-break-words">
            {servico?.nome}
          </h2>

          <p className="text-sm text-accent">
            R$ {Number(servico?.preco).toFixed(2).replace(".", ",")} •{" "}
            {servico?.duracao} min
          </p>
        </div>

        <div className="bg-accent rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center gap-2 text-white w-full sm:w-auto justify-center">
          <span className="font-bold">
            {dia}/{mes}
          </span>

          <span className="hidden sm:block font-semibold">|</span>

          <span className="font-bold">{horario}h</span>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="termos"
          checked={aceitouTermos}
          onCheckedChange={(checked) => setAceitouTermos(checked === true)}
          className="border-accent mt-1"
        />

        <Label
          htmlFor="termos"
          className="text-sm leading-relaxed cursor-pointer"
        >
          Entendo que ao confirmar meu horário, taxas poderão ser aplicadas em
          caso de cancelamento.
        </Label>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <Button
          variant="outline"
          onClick={onVoltar}
          className="w-full sm:w-auto"
        >
          Voltar
        </Button>

        <Button
          variant="outline"
          onClick={onCancelar}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>

        <Button
          className="w-full sm:flex-1 bg-button hover:bg-buttonhover text-white "
          onClick={onConfirmar}
          disabled={!aceitouTermos}
        >
          Confirmar
        </Button>
      </div>
    </div>
  );
}
