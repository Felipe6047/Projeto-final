"use client";

import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      }}
      aria-label={isDark ? "Ativar tema Elite (claro)" : "Ativar tema Aureum (escuro)"}
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant bg-surface-container-low text-on-surface hover:text-primary hover:border-primary transition-colors frik-label"
    >
      <span className="material-symbols-outlined text-[20px]">
        {isDark ? "light_mode" : "dark_mode"}
      </span>
      <span className="hidden md:inline normal-case tracking-wide">
        {isDark ? "Tema Elite" : "Tema Aureum"}
      </span>
    </button>
  );
}
