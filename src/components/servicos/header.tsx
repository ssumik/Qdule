import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa"; // Certifique-se de ter o react-icons instalado

export default function Header() {
  return (
    <div className="w-full flex flex-col items-center pb-10">
      {/* Banner Superior com Avatar Absoluto */}
      <header className="w-full bg-white/40 h-40 flex items-center justify-center py-4 relative shadow-md">
        <Avatar className="h-40 w-40 border-2 border-white absolute -bottom-20 shadow-lg">
          <AvatarImage src="/avatar.jpg" alt="Hanna Kupas" />
          <AvatarFallback>HK</AvatarFallback>
        </Avatar>
      </header>

      {/* Informações da Profissional */}
      <h1 className="text-4xl font-semibold pt-24">Hanna Kupas</h1>
      <h2 className="text-3xl font-semibold text-rose-400 text-shadow-2xs mt-1">
        Estética Facial & Corporal
      </h2>
      
      {/* Texto de Boas-vindas */}
      <div className="w-full max-w-4xl p-4 mt-2">
        <p className="text-center text-lg text-gray-700">
          Bem-vinda! Descubra nossos serviços de estética facial e corporal, projetados para realçar
          sua beleza natural e proporcionar momentos de puro cuidado e relaxamento.
        </p>
      </div>

      {/* Botões de Redes Sociais e Links */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <div className="p-2">
          <Button variant="outline" className="rounded-lg hover:bg-rose-200 h-11 w-11 p-0 cursor-pointer" asChild>
            <Link to="https://maps.app.goo.gl/fjKviFkdmuN34cPf7" target="_blank" className="flex items-center justify-center">
              <MapPin className="text-rose-500 size-5" />
            </Link>
          </Button>
        </div>

        <div className="p-2">
          <Button variant="outline" className="rounded-lg hover:bg-green-100 h-11 w-11 p-0 cursor-pointer" asChild>
            <Link to="https://api.whatsapp.com/send/?phone=5547997074991&text&type=phone_number&app_absent=0&utm_source=ig" target="_blank" className="flex items-center justify-center">
              <FaWhatsapp className="text-green-500 size-5" />
            </Link>
          </Button>
        </div>

        <div className="p-2">
          <Button variant="outline" className="rounded-lg hover:bg-pink-200 h-11 w-11 p-0 cursor-pointer" asChild>
            <Link to="https://www.instagram.com/hannakupasestetica/" target="_blank" className="flex items-center justify-center">
              <FaInstagram className="text-pink-500 size-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}