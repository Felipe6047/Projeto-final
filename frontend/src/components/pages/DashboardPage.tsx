"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { getMeuNivel } from "@/lib/api";

export function DashboardPage() {
  const { perfil } = useAuth();
  const [nivel, setNivel] = useState<{
    nome: string;
    progresso_percentual: number;
    pontos: number;
  } | null>(null);

  useEffect(() => {
    getMeuNivel()
      .then(setNivel)
      .catch(() => null);
  }, [perfil]);

  const nome = perfil?.nome?.split(" ")[0] ?? "Membro";
  const pontos = perfil?.pontos ?? nivel?.pontos ?? 0;

  return (
    <AppShell>
      <div className="px-4 lg:px-container-padding pb-20">
        <section className="mt-8 lg:mt-12 mb-section-gap">
          <h2 className="text-headline-md text-on-surface">
            Welcome back, {nome}
          </h2>
          <p className="text-on-surface-variant text-body-lg mt-2">
            {nivel
              ? `Nível ${nivel.nome} — ${nivel.progresso_percentual}% até o próximo tier.`
              : "Acumule pontos e desbloqueie recompensas exclusivas."}
          </p>
        </section>

        <section className="grid grid-cols-12 gap-gutter mb-section-gap">
          <div className="col-span-12 lg:col-span-8 bg-card-cream rounded-xl p-card-padding relative overflow-hidden premium-shadow transition-transform hover:-translate-y-1 group">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <p className="text-label-caps text-on-surface-variant opacity-80 uppercase">
                  Available Balance
                </p>
                <h3 className="text-stat-lg text-primary mt-4">
                  {pontos.toLocaleString("pt-BR")} pts
                </h3>
              </div>
              <div className="mt-12 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold text-body-md hover:shadow-lg transition-all"
                >
                  Redeem Points
                </button>
                <button
                  type="button"
                  className="text-primary font-bold text-body-md flex items-center gap-2 hover:gap-3 transition-all"
                >
                  Transaction History
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <span className="material-symbols-outlined !text-[240px]">token</span>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-surface-container rounded-xl p-card-padding flex flex-col items-center justify-center text-center premium-shadow transition-transform hover:-translate-y-1">
            <div className="relative w-32 h-32 mb-6">
              <svg className="w-full h-full -rotate-90">
                <circle
                  className="text-outline-variant"
                  cx="64"
                  cy="64"
                  fill="transparent"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                />
                <circle
                  className="text-primary-container transition-all duration-1000"
                  cx="64"
                  cy="64"
                  fill="transparent"
                  r="58"
                  stroke="currentColor"
                  strokeDasharray="364"
                  strokeDashoffset={
                    364 -
                    (364 * (nivel?.progresso_percentual ?? 30)) / 100
                  }
                  strokeWidth="8"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-primary !text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  workspace_premium
                </span>
              </div>
            </div>
            <p className="text-label-caps text-on-surface-variant uppercase">
              Current Tier
            </p>
            <h4 className="text-headline-sm text-on-surface">
              {nivel?.nome ?? perfil?.nivel ?? "Bronze"}
            </h4>
            <p className="text-body-md text-on-surface-variant mt-2">
              {nivel?.progresso_percentual ?? 0}% progresso
            </p>
          </div>
        </section>

        <section className="mb-section-gap">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-headline-sm text-on-surface">Active Missions</h2>
              <p className="text-on-surface-variant text-body-md mt-1">
                Complete tasks to earn bonus points.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {[
              { tag: "Daily", title: "Primeira troca", pts: "+100", prog: "0/1" },
              { tag: "Weekly", title: "Presenteie alguém", pts: "+150", prog: "0/1" },
              { tag: "Exclusive", title: "Peak Performance", pts: "+3500", prog: "Locked" },
            ].map((m) => (
              <div
                key={m.title}
                className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-outline-variant/30"
              >
                <div className="h-32 bg-secondary-container relative flex items-end p-4">
                  <span className="bg-primary/90 text-on-primary px-3 py-1 rounded-full text-label-caps uppercase">
                    {m.tag}
                  </span>
                </div>
                <div className="p-6">
                  <h5 className="text-headline-sm text-on-surface">{m.title}</h5>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-label-caps uppercase text-on-surface-variant">
                      <span>Progress</span>
                      <span>{m.prog}</span>
                    </div>
                    <div className="h-1.5 bg-outline-variant rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-container"
                        style={{
                          width: m.prog === "Locked" ? "0%" : "33%",
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-primary font-bold mt-4">{m.pts} pts</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
