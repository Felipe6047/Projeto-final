import { Router } from "express";
import { z } from "zod";
import * as simuladorService from "../services/simulador-caixa.service";
import { authRequired } from "../middleware/auth";
import { adminRequired } from "../middleware/admin";
import { fail, ok } from "../utils/http";

const router = Router();

router.use(authRequired, adminRequired);

router.post("/venda", async (req, res, next) => {
  try {
    const body = z
      .object({
        cpf: z.string().min(11).max(14),
        valorTotal: z.number().positive(),
      })
      .parse(req.body);

    const cpf = body.cpf.replace(/\D/g, "");
    const result = await simuladorService.registrarVendaPorCpf(
      cpf,
      body.valorTotal
    );
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

router.post("/nota", async (req, res, next) => {
  try {
    const body = z
      .object({
        valorTotal: z.number().positive(),
        cpf: z.string().min(11).max(14).optional(),
      })
      .parse(req.body);

    const result = await simuladorService.gerarNotaFiscal(
      body.valorTotal,
      body.cpf
    );
    if ("erro" in result) return fail(res, result.erro!);
    return ok(res, result, 201);
  } catch (e) {
    next(e);
  }
});

export default router;
