"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  ApiError,
  criarSala,
  detalheSala,
  entrarSala,
  excluirSala,
  getCuponsMembrosSala,
  getMeusCupons,
  getPropostasSala,
  listarMinhasSalas,
  proporTrocaSala,
  responderProposta,
  sairSala,
  Cupom,
} from "@/lib/api";

type SalaResumo = { id: number; nome: string; codigo_convite: string };
type SalaDetalhe = Awaited<ReturnType<typeof detalheSala>> & { criador_id?: number };

export function SalasPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [salas, setSalas] = useState<SalaResumo[]>([]);
  const [nomeNova, setNomeNova] = useState("");
  const [codigoEntrar, setCodigoEntrar] = useState("");
  const [loading, setLoading] = useState(true);
  const [salaAberta, setSalaAberta] = useState<SalaDetalhe | null>(null);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);
  const [meusCupons, setMeusCupons] = useState<Cupom[]>([]);
  const [cuponsMembros, setCuponsMembros] = useState<
    { id: number; titulo: string; codigo: string; proprietario_nome: string }[]
  >([]);
  const [propostas, setPropostas] = useState<
    { id: string; solicitante_nome: string; proprietario_nome: string; proprietario_id: number }[]
  >([]);
  const [cupomOfertado, setCupomOfertado] = useState<number | null>(null);
  const [cupomAlvo, setCupomAlvo] = useState<number | null>(null);

  function carregar() {
    listarMinhasSalas()
      .then(setSalas)
      .catch(() => setSalas([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function abrirSala(codigo: string) {
    setCarregandoDetalhe(true);
    try {
      const [detalhe, cupons, props, meus] = await Promise.all([
        detalheSala(codigo),
        getCuponsMembrosSala(codigo),
        getPropostasSala(codigo),
        getMeusCupons(),
      ]);
      setSalaAberta(detalhe);
      setCuponsMembros(cupons);
      setPropostas(props);
      setMeusCupons(meus.filter((c) => c.status === "disponivel"));
    } catch (e) {
      toast((e as ApiError).message, "error");
    } finally {
      setCarregandoDetalhe(false);
    }
  }

  async function handleCriar() {
    if (!nomeNova.trim()) return;
    try {
      const res = await criarSala(nomeNova.trim());
      toast(`Sala criada! Código: ${res.codigoConvite}`, "success");
      setNomeNova("");
      carregar();
    } catch (e) {
      toast((e as ApiError).message, "error");
    }
  }

  async function handleEntrar() {
    if (!codigoEntrar.trim()) return;
    const codigo = codigoEntrar.trim();
    try {
      const res = await entrarSala(codigo);
      toast("Você entrou na sala!", "success");
      setCodigoEntrar("");
      carregar();
      await abrirSala(res.codigoConvite ?? codigo);
    } catch (e) {
      toast((e as ApiError).message, "error");
    }
  }

  async function proporTroca() {
    if (!salaAberta || !cupomOfertado || !cupomAlvo) return;
    try {
      await proporTrocaSala(salaAberta.codigo_convite, cupomOfertado, cupomAlvo);
      toast("Proposta enviada!", "success");
      await abrirSala(salaAberta.codigo_convite);
    } catch (e) {
      toast((e as ApiError).message, "error");
    }
  }

  async function responder(id: number | string, aceitar: boolean) {
    try {
      // Remove a proposta localmente de imediato para feedback instantâneo
      setPropostas((prev) => prev.filter((p) => String(p.id) !== String(id)));
      await responderProposta(Number(id), aceitar);
      toast(aceitar ? "Troca aceita! ✅" : "Troca recusada.", aceitar ? "success" : "error");
      // Recarrega a sala para sincronizar com o backend
      if (salaAberta) await abrirSala(salaAberta.codigo_convite);
    } catch (e) {
      // Se falhou, recarrega para restaurar o estado correto
      toast((e as ApiError).message, "error");
      if (salaAberta) await abrirSala(salaAberta.codigo_convite);
    }
  }

  return (
    <AppShell searchPlaceholder="Buscar salas...">
      <div className="px-4 lg:px-[40px] pt-8 pb-24 max-w-2xl">
        <h1 className="text-[32px] font-semibold mb-2">Salas de troca</h1>
        <p className="text-on-surface-variant mb-8 text-sm">
          Disponível para níveis Platina e Diamante. Crie uma sala ou entre com o código de convite.
        </p>

        <section className="bg-card-cream rounded-2xl p-6 premium-shadow mb-6">
          <p className="frik-label text-primary mb-3">Criar sala</p>
          <div className="flex gap-2">
            <input
              placeholder="Nome da sala"
              value={nomeNova}
              onChange={(e) => setNomeNova(e.target.value)}
              className="flex-1 bg-surface-container-high rounded-xl px-4 py-3"
            />
            <button type="button" onClick={handleCriar} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold">
              Criar
            </button>
          </div>
        </section>

        <section className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30 mb-8">
          <p className="frik-label text-primary mb-3">Entrar com código</p>
          <div className="flex gap-2">
            <input
              placeholder="Código de convite"
              value={codigoEntrar}
              onChange={(e) => setCodigoEntrar(e.target.value.toUpperCase())}
              className="flex-1 bg-surface-container-high rounded-xl px-4 py-3 uppercase"
            />
            <button type="button" onClick={handleEntrar} className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-bold">
              Entrar
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Minhas salas</h2>
          {loading ? (
            <p className="text-on-surface-variant">Carregando...</p>
          ) : salas.length === 0 ? (
            <p className="text-on-surface-variant">Você ainda não participa de nenhuma sala.</p>
          ) : (
            <ul className="space-y-3">
              {salas.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => abrirSala(s.codigo_convite)}
                    className="w-full flex justify-between items-center p-4 bg-surface-container-high rounded-xl hover:ring-2 hover:ring-primary/40 transition-all text-left"
                  >
                    <div>
                      <p className="font-bold">{s.nome}</p>
                      <p className="text-xs text-primary font-mono mt-1">{s.codigo_convite}</p>
                    </div>
                    <span className="material-symbols-outlined text-primary">chevron_right</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {(salaAberta || carregandoDetalhe) && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40" onClick={() => !carregandoDetalhe && setSalaAberta(null)}>
          <aside
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md h-full bg-surface-container-low shadow-2xl p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {carregandoDetalhe ? (
              <p className="text-on-surface-variant py-12 text-center">Carregando sala...</p>
            ) : salaAberta ? (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold">{salaAberta.nome}</h2>
                    <p className="text-sm text-on-surface-variant mt-1">
                      Criada por {salaAberta.criador_nome}
                    </p>
                  </div>
                  <button type="button" onClick={() => setSalaAberta(null)} className="p-2 rounded-full hover:bg-surface-container-high">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Botões sair / excluir */}
                <div className="flex gap-2 mb-6">
                  {salaAberta.criador_id === user?.id ? (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm("Tem certeza que deseja excluir esta sala? Todos os membros serão removidos.")) return;
                        try {
                          await excluirSala(salaAberta.codigo_convite);
                          toast("Sala excluída.", "success");
                          setSalaAberta(null);
                          carregar();
                        } catch (e) {
                          toast((e as ApiError).message, "error");
                        }
                      }}
                      className="flex-1 py-2 rounded-xl text-sm font-bold border border-error text-error hover:bg-error/10"
                    >
                      🗑 Excluir sala
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm("Deseja sair desta sala?")) return;
                        try {
                          await sairSala(salaAberta.codigo_convite);
                          toast("Você saiu da sala.", "success");
                          setSalaAberta(null);
                          carregar();
                        } catch (e) {
                          toast((e as ApiError).message, "error");
                        }
                      }}
                      className="flex-1 py-2 rounded-xl text-sm font-bold border border-outline-variant hover:bg-surface-container-high"
                    >
                      Sair da sala
                    </button>
                  )}
                </div>

                <div className="bg-surface-container-high rounded-xl p-4 mb-6">
                  <p className="frik-label text-primary text-xs mb-1">Código de convite</p>
                  <p className="font-mono font-bold text-lg">{salaAberta.codigo_convite}</p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(salaAberta.codigo_convite);
                      toast("Código copiado!", "success");
                    }}
                    className="mt-2 text-sm font-bold text-primary"
                  >
                    Copiar código
                  </button>
                </div>

                <h3 className="font-semibold mb-3">
                  Membros ({salaAberta.totalMembros})
                </h3>
                <ul className="space-y-2 mb-6">
                  {salaAberta.membros.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 p-3 bg-card-cream rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-primary">
                        {m.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{m.nome}</p>
                        <p className="text-xs text-on-surface-variant">{m.nivel}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                {propostas.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Propostas pendentes</h3>
                    <ul className="space-y-2">
                      {propostas.map((p) => {
                        const amIProprietario = user?.id === p.proprietario_id;
                        return (
                          <li key={p.id} className="p-3 bg-surface-container-high rounded-xl text-sm">
                            <p>{p.solicitante_nome} → {p.proprietario_nome}</p>
                            <div className="flex gap-2 mt-2">
                              {amIProprietario ? (
                                <>
                                  <button type="button" onClick={() => responder(p.id, true)} className="text-xs font-bold text-primary">Aceitar</button>
                                  <button type="button" onClick={() => responder(p.id, false)} className="text-xs font-bold text-error">Recusar</button>
                                </>
                              ) : (
                                <span className="text-xs text-on-surface-variant font-medium">Aguardando resposta...</span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                <h3 className="font-semibold mb-3">Propor troca</h3>
                <div className="space-y-3 mb-4">
                  <select value={cupomOfertado ?? ""} onChange={(e) => setCupomOfertado(Number(e.target.value) || null)} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm">
                    <option value="">Seu cupom</option>
                    {meusCupons.map((c) => (
                      <option key={c.id} value={c.id}>{c.titulo} — {c.codigo}</option>
                    ))}
                  </select>
                  <select value={cupomAlvo ?? ""} onChange={(e) => setCupomAlvo(Number(e.target.value) || null)} className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm">
                    <option value="">Cupom do membro</option>
                    {cuponsMembros.map((c) => (
                      <option key={c.id} value={c.id}>{c.proprietario_nome}: {c.titulo}</option>
                    ))}
                  </select>
                  <button type="button" onClick={proporTroca} className="w-full bg-primary text-on-primary py-3 rounded-full font-bold text-sm">
                    Enviar proposta
                  </button>
                </div>
              </>
            ) : null}
          </aside>
        </div>
      )}
    </AppShell>
  );
}
