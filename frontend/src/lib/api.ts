const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("frik_token");
}

export function setToken(token: string) {
  localStorage.setItem("frik_token", token);
}

export function clearToken() {
  localStorage.removeItem("frik_token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw data;
  }
  return data as T;
}

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  nivelId: number;
  pontos: number;
}

export interface LoginResponse {
  token: string;
  usuario: AuthUser;
}

export async function login(email: string, senha: string) {
  return api<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}

export interface PerfilResponse {
  id: number;
  nome: string;
  email: string;
  pontos: number;
  nivel: string;
  nivel_slug: string;
}

export async function getPerfil() {
  return api<PerfilResponse>("/auth/perfil");
}

export async function getMeuNivel() {
  return api<{
    pontos: number;
    nome: string;
    slug: string;
    progresso_percentual: number;
  }>("/ranking/meu-nivel");
}

export async function getRankingGlobal(limite = 20) {
  return api<
    {
      id: number;
      nome: string;
      nivel: string;
      pontos: number;
      posicao: number;
      avatar_url?: string;
    }[]
  >(`/ranking/global?limite=${limite}`);
}

export async function getBeneficios() {
  return api<
    {
      nome: string;
      slug: string;
      trocas_mes: number | null;
      pode_presentear_cupom: number;
      pode_presentear_produto: number;
      valor_max_presente: number | null;
    }[]
  >("/ranking/beneficios");
}

export async function getMeusCupons() {
  return api<
    {
      id: number;
      codigo: string;
      titulo: string;
      categoria: string;
      status: string;
      validade_ate: string;
    }[]
  >("/mercado-cupons/meus-cupons");
}

export async function getMercadoCupons() {
  return api<
    {
      id: number;
      codigo: string;
      titulo: string;
      categoria: string;
      proprietario_nome?: string;
      nivel_slug?: string;
      validade_ate: string;
    }[]
  >("/mercado-cupons");
}

export async function getProdutos() {
  return api<
    {
      id: number;
      nome: string;
      descricao: string;
      preco_reais: number;
      preco_pontos: number;
      imagem_url?: string;
    }[]
  >("/produtos");
}
