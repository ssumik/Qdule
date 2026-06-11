import { CardServicos } from "@/components/servicos/cards_servicos";
import Header from "@/components/servicos/header";
import Mapa from "@/components/servicos/maps";
import Footer from "@/components/servicos/footer";

export default function Servico() {
  return (
    <div>
      <Header />
      <CardServicos />
      <Mapa />
      <Footer />
    </div>
  );
}
