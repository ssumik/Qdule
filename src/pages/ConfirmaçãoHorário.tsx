import { ArrowLeft, CalendarDays} from "lucide-react";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";

export default function ConfirmaçãoHorário() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Recupera o objeto completo 'agendamento'
  const { agendamento } = location.state || {};

  // 2. Redirecionamento de segurança se não houver dados
  if (!agendamento) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p>Dados do agendamento não encontrados.</p>
        <Button onClick={() => navigate("/")}>Voltar ao início</Button>
      </div>
    );
  }

  const { servico, dia, mes, horario, nome } = agendamento;

  function finalizarAgendamento() {
    alert(`Agendamento realizado com sucesso para ${nome}!`);
    navigate("/sucesso"); // retorna sucesso
  }

  function cancelarAgendamento() {
    alert(`Agendamento cancelado com sucesso para ${nome}!`);
    navigate("/"); // Volta para o início após concluir
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft />
          </Button>
          <h2 className="text-xl font-semibold leading-tight text-left">
            Confirme os detalhes do seu horário
          </h2>
        </header>

        <div className="grid w-full gap-4 bg-white/60 p-6 rounded-2xl shadow-lg border border-pink-100">
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                <span className="text-muted-foreground">Olá, </span>
                {nome || "Não informado"}!
              </h2>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Você selecionou o serviço:
              </p>
              <h2 className="font-bold text-rose-500">{servico?.nome}</h2>
              <p className="text-sm font-medium text-gray-600">
                R$ {Number(servico?.preco).toFixed(2).replace(".", ",")} •{" "}
                {servico?.duracao} min
              </p>
            </div>

             <div className="rounded-xl px-6 flex flex-row items-center justify-center gap-2 bg-rose-200 py-4">
                <CalendarDays className="text-rose-400" />
                <div className="flex items-center">
                  <h2 className="font-semibold text-sm">{dia}/{mes}</h2>
                </div>
            
                <span className="font-semibold">|</span>

                <div className="flex items-center">
                  <h2 className="font-bold text-sm">{horario}h</h2>
                </div>
            </div>

            <div className="pt-2">
              <p className="text-sm text-center font-bold text-rose-500 mb-4">
                Deseja confirmar o agendamento acima?
              </p>
              <div className="flex items-start space-x-3 bg-muted/30 p-4 rounded-lg border border-border">
                <Checkbox
                  id="termos"
                  className="mt-1 border-rose-400 data-[state=checked]:bg-rose-400 data-[state=checked]:border-rose-400 cursor-pointer"
                />
                <Label
                  htmlFor="termos"
                  className="text-sm leading-relaxed font-medium text-muted-foreground cursor-pointer text-left"
                >
                  Entendo que ao confirmar meu horário, taxas poderão ser
                  aplicadas em caso de cancelamento.
                </Label>
              </div>

              <Button
                variant="link"
                className="underline-offset-4 cursor-pointer text-sm text-gray-500 mt-4"
                onClick={cancelarAgendamento}
              >
                Quero cancelar
              </Button>

              <Button
                className="w-full bg-rose-400 hover:bg-rose-500 text-white rounded-xl h-12 cursor-pointer"
                onClick={finalizarAgendamento}
              >
                Confirmar Agendamento
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
