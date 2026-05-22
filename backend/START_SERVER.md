# FRIK — Como rodar o servidor (Backend)

Repositório da API REST do projeto **FRIK** (Sistema de Fidelização com Gamificação).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [MySQL](https://dev.mysql.com/downloads/) 8+
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) (opcional, para executar o DDL)
- [Insomnia](https://insomnia.rest/) (testes da API)

## 1. Banco de dados

Abra o MySQL Workbench (ou linha de comando) e execute, nesta ordem:

1. `database/schema.sql` — cria o banco `frik` e todas as tabelas
2. `database/seed.sql` — dados iniciais (níveis, usuários de teste, cupons, produtos)

**Linha de comando (Windows):**

```powershell
mysql -u root -p < database/schema.sql
mysql -u root -p frik < database/seed.sql
```

## 2. Variáveis de ambiente

Na pasta `backend`:

```powershell
copy .env.example .env
```

Edite o `.env` com sua senha do MySQL:

```env
DB_PASSWORD=sua_senha_aqui
JWT_SECRET=um_segredo_longo_e_aleatorio
```

## 3. Instalar dependências

```powershell
cd backend
npm install
```

## 4. Iniciar o servidor

**Desenvolvimento** (reinicia ao salvar com nodemon + ts-node):

```powershell
npm run dev
```

**Produção local:**

```powershell
npm run build
npm start
```

A API ficará disponível em: **http://localhost:3333/api**

Teste rápido: `GET http://localhost:3333/api/health`

## 5. Documentação Swagger

Com o servidor rodando, abra no navegador:

- **Swagger UI:** http://localhost:3333/api/docs
- **OpenAPI JSON:** http://localhost:3333/api/docs.json

Para testar rotas protegidas:

1. Execute **Auth → Login** (`POST /api/auth/login`) com `ana@frik.demo` / `senha123`
2. Copie o `token` da resposta
3. Clique em **Authorize** (cadeado) e informe: `Bearer <seu_token>` ou apenas o token (o Swagger adiciona o prefixo)

A documentação cobre todos os endpoints: Auth, Mercado de Cupons, Presentes, Ranking e Produtos.

## 6. Testar com Insomnia

1. Abra o Insomnia
2. **Import** → selecione `insomnia/frik-api.json`
3. No ambiente **FRIK Local**, confirme `base_url = http://localhost:3333`
4. Execute **Auth → Login** com:
   - Email: `ana@frik.demo`
   - Senha: `senha123`
5. O token é salvo automaticamente na variável `token` para as demais rotas

## Usuários de teste (seed)

| Nome         | Email             | Senha     | Nível  |
|--------------|-------------------|-----------|--------|
| Ana Silva    | ana@frik.demo     | senha123  | Ouro   |
| Bruno Costa  | bruno@frik.demo   | senha123  | Prata  |
| Carla Mendes | carla@frik.demo   | senha123  | Bronze |

## Rotas principais

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Status da API |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/registro` | Cadastro |
| GET | `/api/auth/perfil` | Perfil (auth) |
| GET | `/api/mercado-cupons` | Cupons no mercado |
| GET | `/api/mercado-cupons/meus-cupons` | Meus cupons |
| POST | `/api/mercado-cupons/oferecer/:cupomId` | Oferecer cupom |
| POST | `/api/mercado-cupons/solicitar-troca` | Solicitar troca |
| PATCH | `/api/mercado-cupons/propostas/:id` | Aceitar/recusar |
| POST | `/api/presentes/cupom` | Dar cupom de presente |
| POST | `/api/presentes/produto` | Presente físico |
| GET | `/api/ranking/global` | Ranking |
| GET | `/api/ranking/meu-nivel` | Progresso do nível |

## Problemas comuns

- **ECONNREFUSED MySQL**: MySQL não está rodando ou `DB_*` no `.env` está incorreto.
- **Unknown database 'frik'**: Execute `schema.sql` antes do seed.
- **401 nas rotas**: Faça login no Insomnia para atualizar o `token`.
