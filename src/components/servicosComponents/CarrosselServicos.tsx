import { useCallback, useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  DollarSign,
  Search,
  LoaderCircle,
} from "lucide-react";
import { AgendaInline } from "@/pages/usuarioPages/Agenda";
import { TreatmentStatus, TreatmentType } from "@joao.sumi/qdule";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { TreatmentFilter } from "@/requests/TreatmentRequest";

export interface Treatment {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  imagePath: string;
  type: TreatmentType;
  status: TreatmentStatus;
}

type TreatmentPage = {
  content?: Treatment[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
};

const getTreatmentByType = (type: TreatmentType) => {
  switch (type) {
    case TreatmentType.Body:
      return "Corporal";
    case TreatmentType.Facial:
      return "Facial";
    default:
      return "Massoterapia";
  }
};

const isTreatmentActive = (treatment: Treatment) =>
  treatment.status === TreatmentStatus.Active;

const SearchComponent = ({
  text,
  onCardClick,
}: {
  text: string;
  onCardClick: (s: Treatment) => void;
}) => {
  const searchText = text.trim().toLowerCase();

  const { data, isLoading } = useQuery<TreatmentPage>({
    // TODO: pensar se text como key nao pode trazer alguns problemas de performance
    queryKey: ["treatments_search", searchText],
    queryFn: () => TreatmentFilter(1, 10, searchText, undefined),
  });

  if (isLoading) {
    return <SearchLoading />;
  }

  const activeTreatments = data?.content?.filter(isTreatmentActive) ?? [];

  return (
    <div>
      {activeTreatments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <Search className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">
            Nenhum serviço encontrado
          </p>
          <p className="text-sm text-muted-foreground/70">
            Tente outro termo ou limpe a busca
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            {activeTreatments.length} resultado
            {activeTreatments.length !== 1 ? "s" : ""} para{" "}
            <span className="font-medium text-foreground">"{searchText}"</span>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {activeTreatments.map((item) => {
              return (
                <Card
                  key={item.id}
                  onClick={() => onCardClick(item)}
                  className="overflow-hidden bg-white/70 backdrop-blur-lg shadow-lg border cursor-pointer flex flex-col p-0 rounded-2xl transition-all duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-95 ring-2 border-primary"
                >
                  <div className="w-full h-32 overflow-hidden shrink-0">
                    <img
                      src={item.imagePath}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-2.5 flex flex-col gap-1.5">
                    <span className="text-[10px] font-medium text-accent uppercase tracking-wide">
                      {item.type}
                    </span>
                    <h3 className="text-sm font-semibold leading-snug line-clamp-2">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span className="text-xs text-muted-foreground">
                        {item.duration / 60} min
                      </span>
                      <span className="text-sm font-bold text-ring">
                        {item.price === 0 ? "Consultar" : `R$ ${item.price}`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Carrossel por categoria ──────────────────────────────────────────────────
function CarrosselType({
  type,
  onCardClick,
}: {
  type: TreatmentType;
  onCardClick: (s: Treatment) => void;
}) {
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery<TreatmentPage>({
      queryKey: ["treatments", type],
      queryFn: ({ pageParam }) =>
        TreatmentFilter(Number(pageParam), 10, undefined, type),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const currentPage = lastPage.page ?? 1;
        const totalPages = lastPage.totalPages ?? 1;

        return currentPage < totalPages ? currentPage + 1 : undefined;
      },
    });

  const trackRef = useRef<HTMLDivElement>(null);
  const cleanupTrackListenerRef = useRef<(() => void) | null>(null);
  const paginationStateRef = useRef({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });
  const firstPage = data?.pages[0];
  const items = data?.pages.flatMap((page) => page.content ?? []) ?? [];
  const activeItems = items.filter(isTreatmentActive);

  useEffect(() => {
    paginationStateRef.current = {
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    return () => {
      cleanupTrackListenerRef.current?.();
    };
  }, []);

  const setTrackRef = useCallback((track: HTMLDivElement | null) => {
    cleanupTrackListenerRef.current?.();
    cleanupTrackListenerRef.current = null;
    trackRef.current = track;

    if (!track) return;
    const scrollTrack = track;

    function isAtEnd() {
      return (
        scrollTrack.scrollLeft + scrollTrack.clientWidth >=
        scrollTrack.scrollWidth - 80
      );
    }

    function handleScrollEnd() {
      const { fetchNextPage, hasNextPage, isFetchingNextPage } =
        paginationStateRef.current;

      if (!isAtEnd() || !hasNextPage || isFetchingNextPage) {
        return;
      }

      fetchNextPage();
    }

    scrollTrack.addEventListener("scrollend", handleScrollEnd);

    cleanupTrackListenerRef.current = () => {
      scrollTrack.removeEventListener("scrollend", handleScrollEnd);
    };
  }, []);

  function scroll(dir: "left" | "right") {
    if (!trackRef.current) return;
    const card = trackRef.current.querySelector("[data-card]") as HTMLElement;
    const step = card ? card.offsetWidth + 24 : 280;
    trackRef.current.scrollBy({
      left: dir === "right" ? step : -step,
      behavior: "smooth",
    });
  }

  if (isLoading) {
    return <CarouselLoading title={getTreatmentByType(type)} />;
  }

  if (firstPage?.totalElements == 0 || activeItems.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      {/* Cabeçalho: título à esquerda, setas absolutas no canto direito do bloco */}
      <div className="relative flex items-center px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">
            {getTreatmentByType(type)}
          </h2>
          <span className="text-sm text-muted-foreground font-normal ml-1">
            ({activeItems.length})
          </span>
        </div>

        {/* Setas posicionadas no canto direito, alinhadas com o título */}
        <div className="ml-auto flex items-center gap-3 md:px-80 sm:px-0">
          <button
            onClick={() => scroll("left")}
            className="w-9 h-9 rounded-full bg-accent hover:bg-accent/80 shadow-md flex items-center justify-center transition-colors text-white"
            aria-label="Rolar para serviço anterior"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-9 h-9 rounded-full bg-accent hover:bg-accent/80 shadow-md flex items-center justify-center transition-colors text-white"
            aria-label="Rolar para próximo serviço"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Trilha do carrossel */}
      <div className="max-w-7xl mx-auto w-full overflow-hidden">
        <div className="relative">
          {/* Fade peek à direita */}
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-rose-100 to-transparent" />

          <div
            ref={setTrackRef}
            className="flex gap-4 overflow-x-auto pb-3 px-1 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {activeItems.map((item) => {
              return (
                <Card
                  key={item.id}
                  data-card
                  onClick={() => onCardClick(item)}
                  className="shrink-0 overflow-hidden bg-white/70 backdrop-blur-lg shadow-lg border cursor-pointer snap-start flex flex-col p-0 rounded-2xl w-[85%] sm:w-[48%] lg:w-[23%] transition-all duration-200 hover:shadow-xl hover:-translate-y-1 active:scale-95 border-secondary border-3"
                >
                  <div className="w-full h-44 lg:h-52 overflow-hidden shrink-0">
                    <img
                      src={item.imagePath}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="flex flex-1 flex-col p-4">
                    <h3 className="text-base font-semibold leading-snug line-clamp-2 min-h-12">
                      {item.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                      {item.description}
                    </p>
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">
                        <Clock className="w-3 h-3" />
                        {item.duration / 60} min
                      </span>
                      <span className="text-lg font-bold text-ring">
                        {item.price === 0 ? "Consultar" : `R$ ${item.price}`}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {isFetchingNextPage && <CarouselAppendLoading />}
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin text-accent" />
        Buscando serviços...
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="h-52 rounded-2xl border border-white/50 bg-white/50 shadow-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

function CarouselLoading({ title }: { title: string }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <LoaderCircle className="size-5 animate-spin text-accent" />
      </div>

      <div className="flex gap-4 overflow-hidden pb-3 px-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-80 shrink-0 rounded-2xl border border-white/50 bg-white/50 shadow-lg animate-pulse w-[85%] sm:w-[48%] lg:w-[23%]"
          />
        ))}
      </div>
    </section>
  );
}

function CarouselAppendLoading() {
  return (
    <>
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="h-80 shrink-0 rounded-2xl border border-white/50 bg-white/50 shadow-lg animate-pulse w-[85%] sm:w-[48%] lg:w-[23%]"
        />
      ))}
    </>
  );
}

//TODO: MUDAR ISSO PARA INGLES
// ─── Modal de detalhes ────────────────────────────────────────────────────────
function ModalServico({
  servico,
  onFechar,
  onAgendar,
}: {
  servico: Treatment | null;
  onFechar: () => void;
  onAgendar: (s: Treatment) => void;
}) {
  if (!servico) return null;

  return (
    <Dialog open={!!servico} onOpenChange={(open) => !open && onFechar()}>
      <DialogContent className="max-w-sm w-[calc(100vw-2rem)] p-0 overflow-hidden rounded-2xl gap-0">
        {/* Imagem */}
        <div className="w-full overflow-hidden" style={{ aspectRatio: "5/4" }}>
          <img
            src={servico.imagePath}
            alt={servico.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Conteúdo */}
        <div className="p-5 flex flex-col gap-4">
          {/* Badge categoria */}
          <span className="text-xs font-medium text-accent uppercase tracking-wide">
            {getTreatmentByType(servico.type)}
          </span>

          <h2 className="text-xl font-semibold leading-snug">{servico.name}</h2>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {servico.description}
          </p>

          {/* Info chips */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted rounded-full px-3 py-1.5">
              <Clock className="w-3.5 h-3.5" />
              {servico.duration / 60} min
            </span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-ring bg-muted rounded-full px-3 py-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              {servico.price === 0 ? "Consultar" : `R$ ${servico.price}`}
            </span>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onFechar}>
              Fechar
            </Button>
            <Button
              className="flex-1 bg-button hover:bg-buttonhover text-white border-0"
              onClick={() => {
                onAgendar(servico);
                onFechar();
              }}
            >
              Agendar horário
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function CardServicos() {
  const [modalServico, setModalServico] = useState<Treatment | null>(null);
  const [servicoAtivo, setServicoAtivo] = useState<Treatment | null>(null);
  const [busca, setBusca] = useState("");
  const agendaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (servicoAtivo && agendaRef.current) {
      setTimeout(() => {
        agendaRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80);
    }
  }, [servicoAtivo]);

  function handleAgendar(servico: Treatment) {
    setServicoAtivo((prev) => (prev?.id === servico.id ? null : servico));
  }

  return (
    <div className="w-full py-10 px-4 lg:px-20 backdrop-blur-lg rounded-2xl shadow-xl mt-10 bg-primary/50">
      {/* Cabeçalho + Busca */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold">Meus serviços</h1>
          <p className="text-gray-600 mt-2">
            Toque em um card para ver todos os detalhes
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar serviço..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-primary/70 backdrop-blur text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all shadow-sm"
          />
          {busca && (
            <button
              onClick={() => setBusca("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Resultado de busca ou carrosséis */}
      {busca !== "" ? (
        <SearchComponent onCardClick={setModalServico} text={busca} />
      ) : (
        <div className="flex flex-col gap-12">
          {Object.values(TreatmentType).map((type) => {
            return (
              <CarrosselType
                key={type}
                type={type}
                onCardClick={setModalServico}
              />
            );
          })}
        </div>
      )}

      {/* Modal de detalhes */}
      <ModalServico
        servico={modalServico}
        onFechar={() => setModalServico(null)}
        onAgendar={handleAgendar}
      />

      {/* Agenda inline */}
      <div
        ref={agendaRef}
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          servicoAtivo
            ? "max-h-500 opacity-100 mt-10"
            : "max-h-0 opacity-0 mt-0"
        }`}
        style={{ scrollMarginTop: "1.5rem" }}
      >
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
