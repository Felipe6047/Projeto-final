"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getProdutos } from "@/lib/api";

export function PresentesPage() {
  const [produtos, setProdutos] = useState<
    {
      id: number;
      nome: string;
      descricao: string;
      preco_pontos: number;
    }[]
  >([]);

  useEffect(() => {
    getProdutos().then(setProdutos).catch(() => []);
  }, []);

  return (
    <AppShell searchPlaceholder="Buscar presentes...">
      <div className="min-h-screen flex flex-col">
        <section className="px-4 lg:px-container-padding pt-8 pb-6">
          <div className="flex items-center gap-8 lg:gap-12 border-b border-outline-variant/30 pb-4 overflow-x-auto">
            {["SELEÇÃO", "DESTINATÁRIO", "CONFIRMAÇÃO"].map((step, i) => (
              <div
                key={step}
                className={`flex items-center gap-3 whitespace-nowrap pb-4 -mb-[18px] ${
                  i === 0
                    ? "border-b-2 border-primary opacity-100"
                    : "opacity-40"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    i === 0
                      ? "bg-primary text-on-primary"
                      : "bg-on-surface-variant text-surface-container-lowest"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`text-label-caps uppercase ${
                    i === 0 ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 lg:px-container-padding mb-10 overflow-x-auto scrollbar-hide flex gap-4">
          {["TODOS", "ACESSÓRIOS", "EXPERIÊNCIAS", "TECNOLOGIA"].map((cat, i) => (
            <button
              key={cat}
              type="button"
              className={`px-8 py-3 rounded-full text-label-caps whitespace-nowrap uppercase transition-all ${
                i === 0
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-secondary-container"
              }`}
            >
              {cat}
            </button>
          ))}
        </section>

        <section className="px-4 lg:px-container-padding grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter pb-40">
          {produtos.map((p) => (
            <div
              key={p.id}
              className="group bg-card-cream rounded-3xl overflow-hidden premium-shadow hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-64 overflow-hidden bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-6xl opacity-30">
                  card_giftcard
                </span>
                <span className="absolute top-4 left-4 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full text-label-caps text-[10px] text-primary uppercase">
                  Premium
                </span>
              </div>
              <div className="p-card-padding">
                <h3 className="text-headline-sm text-on-surface mb-2">{p.nome}</h3>
                <p className="text-body-md text-on-surface-variant mb-6 line-clamp-2">
                  {p.descricao}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-headline-sm text-primary">
                    {p.preco_pontos.toLocaleString("pt-BR")} pts
                  </span>
                  <button
                    type="button"
                    className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:scale-110 transition-transform shadow-md"
                  >
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <footer className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 left-4 lg:left-[312px] bg-surface-container-lowest/80 dark:bg-surface-container/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4 z-40">
          <div>
            <p className="text-label-caps text-on-surface-variant opacity-60 uppercase">
              Total do carrinho
            </p>
            <p className="text-headline-md text-on-surface">
              0 <span className="text-primary">pts</span>
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-4 bg-primary text-on-primary px-10 py-4 rounded-full text-label-caps uppercase hover:opacity-90 shadow-xl w-full sm:w-auto justify-center"
          >
            Prosseguir
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </footer>
      </div>
    </AppShell>
  );
}
