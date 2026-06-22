"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const nav = [
  { href: "/", label: "Loja & Início", icon: "storefront" },
  { href: "/mercado-cupons", label: "Meus Cupons", icon: "local_activity" },
  { href: "/salas", label: "Feirão de Trocas", icon: "swap_horiz" },
  { href: "/perfil", label: "Meu Perfil", icon: "person" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAdmin } = useAuth();
  const [modalNivelOpen, setModalNivelOpen] = useState(false);

  return (
    <aside className="hidden lg:flex w-[280px] h-screen fixed left-0 top-0 border-r border-outline-variant bg-background flex-col py-8 px-6 z-50">
      <div className="mb-10">
        <Link href="/" className="text-[48px] font-bold text-primary leading-none block">
          FRIK
        </Link>
        <p className="frik-label text-on-surface-variant mt-2">Membro Premium</p>
      </div>
      <nav aria-label="Menu Principal" className="flex-1 space-y-1">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 py-3 px-4 rounded-lg transition-colors ${
                active
                  ? "text-primary font-bold border-r-4 border-primary bg-surface-container"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={
                  active ? { fontVariationSettings: "'FILL' 1" } : undefined
                }
              >
                {item.icon}
              </span>
              <span className="text-base">{item.label}</span>
            </Link>
          );
        })}
        {isAdmin && (
          <>
            <Link
              href="/simulador-caixa"
              className={`flex items-center gap-4 py-3 px-4 rounded-lg transition-colors ${
                pathname.startsWith("/simulador-caixa")
                  ? "text-primary font-bold border-r-4 border-primary bg-surface-container"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined">point_of_sale</span>
              <span className="text-base">Terminal PDV</span>
            </Link>
            <Link
              href="/admin"
              className={`flex items-center gap-4 py-3 px-4 rounded-lg transition-colors ${
                pathname.startsWith("/admin")
                  ? "text-primary font-bold border-r-4 border-primary bg-surface-container"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span className="text-base">Painel Admin</span>
            </Link>
          </>
        )}
      </nav>
      <button
        type="button"
        onClick={() => {
          logout();
          router.push("/login");
        }}
        className="mb-3 w-full py-3 rounded-full border border-outline-variant text-on-surface-variant font-semibold hover:bg-surface-container text-sm"
      >
        Sair da conta
      </button>
      <button
        type="button"
        onClick={() => setModalNivelOpen(true)}
        className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold hover:brightness-105 transition-all"
      >
        Melhorar nível
      </button>

      {modalNivelOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-[2rem] w-full max-w-md p-8 relative shadow-2xl">
            <button
              onClick={() => setModalNivelOpen(false)}
              className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-2xl font-black text-on-surface mb-2">Como subir de Nível?</h2>
            <p className="text-on-surface-variant mb-6 text-sm">
              Acumule pontos para subir de nível e desbloquear benefícios exclusivos no FRIK!
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary bg-primary-container p-2 rounded-full">shopping_bag</span>
                <div>
                  <strong className="block text-on-surface">Comprar Produtos</strong>
                  <span className="text-sm text-on-surface-variant">Cada R$ 1 gasto na loja = 1 Ponto.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary bg-primary-container p-2 rounded-full">task_alt</span>
                <div>
                  <strong className="block text-on-surface">Concluir Missões</strong>
                  <span className="text-sm text-on-surface-variant">Confira as missões rápidas no seu painel para ganhar bônus semanais.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary bg-primary-container p-2 rounded-full">handshake</span>
                <div>
                  <strong className="block text-on-surface">Fazer Trocas</strong>
                  <span className="text-sm text-on-surface-variant">Troque cupons no Feirão e ganhe +10 Pontos a cada troca aceita!</span>
                </div>
              </li>
            </ul>
            <button
              onClick={() => { setModalNivelOpen(false); router.push("/ranking"); }}
              className="w-full bg-primary text-on-primary py-3 rounded-full font-bold shadow-md hover:scale-105 transition-transform"
            >
              Ver meu Progresso
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
