# Plano de Testes (TDD First) — FRIK

## 1. Objetivo

Definir uma estratégia de testes **automatizada**, orientada a **TDD First**, para validar as regras críticas do FRIK (API e Frontend) e **prevenir regressões** em mudanças futuras.

## 2. Escopo

- **Backend (MVP implementado)**: foco em **unit tests** de serviços (regras de negócio) + **integration tests** de rotas (contrato HTTP, autenticação, validação e erros).
- **Frontend (planejado/incipiente)**: preparar stack e plano de **unit/component tests** e **contract tests** dos serviços HTTP, com mocks (MSW) para simular a API.

### Fora de escopo (por ora)

- Testes E2E completos (Playwright/Cypress) — recomendados para fase posterior após UI estabilizar.
- Envio real de e-mail/WhatsApp/SMS (no MVP está “simulado”).
- Admin `/api/admin/*` (planejado).

## 3. Princípios TDD First (como o projeto deve evoluir)

- **Red**: escrever primeiro um teste que falha, cobrindo o comportamento desejado (prioridade para cenários críticos e regras).
- **Green**: implementar o mínimo para passar.
- **Refactor**: melhorar estrutura sem mudar comportamento (testes continuam verdes).

### Regras práticas

- Todo bug corrigido deve vir acompanhado de **teste de regressão** (falha antes, passa depois).
- Serviços com regra de negócio devem ter **unit tests determinísticos** (mock de DB, tempo, env).
- Rotas devem ter **integration tests** validando: status code, body, autenticação e shape de erro.

## 4. Pirâmide de testes (estratégia anti-regressão)

- **Unit (maior volume, mais rápido)**:
  - `backend/src/services/*`
  - Funções puras/validações, regras de troca/presente/nível
- **Integration (volume moderado)**:
  - Rotas Express com `supertest`, middleware real, `errorHandler` real
  - DB deve ser **mockado** (MVP já utiliza mock de `AppDataSource`)
- **Contract/Component (frontend)**:
  - `services/*` com MSW
  - Componentes críticos: login, mercado, troca, presente e ranking (fluxos)

## 5. Ferramentas e padrões

### Backend

- **Runner**: Jest + ts-jest
- **HTTP**: Supertest (integração)
- **Mocks**: Jest mocks + `jest-mock-extended` quando útil
- **Cobertura**: `--coverage` com limiares globais

### Frontend (Next.js)

