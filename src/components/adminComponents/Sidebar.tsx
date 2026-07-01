import { useEffect, useState, type ReactNode } from "react";
import { Calendar, Menu, X, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminPage } from "@/pages/adminPages/AdminMain";

interface SidebarProps {
  current: AdminPage;
  onChange: (page: AdminPage) => void;
}

const navItems: { id: AdminPage; label: string; icon: ReactNode }[] = [
  {
    id: "acompanhamento",
    label: "Acompanhamento",
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    id: "horarios",
    label: "Configurar horários",
    icon: <Clock className="w-4 h-4" />,
  },
  {
    id: "servicos",
    label: "Serviços",
    icon: <Sparkles className="w-4 h-4" />,
  },
];

export function Sidebar({ current, onChange }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleNav(page: AdminPage) {
    onChange(page);
    setMobileOpen(false);
  }

  // Trava o scroll do fundo da página enquanto o drawer mobile está aberto.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Fecha o drawer ao pressionar Esc.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navContent = (
    <nav className="flex flex-col gap-1 p-2 mt-1">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => handleNav(item.id)}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left w-full",
            current === item.id
              ? "bg-primary/10 text-primary font-medium"
              : "text-white hover:bg-muted hover:text-foreground",
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar — visível apenas md+ */}
      <aside className="hidden md:flex w-52 min-w-208px bg-accent flex-col">
        <div className="px-4 py-5">
          <p className="font-semibold text-sm text-white!">Hanna Kupas</p>
          <p className="text-xs text-white! mt-0.5">Painel de gestão</p>
        </div>
        {navContent}
      </aside>

      {/* Mobile — topbar NO fluxo (não fixed) + drawer sobreposto */}
      <div className="md:hidden flex flex-col w-full">
        {/* Topbar no fluxo: empurra o conteúdo abaixo */}
        <header className="flex items-center justify-between px-4 h-14 bg-accent">
          <p className="font-semibold text-sm text-white! truncate">
            Hanna Kupas | Painel de gestão
          </p>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="shrink-0 p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-drawer"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </header>

        {/* Overlay — sempre montado, com fade de opacidade sincronizado com o drawer */}
        <div
          className={cn(
            "fixed inset-0 z-30 bg-black/40 transition-opacity duration-200",
            mobileOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none",
          )}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer deslizante — fixed a partir do topo da topbar (top-14) */}
        <div
          id="mobile-drawer"
          className={cn(
            "fixed top-14 left-0 bottom-0 z-40 w-64 bg-accent flex flex-col shadow-lg transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {navContent}
        </div>
      </div>
    </>
  );
}