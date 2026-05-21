import { CardServicos } from "@/components/servicos/cards_servicos";
import Header from "@/components/servicos/header";

export default function Servico() {
  return (
    <div className="flex flex-col items-center justify-center pb-10">
      <Header />
      <h1 className="text-4xl font-semibold pt-20">Hanna Kupas</h1>
      <h2 className="text-3xl font-semibold pb-10">
        Estética Facial & Corporal
      </h2>
      <CardServicos />
    </div>
  );
}
