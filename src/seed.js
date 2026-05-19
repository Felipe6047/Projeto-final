/**
 * Executa após criar o banco com database/schema.sql
 * Uso: npm run seed
 */
const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function seed() {
  const senhaAdmin = await bcrypt.hash('admin123', 10);
  const senhaCliente = await bcrypt.hash('cliente123', 10);

  try {
    await pool.query(
      `INSERT IGNORE INTO usuarios (id, nome, email, senha_hash, tipo, pontos_totais, nivel_id)
       VALUES (1, 'Administrador', 'admin@loja.com', ?, 'admin', 0, 1)`,
      [senhaAdmin]
    );

    await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, tipo, pontos_totais, nivel_id)
       SELECT 'Maria Silva', 'maria@email.com', ?, 'cliente', 120, 1
       WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'maria@email.com')`,
      [senhaCliente]
    );

    const [[maria]] = await pool.query("SELECT id FROM usuarios WHERE email = 'maria@email.com'");

    if (maria) {
      const [comprasExistentes] = await pool.query(
        'SELECT COUNT(*) AS c FROM compras WHERE usuario_id = ?',
        [maria.id]
      );
      if (comprasExistentes[0].c === 0) {
        const [compra] = await pool.query(
          'INSERT INTO compras (usuario_id, valor_total, pontos_ganhos) VALUES (?, 89.90, 89)',
          [maria.id]
        );
        await pool.query(
          `INSERT INTO itens_compra (compra_id, produto, categoria, quantidade, preco_unit) VALUES
           (?, 'Refrigerante 2L', 'Bebidas', 2, 8.99),
           (?, 'Cerveja Artesanal', 'Bebidas', 6, 12.00)`,
          [compra.insertId, compra.insertId]
        );
      }
    }

    console.log('Seed concluído!');
    console.log('Admin: admin@loja.com / admin123');
    console.log('Cliente: maria@email.com / cliente123');
    process.exit(0);
  } catch (err) {
    console.error('Erro no seed:', err.message);
    process.exit(1);
  }
}

seed();
