import { EntityManager } from "typeorm";
import { AppDataSource } from "../config/database";
import { Usuario } from "../entities/Usuario";
import { NivelFidelidade } from "../entities/NivelFidelidade";
import { Notificacao } from "../entities/Notificacao";
import { Conquista } from "../entities/Conquista";
import { UsuarioConquista } from "../entities/UsuarioConquista";
import { UsuarioMissao } from "../entities/UsuarioMissao";
import { Missao } from "../entities/Missao";
import { HistoricoPontos } from "../entities/HistoricoPontos";
import { PresenteCupom } from "../entities/PresenteCupom";
import { PropostaTroca } from "../entities/PropostaTroca";
import { CupomUsuario } from "../entities/CupomUsuario";

export async function criarNotificacao(
  usuarioId: number,
  titulo: string,
  mensagem: string,
  tipo: string,
  manager?: EntityManager
) {
  const repo = (manager ?? AppDataSource.manager).getRepository(Notificacao);
  return repo.save({ usuarioId, titulo, mensagem, tipo, lida: false });
}

export async function atualizarNivelPorPontos(
  usuarioId: number,
  manager?: EntityManager
) {
  const em = manager ?? AppDataSource.manager;
  const usuario = await em.getRepository(Usuario).findOne({
    where: { id: usuarioId },
    select: ["id", "pontos", "nivelId"],
  });
  if (!usuario) return;

  const nivel = await em
    .getRepository(NivelFidelidade)
    .createQueryBuilder("n")
    .where("n.pontosMinimos <= :pontos", { pontos: usuario.pontos })
    .orderBy("n.ordem", "DESC")
    .getOne();

  const nivelAtual = await em.getRepository(NivelFidelidade).findOne({
    where: { id: usuario.nivelId },
  });

  if (nivel && nivel.id !== usuario.nivelId) {
    const subiu = nivel.ordem > (nivelAtual?.ordem ?? 0);
    usuario.nivelId = nivel.id;
    await em.getRepository(Usuario).save(usuario);
    if (subiu) {
      await criarNotificacao(
        usuarioId,
        "Nível atualizado!",
        `Parabéns! Você alcançou o nível ${nivel.nome}.`,
        "nivel",
        manager
      );
    }
  }
}

export async function incrementarMissao(
  usuarioId: number,
  tipoMeta: Missao["tipoMeta"],
  valor = 1,
  manager?: EntityManager
) {
  const em = manager ?? AppDataSource.manager;
  const missoes = await em.getRepository(Missao).find({
    where: { tipoMeta, ativa: true },
  });

  for (const missao of missoes) {
    let um = await em.getRepository(UsuarioMissao).findOne({
      where: { usuarioId, missaoId: missao.id },
    });
    if (!um) {
      um = em.getRepository(UsuarioMissao).create({
        usuarioId,
        missaoId: missao.id,
        progresso: 0,
        concluida: false,
      });
    }
    if (um.concluida) continue;

    um.progresso = Math.min(um.progresso + valor, missao.metaValor);
    if (um.progresso >= missao.metaValor) {
      um.concluida = true;
      um.concluidaEm = new Date();
      await em.getRepository(Usuario).increment(
        { id: usuarioId },
        "pontos",
        missao.pontosRecompensa
      );
      const u = await em.getRepository(Usuario).findOneOrFail({
        where: { id: usuarioId },
        select: ["pontos"],
      });
      await em.getRepository(HistoricoPontos).save({
        usuarioId,
        valor: missao.pontosRecompensa,
        saldoApos: u.pontos,
        tipo: "missao",
        referenciaTipo: "missao",
        referenciaId: String(missao.id),
        descricao: `Missão concluída: ${missao.titulo}`,
      });
      await em.getRepository(Notificacao).save({
        usuarioId,
        titulo: "Missão concluída!",
        mensagem: `Você completou "${missao.titulo}" e ganhou ${missao.pontosRecompensa} pontos.`,
        tipo: "missao",
        lida: false,
      });
    }
    await em.getRepository(UsuarioMissao).save(um);
  }
}

export async function verificarConquistas(usuarioId: number, manager?: EntityManager) {
  const em = manager ?? AppDataSource.manager;
  const conquistaRepo = em.getRepository(Conquista);
  const ucRepo = em.getRepository(UsuarioConquista);

  const todasConquistas = await conquistaRepo.find();
  const conquistadas = await ucRepo.find({ where: { usuarioId } });
  const conquistadasIds = new Set(conquistadas.map((uc) => uc.conquistaId));

  const desbloquear = async (c: Conquista) => {
    if (conquistadasIds.has(c.id)) return;
    await ucRepo.save({ usuarioId, conquistaId: c.id });
    await criarNotificacao(
      usuarioId,
      "Nova conquista!",
      `Você desbloqueou: ${c.nome}`,
      "conquista",
      manager
    );

    if (c.pontosBonus > 0) {
      const u = await em.getRepository(Usuario).findOne({ where: { id: usuarioId } });
      if (u) {
        u.pontos += c.pontosBonus;
        await em.getRepository(Usuario).save(u);
        await em.getRepository(HistoricoPontos).save({
          usuarioId,
          valor: c.pontosBonus,
          saldoApos: u.pontos,
          tipo: "missao",
          referenciaTipo: "conquista",
          referenciaId: String(c.id),
          descricao: `Bônus por conquista: ${c.nome}`,
        });
      }
    }
  };

  const presentesEnviados = await em.getRepository(PresenteCupom).count({
    where: { remetenteId: usuarioId },
  });
  const trocasAceitas = await em.getRepository(PropostaTroca).count({
    where: [
      { solicitanteId: usuarioId, status: "aceita" },
      { proprietarioId: usuarioId, status: "aceita" },
    ],
  });
  const presentesResgatados = await em.getRepository(PresenteCupom).count({
    where: { remetenteId: usuarioId, status: "resgatado" },
  });
  const comprasCount = await em.getRepository(CupomUsuario).count({
    where: { usuarioId, origem: "compra" },
  });

  for (const c of todasConquistas) {
    if (conquistadasIds.has(c.id)) continue;

    let atingiu = false;
    switch (c.metaTipo) {
      case "compras_count":
        atingiu = comprasCount >= c.metaValor;
        break;
      case "trocas_count":
        atingiu = trocasAceitas >= c.metaValor;
        break;
      case "presentes_enviados":
        atingiu = presentesEnviados >= c.metaValor;
        break;
      case "presentes_resgatados":
        atingiu = presentesResgatados >= c.metaValor;
        break;
      case "manual":
        // Manual ou boas-vindas: trataremos bem_vindo isoladamente para legibilidade
        if (c.slug === "bem_vindo") atingiu = true;
        break;
      default:
        // Caso fallback para antigas cadastradas q não têm meta_tipo correto
        if (c.slug === "bem_vindo") atingiu = true;
        if (c.slug === "iniciante" && comprasCount >= 1) atingiu = true;
        if (c.slug === "amigo_ouro" && presentesEnviados >= 5) atingiu = true;
        if (c.slug === "troca_justa" && trocasAceitas >= 10) atingiu = true;
        if (c.slug === "corrente_bem" && presentesResgatados >= 1) atingiu = true;
        break;
    }

    if (atingiu) {
      await desbloquear(c);
      conquistadasIds.add(c.id);
    }
  }
}
