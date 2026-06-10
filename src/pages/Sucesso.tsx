import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function Sucesso() {
  const navigate = useNavigate();

  function finalizarAgendamento() {
    navigate("/"); // retorna pro início após concluir tudo
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <h2 className="text-xl font-semibold leading-tight text-left">
            Serviço agendado com sucesso!
          </h2>
        </header>

        <div className="grid w-full gap-4 bg-white/60 p-6 rounded-2xl shadow-lg border border-pink-100">
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-bold text-gray-800 text-muted-foreground text-left p-5">
                Você receberá uma confirmação de agendamento pelo e-mail que
                você cadastrou.
              </h2>
            </div>
            <p>
              {" "}
              Caso seja necessário cancelar, entre em contato diretamente com a
              Hanna.
            </p>
            <div>
              <Button
                className="w-full rounded-xl h-12 cursor-pointer text-white bg-button hover:bg-buttonhover duration-200"
                onClick={finalizarAgendamento}
              >
                Voltar ao início
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
