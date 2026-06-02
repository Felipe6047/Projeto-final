"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ModalTroca } from "@/components/modals/ModalTroca";
import { ModalPresenteCupom } from "@/components/modals/ModalPresenteCupom";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import {
  ApiError,
  Cupom,
  formatarStatus,
  getMeusCupons,
  getMercadoConfig,
  getMercadoCupons,
  oferecerCupom,
  presentearCupom,
  solicitarTroca,
} from "@/lib/api";

export function MercadoPage() {
  const { refreshPerfil } = useAuth();
  const { toast } = useToast();
  const [meus, setMeus] = useState<Cupom[]>([]);
  const [mercado, setMercado] = useState<Cupom[]>([]);
  const [taxa, setTaxa] = useState(50);
  const [trocaAlvo, setTrocaAlvo] = useState<Cupom | null>(null);
  const [presenteCupom, setPresenteCupom] = useState<Cupom | null>(null);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async (busca?: string) => {
    setLoading(true);
    try {
      const [m, c, cfg] = await Promise.all([
        getMeusCupons(),
        getMercadoCupons(busca ? { busca } : undefined),
        getMercadoConfig(),
      ]);
      setMeus(m);
      setMercado(c);
      setTaxa(cfg.taxaTrocaPontos);
    } catch (e) {
      const err = e as ApiError;
      toast(err.message ?? "Erro ao carregar mercado", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleOferecer(cupomId: number) {
    try {
      await oferecerCupom(cupomId);
      toast("Cupom publicado no mercado!", "success");
      await carregar();
    } catch (e) {
      toast((e as ApiError).message, "error");
    }
  }

  async function handleSolicitar(
    cupomOfertadoId: number,
    aceitarTaxa: boolean
  ) {
    if (!trocaAlvo) return;
    try {
      await solicitarTroca({
        cupomSolicitadoId: trocaAlvo.id,
        cupomOfertadoId,
        aceitarTaxa,
      });
      toast("Proposta de troca enviada!", "success");
      await carregar();
      await refreshPerfil();
    } catch (e) {
      toast((e as ApiError).message, "error");
      throw e;
    }
  }

  return (
    <AppShell
      searchPlaceholder="Buscar cupons e marcas..."
      onSearch={(v) => carregar(v || undefined)}
    >
      <div className="px-4 lg:px-[40px] pt-8 pb-20">
        <section className="mb-16">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-secondary-container min-h-[240px] flex items-center px-8">
            <div className="relative z-10 max-w-xl py-8">
              <span className="frik-label text-primary bg-primary/10 px-4 py-1 rounded-full inline-block mb-4">
                Oferta por tempo limitado
              </span>
              <h2 className="text-[48px] font-bold text-on-secondary-container leading-tight mb-4">
                Recompensas Elite
              </h2>
              <p className="text-lg text-on-secondary-container/80">
                Troque cupons com outros membros e maximize seus benefícios FRIK.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-8">
            <p className="frik-label text-primary mb-2">Gestão de benefícios</p>
            <h3 className="text-[32px] font-semibold">Meus cupons</h3>
          </div>
          {loading ? (
            <p className="text-on-surface-variant">Carregando...</p>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {meus.length === 0 ? (
                <div className="min-w-[300px] border-2 border-dashed border-outline-variant rounded-[2rem] p-8 text-center text-on-surface-variant">
                  Você ainda não tem cupons. Ganhe pontos em compras e missões.
                </div>
              ) : (
                meus.map((c) => (
                  <div
                    key={c.id}
                    className="min-w-[320px] bg-card-cream p-8 rounded-[2rem] premium-shadow hover-lift flex flex-col justify-between min-h-[220px]"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span
                        className="material-symbols-outlined text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        confirmation_number
                      </span>
                      <span className="frik-label bg-surface-container-high px-3 py-1 rounded-full text-on-surface-variant">
                        {formatarStatus(c.status)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold">{c.titulo}</h4>
                      <p className="text-sm text-on-surface-variant mt-1">
                        Válido até{" "}
                        {new Date(c.validade_ate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-outline-variant/30 flex flex-wrap justify-between items-center gap-2">
                      <span className="text-xs font-bold text-primary tracking-wider">
                        {c.codigo}
                      </span>
                      {c.status === "disponivel" && (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setPresenteCupom(c)}
                            className="text-sm font-bold text-on-surface-variant hover:text-primary"
                          >
                            Presentear
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOferecer(c.id)}
                            className="text-sm font-bold text-primary hover:underline"
                          >
                            Oferecer troca
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        <section>
          <div className="mb-8">
            <p className="frik-label text-primary mb-2">Oportunidades</p>
            <h3 className="text-[32px] font-semibold">Disponíveis para troca</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mercado.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-low rounded-[2rem] overflow-hidden premium-shadow"
              >
                <div className="h-40 bg-secondary-container flex items-center justify-center relative">
                  <span className="material-symbols-outlined text-primary text-5xl opacity-40">
                    local_offer
                  </span>
                  <span className="absolute top-3 left-3 frik-label bg-primary text-on-primary px-3 py-1 rounded-full">
                    {item.nivel_slug ?? "membro"}
                  </span>
                </div>
                <div className="p-8">
                  <h5 className="text-xl font-semibold">{item.titulo}</h5>
                  <p className="text-sm text-on-surface-variant mt-2 mb-4">
                    De {item.proprietario_nome ?? "outro membro"} · {item.codigo}
                  </p>
                  <button
                    type="button"
                    onClick={() => setTrocaAlvo(item)}
                    className="w-full bg-secondary-container text-on-secondary-container py-3 rounded-xl font-bold hover:bg-primary-container hover:text-on-primary-container transition-colors"
                  >
                    Solicitar troca
                  </button>
                </div>
              </div>
            ))}
            {!loading && mercado.length === 0 && (
              <p className="text-on-surface-variant col-span-full">
                Nenhum cupom no mercado no momento.
              </p>
            )}
          </div>
        </section>
      </div>

      {trocaAlvo && (
        <ModalTroca
          cupomAlvo={trocaAlvo}
          meusCupons={meus}
          taxaPontos={taxa}
          onClose={() => setTrocaAlvo(null)}
          onConfirm={handleSolicitar}
        />
      )}

      {presenteCupom && (
        <ModalPresenteCupom
          cupom={presenteCupom}
          onClose={() => setPresenteCupom(null)}
          onConfirm={async (data) => {
            try {
              const res = await presentearCupom({
                cupomId: presenteCupom.id,
                ...data,
              });
              toast(`Presente criado! Código: ${res.codigoResgate}`, "success");
              await carregar();
              await refreshPerfil();
            } catch (e) {
              toast((e as ApiError).message, "error");
              throw e;
            }
          }}
        />
      )}
    </AppShell>
  );
}
