import { Router } from "express";
import { z } from "zod";
import * as authService from "../services/auth.service";
import { authRequired } from "../middleware/auth";
import { fail, ok } from "../utils/http";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
});

const registroSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
  telefone: z.string().optional(),
  cpf: z.string().length(11).optional(),
});

router.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body.email, body.senha);
    if (!result) return fail(res, "Credenciais inválidas", 401);
    return ok(res, result);
  } catch (e) {
    next(e);
  }
});

router.post("/registro", async (req, res, next) => {
  try {
    const body = registroSchema.parse(req.body);
    const result = await authService.registrar(body);
    if (!result) return fail(res, "Não foi possível registrar", 400);
    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

router.get("/perfil", authRequired, async (req, res, next) => {
  try {
    const perfil = await authService.buscarPerfil(req.user!.id);
    if (!perfil) return fail(res, "Usuário não encontrado", 404);
    return ok(res, perfil);
  } catch (e) {
    next(e);
  }
});

export default router;
