import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/database";

export async function getDashboard() {
  const [[usuarios]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM usuario WHERE ativo = 1`
  );
  const [[trocas]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM proposta_troca WHERE status = 'aceita'`
  );
  const [[trocasPendentes]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM proposta_troca WHERE status = 'pendente'`
  );
  const [[ticket]] = await pool.query<RowDataPacket[]>(
    `SELECT COALESCE(AVG(valor_total), 0) AS media FROM compra`
  );
  const [[cupons]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM cupom_usuario
     WHERE status IN ('disponivel', 'oferecido_troca')`
  );
  const [[pedidos]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM pedido_presente WHERE status = 'pendente'`
  );
  const [[campanhas]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM campanha
     WHERE ativa = 1 AND NOW() BETWEEN inicio_em AND fim_em`
  );

  return {
    clientesAtivos: Number(usuarios.total),
    trocasConcluidas: Number(trocas.total),
    trocasPendentes: Number(trocasPendentes.total),
    ticketMedio: Number(ticket.media),
    cuponsAtivos: Number(cupons.total),
    pedidosPendentes: Number(pedidos.total),
    campanhasAtivas: Number(campanhas.total),
  };
}

export async function getSegmentacao() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT n.nome AS nivel, n.slug AS nivel_slug, n.ordem,
            COUNT(u.id) AS total_clientes,
            COALESCE(SUM(u.pontos), 0) AS pontos_totais,
            COALESCE(AVG(u.pontos), 0) AS media_pontos
     FROM nivel_fidelidade n
     LEFT JOIN usuario u ON u.nivel_id = n.id AND u.ativo = 1 AND u.papel = 'cliente'
     GROUP BY n.id, n.nome, n.slug, n.ordem
     ORDER BY n.ordem`
  );
  return rows;
}

// --- Campanhas ---
export async function listarCampanhas() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, titulo, descricao, segmento_json, inicio_em, fim_em, ativa, criado_em
     FROM campanha ORDER BY criado_em DESC`
  );
  return rows.map((r) => ({
    ...r,
    segmento_json:
      typeof r.segmento_json === "string"
        ? JSON.parse(r.segmento_json)
        : r.segmento_json,
  }));
}

export async function criarCampanha(data: {
  titulo: string;
  descricao?: string;
  segmento_json?: object;
  inicio_em: string;
  fim_em: string;
  ativa?: boolean;
}) {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO campanha (titulo, descricao, segmento_json, inicio_em, fim_em, ativa)
     VALUES (:titulo, :descricao, :segmento_json, :inicio_em, :fim_em, :ativa)`,
    {
      titulo: data.titulo,
      descricao: data.descricao ?? null,
      segmento_json: data.segmento_json
        ? JSON.stringify(data.segmento_json)
        : null,
      inicio_em: data.inicio_em,
      fim_em: data.fim_em,
      ativa: data.ativa !== false ? 1 : 0,
    }
  );
  return result.insertId;
}

export async function atualizarCampanha(
  id: number,
  data: Partial<{
    titulo: string;
    descricao: string;
    segmento_json: object;
    inicio_em: string;
    fim_em: string;
    ativa: boolean;
  }>
) {
  const fields: string[] = [];
  const params: Record<string, unknown> = { id };

  if (data.titulo !== undefined) {
    fields.push("titulo = :titulo");
    params.titulo = data.titulo;
  }
  if (data.descricao !== undefined) {
    fields.push("descricao = :descricao");
    params.descricao = data.descricao;
  }
  if (data.segmento_json !== undefined) {
    fields.push("segmento_json = :segmento_json");
    params.segmento_json = JSON.stringify(data.segmento_json);
  }
  if (data.inicio_em !== undefined) {
    fields.push("inicio_em = :inicio_em");
    params.inicio_em = data.inicio_em;
  }
  if (data.fim_em !== undefined) {
    fields.push("fim_em = :fim_em");
    params.fim_em = data.fim_em;
  }
  if (data.ativa !== undefined) {
    fields.push("ativa = :ativa");
    params.ativa = data.ativa ? 1 : 0;
  }

  if (!fields.length) return false;

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE campanha SET ${fields.join(", ")} WHERE id = :id`,
    params as Record<string, string | number | null>
  );
  return result.affectedRows > 0;
}

