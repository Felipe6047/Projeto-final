"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import {
  getBeneficios,
  getMeuNivel,
  getRankingGlobal,
  getTodasConquistas,
} from "@/lib/api";

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
  const [conquistas, setConquistas] = useState<
    {
      slug: string;
      nome: string;
      descricao: string;
      icone: string;
      desbloqueada: number;
    }[]
  >([]);

  useEffect(() => {
    getRankingGlobal(10).then(setRanking).catch(() => []);
    getBeneficios().then(setBeneficios).catch(() => []);
    getMeuNivel().then(setNivel).catch(() => null);
    getTodasConquistas().then(setConquistas).catch(() => []);
  }, []);

  return (
    <AppShell searchPlaceholder="Buscar no ranking...">
      <main className="px-4 lg:px-[40px] pt-8 pb-20 max-w-[1400px]">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
          <div className="lg:col-span-7 bg-card-cream rounded-[32px] p-8 premium-shadow">
            <span className="frik-label text-primary bg-primary-container/20 px-4 py-1.5 rounded-full inline-block mb-4">
              Ranking global
            </span>
            <h2 className="text-[32px] font-semibold mb-4">
              Sua evolução no FRIK
            </h2>
            <p className="text-lg text-on-surface-variant">
              Mantenha o engajamento para desbloquear privilégios exclusivos.
            </p>
            <div className="mt-8">
              <div className="flex justify-between frik-label text-on-surface-variant mb-2">
                <span>Progresso de nível</span>
                <span>{nivel?.progresso_percentual ?? 0}%</span>
              </div>
              <div className="w-full h-2 bg-outline-variant/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-container rounded-full transition-all"
                  style={{ width: `${nivel?.progresso_percentual ?? 0}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-primary font-semibold">
                Nível atual: {nivel?.nome ?? perfil?.nivel}
              </p>
            </div>
          </div>
          <div className="lg:col-span-5 bg-surface-container-high rounded-[32px] p-8 premium-shadow">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                stars
              </span>
              Benefícios por nível
            </h3>
            <ul className="space-y-3 max-h-72 overflow-y-auto">
              {beneficios.map((b) => (
                <li
                  key={b.slug}
                  className="flex justify-between text-sm border-b border-outline-variant/20 pb-2"
                >
                  <span className="font-bold">{b.nome}</span>
                  <span className="text-on-surface-variant">
                    {b.trocas_mes === null
                      ? "Trocas ilimitadas"
                      : `${b.trocas_mes}/mês`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {conquistas.length > 0 && (
          <section className="mb-16">
            <h3 className="text-2xl font-semibold mb-6">Conquistas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {conquistas.map((c) => (
                <div
                  key={c.slug}
                  className={`p-6 rounded-2xl text-center premium-shadow ${
                    c.desbloqueada
                      ? "bg-primary-container/20 border border-primary-container"
                      : "bg-surface-container-high opacity-50 grayscale"
                  }`}
                >
                  <span className="material-symbols-outlined text-4xl text-primary mb-2">
                    {c.icone}
                  </span>
                  <p className="font-bold">{c.nome}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{c.descricao}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-2xl font-semibold mb-6">Classificação</h3>
          <div className="space-y-3">
            {ranking.map((r, i) => {
              const isMe = perfil?.nome === r.nome;
              return (
                <div
                  key={`${r.posicao}-${r.nome}`}
                  className={`flex items-center gap-4 p-5 rounded-2xl premium-shadow ${
                    isMe
                      ? "bg-primary-container/15 border border-primary-container ring-2 ring-primary/20"
                      : "bg-surface-container-lowest"
                  }`}
                >
                  <span
                    className={`w-8 text-center text-2xl font-bold ${
                      i === 0
                        ? "text-primary"
                        : i === 1
                          ? "text-secondary"
                          : "text-on-surface-variant"
                    }`}
                  >
                    {r.posicao}
                  </span>
                  <div className="w-12 h-12 rounded-full border-2 border-primary-container bg-secondary-container flex items-center justify-center font-bold text-primary shrink-0">
                    {r.nome.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">
                      {r.nome}
                      {isMe ? " (você)" : ""}
                    </p>
                    <p className="frik-label text-on-surface-variant">{r.nivel}</p>
                  </div>
                  <p className="text-xl font-bold text-primary shrink-0">
                    {r.pontos.toLocaleString("pt-BR")}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
