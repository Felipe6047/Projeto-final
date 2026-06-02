"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", icon: "home", label: "Início" },
  { href: "/mercado-cupons", icon: "shopping_bag", label: "Mercado" },
  { href: "/presentes", icon: "redeem", label: "Presentes" },
  { href: "/ranking", icon: "military_tech", label: "Ranking" },
  { href: "/perfil", icon: "person", label: "Perfil" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-outline-variant flex justify-around py-2 px-2 safe-area-pb">
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
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
  );
}
