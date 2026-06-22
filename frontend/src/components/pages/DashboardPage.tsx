"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import {
  getCampanhasAtivas,
  getEventoAtivo,
  getMeuNivel,
  getMissoesAtivas,
  listarProdutos,
  getCuponsParaResgate,
  resgatarCupomComPontos,
  getMeusCupons,
  Cupom
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";

const CATEGORIAS = ["Todos", "Eletrônicos", "Moda", "Acessórios", "Bem-estar", "Gastronomia", "Games", "Entretenimento"];

export function DashboardPage() {
  const { perfil, refreshPerfil } = useAuth();
  const [nivel, setNivel] = useState<{
    nome: string;
    progresso_percentual: number;
    pontos: number;
  } | null>(null);
  const [evento, setEvento] = useState<{ titulo: string } | null>(null);
  const [campanhas, setCampanhas] = useState<{ titulo: string; descricao: string | null }[]>([]);
  const [missoes, setMissoes] = useState<
    {
      id: number;
      titulo: string;
      pontos_recompensa: number;
      meta_valor: number;
      progresso: number;
      concluida: number;
    }[]
  >([]);

  // Store States
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [produtos, setProdutos] = useState<Awaited<ReturnType<typeof listarProdutos>>["data"]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  
  // Coupons State
  const [templates, setTemplates] = useState<Awaited<ReturnType<typeof getCuponsParaResgate>>>([]);
  const [meusCupons, setMeusCupons] = useState<Cupom[]>([]);
  const { toast } = useToast();

  const carregarStore = useCallback(async (cat: string) => {
    setLoadingProdutos(true);
    try {
      const [prodRes, tempRes, meusRes] = await Promise.all([
        listarProdutos(1, 100, cat),
        getCuponsParaResgate(),
        getMeusCupons()
      ]);
      setProdutos(prodRes.data);
      if (cat === "Todos") {
        setTemplates(tempRes);
      }
      setMeusCupons(meusRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProdutos(false);
    }
  }, []);

  useEffect(() => {
    getMeuNivel().then(setNivel).catch(() => null);
    getEventoAtivo().then(setEvento).catch(() => null);
    getCampanhasAtivas().then(setCampanhas).catch(() => []);
    getMissoesAtivas().then(setMissoes).catch(() => []);
  }, [perfil]);

  useEffect(() => {
    carregarStore(categoriaAtiva);
  }, [categoriaAtiva, carregarStore]);

  const primeiroNome = perfil?.nome?.split(" ")[0] ?? "Membro";
  const [modalMissoesAberto, setModalMissoesAberto] = useState(false);
  const pontos = perfil?.pontos ?? nivel?.pontos ?? 0;

  // Lógica de Missões
  const missoesOrdenadas = [...missoes].sort((a, b) => {
    const pctA = (a.progresso / (a.meta_valor || 1));
    const pctB = (b.progresso / (b.meta_valor || 1));
    return pctB - pctA;
  });
  const missoesHero = missoesOrdenadas.slice(0, 2);
  async function handleResgatarCupom(templateId: number, custo: number) {
    if (pontos < custo) {
      toast("Pontos insuficientes", "error");
      return;
    }
    try {
      const res = await resgatarCupomComPontos(templateId);
      toast(`Cupom resgatado! Código: ${res.codigo}`, "success");
      await carregarStore(categoriaAtiva);
      await refreshPerfil();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  return (
    <AppShell>
      <div>
        {/* HERO BANNER */}
        <section className="relative w-full min-h-[400px] py-12 lg:py-16 bg-primary flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-90 z-0"></div>
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent z-0"></div>
          
          <div className="relative z-10 px-4 lg:px-[40px] w-full flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-on-primary max-w-xl">
              <span className="inline-block px-3 py-1 bg-on-primary/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-on-primary/30">
                Novidade
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                Olá, {primeiroNome}.<br/>Sua fidelidade vale prêmios!
              </h1>
              <p className="text-on-primary/80 text-lg mb-8">
                Acumule pontos em cada compra, suba de nível e troque por produtos exclusivos ou cupons de desconto.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-on-primary/10 backdrop-blur-sm rounded-2xl p-4 border border-on-primary/20 min-w-[140px] flex-1">
                  <p className="text-on-primary/60 text-sm font-medium">Seu Saldo</p>
                  <p className="text-2xl font-bold">{pontos.toLocaleString("pt-BR")} <span className="text-base font-normal">pts</span></p>
                </div>
                <div className="bg-on-primary/10 backdrop-blur-sm rounded-2xl p-4 border border-on-primary/20 min-w-[140px] flex-1">
                  <p className="text-on-primary/60 text-sm font-medium">Nível Atual</p>
                  <p className="text-2xl font-bold">{nivel?.nome ?? perfil?.nivel ?? "Bronze"}</p>
                </div>
              </div>
            </div>
            
            {/* Quick Missions Widget in Hero */}
            <div className="w-full lg:w-[350px] bg-on-primary/10 backdrop-blur-md border border-on-primary/20 rounded-[2rem] p-6 text-on-primary shadow-2xl">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-warning">star</span> 
                Missões Rápidas
              </h3>
              <div className="space-y-4">
                {missoesHero.map(m => {
                  const meta = m.meta_valor || 1;
                  const pct = Math.min(100, Math.round((m.progresso / meta) * 100));
                  return (
                    <div key={m.id} className="bg-black/20 rounded-xl p-4 border border-on-primary/10 relative">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold truncate pr-2">{m.titulo}</span>
                        <span className="text-warning font-bold">+{m.pontos_recompensa}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-on-primary/60 mb-1">
                        <span>Progresso</span>
                        <span>{m.progresso} / {m.meta_valor}</span>
                      </div>
                      <div className="w-full h-1.5 bg-on-primary/10 rounded-full overflow-hidden">
                        <div className="h-full bg-warning rounded-full transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
                {missoes.length === 0 && <p className="text-sm text-on-primary/60">Nenhuma missão no momento.</p>}
                {missoes.length > 2 && (
                  <button 
                    onClick={() => setModalMissoesAberto(true)}
                    className="w-full py-2.5 mt-2 bg-on-primary/10 hover:bg-on-primary/20 rounded-xl text-sm font-bold transition-colors border border-on-primary/20"
                  >
                    Ver todas ({missoes.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ALERTS (Campaigns/Events) */}
        {(evento || campanhas.length > 0) && (
          <div className="px-4 lg:px-[40px] mt-8 mb-4 space-y-2 max-w-7xl mx-auto">
            {evento && (
              <div className="px-4 py-3 rounded-xl bg-primary-container/20 border border-primary-container/40 text-sm">
                <strong className="text-primary">{evento.titulo}</strong>
                <span className="text-on-surface-variant"> — confira as recompensas especiais!</span>
              </div>
            )}
            {campanhas.map((c) => (
              <div key={c.titulo} className="px-4 py-3 rounded-xl bg-secondary-container/30 border border-outline-variant/30 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">campaign</span>
                <strong className="text-primary">{c.titulo}</strong>
                {c.descricao && <span className="text-on-surface-variant"> — {c.descricao}</span>}
              </div>
            ))}
          </div>
        )}

        <div className="px-4 lg:px-[40px] max-w-7xl mx-auto mt-12">
          
          {/* CATEGORIES */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {CATEGORIAS.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`px-6 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                  categoriaAtiva === cat 
                    ? 'bg-primary text-on-primary shadow-md scale-105' 
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* STOREFRONT: PRODUTOS FÍSICOS */}
          <section className="mb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-[32px] font-bold text-on-surface">Vitrine de Produtos</h2>
                <p className="text-on-surface-variant text-lg">Adquira os melhores itens ou use seu cashback.</p>
              </div>
              <Link href="/salas" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1F2937] text-white rounded-full font-bold shadow-md hover:scale-105 transition-transform whitespace-nowrap">
                <span className="material-symbols-outlined text-[18px] text-[#FBBF24]">swap_horiz</span>
                Acessar Feirão de Trocas
              </Link>
            </div>

            {loadingProdutos ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-surface-container-low rounded-[1.5rem] sm:rounded-[2rem] p-4 h-[250px] sm:h-[350px] animate-pulse"></div>
                ))}
              </div>
            ) : produtos.length === 0 ? (
              <div className="text-center py-12 bg-surface-container-low rounded-3xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">inventory_2</span>
                <p className="text-on-surface-variant font-medium">Nenhum produto encontrado nesta categoria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
                {produtos.map(p => (
                  <div key={p.id} className="group bg-card-cream rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-4 premium-shadow flex flex-col hover:-translate-y-2 transition-transform duration-300">
                    <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 bg-white">
                      {p.imagem_url ? (
                        <Image src={p.imagem_url} alt={p.nome} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-variant text-on-surface-variant text-xs sm:text-base">
                          Sem Imagem
                        </div>
                      )}
                      {p.categoria && (
                        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/90 backdrop-blur-sm text-on-surface text-[8px] sm:text-[10px] font-bold px-2 sm:px-3 py-1 rounded-full uppercase shadow-sm">
                          {p.categoria}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-bold text-xs sm:text-base leading-tight mb-1 line-clamp-2">{p.nome}</h3>
                      <p className="text-[10px] sm:text-sm text-on-surface-variant line-clamp-2 mb-2 sm:mb-4 flex-1">{p.descricao}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-primary font-black text-sm sm:text-xl">R$ {Number(p.preco_reais).toFixed(2)}</span>
                        </div>
                        <Link
                          href={`/presentes?produto=${p.id}`}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors flex-shrink-0"
                          title="Adicionar ao Carrinho"
                        >
                          <span className="material-symbols-outlined text-base sm:text-[20px]">shopping_cart</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* STOREFRONT: CUPONS OFICIAIS */}
          {categoriaAtiva === "Todos" && templates.length > 0 && (
            <section className="mb-16">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-[32px] font-bold text-on-surface">Cupons de Desconto</h2>
                  <p className="text-on-surface-variant text-lg">Compre vouchers oficiais com seus pontos.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {templates.map(t => {
                  const qtdComprada = meusCupons.filter(m => m.template_id === t.id).length;
                  const limiteUsuario = t.limite_por_usuario != null && qtdComprada >= t.limite_por_usuario;
                  const esgotado = t.limite_total != null && Number(t.qtd_vendida) >= t.limite_total;
                  const disable = limiteUsuario || esgotado;
                  let label = `Resgatar por ${t.preco_pontos} pts`;
                  if (limiteUsuario) label = "Seu limite atingido";
                  else if (esgotado) label = "Esgotado";

                  return (
                    <div key={t.id} className={`bg-surface-container rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 border flex flex-col transition-all ${disable ? 'border-outline-variant/30 opacity-70' : 'border-outline-variant/50 hover:border-primary/50 premium-shadow'}`}>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="w-full sm:w-20 h-20 sm:h-20 rounded-xl bg-surface-variant shrink-0 overflow-hidden relative border border-outline-variant/20">
                          <span className="material-symbols-outlined w-full h-full flex items-center justify-center text-3xl opacity-50">local_offer</span>
                        </div>
                        <div className="flex-1">
                          <span className="inline-block px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-bold bg-secondary-container text-on-secondary-container uppercase mb-1">
                            {t.categoria || 'Geral'}
                          </span>
                          <h4 className="font-bold text-sm sm:text-lg leading-tight mb-1 line-clamp-2">{t.titulo}</h4>
                          <p className="text-[10px] sm:text-xs text-on-surface-variant line-clamp-2">{t.descricao}</p>
                        </div>
                      </div>
                      <div className="mt-auto pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
                        {t.limite_por_usuario !== null && (
                          <p className="text-[10px] sm:text-[11px] font-bold text-secondary text-right">
                            Limite: {qtdComprada}/{t.limite_por_usuario} por usuário
                          </p>
                        )}
                        <button
                          onClick={() => handleResgatarCupom(t.id, t.preco_pontos)}
                          disabled={disable}
                          className="w-full py-2 sm:py-3 text-xs sm:text-base rounded-xl font-bold bg-primary text-on-primary hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {label}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      </div>

      {/* MODAL DE MISSÕES COMPLETAS */}
      {modalMissoesAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalMissoesAberto(false)}></div>
          <div className="bg-background border border-outline-variant w-full max-w-md max-h-[85vh] rounded-[2rem] shadow-2xl relative flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-outline-variant/30 shrink-0">
              <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-warning">star</span>
                Todas as Missões
              </h2>
              <button onClick={() => setModalMissoesAberto(false)} className="text-on-surface-variant hover:text-primary transition-colors p-2 bg-surface-container rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4 scrollbar-thin scrollbar-thumb-outline-variant scrollbar-track-transparent">
              {missoesOrdenadas.map(m => {
                const meta = m.meta_valor || 1;
                const pct = Math.min(100, Math.round((m.progresso / meta) * 100));
                const isCompleta = m.progresso >= meta;
                
                return (
                  <div key={m.id} className={`rounded-xl p-5 border relative overflow-hidden ${isCompleta ? 'bg-primary-container/20 border-primary/30' : 'bg-surface-container border-outline-variant/30'}`}>
                    {isCompleta && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-[100px] flex items-start justify-end p-2 pointer-events-none">
                        <span className="material-symbols-outlined text-primary text-xl" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base mb-2">
                      <span className="font-bold text-on-surface pr-8">{m.titulo}</span>
                    </div>
                    
                    <div className="flex justify-between text-[11px] text-on-surface-variant font-medium mb-2">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">military_tech</span>
                        Recompensa: <strong className="text-primary">+{m.pontos_recompensa} pts</strong>
                      </span>
                      <span>{m.progresso} / {m.meta_valor}</span>
                    </div>
                    
                    <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${isCompleta ? 'bg-primary' : 'bg-warning'}`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {missoesOrdenadas.length === 0 && (
                <div className="text-center py-8 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
                  <p>Nenhuma missão no momento.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-outline-variant/30 shrink-0">
              <button 
                onClick={() => setModalMissoesAberto(false)}
                className="w-full py-3 bg-surface-container-highest hover:bg-surface-container text-on-surface font-bold rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
