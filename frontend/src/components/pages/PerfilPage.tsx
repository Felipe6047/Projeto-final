"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import {
  ApiError,
  getHistoricoPontos,
  getPerfil,
  listarCompras,
  PerfilResponse,
} from "@/lib/api";

interface HistoricoItem {
  id: string;
  valor: number;
  saldo_apos: number;
  tipo: string;
  descricao: string | null;
  criado_em: string;
}

const tipoLabel: Record<string, string> = {
  compra: "Compra",
  resgate: "Resgate",
  troca_taxa: "Taxa de troca",
  missao: "Missão",
  campanha: "Campanha",
  presente: "Presente",
  ajuste_admin: "Ajuste",
};

export function PerfilPage() {
  const { logout } = useAuth();
  const [perfil, setPerfil] = useState<PerfilResponse | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [compras, setCompras] = useState<
    { id: string; valor_total: string; pontos_gerados: number; criado_em: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([getPerfil(), getHistoricoPontos(), listarCompras(10)])
      .then(([p, h, c]) => {
        setPerfil(p);
        setHistorico(h);
        setCompras(c);
      })
      .catch((e: ApiError) => setErro(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="px-4 lg:px-[40px] py-20 text-on-surface-variant">
          Carregando perfil...
        </div>
      </AppShell>
    );
  }

  if (erro || !perfil) {
    return (
      <AppShell>
        <div className="px-4 lg:px-[40px] py-20">
          <p className="text-error">{erro || "Perfil não encontrado"}</p>
          <Link href="/login" className="text-primary font-bold mt-4 inline-block">
            Fazer login
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell searchPlaceholder="Buscar no perfil...">
      <div className="px-4 lg:px-[40px] pt-8 pb-24">
        <section className="mb-12 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="w-20 h-20 rounded-full border-4 border-primary-container bg-secondary-container flex items-center justify-center text-3xl font-bold text-primary">
            {perfil.nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-[32px] font-semibold">{perfil.nome}</h1>
            <p className="text-on-surface-variant">{perfil.email}</p>
            <p className="mt-2 text-primary font-bold">
              {perfil.nivel} · {perfil.pontos.toLocaleString("pt-BR")} pts
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="px-6 py-3 rounded-full border border-outline-variant font-semibold text-sm hover:bg-surface-container"
          >
            Sair
          </button>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-card-cream rounded-2xl p-6 premium-shadow">
            <p className="frik-label text-primary mb-4">Dados da conta</p>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">E-mail</dt>
                <dd className="font-medium text-right">{perfil.email}</dd>
              </div>
              {"telefone" in perfil && perfil.telefone && (
                <div className="flex justify-between gap-4">
                  <dt className="text-on-surface-variant">Telefone</dt>
                  <dd className="font-medium">{String(perfil.telefone)}</dd>
                </div>
              )}
              {"cpf" in perfil && perfil.cpf && (
                <div className="flex justify-between gap-4">
                  <dt className="text-on-surface-variant">CPF</dt>
                  <dd className="font-medium">{String(perfil.cpf)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">Nível</dt>
                <dd className="font-medium capitalize">{perfil.nivel}</dd>
              </div>
            </dl>
          </div>
          <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30">
            <p className="frik-label text-primary mb-4">Atalhos</p>
            <div className="flex flex-col gap-2">
              <Link
                href="/mercado-cupons"
                className="py-3 px-4 rounded-xl bg-surface-container-high hover:bg-primary-container/30 font-semibold text-sm"
              >
                Mercado de cupons
              </Link>
              <Link
                href="/presentes"
                className="py-3 px-4 rounded-xl bg-surface-container-high hover:bg-primary-container/30 font-semibold text-sm"
              >
                Enviar presentes
              </Link>
              <Link
                href="/ranking"
                className="py-3 px-4 rounded-xl bg-surface-container-high hover:bg-primary-container/30 font-semibold text-sm"
              >
                Ver ranking
              </Link>
              <Link
                href="/salas"
                className="py-3 px-4 rounded-xl bg-surface-container-high hover:bg-primary-container/30 font-semibold text-sm"
              >
                Salas de troca
              </Link>
            </div>
          </div>
        </section>

        {compras.length > 0 && (
          <section className="mb-12">
            <p className="frik-label text-primary mb-2">Compras</p>
            <h2 className="text-[28px] font-semibold mb-4">Últimas compras</h2>
            <ul className="space-y-2">
              {compras.map((c) => (
                <li
                  key={c.id}
                  className="flex justify-between p-4 bg-surface-container-high rounded-xl text-sm"
                >
                  <span>
                    R$ {Number(c.valor_total).toFixed(2)} ·{" "}
                    {new Date(c.criado_em).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="font-bold text-primary">
                    +{c.pontos_gerados} pts
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <p className="frik-label text-primary mb-2">Extrato</p>
          <h2 className="text-[28px] font-semibold mb-6">Histórico de pontos</h2>
          {historico.length === 0 ? (
            <p className="text-on-surface-variant">
              Nenhuma movimentação registrada ainda.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-outline-variant/30">
              <table className="w-full text-sm">
                <thead className="bg-surface-container-high text-left">
                  <tr>
                    <th className="px-4 py-3 font-bold">Data</th>
                    <th className="px-4 py-3 font-bold">Tipo</th>
                    <th className="px-4 py-3 font-bold">Descrição</th>
                    <th className="px-4 py-3 font-bold text-right">Valor</th>
                    <th className="px-4 py-3 font-bold text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((h) => (
                    <tr
                      key={h.id}
                      className="border-t border-outline-variant/20"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(h.criado_em).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        {tipoLabel[h.tipo] ?? h.tipo}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        {h.descricao ?? "—"}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-bold ${
                          h.valor >= 0 ? "text-primary" : "text-error"
                        }`}
                      >
                        {h.valor >= 0 ? "+" : ""}
                        {h.valor}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {h.saldo_apos.toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
