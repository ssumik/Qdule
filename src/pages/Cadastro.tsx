import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form"; // 1. Importa o hook

export default function Cadastro() {
  const navigate = useNavigate();
  const location = useLocation();

  // 2. Recupera o que veio da Agenda (serviço, dia, mês, horário)
  const dadosAgendamento = location.state?.agendamento || {};

  // 3. Configura o React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nome: "",
      email: "",
      celular: "",
    },
  });

  // 4. AQUI VAI O TRECHO: Função que é executada após validar com sucesso
  const onSubmit = (dadosDoFormulario: any) => {
    navigate("/confirmacao", {
      state: {
        agendamento: {
          ...dadosAgendamento, // Mantém o que veio da Agenda
          ...dadosDoFormulario, // Adiciona nome, email e celular do formulário
        },
      },
    });
  };

  // Função para formatar o celular (opcional se quiseres manter a máscara viva)
  const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const formatado = valor
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 15);
    setValue("celular", formatado); // Atualiza o valor no hook form
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md flex flex-col gap-6">
        <header className="flex items-start gap-3 w-full">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="p-0 h-auto cursor-pointer"
          >
            <ArrowLeft className="size-6" />
          </Button>

          <h2 className="text-xl font-semibold leading-tight text-left">
            Para confirmar seu horário, precisamos de algumas informações
          </h2>
        </header>

        {/* 5. O formulário agora usa o handleSubmit do hook form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid w-full gap-4 bg-white/40 p-6 rounded-2xl shadow-sm backdrop-blur-sm border border-white/20"
        >
          <div className="grid gap-2">
            <Label className="font-bold text-sm">Nome Completo</Label>
            <Input
              className="bg-white"
              {...register("nome", {
                required: "Nome é obrigatório",
                minLength: { value: 3, message: "Nome muito curto" },
              })}
              placeholder="Ex: Maria Silva"
            />
            {errors.nome && (
              <span className="text-red-500 text-xs">
                {errors.nome.message}
              </span>
            )}
          </div>

          <div className="grid gap-2">
            <Label className="font-bold text-sm">E-mail</Label>
            <Input
              className="bg-white"
              type="email"
              {...register("email", {
                required: "E-mail obrigatório",
                pattern: { value: /\S+@\S+\.\S+/, message: "E-mail inválido" },
              })}
              placeholder="exemplo@email.com"
            />
            {errors.email && (
              <span className="text-red-500 text-xs">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="grid gap-2">
            <Label className="font-bold text-sm">Celular</Label>
            <Input
              className="bg-white"
              type="tel"
              {...register("celular", { required: "Celular é obrigatório" })}
              onChange={handleCelularChange} // Mantém a tua máscara
              placeholder="(47) 99999-9999"
            />
            {errors.celular && (
              <span className="text-red-500 text-xs">
                {errors.celular.message}
              </span>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-rose-400 hover:bg-rose-500 text-white rounded-xl h-12 mt-4 cursor-pointer"
          >
            Confirmar
          </Button>
        </form>
      </div>
    </div>
  );
}
