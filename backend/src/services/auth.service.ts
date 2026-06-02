import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { env } from "../config/env";
import { JwtPayload } from "../middleware/auth";
import { Usuario } from "../entities/Usuario";
import { HistoricoPontos } from "../entities/HistoricoPontos";

export async function login(email: string, senha: string) {
  const user = await AppDataSource.getRepository(Usuario).findOne({
    where: { email, ativo: true },
    select: {
      id: true,
      nome: true,
      email: true,
      senhaHash: true,
      nivelId: true,
      pontos: true,
      papel: true,
    },
  });

  if (!user) return null;

  const valid = await bcrypt.compare(senha, user.senhaHash);
  if (!valid) return null;

  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    nivelId: user.nivelId,
    papel: user.papel ?? "cliente",
  };

  const signOptions: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions["expiresIn"],
  };
  const token = jwt.sign(payload, env.jwt.secret, signOptions);

  return {
    token,
    usuario: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      nivelId: user.nivelId,
      pontos: user.pontos,
      papel: user.papel ?? "cliente",
    },
  };
}

export async function registrar(data: {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  cpf?: string;
}) {
  const hash = await bcrypt.hash(data.senha, 10);
  const repo = AppDataSource.getRepository(Usuario);

  await repo.save({
    nome: data.nome,
    email: data.email,
    telefone: data.telefone ?? null,
    cpf: data.cpf ?? null,
    senhaHash: hash,
  });

  return login(data.email, data.senha);
}

export async function buscarPerfil(usuarioId: number) {
  const row = await AppDataSource.getRepository(Usuario)
    .createQueryBuilder("u")
    .innerJoin("u.nivel", "n")
    .select([
      "u.id AS id",
      "u.nome AS nome",
      "u.email AS email",
      "u.telefone AS telefone",
      "u.cpf AS cpf",
      "u.pontos AS pontos",
      "u.avatarUrl AS avatar_url",
      "u.papel AS papel",
      "n.nome AS nivel",
      "n.slug AS nivel_slug",
      "n.ordem AS nivel_ordem",
    ])
    .where("u.id = :id", { id: usuarioId })
    .getRawOne();

  return row ?? null;
}

export async function historicoPontos(usuarioId: number, limite = 30) {
  return AppDataSource.getRepository(HistoricoPontos)
    .createQueryBuilder("h")
    .select([
      "h.id AS id",
      "h.valor AS valor",
      "h.saldoApos AS saldo_apos",
      "h.tipo AS tipo",
      "h.descricao AS descricao",
      "h.criadoEm AS criado_em",
    ])
    .where("h.usuarioId = :usuarioId", { usuarioId })
    .orderBy("h.criadoEm", "DESC")
    .limit(limite)
    .getRawMany();
}
