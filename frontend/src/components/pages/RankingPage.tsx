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
          <h3 className="text-[28px] font-bold mb-10 text-center text-primary">Top Jogadores</h3>
          
          {/* PODIUM (Top 3) */}
          {ranking.length >= 3 && (
            <div className="flex items-end justify-center gap-2 sm:gap-6 mb-16 pt-10">
              {/* 2º Lugar */}
              <div className="flex flex-col items-center w-24 sm:w-32 relative">
                <div className="absolute -top-12 bg-surface-container-highest text-on-surface-variant w-10 h-10 rounded-full flex items-center justify-center font-black text-xl shadow-lg border-2 border-outline-variant/30 z-10">2</div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary-container flex items-center justify-center font-bold text-2xl text-primary shadow-lg mb-4 border-4 border-surface-container-highest">
                  {ranking[1].nome.charAt(0).toUpperCase()}
                </div>
                <div className="w-full bg-surface-container-highest rounded-t-2xl h-24 flex flex-col items-center justify-end pb-4 shadow-inner">
                  <p className="font-bold text-sm text-center leading-tight truncate w-full px-2">{ranking[1].nome}</p>
                  <p className="text-xs font-bold text-primary opacity-80 mt-1">{Number(ranking[1].pontos).toLocaleString()} pts</p>
                </div>
              </div>

              {/* 1º Lugar */}
              <div className="flex flex-col items-center w-28 sm:w-40 relative z-10">
                <div className="absolute -top-16 bg-gradient-to-br from-yellow-300 to-yellow-600 text-white w-14 h-14 rounded-full flex items-center justify-center font-black text-3xl shadow-[0_0_20px_rgba(253,224,71,0.6)] border-2 border-yellow-200 z-10">1</div>
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-primary-container flex items-center justify-center font-bold text-4xl text-primary shadow-xl mb-4 border-4 border-yellow-400">
                  {ranking[0].nome.charAt(0).toUpperCase()}
                </div>
                <div className="w-full bg-gradient-to-t from-primary-container/80 to-primary/20 border-t border-primary/30 rounded-t-2xl h-36 flex flex-col items-center justify-end pb-6 shadow-2xl">
                  <span className="material-symbols-outlined text-yellow-500 mb-1 animate-pulse">workspace_premium</span>
                  <p className="font-bold text-base text-center leading-tight truncate w-full px-2">{ranking[0].nome}</p>
                  <p className="text-sm font-black text-primary mt-1">{Number(ranking[0].pontos).toLocaleString()} pts</p>
                </div>
              </div>

              {/* 3º Lugar */}
              <div className="flex flex-col items-center w-24 sm:w-32 relative">
                <div className="absolute -top-12 bg-amber-700/80 text-amber-100 w-10 h-10 rounded-full flex items-center justify-center font-black text-xl shadow-lg border-2 border-amber-900/30 z-10">3</div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary-container flex items-center justify-center font-bold text-2xl text-amber-900 shadow-lg mb-4 border-4 border-amber-800/50">
                  {ranking[2].nome.charAt(0).toUpperCase()}
                </div>
                <div className="w-full bg-amber-900/10 rounded-t-2xl h-20 flex flex-col items-center justify-end pb-3 shadow-inner border-t border-amber-900/20">
                  <p className="font-bold text-sm text-center leading-tight truncate w-full px-2">{ranking[2].nome}</p>
                  <p className="text-xs font-bold text-amber-800 opacity-80 mt-1">{Number(ranking[2].pontos).toLocaleString()} pts</p>
                </div>
              </div>
            </div>
          )}

          {/* LIST (4th to 10th) */}
          <div className="space-y-3 max-w-3xl mx-auto">
            {ranking.slice(ranking.length >= 3 ? 3 : 0).map((r) => {
              const isMe = perfil?.nome === r.nome;
              return (
                <div
                  key={`${r.posicao}-${r.nome}`}
                  className={`flex items-center gap-4 p-5 rounded-2xl transition-transform hover:scale-[1.02] ${isMe ? "bg-primary/10 border border-primary/30 shadow-md" : "bg-card-cream premium-shadow border border-outline-variant/10"}`}
                >
                  <span className="w-8 text-center text-xl font-bold text-on-surface-variant opacity-60">{r.posicao}º</span>
                  <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center font-bold text-on-surface-variant">
                    {r.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{r.nome}{isMe ? " (você)" : ""}</p>
                    <p className="text-xs text-primary font-semibold uppercase tracking-wider">{r.nivel}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xl text-primary">{Number(r.pontos).toLocaleString("pt-BR")}</p>
                    <p className="text-[10px] text-on-surface-variant font-medium">PONTOS</p>
                  </div>
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
