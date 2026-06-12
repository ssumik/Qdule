import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AgendaInline } from "@/pages/AgendaInline";

// ─── tipos ────────────────────────────────────────────────────────────────────
export type Categoria = "Facial" | "Corporal" | "Massoterapia";

export interface Servico {
  id: number;
  nome: string;
  descricao: string;
  duracao: number;
  preco: number;
  imagem: string;
  categoria: Categoria;
}

// ─── filtros ──────────────────────────────────────────────────────────────────
const filtros: { label: string; value: Categoria | "Todos" }[] = [
  { label: "Ver tudo", value: "Todos" },
  { label: "Facial", value: "Facial" },
  { label: "Corporal", value: "Corporal" },
  { label: "Massoterapia", value: "Massoterapia" },
];

// ─── dados mock ───────────────────────────────────────────────────────────────
const items: Servico[] = [
  {
    id: 1,
    nome: "Lash Lifting - Cílios",
    descricao:
      "Procedimento que curva, alonga e realça os cílios naturais sem necessidade de extensão.",
    duracao: 60,
    preco: 120,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Limpeza+de+pele",
    categoria: "Facial",
  },
  {
    id: 2,
    nome: "Microagulhamento Facial",
    descricao:
      "Procedimento que estimula a produção de colágeno e elastina, melhorando a textura e aparência da pele.",
    duracao: 90,
    preco: 250,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Massagem",
    categoria: "Facial",
  },
  {
    id: 3,
    nome: "Design de sobrancelha",
    descricao:
      "Procedimento que valoriza o olhar por meio do design personalizado de sobrancelhas",
    duracao: 30,
    preco: 50,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha",
    categoria: "Facial",
  },
  {
    id: 4,
    nome: "Ledterapia",
    descricao:
      "Luz terapêutica que estimula a regeneração celular, melhora a circulação e reduz inflamações, promovendo uma pele mais saudável e rejuvenescida.",
    duracao: 45,
    preco: 60,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Facial",
  },
  {
    id: 5,
    nome: "Limpeza de pele",
    descricao:
      "Procedimento que remove impurezas e células mortas da pele, promovendo uma pele mais saudável e radiante.",
    duracao: 45,
    preco: 150,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Facial",
  },
  {
    id: 6,
    nome: "Drenagem Linfática",
    descricao:
      "Procedimento que estimula a circulação linfática, reduzindo inchaços e promovendo uma pele mais saudável e rejuvenescida.",
    duracao: 45,
    preco: 100,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Corporal",
  },
  {
    id: 7,
    nome: "Drenagem Linfática Gestacional",
    descricao:
      "Técnica suave e adaptada para gestantes, indicada a partir do segundo trimestre com liberação médica, que estimula a circulação linfática, aliviando inchaços e promovendo bem-estar durante a gravidez.",
    duracao: 45,
    preco: 100,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Corporal",
  },
  {
    id: 8,
    nome: "Estrias - Derma Pen + Endermoterapia",
    descricao:
      "Tratamento combinado que aborda a aparência das estrias, promovendo uma pele mais uniforme e renovada.",
    duracao: 45,
    preco: 100,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Corporal",
  },
  {
    id: 9,
    nome: "Hidratação facial",
    descricao:
      "Repõe a água e nutrientes essenciais para a pele, promovendo uma aparência mais saudável, suave e radiante.",
    duracao: 45,
    preco: 65,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Facial",
  },
  {
    id: 10,
    nome: "Ultrassom terapêutico 1 - 3MHz",
    descricao:
      "Equipamento de ultrassom terapêutico com frequências de 1MHz e 3MHz, utilizado para tratamentos estéticos e terapêuticos, promovendo benefícios como melhora da circulação, redução de inchaços e estímulo à regeneração celular.",
    duracao: 45,
    preco: 65,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Corporal",
  },
  {
    id: 11,
    nome: "Biompedância",
    descricao:
      "Analisa a composição corporal por meio de corrente elétrica de baixa intensidade. Exame não-invasivo.",
    duracao: 40,
    preco: 80,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Corporal",
  },
  {
    id: 12,
    nome: "Escalda pés",
    descricao:
      "Terapia que combina água morna, ervas e sais terapêuticos para promover relaxamento, alívio do estresse e melhora da circulação nos pés.",
    duracao: 45,
    preco: 55,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Massoterapia",
  },
  {
    id: 13,
    nome: "Lipo Enzimática - Intradermoterapia Pressurizada",
    descricao:
      "Dispositivo de alta pressão que promove a permeação de ativos na pele sem o uso de agulhas. Indicado para procedimentos como skin booster, revitalização...",
    duracao: 45,
    preco: 250,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Corporal",
  },
  {
    id: 14,
    nome: "Massagem modeladora",
    descricao:
      "Técnica com manobras intensas e firmes que visam modelar o corpo, reduzir medidas e melhorar a circulação, promovendo uma silhueta mais definida e tonificada.",
    duracao: 45,
    preco: 100,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Massoterapia",
  },
  {
    id: 15,
    nome: "Detox Corporal",
    descricao:
      "Tratamento desintoxicante que associa o poder purificante da argila verde ao calor da manta térmica, auxiliando na eliminação de toxinas, redução de medidas e melhora da aparência da pele.",
    duracao: 45,
    preco: 65,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Corporal",
  },
  {
    id: 16,
    nome: "Liberação Miofascial",
    descricao:
      "Técnica manual que visa liberar tensões e restrições no tecido muscular e fascial, promovendo alívio da dor, melhora da mobilidade e bem-estar geral.",
    duracao: 45,
    preco: 130,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Massoterapia",
  },
  {
    id: 17,
    nome: "Massagem Relaxante Muscular",
    descricao:
      "Técnica terapêutica que utiliza manobras suaves e rítmicas para promover relaxamento, alívio do estresse e redução da tensão muscular, proporcionando uma sensação de bem-estar e tranquilidade.",
    duracao: 45,
    preco: 100,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Massoterapia",
  },
  {
    id: 18,
    nome: "Ventosaterapia com Relaxante",
    descricao:
      "Técnica terapêutica que utiliza ventosas para criar sucção na pele, promovendo relaxamento muscular, melhora da circulação e alívio de tensões, potencializada com o uso de óleos relaxantes.",
    duracao: 45,
    preco: 150,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Massoterapia",
  },
  {
    id: 19,
    nome: "Hidra Pluss Labial",
    descricao:
      "Tratamento labial que combina hidratação profunda, nutrição e revitalização, promovendo lábios mais suaves, volumosos e com aparência rejuvenescida.",
    duracao: 45,
    preco: 110,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Facial",
  },
  {
    id: 20,
    nome: "Pós-operatório",
    descricao:
      "Técnica de drenagem linfática manual especializada para acelerar o metabolismo para a recuperação pós-cirúrgica, reduzindo inchaços, hematomas e promovendo uma cicatrização mais eficiente.",
    duracao: 45,
    preco: 0,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Corporal",
  },
  {
    id: 21,
    nome: "Dermaplaning",
    descricao:
      "Esfoliação mecânica segura que remove células mortas e pelos finos do rosto, deixando a pele extremamente lisa e radiante, além de potencializar a absorção de produtos e proporcionar um acabamento impecável para a maquiagem.",
    duracao: 45,
    preco: 120,
    imagem: "https://placehold.co/500x400/FFC0CB/FFFFFF?text=Sobrancelha+Luxo",
    categoria: "Facial",
  },
];

