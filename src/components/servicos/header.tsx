import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa"; // Certifique-se de ter o react-icons instalado

export default function Header() {
  return (
    <div className="w-full pb-10">
      <div className="flex flex-col md:flex-row w-full bg-ring md:items-stretch">
        {/* Imagem */}
        <div className="w-full md:w-1/2 h-48 md:h-auto md:max-h-500px">
          <img
            src="/hanna3.jpg"
            alt="Hanna Kupas"
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Conteúdo */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-4 py-10 md:py-10">
          <h1 className="text-3xl md:text-4xl font-bold! text-white! text-center">
            Hanna Kupas
          </h1>

          <h2 className="text-2xl md:text-3xl font-semibold text-brown! text-center">
            Estética Facial & Corporal
          </h2>

          {/* Texto de Boas-vindas */}
          <div className="w-full max-w-4xl p-4 mt-2">
            <p className="text-center text-base md:text-lg text-white! pb-6 md:pb-6">
              Bem-vinda! Descubra nossos serviços de estética facial e corporal,
              massoterapia e pós-operatório projetados para realçar sua beleza
              natural e proporcionar momentos de puro cuidado e relaxamento.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="p-2">
              <Button
                variant="outline"
                className="rounded-lg hover:bg-rose-200 h-11 w-11 p-0 cursor-pointer"
                asChild
              >
                <Link
                  to="https://maps.app.goo.gl/fjKviFkdmuN34cPf7"
                  target="_blank"
                  className="flex items-center justify-center"
                >
                  <MapPin className="text-rose-500 size-5" />
                </Link>
              </Button>
            </div>

            <div className="p-2">
              <Button
                variant="outline"
                className="rounded-lg hover:bg-primary h-11 w-11 p-0 cursor-pointer"
                asChild
              >
                <Link
                  to="https://wa.me/5547997074991"
                  target="_blank"
                  className="flex items-center justify-center"
                >
                  <FaWhatsapp className="text-green-500 size-5" />
                </Link>
              </Button>
            </div>

            <div className="p-2">
              <Button
                variant="outline"
                className="rounded-lg hover:bg-primary h-11 w-11 p-0 cursor-pointer"
                asChild
              >
                <Link
                  to="https://www.instagram.com/hannakupasestetica/"
                  target="_blank"
                  className="flex items-center justify-center"
                >
                  <FaInstagram className="text-pink-500 size-5" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="w-full max-w-4xl p-4 text-white! flex flex-col items-center justify-center mt-4">
            <p> Horário de funcionamento: seg a sex das xx:xx ás xx:xx</p>
          </div>
        </div>
      </div>
    </div>
  );
}
