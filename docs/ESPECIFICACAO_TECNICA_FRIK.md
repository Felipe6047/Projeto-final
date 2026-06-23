# ESPECIFICAÇÃO TÉCNICA — FRIK
## Sistema de Fidelização com Gamificação

**Projeto:** FRIK  
**Versão do documento:** 1.0  
**Data:** 21/05/2026  
**Status do repositório:** MVP Completo — Backend e Frontend implementados em monorepo único

---

## CONTEXTO: DESCRIÇÃO PRELIMINAR DO SISTEMA

O **FRIK** transforma a experiência de compra em uma jornada gamificada: o cliente acumula pontos, evolui de nível (Bronze → Diamante), troca cupons no mercado, presenteia amigos e acompanha ranking. A empresa utiliza painel administrativo para campanhas, métricas e segmentação.

### 1. Usuários e Casos de Uso

| Papel | Descrição | Cadastro |
|-------|-----------|----------|
| **Cliente** | Acumula pontos, resgata/troca cupons, presenteia cupons e produtos, participa do ranking e missões | Autocadastro (`POST /api/auth/registro`) |
| **Administrador** | Gerencia campanhas, templates de cupom, produtos, missões, eventos sazonais e relatórios gerenciais | Cadastro manual / seed (futuro: proprietário) |

**Níveis de fidelidade do cliente (gamificação):** Bronze, Prata, Ouro, Platina, Diamante — regras progressivas de trocas e presentes.

#### Casos de Uso Principais

| Ator | Caso de uso | Status API |
|------|-------------|------------|
| Cliente | Registrar-se e autenticar-se (JWT) | Implementado |
| Cliente | Consultar perfil, pontos e nível | Implementado |
| Cliente | Listar cupons próprios e oferecer no mercado | Implementado |
| Cliente | Solicitar/aceitar/recusar troca de cupons | Implementado |
| Cliente | Dar cupom de presente (e-mail, WhatsApp, SMS, link) | Implementado |
| Cliente | Comprar produto físico e enviar como presente | Implementado |
| Cliente | Consultar ranking global, benefícios por nível, conquistas | Implementado |
| Cliente | Consultar catálogo de produtos | Implementado |
| Administrador | CRUD campanhas, cupons template, produtos, missões | Implementado |
| Administrador | Dashboard com métricas, ticket médio e segmentação por nível | Implementado |
| Sistema | Creditar pontos após compra | Implementado (`compra.service.ts`) |
| Sistema | Notificar troca/presente/ranking/missão/conquista | Implementado (`gamificacao.service.ts`) |

### 2. Arquitetura e Plataforma Tecnológica

| Camada | Tecnologia | Observação |
|--------|------------|------------|
| **Arquitetura** | API REST (Backend) + SSR/SPA (Frontend) | Monorepo único com `/backend` e `/frontend` |
| **Backend** | Node.js 18+, Express 4, TypeScript, TypeORM 0.3 | Migrations em `backend/src/database/migrations/` |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS | Pasta `frontend/` — implementado |
| **Banco de dados** | MySQL 8.0 | Gerenciado via TypeORM (sem schema.sql avulso) |
| **Autenticação** | JWT Bearer (`Authorization: Bearer <token>`) + Bcrypt 10 rounds | OAuth Google: escopo futuro |
| **Validação** | Zod (schemas de entrada nas rotas) | — |
| **Versionamento** | Git / GitHub | Monorepo único |
| **Execução** | Docker + Docker Compose (recomendado) | Também suporta execução local com Node + MySQL |

**Base URL da API:** `http://localhost:3333/api`  
**Prefixo de rotas:** `/api` (não `/api/v1` no MVP atual)

### 3. Estrutura de Diretórios (Dois Repositórios)