// ─── componente ───────────────────────────────────────────────────────────────
export function CardServicos() {
  const [servicoAtivo, setServicoAtivo] = useState<Servico | null>(null);
  const [filtroAtivo, setFiltroAtivo] = useState<Categoria | "Todos">("Todos");
  const agendaRef = useRef<HTMLDivElement>(null);

  // Scroll suave para a seção de agenda ao abrir
  useEffect(() => {
    if (servicoAtivo && agendaRef.current) {
      setTimeout(() => {
        agendaRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80); // aguarda o CSS transition iniciar
    }
  }, [servicoAtivo]);

  function handleVerHorarios(servico: Servico) {
    // Mesmo serviço clicado → fecha (toggle). Serviço diferente → troca.
    setServicoAtivo((prev) => (prev?.id === servico.id ? null : servico));
  }

  const itensFiltrados =
    filtroAtivo === "Todos"
      ? items
      : items.filter((item) => item.categoria === filtroAtivo);

  return (
    <div className="w-full py-10 px-4 lg:px-20 bg-white/30 backdrop-blur-lg rounded-2xl shadow-xl mt-10">
      {/* Cabeçalho */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="flex items-start flex-col">
          <h1 className="text-4xl font-semibold">Meus serviços</h1>
          <p className="text-gray-600 mt-2">
            Escolha uma categoria para visualizar mais serviços
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 md:justify-end">
          {filtros.map((filtro) => {
            const ativo = filtroAtivo === filtro.value;

            return (
              <Button
                key={filtro.value}
                variant="outline"
                onClick={() => setFiltroAtivo(filtro.value)}
                className={`cursor-pointer rounded-full border-0 px-5 py-2 text-base transition-colors shadow ${
                  ativo
                    ? "bg-button text-white hover:bg-buttonhover"
                    : "bg-white/70 text-foreground hover:bg-white"
                }`}
              >
                {filtro.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {itensFiltrados.map((item) => {
          const ativo = servicoAtivo?.id === item.id;

          return (
            <Card
              key={item.id}
              className={`overflow-hidden bg-white/60 backdrop-blur-lg shadow-xl border h-full flex flex-col p-0 rounded-t-xl transition-all duration-300 ${
                ativo ? "border-accent ring-2 ring-red-300" : "border-0"
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
                </div>

                <div className="flex-1">
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {item.descricao}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm bg-accent border-ring text-white rounded-full px-3 py-1">
                    {item.duracao} min
                  </p>

                  <span className="text-ring font-bold text-lg whitespace-nowrap">
                    R$ {item.preco}
                  </span>
                </div>

                <Button
                  className={`cursor-pointer mt-auto w-full border-0 rounded-lg text-white transition-colors ${
                    ativo
                      ? "bg-button hover:bg-buttonhover"
                      : "bg-button hover:bg-buttonhover"
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