- **Runner**: Jest
- **Ambiente DOM**: `jest-environment-jsdom`
- **Component tests**: Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`)
- **Mock da API**: MSW (`msw`) para testes de serviços e componentes sem dependência de backend rodando

## 6. Estrutura de pastas recomendada

### Backend (já existente)

- `backend/tests/unit/*.test.ts`: serviços e utilitários
- `backend/tests/integration/*.test.ts`: rotas (Express) com `buildTestApp()`
- `backend/tests/helpers/*`: builders, mocks de datasource, factories

### Frontend (a criar)

- `frontend/src/services/__tests__/*.test.ts`
- `frontend/src/components/__tests__/*.test.tsx`
- `frontend/src/app/**/__tests__/*.test.tsx` (se usar App Router)
- `frontend/test/msw/*` (handlers e server)

## 7. Dados de teste e determinismo

- **Datas/validade de cupom**: usar helper para gerar datas futuras e congelar tempo quando necessário.
- **Env vars**: mock de `env` em testes unitários (ex.: `TAXA_TROCA_PONTOS`).
- **JWT**: em integração, gerar token determinístico (ou mockar middleware quando o foco for contrato de rota sem auth).

## 8. Plano por funcionalidade (testes críticos primeiro)

Abaixo, “teste mínimo crítico” por funcionalidade (prioridade alta). A equipe deve expandir com casos adicionais ao longo do desenvolvimento.

### 8.1 Health check (API pública)

- **Teste crítico (Integração)**: `GET /api/health` retorna `200` e JSON (ou mensagem) esperado.
- **Risco mitigado**: detectar API “subiu mas está quebrada” em CI rapidamente.

### 8.2 Autenticação e Perfil (JWT)

#### Backend — `auth.service`

- **Unit (crítico)**: `login(email, senha)`
  - **Cenário**: senha inválida → retorno nulo/erro previsto (não emite token).
  - **Mock**: repositório de usuário + `bcrypt.compare`.
- **Unit (crítico)**: `registrar(dados)`
  - **Cenário**: cria cliente com nível inicial (Bronze) e emite JWT com payload `{ id, email, nivelId }`.
  - **Mock**: repositórios + `bcrypt.hash` + `jwt.sign`.

#### Backend — Rotas `POST /api/auth/login`, `POST /api/auth/registro`, `GET /api/auth/perfil`

- **Integration (crítico)**: `GET /api/auth/perfil` sem `Authorization` → **401** com `{ erro }`.
- **Integration (crítico)**: `POST /api/auth/login` body inválido → **400** via `ZodError` shape `{ erro, detalhes }`.

### 8.3 Mercado de cupons — oferecer e trocar

#### Backend — `cupom.service`

- **Unit (crítico)**: `oferecerParaTroca(usuarioId, cupomId)`
  - **Cenário**: cupom com validade \(\le 7\) dias → retorna erro (não altera status).
  - **Mock**: repository de cupom (find/save).
- **Unit (crítico)**: `solicitarTroca({ solicitanteId, cupomSolicitadoId, cupomOfertadoId, aceitarTaxa })`
  - **Cenário**: taxa habilitada e pontos insuficientes → erro.
  - **Mock**: repos, queries e `env.taxaTrocaPontos`.
- **Unit (crítico)**: `responderTroca(usuarioId, propostaId, aceitar=false)`
  - **Cenário**: recusar troca → restaura status coerentes dos cupons.
  - **Mock**: transaction manager e `update`.

#### Backend — Rotas `mercado-cupons`

- **Integration (crítico)**: rota protegida sem JWT (`GET /api/mercado-cupons/meus-cupons`) → **401**.
- **Integration (crítico)**: `POST /api/mercado-cupons/solicitar-troca` com body inválido → **400** (contrato de erro consistente).

### 8.4 Presentes — cupom e produto físico

#### Backend — `presente.service`

- **Unit (crítico)**: `presentearCupom(...)`
  - **Cenário**: cliente Bronze (não pode) → erro “nível não permite”.
  - **Mock**: nível do usuário + cupom ownership + criação de “presente”.
- **Unit (crítico)**: `criarPedidoPresente(...)`
  - **Cenário**: nível permite, mas `valorReais` > `valor_max_presente` → erro.
  - **Mock**: nível, carrinho/itens, persistência do pedido.

#### Backend — Rotas `presentes`

- **Integration (crítico)**: `POST /api/presentes/cupom` sem JWT → **401**.
- **Integration (crítico)**: `POST /api/presentes/produto` validação de payload → **400** (Zod).

### 8.5 Ranking e gamificação

#### Backend — `ranking.service`

- **Unit (crítico)**: `meuNivel(usuarioId)`
  - **Cenário**: calcula `progresso_percentual` corretamente (0–100) e respeita limites.
  - **Mock**: consulta do usuário + pontos mínimos do próximo nível.
- **Unit (crítico)**: `rankingGlobal(limite)`
  - **Cenário**: respeita default limite e ordenação/shape.
  - **Mock**: `AppDataSource.query` (ou repo/view) retornando dataset estável.

#### Backend — Rotas `ranking`

- **Integration (crítico)**: `/api/ranking/meu-nivel` exige JWT → **401** sem token.
- **Integration (crítico)**: `/api/ranking/global?limite=50` retorna array e status **200** (contrato público).

### 8.6 Produtos (catálogo público)

- **Integration (crítico)**: `GET /api/produtos` público retorna **200** e lista (mesmo vazia).
- **Integration (crítico)**: `GET /api/produtos/:id` com id inexistente retorna **404** (ou erro definido) e não 500.

### 8.7 Frontend (planejado) — serviços e componentes

#### Serviços HTTP (contract tests com MSW)

- **Teste crítico**: `authService.login` salva token e retorna usuário quando API responde 200; quando API responde 401/400, propaga erro normalizado.
- **Mock**: MSW handler para `/api/auth/login`.

#### Componentes críticos

- **LoginPage**: ao submeter credenciais válidas → chama `authService.login` e redireciona.
- **MercadoCuponsPage**: renderiza “Meus cupons” + “Mercado” e abre modal de troca.
- **ModalPresenteCupom**: valida mensagem (<= 200) e bloqueia submit sem destinatário.

## 9. Mocks: quando e como usar

- **Banco/ORM**: unit tests devem mockar `AppDataSource`/repositórios; integration tests de rotas também podem manter DB mockado para isolar regras e evitar flakiness.
- **Tempo**: quando houver regra por dias/validade, congelar tempo (ou gerar datas futuras fixas).
- **JWT**: preferir mock de middleware em testes não focados em auth; para testes de auth, usar token real gerado com segredo de teste.
- **Notificações e integrações externas**: sempre mockar (não enviar mensagens reais).

## 10. Critérios de qualidade (gate de regressão)

- **CI obrigatório**: `npm run test:ci` deve rodar em cada PR.
- **Cobertura mínima (backend)**: manter limiares globais (ajustar para refletir o objetivo do time).
- **Determinismo**: testes não podem depender de rede externa, relógio real ou ordem global.

## 11. Melhorias identificadas (iterar o plano)

- **Ajustar limiar de cobertura** por diretório (ex.: serviços críticos com threshold maior).
- **Adicionar testes de erro padronizado** para garantir que `{ erro, detalhes? }` permaneça estável.
- **Frontend**: introduzir MSW desde o início evita acoplamento e acelera TDD dos componentes.

