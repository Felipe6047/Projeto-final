"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export function LoginPage() {
  const { login, perfil, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("ana@frik.demo");
  const [senha, setSenha] = useState("senha123");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      await login(email, senha);
      router.push("/");
    } catch (err: unknown) {
      const data = err as { erro?: string };
      setErro(data?.erro ?? "Falha no login. Verifique email e senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="organic-blob bg-primary-fixed-dim w-96 h-96 -top-20 -right-20" />
      <div className="w-full max-w-md bg-surface-container-low rounded-[2rem] p-card-padding premium-shadow relative z-10 border border-outline-variant/30">
        <Link href="/" className="text-display-lg font-bold text-primary block mb-2">
          FRIK
        </Link>
        <p className="text-on-surface-variant text-body-md mb-8">
          Entre na sua conta premium
        </p>

        {perfil ? (
          <div className="text-center space-y-4">
            <p className="text-body-lg">
              Logado como <strong>{perfil.nome}</strong> ({perfil.nivel})
            </p>
            <p className="text-primary font-bold text-stat-lg">
              {perfil.pontos.toLocaleString("pt-BR")} pts
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full bg-primary text-on-primary py-4 rounded-full font-bold"
            >
              Ir ao Dashboard
            </button>
            <button
              type="button"
              onClick={logout}
              className="w-full border border-outline-variant py-3 rounded-full text-on-surface-variant"
            >
              Sair
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-label-caps text-on-surface-variant uppercase block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-container-high rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="text-label-caps text-on-surface-variant uppercase block mb-2">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-surface-container-high rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            {erro && (
              <p className="text-error text-sm bg-error-container/30 p-3 rounded-lg">
                {erro}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold hover:brightness-105 disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
            <p className="text-center text-sm text-on-surface-variant">
              Teste: ana@frik.demo / senha123
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
