"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ModalPresenteCupom } from "@/components/modals/ModalPresenteCupom";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import {
  ApiError,
  Cupom,
  formatarStatus,
  getCuponsParaResgate,
  getMeusCupons,
  presentearCupom,
  resgatarCupomComPontos,
} from "@/lib/api";

type TemplateResgate = {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  preco_pontos: number;
  dias_validade: number;
  limite_por_usuario?: number | null;
  limite_total?: number | null;
  qtd_vendida?: string | number;
};

export function MercadoPage() {
  const { refreshPerfil, perfil } = useAuth();
  const { toast } = useToast();
  const [meus, setMeus] = useState<Cupom[]>([]);
  const [templates, setTemplates] = useState<TemplateResgate[]>([]);
  const [presenteCupom, setPresenteCupom] = useState<Cupom | null>(null);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [m, t] = await Promise.all([getMeusCupons(), getCuponsParaResgate()]);
      setMeus(m);
      setTemplates(t);
    } catch (e) {
      toast((e as ApiError).message ?? "Erro ao carregar mercado", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleResgatar(templateId: number, custo: number) {
    if ((perfil?.pontos ?? 0) < custo) {
      toast("Pontos insuficientes", "error");
      return;
    }
    try {
      const res = await resgatarCupomComPontos(templateId);
      toast(`Cupom resgatado! Código: ${res.codigo}`, "success");
      await carregar();
      await refreshPerfil();
    } catch (e) {
      toast((e as ApiError).message, "error");
    }
  }

  return (
    <AppShell searchPlaceholder="Buscar cupons...">
      <div className="px-4 lg:px-[40px] pt-8 pb-20">
        <section className="mb-16">
          <p className="frik-label text-primary mb-2">Gestão de benefícios</p>
          <h3 className="text-[32px] font-semibold mb-6">Meus cupons</h3>
          {loading ? (
            <p className="text-on-surface-variant">Carregando...</p>
          ) : meus.length === 0 ? (
            <p className="text-on-surface-variant">Você ainda não tem cupons.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
              {meus.map((c) => (
                <div key={c.id} className="bg-card-cream p-6 rounded-[2rem] premium-shadow">
                  <span className="frik-label text-on-surface-variant">{formatarStatus(c.status)}</span>
                  <h4 className="text-xl font-semibold mt-2">{c.titulo}</h4>
                  <p className="text-xs text-primary font-bold mt-4">{c.codigo}</p>
                  <p className="text-xs text-on-surface-variant mt-3">{c.status === "disponivel" ? "Disponível" : c.status}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-[32px] font-semibold mb-6">Compre com pontos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((t) => {
              const qtdComprada = meus.filter(m => m.template_id === t.id).length;
              const limiteUsuario = t.limite_por_usuario != null && qtdComprada >= t.limite_por_usuario;
              const esgotado = t.limite_total != null && Number(t.qtd_vendida) >= t.limite_total;
              const disable = limiteUsuario || esgotado;
              const label = esgotado ? "Esgotado" : limiteUsuario ? "Limite atingido" : "Resgatar";

              return (
                <div key={t.id} className="bg-surface-container-low rounded-[2rem] overflow-hidden premium-shadow">
                  <div className="h-36 bg-secondary-container flex items-center justify-center relative">
                    <span className="material-symbols-outlined text-primary text-5xl opacity-40">local_offer</span>
                    {t.limite_total != null && (
                      <span className="absolute top-4 right-4 bg-error text-on-error text-[10px] font-bold px-2 py-1 rounded-full">
                        Restam: {Math.max(0, t.limite_total - Number(t.qtd_vendida))}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <span className="text-xs text-on-surface-variant">{t.categoria}</span>
                    <h5 className="text-xl font-semibold mt-1">{t.titulo}</h5>
                    <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">{t.descricao}</p>
                    <p className="text-primary font-bold mt-4">{t.preco_pontos.toLocaleString("pt-BR")} pontos</p>
                    <p className="text-xs text-on-surface-variant mb-1">Válido por {t.dias_validade} dias</p>
                    {t.limite_por_usuario !== null && (
                      <p className="text-xs text-secondary font-bold">Limite: {t.limite_por_usuario} por pessoa ({qtdComprada}/{t.limite_por_usuario})</p>
                    )}
                    <button
                      type="button"
                      disabled={disable}
                      onClick={() => handleResgatar(t.id, t.preco_pontos)}
                      className="mt-4 w-full py-3 rounded-xl font-bold bg-primary text-on-primary hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                      {label}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {presenteCupom && (
        <ModalPresenteCupom
          cupom={presenteCupom}
          onClose={() => setPresenteCupom(null)}
          onConfirm={async (data) => {
            await presentearCupom({ cupomId: presenteCupom.id, ...data });
            toast("Presente enviado!", "success");
            setPresenteCupom(null);
            await carregar();
          }}
        />
      )}
    </AppShell>
  );
}
