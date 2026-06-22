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
    cache: "no-store",
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let msg =
      (data as { erro?: string }).erro ?? `Erro ${res.status} na requisição`;
    const detalhes = (data as { detalhes?: unknown }).detalhes;
    if (detalhes && typeof detalhes === "object") {
      const detailsMsg = Object.values(detalhes).flat().join(", ");
      if (detailsMsg) msg += `: ${detailsMsg}`;
    }
    throw new ApiError(msg, res.status, detalhes);
  }
  return data as T;
}

export type PapelUsuario = "cliente" | "admin";

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  nivelId: number;
  pontos: number;
  papel?: PapelUsuario;
}

export interface LoginResponse {
  token: string;
  usuario: AuthUser;
}

export interface PerfilResponse {
  id: number;
  nome: string;
  email: string;
  telefone?: string | null;
  cpf?: string | null;
  pontos: number;
  saldo_wallet?: string | number;
  kyc_status?: "pendente" | "aprovado";
  nivel: string;
  nivel_slug: string;
  nivel_ordem?: number;
  dias_ofensiva: number;
  avatar_url?: string | null;
  papel?: PapelUsuario;
}

export interface HistoricoTroca {
  id: string;
  status: "pendente" | "aceita" | "recusada" | "cancelada";
  taxa_pontos: number;
  criado_em: string;
  respondido_em: string | null;
  cupom_solicitante: string;
  cupom_proprietario: string;
  solicitante_id: number;
  proprietario_id: number;
}

export interface HistoricoPontosItem {
  id: string;
  valor: number;
  saldo_apos: number;
  tipo: string;
  descricao: string | null;
  criado_em: string;
}

export async function getHistoricoPontos(limite = 30) {
  return api<HistoricoPontosItem[]>(`/auth/historico-pontos?limite=${limite}`);
}

export async function processarNotaFiscal(chave: string, vincularCpf?: boolean) {
  return api<{
    status: string;
    cpfNota?: string;
    valorTotal?: number;
    pontosGerados?: number;
    saldoPontos?: number;
  }>("/compra/nota-fiscal", {
    method: "POST",
    body: JSON.stringify({ chave, vincularCpf }),
  });
}

export async function simuladorBuscarClientePorCpf(cpf: string) {
  return api<{
    id: number;
    nome: string;
    email: string;
    pontos: number;
    nivel: string;
  }>(`/simulador-caixa/cliente/${cpf.replace(/\D/g, "")}`);
}

export async function simuladorVendaPorCpf(cpf: string, valorTotal: number) {
  return api<{
    usuarioId: number;
    valorTotal: number;
    pontosGerados: number;
    saldoPontos: number;
  }>("/simulador-caixa/venda", {
    method: "POST",
    body: JSON.stringify({ cpf, valorTotal }),
  });
}

export async function simuladorGerarNota(valorTotal: number, cpf?: string) {
  return api<{
    chave: string;
    valorTotal: number;
    cpf: string | null;
    pontosEstimados: number;
  }>("/simulador-caixa/nota", {
    method: "POST",
    body: JSON.stringify({ valorTotal, cpf }),
  });
}

export async function buscarUsuarios(q: string) {
  return api<
    { id: number; nome: string; email: string; cpf: string | null; nivel: string }[]
  >(`/auth/buscar-usuarios?q=${encodeURIComponent(q)}`);
}

export async function verificarKyc() {
  return api<{ kycStatus: string }>("/auth/kyc/verificar", { method: "POST" });
}

export async function excluirConta() {
  return api<{ ok: boolean }>("/auth/me", { method: "DELETE" });
}

export async function getExtratoWallet(limite = 20) {
  return api<
    {
      id: string;
      valor: string;
      saldo_apos: string;
      tipo: string;
      descricao: string | null;
      criado_em: string;
    }[]
  >(`/auth/extrato-wallet?limite=${limite}`);
}

