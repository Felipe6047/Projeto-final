"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  ApiError,
  registrarCompra,
} from "@/lib/api";

type Pagamento = "credito" | "debito" | "pix";

export function RegistrarComprasPage() {
  const { refreshPerfil } = useAuth();
  const { toast } = useToast();

  const [processando, setProcessando] = useState(false);
  const [valorStr, setValorStr] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<Pagamento>("pix");
  const [resultadoPontos, setResultadoPontos] = useState<number | null>(null);

  const valorNum = parseFloat(valorStr.replace(",", ".")) || 0;
  const pontosEstimados = Math.floor(valorNum * 1);
  async function confirmarSimulacao() {
    if (valorNum <= 0) {
      toast("Informe um valor válido", "error");
      return;
    }
    setProcessando(true);
    try {
      const res = await registrarCompra(valorNum);
      setResultadoPontos(res.pontosGerados);
      toast(`+${res.pontosGerados} pontos creditados via ${formaPagamento.toUpperCase()}!`, "success");
      await refreshPerfil();
    } catch (e) {
      toast((e as ApiError).message, "error");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <AppShell>
      <div className="px-4 lg:px-[40px] pt-8 pb-24 max-w-2xl">
        <h1 className="text-[32px] font-semibold mb-2">Registrar Compras</h1>
        <p className="text-on-surface-variant mb-8 text-sm">
          Simule o registro de uma compra diretamente na loja para ganhar pontos.
        </p>

        {resultadoPontos !== null ? (
          <section className="bg-card-cream rounded-2xl p-8 premium-shadow text-center">
            <span className="material-symbols-outlined text-primary text-5xl mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <p className="font-bold text-primary text-xl mb-1">Compra registrada!</p>
            <p className="text-on-surface-variant text-sm mb-6">
              Você ganhou <strong className="text-primary">+{resultadoPontos} pontos</strong> pela compra.
            </p>
            <button
              type="button"
              onClick={() => { setResultadoPontos(null); setValorStr(""); }}
              className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold"
            >
              Registrar nova compra
            </button>
          </section>
        ) : (
          <section className="bg-card-cream rounded-2xl p-6 premium-shadow space-y-6">
            <div>
              <p className="frik-label text-primary mb-3">Valor da compra</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={valorStr}
                  onChange={(e) => setValorStr(e.target.value)}
                  className="w-full bg-surface-container-high rounded-xl pl-12 pr-4 py-4 text-xl font-bold"
                />
              </div>
              {valorNum > 0 && (
                <p className="text-sm text-primary font-bold mt-2">
                  🎯 Você vai ganhar {pontosEstimados.toLocaleString("pt-BR")} pontos
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-bold mb-3">Forma de pagamento</p>
              <div className="flex flex-wrap gap-2">
                {(["credito", "debito", "pix"] as Pagamento[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormaPagamento(f)}
                    className={`px-5 py-3 rounded-full text-sm font-bold capitalize ${formaPagamento === f ? "bg-primary text-on-primary" : "bg-surface-container-high"}`}
                  >
                    {f === "credito" ? "💳 Crédito" : f === "debito" ? "🏦 Débito" : "⚡ PIX"}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={processando || valorNum <= 0}
              onClick={confirmarSimulacao}
              className="w-full bg-primary text-on-primary py-4 rounded-full font-bold disabled:opacity-50"
            >
              {processando ? "Registrando..." : "Confirmar compra"}
            </button>
          </section>
        )}
      </div>
    </AppShell>
  );
}
