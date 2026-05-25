"use client";

import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

interface TopHeaderProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export function TopHeader({
  placeholder = "Buscar recompensas ou missões...",
  onSearch,
}: TopHeaderProps) {
  const { perfil } = useAuth();
  const nome = perfil?.nome ?? "Visitante";
  const nivel = perfil?.nivel ?? "—";
  const pontos = perfil?.pontos ?? 0;

  return (
    <header className="h-20 w-full flex justify-between items-center px-4 lg:px-[40px] sticky top-0 z-40 backdrop-blur-md bg-background/90 border-b border-outline-variant/20">
      <div className="flex-1 flex items-center max-w-md">
        <div className="relative w-full">
          <span
            className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none select-none"
            aria-hidden
          >
            search
          </span>
          <input
            className="w-full bg-surface-container-low border-none rounded-full py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/40 text-base"
            placeholder={placeholder}
            type="search"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-3 lg:gap-5">
        <ThemeToggle />
        <button
          type="button"
          className="relative p-2 text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Notificações"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </button>
        <div className="hidden sm:flex items-center gap-3 border-l border-outline-variant pl-4">
          <div className="text-right">
            <p className="font-bold text-on-surface leading-tight text-sm max-w-[140px] truncate">
              {nome}
            </p>
            <p className="text-xs text-on-surface-variant">
              {nivel} · {pontos.toLocaleString("pt-BR")} pts
            </p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-primary-container bg-secondary-container flex items-center justify-center text-primary font-bold shrink-0">
            {nome.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