export async function confirmarPagamentoPedido(pedidoId: string) {
  return api<{ pedidoId: string; status: string }>(
    `/presentes/pedidos/${pedidoId}/confirmar-pagamento`,
    { method: "POST" }
  );
}

export async function registrarCompra(valorTotal: number) {
  return api<{
    compraId: string;
    valorTotal: number;
    pontosGerados: number;
    saldoPontos: number;
  }>("/compra", {
    method: "POST",
    body: JSON.stringify({ valorTotal }),
  });
}

export async function listarCompras(limite = 10) {
  return api<
    {
      id: string;
      valor_total: string;
      pontos_gerados: number;
      criado_em: string;
    }[]
  >(`/compra?limite=${limite}`);
}

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  criado_em: string;
}

export async function getNotificacoes(apenasNaoLidas = false) {
  return api<{ notificacoes: Notificacao[]; naoLidas: number }>(
    `/notificacoes${apenasNaoLidas ? "?apenasNaoLidas=1" : ""}`
  );
}

export async function marcarNotificacaoLida(id: string) {
  return api<{ lida: boolean }>(`/notificacoes/${id}/lida`, { method: "PATCH" });
}

export async function marcarTodasNotificacoesLidas() {
  return api<{ atualizadas: number }>("/notificacoes/lidas", { method: "PATCH" });
}

export async function getPresentePorCodigo(codigo: string) {
  return api<{
    id: string;
    status: string;
    mensagem: string | null;
    destinatarioNome: string | null;
    cupom: { codigo: string; titulo: string; categoria: string; validadeAte: string };
    remetenteNome: string;
  }>(`/presentes/cupom/${codigo}`);
}

export async function resgatarPresenteCupom(codigo: string) {
  return api<{ cupomId: string; codigo: string; titulo: string }>(
    `/presentes/cupom/${codigo}/resgatar`,
    { method: "POST" }
  );
}

export async function getTodasConquistas() {
  return api<
    {
      slug: string;
      nome: string;
      descricao: string;
      icone: string;
      desbloqueada: number;
      desbloqueada_em: string | null;
    }[]
  >("/ranking/conquistas?todas=1");
}

export async function listarMinhasSalas() {
  return api<
    { id: number; nome: string; codigo_convite: string; criado_em: string }[]
  >("/salas");
}

export async function criarSala(nome: string) {
  return api<{ salaId: number; nome: string; codigoConvite: string }>("/salas", {
    method: "POST",
    body: JSON.stringify({ nome }),
  });
}

export async function entrarSala(codigo: string) {
  return api<{ salaId: number; nome: string; codigoConvite: string }>(
    `/salas/${codigo}/entrar`,
    { method: "POST" }
  );
}

export async function sairSala(codigo: string) {
  return api<{ ok: boolean }>(`/salas/${codigo}/sair`, { method: "DELETE" });
}

export async function excluirSala(codigo: string) {
  return api<{ ok: boolean }>(`/salas/${codigo}`, { method: "DELETE" });
}

export async function detalheSala(codigo: string) {
  return api<{
    id: number;
    nome: string;
    codigo_convite: string;
    criador_id: number;
    criador_nome: string;
    membros: { id: number; nome: string; nivel: string; nivel_slug: string }[];
    totalMembros: number;
  }>(`/salas/${codigo}`);
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
  valor_minimo_compra?: number;
  desconto_percentual?: number;
  template_id?: number;
}

export async function login(email: string, senha: string) {
  return api<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}

export async function register(
  nome: string,
  email: string,
  senha: string,
  cpf: string
) {
  return api<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ nome, email, senha, cpf }),
  });
}

export async function getMissoesAtivas() {
  return api<
    {
      id: number;
      titulo: string;
      descricao: string;
      pontos_recompensa: number;
      tipo_meta: string;
      meta_valor: number;
      progresso: number;
      concluida: number;
    }[]
  >("/missoes");
}

