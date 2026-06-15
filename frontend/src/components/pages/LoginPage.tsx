"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ApiError, register as apiRegister } from "@/lib/api";
import { cpfValido, mascaraCpf } from "@/lib/validators";

export function LoginPage() {
  const { login, perfil, logout, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [email, setEmail] = useState("ana@frik.demo");
  const [senha, setSenha] = useState("senha123");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [erro, setErro] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setSubmitting(true);
    try {
      const papel = await login(email, senha);
      router.push(papel === "admin" ? "/admin" : "/");
    } catch (e) {
      setErro((e as ApiError).message ?? "Não foi possível entrar.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCadastro(e: FormEvent) {
    e.preventDefault();
    setErro("");
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (!cpfValido(cpfLimpo)) {
      setErro("CPF inválido. Digite um CPF válido (apenas números).");
      return;
    }
    setSubmitting(true);
    try {
      await apiRegister(nome, email, senha, cpfLimpo);
      const papel = await login(email, senha);
      router.push(papel === "admin" ? "/admin" : "/");
    } catch (e) {
      setErro((e as ApiError).message ?? "Não foi possível cadastrar.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-6 right-6"><ThemeToggle /></div>
      <div className="w-full max-w-md bg-surface-container-low rounded-[2rem] p-8 premium-shadow border border-outline-variant/30">
        <Link href="/" className="text-[48px] font-bold text-primary leading-none">FRIK</Link>
        <p className="text-on-surface-variant mt-2 mb-8">
          {modo === "login" ? "Entre na sua conta de fidelização" : "Crie sua conta FRIK"}
        </p>

        {loading ? (
          <p className="text-center text-on-surface-variant">Carregando...</p>
        ) : perfil ? (
          <div className="space-y-4 text-center">
            <p>Olá, <strong>{perfil.nome}</strong></p>
            <button type="button" onClick={() => router.push(isAdmin ? "/admin" : "/")} className="w-full bg-primary text-on-primary py-4 rounded-full font-bold">
              Continuar
            </button>
            <button type="button" onClick={() => { logout(); setErro(""); }} className="w-full border border-outline-variant py-3 rounded-full">
              Sair
            </button>
          </div>
        ) : modo === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-surface-container-high rounded-xl px-4 py-3" required />
            <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full bg-surface-container-high rounded-xl px-4 py-3" required />
            {erro && <p className="text-sm text-error bg-error/10 p-3 rounded-lg">{erro}</p>}
            <button type="submit" disabled={submitting} className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-bold disabled:opacity-60">
              {submitting ? "Entrando..." : "Entrar"}
            </button>
            <button type="button" onClick={() => { setModo("cadastro"); setErro(""); }} className="w-full text-sm text-primary font-bold">
              Não tem conta? Cadastre-se
            </button>
          </form>
        ) : (
          <form onSubmit={handleCadastro} className="space-y-4">
            <input placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-surface-container-high rounded-xl px-4 py-3" required />
            <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-surface-container-high rounded-xl px-4 py-3" required />
            <input type="password" placeholder="Senha (mín. 6)" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full bg-surface-container-high rounded-xl px-4 py-3" required minLength={6} />
            <input placeholder="CPF" value={cpf} onChange={(e) => setCpf(mascaraCpf(e.target.value))} className="w-full bg-surface-container-high rounded-xl px-4 py-3" required />
            {erro && <p className="text-sm text-error bg-error/10 p-3 rounded-lg">{erro}</p>}
            <button type="submit" disabled={submitting} className="w-full bg-primary text-on-primary py-4 rounded-full font-bold disabled:opacity-60">
              {submitting ? "Cadastrando..." : "Criar conta"}
            </button>
            <button type="button" onClick={() => { setModo("login"); setErro(""); }} className="w-full text-sm text-on-surface-variant">
              Já tem conta? Entrar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
