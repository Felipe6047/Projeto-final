import crypto from "crypto";
import { AppDataSource } from "../config/database";
import { Usuario } from "../entities/Usuario";
import { SalaTroca } from "../entities/SalaTroca";
import { SalaTrocaMembro } from "../entities/SalaTrocaMembro";
import { criarNotificacao } from "./gamificacao.service";

function gerarCodigoConvite() {
  return crypto.randomBytes(4).toString("hex").slice(0, 8).toUpperCase();
}

export async function criarSala(criadorId: number, nome: string) {
  const nivel = await AppDataSource.getRepository(Usuario)
    .createQueryBuilder("u")
    .innerJoin("u.nivel", "n")
    .select("n.podeCriarSalaTroca", "pode_criar")
    .where("u.id = :id", { id: criadorId })
    .getRawOne<{ pode_criar: boolean }>();

  if (!nivel?.pode_criar) {
    return { erro: "Seu nível não permite criar salas de troca" };
  }

  let codigo = gerarCodigoConvite();
  let tentativas = 0;
  const repo = AppDataSource.getRepository(SalaTroca);

  while (await repo.findOne({ where: { codigoConvite: codigo } })) {
    codigo = gerarCodigoConvite();
    tentativas += 1;
    if (tentativas > 5) return { erro: "Não foi possível gerar código da sala" };
  }

  const sala = await repo.save({
    criadorId,
    nome,
    codigoConvite: codigo,
  });

  await AppDataSource.getRepository(SalaTrocaMembro).save({
    salaId: sala.id,
    usuarioId: criadorId,
  });

  return {
    salaId: sala.id,
    nome: sala.nome,
    codigoConvite: sala.codigoConvite,
  };
}

export async function entrarSala(usuarioId: number, codigoConvite: string) {
  const sala = await AppDataSource.getRepository(SalaTroca).findOne({
    where: { codigoConvite: codigoConvite.toUpperCase() },
  });
  if (!sala) return { erro: "Sala não encontrada" };

  const membroRepo = AppDataSource.getRepository(SalaTrocaMembro);
  const jaMembro = await membroRepo.findOne({
    where: { salaId: sala.id, usuarioId },
  });
  if (!jaMembro) {
    await membroRepo.save({ salaId: sala.id, usuarioId });
    await criarNotificacao(
      sala.criadorId,
      "Novo membro na sala",
      "Alguém entrou na sua sala de troca.",
      "sala_troca"
    );
  }

  return { salaId: sala.id, nome: sala.nome, codigoConvite: sala.codigoConvite };
}

export async function listarMinhasSalas(usuarioId: number) {
  return AppDataSource.getRepository(SalaTroca)
    .createQueryBuilder("s")
    .innerJoin(SalaTrocaMembro, "m", "m.salaId = s.id")
    .select([
      "s.id AS id",
      "s.nome AS nome",
      "s.codigoConvite AS codigo_convite",
      "s.criadoEm AS criado_em",
    ])
    .where("m.usuarioId = :usuarioId", { usuarioId })
    .orderBy("s.criadoEm", "DESC")
    .getRawMany();
}

export async function detalheSala(codigoConvite: string) {
  const sala = await AppDataSource.getRepository(SalaTroca)
    .createQueryBuilder("s")
    .innerJoin("s.criador", "c")
    .select([
      "s.id AS id",
      "s.nome AS nome",
      "s.codigoConvite AS codigo_convite",
      "c.nome AS criador_nome",
    ])
    .where("s.codigoConvite = :codigo", {
      codigo: codigoConvite.toUpperCase(),
    })
    .getRawOne();

  if (!sala) return null;

  const membros = await AppDataSource.getRepository(SalaTrocaMembro)
    .createQueryBuilder("m")
    .innerJoin(Usuario, "u", "u.id = m.usuarioId")
    .select(["u.id AS id", "u.nome AS nome"])
    .where("m.salaId = :salaId", { salaId: sala.id })
    .getRawMany();

  return { ...sala, membros, totalMembros: membros.length };
}
