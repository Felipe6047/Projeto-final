"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useToast } from "@/context/ToastContext";
import {
  ApiError,
  simuladorGerarNota,
  simuladorVendaPorCpf,
} from "@/lib/api";
import {
  cpfValido,
  mascaraCpf,
  mascaraMoeda,
  parseMoeda,
} from "@/lib/validators";

export function SimuladorCaixaPage() {
  const { toast } = useToast();
  const [cpf, setCpf] = useState("");
  const [valor, setValor] = useState("R$ 99,90");
  const [loading, setLoading] = useState<"venda" | "nota" | null>(null);
  const [ultimaNota, setUltimaNota] = useState<{
    chave: string;
    valorTotal: number;
    pontosEstimados: number;
  } | null>(null);
  const [cpfErro, setCpfErro] = useState("");

  function validarCpfCampo() {
    const limpo = cpf.replace(/\D/g, "");
    if (limpo.length === 11 && !cpfValido(limpo)) {
      setCpfErro("Por favor, informe um CPF válido.");
      return false;
    }
    setCpfErro("");
    return true;
  }

  async function finalizarVenda() {
    if (!validarCpfCampo()) return;
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      toast("Informe um CPF válido", "error");
      return;
    }
    const valorTotal = parseMoeda(valor);
    if (valorTotal <= 0) {
      toast("Informe um valor válido", "error");
      return;
    }
    setLoading("venda");
    try {
      const res = await simuladorVendaPorCpf(cpfLimpo, valorTotal);
      toast(`Venda registrada! +${res.pontosGerados} pts creditados ao cliente.`, "success");
    } catch (e) {
      toast((e as ApiError).message, "error");
    } finally {
      setLoading(null);
    }
  }

  async function gerarNota() {
    if (cpf && !validarCpfCampo()) return;
    const valorTotal = parseMoeda(valor);
    if (valorTotal <= 0) {
      toast("Informe um valor válido", "error");
      return;
    }
    setLoading("nota");
    try {
      const res = await simuladorGerarNota(
        valorTotal,
        cpf.replace(/\D/g, "") || undefined
      );
      setUltimaNota({
        chave: res.chave,
        valorTotal: res.valorTotal,
        pontosEstimados: res.pontosEstimados,
      });
      toast("Nota fiscal gerada! Cliente pode escanear a chave no app.", "success");
    } catch (e) {
      toast((e as ApiError).message, "error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <AppShell>
      <div className="px-4 lg:px-[40px] pt-8 pb-24 max-w-xl">
        <h1 className="text-[32px] font-semibold mb-2">Simulador de Caixa</h1>
        <p className="text-on-surface-variant mb-8 text-sm">
          PDV do lojista — credite pontos por CPF ou gere uma NFC-e para o cliente escanear.
        </p>

        <section className="bg-card-cream rounded-2xl p-6 premium-shadow space-y-4">
          <div>
            <label className="frik-label text-primary block mb-2">CPF do cliente</label>
            <input
              value={cpf}
              onChange={(e) => {
                setCpf(mascaraCpf(e.target.value));
                setCpfErro("");
              }}
              onBlur={validarCpfCampo}
              placeholder="999.999.999-99"
              aria-invalid={!!cpfErro}
              className={`w-full bg-surface-container-high rounded-xl px-4 py-3 ${cpfErro ? "border-2 border-error" : ""}`}
            />
            {cpfErro && (
              <p className="text-error text-xs mt-1">{cpfErro}</p>
            )}
          </div>

          <div>
            <label className="frik-label text-primary block mb-2">Valor da compra</label>
            <input
              value={valor}
              onChange={(e) => setValor(mascaraMoeda(e.target.value))}
              className="w-full bg-surface-container-high rounded-xl px-4 py-3"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              disabled={loading !== null}
              onClick={finalizarVenda}
              className="flex-1 bg-primary text-on-primary py-3 rounded-full font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === "venda" && (
                <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              )}
              Finalizar e Creditar
            </button>
            <button
              type="button"
              disabled={loading !== null}
              onClick={gerarNota}
              className="flex-1 bg-primary-container text-on-primary-container py-3 rounded-full font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === "nota" && (
                <span className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
              )}
              Gerar Nota Fiscal (NFC-e)
            </button>
          </div>
        </section>

        {ultimaNota && (
          <section className="mt-6 bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30">
            <p className="frik-label text-primary mb-2">Última nota gerada</p>
            <p className="text-sm text-on-surface-variant mb-2">
              Valor: R$ {ultimaNota.valorTotal.toFixed(2)} — ~{ultimaNota.pontosEstimados} pts
            </p>
            <p className="font-mono text-xs break-all bg-surface-container-high p-3 rounded-xl">
              {ultimaNota.chave}
            </p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(ultimaNota.chave);
                toast("Chave copiada!", "success");
              }}
              className="mt-3 text-sm font-bold text-primary"
            >
              Copiar chave
            </button>
          </section>
        )}
      </div>
    </AppShell>
  );
}
