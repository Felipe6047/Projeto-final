import { EntityManager, In } from "typeorm";
import { AppDataSource } from "../config/database";
import { env } from "../config/env";
import { CupomUsuario } from "../entities/CupomUsuario";
import { PropostaTroca } from "../entities/PropostaTroca";
import { Usuario } from "../entities/Usuario";
import { UsuarioTrocaMes } from "../entities/UsuarioTrocaMes";
import { HistoricoPontos } from "../entities/HistoricoPontos";
import { EventoSazonal } from "../entities/EventoSazonal";
import {
  criarNotificacao,
  incrementarMissao,
  verificarConquistas,
} from "./gamificacao.service";

const DIAS_MIN_TROCA = 7;

export async function listarMeusCupons(usuarioId: number) {
  return AppDataSource.getRepository(CupomUsuario)
    .createQueryBuilder("cu")
    .innerJoin("cu.template", "ct")
    .select([
      "cu.id AS id",
      "cu.codigo AS codigo",
      "cu.status AS status",
      "cu.validadeAte AS validade_ate",
      "ct.titulo AS titulo",
      "ct.categoria AS categoria",
      "ct.descontoPercentual AS desconto_percentual",
      "ct.valorMinimoCompra AS valor_minimo_compra",
    ])
    .where("cu.usuarioId = :usuarioId", { usuarioId })
    .andWhere("cu.status IN ('disponivel', 'oferecido_troca')")
    .orderBy("cu.validadeAte", "ASC")
    .getRawMany();
}

export async function listarMercado(filtros: {
  categoria?: string;
  valorMinimo?: number;
  busca?: string;
}) {
  const qb = AppDataSource.getRepository(CupomUsuario)
    .createQueryBuilder("cu")
    .innerJoin("cu.template", "ct")
    .innerJoin("cu.usuario", "u")
    .innerJoin("u.nivel", "n")
    .select([
      "cu.id AS id",
      "cu.codigo AS codigo",
      "cu.status AS status",
      "cu.validadeAte AS validade_ate",
      "ct.titulo AS titulo",
      "ct.categoria AS categoria",
      "ct.descontoPercentual AS desconto_percentual",
      "ct.valorMinimoCompra AS valor_minimo_compra",
      "u.nome AS proprietario_nome",
      "n.slug AS nivel_slug",
    ])
    .where("cu.status = 'oferecido_troca'")
    .andWhere("cu.validadeAte > DATE_ADD(CURDATE(), INTERVAL :diasMin DAY)", {
      diasMin: DIAS_MIN_TROCA,
    });

  if (filtros.categoria) {
    qb.andWhere("ct.categoria = :categoria", { categoria: filtros.categoria });
  }
  if (filtros.valorMinimo) {
    qb.andWhere(
      "(ct.valorMinimoCompra IS NULL OR ct.valorMinimoCompra >= :valorMinimo)",
      { valorMinimo: filtros.valorMinimo }
    );
  }
  if (filtros.busca) {
    qb.andWhere("(ct.titulo LIKE :busca OR cu.codigo LIKE :busca)", {
      busca: `%${filtros.busca}%`,
    });
  }

  return qb.orderBy("cu.validadeAte", "ASC").getRawMany();
}

export async function oferecerParaTroca(usuarioId: number, cupomId: number) {
  const cupom = await AppDataSource.getRepository(CupomUsuario).findOne({
    where: { id: String(cupomId), usuarioId },
  });

  if (!cupom) return { erro: "Cupom não encontrado" };
  if (cupom.status !== "disponivel") return { erro: "Cupom não está disponível" };
  if (new Date(cupom.validadeAte) <= addDays(new Date(), DIAS_MIN_TROCA)) {
    return { erro: "Cupom precisa ter validade maior que 7 dias" };
  }

  cupom.status = "oferecido_troca";
  await AppDataSource.getRepository(CupomUsuario).save(cupom);
  return { ok: true };
}

