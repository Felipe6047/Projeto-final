"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getNotificacoes,
  marcarNotificacaoLida,
  marcarTodasNotificacoesLidas,
  Notificacao,
} from "@/lib/api";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [loading, setLoading] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotificacoes();
      setNotificacoes(data.notificacoes);
      setNaoLidas(data.naoLidas);
    } catch {
      setNotificacoes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) carregar();
  }, [open, carregar]);

  async function marcarLida(id: string) {
    await marcarNotificacaoLida(id);
    await carregar();
  }

  async function marcarTodas() {
    await marcarTodasNotificacoesLidas();
    await carregar();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]" onClick={onClose}>
      <div
        className="absolute right-4 top-20 w-full max-w-md bg-surface-container-lowest rounded-2xl premium-shadow border border-outline-variant/30 max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/20">
          <h3 className="font-bold text-lg">Notificações</h3>
          {naoLidas > 0 && (
            <button
              type="button"
              onClick={marcarTodas}
              className="text-xs text-primary font-bold"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {loading ? (
            <p className="p-4 text-sm text-on-surface-variant">Carregando...</p>
          ) : notificacoes.length === 0 ? (
            <p className="p-4 text-sm text-on-surface-variant">
              Nenhuma notificação.
            </p>
          ) : (
            notificacoes.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => !n.lida && marcarLida(n.id)}
                className={`w-full text-left p-4 rounded-xl mb-2 transition-colors ${
                  n.lida
                    ? "bg-surface-container-high/50 opacity-70"
                    : "bg-primary-container/15 hover:bg-primary-container/25"
                }`}
              >
                <p className="font-bold text-sm">{n.titulo}</p>
                <p className="text-xs text-on-surface-variant mt-1">{n.mensagem}</p>
                <p className="text-[10px] text-on-surface-variant mt-2">
                  {new Date(n.criado_em).toLocaleString("pt-BR")}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function useNotificacoesCount() {
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    getNotificacoes()
      .then((d) => setNaoLidas(d.naoLidas))
      .catch(() => setNaoLidas(0));
  }, []);

  return naoLidas;
}
