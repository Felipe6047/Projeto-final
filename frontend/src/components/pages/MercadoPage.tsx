"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getMeusCupons, getMercadoCupons } from "@/lib/api";

export function MercadoPage() {
  const [meus, setMeus] = useState<
    { id: number; codigo: string; titulo: string; validade_ate: string; status: string }[]
  >([]);
  const [mercado, setMercado] = useState<
    {
      id: number;
      titulo: string;
      codigo: string;
      proprietario_nome?: string;
      nivel_slug?: string;
    }[]
  >([]);

  useEffect(() => {
    getMeusCupons().then(setMeus).catch(() => setMeus([]));
    getMercadoCupons().then(setMercado).catch(() => setMercado([]));
  }, []);

  return (
    <AppShell searchPlaceholder="Buscar cupons e marcas...">
      <div className="px-4 lg:px-container-padding pt-8 pb-20">
        <section className="mb-section-gap">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-secondary-container min-h-[280px] flex items-center px-card-padding">
            <div className="relative z-10 max-w-xl py-8">
              <span className="inline-block text-label-caps bg-primary/10 text-primary px-4 py-1 rounded-full mb-4 uppercase">
                Oferta de tempo limitado
              </span>
              <h2 className="text-display-lg text-on-secondary-container mb-4 leading-tight">
                Elite Rewards.
                <br />
                Exclusividade FRIK.
              </h2>
              <p className="text-body-lg text-on-secondary-container/80 mb-8">
                Troque seus pontos por experiências únicas e produtos de alta gama.
              </p>
              <button
                type="button"
                className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform"
              >
                Ver Promoções
              </button>
            </div>
          </div>
        </section>

        <section className="mb-section-gap">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-label-caps text-primary mb-2 uppercase">
                Gestão de benefícios
              </p>
              <h3 className="text-headline-md text-on-surface">Meus Cupons</h3>
            </div>
          </div>
          <div className="flex gap-gutter overflow-x-auto pb-8 scrollbar-hide">
            {meus.length === 0 ? (
              <div className="min-w-[340px] border-2 border-dashed border-outline-variant rounded-[2rem] flex flex-col items-center justify-center h-[220px] p-8 text-center">
                <p className="text-on-surface-variant">Faça login para ver seus cupons</p>
              </div>
            ) : (
              meus.map((c) => (
                <div
                  key={c.id}
                  className="min-w-[340px] bg-card-cream p-card-padding rounded-[2rem] premium-shadow hover-lift flex flex-col justify-between h-[220px]"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-surface-container-lowest rounded-xl flex items-center justify-center shadow-sm">
                      <span
                        className="material-symbols-outlined text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        confirmation_number
                      </span>
                    </div>
                    <span className="text-label-caps text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full uppercase">
                      {c.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-headline-sm text-on-surface">{c.titulo}</h4>
                    <p className="text-on-surface-variant/70 text-body-md">
                      Válido até {c.validade_ate}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                    <span className="text-label-caps tracking-widest text-primary">
                      {c.codigo}
                    </span>
                    <button type="button" className="text-primary font-bold text-sm">
                      OFERECER TROCA
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
            <div>
              <p className="text-label-caps text-primary mb-2 uppercase">
                Oportunidades de resgate
              </p>
              <h3 className="text-headline-md text-on-surface">
                Disponíveis para Troca
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="px-6 py-2 rounded-full bg-primary text-on-primary font-bold"
              >
                Tudo
              </button>
              <button
                type="button"
                className="px-6 py-2 rounded-full border border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container"
              >
                Gourmet
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {(mercado.length ? mercado : []).map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-low rounded-[2rem] overflow-hidden premium-shadow group"
              >
                <div className="relative h-48 bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-5xl opacity-40">
                    local_offer
                  </span>
                  <div className="absolute top-4 left-4">
                    <span className="text-label-caps bg-primary text-on-primary px-3 py-1 rounded-full uppercase">
                      {item.nivel_slug ?? "membro"}
                    </span>
                  </div>
                </div>
                <div className="p-card-padding">
                  <h5 className="text-headline-sm text-on-surface">{item.titulo}</h5>
                  <p className="text-on-surface-variant/70 text-body-md mb-6 mt-2">
                    De {item.proprietario_nome ?? "outro membro"} · {item.codigo}
                  </p>
                  <button
                    type="button"
                    className="w-full bg-secondary-container text-on-secondary-container py-3 rounded-xl font-bold group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors"
                  >
                    Solicitar Troca
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