export async function getCampanhasAtivas() {
  return api<
    { id: number; titulo: string; descricao: string | null; fim_em: string }[]
  >("/campanhas/ativas");
}

export interface CupomTemplate {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  preco_pontos: number;
  dias_validade: number;
  limite_por_usuario?: number | null;
  limite_total?: number | null;
  qtd_vendida?: string | number;
}

export async function getCuponsParaResgate() {
  return api<CupomTemplate[]>("/mercado-cupons/templates");
}

export async function resgatarCupomComPontos(templateId: number) {
  return api<{
    cupomId: string;
    codigo: string;
    titulo: string;
    pontosUsados: number;
    saldoPontos: number;
  }>(`/mercado-cupons/resgatar/${templateId}`, { method: "POST" });
}

export async function getMeusAmigos() {
  return api<
    {
      id: number;
      nome: string;
      email: string;
      nivel: string;
      tem_endereco: number;
    }[]
  >("/amigos");
}

export async function buscarUsuariosAmigos(q: string) {
  return api<{ id: number; nome: string; email: string; nivel: string }[]>(
    `/amigos/busca?q=${encodeURIComponent(q)}`
  );
}

export async function adicionarAmigo(amigoId: number) {
  return api<{ ok: boolean }>("/amigos", {
    method: "POST",
    body: JSON.stringify({ amigoId }),
  });
}

export async function removerAmigo(amigoId: number) {
  return api<{ ok: boolean }>(`/amigos/${amigoId}`, { method: "DELETE" });
}

export async function getEnderecoAmigo(amigoId: number) {
  return api<{
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
  } | null>(`/amigos/${amigoId}/endereco`);
}

export interface Endereco {
  id: number;
  apelido: string | null;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
  principal: boolean;
}

export interface CartaoCredito {
  id: number;
  apelido: string | null;
  numero: string;
  nomeTitular: string;
  validade: string;
  cvv: string;
  principal: boolean;
}

export async function listarMeusEnderecos() {
  return api<Endereco[]>("/enderecos");
}

