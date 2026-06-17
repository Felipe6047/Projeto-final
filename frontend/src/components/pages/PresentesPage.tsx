"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import {
  ApiError,
  avancarStatusPedido,
  buscarUsuarios,
  confirmarPagamentoPedido,
  getMeusAmigos,
  listarPedidosPresente,
  criarPedidoPresente,
  getPerfil,
  listarProdutos,
  listarMeusEnderecos,
  getEnderecoAmigo,
  getMeusCupons,
  Cupom,
  CartaoCredito,
  listarMeusCartoes,
} from "@/lib/api";
import { buscarCep } from "@/lib/viacep";
import { mascaraCep } from "@/lib/validators";

type Produto = {
  id: number;
  nome: string;
  descricao: string | null;
  preco_reais: number | string;
  preco_pontos: number;
  estoque: number;
  imagem_url?: string | null;
};

const ETAPAS = ["Produtos", "Carrinho", "Destinatário", "Pagamento", "Resumo"] as const;


export function PresentesPage() {
  const { refreshPerfil, perfil } = useAuth();
  const { toast } = useToast();
  
  const [abaAtiva, setAbaAtiva] = useState<"loja" | "pedidos">("loja");

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [etapa, setEtapa] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [formaPagamentoProduto, setFormaPagamentoProduto] = useState<"cartao" | "pix" | "wallet">("cartao");
  const [pedidos, setPedidos] = useState<
    { id: string; destinatario_nome: string; status: string; valor_reais: string; criado_em?: string }[]
  >([]);
  const [amigos, setAmigos] = useState<
    { id: number; nome: string; nivel: string; tem_endereco: number }[]
  >([]);

  const [carrinho, setCarrinho] = useState<{ produto: Produto; qtd: number }[]>([]);

  const [tipoDest, setTipoDest] = useState<"pessoal" | "presente">("pessoal");
  const [destUsuarioId, setDestUsuarioId] = useState<number | undefined>();
  const [walletUsado, setWalletUsado] = useState(0);
  const [meusCupons, setMeusCupons] = useState<Cupom[]>([]);
  const [cupomSelecionadoId, setCupomSelecionadoId] = useState<string>("");
  const [buscaDest, setBuscaDest] = useState("");
  const [sugestoes, setSugestoes] = useState<
    { id: number; nome: string; email: string; nivel: string }[]
  >([]);

  const [destNome, setDestNome] = useState("");
  const [destEmail, setDestEmail] = useState("");
  const [destTelefone, setDestTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("SP");
  const [mensagem, setMensagem] = useState("");
  
  const [freteCalc, setFreteCalc] = useState<number>(0);
  const [loadingFrete, setLoadingFrete] = useState(false);
  
  // Cartao mock
  const [numCartao, setNumCartao] = useState("");
  const [nomeCartao, setNomeCartao] = useState("");
  const [validadeCartao, setValidadeCartao] = useState("");
  const [cvvCartao, setCvvCartao] = useState("");
  const [cartoesSalvos, setCartoesSalvos] = useState<CartaoCredito[]>([]);
  const [cartaoSalvoSelecionadoId, setCartaoSalvoSelecionadoId] = useState<number | "">("");

  const [pixModal, setPixModal] = useState<{
    pedidoId: number;
    valorPix: number;
  } | null>(null);
  const [sucessoModal, setSucessoModal] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingProdutos) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingProdutos, hasMore]);

  const carregarProdutos = useCallback(async (pageNum: number) => {
    setLoadingProdutos(true);
    try {
      const res = await listarProdutos(pageNum, 6);
      const mapped = res.data.map((p) => ({
        ...p,
        preco_reais: Number(p.preco_reais),
        preco_pontos: Number(p.preco_pontos),
      }));
      setProdutos(prev => pageNum === 1 ? mapped : [...prev, ...mapped]);
      setHasMore(pageNum < res.totalPages);
    } catch {
      // ignore
    } finally {
      setLoadingProdutos(false);
    }
  }, []);

  useEffect(() => {
    carregarProdutos(page);
  }, [page, carregarProdutos]);

  useEffect(() => {
    listarPedidosPresente().then(setPedidos).catch(() => []);
    getMeusAmigos().then(setAmigos).catch(() => []);
    getMeusCupons().then(setMeusCupons).catch(() => []);
    listarMeusCartoes().then(setCartoesSalvos).catch(() => []);
    getPerfil()
      .then((p) => {
        if (tipoDest === "pessoal") preencherPessoal(p);
      })
      .catch(() => null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function preencherPessoal(p: Awaited<ReturnType<typeof getPerfil>>) {
    setDestNome(p.nome);
    setDestEmail(p.email);
    setDestTelefone(p.telefone ?? "");
    setDestUsuarioId(p.id);
    const ends = await listarMeusEnderecos().catch(() => []);
    const principal = ends.find((e) => e.principal) || ends[0];
    if (principal) {
      setCep(principal.cep);
      setLogradouro(principal.logradouro);
      setNumero(principal.numero);
      setBairro(principal.bairro);
      setCidade(principal.cidade);
      setUf(principal.uf);
    } else {
      setCep("");
      setLogradouro("");
      setNumero("");
      setBairro("");
      setCidade("");
      setUf("SP");
    }
  }

  async function carregarEnderecoAmigo(amigoId: number) {
    try {
      const end = await getEnderecoAmigo(amigoId);
      if (end) {
        setCep(end.cep);
        setLogradouro(end.logradouro);
        setNumero(end.numero);
        setBairro(end.bairro);
        setCidade(end.cidade);
        setUf(end.uf);
        toast("Endereço do amigo preenchido!", "success");
      } else {
        toast("Este amigo não possui endereço salvo.", "error");
        setCep("");
        setLogradouro("");
        setNumero("");
        setBairro("");
        setCidade("");
        setUf("SP");
      }
    } catch {
      toast("Falha ao buscar endereço do amigo", "error");
    }
  }

  useEffect(() => {
    if (buscaDest.length < 2) {
      setSugestoes([]);
      return;
    }
    const t = setTimeout(() => {
      buscarUsuarios(buscaDest).then(setSugestoes).catch(() => setSugestoes([]));
    }, 300);
    return () => clearTimeout(t);
  }, [buscaDest]);

  useEffect(() => {
    const limpo = cep.replace(/\D/g, "");
    if (limpo.length !== 8) return;
    setCepLoading(true);
    buscarCep(limpo)
      .then((data) => {
        if (data) {
          setLogradouro(data.logradouro);
          setBairro(data.bairro);
          setCidade(data.localidade);
          setUf(data.uf);
        } else {
          toast("CEP não encontrado — preencha manualmente", "error");
        }
      })
      .catch(() => toast("Falha ao buscar CEP", "error"))
      .finally(() => setCepLoading(false));
  }, [cep, toast]);

  const produtosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return produtos;
    return produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        (p.descricao && p.descricao.toLowerCase().includes(q))
    );
  }, [produtos, busca]);

  const totalReais = useMemo(
    () => carrinho.reduce((s, i) => s + Number(i.produto.preco_reais) * i.qtd, 0),
    [carrinho]
  );
  
  const cupomObj = meusCupons.find(c => String(c.id) === cupomSelecionadoId);
  const isFreteGratis = cupomObj?.categoria?.toLowerCase().includes("frete");
  
  const descontoPercent = (cupomObj && !isFreteGratis) ? (cupomObj.desconto_percentual || 10) : 0;
  const descontoCupomValor = Math.round((totalReais * descontoPercent) / 100);
  const freteBase = (totalReais > 0 && !isFreteGratis) ? freteCalc : 0;
  
  const subtotalReais = Math.max(0, totalReais - descontoCupomValor);
  const saldoWallet = perfil?.saldo_wallet ? Number(perfil.saldo_wallet) : 0;
  
  // Se escolheu Carteira Digital, tenta abater 100%
  const walletDisponivelParaUso = formaPagamentoProduto === "wallet" 
    ? Math.min(saldoWallet, subtotalReais + freteBase)
    : Math.min(walletUsado, Math.min(saldoWallet, subtotalReais + freteBase));
    
  const carteiraAplicada = walletDisponivelParaUso;
  const restanteReais = Math.max(0, subtotalReais + freteBase - carteiraAplicada);
  
  const valorPix = formaPagamentoProduto === "pix" ? restanteReais : 0;

  const saldoPts = perfil?.pontos ?? 0;

  function adicionarAoCarrinho(p: Produto) {
    setCarrinho((prev) => {
      const exists = prev.find((x) => x.produto.id === p.id);
      if (exists) {
        return prev.map(x => x.produto.id === p.id ? { ...x, qtd: x.qtd + 1 } : x);
      }
      return [...prev, { produto: p, qtd: 1 }];
    });
    toast(`${p.nome} adicionado ao carrinho!`, "success");
  }

  function alterarQtd(id: number, delta: number) {
    setCarrinho((prev) => {
      return prev.map(c => {
        if (c.produto.id === id) {
          const newQtd = c.qtd + delta;
          return newQtd > 0 ? { ...c, qtd: newQtd } : c;
        }
        return c;
      });
    });
  }

  function removerDoCarrinho(id: number) {
    setCarrinho(prev => prev.filter(c => c.produto.id !== id));
  }

  async function avancar() {
    if (etapa === 0) { // Produtos -> Carrinho
      if (carrinho.length === 0) {
        toast("Selecione ao menos um produto", "error");
        return;
      }
    }
    if (etapa === 1) { // Carrinho -> Destinatário
       const p = await getPerfil();
       if (tipoDest === "pessoal") preencherPessoal(p);
    }
    if (etapa === 2) { // Destinatário -> Pagamento
      if (!destNome.trim()) {
        toast("Informe o destinatário", "error");
        return;
      }
      if (!cep.trim() || !logradouro.trim()) {
        toast("Preencha o endereço de entrega", "error");
        return;
      }
      calcularFreteOSRM(cidade, uf, logradouro);
    }
    if (etapa === 3) { // Pagamento -> Resumo
      if (formaPagamentoProduto === "wallet" && saldoWallet < subtotalReais + freteBase) {
        toast("Saldo de Cashback insuficiente para pagar o pedido completo.", "error");
        return;
      }
      if (formaPagamentoProduto === "cartao" && restanteReais > 0) {
        if (!numCartao || !nomeCartao || !validadeCartao || !cvvCartao) {
          toast("Preencha todos os campos do cartão.", "error");
          return;
        }
      }
      setEtapa(4);
      return;
    }
    
    setEtapa((e) => Math.min(e + 1, ETAPAS.length - 1));
  }

  async function enviarPresenteProduto() {
    setEnviando(true);
    try {
      const res = await criarPedidoPresente({
        itens: carrinho.map((c) => ({
          produtoId: c.produto.id,
          quantidade: c.qtd,
        })),
        pontosUsados: 0,
        valorReais: restanteReais,
        walletUsado: carteiraAplicada,
        valorPix,
        destinatario: {
          nome: destNome,
          email: destEmail || undefined,
          telefone: destTelefone || undefined,
          usuarioId: destUsuarioId,
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
        isPessoal: tipoDest === "pessoal",
      });

      if (res.aguardaPix && res.valorPix) {
        setPixModal({ pedidoId: res.pedidoId, valorPix: res.valorPix });
      } else {
        setSucessoModal(true);
      }
      setCarrinho([]);
      setEtapa(0);
      await refreshPerfil();
    } catch (err) {
      toast((err as ApiError).message, "error");
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarPix() {
    if (!pixModal) return;
    setEnviando(true);
    try {
      await confirmarPagamentoPedido(String(pixModal.pedidoId));
      setPixModal(null);
      setSucessoModal(true);
      toast("Pagamento confirmado!", "success");
    } catch (err) {
      toast((err as ApiError).message, "error");
    } finally {
      setEnviando(false);
    }
  }

  async function calcularFreteOSRM(cidadeDest: string, ufDest: string, logDest: string) {
    if (totalReais === 0) return;
    setLoadingFrete(true);
    try {
      const q = encodeURIComponent(`${logDest}, ${cidadeDest}, ${ufDest}, Brasil`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
        headers: {
          "User-Agent": "FrikApp/1.0 (admin@frik.com)",
        }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const destLat = data[0].lat;
        const destLon = data[0].lon;
        const origLat = "-23.5505"; // Mock: SP
        const origLon = "-46.6333";
        const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${origLon},${origLat};${destLon},${destLat}?overview=false`);
        const osrmData = await osrmRes.json();
        if (osrmData.routes && osrmData.routes.length > 0) {
          const distKm = osrmData.routes[0].distance / 1000;
          setFreteCalc(Math.max(5, Math.round(distKm * 2 * 100) / 100)); // R$ 2/km, min R$ 5
          return;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFrete(false);
    }
    setFreteCalc(15); // Fallback caso a API falhe
  }

  return (
    <AppShell searchPlaceholder="Buscar produtos...">
      <div className="px-4 lg:px-[40px] pt-6 pb-48 max-w-5xl mx-auto">
        <h1 className="text-[32px] font-bold mb-1">Loja &amp; Carrinho</h1>
        <p className="text-on-surface-variant mb-6 text-sm">Compre para você ou envie como presente. Acompanhe suas entregas.</p>

        <div className="flex flex-col sm:flex-row gap-2 mb-8">
          <button
            type="button"
            onClick={() => setAbaAtiva("loja")}
            className={`px-6 py-3 rounded-full font-bold text-sm ${abaAtiva === "loja" ? "bg-primary text-on-primary" : "bg-surface-container-high"}`}
          >
            🛒 Comprar Produtos
          </button>
          <button
            type="button"
            onClick={() => { setAbaAtiva("pedidos"); listarPedidosPresente().then(setPedidos); }}
            className={`px-6 py-3 rounded-full font-bold text-sm ${abaAtiva === "pedidos" ? "bg-primary text-on-primary" : "bg-surface-container-high"}`}
          >
            📦 Acompanhamento de Entrega
          </button>
        </div>

        {abaAtiva === "pedidos" && (
          <section className="bg-card-cream rounded-2xl p-6 premium-shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              Meus Pedidos
            </h2>
            {pedidos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-5xl text-outline mb-3">package_2</span>
                <p className="font-bold">Nenhum pedido ainda</p>
                <p className="text-sm text-on-surface-variant">Comece comprando na loja!</p>
                <button type="button" onClick={() => setAbaAtiva("loja")} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-full font-bold text-sm">Ir para Loja</button>
              </div>
            ) : (
              <ul className="space-y-3">
                {pedidos.map((p) => {
                  const statusInfo: Record<string, {icon: string, color: string, label: string}> = {
                    pendente: { icon: "schedule", color: "text-warning", label: "Pendente" },
                    pago: { icon: "payments", color: "text-success", label: "Pago" },
                    enviado: { icon: "local_shipping", color: "text-primary", label: "Enviado" },
                    a_caminho: { icon: "delivery_truck_speed", color: "text-primary", label: "A caminho" },
                    entregue: { icon: "done_all", color: "text-success", label: "Entregue" },
                    cancelado: { icon: "cancel", color: "text-error", label: "Cancelado" },
                  };
                  const info = statusInfo[p.status] ?? { icon: "help", color: "text-on-surface-variant", label: p.status };
                  return (
                    <li key={p.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-5 bg-surface-container-high rounded-2xl gap-4 border border-outline-variant/20">
                      <div className="flex items-start gap-4">
                        <span className={`material-symbols-outlined text-3xl ${info.color}`} style={{fontVariationSettings: "'FILL' 1"}}>{info.icon}</span>
                        <div>
                          <p className="font-bold text-base">{p.destinatario_nome}</p>
                          <p className="text-sm text-primary font-semibold">R$ {Number(p.valor_reais).toFixed(2)}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${info.color} bg-current/10`}>{info.label}</span>
                          <p className="text-xs text-on-surface-variant mt-1">{new Date(p.criado_em || Date.now()).toLocaleString("pt-BR")}</p>
                        </div>
                      </div>
                      {["pago", "enviado", "a_caminho"].includes(p.status) && (
                        <button type="button" onClick={async () => { await avancarStatusPedido(p.id); listarPedidosPresente().then(setPedidos); }} className="px-5 py-2 bg-primary text-on-primary rounded-full text-sm font-bold hover:scale-105 transition-transform shrink-0">
                          Avançar Status
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        {abaAtiva === "loja" && (
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Coluna Principal */}
            <div className="flex-1 min-w-0">
              <div className="flex gap-2 mb-6 flex-wrap">
              {ETAPAS.map((label, i) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full ${
                    i === etapa ? "bg-primary text-on-primary" : i < etapa ? "bg-primary-container text-on-primary-container" : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  <span>{i + 1}</span>
                  {label}
                </div>
              ))}
              </div>

            {etapa === 0 && ( // Produtos
              <>
                <input
                  placeholder="Buscar produtos..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full max-w-md bg-surface-container-high rounded-xl px-4 py-3 mb-6"
                />
                {produtosFiltrados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-surface-container-high rounded-3xl text-center premium-shadow">
                    <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">inventory_2</span>
                    <h2 className="text-xl font-bold mb-2">Nenhum produto encontrado</h2>
                    <p className="text-on-surface-variant max-w-sm">
                      Não temos produtos disponíveis no momento ou que correspondam à sua busca.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {produtosFiltrados.map((p, index) => {
                      const cartItem = carrinho.find((c) => c.produto.id === p.id);
                      const isLast = index === produtosFiltrados.length - 1;
                      return (
                        <div ref={isLast ? lastElementRef : null} key={p.id} className={`bg-card-cream flex flex-col rounded-3xl overflow-hidden premium-shadow transition-all ${cartItem ? "ring-2 ring-primary" : ""}`}>
                          <div className="h-40 bg-secondary-container flex items-center justify-center relative">
                            {p.imagem_url ? (
                              <img src={p.imagem_url} alt={p.nome} className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-primary text-5xl opacity-40">redeem</span>
                            )}
                            {cartItem && <span className="absolute top-4 right-4 bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full">No carrinho ({cartItem.qtd}x)</span>}
                          </div>
                          <div className="p-6">
                            <h3 className="text-lg font-semibold">{p.nome}</h3>
                            <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">{p.descricao}</p>
                            <div className="flex justify-between items-center mt-4">
                              <div className="text-sm">
                                <p className="font-bold text-primary">R$ {Number(p.preco_reais).toFixed(2)}</p>
                              </div>
                              <button type="button" onClick={() => adicionarAoCarrinho(p)} className="bg-primary text-on-primary p-3 rounded-full hover:scale-105 transition-transform shadow-md">
                                <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {etapa === 1 && ( // Carrinho
              <div className="max-w-2xl bg-card-cream rounded-3xl p-8 premium-shadow">
                <h2 className="text-2xl font-semibold mb-6">Seu Carrinho</h2>
                {carrinho.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-outline-variant rounded-2xl">
                    <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">shopping_cart</span>
                    <p className="font-bold">Seu carrinho está vazio</p>
                    <p className="text-sm text-on-surface-variant">Adicione produtos do mercado para continuar.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {carrinho.map(c => (
                      <div key={c.produto.id} className="flex flex-col sm:flex-row justify-between sm:items-center bg-surface-container-high p-4 rounded-2xl gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-surface-container-low overflow-hidden flex-shrink-0 border border-outline-variant/20">
                            {c.produto.imagem_url ? (
                              <img src={c.produto.imagem_url} alt={c.produto.nome} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-40">
                                <span className="material-symbols-outlined text-3xl">inventory_2</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-base sm:text-lg">{c.produto.nome}</p>
                            <p className="text-sm text-primary font-semibold">R$ {Number(c.produto.preco_reais).toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <button onClick={() => alterarQtd(c.produto.id, -1)} className="w-8 h-8 flex items-center justify-center bg-surface-container-low rounded-full font-bold">-</button>
                           <span className="font-bold">{c.qtd}</span>
                           <button onClick={() => alterarQtd(c.produto.id, 1)} className="w-8 h-8 flex items-center justify-center bg-surface-container-low rounded-full font-bold">+</button>
                           <button onClick={() => removerDoCarrinho(c.produto.id)} className="ml-2 text-error"><span className="material-symbols-outlined">delete</span></button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-outline-variant/30 pt-4 mt-6 text-right">
                       <p className="text-on-surface-variant">Total Estimado</p>
                       <p className="text-2xl font-bold text-primary">R$ {totalReais.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {etapa === 2 && ( // Destinatário
              <div className="max-w-2xl space-y-6">
                <div className="bg-card-cream rounded-3xl p-6 premium-shadow">
                  <h3 className="text-lg font-semibold mb-4">Para quem é este pedido?</h3>
                  <div className="flex gap-3 mb-6">
                    <button
                      type="button"
                      onClick={async () => {
                        setTipoDest("pessoal");
                        const p = await getPerfil();
                        preencherPessoal(p);
                      }}
                      className={`flex-1 py-3 rounded-full font-bold text-sm border ${tipoDest === "pessoal" ? "bg-primary text-on-primary border-primary" : "border-outline-variant bg-transparent text-on-surface"}`}
                    >
                      Para Mim
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTipoDest("presente"); setDestNome(""); setDestEmail(""); setDestUsuarioId(undefined); }}
                      className={`flex-1 py-3 rounded-full font-bold text-sm border ${tipoDest === "presente" ? "bg-primary text-on-primary border-primary" : "border-outline-variant bg-transparent text-on-surface"}`}
                    >
                      Dar de Presente
                    </button>
                  </div>
                  
                  {tipoDest === "presente" && (
                    <div className="mb-6">
                      {amigos.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-bold mb-2">Selecionar Amigo:</p>
                          <div className="flex flex-wrap gap-2">
                            {amigos.map((a) => (
                              <button key={a.id} type="button" onClick={() => { setDestNome(a.nome); setDestUsuarioId(a.id); setBuscaDest(a.nome); carregarEnderecoAmigo(a.id); }} className="px-4 py-2 rounded-full bg-surface-container-high text-xs font-bold hover:bg-surface-container-highest">
                                {a.nome} {a.tem_endereco ? "✅" : "⚠️"}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="relative">
                        <input
                          placeholder="Ou busque por outro usuário..."
                          value={buscaDest}
                          onChange={(e) => setBuscaDest(e.target.value)}
                          className="w-full bg-surface-container-high rounded-xl px-4 py-3"
                        />
                        {sugestoes.length > 0 && (
                          <ul className="absolute z-10 w-full mt-1 bg-surface-container-low border border-outline-variant/30 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {sugestoes.map((u) => (
                              <li key={u.id}>
                                <button
                                  type="button"
                                  className="w-full text-left px-4 py-3 hover:bg-surface-container-high text-sm"
                                  onClick={() => {
                                    setDestNome(u.nome);
                                    setDestEmail(u.email);
                                    setDestUsuarioId(u.id);
                                    setBuscaDest(u.nome);
                                    setSugestoes([]);
                                    carregarEnderecoAmigo(u.id);
                                  }}
                                >
                                  <strong>{u.nome}</strong> — {u.email}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t border-outline-variant/30 pt-6">
                    <div>
                      <label htmlFor="destNome" className="sr-only">Nome completo do destinatário</label>
                      <input id="destNome" placeholder="Nome completo *" aria-invalid={!destNome} value={destNome} onChange={(e) => setDestNome(e.target.value)} className="w-full bg-surface-container-high rounded-xl px-4 py-3" />
                    </div>
                    <div>
                      <label htmlFor="destEmail" className="sr-only">E-mail do destinatário</label>
                      <input id="destEmail" placeholder="E-mail (opcional)" type="email" value={destEmail} onChange={(e) => setDestEmail(e.target.value)} className="w-full bg-surface-container-high rounded-xl px-4 py-3" />
                    </div>
                    <div>
                      <label htmlFor="destTelefone" className="sr-only">Telefone do destinatário</label>
                      <input id="destTelefone" placeholder="Telefone (opcional)" value={destTelefone} onChange={(e) => setDestTelefone(e.target.value)} className="w-full bg-surface-container-high rounded-xl px-4 py-3" />
                    </div>
                  </div>
                </div>

                <div className="bg-card-cream rounded-3xl p-6 premium-shadow">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">local_shipping</span> Endereço de Entrega</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      placeholder="CEP *"
                      aria-label="CEP"
                      aria-invalid={!cep}
                      value={cep}
                      onChange={(e) => setCep(mascaraCep(e.target.value))}
                      className="bg-surface-container-high rounded-xl px-4 py-3"
                    />
                    <input
                      placeholder={cepLoading ? "Buscando..." : "Logradouro *"}
                      aria-label="Logradouro"
                      aria-invalid={!logradouro}
                      value={logradouro}
                      onChange={(e) => setLogradouro(e.target.value)}
                      className={`bg-surface-container-high rounded-xl px-4 py-3 ${cepLoading ? "opacity-50" : ""}`}
                    />
                    <div className="flex gap-4">
                      <input placeholder="Número *" aria-label="Número" aria-invalid={!numero} value={numero} onChange={(e) => setNumero(e.target.value)} className="w-1/3 bg-surface-container-high rounded-xl px-4 py-3" />
                      <input placeholder="Bairro *" aria-label="Bairro" aria-invalid={!bairro} value={bairro} onChange={(e) => setBairro(e.target.value)} className="w-2/3 bg-surface-container-high rounded-xl px-4 py-3" />
                    </div>
                    <div className="flex gap-4">
                      <input placeholder="Cidade *" aria-label="Cidade" aria-invalid={!cidade} value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-3/4 bg-surface-container-high rounded-xl px-4 py-3" />
                      <input placeholder="UF" aria-label="UF" aria-invalid={!uf} maxLength={2} value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())} className="w-1/4 bg-surface-container-high rounded-xl px-4 py-3 text-center" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {etapa === 3 && ( // Pagamento
              <div className="max-w-2xl bg-card-cream rounded-3xl p-8 premium-shadow space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Composição do Pagamento</h3>
                  
                  <div className="bg-surface-container-high p-6 rounded-2xl mb-6">
                     <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">Subtotal: R$ {totalReais.toFixed(2)}</p>
                     <p className="text-xs font-bold text-primary mb-4 uppercase tracking-wider">
                       Frete: {loadingFrete ? "Calculando..." : `R$ ${freteBase.toFixed(2)}`}
                     </p>
                  </div>
                  
                  {meusCupons.length > 0 && (
                    <div className="bg-surface-container-high p-6 rounded-2xl mb-6">
                      <p className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">Usar Cupom de Desconto</p>
                      <select
                        value={cupomSelecionadoId}
                        onChange={(e) => setCupomSelecionadoId(e.target.value)}
                        className="w-full bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/20"
                      >
                        <option value="">Nenhum cupom</option>
                        {meusCupons.map(c => (
                           <option key={c.id} value={c.id}>
                              {c.titulo} ({c.desconto_percentual || 10}% OFF) - Cód: {c.codigo}
                           </option>
                        ))}
                      </select>
                      {cupomSelecionadoId && (
                         <p className="text-xs text-primary mt-2 font-bold">- R$ {descontoCupomValor.toFixed(2)} aplicados!</p>
                      )}
                    </div>
                  )}
                  
                  {saldoWallet > 0 && formaPagamentoProduto !== "wallet" && (
                    <div className="bg-surface-container-high p-6 rounded-2xl mb-6 border border-outline-variant/30">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-bold text-primary uppercase tracking-wider">Usar Cashback</p>
                        <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
                          <span className="material-symbols-outlined text-primary text-[16px]">account_balance_wallet</span>
                          <span className="text-xs font-black text-primary">R$ {saldoWallet.toFixed(2)} disponível</span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">R$</span>
                          <input 
                            type="number" 
                            min={0} 
                            max={Math.min(saldoWallet, subtotalReais + freteBase)} 
                            step={0.01} 
                            value={walletUsado || ""} 
                            onChange={(e) => setWalletUsado(Number(e.target.value))} 
                            className="w-full bg-surface-container-lowest rounded-xl px-4 py-3 pl-12 border border-outline-variant/20 font-bold" 
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setWalletUsado(Math.min(saldoWallet, subtotalReais + freteBase))}
                          className="px-4 py-3 bg-primary/20 text-primary rounded-xl font-bold hover:bg-primary/30 transition-colors whitespace-nowrap"
                        >
                          Usar Máximo
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">stars</span> 
                    Saldo atual: {saldoPts.toLocaleString("pt-BR")} pts
                  </p>
                </div>
                
                {restanteReais > 0 && (
                  <div className="border-t border-outline-variant/30 pt-8">
                    <h3 className="text-lg font-semibold mb-4">Forma de Pagamento</h3>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <button type="button" onClick={() => setFormaPagamentoProduto("cartao")} className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors ${formaPagamentoProduto === "cartao" ? "border-primary bg-primary/10 text-primary" : "border-outline-variant text-on-surface-variant"}`}>
                        <span className="material-symbols-outlined">credit_card</span>
                        <span className="text-sm font-semibold">Cartão de Crédito</span>
                      </button>
                      <button type="button" onClick={() => setFormaPagamentoProduto("pix")} className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors ${formaPagamentoProduto === "pix" ? "border-primary bg-primary/10 text-primary" : "border-outline-variant text-on-surface-variant"}`}>
                        <span className="material-symbols-outlined">qr_code_2</span>
                        <span className="text-sm font-semibold">PIX</span>
                      </button>
                      <button type="button" onClick={() => setFormaPagamentoProduto("wallet")} className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors ${formaPagamentoProduto === "wallet" ? "border-primary bg-primary/10 text-primary" : "border-outline-variant text-on-surface-variant"}`}>
                        <span className="material-symbols-outlined">account_balance_wallet</span>
                        <span className="text-sm font-semibold">Carteira Digital</span>
                      </button>
                    </div>

                    {formaPagamentoProduto === "cartao" && (
                      <div className="bg-surface-container-high p-6 rounded-2xl space-y-4">
                        {cartoesSalvos.length > 0 && (
                          <div className="mb-2">
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Cartão Salvo</label>
                            <div className="space-y-2">
                              {cartoesSalvos.map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setCartaoSalvoSelecionadoId(c.id);
                                    setNumCartao(c.numero);
                                    setNomeCartao(c.nomeTitular);
                                    setValidadeCartao(c.validade);
                                    setCvvCartao(c.cvv);
                                  }}
                                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                                    cartaoSalvoSelecionadoId === c.id
                                      ? "border-primary bg-primary/10"
                                      : "border-outline-variant hover:bg-surface-container-high"
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-primary">credit_card</span>
                                  <div>
                                    <p className="font-semibold text-sm">{c.apelido || "Cartão"} **** {c.numero.slice(-4)}</p>
                                    <p className="text-xs text-on-surface-variant">{c.nomeTitular} · Val: {c.validade}</p>
                                  </div>
                                  {c.principal && <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Principal</span>}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setCartaoSalvoSelecionadoId("");
                                  setNumCartao("");
                                  setNomeCartao("");
                                  setValidadeCartao("");
                                  setCvvCartao("");
                                }}
                                className={`w-full p-3 rounded-xl border text-sm transition-colors ${
                                  cartaoSalvoSelecionadoId === ""
                                    ? "border-primary bg-primary/10 text-primary font-semibold"
                                    : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
                                }`}
                              >
                                + Digitar novo cartão
                              </button>
                            </div>
                            {cartaoSalvoSelecionadoId === "" && <div className="border-t border-outline-variant/30 mt-4 pt-4" />}
                          </div>
                        )}
                        {cartaoSalvoSelecionadoId === "" && (
                          <>
                            <div>
                              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Número do Cartão</label>
                              <input placeholder="0000 0000 0000 0000" value={numCartao} onChange={e => setNumCartao(e.target.value)} className="w-full bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/20 font-mono text-lg tracking-widest" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Nome do Titular</label>
                              <input placeholder="Nome como está no cartão" value={nomeCartao} onChange={e => setNomeCartao(e.target.value)} className="w-full bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/20" />
                            </div>
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Validade</label>
                                <input placeholder="MM/AA" value={validadeCartao} onChange={e => setValidadeCartao(e.target.value)} className="w-full bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/20 text-center font-mono" />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">CVV</label>
                                <input placeholder="123" value={cvvCartao} onChange={e => setCvvCartao(e.target.value)} className="w-full bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/20 text-center font-mono" />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    {formaPagamentoProduto === "pix" && (
                      <div className="bg-primary/10 p-6 rounded-2xl flex items-center gap-4 text-primary font-medium">
                        <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
                        O QR Code para pagamento será gerado na próxima etapa.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {etapa === 4 && ( // Resumo
              <div className="max-w-2xl bg-card-cream rounded-3xl p-8 premium-shadow space-y-6">
                <h2 className="text-2xl font-semibold mb-2">Resumo do Pedido</h2>
                <div className="bg-surface-container-high rounded-2xl p-6">
                  <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Itens</h4>
                  <ul className="text-sm space-y-2 mb-6">
                    {carrinho.map((c) => (
                      <li key={c.produto.id} className="flex justify-between font-medium">
                        <span>{c.qtd}x {c.produto.nome}</span>
                      </li>
                    ))}
                  </ul>

                  <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Entrega</h4>
                  <div className="text-sm mb-6 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20">
                    <p className="font-bold mb-1">{destNome}</p>
                    <p className="text-on-surface-variant">{logradouro}, {numero}</p>
                    <p className="text-on-surface-variant">{bairro} - {cidade}/{uf} | CEP: {cep}</p>
                  </div>

                  <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Valores</h4>
                  <div className="text-sm space-y-1">
                    <p className="flex justify-between text-on-surface-variant"><span>Subtotal Reais:</span> <span>R$ {subtotalReais.toFixed(2)}</span></p>
                    <p className="flex justify-between text-on-surface-variant"><span>Frete:</span> <span>R$ {freteBase.toFixed(2)}</span></p>
                    {descontoCupomValor > 0 && (
                      <p className="flex justify-between text-primary font-bold"><span>Desconto Cupom:</span> <span>- R$ {descontoCupomValor.toFixed(2)}</span></p>
                    )}
                    {carteiraAplicada > 0 && (
                      <p className="flex justify-between text-primary font-bold"><span>Cashback usado:</span> <span>- R$ {carteiraAplicada.toFixed(2)}</span></p>
                    )}
                    <div className="border-t border-outline-variant/30 my-2 pt-2 flex justify-between font-bold text-lg">
                       <span>Total a pagar:</span>
                       <span className="text-primary">R$ {restanteReais.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                   <h4 className="text-sm font-bold mb-3">Mensagem no cartão (opcional)</h4>
                   <textarea placeholder="Escreva algo legal..." value={mensagem} onChange={(e) => setMensagem(e.target.value)} className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 min-h-[80px]" />
                </div>
              </div>
            )}

            <footer className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 left-4 lg:left-[312px] bg-surface-container-lowest/95 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-outline-variant/30 flex justify-between items-center gap-4 z-40 shadow-2xl">
              <button type="button" disabled={etapa === 0} onClick={() => setEtapa((e) => e - 1)} className="flex items-center gap-2 px-5 py-3 rounded-full border border-outline-variant font-semibold disabled:opacity-40 hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Voltar
              </button>
              <div className="flex items-center gap-3">
                {etapa > 0 && carrinho.length > 0 && (
                  <span className="text-sm text-on-surface-variant font-medium hidden sm:block">
                    {carrinho.reduce((acc, c) => acc + c.qtd, 0)} item(s) · R$ {totalReais.toFixed(2)}
                  </span>
                )}
                {etapa === 0 ? (
                  <button type="button" onClick={avancar} className="flex items-center gap-2 bg-primary text-on-primary px-6 sm:px-8 py-3 rounded-full font-bold shadow-md hover:scale-[1.02] transition-transform">
                    Ir para Carrinho
                    {carrinho.length > 0 && (
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                        {carrinho.reduce((acc, c) => acc + c.qtd, 0)}
                      </span>
                    )}
                    <span className="material-symbols-outlined">shopping_cart_checkout</span>
                  </button>
                ) : etapa < ETAPAS.length - 1 ? (
                  <button type="button" onClick={avancar} className="flex items-center gap-2 bg-primary text-on-primary px-6 sm:px-8 py-3 rounded-full font-bold shadow-md hover:scale-[1.02] transition-transform">
                    Continuar
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                ) : (
                  <button type="button" disabled={enviando} onClick={enviarPresenteProduto} className="flex items-center gap-2 bg-primary text-on-primary px-6 sm:px-8 py-3 rounded-full font-bold disabled:opacity-50 shadow-md hover:scale-[1.02] transition-transform">
                    <span className="material-symbols-outlined">check_circle</span>
                    {enviando ? "Processando..." : "Confirmar Pedido"}
                  </button>
                )}
              </div>
            </footer>
          </div>

          {/* Coluna Lateral - Resumo do Carrinho (sticky) */}
        </div>
        )}
      </div>

      {pixModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
          <div className="bg-surface-container-low rounded-3xl p-8 max-w-sm w-full text-center premium-shadow">
            <h3 className="text-xl font-semibold mb-2">Pagamento PIX</h3>
            <p className="text-sm text-on-surface-variant mb-4">Valor: R$ {pixModal.valorPix.toFixed(2)}</p>
            <div className="w-48 h-48 mx-auto bg-white rounded-xl flex items-center justify-center mb-4 border grid grid-cols-8 gap-0.5 p-2">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className={`aspect-square ${i % 3 === 0 ? "bg-black" : "bg-white"}`} />
              ))}
            </div>
            <p className="text-xs text-on-surface-variant mb-6">QR Code simulado — confirme após &quot;pagar&quot;</p>
            <button type="button" disabled={enviando} onClick={confirmarPix} className="w-full bg-primary text-on-primary py-3 rounded-full font-bold">
              {enviando ? "Confirmando..." : "Confirmar pagamento"}
            </button>
            <button type="button" onClick={() => setPixModal(null)} className="w-full mt-2 text-sm text-on-surface-variant hover:underline">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {sucessoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
          <div className="bg-card-cream rounded-3xl p-8 max-w-md w-full text-center premium-shadow">
            <span className="material-symbols-outlined text-primary text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <h3 className="text-2xl font-semibold mb-2">Pedido Confirmado!</h3>
            <p className="text-sm text-on-surface-variant mb-6">Sua compra foi registrada com sucesso e você pode acompanhar a entrega na aba correspondente.</p>
            <button type="button" onClick={() => { setSucessoModal(false); setAbaAtiva("pedidos"); listarPedidosPresente().then(setPedidos); }} className="w-full bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-md hover:scale-[1.02] transition-transform">
              Ver Meus Pedidos
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
