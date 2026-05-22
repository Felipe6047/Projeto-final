import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../config/database";
import { env } from "../config/env";

const DIAS_MIN_TROCA = 7;

interface CupomRow extends RowDataPacket {
  id: number;
  usuario_id: number;
  codigo: string;
  status: string;
  validade_ate: string;
  titulo: string;
  categoria: string;
  proprietario_nome?: string;
  nivel_slug?: string;
}

export async function listarMeusCupons(usuarioId: number) {
  const [rows] = await pool.query<CupomRow[]>(
    `SELECT cu.id, cu.codigo, cu.status, cu.validade_ate,
            ct.titulo, ct.categoria, ct.desconto_percentual, ct.valor_minimo_compra
     FROM cupom_usuario cu
     JOIN cupom_template ct ON ct.id = cu.template_id
     WHERE cu.usuario_id = :usuarioId
       AND cu.status IN ('disponivel', 'oferecido_troca')
     ORDER BY cu.validade_ate ASC`,
    { usuarioId }
  );
  return rows;
}

export async function listarMercado(filtros: {
  categoria?: string;
  valorMinimo?: number;
  busca?: string;
}) {
  let sql = `
    SELECT cu.id, cu.codigo, cu.status, cu.validade_ate,
           ct.titulo, ct.categoria, ct.desconto_percentual, ct.valor_minimo_compra,
           u.nome AS proprietario_nome, n.slug AS nivel_slug
    FROM cupom_usuario cu
    JOIN cupom_template ct ON ct.id = cu.template_id
    JOIN usuario u ON u.id = cu.usuario_id
    JOIN nivel_fidelidade n ON n.id = u.nivel_id
    WHERE cu.status = 'oferecido_troca'
      AND cu.validade_ate > DATE_ADD(CURDATE(), INTERVAL :diasMin DAY)
  `;
  const params: { diasMin: number; categoria?: string; valorMinimo?: number; busca?: string } = {
    diasMin: DIAS_MIN_TROCA,
  };

  if (filtros.categoria) {
    sql += ` AND ct.categoria = :categoria`;
    params.categoria = filtros.categoria;
  }
  if (filtros.valorMinimo) {
    sql += ` AND (ct.valor_minimo_compra IS NULL OR ct.valor_minimo_compra >= :valorMinimo)`;
    params.valorMinimo = filtros.valorMinimo;
  }
  if (filtros.busca) {
    sql += ` AND (ct.titulo LIKE :busca OR cu.codigo LIKE :busca)`;
    params.busca = `%${filtros.busca}%`;
  }

  sql += ` ORDER BY cu.validade_ate ASC`;
  const [rows] = await pool.query<CupomRow[]>(sql, params);
  return rows;
}

export async function oferecerParaTroca(usuarioId: number, cupomId: number) {
  const [rows] = await pool.query<CupomRow[]>(
    `SELECT id, status, validade_ate FROM cupom_usuario
     WHERE id = :cupomId AND usuario_id = :usuarioId`,
    { cupomId, usuarioId }
  );
  const cupom = rows[0];
  if (!cupom) return { erro: "Cupom não encontrado" };
  if (cupom.status !== "disponivel") return { erro: "Cupom não está disponível" };
  if (new Date(cupom.validade_ate) <= addDays(new Date(), DIAS_MIN_TROCA)) {
    return { erro: "Cupom precisa ter validade maior que 7 dias" };
  }

  await pool.query(
    `UPDATE cupom_usuario SET status = 'oferecido_troca' WHERE id = :cupomId`,
    { cupomId }
  );
  return { ok: true };
}

