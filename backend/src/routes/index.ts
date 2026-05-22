import { Router } from "express";
import authRoutes from "./auth.routes";
import mercadoRoutes from "./mercado.routes";
import presentesRoutes from "./presentes.routes";
import rankingRoutes from "./ranking.routes";
import produtosRoutes from "./produtos.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", projeto: "FRIK API" });
});

router.use("/auth", authRoutes);
router.use("/mercado-cupons", mercadoRoutes);
router.use("/presentes", presentesRoutes);
router.use("/ranking", rankingRoutes);
router.use("/produtos", produtosRoutes);

export default router;
