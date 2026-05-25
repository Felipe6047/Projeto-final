const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public detalhes?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data as { erro?: string }).erro ?? `Erro ${res.status} na requisição`;
    throw new ApiError(msg, res.status, (data as { detalhes?: unknown }).detalhes);
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

export interface PerfilResponse {
  id: number;
  nome: string;
  email: string;
  pontos: number;
  nivel: string;
  nivel_slug: string;
}

export interface Cupom {
  id: number;
  codigo: string;
  titulo: string;
  categoria?: string;
  status: string;
  validade_ate: string;
  proprietario_nome?: string;
  nivel_slug?: string;
}

export async function login(email: string, senha: string) {
  return api<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
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

export async function getEventoAtivo() {
  return api<{
    titulo: string;
    descricao?: string;
    trocas_extras: number;
  } | null>("/ranking/evento-ativo");
}

export async function getMeusCupons() {
  return api<Cupom[]>("/mercado-cupons/meus-cupons");
}

export async function getMercadoCupons(params?: {
  busca?: string;
  categoria?: string;
}) {
  const q = new URLSearchParams();
  if (params?.busca) q.set("busca", params.busca);
  if (params?.categoria) q.set("categoria", params.categoria);
  const qs = q.toString();
  return api<Cupom[]>(`/mercado-cupons${qs ? `?${qs}` : ""}`);
}

export async function getMercadoConfig() {
  return api<{ diasMinimosValidade: number; taxaTrocaPontos: number }>(
    "/mercado-cupons/config"
  );
}

export async function oferecerCupom(cupomId: number) {
  return api<{ ok: boolean }>(`/mercado-cupons/oferecer/${cupomId}`, {
    method: "POST",
  });
}

export async function solicitarTroca(body: {
  cupomSolicitadoId: number;
  cupomOfertadoId: number;
  aceitarTaxa: boolean;
}) {
  return api<{ propostaId: number }>("/mercado-cupons/solicitar-troca", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getProdutos() {
  return api<
    {
      id: number;
      nome: string;
      descricao: string;
      preco_reais: number;
      preco_pontos: number;
    }[]
  >("/produtos");
}

export async function presentearCupom(body: {
  cupomId: number;
  canal: "email" | "whatsapp" | "sms" | "link";
  mensagem?: string;
  destinatarioNome?: string;
  destinatarioEmail?: string;
}) {
  return api<{ presenteId: number; codigoResgate: string }>("/presentes/cupom", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function criarPedidoPresente(body: {
  itens: { produtoId: number; quantidade: number }[];
  pontosUsados: number;
  valorReais: number;
  destinatario: { nome: string; email?: string };
  endereco: Record<string, string>;
  mensagem?: string;
}) {
  return api<{ pedidoId: number; status: string }>("/presentes/produto", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function formatarStatus(status: string) {
  const map: Record<string, string> = {
    disponivel: "Disponível",
    oferecido_troca: "No mercado",
    em_troca: "Em troca",
    resgatado: "Resgatado",
    presenteado: "Presenteado",
    expirado: "Expirado",
    pendente: "Pendente",
    aceita: "Aceita",
    recusada: "Recusada",
  };
  return map[status] ?? status.replace(/_/g, " ");
}
