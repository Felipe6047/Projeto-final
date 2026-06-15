"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { ApiError, simuladorGerarNota, simuladorVendaPorCpf } from "@/lib/api";
import { cpfValido, mascaraCpf, mascaraMoeda, parseMoeda } from "@/lib/validators";

export function AdminPdvSection() {
  const { toast } = useToast();
  const [cpf, setCpf] = useState("");
  const [valor, setValor] = useState("R$ 99,90");
  const [loading, setLoading] = useState(false);
  const [ultimaNota, setUltimaNota] = useState<string | null>(null);

  async function creditarPorCpf() {
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (!cpfValido(cpfLimpo)) {
      toast("CPF inválido", "error");
      return;
    }
    const valorTotal = parseMoeda(valor);
    setLoading(true);
    try {
      const res = await simuladorVendaPorCpf(cpfLimpo, valorTotal);
      toast(`+${res.pontosGerados} pts creditados ao cliente`, "success");
    } catch (e) {
      toast((e as ApiError).message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function gerarNota() {
    const valorTotal = parseMoeda(valor);
    setLoading(true);
    try {
      const res = await simuladorGerarNota(valorTotal, cpf.replace(/\D/g, "") || undefined);
      setUltimaNota(res.chave);
      toast("Nota gerada para o cliente escanear", "success");
    } catch (e) {
      toast((e as ApiError).message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30 mb-8">
      <h2 className="text-xl font-semibold mb-2">PDV — Creditar por CPF</h2>
      <p className="text-sm text-on-surface-variant mb-4">Área do lojista: creditar pontos na conta de um cliente cadastrado.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input placeholder="CPF do cliente" value={cpf} onChange={(e) => setCpf(mascaraCpf(e.target.value))} className="bg-surface-container-high rounded-xl px-4 py-3" />
        <input value={valor} onChange={(e) => setValor(mascaraMoeda(e.target.value))} className="bg-surface-container-high rounded-xl px-4 py-3" />
      </div>
      <div className="flex gap-3 flex-wrap">
        <button type="button" disabled={loading} onClick={creditarPorCpf} className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold disabled:opacity-50">
          Finalizar e Creditar
        </button>
        <button type="button" disabled={loading} onClick={gerarNota} className="border border-outline-variant px-6 py-3 rounded-full font-bold disabled:opacity-50">
          Gerar NFC-e
        </button>
      </div>
      {ultimaNota && (
        <p className="mt-4 text-xs font-mono break-all bg-surface-container-high p-3 rounded-xl">{ultimaNota}</p>
      )}
    </section>
  );
}
