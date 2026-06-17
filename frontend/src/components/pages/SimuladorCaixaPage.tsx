"use client";

import { useState, useRef, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useToast } from "@/context/ToastContext";
import {
  ApiError,
  simuladorBuscarClientePorCpf,
  simuladorGerarNota,
  simuladorVendaPorCpf,
} from "@/lib/api";
import { cpfValido, mascaraCpf, mascaraMoeda, parseMoeda } from "@/lib/validators";

interface ClienteInfo {
  id: number;
  nome: string;
  email: string;
  pontos: number;
  nivel: string;
}

interface VendaRegistrada {
  id: number;
  cliente: string;
  valor: number;
  pontos: number;
  hora: string;
}

export function SimuladorCaixaPage() {
  const { toast } = useToast();
  const cpfRef = useRef<HTMLInputElement>(null);

  const [cpf, setCpf] = useState("");
  const [valor, setValor] = useState("");
  const [cliente, setCliente] = useState<ClienteInfo | null>(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [cpfErro, setCpfErro] = useState("");
  const [loading, setLoading] = useState<"venda" | "nota" | null>(null);
  const [ultimaNota, setUltimaNota] = useState<{ chave: string; valor: number; pontos: number } | null>(null);
  const [historico, setHistorico] = useState<VendaRegistrada[]>([]);
  const [vendaConfirmada, setVendaConfirmada] = useState<{ nome: string; pontos: number; saldo: number } | null>(null);

  // Busca cliente automaticamente quando CPF tem 14 chars (com máscara)
  useEffect(() => {
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      setCliente(null);
      setCpfErro("");
      return;
    }
    if (!cpfValido(cpfLimpo)) {
      setCpfErro("CPF inválido.");
      setCliente(null);
      return;
    }
    setCpfErro("");
    setBuscandoCliente(true);
    simuladorBuscarClientePorCpf(cpfLimpo)
      .then(setCliente)
      .catch(() => {
        setCliente(null);
        setCpfErro("Cliente não cadastrado no FRIK.");
      })
      .finally(() => setBuscandoCliente(false));
  }, [cpf]);

  async function finalizarVenda() {
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (!cliente || cpfLimpo.length !== 11) {
      toast("Busque um cliente pelo CPF primeiro", "error");
      return;
    }
    const valorTotal = parseMoeda(valor);
    if (valorTotal <= 0) {
      toast("Informe o valor da compra", "error");
      return;
    }
    setLoading("venda");
    try {
      const res = await simuladorVendaPorCpf(cpfLimpo, valorTotal);
      setVendaConfirmada({ nome: cliente.nome, pontos: res.pontosGerados, saldo: res.saldoPontos });
      setHistorico(prev => [{
        id: Date.now(),
        cliente: cliente.nome,
        valor: valorTotal,
        pontos: res.pontosGerados,
        hora: new Date().toLocaleTimeString("pt-BR"),
      }, ...prev.slice(0, 9)]);
      // Reset para próximo cliente
      setCpf("");
      setValor("");
      setCliente(null);
      setTimeout(() => setVendaConfirmada(null), 5000);
    } catch (e) {
      toast((e as ApiError).message, "error");
    } finally {
      setLoading(null);
    }
  }

  async function gerarNota() {
    const valorTotal = parseMoeda(valor);
    if (valorTotal <= 0) {
      toast("Informe o valor da compra", "error");
      return;
    }
    setLoading("nota");
    try {
      const res = await simuladorGerarNota(valorTotal, cpf.replace(/\D/g, "") || undefined);
      setUltimaNota({ chave: res.chave, valor: res.valorTotal, pontos: res.pontosEstimados });
      toast("Nota fiscal gerada! Cliente escaneia a chave no app.", "success");
    } catch (e) {
      toast((e as ApiError).message, "error");
    } finally {
      setLoading(null);
    }
  }

  function resetar() {
    setCpf("");
    setValor("");
    setCliente(null);
    setCpfErro("");
    setUltimaNota(null);
    setVendaConfirmada(null);
    setTimeout(() => cpfRef.current?.focus(), 100);
  }

  return (
    <AppShell>
      <div className="px-4 lg:px-[40px] pt-8 pb-32 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>point_of_sale</span>
          <div>
            <h1 className="text-[32px] font-bold leading-tight">Terminal PDV</h1>
            <p className="text-on-surface-variant text-sm">Ponto de Venda — crédito de pontos por CPF</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

          {/* Coluna Principal - Terminal */}
          <div className="space-y-4">

            {/* Card do Terminal */}
            <div className="bg-card-cream rounded-3xl p-6 premium-shadow">
              <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">person_search</span>
                Identificar Cliente
              </h2>

              {/* CPF Input */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  CPF do Cliente
                </label>
                <div className="relative">
                  <input
                    ref={cpfRef}
                    autoFocus
                    value={cpf}
                    onChange={(e) => setCpf(mascaraCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    className={`w-full bg-surface-container-high rounded-2xl px-4 py-4 text-xl font-mono tracking-widest border-2 transition-colors ${
                      cliente ? "border-primary bg-primary/5" :
                      cpfErro ? "border-error" :
                      "border-transparent focus:border-primary/50"
                    }`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {buscandoCliente && (
                      <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin block" />
                    )}
                    {cliente && !buscandoCliente && (
                      <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    )}
                    {cpfErro && !buscandoCliente && (
                      <span className="material-symbols-outlined text-error text-[22px]">error</span>
                    )}
                  </div>
                </div>
                {cpfErro && <p className="text-error text-xs mt-1.5 font-medium">{cpfErro}</p>}
              </div>

              {/* Cliente Identificado */}
              {cliente && (
                <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 mb-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-primary font-black text-xl">{cliente.nome.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface truncate">{cliente.nome}</p>
                    <p className="text-xs text-on-surface-variant">{cliente.nivel} · {cliente.pontos.toLocaleString("pt-BR")} pts</p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-2xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>loyalty</span>
                </div>
              )}

              {/* Valor */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Valor da Compra
                </label>
                <input
                  value={valor}
                  onChange={(e) => setValor(mascaraMoeda(e.target.value))}
                  placeholder="R$ 0,00"
                  className="w-full bg-surface-container-high rounded-2xl px-4 py-4 text-2xl font-bold border-2 border-transparent focus:border-primary/50 transition-colors"
                />
                {valor && parseMoeda(valor) > 0 && (
                  <p className="text-xs text-primary mt-1.5 font-semibold">
                    ≈ +{Math.floor(parseMoeda(valor))} pontos para o cliente
                  </p>
                )}
              </div>

              {/* Botões */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  disabled={loading !== null || !cliente || parseMoeda(valor) <= 0}
                  onClick={finalizarVenda}
                  className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-lg disabled:opacity-40 flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform shadow-md"
                >
                  {loading === "venda" ? (
                    <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined">check_circle</span>
                  )}
                  Confirmar Venda e Creditar Pontos
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={loading !== null || parseMoeda(valor) <= 0}
                    onClick={gerarNota}
                    className="flex-1 bg-surface-container-high text-on-surface py-3 rounded-2xl font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors"
                  >
                    {loading === "nota" ? (
                      <span className="w-4 h-4 border-2 border-on-surface border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                    )}
                    Gerar NFC-e
                  </button>
                  <button
                    type="button"
                    onClick={resetar}
                    className="px-4 py-3 bg-surface-container-high text-on-surface-variant rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                    Limpar
                  </button>
                </div>
              </div>
            </div>

            {/* Nota Fiscal Gerada */}
            {ultimaNota && (
              <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary">receipt_long</span>
                  <p className="font-bold text-sm">NFC-e Gerada</p>
                </div>
                <p className="text-xs text-on-surface-variant mb-1">
                  Valor: <strong>R$ {ultimaNota.valor.toFixed(2)}</strong> · ~<strong>{ultimaNota.pontos} pts</strong> se vinculado
                </p>
                <p className="font-mono text-[11px] break-all bg-surface-container-high p-3 rounded-xl mt-2 select-all">
                  {ultimaNota.chave}
                </p>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(ultimaNota.chave); toast("Chave copiada!", "success"); }}
                  className="mt-2 text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                >
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  Copiar chave
                </button>
              </div>
            )}
          </div>

          {/* Coluna Direita - Confirmação + Histórico */}
          <div className="space-y-4">

            {/* Confirmação de Venda */}
            {vendaConfirmada && (
              <div className="bg-primary rounded-3xl p-6 text-on-primary premium-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <div>
                    <p className="font-black text-xl">Venda Confirmada!</p>
                    <p className="text-on-primary/70 text-sm">{vendaConfirmada.nome}</p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 flex justify-between">
                  <div className="text-center">
                    <p className="text-on-primary/70 text-xs mb-1">Pontos Ganhos</p>
                    <p className="font-black text-3xl">+{vendaConfirmada.pontos}</p>
                  </div>
                  <div className="w-px bg-white/20" />
                  <div className="text-center">
                    <p className="text-on-primary/70 text-xs mb-1">Saldo Total</p>
                    <p className="font-black text-3xl">{vendaConfirmada.saldo.toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Histórico do dia */}
            <div className="bg-card-cream rounded-3xl p-6 premium-shadow">
              <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">history</span>
                Vendas desta sessão
              </h2>
              {historico.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2">receipt</span>
                  <p className="text-sm text-on-surface-variant">Nenhuma venda ainda</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {historico.map((v) => (
                    <div key={v.id} className="flex items-center justify-between bg-surface-container-high p-3 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-black text-sm">{v.cliente.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm leading-tight">{v.cliente}</p>
                          <p className="text-xs text-on-surface-variant">{v.hora} · R$ {v.valor.toFixed(2)}</p>
                        </div>
                      </div>
                      <span className="text-primary font-black text-sm shrink-0">+{v.pontos} pts</span>
                    </div>
                  ))}
                </div>
              )}
              {historico.length > 0 && (
                <div className="border-t border-outline-variant/30 mt-4 pt-3 flex justify-between text-sm">
                  <span className="text-on-surface-variant font-medium">{historico.length} venda(s)</span>
                  <span className="text-primary font-black">
                    R$ {historico.reduce((acc, v) => acc + v.valor, 0).toFixed(2)} total
                  </span>
                </div>
              )}
            </div>

            {/* Dicas de uso */}
            <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/20">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Como usar</p>
              <ol className="space-y-2 text-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-on-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">1</span>
                  Cliente informa o CPF no caixa
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-on-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">2</span>
                  Operador digita o CPF — cliente é identificado automaticamente
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-on-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">3</span>
                  Informe o valor total da compra
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-primary text-on-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">4</span>
                  Clique em <strong className="text-on-surface">Confirmar Venda</strong> — pontos são creditados na hora
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
