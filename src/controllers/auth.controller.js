const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

function extrairCredenciais(body = {}, query = {}) {
  const fonte = { ...query, ...body };
  const email = (fonte.email || fonte.Email || '').toString().trim();
  const senha = (fonte.senha || fonte.password || '').toString();
  return { email, senha };
}

async function login(req, res) {
  try {
    const { email, senha } = extrairCredenciais(req.body, req.query);

    if (!email || !senha) {
      return res.status(400).json({
        erro: 'Email e senha são obrigatórios',
        dica: 'Insomnia: aba Body → JSON (recomendado) OU aba Params com email e senha',
        exemplo_body: { email: 'maria@email.com', senha: 'cliente123' },
        exemplo_params: '?email=maria@email.com&senha=cliente123',
        body_recebido: req.body,
        params_recebidos: req.query,
      });
    }

    const [rows] = await pool.query(
      `SELECT u.*, n.nome AS nivel_nome, n.multiplicador, n.cor_hex
       FROM usuarios u
       JOIN niveis n ON n.id = u.nivel_id
       WHERE u.email = ? AND u.ativo = 1`,
      [email]
    );

    const usuario = rows[0];
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo, nome: usuario.nome },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        pontos_totais: usuario.pontos_totais,
        nivel: { nome: usuario.nivel_nome, multiplicador: usuario.multiplicador, cor: usuario.cor_hex },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao autenticar' });
  }
}

async function registrar(req, res) {
  try {
    const nome = (req.body.nome || '').toString().trim();
    const { email, senha } = extrairCredenciais(req.body, req.query);
    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: 'Nome, email e senha são obrigatórios',
        exemplo: { nome: 'João', email: 'joao@email.com', senha: '123456' },
      });
    }

    const hash = await bcrypt.hash(senha, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, tipo, nivel_id) VALUES (?, ?, ?, ?, 1)',
      [nome, email, hash, 'cliente']
    );

    res.status(201).json({ id: result.insertId, mensagem: 'Cliente cadastrado com sucesso' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }
    console.error(err);
    res.status(500).json({ erro: 'Erro ao registrar' });
  }
}

async function perfil(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.nome, u.email, u.tipo, u.pontos_totais, u.created_at,
              n.nome AS nivel_nome, n.multiplicador, n.cor_hex, n.beneficios
       FROM usuarios u
       JOIN niveis n ON n.id = u.nivel_id
       WHERE u.id = ?`,
      [req.usuario.id]
    );
    if (!rows[0]) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar perfil' });
  }
}

module.exports = { login, registrar, perfil };
