"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { getBeneficios, getMeuNivel, getRankingGlobal } from "@/lib/api";

export function RankingPage() {
  const { perfil } = useAuth();
  const [ranking, setRanking] = useState<
    { posicao: number; nome: string; nivel: string; pontos: number }[]
  >([]);
  const [beneficios, setBeneficios] = useState<
    { nome: string; slug: string; trocas_mes: number | null }[]
  >([]);
  const [nivel, setNivel] = useState<{
    progresso_percentual: number;
    nome: string;
  } | null>(null);

  useEffect(() => {
    getRankingGlobal(10).then(setRanking).catch(() => []);
    getBeneficios().then(setBeneficios).catch(() => []);
    getMeuNivel().then(setNivel).catch(() => null);
  }, []);

  return (
    <AppShell searchPlaceholder="Search experiences...">
      <main className="px-4 lg:px-container-padding pt-24 lg:pt-32 pb-20 max-w-[1400px]">
        <section className="grid grid-cols-12 gap-gutter mb-section-gap">
          <div className="col-span-12 lg:col-span-7 bg-card-cream rounded-[32px] p-card-padding relative overflow-hidden premium-shadow">
            <span className="inline-block bg-primary-container/20 text-primary text-label-caps px-4 py-1.5 rounded-full mb-6 uppercase">
              Global Leaderboard
            </span>
            <h2 className="text-headline-md text-on-surface mb-4">
              Você está evoluindo no FRIK
            </h2>
            <p className="text-body-lg text-on-surface-variant max-w-lg">
              Mantenha seu engajamento para desbloquear privilégios exclusivos.
            </p>
            <div className="mt-10">
              <div className="flex justify-between text-label-caps text-on-surface-variant mb-2 uppercase">
                <span>Progresso de nível</span>
                <span>{nivel?.progresso_percentual ?? 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-outline-variant/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-container rounded-full"
                  style={{ width: `${nivel?.progresso_percentual ?? 0}%` }}
                />
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5 bg-surface-container-high rounded-[32px] p-card-padding premium-shadow">
            <h3 className="text-headline-sm text-on-surface mb-4 flex items-center gap-2">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                stars
              </span>
              Benefícios por Nível
            </h3>
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {beneficios.map((b) => (
                <li
                  key={b.slug}
                  className="flex justify-between text-body-md border-b border-outline-variant/20 pb-2"
                >
                  <span className="font-bold">{b.nome}</span>
                  <span className="text-on-surface-variant text-sm">
                    {b.trocas_mes === null ? "∞ trocas" : `${b.trocas_mes}/mês`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12 xl:col-span-8">
            <h3 className="text-headline-sm mb-8">Global Leaderboard</h3>
            <div className="space-y-3">
              {ranking.map((r, i) => (
                <div
                  key={r.posicao}
                  className={`flex items-center gap-6 p-6 rounded-2xl premium-shadow hover:-translate-y-1 transition-transform ${
                    perfil?.nome === r.nome
                      ? "bg-primary-container/10 border border-primary-container ring-2 ring-primary ring-opacity-10"
                      : "bg-surface-container-lowest"
                  }`}
                >
                  <span
                    className={`w-8 text-stat-lg text-center ${
                      i === 0 ? "text-primary" : i === 1 ? "text-secondary" : "text-on-surface-variant"
                    }`}
                  >
                    {r.posicao}
                  </span>
                  <div className="w-14 h-14 rounded-full border-2 border-primary-container bg-secondary-container flex items-center justify-center font-bold text-primary">
                    {r.nome.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-md font-bold truncate">{r.nome}</p>
                    <p className="text-label-caps text-on-surface-variant uppercase">
                      {r.nivel}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-headline-sm text-primary">
                      {r.pontos.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-label-caps text-on-surface-variant uppercase">
                      pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-12 xl:col-span-4">
            <div className="bg-surface-container-lowest dark:bg-surface-container rounded-[32px] p-card-padding premium-shadow">
              <h3 className="text-headline-sm mb-8">Elite Accolades</h3>
              <div className="grid grid-cols-2 gap-4">
                {["Amigo Ouro", "Troca Justa", "Corrente do Bem", "Icon Status"].map(
                  (badge, i) => (
                    <div
                      key={badge}
                      className={`rounded-2xl p-6 flex flex-col items-center text-center ${
                        i === 3
                          ? "bg-surface-container/50 border border-dashed border-outline-variant opacity-60"
                          : "bg-surface-container-low group cursor-pointer"
                      }`}
                    >
                      <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center mb-4">
                        <span
                          className="material-symbols-outlined text-primary text-[32px]"
                          style={
                            i < 3
                              ? { fontVariationSettings: "'FILL' 1" }
                              : undefined
                          }
                        >
                          {i === 3 ? "lock" : "military_tech"}
                        </span>
                      </div>
                      <p className="text-body-md font-bold">{badge}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