export async function solicitarTroca(data: {
  solicitanteId: number;
  cupomSolicitadoId: number;
  cupomOfertadoId: number;
  aceitarTaxa: boolean;
}) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [alvo] = await conn.query<(CupomRow & { dono_id: number })[]>(
      `SELECT cu.*, u.id AS dono_id
       FROM cupom_usuario cu
       JOIN usuario u ON u.id = cu.usuario_id
       WHERE cu.id = :cupomSolicitadoId AND cu.status = 'oferecido_troca'`,
      { cupomSolicitadoId: data.cupomSolicitadoId }
    );
    const cupomAlvo = alvo[0];
    if (!cupomAlvo) {
      await conn.rollback();
      return { erro: "Cupom do mercado não disponível" };
    }
    if (cupomAlvo.dono_id === data.solicitanteId) {
      await conn.rollback();
      return { erro: "Não é possível trocar com seu próprio cupom" };
    }

    const [meu] = await conn.query<CupomRow[]>(
      `SELECT * FROM cupom_usuario
       WHERE id = :cupomOfertadoId AND usuario_id = :solicitanteId AND status = 'disponivel'`,
      { cupomOfertadoId: data.cupomOfertadoId, solicitanteId: data.solicitanteId }
    );
    if (!meu[0]) {
      await conn.rollback();
      return { erro: "Seu cupom ofertado não é válido" };
    }

    const limite = await verificarLimiteTrocas(conn, data.solicitanteId);
    if (!limite.ok) {
      await conn.rollback();
      return { erro: limite.erro };
    }

    const taxa = data.aceitarTaxa ? env.taxaTrocaPontos : 0;
    if (taxa > 0) {
      const [usr] = await conn.query<RowDataPacket[]>(
        `SELECT pontos FROM usuario WHERE id = :id`,
        { id: data.solicitanteId }
      );
      if ((usr[0]?.pontos ?? 0) < taxa) {
        await conn.rollback();
        return { erro: "Pontos insuficientes para taxa de troca" };
      }
      await debitarPontos(conn, data.solicitanteId, taxa, "troca_taxa");
    }

    const [insert] = await conn.query<ResultSetHeader>(
      `INSERT INTO proposta_troca
        (solicitante_id, proprietario_id, cupom_solicitante_id, cupom_proprietario_id, taxa_pontos, taxa_aceita)
       VALUES (:solicitanteId, :proprietarioId, :cupomOfertadoId, :cupomSolicitadoId, :taxa, :taxaAceita)`,
      {
        solicitanteId: data.solicitanteId,
        proprietarioId: cupomAlvo.dono_id,
        cupomOfertadoId: data.cupomOfertadoId,
        cupomSolicitadoId: data.cupomSolicitadoId,
        taxa,
        taxaAceita: data.aceitarTaxa ? 1 : 0,
      }
    );

    await conn.query(
      `UPDATE cupom_usuario SET status = 'em_troca' WHERE id IN (:a, :b)`,
      { a: data.cupomOfertadoId, b: data.cupomSolicitadoId }
    );

    await incrementarTrocaMes(conn, data.solicitanteId);
    await conn.commit();
    return { propostaId: insert.insertId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function responderTroca(
  usuarioId: number,
  propostaId: number,
  aceitar: boolean
) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM proposta_troca
       WHERE id = :id AND proprietario_id = :usuarioId AND status = 'pendente'`,
      { id: propostaId, usuarioId }
    );
    const p = rows[0];
    if (!p) {
      await conn.rollback();
      return { erro: "Proposta não encontrada" };
    }

    if (!aceitar) {
      await conn.query(
        `UPDATE proposta_troca SET status = 'recusada', respondido_em = NOW() WHERE id = :id`,
        { id: propostaId }
      );
      await conn.query(
        `UPDATE cupom_usuario SET status = 'disponivel' WHERE id = :a`,
        { a: p.cupom_solicitante_id }
      );
      await conn.query(
        `UPDATE cupom_usuario SET status = 'oferecido_troca' WHERE id = :b`,
        { b: p.cupom_proprietario_id }
      );
      await conn.commit();
      return { status: "recusada" };
    }

    await conn.query(
      `UPDATE proposta_troca SET status = 'aceita', respondido_em = NOW() WHERE id = :id`,
      { id: propostaId }
    );
    await conn.query(
      `UPDATE cupom_usuario cu
       JOIN proposta_troca pt ON pt.id = :id
       SET cu.usuario_id = CASE
         WHEN cu.id = pt.cupom_solicitante_id THEN pt.proprietario_id
         ELSE pt.solicitante_id
       END,
       cu.status = 'disponivel',
       cu.origem = 'troca'
       WHERE cu.id IN (pt.cupom_solicitante_id, pt.cupom_proprietario_id)`,
      { id: propostaId }
    );
    await conn.commit();
    return { status: "aceita" };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function historicoTrocas(usuarioId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT pt.id, pt.status, pt.taxa_pontos, pt.criado_em, pt.respondido_em,
            cs.codigo AS cupom_solicitante, cp.codigo AS cupom_proprietario
     FROM proposta_troca pt
     JOIN cupom_usuario cs ON cs.id = pt.cupom_solicitante_id
     JOIN cupom_usuario cp ON cp.id = pt.cupom_proprietario_id
     WHERE pt.solicitante_id = :usuarioId OR pt.proprietario_id = :usuarioId
     ORDER BY pt.criado_em DESC`,
    { usuarioId }
  );
  return rows;
}

