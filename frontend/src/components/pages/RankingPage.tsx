"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import {
  getBeneficios,
  getMeuNivel,
  getRankingConquistasTab,
  getRankingGlobal,
  getRankingMensal,
  getRankingPresentes,
  getRankingTrocas,
  getTodasConquistas,
  RankingItem,
} from "@/lib/api";

const ABAS = [
  { id: "geral", label: "Geral", fetch: getRankingGlobal },
  { id: "mensal", label: "Mensal", fetch: getRankingMensal },
  { id: "trocas", label: "Trocas", fetch: getRankingTrocas },
  { id: "presentes", label: "Presentes", fetch: getRankingPresentes },
  { id: "conquistas", label: "Conquistas", fetch: getRankingConquistasTab },
] as const;

export function RankingPage() {
  const { perfil } = useAuth();
  const [aba, setAba] = useState<(typeof ABAS)[number]["id"]>("geral");
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [beneficios, setBeneficios] = useState<{ nome: string; trocas_mes: number | null }[]>([]);
  const [nivel, setNivel] = useState<{ progresso_percentual: number; nome: string } | null>(null);
  const [conquistas, setConquistas] = useState<{ slug: string; nome: string; desbloqueada: number }[]>([]);

  useEffect(() => {
    const fetcher = ABAS.find((a) => a.id === aba)?.fetch ?? getRankingGlobal;
    fetcher(10).then(setRanking).catch(() => setRanking([]));
  }, [aba]);

  useEffect(() => {
    getBeneficios().then(setBeneficios).catch(() => []);
    getMeuNivel().then(setNivel).catch(() => null);
    getTodasConquistas().then(setConquistas).catch(() => []);
  }, []);

  return (
    <AppShell>
      <main className="px-4 lg:px-[40px] pt-8 pb-20 max-w-[1400px]">
        <section className="mb-10 bg-card-cream rounded-2xl p-8 premium-shadow">
          <h2 className="text-[32px] font-semibold mb-2">Ranking FRIK</h2>
          <p className="text-on-surface-variant">Nível {nivel?.nome ?? perfil?.nivel} — {nivel?.progresso_percentual ?? 0}% progresso</p>
        </section>

        <div className="flex gap-2 mb-8 flex-wrap">
          {ABAS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAba(a.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold ${aba === a.id ? "bg-primary text-on-primary" : "bg-surface-container-high"}`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <section className="mb-16">
          <h3 className="text-2xl font-semibold mb-6">Top 10</h3>
          <div className="space-y-3">
            {ranking.map((r) => {
              const isMe = perfil?.nome === r.nome;
              return (
                <div
                  key={`${r.posicao}-${r.nome}`}
                  className={`flex items-center gap-4 p-5 rounded-2xl ${isMe ? "bg-primary-container/20 ring-2 ring-primary/30" : "bg-surface-container-lowest premium-shadow"}`}
                >
                  <span className="w-8 text-center text-xl font-bold text-primary">{r.posicao}</span>
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-primary">
                    {r.nome.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{r.nome}{isMe ? " (você)" : ""}</p>
                    <p className="text-xs text-on-surface-variant">{r.nivel}</p>
                  </div>
                  <p className="font-bold text-primary">{Number(r.pontos).toLocaleString("pt-BR")}</p>
                </div>
              );
            })}
          </div>
        </section>

        {conquistas.length > 0 && (
          <section className="mb-16">
            <h3 className="text-2xl font-semibold mb-6">Conquistas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {conquistas.map((c) => (
                <div key={c.slug} className={`p-6 rounded-2xl text-center ${c.desbloqueada ? "bg-primary-container/20" : "bg-surface-container-high opacity-50"}`}>
                  <span className="material-symbols-outlined text-4xl text-primary">{c.desbloqueada ? "emoji_events" : "lock"}</span>
                  <p className="font-bold mt-2">{c.nome}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-xl font-semibold mb-4">Benefícios por nível</h3>
          <ul className="space-y-2">
            {beneficios.map((b) => (
              <li key={b.nome} className="flex justify-between text-sm p-3 bg-surface-container-high rounded-xl">
                <span className="font-bold">{b.nome}</span>
                <span>{b.trocas_mes === null ? "Ilimitado" : `${b.trocas_mes}/mês`}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </AppShell>
  );
}
