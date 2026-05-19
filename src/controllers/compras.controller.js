const pool = require('../config/database');
const {
  calcularPontosCompra,
  registrarProgressoMissoes,
  gerarRecomendacoes,
  atualizarNivelUsuario,
} = require('../services/gamificacao.service');

async function listar(req, res) {
  try {
    let sql = `SELECT c.*, u.nome AS cliente_nome
       FROM compras c
       JOIN usuarios u ON u.id = c.usuario_id`;
    const params = [];

    if (req.usuario.tipo === 'admin' && !req.query.usuario_id) {
      sql += ' ORDER BY c.data_compra DESC';
    } else {
      const usuarioId = req.query.usuario_id || req.usuario.id;
      sql += ' WHERE c.usuario_id = ? ORDER BY c.data_compra DESC';
      params.push(usuarioId);
    }

    const [compras] = await pool.query(sql, params);
    res.json(compras);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar compras' });
  }
}

async function criar(req, res) {
  const conn = await pool.getConnection();
  try {
    const usuarioId = req.body.usuario_id || req.usuario.id;
    const { itens, observacao } = req.body;

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ erro: 'Informe ao menos um item na compra' });
    }

    const valorTotal = itens.reduce(
      (sum, i) => sum + Number(i.quantidade) * Number(i.preco_unit),
      0
    );

    const [[cliente]] = await conn.query(
      `SELECT u.id, u.pontos_totais, n.multiplicador
       FROM usuarios u
       JOIN niveis n ON n.id = u.nivel_id
       WHERE u.id = ?`,
      [usuarioId]
    );
    if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });

    let pontosBonus = 0;
    for (const item of itens) {
      const [camp] = await conn.query(
        `SELECT pontos_bonus FROM campanhas
         WHERE ativa = 1 AND categoria_alvo = ? AND data_fim >= CURDATE() LIMIT 1`,
        [item.categoria]
      );
      if (camp[0]) pontosBonus += camp[0].pontos_bonus;
    }

    const pontosGanhos =
      calcularPontosCompra(valorTotal, Number(cliente.multiplicador)) + pontosBonus;

    await conn.beginTransaction();

    const [compraResult] = await conn.query(
      'INSERT INTO compras (usuario_id, valor_total, pontos_ganhos, observacao) VALUES (?, ?, ?, ?)',
      [usuarioId, valorTotal, pontosGanhos, observacao || null]
    );
    const compraId = compraResult.insertId;

    for (const item of itens) {
      await conn.query(
        'INSERT INTO itens_compra (compra_id, produto, categoria, quantidade, preco_unit) VALUES (?, ?, ?, ?, ?)',
        [compraId, item.produto, item.categoria, item.quantidade || 1, item.preco_unit]
      );
    }

    await conn.query(
      'UPDATE usuarios SET pontos_totais = pontos_totais + ? WHERE id = ?',
      [pontosGanhos, usuarioId]
    );

    await conn.commit();

    const compra = { valor_total: valorTotal, itens };
    await registrarProgressoMissoes(usuarioId, compra);
    await atualizarNivelUsuario(usuarioId);
    await gerarRecomendacoes(usuarioId);

    res.status(201).json({
      id: compraId,
      valor_total: valorTotal,
      pontos_ganhos: pontosGanhos,
      pontos_bonus_campanha: pontosBonus,
      mensagem: 'Compra registrada com sucesso',
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ erro: 'Erro ao registrar compra' });
  } finally {
    conn.release();
  }
}

async function detalhe(req, res) {
  try {
    const [compras] = await pool.query('SELECT * FROM compras WHERE id = ?', [req.params.id]);
    if (!compras[0]) return res.status(404).json({ erro: 'Compra não encontrada' });

    const [itens] = await pool.query('SELECT * FROM itens_compra WHERE compra_id = ?', [req.params.id]);
    res.json({ ...compras[0], itens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar compra' });
  }
}

module.exports = { listar, criar, detalhe };
