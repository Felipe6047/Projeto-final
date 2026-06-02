"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ModalPresenteCupom } from "@/components/modals/ModalPresenteCupom";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import {
  ApiError,
  criarPedidoPresente,
  Cupom,
  getMeusCupons,
  getProdutos,
  presentearCupom,
} from "@/lib/api";

type Produto = {
  id: number;
  nome: string;
  descricao: string;
  preco_reais: number | string;
  preco_pontos: number;
};

const ETAPAS = ["Produtos", "Pagamento", "Destinatário", "Resumo"] as const;

export function PresentesPage() {
  const { refreshPerfil, perfil } = useAuth();
  const { toast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [meusCupons, setMeusCupons] = useState<Cupom[]>([]);
  const [aba, setAba] = useState<"produto" | "cupom">("produto");
  const [etapa, setEtapa] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [cupomPresente, setCupomPresente] = useState<Cupom | null>(null);

  const [carrinho, setCarrinho] = useState<{ produto: Produto; qtd: number }[]>(
    []
  );
  const [pctPontos, setPctPontos] = useState(100);

  const [destNome, setDestNome] = useState("");
  const [destEmail, setDestEmail] = useState("");
  const [destTelefone, setDestTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("SP");
  const [mensagem, setMensagem] = useState("");
  const [embrulho, setEmbrulho] = useState(false);
  const [enviarSurpresa, setEnviarSurpresa] = useState(false);

  useEffect(() => {
    getProdutos()
      .then((list) =>
        setProdutos(
          list.map((p) => ({
            ...p,
            preco_reais: Number(p.preco_reais),
            preco_pontos: Number(p.preco_pontos),
          }))
        )
      )
      .catch(() => []);
    getMeusCupons()
      .then(setMeusCupons)
      .catch(() => []);
  }, []);

  const totalReais = useMemo(
    () =>
      carrinho.reduce(
        (s, i) => s + Number(i.produto.preco_reais) * i.qtd,
        0
      ),
    [carrinho]
  );
  const totalPts = useMemo(
    () =>
      carrinho.reduce((s, i) => s + i.produto.preco_pontos * i.qtd, 0),
    [carrinho]
  );
  const pontosUsados = Math.round((totalPts * pctPontos) / 100);
  const valorReais = Math.max(
    0,
    Math.round((totalReais * (100 - pctPontos)) / 100 * 100) / 100
  );

  const cuponsDisponiveis = meusCupons.filter((c) => c.status === "disponivel");
  const saldoPts = perfil?.pontos ?? 0;

  function toggleProduto(p: Produto) {
    setCarrinho((prev) => {
      const exists = prev.find((x) => x.produto.id === p.id);
      if (exists) return prev.filter((x) => x.produto.id !== p.id);
      return [...prev, { produto: p, qtd: 1 }];
    });
  }

  function avancar() {
    if (etapa === 0 && carrinho.length === 0) {
      toast("Selecione ao menos um produto", "error");
      return;
    }
    if (etapa === 1 && pontosUsados > saldoPts) {
      toast("Saldo de pontos insuficiente", "error");
      return;
    }
    if (etapa === 2 && !destNome.trim()) {
      toast("Informe o nome do destinatário", "error");
      return;
    }
    if (etapa === 2 && (!cep.trim() || !logradouro.trim())) {
      toast("Preencha o endereço de entrega", "error");
      return;
    }
    setEtapa((e) => Math.min(e + 1, ETAPAS.length - 1));
  }

  async function enviarPresenteProduto() {
    setEnviando(true);
    try {
      await criarPedidoPresente({
        itens: carrinho.map((c) => ({
          produtoId: c.produto.id,
          quantidade: c.qtd,
        })),
        pontosUsados,
        valorReais,
        destinatario: {
          nome: destNome,
          email: destEmail || undefined,
          telefone: destTelefone || undefined,
        },
        endereco: {
          cep: cep.replace(/\D/g, ""),
          logradouro,
          numero: numero || "S/N",
          bairro,
          cidade,
          uf,
        },
        mensagem: mensagem || undefined,
        embrulho,
        enviarSurpresa,
      });
      toast("Presente enviado com sucesso!", "success");
      setCarrinho([]);
      setEtapa(0);
      await refreshPerfil();
    } catch (e) {
      toast((e as ApiError).message, "error");
    } finally {
      setEnviando(false);
    }
  }

  async function handlePresenteCupom(
    cupomId: number,
    data: {
      canal: "email" | "whatsapp" | "sms" | "link";
      destinatarioNome?: string;
      destinatarioEmail?: string;
      destinatarioTelefone?: string;
      destinatarioCpf?: string;
      mensagem?: string;
    }
  ) {
    try {
      const res = await presentearCupom({ cupomId, ...data });
      toast(`Presente criado! Código: ${res.codigoResgate}`, "success");
      setMeusCupons((prev) =>
        prev.map((c) =>
          c.id === cupomId ? { ...c, status: "presenteado" } : c
        )
      );
      await refreshPerfil();
    } catch (e) {
      toast((e as ApiError).message, "error");
      throw e;
    }
  }

  return (
    <AppShell searchPlaceholder="Buscar presentes...">
      <div className="px-4 lg:px-[40px] pt-6 pb-32">
        <div className="flex gap-4 mb-8 border-b border-outline-variant/30">
          <button
            type="button"
            onClick={() => {
              setAba("produto");
              setEtapa(0);
            }}
            className={`pb-3 font-bold ${aba === "produto" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant"}`}
          >
            Produto físico
          </button>
          <button
            type="button"
            onClick={() => setAba("cupom")}
            className={`pb-3 font-bold ${aba === "cupom" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant"}`}
          >
            Cupom de presente
          </button>
        </div>

        {aba === "cupom" ? (
          <div>
            <p className="text-on-surface-variant mb-6 text-sm max-w-xl">
              Escolha um cupom disponível e personalize o cartão virtual antes de
              enviar.
            </p>
            {cuponsDisponiveis.length === 0 ? (
              <p className="text-on-surface-variant">
                Você não tem cupons disponíveis para presentear.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cuponsDisponiveis.map((c) => (
                  <div
                    key={c.id}
                    className="bg-card-cream rounded-3xl p-6 premium-shadow flex flex-col justify-between min-h-[200px]"
                  >
                    <div>
                      <h3 className="text-lg font-semibold">{c.titulo}</h3>
                      <p className="text-sm text-on-surface-variant mt-1">
                        {c.codigo}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCupomPresente(c)}
                      className="mt-4 w-full bg-primary text-on-primary py-3 rounded-full font-bold"
                    >
                      Presentear
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-8 flex-wrap">
              {ETAPAS.map((label, i) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full ${
                    i === etapa
                      ? "bg-primary text-on-primary"
                      : i < etapa
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  <span>{i + 1}</span>
                  {label}
                </div>
              ))}
            </div>

            {etapa === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {produtos.map((p) => {
                  const selected = carrinho.some((c) => c.produto.id === p.id);
                  return (
                    <div
                      key={p.id}
                      className={`bg-card-cream rounded-3xl overflow-hidden premium-shadow transition-all ${selected ? "ring-2 ring-primary" : ""}`}
                    >
                      <div className="h-40 bg-secondary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-5xl opacity-30">
                          card_giftcard
                        </span>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold">{p.nome}</h3>
                        <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">
                          {p.descricao}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                          <div className="text-sm">
                            <p className="font-bold text-primary">
                              {p.preco_pontos.toLocaleString("pt-BR")} pts
                            </p>
                            <p className="text-on-surface-variant">
                              ou R$ {Number(p.preco_reais).toFixed(2)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleProduto(p)}
                            className={`w-11 h-11 rounded-full flex items-center justify-center ${
                              selected
                                ? "bg-primary text-on-primary"
                                : "bg-primary-container text-on-primary-container"
                            }`}
                          >
                            <span className="material-symbols-outlined">
                              {selected ? "check" : "add"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {etapa === 1 && (
              <div className="max-w-lg bg-card-cream rounded-3xl p-8 premium-shadow">
                <p className="frik-label text-primary mb-2">Etapa 2</p>
                <h3 className="text-xl font-semibold mb-6">
                  Como deseja pagar?
                </h3>
                <p className="text-sm text-on-surface-variant mb-4">
                  Total: {totalPts.toLocaleString("pt-BR")} pts ou R${" "}
                  {totalReais.toFixed(2)}
                </p>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={pctPontos}
                  onChange={(e) => setPctPontos(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between mt-4 text-sm font-bold">
                  <span>{pontosUsados.toLocaleString("pt-BR")} pts</span>
                  <span>R$ {valorReais.toFixed(2)}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-2">
                  Seu saldo: {saldoPts.toLocaleString("pt-BR")} pts
                </p>
              </div>
            )}

            {etapa === 2 && (
              <div className="max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Nome do destinatário *"
                  value={destNome}
                  onChange={(e) => setDestNome(e.target.value)}
                  className="md:col-span-2 bg-surface-container-high rounded-xl px-4 py-3"
                />
                <input
                  placeholder="E-mail"
                  type="email"
                  value={destEmail}
                  onChange={(e) => setDestEmail(e.target.value)}
                  className="bg-surface-container-high rounded-xl px-4 py-3"
                />
                <input
                  placeholder="Telefone"
                  value={destTelefone}
                  onChange={(e) => setDestTelefone(e.target.value)}
                  className="bg-surface-container-high rounded-xl px-4 py-3"
                />
                <input
                  placeholder="CEP *"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  className="bg-surface-container-high rounded-xl px-4 py-3"
                />
                <input
                  placeholder="Logradouro *"
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  className="bg-surface-container-high rounded-xl px-4 py-3"
                />
                <input
                  placeholder="Número"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="bg-surface-container-high rounded-xl px-4 py-3"
                />
                <input
                  placeholder="Bairro *"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="bg-surface-container-high rounded-xl px-4 py-3"
                />
                <input
                  placeholder="Cidade *"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="bg-surface-container-high rounded-xl px-4 py-3"
                />
                <input
                  placeholder="UF"
                  maxLength={2}
                  value={uf}
                  onChange={(e) => setUf(e.target.value.toUpperCase())}
                  className="bg-surface-container-high rounded-xl px-4 py-3"
                />
              </div>
            )}

            {etapa === 3 && (
              <div className="max-w-lg bg-card-cream rounded-3xl p-8 premium-shadow space-y-4">
                <p className="frik-label text-primary">Resumo do pedido</p>
                <ul className="text-sm space-y-2">
                  {carrinho.map((c) => (
                    <li key={c.produto.id} className="flex justify-between">
                      <span>
                        {c.produto.nome} × {c.qtd}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm">
                  <strong>Para:</strong> {destNome}
                </p>
                <p className="text-sm">
                  <strong>Pagamento:</strong> {pontosUsados} pts + R${" "}
                  {valorReais.toFixed(2)}
                </p>
                <textarea
                  placeholder="Mensagem no cartão (opcional)"
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className="w-full bg-surface-container-high rounded-xl px-4 py-3 min-h-[72px]"
                />
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={embrulho}
                    onChange={(e) => setEmbrulho(e.target.checked)}
                  />
                  Embrulho para presente
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enviarSurpresa}
                    onChange={(e) => setEnviarSurpresa(e.target.checked)}
                  />
                  Enviar como surpresa
                </label>
              </div>
            )}

            <footer className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 left-4 lg:left-[312px] bg-surface-container-lowest/95 backdrop-blur-xl p-6 rounded-3xl border border-outline-variant/30 flex justify-between items-center gap-4 z-40">
              <button
                type="button"
                disabled={etapa === 0}
                onClick={() => setEtapa((e) => e - 1)}
                className="px-6 py-3 rounded-full border border-outline-variant font-semibold disabled:opacity-40"
              >
                Voltar
              </button>
              {etapa < ETAPAS.length - 1 ? (
                <button
                  type="button"
                  onClick={avancar}
                  className="flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-full font-bold"
                >
                  Continuar
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={enviando}
                  onClick={enviarPresenteProduto}
                  className="flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-full font-bold disabled:opacity-50"
                >
                  {enviando ? "Enviando..." : "Confirmar presente"}
                </button>
              )}
            </footer>
          </>
        )}
      </div>

      {cupomPresente && (
        <ModalPresenteCupom
          cupom={cupomPresente}
          onClose={() => setCupomPresente(null)}
          onConfirm={(data) =>
            handlePresenteCupom(cupomPresente.id, data)
          }
        />
      )}
    </AppShell>
  );
}
