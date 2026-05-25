"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ApiError } from "@/lib/api";

export function LoginPage() {
  const { login, perfil, logout, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("ana@frik.demo");
  const [senha, setSenha] = useState("senha123");
  const [erro, setErro] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setSubmitting(true);
    try {
      await login(email, senha);
      router.push("/");
    } catch (e) {
      setErro(
        (e as ApiError).message ??
          "Não foi possível entrar. Verifique e-mail, senha e se o backend está rodando."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="organic-blob bg-primary-fixed-dim w-96 h-96 -top-20 -right-20" />

      <div className="w-full max-w-md bg-surface-container-low rounded-[2rem] p-8 premium-shadow relative z-10 border border-outline-variant/30">
        <Link href="/" className="text-[48px] font-bold text-primary leading-none">
          FRIK
        </Link>
        <p className="text-on-surface-variant mt-2 mb-8">
          Entre na sua conta de fidelização
        </p>

        {loading ? (
          <p className="text-center text-on-surface-variant">Carregando...</p>
        ) : perfil ? (
          <div className="space-y-4 text-center">
            <p className="text-lg">
              Olá, <strong>{perfil.nome}</strong>
            </p>
            <p className="text-sm text-on-surface-variant">
              Nível {perfil.nivel}
            </p>
            <p className="text-[32px] font-bold text-primary">
              {perfil.pontos.toLocaleString("pt-BR")} pts
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full bg-primary text-on-primary py-4 rounded-full font-bold"
            >
              Ir para o início
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                setErro("");
              }}
              className="w-full border border-outline-variant py-3 rounded-full text-on-surface-variant"
            >
              Sair
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="frik-label text-on-surface-variant block mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-base"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="frik-label text-on-surface-variant block mb-2">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-base"
                required
                autoComplete="current-password"
              />
            </div>
            {erro && (
              <p className="text-sm text-error bg-error/10 border border-error/30 p-3 rounded-lg">
                {erro}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold disabled:opacity-60"
            >
              {submitting ? "Entrando..." : "Entrar"}
            </button>
            <p className="text-center text-xs text-on-surface-variant">
              Teste: ana@frik.demo / senha123 (com backend e seed no MySQL)
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
