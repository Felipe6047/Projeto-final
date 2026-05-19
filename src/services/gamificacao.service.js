const pool = require('../config/database');

async function obterNivelPorPontos(pontos) {
  const [rows] = await pool.query(
    `SELECT id, nome, multiplicador, cor_hex
     FROM niveis
     WHERE pontos_minimos <= ?
     ORDER BY pontos_minimos DESC
     LIMIT 1`,
    [pontos]
  );
  return rows[0];
}

async function atualizarNivelUsuario(usuarioId) {
  const [[usuario]] = await pool.query(
    'SELECT pontos_totais FROM usuarios WHERE id = ?',
    [usuarioId]
  );
  if (!usuario) return null;

  const nivel = await obterNivelPorPontos(usuario.pontos_totais);
  if (!nivel) return null;

  await pool.query('UPDATE usuarios SET nivel_id = ? WHERE id = ?', [
    nivel.id,
    usuarioId,
  ]);
  return nivel;
}

function calcularPontosCompra(valorTotal, multiplicador = 1) {
  return Math.floor(valorTotal * multiplicador);
}

async function registrarProgressoMissoes(usuarioId, compra) {
  const [missoes] = await pool.query(
    `SELECT m.*, COALESCE(um.progresso, 0) AS progresso_atual, COALESCE(um.concluida, 0) AS concluida
     FROM missoes m
     LEFT JOIN usuario_missoes um ON um.missao_id = m.id AND um.usuario_id = ?
     WHERE m.ativa = 1`,
    [usuarioId]
  );

  for (const missao of missoes) {
    if (missao.concluida) continue;

    let novoProgresso = Number(missao.progresso_atual);

    if (missao.tipo === 'compras_qtd') {
      novoProgresso += 1;
    } else if (missao.tipo === 'valor_gasto') {
      novoProgresso += Number(compra.valor_total);
    } else if (missao.tipo === 'categoria') {
      const categorias = new Set(compra.itens.map((i) => i.categoria));
      const [existentes] = await pool.query(
        `SELECT DISTINCT ic.categoria
         FROM itens_compra ic
         JOIN compras c ON c.id = ic.compra_id
         WHERE c.usuario_id = ?`,
        [usuarioId]
      );
      existentes.forEach((e) => categorias.add(e.categoria));
      novoProgresso = categorias.size;
    }

    const concluida = novoProgresso >= Number(missao.meta_valor) ? 1 : 0;

    await pool.query(
      `INSERT INTO usuario_missoes (usuario_id, missao_id, progresso, concluida, data_conclusao)
       VALUES (?, ?, ?, ?, IF(?, NOW(), NULL))
       ON DUPLICATE KEY UPDATE
         progresso = VALUES(progresso),
         concluida = VALUES(concluida),
         data_conclusao = IF(VALUES(concluida) = 1 AND concluida = 0, NOW(), data_conclusao)`,
      [usuarioId, missao.id, novoProgresso, concluida, concluida]
    );

    if (concluida && !missao.concluida) {
      await pool.query(
        'UPDATE usuarios SET pontos_totais = pontos_totais + ? WHERE id = ?',
        [missao.pontos_recompensa, usuarioId]
      );
    }
  }

  await atualizarNivelUsuario(usuarioId);
}

async function gerarRecomendacoes(usuarioId) {
  const [categorias] = await pool.query(
    `SELECT ic.categoria, COUNT(*) AS total, SUM(ic.quantidade * ic.preco_unit) AS valor
     FROM itens_compra ic
     JOIN compras c ON c.id = ic.compra_id
     WHERE c.usuario_id = ?
     GROUP BY ic.categoria
     ORDER BY valor DESC
     LIMIT 5`,
    [usuarioId]
  );

  await pool.query('DELETE FROM recomendacoes WHERE usuario_id = ?', [usuarioId]);

  if (!categorias.length) {
    const [campanhas] = await pool.query(
      `SELECT titulo, descricao, categoria_alvo
       FROM campanhas WHERE ativa = 1 AND data_fim >= CURDATE() LIMIT 3`
    );
    for (const camp of campanhas) {
      await pool.query(
        `INSERT INTO recomendacoes (usuario_id, titulo, descricao, categoria, score, expira_em)
         VALUES (?, ?, ?, ?, 0.8, DATE_ADD(CURDATE(), INTERVAL 15 DAY))`,
        [usuarioId, camp.titulo, camp.descricao, camp.categoria_alvo]
      );
    }
    return;
  }

  for (const cat of categorias) {
    const [campanha] = await pool.query(
      `SELECT titulo, descricao, desconto_percentual, pontos_bonus
       FROM campanhas
       WHERE ativa = 1 AND (categoria_alvo = ? OR categoria_alvo IS NULL)
         AND data_fim >= CURDATE()
       ORDER BY desconto_percentual DESC
       LIMIT 1`,
      [cat.categoria]
    );

    const titulo = campanha[0]
      ? `Oferta em ${cat.categoria}: ${campanha[0].titulo}`
      : `Continue comprando em ${cat.categoria}`;
    const descricao = campanha[0]
      ? `${campanha[0].descricao} — ${campanha[0].desconto_percentual}% off + ${campanha[0].pontos_bonus} pts`
      : `Você já gastou R$ ${Number(cat.valor).toFixed(2)} nesta categoria`;

    await pool.query(
      `INSERT INTO recomendacoes (usuario_id, titulo, descricao, categoria, score, expira_em)
       VALUES (?, ?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 30 DAY))`,
      [usuarioId, titulo, descricao, cat.categoria, Math.min(cat.total / 10, 1)]
    );
  }
}

module.exports = {
  obterNivelPorPontos,
  atualizarNivelUsuario,
  calcularPontosCompra,
  registrarProgressoMissoes,
  gerarRecomendacoes,
};
