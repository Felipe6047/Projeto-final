const pool = require('../config/database');
const { gerarRecomendacoes } = require('../services/gamificacao.service');

async function listar(req, res) {
  try {
    const usuarioId = req.usuario.tipo === 'admin' && req.query.usuario_id
      ? req.query.usuario_id
      : req.usuario.id;

    const [rows] = await pool.query(
      `SELECT * FROM recomendacoes
       WHERE usuario_id = ? AND (expira_em IS NULL OR expira_em >= CURDATE())
       ORDER BY score DESC`,
      [usuarioId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar recomendações' });
  }
}

async function regenerar(req, res) {
  try {
    const usuarioId = req.params.usuarioId || req.usuario.id;
    await gerarRecomendacoes(usuarioId);
    const [rows] = await pool.query(
      'SELECT * FROM recomendacoes WHERE usuario_id = ? ORDER BY score DESC',
      [usuarioId]
    );
    res.json({ mensagem: 'Recomendações atualizadas', itens: rows });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao gerar recomendações' });
  }
}

async function marcarVisualizada(req, res) {
  try {
    await pool.query('UPDATE recomendacoes SET visualizada = 1 WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Marcada como visualizada' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar' });
  }
}

module.exports = { listar, regenerar, marcarVisualizada };
