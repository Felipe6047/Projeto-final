const { Router } = require('express');
const { auth } = require('../middleware/auth');

const authCtrl = require('../controllers/auth.controller');
const comprasCtrl = require('../controllers/compras.controller');
const missoesCtrl = require('../controllers/missoes.controller');
const recompensasCtrl = require('../controllers/recompensas.controller');
const recomendacoesCtrl = require('../controllers/recomendacoes.controller');
const adminCtrl = require('../controllers/admin.controller');
const pool = require('../config/database');

const router = Router();

// Health
router.get('/health', (_req, res) => res.json({ status: 'ok', sistema: 'Fidelização Gamificação' }));

// Auth
router.post('/auth/login', authCtrl.login);
router.post('/auth/registrar', authCtrl.registrar);
router.get('/auth/perfil', auth(), authCtrl.perfil);

// Níveis (público)
router.get('/niveis', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM niveis ORDER BY pontos_minimos');
    res.json(rows);
  } catch {
    res.status(500).json({ erro: 'Erro ao listar níveis' });
  }
});

// Compras
router.get('/compras', auth(), comprasCtrl.listar);
router.get('/compras/:id', auth(), comprasCtrl.detalhe);
router.post('/compras', auth(), comprasCtrl.criar);

// Missões
router.get('/missoes', auth(), missoesCtrl.listarTodas);
router.get('/missoes/minhas', auth(), missoesCtrl.minhasMissoes);
router.post('/missoes', auth(['admin']), missoesCtrl.criar);

// Recompensas
router.get('/recompensas', auth(), recompensasCtrl.listar);
router.post('/recompensas/resgatar', auth(), recompensasCtrl.resgatar);
router.get('/recompensas/resgates', auth(), recompensasCtrl.meusResgates);

// Recomendações
router.get('/recomendacoes', auth(), recomendacoesCtrl.listar);
router.post('/recomendacoes/regenerar', auth(), recomendacoesCtrl.regenerar);
router.post('/recomendacoes/regenerar/:usuarioId', auth(['admin']), recomendacoesCtrl.regenerar);
router.patch('/recomendacoes/:id/visualizar', auth(), recomendacoesCtrl.marcarVisualizada);

// Admin
router.get('/admin/dashboard', auth(['admin']), adminCtrl.dashboard);
router.get('/admin/clientes', auth(['admin']), adminCtrl.listarClientes);
router.get('/admin/campanhas', auth(['admin']), adminCtrl.listarCampanhas);
router.post('/admin/campanhas', auth(['admin']), adminCtrl.criarCampanha);

module.exports = router;