export async function excluirCampanha(id: number) {
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM campanha WHERE id = :id`,
    { id }
  );
  return result.affectedRows > 0;
}

// --- Cupom templates ---
export async function listarCupomTemplates() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM cupom_template ORDER BY titulo`
  );
  return rows;
}

export async function criarCupomTemplate(data: {
  titulo: string;
  descricao?: string;
  categoria: string;
  desconto_percentual?: number;
  desconto_valor?: number;
  valor_minimo_compra?: number;
  dias_validade?: number;
  ativo?: boolean;
}) {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO cupom_template
     (titulo, descricao, categoria, desconto_percentual, desconto_valor,
      valor_minimo_compra, dias_validade, ativo)
     VALUES (:titulo, :descricao, :categoria, :desconto_percentual, :desconto_valor,
             :valor_minimo_compra, :dias_validade, :ativo)`,
    {
      titulo: data.titulo,
      descricao: data.descricao ?? null,
      categoria: data.categoria,
      desconto_percentual: data.desconto_percentual ?? null,
      desconto_valor: data.desconto_valor ?? null,
      valor_minimo_compra: data.valor_minimo_compra ?? null,
      dias_validade: data.dias_validade ?? 30,
      ativo: data.ativo !== false ? 1 : 0,
    }
  );
  return result.insertId;
}

export async function atualizarCupomTemplate(
  id: number,
  data: Record<string, unknown>
) {
  const allowed = [
    "titulo",
    "descricao",
    "categoria",
    "desconto_percentual",
    "desconto_valor",
    "valor_minimo_compra",
    "dias_validade",
    "ativo",
  ] as const;
  const fields: string[] = [];
  const params: Record<string, unknown> = { id };

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = :${key}`);
      params[key] =
        key === "ativo" ? (data[key] ? 1 : 0) : data[key];
    }
  }
  if (!fields.length) return false;

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE cupom_template SET ${fields.join(", ")} WHERE id = :id`,
    params as Record<string, string | number | null>
  );
  return result.affectedRows > 0;
}

export async function excluirCupomTemplate(id: number) {
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM cupom_template WHERE id = :id`,
    { id }
  );
  return result.affectedRows > 0;
}

// --- Produtos ---
export async function listarProdutosAdmin() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, nome, descricao, preco_reais, preco_pontos, estoque, imagem_url, ativo
     FROM produto ORDER BY nome`
  );
  return rows;
}

export async function criarProduto(data: {
  nome: string;
  descricao?: string;
  preco_reais: number;
  preco_pontos: number;
  estoque?: number;
  ativo?: boolean;
}) {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO produto (nome, descricao, preco_reais, preco_pontos, estoque, ativo)
     VALUES (:nome, :descricao, :preco_reais, :preco_pontos, :estoque, :ativo)`,
    {
      nome: data.nome,
      descricao: data.descricao ?? null,
      preco_reais: data.preco_reais,
      preco_pontos: data.preco_pontos,
      estoque: data.estoque ?? 0,
      ativo: data.ativo !== false ? 1 : 0,
    }
  );
  return result.insertId;
}

export async function atualizarProduto(id: number, data: Record<string, unknown>) {
  const allowed = [
    "nome",
    "descricao",
    "preco_reais",
    "preco_pontos",
    "estoque",
    "ativo",
  ] as const;
  const fields: string[] = [];
  const params: Record<string, unknown> = { id };

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = :${key}`);
      params[key] = key === "ativo" ? (data[key] ? 1 : 0) : data[key];
    }
  }
  if (!fields.length) return false;

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE produto SET ${fields.join(", ")} WHERE id = :id`,
    params as Record<string, string | number | null>
  );
  return result.affectedRows > 0;
}