export async function solicitarTroca(data: {
  solicitanteId: number;
  cupomSolicitadoId: number;
  cupomOfertadoId: number;
  aceitarTaxa: boolean;
}) {
  return AppDataSource.transaction(async (manager) => {
    const cupomRepo = manager.getRepository(CupomUsuario);

    const cupomAlvo = await cupomRepo
      .createQueryBuilder("cu")
      .innerJoinAndSelect("cu.usuario", "u")
      .where("cu.id = :id", { id: String(data.cupomSolicitadoId) })
      .andWhere("cu.status = 'oferecido_troca'")
      .getOne();

    if (!cupomAlvo) return { erro: "Cupom do mercado não disponível" };
    if (cupomAlvo.usuarioId === data.solicitanteId) {
      return { erro: "Não é possível trocar com seu próprio cupom" };
    }

    const meuCupom = await cupomRepo.findOne({
      where: {
        id: String(data.cupomOfertadoId),
        usuarioId: data.solicitanteId,
        status: "disponivel",
      },
    });
    if (!meuCupom) return { erro: "Seu cupom ofertado não é válido" };

    const limite = await verificarLimiteTrocas(manager, data.solicitanteId);
    if (!limite.ok) return { erro: limite.erro };

    const taxa = data.aceitarTaxa ? env.taxaTrocaPontos : 0;
    if (taxa > 0) {
      const usr = await manager.getRepository(Usuario).findOne({
        where: { id: data.solicitanteId },
        select: { id: true, pontos: true },
      });
      if ((usr?.pontos ?? 0) < taxa) {
        return { erro: "Pontos insuficientes para taxa de troca" };
      }
      await debitarPontos(manager, data.solicitanteId, taxa, "troca_taxa");
    }

    const proposta = await manager.getRepository(PropostaTroca).save({
      solicitanteId: data.solicitanteId,
      proprietarioId: cupomAlvo.usuarioId,
      cupomSolicitanteId: String(data.cupomOfertadoId),
      cupomProprietarioId: String(data.cupomSolicitadoId),
      taxaPontos: taxa,
      taxaAceita: data.aceitarTaxa,
      status: "pendente",
    });

    await cupomRepo.update(
      { id: In([String(data.cupomOfertadoId), String(data.cupomSolicitadoId)]) },
      { status: "em_troca" }
    );

    await incrementarTrocaMes(manager, data.solicitanteId);

    await criarNotificacao(
      cupomAlvo.usuarioId,
      "Nova proposta de troca",
      "Alguém quer trocar um cupom com você.",
      "troca",
      manager
    );

    return { propostaId: proposta.id };
  });
}

export async function responderTroca(
  usuarioId: number,
  propostaId: number,
  aceitar: boolean
) {
  return AppDataSource.transaction(async (manager) => {
    const propostaRepo = manager.getRepository(PropostaTroca);
    const cupomRepo = manager.getRepository(CupomUsuario);

    const p = await propostaRepo.findOne({
      where: {
        id: String(propostaId),
        proprietarioId: usuarioId,
        status: "pendente",
      },
    });

    if (!p) return { erro: "Proposta não encontrada" };

    if (!aceitar) {
      p.status = "recusada";
      p.respondidoEm = new Date();
      await propostaRepo.save(p);

      await cupomRepo.update(
        { id: p.cupomSolicitanteId },
        { status: "disponivel" }
      );
      await cupomRepo.update(
        { id: p.cupomProprietarioId },
        { status: "oferecido_troca" }
      );
      await criarNotificacao(
        p.solicitanteId,
        "Troca recusada",
        "Sua proposta de troca foi recusada.",
        "troca",
        manager
      );
      return { status: "recusada" };
    }

    p.status = "aceita";
    p.respondidoEm = new Date();
    await propostaRepo.save(p);

    const cupomSolicitante = await cupomRepo.findOneByOrFail({
      id: p.cupomSolicitanteId,
    });
    const cupomProprietario = await cupomRepo.findOneByOrFail({
      id: p.cupomProprietarioId,
    });

    cupomSolicitante.usuarioId = p.proprietarioId;
    cupomSolicitante.status = "disponivel";
    cupomSolicitante.origem = "troca";

    cupomProprietario.usuarioId = p.solicitanteId;
    cupomProprietario.status = "disponivel";
    cupomProprietario.origem = "troca";

    await cupomRepo.save([cupomSolicitante, cupomProprietario]);

    await criarNotificacao(
      p.solicitanteId,
      "Troca aceita!",
      "Sua proposta de troca foi aceita. Os cupons foram trocados.",
      "troca",
      manager
    );
    await incrementarMissao(p.solicitanteId, "trocas", 1, manager);
    await incrementarMissao(p.proprietarioId, "trocas", 1, manager);
    await verificarConquistas(p.solicitanteId, manager);
    await verificarConquistas(p.proprietarioId, manager);

    return { status: "aceita" };
  });
}