```
Frik/                          # Workspace local (não é monorepo único)
├── backend/                   # Repositório 1 — API REST
│   ├── database/
│   │   ├── schema.sql         # DDL MySQL
│   │   └── seed.sql           # Dados iniciais
│   ├── insomnia/
│   │   └── frik-api.json      # Coleção Insomnia
│   ├── src/
│   │   ├── config/            # env, database pool
│   │   ├── middleware/        # auth JWT, errorHandler
│   │   ├── routes/            # Endpoints Express
│   │   ├── services/          # Regras de negócio
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── index.ts           # Entrypoint
│   ├── START_SERVER.md
│   ├── package.json
│   └── .env.example
├── frontend/                  # Repositório 2 — SPA (planejado)
│   └── README.md
└── docs/
    ├── ESPECIFICACAO_TECNICA_FRIK.md
    └── ESPECIFICACAO_TECNICA_FRIK.txt
```

### 4. Convenções e Configurações

| Item | Convenção |
|------|-----------|
| **Linguagem** | TypeScript (backend e frontend) |
| **Variáveis/funções** | camelCase |
| **Classes / Componentes React** | PascalCase |
| **Constantes** | UPPER_SNAKE_CASE |
| **Tabelas/colunas SQL** | snake_case |
| **Respostas de erro** | `{ "erro": string, "detalhes"?: object }` |
| **Respostas de sucesso** | Objeto JSON direto ou array |

**Env Vars (Backend):**

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `PORT` | Não (default 3333) | Porta HTTP |
| `DB_HOST` | Não | Host MySQL |
| `DB_PORT` | Não | Porta MySQL |
| `DB_USER` | Não | Usuário MySQL |
| `DB_PASSWORD` | Sim (prod) | Senha MySQL |
| `DB_NAME` | Não (default `frik`) | Nome do banco |
| `JWT_SECRET` | Sim (prod) | Segredo HS256 |
| `JWT_EXPIRES_IN` | Não (default `7d`) | Expiração do token |
| `TAXA_TROCA_PONTOS` | Não (default 50) | Taxa opcional em pontos por troca |

