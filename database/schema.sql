-- ============================================================
-- Sistema de Fidelização com Gamificação
-- MySQL 8+ | Execute no MySQL Workbench
-- ============================================================

CREATE DATABASE IF NOT EXISTS fidelizacao_gamificacao
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fidelizacao_gamificacao;

-- ------------------------------------------------------------
-- Níveis de fidelidade (gamificação)
-- ------------------------------------------------------------
CREATE TABLE niveis (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome          VARCHAR(50)  NOT NULL UNIQUE,
  pontos_minimos INT UNSIGNED NOT NULL DEFAULT 0,
  multiplicador  DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  cor_hex       VARCHAR(7)   NOT NULL DEFAULT '#6c757d',
  beneficios    TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Usuários (clientes e administradores)
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(120) NOT NULL,
  email           VARCHAR(180) NOT NULL UNIQUE,
  senha_hash      VARCHAR(255) NOT NULL,
  tipo            ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
  pontos_totais   INT UNSIGNED NOT NULL DEFAULT 0,
  nivel_id        INT UNSIGNED NOT NULL DEFAULT 1,
  ativo           TINYINT(1)   NOT NULL DEFAULT 1,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_nivel FOREIGN KEY (nivel_id) REFERENCES niveis(id)
);

-- ------------------------------------------------------------
-- Compras e itens (histórico para recomendações)
-- ------------------------------------------------------------
CREATE TABLE compras (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id    INT UNSIGNED NOT NULL,
  valor_total   DECIMAL(10,2) NOT NULL,
  pontos_ganhos INT UNSIGNED NOT NULL DEFAULT 0,
  observacao    VARCHAR(255),
  data_compra   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_compra_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE itens_compra (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  compra_id   INT UNSIGNED NOT NULL,
  produto     VARCHAR(150) NOT NULL,
  categoria   VARCHAR(80)  NOT NULL,
  quantidade  INT UNSIGNED NOT NULL DEFAULT 1,
  preco_unit  DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_item_compra FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
  INDEX idx_itens_categoria (categoria)
);

-- ------------------------------------------------------------
-- Missões / desafios
-- ------------------------------------------------------------
CREATE TABLE missoes (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo           VARCHAR(120) NOT NULL,
  descricao        TEXT,
  tipo             ENUM('compras_qtd', 'valor_gasto', 'categoria', 'pontos_acumulados') NOT NULL,
  meta_valor       DECIMAL(10,2) NOT NULL,
  categoria_alvo   VARCHAR(80),
  pontos_recompensa INT UNSIGNED NOT NULL DEFAULT 50,
  ativa            TINYINT(1) NOT NULL DEFAULT 1,
  data_inicio      DATE,
  data_fim         DATE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuario_missoes (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT UNSIGNED NOT NULL,
  missao_id       INT UNSIGNED NOT NULL,
  progresso       DECIMAL(10,2) NOT NULL DEFAULT 0,
  concluida       TINYINT(1) NOT NULL DEFAULT 0,
  data_conclusao  TIMESTAMP NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_usuario_missao (usuario_id, missao_id),
  CONSTRAINT fk_um_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_um_missao   FOREIGN KEY (missao_id)   REFERENCES missoes(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Campanhas promocionais
-- ------------------------------------------------------------
CREATE TABLE campanhas (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo              VARCHAR(120) NOT NULL,
  descricao           TEXT,
  desconto_percentual DECIMAL(5,2) NOT NULL DEFAULT 0,
  categoria_alvo      VARCHAR(80),
  pontos_bonus        INT UNSIGNED NOT NULL DEFAULT 0,
  ativa               TINYINT(1) NOT NULL DEFAULT 1,
  data_inicio         DATE NOT NULL,
  data_fim            DATE NOT NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Recompensas e resgates
-- ------------------------------------------------------------
CREATE TABLE recompensas (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo       VARCHAR(120) NOT NULL,
  descricao    TEXT,
  custo_pontos INT UNSIGNED NOT NULL,
  tipo         ENUM('desconto', 'cashback', 'brinde', 'frete_gratis') NOT NULL,
  valor        DECIMAL(10,2),
  estoque      INT UNSIGNED NOT NULL DEFAULT 100,
  ativa        TINYINT(1) NOT NULL DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resgates (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id   INT UNSIGNED NOT NULL,
  recompensa_id INT UNSIGNED NOT NULL,
  pontos_gastos INT UNSIGNED NOT NULL,
  status       ENUM('pendente', 'aprovado', 'cancelado') NOT NULL DEFAULT 'aprovado',
  data_resgate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_resgate_usuario   FOREIGN KEY (usuario_id)    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_resgate_recompensa FOREIGN KEY (recompensa_id) REFERENCES recompensas(id)
);

-- ------------------------------------------------------------
-- Ofertas personalizadas (cache de recomendações)
-- ------------------------------------------------------------
CREATE TABLE recomendacoes (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id   INT UNSIGNED NOT NULL,
  titulo       VARCHAR(150) NOT NULL,
  descricao    TEXT,
  categoria    VARCHAR(80),
  score        DECIMAL(5,2) NOT NULL DEFAULT 0,
  expira_em    DATE,
  visualizada  TINYINT(1) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rec_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_rec_usuario (usuario_id)
);

-- ------------------------------------------------------------
-- Dados iniciais
-- ------------------------------------------------------------
INSERT INTO niveis (nome, pontos_minimos, multiplicador, cor_hex, beneficios) VALUES
  ('Bronze',   0,    1.00, '#cd7f32', 'Acesso ao catálogo de recompensas básicas'),
  ('Prata',    500,  1.25, '#c0c0c0', 'Bônus de 25% em pontos e ofertas exclusivas'),
  ('Ouro',     1500, 1.50, '#ffd700', 'Bônus de 50% em pontos e frete grátis mensal'),
  ('Platina',  5000, 2.00, '#e5e4e2', 'Dobro de pontos e atendimento prioritário');

INSERT INTO missoes (titulo, descricao, tipo, meta_valor, pontos_recompensa, ativa) VALUES
  ('Primeira compra', 'Realize sua primeira compra no sistema', 'compras_qtd', 1, 100, 1),
  ('Cliente frequente', 'Faça 5 compras', 'compras_qtd', 5, 250, 1),
  ('Grande consumidor', 'Gaste R$ 500 em compras', 'valor_gasto', 500, 300, 1),
  ('Explorador', 'Compre em 3 categorias diferentes', 'categoria', 3, 200, 1);

INSERT INTO campanhas (titulo, descricao, desconto_percentual, categoria_alvo, pontos_bonus, ativa, data_inicio, data_fim) VALUES
  ('Semana Bebidas', '15% off em bebidas + 50 pontos bônus', 15, 'Bebidas', 50, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
  ('Tech Fever', '20% em eletrônicos', 20, 'Eletrônicos', 100, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 45 DAY));

INSERT INTO recompensas (titulo, descricao, custo_pontos, tipo, valor, estoque) VALUES
  ('Cupom R$ 10', 'Desconto de R$ 10 na próxima compra', 200, 'desconto', 10, 500),
  ('Cashback 5%', '5% de cashback na próxima compra', 350, 'cashback', 5, 200),
  ('Brinde exclusivo', 'Kit surpresa da loja', 500, 'brinde', 0, 50),
  ('Frete grátis', 'Frete grátis em qualquer pedido', 150, 'frete_gratis', 0, 300);

-- Admin padrão: senha "admin123" (bcrypt gerado pelo seed do backend)
-- Cliente demo será criado pelo seed do backend
