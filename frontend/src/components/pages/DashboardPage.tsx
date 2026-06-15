"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import {
  getCampanhasAtivas,
  getEventoAtivo,
  getMeuNivel,
  getMissoesAtivas,
} from "@/lib/api";

export function DashboardPage() {
  const { perfil } = useAuth();
  const [nivel, setNivel] = useState<{
    nome: string;
    progresso_percentual: number;
    pontos: number;
  } | null>(null);
  const [evento, setEvento] = useState<{ titulo: string } | null>(null);
  const [campanhas, setCampanhas] = useState<{ titulo: string; descricao: string | null }[]>([]);
  const [missoes, setMissoes] = useState<
    {
      id: number;
      titulo: string;
      pontos_recompensa: number;
      meta_valor: number;
      progresso: number;
      concluida: number;
    }[]
  >([]);

  useEffect(() => {
    getMeuNivel().then(setNivel).catch(() => null);
    getEventoAtivo().then(setEvento).catch(() => null);
    getCampanhasAtivas().then(setCampanhas).catch(() => []);
    getMissoesAtivas().then(setMissoes).catch(() => []);
  }, [perfil]);

  const primeiroNome = perfil?.nome?.split(" ")[0] ?? "Membro";
  const pontos = perfil?.pontos ?? nivel?.pontos ?? 0;

  return (
    <AppShell>
      <div className="px-4 lg:px-[40px] pb-20">
        {(evento || campanhas.length > 0) && (
          <div className="mt-6 mb-4 space-y-2">
            {evento && (
              <div className="px-4 py-3 rounded-xl bg-primary-container/20 border border-primary-container/40 text-sm">
                <strong className="text-primary">{evento.titulo}</strong>
                <span className="text-on-surface-variant"> — confira no ranking</span>
              </div>
            )}
            {campanhas.map((c) => (
              <div key={c.titulo} className="px-4 py-3 rounded-xl bg-secondary-container/30 border border-outline-variant/30 text-sm">
                <strong className="text-primary">{c.titulo}</strong>
                {c.descricao && <span className="text-on-surface-variant"> — {c.descricao}</span>}
              </div>
            ))}
          </div>
        )}

        <section className="mt-8 mb-16">
          <h2 className="text-[32px] font-semibold">Olá, {primeiroNome}</h2>
          <p className="text-on-surface-variant text-lg mt-2">
            {nivel
              ? `Nível ${nivel.nome} — ${nivel.progresso_percentual}% até o próximo tier.`
              : "Acumule pontos e desbloqueie recompensas exclusivas."}
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
          <div className="lg:col-span-8 bg-card-cream rounded-xl p-8 premium-shadow">
            <p className="frik-label text-on-surface-variant opacity-80">Saldo disponível</p>
            <h3 className="text-[40px] font-bold text-primary mt-2">
              {pontos.toLocaleString("pt-BR")} pts
            </h3>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/registrar-compras" className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold">
                Registrar compras
              </Link>
              <Link href="/mercado-cupons" className="bg-primary-container text-on-primary-container px-8 py-3 rounded-full font-bold">
                Mercado de cupons
              </Link>
              <Link href="/ranking" className="text-primary font-bold flex items-center gap-2">
                Ver ranking
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-4 bg-surface-container rounded-xl p-8 flex flex-col items-center text-center premium-shadow">
            <p className="frik-label text-on-surface-variant">Nível atual</p>
            <h4 className="text-2xl font-semibold mt-1">{nivel?.nome ?? perfil?.nivel ?? "Bronze"}</h4>
            <p className="text-sm text-on-surface-variant mt-2">{nivel?.progresso_percentual ?? 0}% progresso</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Missões ativas</h2>
          {missoes.length === 0 ? (
            <p className="text-on-surface-variant">Nenhuma missão ativa no momento.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {missoes.map((m) => {
                const isConcluida = Number(m.concluida) > 0;
                const pct = Math.min(100, Math.round((m.progresso / m.meta_valor) * 100));
                return (
                  <div key={m.id} className={`relative overflow-hidden rounded-xl border p-6 transition-all ${isConcluida ? 'bg-primary-container/20 border-primary/30 premium-shadow' : 'bg-surface-container-low border-outline-variant/30'}`}>
                    {isConcluida && (
                      <div className="absolute top-0 right-0 bg-primary text-on-primary text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm">
                        Completada
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2 mt-1">
                      <h5 className={`font-semibold text-lg ${isConcluida ? 'text-primary' : 'text-on-surface'}`}>{m.titulo}</h5>
                    </div>
                    <p className="text-primary font-bold mb-4 text-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">monetization_on</span>
                      +{m.pontos_recompensa} pts
                    </p>
                    <div className="w-full h-2 bg-outline-variant/20 rounded-full overflow-hidden mb-2">
                      <div className={`h-full rounded-full transition-all duration-1000 ${isConcluida ? 'bg-primary' : 'bg-primary/70'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant font-medium">Progresso</span>
                      <span className={isConcluida ? "text-primary font-bold" : "text-on-surface-variant font-bold"}>
                        {m.progresso} / {m.meta_valor}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
