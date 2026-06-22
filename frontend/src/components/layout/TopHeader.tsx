"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  NotificationsPanel,
} from "@/components/notifications/NotificationsPanel";
import { getNotificacoes } from "@/lib/api";
import { useEffect } from "react";

interface TopHeaderProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export function TopHeader({
  placeholder = "Buscar recompensas ou missões...",
  onSearch,
}: TopHeaderProps) {
  const { perfil, isAdmin, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [naoLidas, setNaoLidas] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    getNotificacoes()
      .then((d) => setNaoLidas(d.naoLidas))
      .catch(() => setNaoLidas(0));
  }, []);

  const nome = perfil?.nome ?? "Visitante";
  const nivel = perfil?.nivel ?? "—";
  const pontos = perfil?.pontos ?? 0;

  return (
    <header className="h-20 w-full flex justify-between items-center px-4 lg:px-[40px] sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-outline-variant/30 shadow-sm transition-all">
      <div className="flex-1 flex items-center max-w-md">
        <div className="relative w-full">
          <span
            className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none select-none"
            aria-hidden
          >
            search
          </span>
          <input
            className="w-full bg-surface-container-high/50 backdrop-blur-md border border-outline-variant/30 rounded-full py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:bg-surface text-base transition-all shadow-inner"
            placeholder={placeholder}
            type="search"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-3 lg:gap-5">
        <div 
          className="hidden sm:flex items-center gap-1 bg-surface-container-high py-1.5 px-3 rounded-full border border-primary/20 shadow-inner cursor-pointer hover:bg-surface-variant transition-colors" 
          title={`Você acessou a plataforma ${perfil?.dias_ofensiva ?? 0} dias seguidos!`}
        >
          <span className="material-symbols-outlined text-primary text-[20px] animate-pulse">local_fire_department</span>
          <span className="font-bold text-sm text-primary">{perfil?.dias_ofensiva ?? 0}</span>
        </div>

        {/* Gamificação: Ranking */}
        <Link 
          href="/ranking"
          className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 hover:bg-surface-variant hover:border-primary/50 transition-all text-on-surface-variant hover:text-primary group"
          title="Ver Ranking Global"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">emoji_events</span>
        </Link>
        
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setNotifOpen(true)}
          className="relative p-2 text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Notificações"
        >
          <span className="material-symbols-outlined">notifications</span>
          {naoLidas > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {naoLidas > 9 ? "9+" : naoLidas}
            </span>
          )}
        </button>
        <NotificationsPanel 
          open={notifOpen} 
          onClose={() => setNotifOpen(false)} 
          onUpdateCount={setNaoLidas} 
        />
        <Link
          href="/perfil"
          className="hidden sm:flex items-center gap-3 border-l border-outline-variant pl-4 hover:opacity-90 transition-opacity"
        >
          <div className="text-right">
            <p className="font-bold text-on-surface leading-tight text-sm max-w-[140px] truncate">
              {nome}
            </p>
            <p className="text-xs text-on-surface-variant">
              {nivel} · {pontos.toLocaleString("pt-BR")} pts
            </p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 shadow-sm">
            {nome.charAt(0).toUpperCase()}
          </div>
        </Link>
      </div>

    </header>
  );
}
