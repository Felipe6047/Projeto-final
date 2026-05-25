import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import { pool } from "../config/database";
import { env } from "../config/env";
import { JwtPayload } from "../middleware/auth";

interface UsuarioRow extends RowDataPacket {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  nivel_id: number;
  pontos: number;
  papel: "cliente" | "admin";
}

export async function login(email: string, senha: string) {
  const [rows] = await pool.query<UsuarioRow[]>(
    `SELECT id, nome, email, senha_hash, nivel_id, pontos, papel
     FROM usuario WHERE email = :email AND ativo = 1 LIMIT 1`,
    { email }
  );

  const user = rows[0];
  if (!user) return null;

  const valid = await bcrypt.compare(senha, user.senha_hash);
  if (!valid) return null;

  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    nivelId: user.nivel_id,
    papel: user.papel ?? "cliente",
  };

  const signOptions: SignOptions = { expiresIn: env.jwt.expiresIn as SignOptions["expiresIn"] };
  const token = jwt.sign(payload, env.jwt.secret, signOptions);

  return {
    token,
    usuario: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      nivelId: user.nivel_id,
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
  const [result] = await pool.query(
    `INSERT INTO usuario (nome, email, telefone, cpf, senha_hash)
     VALUES (:nome, :email, :telefone, :cpf, :senha_hash)`,
    {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone ?? null,
      cpf: data.cpf ?? null,
      senha_hash: hash,
    }
  );

  void result;
  return login(data.email, data.senha);
}

export async function buscarPerfil(usuarioId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.id, u.nome, u.email, u.telefone, u.cpf, u.pontos, u.avatar_url, u.papel,
            n.nome AS nivel, n.slug AS nivel_slug, n.ordem AS nivel_ordem
     FROM usuario u
     JOIN nivel_fidelidade n ON n.id = u.nivel_id
     WHERE u.id = :id`,
    { id: usuarioId }
  );
  return rows[0] ?? null;
}
