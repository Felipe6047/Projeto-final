"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const items = [
  { href: "/", icon: "home", label: "Início" },
  { href: "/mercado-cupons", icon: "local_activity", label: "Cupons" },
  { href: "/salas", icon: "swap_horiz", label: "Feirão" },
  { href: "/presentes", icon: "storefront", label: "Loja" },
  { action: "menu", icon: "menu", label: "Menu" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isAdmin, logout } = useAuth();

  return (
    <>
      <nav aria-label="Navegação Inferior" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-outline-variant flex justify-around py-2 px-2 safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        {items.map((item) => {
          if (item.action === "menu") {
            return (
              <button
                key="menu"
                onClick={() => setDrawerOpen(true)}
                className={`flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center rounded-lg ${
                  drawerOpen ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]" style={drawerOpen ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {item.icon}
                </span>
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            );
          }

          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href!);
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center rounded-lg ${
                active ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={
                  active ? { fontVariationSettings: "'FILL' 1" } : undefined
                }
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Drawer Mobile (Bottom Sheet Style) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative bg-background border-t border-outline-variant rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex flex-col pt-4 pb-8 px-6 animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-outline-variant/50 rounded-full mx-auto mb-6" />
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-on-surface">Mais Opções</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-on-surface-variant bg-surface-container-high rounded-full p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <nav className="flex flex-col gap-2 mb-6">
              <Link href="/ranking" className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container bg-surface-container-low" onClick={() => setDrawerOpen(false)}>
                <span className="material-symbols-outlined text-primary text-2xl">military_tech</span> 
                <span className="font-semibold text-base">Ranking Global</span>
              </Link>
              <Link href="/perfil" className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container bg-surface-container-low" onClick={() => setDrawerOpen(false)}>
                <span className="material-symbols-outlined text-primary text-2xl">person</span> 
                <span className="font-semibold text-base">Meu Perfil</span>
              </Link>
              {isAdmin && (
                <Link href="/admin/produtos" className="flex items-center gap-4 p-4 rounded-xl text-primary bg-primary-container/20 border border-primary/20" onClick={() => setDrawerOpen(false)}>
                  <span className="material-symbols-outlined text-2xl">admin_panel_settings</span> 
                  <span className="font-semibold text-base">Painel Admin</span>
                </Link>
              )}
            </nav>

            <button
              onClick={() => { logout(); setDrawerOpen(false); }}
              className="w-full py-4 rounded-xl border-2 border-error/20 text-error font-bold hover:bg-error/10 text-base flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined">logout</span> Sair da Conta
            </button>
          </div>
        </div>
      )}
    </>
  );
}