export async function excluirProduto(id: number) {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE produto SET ativo = 0 WHERE id = :id`,
    { id }
  );
  return result.affectedRows > 0;
}

// --- Missões ---
export async function listarMissoes() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM missao ORDER BY id DESC`
  );
  return rows;
}

export async function criarMissao(data: {
  titulo: string;
  descricao?: string;
  pontos_recompensa: number;
  meta_valor?: number;
  tipo_meta: "compras" | "trocas" | "presentes" | "pontos";
  ativa?: boolean;
  inicio_em?: string;
  fim_em?: string;
}) {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO missao (titulo, descricao, pontos_recompensa, meta_valor, tipo_meta, ativa, inicio_em, fim_em)
     VALUES (:titulo, :descricao, :pontos_recompensa, :meta_valor, :tipo_meta, :ativa, :inicio_em, :fim_em)`,
    {
      titulo: data.titulo,
      descricao: data.descricao ?? null,
      pontos_recompensa: data.pontos_recompensa,
      meta_valor: data.meta_valor ?? 1,
      tipo_meta: data.tipo_meta,
      ativa: data.ativa !== false ? 1 : 0,
      inicio_em: data.inicio_em ?? null,
      fim_em: data.fim_em ?? null,
    }
  );
  return result.insertId;
}

export async function atualizarMissao(id: number, data: Record<string, unknown>) {
  const allowed = [
    "titulo",
    "descricao",
    "pontos_recompensa",
    "meta_valor",
    "tipo_meta",
    "ativa",
    "inicio_em",
    "fim_em",
  ] as const;
  const fields: string[] = [];
  const params: Record<string, unknown> = { id };

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = :${key}`);
      params[key] = key === "ativa" ? (data[key] ? 1 : 0) : data[key];
    }
  }
  if (!fields.length) return false;

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE missao SET ${fields.join(", ")} WHERE id = :id`,
    params as Record<string, string | number | null>
  );
  return result.affectedRows > 0;
}

export async function excluirMissao(id: number) {
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM missao WHERE id = :id`,
    { id }
  );
  return result.affectedRows > 0;
}

// --- Eventos sazonais ---
export async function listarEventos() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM evento_sazonal ORDER BY inicio_em DESC`
  );
  return rows;
}

export async function criarEvento(data: {
  titulo: string;
  descricao?: string;
  trocas_extras?: number;
  inicio_em: string;
  fim_em: string;
  ativo?: boolean;
}) {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO evento_sazonal (titulo, descricao, trocas_extras, inicio_em, fim_em, ativo)
     VALUES (:titulo, :descricao, :trocas_extras, :inicio_em, :fim_em, :ativo)`,
    {
      titulo: data.titulo,
      descricao: data.descricao ?? null,
      trocas_extras: data.trocas_extras ?? 0,
      inicio_em: data.inicio_em,
      fim_em: data.fim_em,
      ativo: data.ativo !== false ? 1 : 0,
    }
  );
  return result.insertId;
}

export async function atualizarEvento(id: number, data: Record<string, unknown>) {
  const allowed = [
    "titulo",
    "descricao",
    "trocas_extras",
    "inicio_em",
    "fim_em",
    "ativo",
  ] as const;
  const fields: string[] = [];
  const params: Record<string, unknown> = { id };

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = :${key}`);
      params[key] = key === "ativo" ? (data[key] ? 1 : 0) : data[key];
    }
  }
  if (!fields.length) return false;

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE evento_sazonal SET ${fields.join(", ")} WHERE id = :id`,
    params as Record<string, string | number | null>
  );
  return result.affectedRows > 0;
}

export async function excluirEvento(id: number) {
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM evento_sazonal WHERE id = :id`,
    { id }
  );
  return result.affectedRows > 0;
}
