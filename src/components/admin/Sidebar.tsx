import { useState } from "react";
import { Calendar, Scissors, Settings, Menu, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminPage } from "@/pages/admin-dashboard/Admin";

interface SidebarProps {
  current: AdminPage;
  onChange: (page: AdminPage) => void;
}

const navItems: { id: AdminPage; label: string; icon: React.ReactNode }[] = [
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
    icon: <Scissors className="w-4 h-4" />,
  },
  {
    id: "configuracoes",
    label: "Configurações",
    icon: <Settings className="w-4 h-4" />,
  },
];

export function Sidebar({ current, onChange }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleNav(page: AdminPage) {
    onChange(page);
    setMobileOpen(false);
  }

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
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
      <aside className="hidden md:flex w-52 min-w-208px border-r border-border bg-accent flex-col">
        <div className="px-4 py-5">
          <p className="font-semibold text-sm text-primary">Hanna Kupas</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Painel de gestão
          </p>
        </div>
        {navContent}
      </aside>

      {/* Mobile — topbar NO fluxo (não fixed) + drawer sobreposto */}
      <div className="md:hidden flex flex-col w-full">
        {/* Topbar no fluxo: empurra o conteúdo abaixo */}
        <header className="flex items-center justify-between px-4 h-14 bg-accent border-b border-border">
          <p className="font-semibold text-sm text-primary">
            Hanna Kupas | Painel de gestão
          </p>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </header>

        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Drawer deslizante — fixed a partir do topo da topbar (top-14) */}
        <div
          className={cn(
            "fixed top-14 left-0 bottom-0 z-40 w-64 bg-accent border-r border-border flex flex-col shadow-lg transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {navContent}
        </div>
      </div>
    </>
  );
}
