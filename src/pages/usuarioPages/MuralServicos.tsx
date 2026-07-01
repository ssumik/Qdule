import { CardServicos } from "@/components/servicosComponents/CarrosselServicos";
import Header from "@/components/servicosComponents/HeaderServicos";
import Mapa from "@/components/servicosComponents/MapsServicos";
import Footer from "@/components/servicosComponents/FooterServicos";

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
