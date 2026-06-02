"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import {
  ApiError,
  getPresentePorCodigo,
  getToken,
  resgatarPresenteCupom,
} from "@/lib/api";

export function ResgatarPresentePage({ codigo }: { codigo: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { refreshPerfil } = useAuth();
  const [presente, setPresente] = useState<Awaited<
    ReturnType<typeof getPresentePorCodigo>
  > | null>(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(true);
  const [resgatando, setResgatando] = useState(false);

  useEffect(() => {
    getPresentePorCodigo(codigo)
      .then(setPresente)
      .catch((e: ApiError) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [codigo]);

  async function resgatar() {
    if (!getToken()) {
      router.push(`/login?redirect=/presentes/cupom/${codigo}`);
      return;
    }
    setResgatando(true);
    try {
      const res = await resgatarPresenteCupom(codigo);
      toast(`Cupom ${res.titulo} resgatado!`, "success");
      await refreshPerfil();
      router.push("/mercado-cupons");
    } catch (e) {
      toast((e as ApiError).message, "error");
    } finally {
      setResgatando(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="px-4 py-20 text-on-surface-variant">Carregando presente...</div>
      </AppShell>
    );
  }

  if (erro || !presente) {
    return (
      <AppShell>
        <div className="px-4 lg:px-[40px] py-20 max-w-lg">
          <p className="text-error">{erro || "Presente não encontrado"}</p>
          <Link href="/" className="text-primary font-bold mt-4 inline-block">
            Voltar ao início
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-4 lg:px-[40px] py-12 max-w-lg mx-auto">
        <div className="bg-gradient-to-br from-primary-container to-secondary-container rounded-3xl p-8 text-center premium-shadow mb-8">
          <span
            className="material-symbols-outlined text-primary text-5xl mb-4"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            card_giftcard
          </span>
          <p className="frik-label text-primary">Presente de {presente.remetenteNome}</p>
          <h1 className="text-2xl font-bold mt-2">{presente.cupom.titulo}</h1>
          <p className="text-sm text-on-surface-variant mt-2">{presente.cupom.codigo}</p>
          {presente.mensagem && (
            <p className="italic mt-4 text-on-surface-variant border-t border-outline-variant/30 pt-4">
              &ldquo;{presente.mensagem}&rdquo;
            </p>
          )}
        </div>
        <p className="text-sm text-on-surface-variant mb-6 text-center">
          Válido até{" "}
          {new Date(presente.cupom.validadeAte).toLocaleDateString("pt-BR")}
        </p>
        <button
          type="button"
          disabled={resgatando}
          onClick={resgatar}
          className="w-full bg-primary text-on-primary py-4 rounded-full font-bold disabled:opacity-50"
        >
          {resgatando ? "Resgatando..." : "Resgatar cupom na minha conta"}
        </button>
        {!getToken() && (
          <p className="text-xs text-center mt-4 text-on-surface-variant">
            Você precisará fazer login para resgatar.
          </p>
        )}
      </div>
    </AppShell>
  );
}
