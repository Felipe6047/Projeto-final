"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { href: "/", label: "Início", icon: "dashboard" },
  { href: "/mercado-cupons", label: "Mercado de Cupons", icon: "shopping_bag" },
  { href: "/presentes", label: "Presentes", icon: "redeem" },
  { href: "/ranking", label: "Ranking", icon: "military_tech" },
  { href: "/salas", label: "Salas de troca", icon: "groups" },
  { href: "/perfil", label: "Perfil", icon: "person" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <aside className="hidden lg:flex w-[280px] h-screen fixed left-0 top-0 border-r border-outline-variant bg-background flex-col py-8 px-6 z-50">
      <div className="mb-10">
        <Link href="/" className="text-[48px] font-bold text-primary leading-none block">
          FRIK
        </Link>
        <p className="frik-label text-on-surface-variant mt-2">Membro Premium</p>
      </div>
      <nav className="flex-1 space-y-1">
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
        className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold hover:brightness-105 transition-all"
      >
        Melhorar nível
      </button>
    </aside>
  );
}
