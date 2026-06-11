import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa"; // Certifique-se de ter o react-icons instalado

export default function Header() {
  return (
    <div className="w-full pb-10">
      <div className="flex justify-end relative w-full h-full bg-ring px-20">
        <img
          src="/hanna2.png"
          alt="Hanna Kupas"
          className="absolute inset-0 h-full object-cover"
        />

        <div className="relative z-10 h-full flex flex-col items-center px-4 pt-40">
          <h1 className="text-4xl font-bold! text-white!">Hanna Kupas</h1>

          <h2 className="text-3xl font-semibold text-brown!">
            Estética Facial & Corporal
          </h2>
          {/* Texto de Boas-vindas */}
          <div className="w-full max-w-4xl p-4 mt-2">
            <p className="text-center text-lg text-white! pb-10">
              Bem-vinda! Descubra nossos serviços de estética facial e corporal,
              massoterapia e pós-operatório projetados para realçar sua beleza
              natural e proporcionar momentos de puro cuidado e relaxamento.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
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
        </div>
      </div>
    </div>
  );
}
