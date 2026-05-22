import { RowDataPacket } from "mysql2";
import { pool } from "../config/database";

export async function meuNivel(usuarioId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.pontos, n.nome, n.slug, n.ordem, n.pontos_minimos,
            (
              SELECT MIN(pontos_minimos) FROM nivel_fidelidade
              WHERE ordem > n.ordem
            ) AS proximo_nivel_pontos
     FROM usuario u
     JOIN nivel_fidelidade n ON n.id = u.nivel_id
     WHERE u.id = :usuarioId`,
    { usuarioId }
  );
  const r = rows[0];
  if (!r) return null;

  const proximo = r.proximo_nivel_pontos as number | null;
  const progresso =
    proximo === null
      ? 100
      : Math.min(
          100,
          Math.round(
            ((r.pontos - r.pontos_minimos) /
              (proximo - r.pontos_minimos)) *
              100
          )
        );

  return { ...r, progresso_percentual: progresso };
}

export async function rankingGlobal(limite = 50) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM vw_ranking_global ORDER BY posicao ASC LIMIT :limite`,
    { limite }
  );
  return rows;
}

export async function beneficiosPorNivel() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT nome, slug, ordem, trocas_mes, mesmo_rank_apenas,
            pode_presentear_cupom, pode_presentear_produto,
            valor_max_presente, pode_criar_sala_troca, pontos_minimos
     FROM nivel_fidelidade ORDER BY ordem ASC`
  );
  return rows;
}

export async function minhasConquistas(usuarioId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT c.slug, c.nome, c.descricao, c.icone, uc.desbloqueada_em
     FROM usuario_conquista uc
     JOIN conquista c ON c.id = uc.conquista_id
     WHERE uc.usuario_id = :usuarioId`,
    { usuarioId }
  );
  return rows;
}

export async function eventoAtivo() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, titulo, descricao, trocas_extras, inicio_em, fim_em
     FROM evento_sazonal
     WHERE ativo = 1 AND NOW() BETWEEN inicio_em AND fim_em
     ORDER BY fim_em ASC LIMIT 1`
  );
  return rows[0] ?? null;
}
