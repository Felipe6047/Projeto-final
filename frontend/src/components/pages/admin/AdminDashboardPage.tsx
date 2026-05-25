"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  adminGetDashboard,
  adminGetSegmentacao,
  AdminDashboard,
} from "@/lib/api";

export function AdminDashboardPage() {
  const [dash, setDash] = useState<AdminDashboard | null>(null);
  const [segmentos, setSegmentos] = useState<
    {
      nivel: string;
      total_clientes: number;
      media_pontos: number;
    }[]
  >([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([adminGetDashboard(), adminGetSegmentacao()])
      .then(([d, s]) => {
        setDash(d);
        setSegmentos(s);
      })
      .catch(() =>
        setErro("Não foi possível carregar o painel. Verifique o backend e se você é admin.")
      );
  }, []);

  const cards = dash
    ? [
        { label: "Clientes ativos", value: dash.clientesAtivos, icon: "groups" },
        { label: "Trocas concluídas", value: dash.trocasConcluidas, icon: "swap_horiz" },
        { label: "Trocas pendentes", value: dash.trocasPendentes, icon: "pending" },
        {
          label: "Ticket médio",
          value: `R$ ${dash.ticketMedio.toFixed(2)}`,
          icon: "payments",
        },
        { label: "Cupons ativos", value: dash.cuponsAtivos, icon: "confirmation_number" },
        { label: "Pedidos pendentes", value: dash.pedidosPendentes, icon: "redeem" },
        { label: "Campanhas ativas", value: dash.campanhasAtivas, icon: "campaign" },
      ]
    : [];

  return (
    <AdminShell title="Painel gerencial" subtitle="Visão geral do programa FRIK">
      {erro && (
        <p className="text-error bg-error/10 border border-error/30 p-4 rounded-xl mb-6">
          {erro}
        </p>
      )}
      {!dash && !erro && (
        <p className="text-on-surface-variant">Carregando indicadores...</p>
      )}
      {dash && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
            {cards.map((c) => (
              <div
                key={c.label}
                className="bg-card-cream rounded-2xl p-6 premium-shadow border border-outline-variant/20"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="frik-label text-on-surface-variant">{c.label}</p>
                    <p className="text-stat-lg text-primary mt-2">{c.value}</p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-3xl">
                    {c.icon}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <section>
            <h2 className="text-headline-sm mb-4">Segmentação por nível</h2>
            <div className="overflow-x-auto rounded-2xl border border-outline-variant/30">
              <table className="w-full text-sm">
                <thead className="bg-surface-container">
                  <tr>
                    <th className="text-left p-4 frik-label">Nível</th>
                    <th className="text-right p-4 frik-label">Clientes</th>
                    <th className="text-right p-4 frik-label">Média de pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {segmentos.map((s) => (
                    <tr
                      key={s.nivel}
                      className="border-t border-outline-variant/20"
                    >
                      <td className="p-4 font-semibold">{s.nivel}</td>
                      <td className="p-4 text-right">{s.total_clientes}</td>
                      <td className="p-4 text-right">
                        {Math.round(Number(s.media_pontos)).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </AdminShell>
  );
}
