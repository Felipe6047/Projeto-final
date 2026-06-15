"use client";

import { AdminShell } from "@/components/admin/AdminShell";

export function AdminConquistasPage() {
  return (
    <AdminShell title="Gestão de Conquistas" subtitle="Badges e Troféus">
      <div className="bg-surface-container-low border border-outline-variant/30 p-8 rounded-2xl text-center">
        <span className="material-symbols-outlined text-6xl text-primary mb-4 animate-pulse">engineering</span>
        <h2 className="text-2xl font-bold mb-2">Módulo em Construção</h2>
        <p className="text-on-surface-variant max-w-md mx-auto">
          A interface para cadastrar novas Conquistas/Badges dinamicamente pelo painel estará disponível na próxima atualização do sistema. 
          Por enquanto, as Conquistas são carregadas automaticamente pelo Seed do banco de dados.
        </p>
      </div>
    </AdminShell>
  );
}
