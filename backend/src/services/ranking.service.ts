import { AppDataSource } from "../config/database";
import { NivelFidelidade } from "../entities/NivelFidelidade";
import { Usuario } from "../entities/Usuario";
import { UsuarioConquista } from "../entities/UsuarioConquista";
import { Conquista } from "../entities/Conquista";
import { EventoSazonal } from "../entities/EventoSazonal";

export async function meuNivel(usuarioId: number) {
  const r = await AppDataSource.getRepository(Usuario)
    .createQueryBuilder("u")
    .innerJoin("u.nivel", "n")
    .select([
      "u.pontos AS pontos",
      "n.nome AS nome",
      "n.slug AS slug",
      "n.ordem AS ordem",
      "n.pontosMinimos AS pontos_minimos",
    ])
    .addSelect(
      (sub) =>
        sub
          .select("MIN(nf.pontos_minimos)")
          .from(NivelFidelidade, "nf")
          .where("nf.ordem > n.ordem"),
      "proximo_nivel_pontos"
    )
    .where("u.id = :usuarioId", { usuarioId })
    .getRawOne<{
      pontos: number;
      nome: string;
      slug: string;
      ordem: number;
      pontos_minimos: number;
      proximo_nivel_pontos: number | null;
    }>();

  if (!r) return null;

  const proximo = r.proximo_nivel_pontos;
  const progresso =
    proximo === null
      ? 100
      : Math.min(
          100,
          Math.round(
            ((r.pontos - r.pontos_minimos) / (proximo - r.pontos_minimos)) * 100
          )
        );

  return { ...r, progresso_percentual: progresso };
}

export async function rankingGlobal(limite = 50) {
  return AppDataSource.query(
    `SELECT * FROM vw_ranking_global ORDER BY posicao ASC LIMIT ?`,
    [limite]
  );
}

export async function beneficiosPorNivel() {
  return AppDataSource.getRepository(NivelFidelidade)
    .createQueryBuilder("n")
    .select([
      "n.nome AS nome",
      "n.slug AS slug",
      "n.ordem AS ordem",
      "n.trocasMes AS trocas_mes",
      "n.mesmoRankApenas AS mesmo_rank_apenas",
      "n.podePresentearCupom AS pode_presentear_cupom",
      "n.podePresentearProduto AS pode_presentear_produto",
      "n.valorMaxPresente AS valor_max_presente",
      "n.podeCriarSalaTroca AS pode_criar_sala_troca",
      "n.pontosMinimos AS pontos_minimos",
    ])
    .orderBy("n.ordem", "ASC")
    .getRawMany();
}

export async function minhasConquistas(usuarioId: number) {
  return AppDataSource.getRepository(UsuarioConquista)
    .createQueryBuilder("uc")
    .innerJoin("uc.conquista", "c")
    .select([
      "c.slug AS slug",
      "c.nome AS nome",
      "c.descricao AS descricao",
      "c.icone AS icone",
      "uc.desbloqueadaEm AS desbloqueada_em",
    ])
    .where("uc.usuarioId = :usuarioId", { usuarioId })
    .getRawMany();
}

export async function todasConquistasComStatus(usuarioId: number) {
  return AppDataSource.getRepository(Conquista)
    .createQueryBuilder("c")
    .leftJoin(
      UsuarioConquista,
      "uc",
      "uc.conquistaId = c.id AND uc.usuarioId = :usuarioId",
      { usuarioId }
    )
    .select([
      "c.slug AS slug",
      "c.nome AS nome",
      "c.descricao AS descricao",
      "c.icone AS icone",
      "CASE WHEN uc.usuarioId IS NOT NULL THEN 1 ELSE 0 END AS desbloqueada",
      "uc.desbloqueadaEm AS desbloqueada_em",
    ])
    .orderBy("c.id", "ASC")
    .getRawMany();
}

export async function eventoAtivo() {
  return AppDataSource.getRepository(EventoSazonal)
    .createQueryBuilder("e")
    .where("e.ativo = 1")
    .andWhere("NOW() BETWEEN e.inicioEm AND e.fimEm")
    .orderBy("e.fimEm", "ASC")
    .limit(1)
    .getOne();
}