export async function historicoTrocas(usuarioId: number) {
  return AppDataSource.getRepository(PropostaTroca)
    .createQueryBuilder("pt")
    .innerJoin(CupomUsuario, "cs", "cs.id = pt.cupomSolicitanteId")
    .innerJoin(CupomUsuario, "cp", "cp.id = pt.cupomProprietarioId")
    .select([
      "pt.id AS id",
      "pt.status AS status",
      "pt.taxaPontos AS taxa_pontos",
      "pt.criadoEm AS criado_em",
      "pt.respondidoEm AS respondido_em",
      "cs.codigo AS cupom_solicitante",
      "cp.codigo AS cupom_proprietario",
    ])
    .where("pt.solicitanteId = :usuarioId OR pt.proprietarioId = :usuarioId", {
      usuarioId,
    })
    .orderBy("pt.criadoEm", "DESC")
    .getRawMany();
}

async function verificarLimiteTrocas(manager: EntityManager, usuarioId: number) {
  const nivel = await manager
    .getRepository(Usuario)
    .createQueryBuilder("u")
    .innerJoin("u.nivel", "n")
    .select(["n.trocasMes AS trocas_mes", "u.nivelId AS nivel_id"])
    .where("u.id = :usuarioId", { usuarioId })
    .getRawOne<{ trocas_mes: number | null }>();

  const limite = nivel?.trocas_mes;
  if (limite === null || limite === undefined) return { ok: true as const };

  const anoMes = new Date().toISOString().slice(0, 7).replace("-", "");
  const uso = await manager.getRepository(UsuarioTrocaMes).findOne({
    where: { usuarioId, anoMes },
  });

  const extrasResult = await manager
    .getRepository(EventoSazonal)
    .createQueryBuilder("e")
    .select("COALESCE(SUM(e.trocasExtras), 0)", "extras")
    .where("e.ativo = 1")
    .andWhere("NOW() BETWEEN e.inicioEm AND e.fimEm")
    .getRawOne<{ extras: string }>();

  const extras = Number(extrasResult?.extras ?? 0);
  const usado = uso?.quantidade ?? 0;
  if (usado >= limite + extras) {
    return { ok: false as const, erro: "Limite mensal de trocas atingido para seu nível" };
  }
  return { ok: true as const };
}

async function incrementarTrocaMes(manager: EntityManager, usuarioId: number) {
  const anoMes = new Date().toISOString().slice(0, 7).replace("-", "");
  const repo = manager.getRepository(UsuarioTrocaMes);
  const reg = await repo.findOne({ where: { usuarioId, anoMes } });
  if (reg) {
    reg.quantidade += 1;
    await repo.save(reg);
  } else {
    await repo.save({ usuarioId, anoMes, quantidade: 1 });
  }
}

async function debitarPontos(
  manager: EntityManager,
  usuarioId: number,
  valor: number,
  tipo: HistoricoPontos["tipo"]
) {
  const usuarioRepo = manager.getRepository(Usuario);
  await usuarioRepo.decrement({ id: usuarioId }, "pontos", valor);
  const u = await usuarioRepo.findOneOrFail({
    where: { id: usuarioId },
    select: { pontos: true },
  });
  await manager.getRepository(HistoricoPontos).save({
    usuarioId,
    valor: -valor,
    saldoApos: u.pontos,
    tipo,
    descricao: "Taxa de troca de cupom",
  });
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
