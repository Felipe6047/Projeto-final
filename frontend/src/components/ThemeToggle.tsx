"use client";

import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors text-label-caps uppercase"
      title={theme === "light" ? "Tema Elite (claro)" : "Tema Aureum (escuro)"}
    >
      <span className="material-symbols-outlined text-[20px]">
        {theme === "light" ? "dark_mode" : "light_mode"}
      </span>
      <span className="hidden md:inline">
        {theme === "light" ? "Aureum" : "Elite"}
      </span>
    </button>
  );
}
