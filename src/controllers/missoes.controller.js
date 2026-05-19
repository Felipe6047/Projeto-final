const pool = require('../config/database');

async function listarTodas(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM missoes ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar missões' });
  }
}

async function minhasMissoes(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT m.*,
              COALESCE(um.progresso, 0) AS progresso,
              COALESCE(um.concluida, 0) AS concluida,
              um.data_conclusao,
              ROUND(COALESCE(um.progresso, 0) / m.meta_valor * 100, 1) AS percentual
       FROM missoes m
       LEFT JOIN usuario_missoes um ON um.missao_id = m.id AND um.usuario_id = ?
       WHERE m.ativa = 1`,
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar missões do usuário' });
  }
}

async function criar(req, res) {
  try {
    const { titulo, descricao, tipo, meta_valor, categoria_alvo, pontos_recompensa } = req.body;
    const [result] = await pool.query(
      `INSERT INTO missoes (titulo, descricao, tipo, meta_valor, categoria_alvo, pontos_recompensa)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [titulo, descricao, tipo, meta_valor, categoria_alvo || null, pontos_recompensa || 50]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar missão' });
  }
}

module.exports = { listarTodas, minhasMissoes, criar };
