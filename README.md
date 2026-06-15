# Projeto FRIK - Sistema de Fidelização com Gamificação

Este é um projeto completo contendo um **Frontend** (Next.js) e um **Backend** (Node.js/Express + TypeORM + MySQL).

---

## Rodar com Docker (recomendado — Linux e Windows)

A forma mais simples de subir tudo (MySQL + API + frontend) em qualquer máquina:

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) ou Docker Engine + Docker Compose (Linux)

### Comandos

Na raiz do repositório:

```bash
docker compose up --build
```

Na primeira execução o Compose baixa imagens, compila os serviços, cria o banco, roda migrações e seed automaticamente.

Para rodar em segundo plano:

```bash
docker compose up --build -d
```

Para parar:

```bash
docker compose down
```

Para apagar também o volume do MySQL (banco zerado na próxima subida):

```bash
docker compose down -v
```

### URLs

| Serviço   | URL |
|-----------|-----|
| Frontend  | http://localhost:3000 |
| API       | http://localhost:3333/api |
| Swagger   | http://localhost:3333/api/docs |

Credenciais de teste (após o seed): `admin@frik.demo` / `senha123` e `ana@frik.demo` / `senha123`.

### Variáveis opcionais

Copie `.env.docker.example` para `.env` na raiz se quiser alterar portas, senhas do MySQL ou `JWT_SECRET`. O arquivo `.env` é ignorado pelo Git.

---

## Rodar localmente (sem Docker)

Siga as instruções abaixo se preferir Node.js e MySQL instalados na máquina.

---

## 1. Pré-requisitos (instalação local)

Certifique-se de ter os seguintes softwares instalados na sua máquina:
- **Node.js** (versão 18 ou superior recomendada)
- **MySQL** (ou MariaDB) rodando localmente

---

## 2. Configuração do Banco de Dados (IMPORTANTE)

O backend precisa de um banco de dados chamado `frik` para funcionar. Você deve criá-lo **antes** de rodar as migrações e popular os dados.

### No Windows (ou qualquer SO via Cliente Visual)
Se você utiliza um cliente de banco de dados como MySQL Workbench, DBeaver ou HeidiSQL:
1. Conecte-se ao seu servidor local (geralmente usuário `root`).
2. Abra uma nova aba de Query e execute:
   ```sql
   CREATE DATABASE frik;
   ```

### Pelo Terminal (Linux / Mac / Git Bash)
Você pode criar o banco de dados diretamente pelo terminal.

No **Linux / Mac**:
```bash
sudo mysql -u root -p -e "CREATE DATABASE frik;"
```
*(Digite a senha do usuário do sistema se pedir, e depois a do MySQL).*

No **Git Bash (Windows)** ou caso você tenha o `mysql` configurado no PATH:
```bash
mysql -u root -p -e "CREATE DATABASE frik;"
```

---

## 3. Configurando e Rodando o Backend

Abra o terminal, navegue até a pasta `backend` e instale as dependências:
```bash
cd backend
npm install
```

### Variáveis de Ambiente
O backend já possui um arquivo `.env` configurado para desenvolvimento. Se a sua senha do MySQL for diferente da padrão configurada, você pode alterar o arquivo `backend/.env` na variável `DB_PASSWORD`.

### Migrações e Seed (Popular o banco)
**Atenção:** Se você estiver usando o **Git Bash**, utilize **dois** `&&` comerciais para garantir que o seed só execute *após* a migração ser finalizada, ou rode um comando por vez.

Execute o comando abaixo para criar as tabelas e popular o banco com os usuários padrão:
```bash
npm run db:migrate && npm run db:seed
```

Caso prefira rodar passo a passo:
```bash
npm run db:migrate
# aguarde finalizar, e então:
npm run db:seed
```

### Iniciar o Backend
Por fim, inicie o servidor de desenvolvimento:
```bash
npm run dev
```
O backend ficará rodando na porta `3333`.

---

## 4. Configurando e Rodando o Frontend

Abra **outro** terminal (mantenha o backend rodando no anterior), navegue até a pasta `frontend` e instale as dependências:
```bash
cd frontend
npm install
```

Inicie o servidor de desenvolvimento do frontend:
```bash
npm run dev
```
O frontend ficará acessível em `http://localhost:3000`.

---

## 5. Credenciais de Teste

Com o banco de dados populado, você pode acessar o sistema utilizando os seguintes usuários:

**Administrador:**
- Email: `admin@frik.demo`
- Senha: `senha123`

**Cliente:**
- Email: `ana@frik.demo`
- Senha: `senha123`

---

## 6. Testes Automatizados (Frontend)

O frontend foi equipado com testes automatizados utilizando **Jest** e **React Testing Library**, visando cobertura de renderização condicional, responsividade e **Acessibilidade (A11y)** via `jest-axe`.

Para rodar os testes localmente via Docker (recomendado):
```bash
docker run --rm -v %cd%\frontend:/app -w /app node:20-alpine sh -c "npm ci && npx jest"
```
*(No Linux/Mac, utilize `$(pwd)` no lugar de `%cd%`)*

Para rodar caso tenha o Node.js/NPM local instalado:
```bash
cd frontend
npm install
npm run test
```
