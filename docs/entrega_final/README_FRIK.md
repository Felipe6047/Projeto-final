# FRIK — Plataforma de Fidelização e Gamificação

<p align="center">
  <b>Sistema Web completo de engajamento para varejo: acúmulo de pontos, níveis progressivos, mercado P2P de trocas e gamificação avançada.</b>
</p>

---

## 🚀 O Projeto

O **FRIK** é um Trabalho de Conclusão de Curso Técnico em Informática desenvolvido no **SENAI - CETEC Palmas (2026)**. O objetivo é solucionar o problema de retenção de clientes em comércios locais, transformando as compras em uma experiência gamificada.

O diferencial do FRIK é o **Feirão de Trocas P2P**: uma economia interna onde usuários podem negociar cupons diretamente entre si, criando um motivo de retorno ao app mesmo sem realizar novas compras.

---

## 🎯 Funcionalidades do MVP

| Módulo | Descrição |
|--------|-----------|
| **Progressão de Níveis** | Bronze → Prata → Ouro → Platina → Diamante, com benefícios reais em cada nível |
| **Acúmulo de Pontos** | 1 ponto por R$ 1,00 em compras, creditado automaticamente |
| **Mercado de Cupons** | Resgate de cupons de desconto usando pontos acumulados |
| **Feirão de Trocas P2P** | Usuários oferecem e trocam cupons entre si com Salas de Troca privadas |
| **Presentes** | Envio de cupons e produtos físicos como presente para amigos |
| **Missões** | Desafios criados pelo admin (ex: "Faça 3 trocas e ganhe 100 pontos") |
| **Conquistas (Badges)** | Troféus permanentes desbloqueados automaticamente por ações |
| **Ranking** | Tabela global com posição do usuário e múltiplas categorias |
| **Painel Admin** | CRUD completo de campanhas, cupons, produtos, missões e eventos sazonais |
| **Gamificação** | Streak diário, notificações em tempo real, ofensiva de acesso |

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| **Backend** | Node.js 18+, Express 4, TypeScript, TypeORM 0.3 |
| **Banco de Dados** | MySQL 8.0 (Migrations + Seed automatizados) |
| **Infraestrutura** | Docker + Docker Compose |
| **Autenticação** | JWT (7 dias) + Bcrypt (10 rounds) |
| **Validação** | Zod (schemas de entrada no backend) |

---

## ⚡ Como Rodar o Projeto

### Método 1: Docker (Recomendado)

> Sobe tudo automaticamente: MySQL + API + Frontend com 1 comando.

**Pré-requisito:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado.

```bash
# 1. Clone o repositório
git clone https://github.com/Felipe6047/Projeto-final.git
cd Projeto-final

# 2. (Opcional) Configure variáveis de ambiente
cp .env.docker.example .env
# Edite o .env se quiser mudar portas, senhas ou JWT_SECRET

# 3. Suba todos os serviços
docker compose up --build
```

Na primeira execução, o Docker automaticamente:
- Baixa as imagens (MySQL 8, Node)
- Compila o backend e o frontend
- Roda as migrações do banco de dados
- Popula o banco com dados de teste (seed)

**Acesse:**

| Serviço | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:3000 |
| ⚙️ API | http://localhost:3333/api |
| ❤️ Health Check | http://localhost:3333/api/health |

Para rodar em segundo plano:
```bash
docker compose up --build -d
```

Para parar:
```bash
docker compose down
```

Para reiniciar do zero (apaga o banco):
```bash
docker compose down -v
```

---

### Método 2: Execução Local (sem Docker)

**Pré-requisitos:** Node.js 18+ e MySQL 8 instalados.

#### Passo 1 — Criar o banco de dados
```sql
CREATE DATABASE frik;
```

#### Passo 2 — Configurar e rodar o Backend

```bash
cd backend
npm install
```

> Se sua senha do MySQL for diferente, edite o arquivo `backend/.env` na variável `DB_PASSWORD`.

```bash
npm run db:migrate   # Cria as tabelas (rode primeiro)
npm run db:seed      # Popula com dados de teste (rode depois)
npm run dev          # Inicia o servidor de desenvolvimento (porta 3333)
```

#### Passo 3 — Rodar o Frontend (novo terminal)

```bash
cd frontend
npm install
npm run dev          # Inicia o frontend (porta 3000)
```

---

## 🔑 Credenciais de Teste

| Perfil | E-mail | Senha |
|--------|--------|-------|
| **Administrador** | `admin@frik.demo` | `senha123` |
| **Cliente (Ana)** | `ana@frik.demo` | `senha123` |
| **Cliente (Carlos)** | `carlos@frik.demo` | `senha123` |

---

## 🧪 Testes Automatizados

O projeto inclui testes com **Jest** e **React Testing Library** cobrindo renderização, responsividade e acessibilidade (A11y via `jest-axe`).

```bash
# Testes do frontend
cd frontend
npm run test           # Rodar todos os testes
npm run test:coverage  # Com relatório de cobertura

# Testes do backend
cd backend
npm run test
```

---

## 👥 Equipe Desenvolvedora

| Nome | |
|------|--|
| **Felipe Ferreira dos Santos** | Desenvolvimento |
| **Isaac de Azevedo Costa** | Desenvolvimento |
| **Kamyla Sousa Santana** | Desenvolvimento |
| **Ryan Felipe Coqueiro Oliveira** | Desenvolvimento |

**Orientação:** Prof. Eduardo Baranowski — SENAI CETEC Palmas

---

## 📁 Estrutura do Repositório

```
Projeto-final/
├── backend/                    # API REST (Express + TypeORM)
│   ├── src/
│   │   ├── config/             # Configurações (DB, ENV, Data Source)
│   │   ├── database/           # Migrations e Seed
│   │   ├── entities/           # Entidades TypeORM (27 tabelas)
│   │   ├── middleware/         # Auth JWT, Admin, Error Handler
│   │   ├── routes/             # Endpoints (auth, mercado, presentes...)
│   │   └── services/           # Regras de negócio
│   └── Dockerfile
├── frontend/                   # App Next.js 14
│   ├── src/
│   │   ├── app/                # Páginas (App Router)
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── context/            # AuthContext, ToastContext
│   │   └── lib/                # api.ts (cliente HTTP)
│   └── Dockerfile
├── docs/                       # Documentação técnica e de entrega
│   └── entrega_final/          # Materiais para apresentação do TCC
├── docker-compose.yml          # Orquestração dos serviços
├── .env.docker.example         # Modelo de variáveis de ambiente
└── RELATORIO_SEGURANCA_OWASP.md # Auditoria de segurança OWASP Top 10
```
