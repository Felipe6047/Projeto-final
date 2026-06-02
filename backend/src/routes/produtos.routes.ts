import { Router } from "express";
import { AppDataSource } from "../config/database";
import { Produto } from "../entities/Produto";
import { ok } from "../utils/http";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const rows = await AppDataSource.getRepository(Produto).find({
      where: { ativo: true },
      order: { nome: "ASC" },
      select: {
        id: true,
        nome: true,
        descricao: true,
        precoReais: true,
        precoPontos: true,
        estoque: true,
        imagemUrl: true,
      },
    });
    const mapped = rows.map((p) => ({
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      preco_reais: p.precoReais,
      preco_pontos: p.precoPontos,
      estoque: p.estoque,
      imagem_url: p.imagemUrl,
    }));
    return ok(res, mapped);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const produto = await AppDataSource.getRepository(Produto).findOne({
      where: { id: Number(req.params.id), ativo: true },
      select: {
        id: true,
        nome: true,
        descricao: true,
        precoReais: true,
        precoPontos: true,
        estoque: true,
        imagemUrl: true,
      },
    });
    if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });
    return ok(res, {
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco_reais: produto.precoReais,
      preco_pontos: produto.precoPontos,
      estoque: produto.estoque,
      imagem_url: produto.imagemUrl,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
