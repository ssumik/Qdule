import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AgendaInline } from "@/pages/Agendamento";

// ─── tipos ────────────────────────────────────────────────────────────────────
export interface Servico {
  id: number;
  nome: string;
  descricao: string;
  duracao: number;
  preco: number;
  imagem: string;
}

// ─── dados mock ───────────────────────────────────────────────────────────────
const items: Servico[] = [
  {
    id: 1,
    nome: "Limpeza de pele",
    descricao: "Limpeza profunda com extração e hidratação intensiva.",
    duracao: 60,
    preco: 150,
    imagem: "https://placehold.co/600x400/FFC0CB/FFFFFF?text=Limpeza+de+pele",
  },
  {
    id: 2,
    nome: "Massagem relaxante",
    descricao: "Massagem com óleos essenciais para aliviar tensões.",
    duracao: 90,
    preco: 200,
    imagem: "https://placehold.co/600x400/FFC0CB/FFFFFF?text=Massagem",
  },
  {
    id: 3,
    nome: "Sobrancelha",
    descricao: "Design e remoção dos fios com pinça e linha.",
    duracao: 30,
    preco: 50,
    imagem: "https://placehold.co/600x400/FFC0CB/FFFFFF?text=Sobrancelha",
  },
  {
    id: 4,
    nome: "Sobrancelha Luxo",
    descricao:
      "Design premium com henna e acabamento perfeito.",
    duracao: 45,
    preco: 75,
    imagem: "https://placehold.co/600x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
  },
];

// ─── componente ───────────────────────────────────────────────────────────────
export function CardServicos() {
  const [servicoAtivo, setServicoAtivo] = useState<Servico | null>(null);
  const agendaRef = useRef<HTMLDivElement>(null);

  // Scroll suave para a seção de agenda ao abrir
  useEffect(() => {
    if (servicoAtivo && agendaRef.current) {
      setTimeout(() => {
        agendaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80); // aguarda o CSS transition iniciar
    }
  }, [servicoAtivo]);

  function handleVerHorarios(servico: Servico) {
    // Mesmo serviço clicado → fecha (toggle). Serviço diferente → troca.
    setServicoAtivo((prev) => (prev?.id === servico.id ? null : servico));
  }

  return (
    <div className="w-full py-10 px-4 lg:px-20 bg-white/30 backdrop-blur-lg rounded-2xl shadow-xl mt-10">
      {/* Cabeçalho */}
      <div className="mb-10">
        <h1 className="text-4xl font-semibold">Meus serviços</h1>
        <p className="text-muted-foreground mt-2">
          Escolha um serviço e agende seu horário
        </p>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((item) => {
          const ativo = servicoAtivo?.id === item.id;

          return (
            <Card
              key={item.id}
              className={`overflow-hidden bg-white/60 backdrop-blur-lg shadow-xl border h-full flex flex-col p-0 rounded-t-xl transition-all duration-300 ${
                ativo
                  ? "border-rose-400 ring-2 ring-rose-300"
                  : "border-0"
              }`}
            >
              {/* Imagem */}
              <div className="w-full h-52 overflow-hidden shrink-0">
                <img
                  src={item.imagem}
                  alt={item.nome}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Conteúdo */}
              <CardContent className="p-5 flex flex-col flex-1 gap-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold">{item.nome}</h2>
                  <span className="text-rose-500 font-bold text-lg whitespace-nowrap">
                    R$ {item.preco}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {item.descricao}
                  </p>
                </div>

                <p className="text-sm font-medium">
                  Duração média: {item.duracao} min
                </p>

                <Button
                  className={`cursor-pointer mt-auto w-full border-0 rounded-lg text-white transition-colors ${
                    ativo
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-rose-400 hover:bg-rose-500"
                  }`}
                  onClick={() => handleVerHorarios(item)}
                >
                  {ativo ? "Fechar horários ↑" : "Ver horários disponíveis"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/*
       * Seção de Agenda — aparece abaixo dos cards com animação suave.
       * max-height é a técnica mais compatível para animar height: auto com CSS puro.
       */}
      <div
        ref={agendaRef}
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          servicoAtivo
            ? "max-h-2000px opacity-100 mt-10"
            : "max-h-0 opacity-0 mt-0"
        }`}
        style={{ scrollMarginTop: "1.5rem" }}
      >
        {/* Só renderiza o conteúdo quando há serviço ativo,
            evitando que inputs fora da tela sejam focados */}
        {servicoAtivo && (
          <AgendaInline
            servico={servicoAtivo}
            onFechar={() => setServicoAtivo(null)}
          />
        )}
      </div>
    </div>
  );
}
