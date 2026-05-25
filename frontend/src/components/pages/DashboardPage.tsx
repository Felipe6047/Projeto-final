"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { getEventoAtivo, getMeuNivel } from "@/lib/api";

export function DashboardPage() {
  const { perfil } = useAuth();
  const [nivel, setNivel] = useState<{
    nome: string;
    progresso_percentual: number;
    pontos: number;
  } | null>(null);
  const [evento, setEvento] = useState<{ titulo: string } | null>(null);

  useEffect(() => {
    getMeuNivel().then(setNivel).catch(() => null);
    getEventoAtivo().then(setEvento).catch(() => null);
  }, [perfil]);

  const primeiroNome = perfil?.nome?.split(" ")[0] ?? "Membro";
  const pontos = perfil?.pontos ?? nivel?.pontos ?? 0;

  return (
    <AppShell>
      <div className="px-4 lg:px-[40px] pb-20">
        {evento && (
          <div className="mt-6 mb-4 px-4 py-3 rounded-xl bg-primary-container/20 border border-primary-container/40 text-sm">
            <strong className="text-primary">{evento.titulo}</strong>
            <span className="text-on-surface-variant"> — confira no ranking</span>
          </div>
        )}

        <section className="mt-8 mb-16">
          <h2 className="text-[32px] font-semibold">
            Olá, {primeiroNome}
          </h2>
          <p className="text-on-surface-variant text-lg mt-2">
            {nivel
              ? `Nível ${nivel.nome} — ${nivel.progresso_percentual}% até o próximo tier.`
              : "Acumule pontos e desbloqueie recompensas exclusivas."}
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
          <div className="lg:col-span-8 bg-card-cream rounded-xl p-8 relative overflow-hidden premium-shadow group">
            <div className="relative z-10">
              <p className="frik-label text-on-surface-variant opacity-80">
                Saldo disponível
              </p>
              <h3 className="text-[40px] font-bold text-primary mt-2">
                {pontos.toLocaleString("pt-BR")} pts
              </h3>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/mercado-cupons"
                  className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold hover:shadow-lg"
                >
                  Resgatar pontos
                </Link>
                <Link
                  href="/ranking"
                  className="text-primary font-bold flex items-center gap-2"
                >
                  Ver ranking
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-surface-container rounded-xl p-8 flex flex-col items-center text-center premium-shadow">
            <div className="relative w-32 h-32 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-outline-variant"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-primary-container"
                  strokeDasharray="364"
                  strokeDashoffset={
                    364 -
                    (364 * (nivel?.progresso_percentual ?? 0)) / 100
                  }
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-primary text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  workspace_premium
                </span>
              </div>
            </div>
            <p className="frik-label text-on-surface-variant">Nível atual</p>
            <h4 className="text-2xl font-semibold mt-1">
              {nivel?.nome ?? perfil?.nivel ?? "Bronze"}
            </h4>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Missões ativas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { tag: "Diária", titulo: "Primeira troca", pts: "+100" },
              { tag: "Semanal", titulo: "Presenteie alguém", pts: "+150" },
              { tag: "Exclusiva", titulo: "Meta de pontos", pts: "+500" },
            ].map((m) => (
              <div
                key={m.titulo}
                className="bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-hidden"
              >
                <div className="h-24 bg-secondary-container flex items-center px-4">
                  <span className="frik-label bg-primary/90 text-on-primary px-3 py-1 rounded-full">
                    {m.tag}
                  </span>
                </div>
                <div className="p-6">
                  <h5 className="font-semibold text-lg">{m.titulo}</h5>
                  <p className="text-primary font-bold mt-3">{m.pts} pts</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
