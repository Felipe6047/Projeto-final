"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { href: "/admin", label: "Painel", icon: "dashboard" },
  { href: "/admin/campanhas", label: "Campanhas", icon: "campaign" },
  { href: "/admin/cupons", label: "Templates de cupom", icon: "confirmation_number" },
  { href: "/admin/produtos", label: "Produtos", icon: "inventory_2" },
  { href: "/admin/missoes", label: "Missões", icon: "flag" },
  { href: "/admin/eventos", label: "Eventos", icon: "celebration" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, perfil } = useAuth();

  return (
    <aside className="hidden lg:flex w-[280px] h-screen fixed left-0 top-0 border-r border-outline-variant bg-surface-container-low flex-col py-8 px-6 z-50">
      <div className="mb-8">
        <Link href="/admin" className="text-[40px] font-bold text-primary leading-none block">
          FRIK
        </Link>
        <p className="frik-label text-on-surface-variant mt-2">Painel administrativo</p>
      </div>
      <nav className="flex-1 space-y-1">
        {nav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${
                active
                  ? "text-primary font-bold bg-surface-container border-r-4 border-primary"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined shrink-0">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <Link
        href="/"
        className="mb-3 flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary px-4"
      >
        <span className="material-symbols-outlined text-[20px]">storefront</span>
        Ver app do cliente
      </Link>
      <button
        type="button"
        onClick={() => {
          logout();
          router.push("/login");
        }}
        className="w-full py-3 rounded-full border border-outline-variant text-on-surface-variant font-semibold hover:bg-surface-container text-sm"
      >
        Sair
      </button>
      {perfil && (
        <p className="text-xs text-on-surface-variant mt-4 text-center truncate">
          {perfil.nome}
        </p>
      )}
    </aside>
  );
}
