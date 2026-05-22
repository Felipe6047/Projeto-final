import { Router } from "express";
import { RowDataPacket } from "mysql2";
import { pool } from "../config/database";
import { ok } from "../utils/http";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, nome, descricao, preco_reais, preco_pontos, estoque, imagem_url
       FROM produto WHERE ativo = 1 ORDER BY nome`
    );
    return ok(res, rows);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, nome, descricao, preco_reais, preco_pontos, estoque, imagem_url
       FROM produto WHERE id = :id AND ativo = 1`,
      { id: Number(req.params.id) }
    );
    if (!rows[0]) return res.status(404).json({ erro: "Produto não encontrado" });
    return ok(res, rows[0]);
  } catch (e) {
    next(e);
  }
});

export default router;
