"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/mercado-cupons", label: "Mercado de Cupons", icon: "shopping_bag" },
  { href: "/presentes", label: "Presentes", icon: "redeem" },
  { href: "/ranking", label: "Ranking", icon: "military_tech" },
  { href: "/login", label: "Perfil", icon: "person" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-[280px] h-screen fixed left-0 top-0 border-r border-outline-variant bg-background flex-col py-8 px-6 z-50">
      <div className="mb-12">
        <h1 className="text-display-lg font-bold text-primary">FRIK</h1>
        <p className="text-on-surface-variant text-label-caps mt-1 uppercase tracking-widest">
          Premium Member
        </p>
      </div>
      <nav className="flex-1 space-y-2">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 py-3 px-4 rounded-lg transition-colors active:scale-95 duration-150 ${
                active
                  ? "text-primary font-bold border-r-4 border-primary bg-surface-container"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={
                  active
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                {item.icon}
              </span>
              <span className="text-body-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        className="mt-auto w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold hover:brightness-105 transition-all shadow-sm"
      >
        Upgrade Status
      </button>
    </aside>
  );
}
