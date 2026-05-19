const pool = require('../config/database');

async function dashboard(req, res) {
  try {
    const [[metricas]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM usuarios WHERE tipo = 'cliente' AND ativo = 1) AS total_clientes,
        (SELECT COUNT(*) FROM compras) AS total_compras,
        (SELECT COALESCE(SUM(valor_total), 0) FROM compras) AS faturamento_total,
        (SELECT COALESCE(AVG(valor_total), 0) FROM compras) AS ticket_medio,
        (SELECT COALESCE(SUM(pontos_ganhos), 0) FROM compras) AS pontos_distribuidos
    `);

    const [porNivel] = await pool.query(`
      SELECT n.nome, n.cor_hex, COUNT(u.id) AS clientes
      FROM niveis n
      LEFT JOIN usuarios u ON u.nivel_id = n.id AND u.tipo = 'cliente'
      GROUP BY n.id
      ORDER BY n.pontos_minimos
    `);

    const [comprasMes] = await pool.query(`
      SELECT DATE_FORMAT(data_compra, '%Y-%m') AS mes,
             COUNT(*) AS qtd,
             SUM(valor_total) AS valor
      FROM compras
      WHERE data_compra >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY mes
      ORDER BY mes
    `);

    const [topCategorias] = await pool.query(`
      SELECT categoria, SUM(quantidade * preco_unit) AS valor
      FROM itens_compra
      GROUP BY categoria
      ORDER BY valor DESC
      LIMIT 5
    `);

    res.json({ metricas, porNivel, comprasMes, topCategorias });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao carregar dashboard' });
  }
}

async function listarClientes(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nome, u.email, u.pontos_totais, u.created_at,
              n.nome AS nivel, n.cor_hex
       FROM usuarios u
       JOIN niveis n ON n.id = u.nivel_id
       WHERE u.tipo = 'cliente'
       ORDER BY u.pontos_totais DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar clientes' });
  }
}

async function listarCampanhas(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM campanhas ORDER BY data_inicio DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar campanhas' });
  }
}

async function criarCampanha(req, res) {
  try {
    const { titulo, descricao, desconto_percentual, categoria_alvo, pontos_bonus, data_inicio, data_fim } =
      req.body;
    const [result] = await pool.query(
      `INSERT INTO campanhas (titulo, descricao, desconto_percentual, categoria_alvo, pontos_bonus, data_inicio, data_fim)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [titulo, descricao, desconto_percentual, categoria_alvo, pontos_bonus || 0, data_inicio, data_fim]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar campanha' });
  }
}

module.exports = { dashboard, listarClientes, listarCampanhas, criarCampanha };