async function verificarLimiteTrocas(
  conn: Awaited<ReturnType<typeof pool.getConnection>>,
  usuarioId: number
) {
  const [nivel] = await conn.query<RowDataPacket[]>(
    `SELECT n.trocas_mes, n.mesmo_rank_apenas, u.nivel_id
     FROM usuario u JOIN nivel_fidelidade n ON n.id = u.nivel_id
     WHERE u.id = :usuarioId`,
    { usuarioId }
  );
  const limite = nivel[0]?.trocas_mes;
  if (limite === null) return { ok: true };

  const anoMes = new Date().toISOString().slice(0, 7).replace("-", "");
  const [uso] = await conn.query<RowDataPacket[]>(
    `SELECT quantidade FROM usuario_troca_mes WHERE usuario_id = :usuarioId AND ano_mes = :anoMes`,
    { usuarioId, anoMes }
  );
  const [evento] = await conn.query<RowDataPacket[]>(
    `SELECT COALESCE(SUM(trocas_extras), 0) AS extras FROM evento_sazonal
     WHERE ativo = 1 AND NOW() BETWEEN inicio_em AND fim_em`
  );
  const extras = Number(evento[0]?.extras ?? 0);
  const usado = Number(uso[0]?.quantidade ?? 0);
  if (usado >= limite + extras) {
    return { ok: false, erro: "Limite mensal de trocas atingido para seu nível" };
  }
  return { ok: true };
}

async function incrementarTrocaMes(
  conn: Awaited<ReturnType<typeof pool.getConnection>>,
  usuarioId: number
) {
  const anoMes = new Date().toISOString().slice(0, 7).replace("-", "");
  await conn.query(
    `INSERT INTO usuario_troca_mes (usuario_id, ano_mes, quantidade)
     VALUES (:usuarioId, :anoMes, 1)
     ON DUPLICATE KEY UPDATE quantidade = quantidade + 1`,
    { usuarioId, anoMes }
  );
}

async function debitarPontos(
  conn: Awaited<ReturnType<typeof pool.getConnection>>,
  usuarioId: number,
  valor: number,
  tipo: string
) {
  await conn.query(
    `UPDATE usuario SET pontos = pontos - :valor WHERE id = :usuarioId`,
    { valor, usuarioId }
  );
  const [u] = await conn.query<RowDataPacket[]>(
    `SELECT pontos FROM usuario WHERE id = :usuarioId`,
    { usuarioId }
  );
  await conn.query(
    `INSERT INTO historico_pontos (usuario_id, valor, saldo_apos, tipo, descricao)
     VALUES (:usuarioId, :valorNeg, :saldo, :tipo, 'Taxa de troca de cupom')`,
    {
      usuarioId,
      valorNeg: -valor,
      saldo: u[0].pontos,
      tipo,
    }
  );
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
