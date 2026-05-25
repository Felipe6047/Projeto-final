"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import {
  ApiError,
  criarPedidoPresente,
  getProdutos,
  presentearCupom,
} from "@/lib/api";

type Produto = {
  id: number;
  nome: string;
  descricao: string;
  preco_pontos: number;
};

export function PresentesPage() {
  const { refreshPerfil } = useAuth();
  const { toast } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<
    { produto: Produto; qtd: number }[]
  >([]);
  const [aba, setAba] = useState<"produto" | "cupom">("produto");
  const [enviando, setEnviando] = useState(false);

  const [destNome, setDestNome] = useState("");
  const [destEmail, setDestEmail] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    getProdutos().then(setProdutos).catch(() => []);
  }, []);

  const totalPts = carrinho.reduce(
    (s, i) => s + i.produto.preco_pontos * i.qtd,
    0
  );

  function toggleProduto(p: Produto) {
    setCarrinho((prev) => {
      const exists = prev.find((x) => x.produto.id === p.id);
      if (exists) return prev.filter((x) => x.produto.id !== p.id);
      return [...prev, { produto: p, qtd: 1 }];
    });
  }

  async function enviarPresenteProduto() {
    if (!destNome.trim()) {
      toast("Informe o nome do destinatário", "error");
      return;
    }
    if (carrinho.length === 0) {
      toast("Selecione ao menos um produto", "error");
      return;
    }
    setEnviando(true);
    try {
      await criarPedidoPresente({
        itens: carrinho.map((c) => ({
          produtoId: c.produto.id,
          quantidade: c.qtd,
        })),
        pontosUsados: totalPts,
        valorReais: 0,
        destinatario: { nome: destNome, email: destEmail || undefined },
        endereco: {
          cep: "00000000",
          logradouro: "A definir",
          numero: "S/N",
          bairro: "Centro",
          cidade: "São Paulo",
          uf: "SP",
        },
        mensagem: mensagem || undefined,
      });
      toast("Presente enviado com sucesso!", "success");
      setCarrinho([]);
      await refreshPerfil();
    } catch (e) {
      toast((e as ApiError).message, "error");
    } finally {
      setEnviando(false);
    }
  }

  async function enviarPresenteCupom(cupomId: number) {
    if (!destEmail.trim() && !destNome.trim()) {
      toast("Informe e-mail ou nome do destinatário", "error");
      return;
    }
    setEnviando(true);
    try {
      const res = await presentearCupom({
        cupomId,
        canal: "email",
        destinatarioNome: destNome,
        destinatarioEmail: destEmail,
        mensagem,
      });
      toast(`Presente criado! Código: ${res.codigoResgate}`, "success");
    } catch (e) {
      toast((e as ApiError).message, "error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AppShell searchPlaceholder="Buscar presentes...">
      <div className="px-4 lg:px-[40px] pt-6 pb-32">
        <div className="flex gap-4 mb-8 border-b border-outline-variant/30">
          <button
            type="button"
            onClick={() => setAba("produto")}
            className={`pb-3 font-bold ${aba === "produto" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant"}`}
          >
            Produto físico
          </button>
          <button
            type="button"
            onClick={() => setAba("cupom")}
            className={`pb-3 font-bold ${aba === "cupom" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant"}`}
          >
            Cupom (por ID)
          </button>
        </div>

        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <input
            placeholder="Nome do destinatário"
            value={destNome}
            onChange={(e) => setDestNome(e.target.value)}
            className="bg-surface-container-high rounded-xl px-4 py-3"
          />
          <input
            placeholder="E-mail do destinatário"
            type="email"
            value={destEmail}
            onChange={(e) => setDestEmail(e.target.value)}
            className="bg-surface-container-high rounded-xl px-4 py-3"
          />
          <textarea
            placeholder="Mensagem no cartão (opcional)"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            className="md:col-span-2 bg-surface-container-high rounded-xl px-4 py-3 min-h-[80px]"
          />
        </section>

        {aba === "produto" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {produtos.map((p) => {
                const selected = carrinho.some((c) => c.produto.id === p.id);
                return (
                  <div
                    key={p.id}
                    className={`bg-card-cream rounded-3xl overflow-hidden premium-shadow transition-all ${selected ? "ring-2 ring-primary" : ""}`}
                  >
                    <div className="h-48 bg-secondary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-6xl opacity-30">
                        card_giftcard
                      </span>
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl font-semibold">{p.nome}</h3>
                      <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">
                        {p.descricao}
                      </p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xl font-bold text-primary">
                          {p.preco_pontos.toLocaleString("pt-BR")} pts
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleProduto(p)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
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
            <footer className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 left-4 lg:left-[312px] bg-surface-container-lowest/95 backdrop-blur-xl p-6 rounded-3xl border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4 z-40">
              <div>
                <p className="frik-label text-on-surface-variant opacity-70">
                  Total do carrinho
                </p>
                <p className="text-2xl font-bold">
                  {totalPts.toLocaleString("pt-BR")}{" "}
                  <span className="text-primary">pts</span>
                </p>
              </div>
              <button
                type="button"
                disabled={enviando || carrinho.length === 0}
                onClick={enviarPresenteProduto}
                className="flex items-center gap-2 bg-primary text-on-primary px-10 py-4 rounded-full font-bold disabled:opacity-50"
              >
                {enviando ? "Enviando..." : "Enviar presente"}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </footer>
          </>
        ) : (
          <div className="max-w-md">
            <p className="text-on-surface-variant mb-4 text-sm">
              Informe o ID do cupom que deseja presentear (veja em Mercado de
              Cupons).
            </p>
            <input
              type="number"
              placeholder="ID do cupom"
              id="cupom-id"
              className="w-full bg-surface-container-high rounded-xl px-4 py-3 mb-4"
            />
            <button
              type="button"
              disabled={enviando}
              onClick={() => {
                const el = document.getElementById("cupom-id") as HTMLInputElement;
                const id = Number(el?.value);
                if (id) enviarPresenteCupom(id);
                else toast("Informe o ID do cupom", "error");
              }}
              className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold"
            >
              Enviar cupom de presente
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