**Env Vars (Frontend — planejado):**

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3333/api` |

### 5. Matriz RBAC (Controle de Acesso)

| Recurso | Cliente (JWT) | Público | Admin (futuro) |
|---------|---------------|---------|----------------|
| `GET /api/health` | — | Sim | Sim |
| `POST /api/auth/login` | — | Sim | Sim |
| `POST /api/auth/registro` | — | Sim | — |
| `GET /api/auth/perfil` | Sim | — | — |
| `GET /api/mercado-cupons/*` | Sim | — | — |
| `POST/PATCH /api/mercado-cupons/*` | Sim | — | — |
| `POST /api/presentes/*` | Sim | — | — |
| `GET /api/ranking/global` | — | Sim | Sim |
| `GET /api/ranking/beneficios` | — | Sim | Sim |
| `GET /api/ranking/meu-nivel` | Sim | — | — |
| `GET /api/produtos` | — | Sim | Sim |
| `POST /api/admin/*` | — | — | Sim (planejado) |

**Middleware:** `authRequired` — valida header `Authorization: Bearer <token>`, injeta `req.user = { id, email, nivelId }`.

### 6. Regras de Negócio por Nível

| Nível | Trocas/mês | Mesmo rank | Presentear cupom | Presentear produto | Valor máx. presente | Sala de troca |
|-------|------------|------------|------------------|--------------------|---------------------|---------------|
| Bronze | 1 | Sim | Não | Não | — | Não |
| Prata | 3 | Não | Sim | Não | — | Não |
| Ouro | 10 | Não | Sim | Sim | R$ 100 | Não |
| Platina | Ilimitado | Não | Sim | Sim | Ilimitado | Sim |
| Diamante | Ilimitado | Não | Sim | Sim | Ilimitado | Sim |

**Troca de cupons:** validade > 7 dias; status `disponivel` ou `oferecido_troca`; taxa opcional em pontos (`TAXA_TROCA_PONTOS`). Evento sazonal soma `trocas_extras` ao limite mensal.

---

## ESPECIFICAÇÕES POR ARQUIVO

---

### BANCO DE DADOS

---

#### [backend/database/schema.sql]

**Ação:** consultar (executar no MySQL Workbench ou CLI)

**Descrição:** DDL completo do banco `frik`. Define todas as entidades, FKs, índices e a view `vw_ranking_global`. Não utiliza ORM; é a fonte da verdade do modelo relacional.

**Pseudocódigo / Estrutura:**

```sql
-- Entidades principais
DATABASE frik;

TABLE nivel_fidelidade (
  id, nome, slug, ordem, trocas_mes, mesmo_rank_apenas,
  pode_presentear_cupom, pode_presentear_produto,
  valor_max_presente, pode_criar_sala_troca, pontos_minimos
);

TABLE usuario (
  id, nome, email, telefone, cpf, senha_hash,
  nivel_id FK -> nivel_fidelidade, pontos, avatar_url, ativo
);

TABLE cupom_template (...);
TABLE cupom_usuario (
  status ENUM('disponivel','oferecido_troca','em_troca','resgatado','presenteado','expirado')
);

TABLE proposta_troca (
  solicitante_id, proprietario_id,
  cupom_solicitante_id, cupom_proprietario_id,
  status ENUM('pendente','aceita','recusada','cancelada')
);

TABLE presente_cupom (...);
TABLE produto (...);
TABLE pedido_presente (...);
TABLE missao, usuario_missao, conquista, usuario_conquista;
TABLE evento_sazonal, sala_troca, sala_troca_membro;
TABLE notificacao, campanha, historico_pontos, compra;

VIEW vw_ranking_global AS
  SELECT u.id, u.nome, u.pontos, n.nome AS nivel,
         RANK() OVER (ORDER BY u.pontos DESC) AS posicao
  FROM usuario u JOIN nivel_fidelidade n ...;
```

---

#### [backend/database/seed.sql]

**Ação:** consultar (executar após schema.sql)

**Descrição:** Popula níveis Bronze–Diamante, conquistas, templates de cupom, produtos, missões, 3 usuários de teste (senha `senha123`), cupons e evento sazonal.

**Pseudocódigo / Estrutura:**

```sql
INSERT nivel_fidelidade (bronze, prata, ouro, platina, diamante);
INSERT usuario (ana@frik.demo, bruno@frik.demo, carla@frik.demo);
INSERT cupom_usuario (...);
INSERT evento_sazonal ('Semana do Troca-Troca', trocas_extras=2);
```

---

### BACKEND — CONFIGURAÇÃO E ENTRYPOINT

---

#### [backend/src/config/env.ts]

**Ação:** consultar

**Descrição:** Carrega variáveis de ambiente via `dotenv` e exporta objeto tipado `env` (port, db, jwt, taxaTrocaPontos).

**Pseudocódigo / Estrutura:**

```typescript
dotenv.config();
export const env = {
  port: Number(process.env.PORT ?? 3333),
  db: { host, port, user, password, database },
  jwt: { secret, expiresIn },
  taxaTrocaPontos: Number(process.env.TAXA_TROCA_PONTOS ?? 50),
};
```

---

#### [backend/src/config/database.ts]

**Ação:** consultar

**Descrição:** Cria pool `mysql2/promise` com `namedPlaceholders: true` para queries parametrizadas `:nomeParam`.

**Pseudocódigo / Estrutura:**

```typescript
import mysql from "mysql2/promise";
export const pool = mysql.createPool({ host, user, password, database, connectionLimit: 10 });
```

---

#### [backend/src/index.ts]

**Ação:** consultar

**Descrição:** Entrypoint. Testa conexão MySQL (`SELECT 1`), encerra processo se falhar, inicia `app.listen(env.port)`.

**Pseudocódigo / Estrutura:**

```typescript
async function bootstrap() {
  await pool.query("SELECT 1");
  app.listen(env.port, () => console.log(`FRIK API em http://localhost:${env.port}/api`));
}
bootstrap();
```

---

#### [backend/src/app.ts]

**Ação:** consultar

**Descrição:** Configura Express: `cors`, `express.json()`, monta rotas em `/api`, registra `errorHandler` global.

**Pseudocódigo / Estrutura:**

```typescript
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", routes);
app.use(errorHandler);
export default app;
```

---

### BACKEND — MIDDLEWARES

---

#### [backend/src/middleware/auth.ts]

**Ação:** consultar

**Descrição:** Middleware `authRequired`. Exige `Authorization: Bearer <JWT>`. Decodifica payload `{ id, email, nivelId }` e atribui a `req.user`. Retorna 401 se ausente ou inválido.

**Pseudocódigo / Estrutura:**

```typescript
export interface JwtPayload { id: number; email: string; nivelId: number; }

export function authRequired(req, res, next) {
  const token = req.headers.authorization?.slice(7);
  if (!token) return res.status(401).json({ erro: "Token não informado" });
  req.user = jwt.verify(token, env.jwt.secret) as JwtPayload;
  next();
}
```

---

#### [backend/src/middleware/errorHandler.ts]

**Ação:** consultar

**Descrição:** Trata `ZodError` → 400 com `detalhes` por campo; demais erros → 500 `{ erro: "Erro interno do servidor" }`.

**Pseudocódigo / Estrutura:**

```typescript
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) return res.status(400).json({ erro: "Dados inválidos", detalhes: err.flatten().fieldErrors });
  return res.status(500).json({ erro: "Erro interno do servidor" });
}
```

---

### BACKEND — SERVIÇOS (REGRAS DE NEGÓCIO)

---

#### [backend/src/services/auth.service.ts]

**Ação:** consultar

**Descrição:** Login com bcrypt; emite JWT; registro de cliente com nível Bronze (default); busca perfil com join em `nivel_fidelidade`.

**Pseudocódigo / Estrutura:**

```typescript
async function login(email: string, senha: string): Promise<{ token, usuario } | null>;
async function registrar({ nome, email, senha, telefone?, cpf? }): Promise<{ token, usuario } | null>;
async function buscarPerfil(usuarioId: number): Promise<PerfilDTO | null>;
// JWT payload: { id, email, nivelId }
```

---

#### [backend/src/services/cupom.service.ts]

**Ação:** consultar

**Descrição:** Mercado de cupons e trocas. Valida validade > 7 dias, limite mensal por nível + evento sazonal, débito de taxa em pontos, transação ao solicitar/aceitar troca.

**Pseudocódigo / Estrutura:**

```typescript
const DIAS_MIN_TROCA = 7;

async function listarMeusCupons(usuarioId): Promise<CupomDTO[]>;
async function listarMercado({ categoria?, valorMinimo?, busca? }): Promise<CupomMercadoDTO[]>;
async function oferecerParaTroca(usuarioId, cupomId): Promise<{ ok } | { erro }>;
async function solicitarTroca({ solicitanteId, cupomSolicitadoId, cupomOfertadoId, aceitarTaxa }): Promise<{ propostaId } | { erro }>;
async function responderTroca(usuarioId, propostaId, aceitar: boolean): Promise<{ status } | { erro }>;
async function historicoTrocas(usuarioId): Promise<PropostaDTO[]>;

// Ao aceitar: troca usuario_id dos cupons entre solicitante e proprietário
// Incrementa usuario_troca_mes (YYYYMM)
```

---

#### [backend/src/services/presente.service.ts]

**Ação:** consultar

**Descrição:** Presente de cupom (sem perder pontos do remetente — transfere cupom) e pedido de presente físico com validação de nível e valor máximo.

**Pseudocódigo / Estrutura:**

```typescript
async function presentearCupom({
  remetenteId, cupomId, canal, mensagem?, destinatario*
}): Promise<{ presenteId, codigoResgate, link } | { erro }>;
// Valida nivel.pode_presentear_cupom

async function criarPedidoPresente({
  remetenteId, itens[], pontosUsados, valorReais, destinatario, endereco, embrulho?, enviarSurpresa?
}): Promise<{ pedidoId, status } | { erro }>;
// Valida nivel.pode_presentear_produto e valor_max_presente

async function listarPedidosPresente(usuarioId): Promise<PedidoDTO[]>;
```

---

#### [backend/src/services/ranking.service.ts]

**Ação:** consultar

**Descrição:** Progresso de nível, ranking global via view, benefícios por nível, conquistas do usuário, evento sazonal ativo.

**Pseudocódigo / Estrutura:**

```typescript
async function meuNivel(usuarioId): Promise<{ pontos, nivel, progresso_percentual }>;
async function rankingGlobal(limite = 50): Promise<RankingRow[]>;
async function beneficiosPorNivel(): Promise<NivelBeneficioDTO[]>;
async function minhasConquistas(usuarioId): Promise<ConquistaDTO[]>;
async function eventoAtivo(): Promise<EventoDTO | null>;
```

---

### BACKEND — ROTAS (API REST)

---

#### [backend/src/routes/index.ts]

**Ação:** consultar

**Descrição:** Agregador de rotas. Prefixo montado em `app.ts` como `/api`.

| Método | Rota montada | Router |
|--------|--------------|--------|
| GET | `/api/health` | inline |
| * | `/api/auth` | auth.routes |
| * | `/api/mercado-cupons` | mercado.routes |
| * | `/api/presentes` | presentes.routes |
| * | `/api/ranking` | ranking.routes |
| * | `/api/produtos` | produtos.routes |

---

#### [backend/src/routes/auth.routes.ts]

**Ação:** consultar

**Descrição:** Autenticação e perfil do cliente.

| Método | Rota exata | Auth | Body / Response |
|--------|------------|------|-----------------|
| POST | `/api/auth/login` | Não | `{ email, senha }` → `{ token, usuario }` |
| POST | `/api/auth/registro` | Não | `{ nome, email, senha, telefone?, cpf? }` → 201 |
| GET | `/api/auth/perfil` | Bearer | → perfil + nivel |

**Pseudocódigo / Estrutura:**

```typescript
router.post("/login", zod(loginSchema), authService.login);
router.post("/registro", zod(registroSchema), authService.registrar);
router.get("/perfil", authRequired, authService.buscarPerfil);
```

---

#### [backend/src/routes/mercado.routes.ts]

**Ação:** consultar

**Descrição:** Mercado de cupons. Todas as rotas exigem `authRequired`.

| Método | Rota exata | Descrição |
|--------|------------|-----------|
| GET | `/api/mercado-cupons/meus-cupons` | Cupons do usuário |
| GET | `/api/mercado-cupons` | Mercado (query: `categoria`, `valorMinimo`, `busca`) |
| GET | `/api/mercado-cupons/config` | `{ diasMinimosValidade: 7, taxaTrocaPontos }` |
| POST | `/api/mercado-cupons/oferecer/:cupomId` | Publica cupom no mercado |
| POST | `/api/mercado-cupons/solicitar-troca` | `{ cupomSolicitadoId, cupomOfertadoId, aceitarTaxa }` |
| PATCH | `/api/mercado-cupons/propostas/:id` | `{ aceitar: boolean }` |
| GET | `/api/mercado-cupons/historico` | Histórico de propostas |

---

#### [backend/src/routes/presentes.routes.ts]

**Ação:** consultar

**Descrição:** Presentes de cupom e produto físico. Auth obrigatório.

| Método | Rota exata | Body principal |
|--------|------------|----------------|
| POST | `/api/presentes/cupom` | `{ cupomId, canal, mensagem?, destinatario* }` |
| POST | `/api/presentes/produto` | `{ itens[], pontosUsados, valorReais, destinatario, endereco, ... }` |
| GET | `/api/presentes/pedidos` | Lista pedidos enviados/recebidos |

---

#### [backend/src/routes/ranking.routes.ts]

**Ação:** consultar

**Descrição:** Gamificação e ranking.

| Método | Rota exata | Auth |
|--------|------------|------|
| GET | `/api/ranking/beneficios` | Não |
| GET | `/api/ranking/global?limite=50` | Não |
| GET | `/api/ranking/evento-ativo` | Não |
| GET | `/api/ranking/meu-nivel` | Bearer |
| GET | `/api/ranking/conquistas` | Bearer |

---

#### [backend/src/routes/produtos.routes.ts]

**Ação:** consultar

**Descrição:** Catálogo público de produtos para presentes.

| Método | Rota exata | Auth |
|--------|------------|------|
| GET | `/api/produtos` | Não |
| GET | `/api/produtos/:id` | Não |

---

#### [backend/src/routes/admin.routes.ts] *(planejado)*

**Ação:** criar

**Descrição:** Painel administrativo. Middleware `adminRequired` (role `admin` no JWT ou tabela separada `administrador`).

| Método | Rota exata | Descrição |
|--------|------------|-----------|
| GET | `/api/admin/dashboard` | KPIs: clientes ativos, trocas, ticket médio |
| CRUD | `/api/admin/campanhas` | Campanhas promocionais |
| CRUD | `/api/admin/cupom-templates` | Templates de cupom |
| CRUD | `/api/admin/produtos` | Catálogo |
| CRUD | `/api/admin/missoes` | Missões |
| CRUD | `/api/admin/eventos` | Eventos sazonais |
| GET | `/api/admin/relatorios/segmentacao` | Export segmento JSON |

**Pseudocódigo / Estrutura:**

```typescript
router.use(adminRequired);
router.get("/dashboard", adminService.getDashboard);
router.post("/campanhas", zod(campanhaSchema), adminService.criarCampanha);
// ...
```

---

### BACKEND — ARQUIVOS DE SUPORTE

---

#### [backend/insomnia/frik-api.json]

**Ação:** consultar

**Descrição:** Coleção Insomnia v4 com ambiente `base_url` e `token`. Script pós-login grava token automaticamente.

---

#### [backend/START_SERVER.md]

**Ação:** consultar

**Descrição:** Guia operacional: MySQL schema/seed, `.env`, `npm run dev`, import Insomnia, usuários de teste.

---

#### [backend/.env.example]

**Ação:** consultar

**Descrição:** Template de variáveis: `PORT`, `DB_*`, `JWT_SECRET`, `TAXA_TROCA_PONTOS`.

---

### FRONTEND — SERVIÇOS HTTP (PLANEJADO)

Mapeamento explícito **serviço frontend → rota backend**:

| Serviço frontend | Método | Rota backend | Componente/Página consumidor |
|------------------|--------|--------------|------------------------------|
| `authService.login` | POST | `/api/auth/login` | `LoginPage` |
| `authService.register` | POST | `/api/auth/registro` | `RegisterPage` |
| `authService.getProfile` | GET | `/api/auth/perfil` | `ProfilePage`, `Navbar` |
| `mercadoService.getMeusCupons` | GET | `/api/mercado-cupons/meus-cupons` | `MercadoCuponsPage` |
| `mercadoService.getMercado` | GET | `/api/mercado-cupons` | `MercadoCuponsPage` |
| `mercadoService.oferecer` | POST | `/api/mercado-cupons/oferecer/:id` | `CupomCard` |
| `mercadoService.solicitarTroca` | POST | `/api/mercado-cupons/solicitar-troca` | `ModalTroca` |
| `mercadoService.responderTroca` | PATCH | `/api/mercado-cupons/propostas/:id` | `HistoricoTrocas` |
| `presenteService.presentearCupom` | POST | `/api/presentes/cupom` | `ModalPresenteCupom` |
| `presenteService.criarPedidoPresente` | POST | `/api/presentes/produto` | `PresenteProdutoWizard` |
| `rankingService.getGlobal` | GET | `/api/ranking/global` | `RankingPage` |
| `rankingService.getMeuNivel` | GET | `/api/ranking/meu-nivel` | `RankingPage` |
| `produtoService.listar` | GET | `/api/produtos` | `PresenteProdutoWizard` etapa 1 |

---

#### [frontend/src/services/apiClient.ts] *(criar)*

**Ação:** criar

**Descrição:** Cliente HTTP base (fetch ou axios) com interceptor que injeta `Authorization: Bearer ${token}` lido de `localStorage` chave `frik_token`.

**Pseudocódigo / Estrutura:**

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("frik_token");
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
```

---

#### [frontend/src/services/mercadoService.ts] *(criar)*

**Ação:** criar

**Descrição:** Encapsula chamadas do mercado de cupons.

**Pseudocódigo / Estrutura:**

```typescript
export const mercadoService = {
  getMeusCupons: () => api<CupomDTO[]>("/mercado-cupons/meus-cupons"),
  getMercado: (params: { busca?: string; categoria?: string }) =>
    api<CupomDTO[]>(`/mercado-cupons?${new URLSearchParams(params)}`),
  oferecer: (cupomId: number) => api(`/mercado-cupons/oferecer/${cupomId}`, { method: "POST" }),
  solicitarTroca: (body: SolicitarTrocaDTO) =>
    api("/mercado-cupons/solicitar-troca", { method: "POST", body: JSON.stringify(body) }),
};
```

---

### FRONTEND — PÁGINAS E COMPONENTES (PLANEJADO)

**Paleta:** fundo base `#CC9544` com gradiente para tons mais escuros. **UI:** Bootstrap 5. **Mobile:** navbar inferior (Início, Mercado, Presentes, Ranking, Perfil).

---

#### [frontend/src/app/layout.tsx] ou [frontend/src/pages/_app.tsx]

**Ação:** criar

**Descrição:** Layout raiz: importa Bootstrap CSS, define tema FRIK (`--frik-primary: #CC9544`), renderiza `Navbar` responsiva (inferior mobile / superior desktop).

**Pseudocódigo / Estrutura:**

```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-frik-gradient">
        <Navbar />
        <main className="container py-4">{children}</main>
        <MobileBottomNav />
        <ToastContainer />
      </body>
    </html>
  );
}
```

---

#### [frontend/src/app/page.tsx] — Início `/`

**Ação:** criar

**Descrição:** Dashboard do cliente: card de nível (chama `rankingService.getMeuNivel`), pontos, missões em andamento, banner de evento sazonal (`getEventoAtivo`).

**Props / Estado:**

```tsx
// Estado: nivel, evento, missoes[]
useEffect(() => {
  rankingService.getMeuNivel().then(setNivel);
  rankingService.getEventoAtivo().then(setEvento);
}, []);
// Componentes: <NivelCard nivel={nivel} />, <EventoBanner evento={evento} />
```

---

#### [frontend/src/app/mercado-cupons/page.tsx]

**Ação:** criar

**Descrição:** Página `/mercado-cupons`. Seções: busca+filtro, "Meus cupons", "Cupons de outros". Consome `mercadoService`.

**Props dos componentes filhos:**

```tsx
// CupomCard props:
interface CupomCardProps {
  cupom: CupomDTO;
  variant: "meus" | "mercado";
  onOferecer?: (id: number) => void;
  onSolicitarTroca?: (id: number) => void;
  onDarPresente?: (id: number) => void;
}

// ModalTroca props:
interface ModalTrocaProps {
  cupomAlvo: CupomDTO;
  meusCupons: CupomDTO[];
  taxaPontos: number;
  onConfirm: (cupomOfertadoId: number, aceitarTaxa: boolean) => void;
}
```

**Fluxo:** `onSolicitarTroca` → `mercadoService.solicitarTroca` → toast "Troca solicitada".

---

#### [frontend/src/components/ModalPresenteCupom.tsx]

**Ação:** criar

**Descrição:** Modal "Dar de presente". Campos: canal (email/whatsapp/sms/link), destinatário (CPF/email/tel com autocomplete), mensagem (max 200), preview cartão virtual.

**Pseudocódigo / Estrutura:**

```tsx
interface ModalPresenteCupomProps {
  cupomId: number;
  open: boolean;
  onClose: () => void;
}
// onSubmit -> presenteService.presentearCupom({ cupomId, canal, mensagem, ... })
```

---

#### [frontend/src/app/presentes/produto/page.tsx]

**Ação:** criar

**Descrição:** Wizard 4 etapas: (1) grid produtos `produtoService.listar`, (2) pagamento misto slider pontos/dinheiro, (3) destinatário+endereço, (4) resumo+personalização (embrulho, surpresa).

**Pseudocódigo / Estrutura:**

```tsx
const [step, setStep] = useState(1);
const [carrinho, setCarrinho] = useState<ProdutoSelecionado[]>([]);
const [pagamento, setPagamento] = useState({ pontosUsados: 0, valorReais: 0 });
// step 4: presenteService.criarPedidoPresente({ itens, ... })
```

---

#### [frontend/src/app/ranking/page.tsx]

**Ação:** criar

**Descrição:** Página `/ranking`. Card do usuário com barra de progresso; tabela ranking global; tabela benefícios por nível; grid de conquistas (selos); banner evento.

**Componentes:**

```tsx
// RankingTable props: { rows: RankingRow[], highlightUserId?: number }
// BeneficiosTable props: { niveis: NivelBeneficioDTO[], userNivelSlug: string }
// ConquistaBadge props: { slug, nome, icone, desbloqueada: boolean }
```

---

#### [frontend/src/app/perfil/page.tsx]

**Ação:** criar

**Descrição:** Dados do cliente via `authService.getProfile`, histórico de pontos (futuro `GET /api/cliente/historico-pontos`), endereços salvos.

---

#### [frontend/src/components/MobileBottomNav.tsx]

**Ação:** criar

**Descrição:** Navbar inferior fixa (mobile). Links: `/`, `/mercado-cupons`, `/presentes/produto`, `/ranking`, `/perfil`. Ícones 44x44px mínimo.

**Props:**

```tsx
interface MobileBottomNavProps {
  activePath: string;
}
```

---

#### [frontend/src/components/Navbar.tsx]

**Ação:** criar

**Descrição:** Desktop: logo FRIK, links horizontais, sino de notificações (futuro), avatar com dropdown logout.

---

### INTEGRAÇÃO FRONTEND ↔ BACKEND (FLUXOS)

#### Fluxo: Login

```
LoginPage → authService.login(POST /api/auth/login)
  → localStorage.setItem('frik_token', token)
  → redirect /
```

#### Fluxo: Solicitar troca (RBAC Cliente)

```
MercadoCuponsPage → authRequired (token no header)
  → mercadoService.solicitarTroca
  → cupom.service valida limite nivel + evento + taxa
  → 201 { propostaId }
  → Toast + refresh historico
```

#### Fluxo: Dar cupom presente (regra nível Prata+)

```
ModalPresenteCupom → POST /api/presentes/cupom
  → presente.service valida pode_presentear_cupom
  → Bronze: 400 { erro: "Seu nível não permite..." }
```

---

## APÊNDICE A — ENDPOINTS COMPLETOS (ESTADO ATUAL)

| # | Método | Rota | Status |
|---|--------|------|--------|
| 1 | GET | `/api/health` | OK |
| 2 | POST | `/api/auth/login` | OK |
| 3 | POST | `/api/auth/registro` | OK |
| 4 | GET | `/api/auth/perfil` | OK |
| 5 | GET | `/api/mercado-cupons/meus-cupons` | OK |
| 6 | GET | `/api/mercado-cupons` | OK |
| 7 | GET | `/api/mercado-cupons/config` | OK |
| 8 | POST | `/api/mercado-cupons/oferecer/:cupomId` | OK |
| 9 | POST | `/api/mercado-cupons/solicitar-troca` | OK |
| 10 | PATCH | `/api/mercado-cupons/propostas/:id` | OK |
| 11 | GET | `/api/mercado-cupons/historico` | OK |
| 12 | POST | `/api/presentes/cupom` | OK |
| 13 | POST | `/api/presentes/produto` | OK |
| 14 | GET | `/api/presentes/pedidos` | OK |
| 15 | GET | `/api/ranking/beneficios` | OK |
| 16 | GET | `/api/ranking/global` | OK |
| 17 | GET | `/api/ranking/evento-ativo` | OK |
| 18 | GET | `/api/ranking/meu-nivel` | OK |
| 19 | GET | `/api/ranking/conquistas` | OK |
| 20 | GET | `/api/produtos` | OK |
| 21 | GET | `/api/produtos/:id` | OK |

---

## APÊNDICE B — ITENS FORA DO ESCOPO DO MVP ATUAL

- OAuth Google
- Docker Compose
- Painel admin (`/api/admin/*`)
- Envio real de e-mail/WhatsApp/SMS
- Integração de rastreio postal
- Desbloqueio automático de conquistas
- Salas de troca (tabelas existem; API não exposta)
- Prefixo `/api/v1` (usar `/api` no MVP)

---

*Documento gerado com base no estado do repositório FRIK em 21/05/2026.*
