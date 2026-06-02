"use client";

import { useState } from "react";
import { Cupom } from "@/lib/api";

type Canal = "email" | "whatsapp" | "sms" | "link";

interface ModalPresenteCupomProps {
  cupom: Cupom;
  onClose: () => void;
  onConfirm: (data: {
    canal: Canal;
    destinatarioNome?: string;
    destinatarioEmail?: string;
    destinatarioTelefone?: string;
    destinatarioCpf?: string;
    mensagem?: string;
  }) => Promise<void>;
}

export function ModalPresenteCupom({
  cupom,
  onClose,
  onConfirm,
}: ModalPresenteCupomProps) {
  const [canal, setCanal] = useState<Canal>("email");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (canal === "email" && !email.trim()) return;
    if (canal === "whatsapp" && !telefone.trim()) return;
    if (canal === "sms" && !telefone.trim()) return;
    if (!nome.trim() && canal !== "link") return;

    setLoading(true);
    try {
      await onConfirm({
        canal,
        destinatarioNome: nome || undefined,
        destinatarioEmail: email || undefined,
        destinatarioTelefone: telefone || undefined,
        destinatarioCpf: cpf.length === 11 ? cpf : undefined,
        mensagem: mensagem || undefined,
      });
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
        className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto premium-shadow border border-outline-variant/30"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-semibold text-on-surface mb-2">
          Dar cupom de presente
        </h3>
        <p className="text-on-surface-variant text-sm mb-6">
          Envie <strong>{cupom.titulo}</strong> ({cupom.codigo}) para alguém especial.
        </p>

        <div className="bg-gradient-to-br from-primary-container to-secondary-container rounded-2xl p-6 mb-6 text-center border border-primary/20">
          <span
            className="material-symbols-outlined text-primary text-4xl mb-2"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            card_giftcard
          </span>
          <p className="frik-label text-primary mb-1">Cartão virtual</p>
          <p className="text-lg font-bold text-on-surface">{cupom.titulo}</p>
          <p className="text-sm text-on-surface-variant mt-1">{cupom.codigo}</p>
          {mensagem && (
            <p className="text-sm italic mt-3 text-on-surface-variant border-t border-outline-variant/30 pt-3">
              &ldquo;{mensagem}&rdquo;
            </p>
          )}
        </div>

        <label className="block mb-4">
          <span className="frik-label text-on-surface-variant">Canal de envio</span>
          <select
            className="mt-1 w-full bg-surface-container-high rounded-xl px-4 py-3"
            value={canal}
            onChange={(e) => setCanal(e.target.value as Canal)}
          >
            <option value="email">E-mail</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
            <option value="link">Link de resgate</option>
          </select>
        </label>

        <div className="space-y-3 mb-4">
          <input
            placeholder="Nome do destinatário"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-surface-container-high rounded-xl px-4 py-3"
          />
          {(canal === "email" || canal === "link") && (
            <input
              placeholder="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-high rounded-xl px-4 py-3"
            />
          )}
          {(canal === "whatsapp" || canal === "sms") && (
            <input
              placeholder="Telefone (com DDD)"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full bg-surface-container-high rounded-xl px-4 py-3"
            />
          )}
          <input
            placeholder="CPF (opcional, 11 dígitos)"
            value={cpf}
            onChange={(e) => setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))}
            className="w-full bg-surface-container-high rounded-xl px-4 py-3"
          />
          <textarea
            placeholder="Mensagem no cartão (opcional)"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            className="w-full bg-surface-container-high rounded-xl px-4 py-3 min-h-[72px]"
          />
        </div>

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
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-full bg-primary text-on-primary font-bold disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar presente"}
          </button>
        </div>
      </div>
    </div>
  );
}
