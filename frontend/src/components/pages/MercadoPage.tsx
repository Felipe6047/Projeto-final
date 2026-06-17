"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import {
  ApiError,
  Cupom,
  formatarStatus,
  getMeusCupons,
} from "@/lib/api";



export function MercadoPage() {
  const { refreshPerfil, perfil } = useAuth();
  const { toast } = useToast();
  const [meus, setMeus] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const m = await getMeusCupons();
      setMeus(m);
    } catch (e) {
      toast((e as ApiError).message ?? "Erro ao carregar mercado", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <AppShell searchPlaceholder="Buscar cupons...">
      <div className="px-4 lg:px-[40px] pt-8 pb-20 max-w-7xl mx-auto">
        <section className="mb-16">
          <p className="frik-label text-primary mb-2">Minha Carteira</p>
          <h3 className="text-[32px] font-semibold mb-6">Meus Cupons</h3>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface-container-high rounded-[2rem] p-6 h-32 animate-pulse"></div>
              ))}
            </div>
          ) : meus.length === 0 ? (
            <div className="text-center py-12 bg-surface-container-low rounded-3xl border border-outline-variant/30">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">local_activity</span>
              <p className="text-on-surface-variant font-medium">Você ainda não tem cupons resgatados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
              {meus.map((c) => (
                <div key={c.id} className="bg-card-cream p-6 rounded-[2rem] premium-shadow border border-outline-variant/10 relative overflow-hidden group">
                  {/* Watermark icon */}
                  <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[100px] text-surface-container-highest/20 group-hover:scale-110 transition-transform">local_activity</span>
                  
                  <div className="relative z-10">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.status === "disponivel" ? "bg-primary-container text-on-primary-container" : "bg-surface-variant text-on-surface-variant"}`}>
                      {c.status === "disponivel" ? "Pronto para Uso" : formatarStatus(c.status)}
                    </span>
                    <h4 className="text-xl font-bold mt-4 leading-tight">{c.titulo}</h4>
                    <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider mt-4">Código do Cupom</p>
                    <p className="text-lg text-primary font-black tracking-widest">{c.codigo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