export async function criarEndereco(dados: Partial<Endereco>) {
  return api<Endereco>("/enderecos", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function atualizarEndereco(id: number, dados: Partial<Endereco>) {
  return api<Endereco>(`/enderecos/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export async function excluirEndereco(id: number) {
  return api<{ ok: boolean }>(`/enderecos/${id}`, { method: "DELETE" });
}

export async function listarMeusCartoes() {
  return api<CartaoCredito[]>("/cartoes");
}

export async function criarCartao(dados: Partial<CartaoCredito>) {
  return api<CartaoCredito>("/cartoes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function atualizarCartao(id: number, dados: Partial<CartaoCredito>) {
  return api<CartaoCredito>(`/cartoes/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export async function excluirCartao(id: number) {
  return api<{ ok: boolean }>(`/cartoes/${id}`, { method: "DELETE" });
}

export async function getRankingMensal(limite = 10) {
  return api<RankingItem[]>(`/ranking/mensal?limite=${limite}`);
}

export async function getRankingTrocas(limite = 10) {
  return api<RankingItem[]>(`/ranking/trocas?limite=${limite}`);
}

export async function getRankingPresentes(limite = 10) {
  return api<RankingItem[]>(`/ranking/presentes?limite=${limite}`);
}

export async function getRankingConquistasTab(limite = 10) {
  return api<RankingItem[]>(`/ranking/conquistas-ranking?limite=${limite}`);
}

export interface RankingItem {
  id: number;
  posicao: number;
  nome: string;
  nivel: string;
  pontos: number;
}

export async function getCuponsMembrosSala(codigo: string) {
  return api<
    {
      id: number;
      codigo: string;
      titulo: string;
      proprietario_nome: string;
      usuario_id: number;
    }[]
  >(`/salas/${codigo}/cupons-membros`);
}

export async function getPropostasSala(codigo: string) {
  return api<
    {
      id: string;
      status: string;
      solicitante_id: number;
      proprietario_id: number;
      solicitante_nome: string;
      proprietario_nome: string;
    }[]
  >(`/salas/${codigo}/propostas`);
}

export async function proporTrocaSala(
  codigo: string,
  cupomOfertadoId: number,
  cupomSolicitadoId: number
) {
  return api<{ propostaId: string }>(`/salas/${codigo}/propor-troca`, {
    method: "POST",
    body: JSON.stringify({ cupomOfertadoId, cupomSolicitadoId }),
  });
}

export async function responderProposta(propostaId: number, aceitar: boolean) {
  return api<{ status: string }>(`/mercado-cupons/propostas/${propostaId}`, {
    method: "PATCH",
    body: JSON.stringify({ aceitar }),
  });
}

export async function listarPedidosPresente() {
  return api<
    {
      id: string;
      destinatario_nome: string;
      status: string;
      valor_reais: string;
      pontos_usados: number;
      criado_em: string;
    }[]
  >("/presentes/pedidos");
}

export async function avancarStatusPedido(pedidoId: string) {
  return api<{ pedidoId: string; status: string }>(
    `/presentes/pedidos/${pedidoId}/status`,
    { method: "PATCH" }
  );
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

export async function listarProdutos(page = 1, limit = 10, categoria?: string) {
  let url = `/produtos?page=${page}&limit=${limit}`;
  if (categoria && categoria !== "Todos") {
    url += `&categoria=${encodeURIComponent(categoria)}`;
  }
  return api<{
    data: {
      id: number;
      nome: string;
      descricao: string | null;
      preco_reais: string | number;
      preco_pontos: number;
      estoque: number;
      imagem_url: string | null;
      categoria?: string;
    }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(url);
}

export async function presentearCupom(body: {
  cupomId: number;
  canal: "email" | "whatsapp" | "sms" | "link";
  mensagem?: string;
  destinatarioNome?: string;
  destinatarioEmail?: string;
  destinatarioTelefone?: string;
  destinatarioCpf?: string;
}) {
  return api<{ presenteId: number; codigoResgate: string; link?: string }>(
    "/presentes/cupom",
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}

export async function criarPedidoPresente(body: {
  itens: { produtoId: number; quantidade: number }[];
  pontosUsados: number;
  valorReais: number;
  walletUsado?: number;
  valorPix?: number;
  destinatario: {
    nome: string;
    email?: string;
    telefone?: string;
    cpf?: string;
    usuarioId?: number;
  };
  endereco: Record<string, string>;
  mensagem?: string;
  embrulho?: boolean;
  enviarSurpresa?: boolean;
  isPessoal?: boolean;
}) {
  return api<{
    pedidoId: number;
    status: string;
    aguardaPix?: boolean;
    valorPix?: number;
  }>("/presentes/produto", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// --- Admin ---
export interface AdminDashboard {
  clientesAtivos: number;
  trocasConcluidas: number;
  trocasPendentes: number;
  ticketMedio: number;
  cuponsAtivos: number;
  pedidosPendentes: number;
  campanhasAtivas: number;
  // Gamification Metrics
  missoesConcluidas?: number;
  trofeusDesbloqueados?: number;
  retencao3Dias?: number;
}

export async function adminGetDashboard() {
  return api<AdminDashboard>("/admin/dashboard");
}

export async function adminGetSegmentacao() {
  return api<
    {
      nivel: string;
      nivel_slug: string;
      total_clientes: number;
      pontos_totais: number;
      media_pontos: number;
    }[]
  >("/admin/relatorios/segmentacao");
}

export async function adminListCampanhas() {
  return api<CampanhaAdmin[]>("/admin/campanhas");
}

export async function adminCreateCampanha(body: Partial<CampanhaAdmin>) {
  return api<{ id: number }>("/admin/campanhas", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function adminUpdateCampanha(id: number, body: Partial<CampanhaAdmin>) {
  return api<{ ok: boolean }>(`/admin/campanhas/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function adminDeleteCampanha(id: number) {
  return api<{ ok: boolean }>(`/admin/campanhas/${id}`, { method: "DELETE" });
}

export interface CampanhaAdmin {
  id?: number;
  titulo: string;
  descricao?: string;
  segmento_json?: Record<string, unknown>;
  inicio_em: string;
  fim_em: string;
  ativa?: boolean | number;
}

export interface CupomTemplateAdmin {
  id?: number;
  titulo: string;
  descricao?: string;
  categoria: string;
  desconto_percentual?: number;
  desconto_valor?: number;
  valor_minimo_compra?: number;
  dias_validade?: number;
  ativo?: boolean | number;
  limite_por_usuario?: number | null;
  limite_total?: number | null;
  preco_pontos?: number;
}

export async function adminListCupomTemplates() {
  return api<CupomTemplateAdmin[]>("/admin/cupom-templates");
}

export async function adminCreateCupomTemplate(body: Omit<CupomTemplateAdmin, "id">) {
  return api<{ id: number }>("/admin/cupom-templates", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function adminUpdateCupomTemplate(
  id: number,
  body: Partial<CupomTemplateAdmin>
) {
  return api<{ ok: boolean }>(`/admin/cupom-templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function adminDeleteCupomTemplate(id: number) {
  return api<{ ok: boolean }>(`/admin/cupom-templates/${id}`, {
    method: "DELETE",
  });
}

export interface ProdutoAdmin {
  id?: number;
  nome: string;
  descricao?: string;
  preco_reais: number;
  preco_pontos: number;
  estoque?: number;
  ativo?: boolean | number;
  categoria?: string;
  imagem_url?: string;
}

export async function adminListProdutos() {
  return api<ProdutoAdmin[]>("/admin/produtos");
}

export async function adminCreateProduto(body: Omit<ProdutoAdmin, "id">) {
  return api<{ id: number }>("/admin/produtos", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function adminUpdateProduto(id: number, body: Partial<ProdutoAdmin>) {
  return api<{ ok: boolean }>(`/admin/produtos/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function adminDeleteProduto(id: number) {
  return api<{ ok: boolean }>(`/admin/produtos/${id}`, { method: "DELETE" });
}

export interface MissaoAdmin {
  id?: number;
  titulo: string;
  descricao?: string;
  pontos_recompensa: number;
  meta_valor?: number;
  tipo_meta: "compras" | "trocas" | "presentes" | "pontos";
  ativa?: boolean | number;
  inicio_em?: string;
  fim_em?: string;
}

export async function adminListMissoes() {
  return api<MissaoAdmin[]>("/admin/missoes");
}

export async function adminCreateMissao(body: Omit<MissaoAdmin, "id">) {
  return api<{ id: number }>("/admin/missoes", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function adminUpdateMissao(id: number, body: Partial<MissaoAdmin>) {
  return api<{ ok: boolean }>(`/admin/missoes/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function adminDeleteMissao(id: number) {
  return api<{ ok: boolean }>(`/admin/missoes/${id}`, { method: "DELETE" });
}

export interface EventoAdmin {
  id?: number;
  titulo: string;
  descricao?: string;
  trocas_extras?: number;
  inicio_em: string;
  fim_em: string;
  ativo?: boolean | number;
}

export async function adminListEventos() {
  return api<EventoAdmin[]>("/admin/eventos");
}

export async function adminCreateEvento(body: Omit<EventoAdmin, "id">) {
  return api<{ id: number }>("/admin/eventos", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function adminUpdateEvento(id: number, body: Partial<EventoAdmin>) {
  return api<{ ok: boolean }>(`/admin/eventos/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function adminDeleteEvento(id: number) {
  return api<{ ok: boolean }>(`/admin/eventos/${id}`, { method: "DELETE" });
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
