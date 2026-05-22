"use client";

import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

interface TopHeaderProps {
  placeholder?: string;
}

export function TopHeader({
  placeholder = "Search rewards or missions...",
}: TopHeaderProps) {
  const { perfil } = useAuth();
  const nome = perfil?.nome ?? "Convidado";
  const nivel = perfil?.nivel ?? "Bronze";

  return (
    <header className="h-20 w-full flex justify-between items-center px-4 lg:px-container-padding bg-transparent sticky top-0 z-40 backdrop-blur-md bg-background/80">
      <div className="flex-1 flex items-center max-w-md">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            className="w-full bg-surface-container-low border-none rounded-full py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:ring-opacity-50 text-body-md"
            placeholder={placeholder}
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 lg:gap-6">
        <ThemeToggle />
        <button
          type="button"
          className="relative p-2 text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
        </button>
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <p className="font-bold text-on-surface leading-none text-sm lg:text-base">
              {nome}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">Status: {nivel}</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-primary-container bg-secondary-container flex items-center justify-center text-primary font-bold">
            {nome.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
