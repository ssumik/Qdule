import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const items = [
  {
    id: 1,
    nome: "Limpeza de pele",
    descricao: "Descrição do serviço de limpeza de pele...",
    duracao: 60,
    preco: 150,
    imagem: "https://placehold.co/600x400",
  },
  {
    id: 2,
    nome: "Massagem relaxante",
    descricao: "Descrição da massagem...",
    duracao: 90,
    preco: 200,
    imagem: "https://placehold.co/600x400",
  },
  {
    id: 3,
    nome: "Sobrancelha",
    descricao: "Descrição do serviço...",
    duracao: 30,
    preco: 50,
    imagem: "https://placehold.co/600x400",
  },
  {
    id: 4,
    nome: "Sobrancelha",
    descricao:
      "Descrição do serviço... lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel sapien eget nunc efficitur varius. Sed at felis ac nisl efficitur tincidunt.",
    duracao: 30,
    preco: 50,
    imagem: "https://placehold.co/600x400",
  },
];

export function CardServicos() {
  const navigate = useNavigate();

  return (
    <div className="w-full py-10 px-20">
      <div className="mb-10">
        <h1 className="text-4xl font-semibold">Meus serviços</h1>

        <p className="text-muted-foreground mt-2">
          Escolha um serviço e agende seu horário
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {items.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden bg-white/60 backdrop-blur-lg shadow-xl border-0 h-400px flex flex-col"
          >
            <div className="w-full h-52 overflow-hidden shrink-0">
              <img
                src={item.imagem}
                alt={item.nome}
                className="w-full h-full object-cover"
              />
            </div>

            <CardContent className="p-5 flex flex-col flex-1 gap-4">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold">{item.nome}</h2>

                <span className="text-pink-500 font-bold text-lg whitespace-nowrap">
                  R$ {item.preco}
                </span>
              </div>

              <div className="h-24 overflow-y-auto pr-2">
                <p className="text-muted-foreground text-sm">
                  {item.descricao}
                </p>
              </div>

              <p className="text-sm font-medium">
                Duração média: {item.duracao} min
              </p>

              <Button
                className="cursor-pointer mt-auto bg-rose-400 hover:bg-rose-500 text-white"
                onClick={() =>
                  navigate("/agenda", {
                    state: { servico: item },
                  })
                }
              >
                Ver horários disponíveis
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
