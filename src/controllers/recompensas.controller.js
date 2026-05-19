const pool = require('../config/database');

async function listar(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM recompensas WHERE ativa = 1 ORDER BY custo_pontos');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar recompensas' });
  }
}

async function resgatar(req, res) {
  const conn = await pool.getConnection();
  try {
    const { recompensa_id } = req.body;
    const usuarioId = req.usuario.id;

    const [[recompensa]] = await conn.query(
      'SELECT * FROM recompensas WHERE id = ? AND ativa = 1',
      [recompensa_id]
    );
    if (!recompensa) return res.status(404).json({ erro: 'Recompensa não encontrada' });
    if (recompensa.estoque <= 0) return res.status(400).json({ erro: 'Estoque esgotado' });

    const [[usuario]] = await conn.query(
      'SELECT pontos_totais FROM usuarios WHERE id = ?',
      [usuarioId]
    );
    if (usuario.pontos_totais < recompensa.custo_pontos) {
      return res.status(400).json({ erro: 'Pontos insuficientes' });
    }

    await conn.beginTransaction();
    await conn.query(
      'UPDATE usuarios SET pontos_totais = pontos_totais - ? WHERE id = ?',
      [recompensa.custo_pontos, usuarioId]
    );
    await conn.query('UPDATE recompensas SET estoque = estoque - 1 WHERE id = ?', [recompensa_id]);
    const [result] = await conn.query(
      'INSERT INTO resgates (usuario_id, recompensa_id, pontos_gastos) VALUES (?, ?, ?)',
      [usuarioId, recompensa_id, recompensa.custo_pontos]
    );
    await conn.commit();

    res.status(201).json({
      id: result.insertId,
      mensagem: 'Recompensa resgatada com sucesso',
      pontos_restantes: usuario.pontos_totais - recompensa.custo_pontos,
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ erro: 'Erro ao resgatar' });
  } finally {
    conn.release();
  }
}

async function meusResgates(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, rec.titulo, rec.tipo
       FROM resgates r
       JOIN recompensas rec ON rec.id = r.recompensa_id
       WHERE r.usuario_id = ?
       ORDER BY r.data_resgate DESC`,
      [req.usuario.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar resgates' });
  }
}

module.exports = { listar, resgatar, meusResgates };
