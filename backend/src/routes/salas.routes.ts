import { Router } from "express";
import { z } from "zod";
import * as salaService from "../services/sala.service";
import { authRequired } from "../middleware/auth";
import { fail, ok } from "../utils/http";

const router = Router();

router.get("/:codigo", async (req, res, next) => {
  try {
    const sala = await salaService.detalheSala(req.params.codigo);
    if (!sala) return fail(res, "Sala não encontrada", 404);
    return ok(res, sala);
  } catch (e) {
    next(e);
  }
});

router.use(authRequired);

router.get("/", async (req, res, next) => {
  try {
    return ok(res, await salaService.listarMinhasSalas(req.user!.id));
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const body = z.object({ nome: z.string().min(2).max(80) }).parse(req.body);
    const result = await salaService.criarSala(req.user!.id, body.nome);
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

router.post("/:codigo/entrar", async (req, res, next) => {
  try {
    const result = await salaService.entrarSala(req.user!.id, req.params.codigo);
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

export default router;
