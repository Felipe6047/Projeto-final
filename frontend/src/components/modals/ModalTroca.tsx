"use client";

import { useState } from "react";
import { Cupom } from "@/lib/api";

interface ModalTrocaProps {
  cupomAlvo: Cupom;
  meusCupons: Cupom[];
  taxaPontos: number;
  onClose: () => void;
  onConfirm: (cupomOfertadoId: number, aceitarTaxa: boolean) => Promise<void>;
}

export function ModalTroca({
  cupomAlvo,
  meusCupons,
  taxaPontos,
  onClose,
  onConfirm,
}: ModalTrocaProps) {
  const disponiveis = meusCupons.filter((c) => c.status === "disponivel");
  const [ofertadoId, setOfertadoId] = useState<number | "">(
    disponiveis[0]?.id ?? ""
  );
  const [aceitarTaxa, setAceitarTaxa] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!ofertadoId) return;
    setLoading(true);
    try {
      await onConfirm(Number(ofertadoId), aceitarTaxa);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-8 max-w-lg w-full premium-shadow border border-outline-variant/30"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-semibold text-on-surface mb-2">
          Solicitar troca
        </h3>
        <p className="text-on-surface-variant text-sm mb-6">
          Escolha qual cupom seu você oferece em troca de{" "}
          <strong>{cupomAlvo.titulo}</strong>
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card-cream rounded-xl p-4">
            <p className="frik-label text-primary mb-2">Seu cupom</p>
            <select
              className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-sm"
              value={ofertadoId}
              onChange={(e) =>
                setOfertadoId(e.target.value ? Number(e.target.value) : "")
              }
            >
              {disponiveis.length === 0 ? (
                <option value="">Nenhum disponível</option>
              ) : (
                disponiveis.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titulo} ({c.codigo})
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="bg-card-cream rounded-xl p-4">
            <p className="frik-label text-primary mb-2">Cupom desejado</p>
            <p className="font-semibold text-on-surface">{cupomAlvo.titulo}</p>
            <p className="text-xs text-on-surface-variant mt-1">
              {cupomAlvo.codigo}
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2 mb-6 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={aceitarTaxa}
            onChange={(e) => setAceitarTaxa(e.target.checked)}
            className="rounded border-outline-variant text-primary focus:ring-primary"
          />
          Pagar taxa de {taxaPontos} pontos para priorizar a troca
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-outline-variant font-semibold"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!ofertadoId || loading}
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-full bg-primary-container text-on-primary-container font-bold disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Confirmar troca"}
          </button>
        </div>
      </div>
    </div>
  );
}
