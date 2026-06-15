# 🧪 FRIK — Plano de Testes (TDD First)

**Projeto:** FRIK — Sistema de Fidelização com Gamificação  
**Documento:** Plano de Testes Técnico  
**Versão:** 1.0  
**Data:** 27/05/2026  
**Metodologia:** TDD (Test-Driven Development)

---

## 1. Estratégia Geral

### 1.1 Metodologia TDD

O ciclo TDD adotado segue o padrão **Red → Green → Refactor**:

```
1. RED    → Escrever o teste que falha (comportamento ainda não implementado)
2. GREEN  → Implementar o mínimo de código para o teste passar
3. REFACTOR → Melhorar o código sem quebrar os testes
```

> ⚠️ **Regra:** Nenhuma funcionalidade nova é implementada sem um teste escrito antes.

### 1.2 Pirâmide de Testes

```
         ┌──────────┐
         │  E2E (5%)│   ← Fluxos críticos completos (futuro)
        ┌┴──────────┴┐
        │Integração  │   ← HTTP via Supertest (30%)
        │  (HTTP)    │
       ┌┴────────────┴┐
       │   Unitários  │   ← Services + regras de negócio (65%)
       │   (Serviços) │
       └──────────────┘
```

### 1.3 Stack de Testes

| Ferramenta | Versão | Função |
|------------|--------|--------|
| `jest` | ^29 | Test runner principal |
| `ts-jest` | ^29 | Transpilação TypeScript para Jest |
| `supertest` | ^7 | Testes de integração HTTP |
| `@types/jest` | ^29 | Tipos TypeScript para Jest |
| `@types/supertest` | ^6 | Tipos TypeScript para Supertest |
| `jest-mock-extended` | ^3 | Mocks tipados para TypeORM |

### 1.4 Estrutura de Diretórios de Testes

```
backend/
├── src/
│   └── ...código fonte...
└── tests/
    ├── unit/
    │   ├── auth.service.test.ts
    │   ├── cupom.service.test.ts
    │   ├── presente.service.test.ts
    │   ├── ranking.service.test.ts
    │   ├── gamificacao.service.test.ts
    │   └── admin.service.test.ts
    ├── integration/
    │   ├── auth.routes.test.ts
    │   ├── mercado.routes.test.ts
    │   ├── presentes.routes.test.ts
    │   ├── ranking.routes.test.ts
    │   └── produtos.routes.test.ts
    └── helpers/
        ├── mockDataSource.ts
        └── testApp.ts
```

---

## 2. Configuração

### 2.1 `jest.config.ts`

```typescript
// backend/jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/services/**/*.ts',
    'src/routes/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  clearMocks: true,
  setupFilesAfterFramework: [],
};

export default config;
```

### 2.2 Helper — Mock do DataSource

```typescript
// backend/tests/helpers/mockDataSource.ts
import { DataSource } from 'typeorm';
import { mock } from 'jest-mock-extended';

export const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  decrement: jest.fn(),
  increment: jest.fn(),
  findOneOrFail: jest.fn(),
  findOneByOrFail: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getCount: jest.fn(),
  }),
});

// Mocka o módulo inteiro de datasource
jest.mock('../../src/config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
    query: jest.fn(),
    transaction: jest.fn(),
    initialize: jest.fn(),
    destroy: jest.fn(),
  },
}));
```

### 2.3 Helper — App de Teste (Integração)

```typescript
// backend/tests/helpers/testApp.ts
import express from 'express';
import router from '../../src/routes';
import { errorHandler } from '../../src/middleware/errorHandler';

export function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', router);
  app.use(errorHandler);
  return app;
}
```

---

## 3. Scripts npm

Adicionar ao `package.json`:

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:unit": "jest tests/unit",
  "test:integration": "jest tests/integration",
  "test:ci": "jest --coverage --ci --forceExit"
}
```

---

## 4. Testes Unitários — Services

> **Convenção:** cada `describe` mapeia um service; cada `it` descreve um cenário de negócio, escrito **antes** do código funcional.

---

### 4.1 `auth.service.test.ts`

**Módulo:** `src/services/auth.service.ts`  
**Dependências mockadas:** `AppDataSource`, `bcrypt`, `jsonwebtoken`

#### Casos de Teste

| # | Cenário | Tipo | Prioridade |
|---|---------|------|------------|
| A01 | Login com credenciais válidas retorna token JWT e dados do usuário | Unitário | 🔴 Crítico |
| A02 | Login com e-mail inexistente retorna `null` | Unitário | 🔴 Crítico |
| A03 | Login com senha incorreta retorna `null` | Unitário | 🔴 Crítico |
| A04 | Login com usuário inativo retorna `null` | Unitário | 🔴 Crítico |
| A05 | Registro cria usuário com senha hasheada e retorna token | Unitário | 🔴 Crítico |
| A06 | Registro com e-mail duplicado deve lançar erro de constraint | Unitário | 🟡 Alto |
| A07 | `buscarPerfil` retorna perfil com dados do nível | Unitário | 🟡 Alto |
| A08 | `buscarPerfil` com ID inexistente retorna `null` | Unitário | 🟡 Alto |
| A09 | `historicoPontos` retorna lista ordenada por data DESC | Unitário | 🟢 Médio |

```typescript
// tests/unit/auth.service.test.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../../src/config/database';
import * as authService from '../../src/services/auth.service';
import { mockRepository } from '../helpers/mockDataSource';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../src/config/database');

const mockRepo = mockRepository();
(AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);

describe('auth.service', () => {
  beforeEach(() => jest.clearAllMocks());

  // A01 — TDD: escrever antes de implementar
  it('A01 - login com credenciais válidas deve retornar token e usuário', async () => {
    const fakeUser = {
      id: 1, nome: 'Ana', email: 'ana@frik.demo',
      senhaHash: '$hash', nivelId: 1, pontos: 100, papel: 'cliente', ativo: true,
    };
    mockRepo.findOne.mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('fake.jwt.token');

    const result = await authService.login('ana@frik.demo', 'senha123');

    expect(result).not.toBeNull();
    expect(result?.token).toBe('fake.jwt.token');
    expect(result?.usuario.email).toBe('ana@frik.demo');
    expect(result?.usuario).not.toHaveProperty('senhaHash');
  });

  // A02
  it('A02 - login com e-mail inexistente retorna null', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    const result = await authService.login('naoexiste@frik.demo', 'senha');
    expect(result).toBeNull();
  });

  // A03
  it('A03 - login com senha incorreta retorna null', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 1, senhaHash: '$hash', ativo: true });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const result = await authService.login('ana@frik.demo', 'senhaErrada');
    expect(result).toBeNull();
  });

  // A04
  it('A04 - login com usuário inativo retorna null', async () => {
    mockRepo.findOne.mockResolvedValue(null); // query filtra ativo: true
    const result = await authService.login('inativo@frik.demo', 'senha');
    expect(result).toBeNull();
  });

  // A05
  it('A05 - registro cria usuário com senha hasheada', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('$hashed');
    mockRepo.save.mockResolvedValue({ id: 99 });
    mockRepo.findOne.mockResolvedValue({
      id: 99, nome: 'Novo', email: 'novo@frik.demo',
      senhaHash: '$hashed', nivelId: 1, pontos: 0, papel: 'cliente', ativo: true,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('novo.token');

    const result = await authService.registrar({
      nome: 'Novo', email: 'novo@frik.demo', senha: 'senha123',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10);
    expect(result?.token).toBe('novo.token');
  });
});
```

---

### 4.2 `cupom.service.test.ts`

**Módulo:** `src/services/cupom.service.ts`  
**Dependências mockadas:** `AppDataSource`, `gamificacao.service`

#### Casos de Teste

| # | Cenário | Tipo | Prioridade |
|---|---------|------|------------|
| C01 | `oferecerParaTroca` com cupom válido muda status para `oferecido_troca` | Unitário | 🔴 Crítico |
| C02 | `oferecerParaTroca` com cupom de outro usuário retorna erro | Unitário | 🔴 Crítico |
| C03 | `oferecerParaTroca` com validade < 7 dias retorna erro | Unitário | 🔴 Crítico |
| C04 | `oferecerParaTroca` com cupom já em troca retorna erro | Unitário | 🔴 Crítico |
| C05 | `solicitarTroca` com cupom próprio retorna erro | Unitário | 🔴 Crítico |
| C06 | `solicitarTroca` excedendo limite mensal do nível retorna erro | Unitário | 🔴 Crítico |
| C07 | `solicitarTroca` com pontos insuficientes para taxa retorna erro | Unitário | 🔴 Crítico |
| C08 | `solicitarTroca` válida cria proposta e debita taxa | Unitário | 🔴 Crítico |
| C09 | `responderTroca` aceitar troca realiza swap de `usuarioId` nos cupons | Unitário | 🔴 Crítico |
| C10 | `responderTroca` recusar restaura status dos cupons | Unitário | 🟡 Alto |
| C11 | `responderTroca` de proposta de outro usuário retorna erro | Unitário | 🔴 Crítico |
| C12 | Limite mensal Bronze = 1 + extras do evento sazonal | Unitário | 🟡 Alto |
| C13 | `listarMercado` filtra cupons com validade > 7 dias | Unitário | 🟡 Alto |

```typescript
// tests/unit/cupom.service.test.ts — exemplo de casos críticos

describe('cupom.service - oferecerParaTroca', () => {
  // C03 — TDD: teste escrito antes de validar a data
  it('C03 - deve retornar erro se validade <= 7 dias', async () => {
    const validadeProxima = new Date();
    validadeProxima.setDate(validadeProxima.getDate() + 5); // apenas 5 dias

    mockRepo.findOne.mockResolvedValue({
      id: '1', usuarioId: 1, status: 'disponivel',
      validadeAte: validadeProxima.toISOString(),
    });

    const result = await cupomService.oferecerParaTroca(1, 1);
    expect(result).toHaveProperty('erro');
    expect(result.erro).toMatch(/7 dias/);
  });

  // C05 — TDD: não pode trocar com seu próprio cupom
  it('C05 - solicitarTroca com cupom próprio retorna erro', async () => {
    // cupomAlvo pertence ao mesmo usuário (usuarioId === solicitanteId)
    mockTransaction.mockImplementation(async (cb) => cb(mockManager));
    mockCupomRepo.createQueryBuilder().getOne.mockResolvedValue({
      id: '10', usuarioId: 1, status: 'oferecido_troca',
    });

    const result = await cupomService.solicitarTroca({
      solicitanteId: 1,
      cupomSolicitadoId: 10,
      cupomOfertadoId: 20,
      aceitarTaxa: false,
    });

    expect(result).toHaveProperty('erro');
    expect(result.erro).toMatch(/próprio/);
  });

  // C07 — TDD: débito de pontos insuficientes
  it('C07 - solicitarTroca com pontos insuficientes retorna erro', async () => {
    // Usuário tem 30 pontos, taxa é 50
    mockUsuarioRepo.findOne.mockResolvedValue({ id: 1, pontos: 30 });
    // env.taxaTrocaPontos = 50 (mockado)

    const result = await cupomService.solicitarTroca({
      solicitanteId: 1,
      cupomSolicitadoId: 10,
      cupomOfertadoId: 20,
      aceitarTaxa: true,
    });

    expect(result).toHaveProperty('erro');
    expect(result.erro).toMatch(/Pontos insuficientes/);
  });

  // C09 — TDD: troca aceita transfere cupons
  it('C09 - responderTroca aceita deve trocar usuarioId dos cupons', async () => {
    const proposta = {
      id: '1', solicitanteId: 1, proprietarioId: 2,
      cupomSolicitanteId: '10', cupomProprietarioId: '20',
      status: 'pendente',
    };
    mockPropostaRepo.findOne.mockResolvedValue(proposta);
    mockCupomRepo.findOneByOrFail
      .mockResolvedValueOnce({ id: '10', usuarioId: 1, status: 'em_troca' })
      .mockResolvedValueOnce({ id: '20', usuarioId: 2, status: 'em_troca' });
    mockCupomRepo.save.mockResolvedValue({});

    const result = await cupomService.responderTroca(2, 1, true);

    expect(result).toEqual({ status: 'aceita' });
    expect(mockCupomRepo.save).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ usuarioId: 2, status: 'disponivel' }),
        expect.objectContaining({ usuarioId: 1, status: 'disponivel' }),
      ])
    );
  });
});
```

---

### 4.3 `presente.service.test.ts`

**Módulo:** `src/services/presente.service.ts`

#### Casos de Teste

| # | Cenário | Tipo | Prioridade |
|---|---------|------|------------|
| P01 | Bronze tenta presentear cupom → erro de nível | Unitário | 🔴 Crítico |
| P02 | Prata+ pode presentear cupom válido com sucesso | Unitário | 🔴 Crítico |
| P03 | Presentear cupom indisponível retorna erro | Unitário | 🔴 Crítico |
| P04 | Presentear muda status do cupom para `presenteado` | Unitário | 🔴 Crítico |
| P05 | Bronze tenta presentear produto → erro de nível | Unitário | 🔴 Crítico |
| P06 | Ouro tenta presentear produto acima de R$ 100 → erro de valor máximo | Unitário | 🔴 Crítico |
| P07 | Platina pode presentear produto sem limite de valor | Unitário | 🟡 Alto |
| P08 | `criarPedidoPresente` debita pontos do remetente se `pontosUsados > 0` | Unitário | 🔴 Crítico |
| P09 | `resgatarPresenteCupom` muda dono do cupom para destinatário | Unitário | 🔴 Crítico |
| P10 | Resgatar presente já resgatado retorna erro | Unitário | 🔴 Crítico |
| P11 | `criarPedidoPresente` com produto inativo lança erro | Unitário | 🟡 Alto |

```typescript
// tests/unit/presente.service.test.ts — exemplos de casos críticos

describe('presente.service - regras de nível', () => {
  // P01 — TDD: regra de negócio mais importante do módulo
  it('P01 - Bronze não pode presentear cupom', async () => {
    mockRepo.createQueryBuilder().getRawOne.mockResolvedValue({
      pode_presentear_cupom: false,
    });

    const result = await presenteService.presentearCupom({
      remetenteId: 1, cupomId: 1, canal: 'link',
    });

    expect(result).toHaveProperty('erro');
    expect(result.erro).toMatch(/nível não permite/);
  });

  // P06 — TDD: validação de valor máximo por nível
  it('P06 - Ouro não pode presentear produto acima de R$100', async () => {
    mockRepo.createQueryBuilder().getRawOne.mockResolvedValue({
      pode_presentear_produto: true,
      valor_max_presente: '100.00',
    });

    const result = await presenteService.criarPedidoPresente({
      remetenteId: 1,
      itens: [{ produtoId: 1, quantidade: 1 }],
      pontosUsados: 0,
      valorReais: 150, // acima do limite
      destinatario: { nome: 'Carlos' },
      endereco: {},
    });

    expect(result).toHaveProperty('erro');
    expect(result.erro).toMatch(/R\$ 100/);
  });

  // P08 — TDD: débito de pontos ao usar no presente
  it('P08 - criarPedidoPresente debita pontos do remetente', async () => {
    mockRepo.createQueryBuilder().getRawOne.mockResolvedValue({
      pode_presentear_produto: true,
      valor_max_presente: null,
    });
    // ... setup de transaction mock

    await presenteService.criarPedidoPresente({
      remetenteId: 1,
      itens: [{ produtoId: 1, quantidade: 1 }],
      pontosUsados: 200,
      valorReais: 50,
      destinatario: { nome: 'Carlos' },
      endereco: {},
    });

    expect(mockUsuarioRepo.decrement).toHaveBeenCalledWith(
      { id: 1 }, 'pontos', 200
    );
  });
});
```

---

### 4.4 `ranking.service.test.ts`

**Módulo:** `src/services/ranking.service.ts`

#### Casos de Teste

| # | Cenário | Tipo | Prioridade |
|---|---------|------|------------|
| R01 | `meuNivel` calcula progresso percentual corretamente | Unitário | 🔴 Crítico |
| R02 | `meuNivel` retorna 100% de progresso no nível máximo | Unitário | 🟡 Alto |
| R03 | `meuNivel` com usuário inexistente retorna `null` | Unitário | 🟡 Alto |
| R04 | `rankingGlobal` limita resultados pelo parâmetro `limite` | Unitário | 🟢 Médio |
| R05 | `beneficiosPorNivel` retorna 5 níveis ordenados por `ordem ASC` | Unitário | 🟡 Alto |
| R06 | `eventoAtivo` retorna `null` fora do período do evento | Unitário | 🟡 Alto |
| R07 | `eventoAtivo` retorna evento quando `NOW()` está no período ativo | Unitário | 🔴 Crítico |

```typescript
// tests/unit/ranking.service.test.ts

describe('ranking.service - meuNivel', () => {
  // R01 — TDD: cálculo do progresso percentual
  it('R01 - deve calcular progresso percentual entre níveis', async () => {
    mockRepo.createQueryBuilder().getRawOne.mockResolvedValue({
      pontos: 1000,
      nome: 'Prata',
      slug: 'prata',
      ordem: 2,
      pontos_minimos: 500,
      proximo_nivel_pontos: 2000,
    });

    const result = await rankingService.meuNivel(1);

    // progresso = ((1000 - 500) / (2000 - 500)) * 100 = 33%
    expect(result?.progresso_percentual).toBe(33);
  });

  // R02 — TDD: nível máximo = 100%
  it('R02 - nível máximo deve retornar progresso 100%', async () => {
    mockRepo.createQueryBuilder().getRawOne.mockResolvedValue({
      pontos: 20000,
      nome: 'Diamante',
      slug: 'diamante',
      ordem: 5,
      pontos_minimos: 15000,
      proximo_nivel_pontos: null, // sem próximo nível
    });

    const result = await rankingService.meuNivel(1);
    expect(result?.progresso_percentual).toBe(100);
  });
});
```

---

### 4.5 `gamificacao.service.test.ts`

**Módulo:** `src/services/gamificacao.service.ts`  
*(Serviço de missões, conquistas e notificações)*

#### Casos de Teste

| # | Cenário | Tipo | Prioridade |
|---|---------|------|------------|
| G01 | `incrementarMissao` incrementa progresso na missão ativa do tipo correto | Unitário | 🔴 Crítico |
| G02 | `incrementarMissao` credita pontos ao completar missão | Unitário | 🔴 Crítico |
| G03 | `incrementarMissao` não credita pontos em missão já completa | Unitário | 🔴 Crítico |
| G04 | `verificarConquistas` desbloqueia "Amigo Ouro" após 5 presentes | Unitário | 🔴 Crítico |
| G05 | `verificarConquistas` não duplica conquista já desbloqueada | Unitário | 🔴 Crítico |
| G06 | `criarNotificacao` salva registro com tipo e usuário corretos | Unitário | 🟡 Alto |

```typescript
// tests/unit/gamificacao.service.test.ts

describe('gamificacao.service - incrementarMissao', () => {
  // G02 — TDD: completar missão deve creditar pontos
  it('G02 - deve creditar pontos ao completar missão', async () => {
    const missaoUsuario = {
      id: 1, usuarioId: 1,
      missaoId: 1,
      progressoAtual: 0,
      concluida: false,
      missao: { metaValor: 1, pontosRecompensa: 100, tipoMeta: 'trocas', ativa: true },
    };

    mockMissaoUsuarioRepo.findOne.mockResolvedValue(missaoUsuario);
    mockMissaoUsuarioRepo.save.mockResolvedValue({});
    mockUsuarioRepo.increment.mockResolvedValue({});

    await gamificacaoService.incrementarMissao(1, 'trocas', 1, mockManager);

    // Deve creditar 100 pontos
    expect(mockUsuarioRepo.increment).toHaveBeenCalledWith(
      { id: 1 }, 'pontos', 100
    );
  });

  // G05 — TDD: conquista não duplicada
  it('G05 - verificarConquistas não deve duplicar conquista', async () => {
    // Conquista já existe para o usuário
    mockConquistaRepo.findOne.mockResolvedValue({ id: 1 }); // já desbloqueada
    mockUsuarioConquistaRepo.findOne.mockResolvedValue({ id: 99 }); // já tem

    await gamificacaoService.verificarConquistas(1, mockManager);

    expect(mockUsuarioConquistaRepo.save).not.toHaveBeenCalled();
  });
});
```

---

### 4.6 `admin.service.test.ts`

**Módulo:** `src/services/admin.service.ts`

#### Casos de Teste

| # | Cenário | Tipo | Prioridade |
|---|---------|------|------------|
| AD01 | `getDashboard` retorna KPIs agregados corretamente | Unitário | 🟡 Alto |
| AD02 | `criarCampanha` salva com datas convertidas e `ativa=true` por padrão | Unitário | 🟡 Alto |
| AD03 | `atualizarCampanha` com body vazio retorna `false` (nada alterado) | Unitário | 🟡 Alto |
| AD04 | `excluirCampanha` com ID inexistente retorna `false` | Unitário | 🟢 Médio |
| AD05 | `criarProduto` salva `precoReais` como string e `estoque` padrão 0 | Unitário | 🟢 Médio |
| AD06 | `excluirProduto` faz soft-delete (`ativo = false`) | Unitário | 🟡 Alto |
| AD07 | `criarMissao` com `meta_valor` indefinido usa padrão 1 | Unitário | 🟢 Médio |

---

## 5. Testes de Integração HTTP (Supertest)

> Os testes de integração verificam o pipeline completo: **rota → middleware → service**.  
> O banco de dados real é **substituído por mocks** do TypeORM (sem conexão MySQL).

---

### 5.1 `auth.routes.test.ts`

**Base URL:** `/api/auth`

| # | Método | Rota | Cenário | Status Esperado | Prioridade |
|---|--------|------|---------|----------------|------------|
| AR01 | POST | `/login` | Credenciais válidas → retorna token | 200 | 🔴 Crítico |
| AR02 | POST | `/login` | Senha incorreta → não autorizado | 401 | 🔴 Crítico |
| AR03 | POST | `/login` | Body sem `email` → erro de validação Zod | 400 | 🟡 Alto |
| AR04 | POST | `/login` | Body sem `senha` → erro de validação Zod | 400 | 🟡 Alto |
| AR05 | POST | `/registro` | Dados válidos → cria usuário e retorna token | 201 | 🔴 Crítico |
| AR06 | POST | `/registro` | `email` inválido → erro 400 | 400 | 🟡 Alto |
| AR07 | POST | `/registro` | `senha` com menos de 6 caracteres → erro 400 | 400 | 🟡 Alto |
| AR08 | GET | `/perfil` | Sem token → 401 | 401 | 🔴 Crítico |
| AR09 | GET | `/perfil` | Token válido → retorna dados do usuário | 200 | 🔴 Crítico |
| AR10 | GET | `/perfil` | Token expirado → 401 | 401 | 🟡 Alto |

```typescript
// tests/integration/auth.routes.test.ts
import request from 'supertest';
import { buildTestApp } from '../helpers/testApp';
import * as authService from '../../src/services/auth.service';

jest.mock('../../src/services/auth.service');
jest.mock('../../src/config/database');

const app = buildTestApp();

describe('POST /api/auth/login', () => {
  // AR01 — TDD
  it('AR01 - credenciais válidas retornam 200 com token', async () => {
    (authService.login as jest.Mock).mockResolvedValue({
      token: 'jwt.token.here',
      usuario: { id: 1, nome: 'Ana', email: 'ana@frik.demo', nivelId: 1, pontos: 100 },
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@frik.demo', senha: 'senha123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.token).toBe('jwt.token.here');
  });

  // AR02 — TDD
  it('AR02 - senha incorreta retorna 401', async () => {
    (authService.login as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@frik.demo', senha: 'senhaErrada' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('erro');
  });

  // AR03 — TDD: validação Zod antes de chamar o service
  it('AR03 - body sem email retorna 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ senha: 'senha123' }); // sem email

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('detalhes');
  });

  // AR08 — TDD: middleware de autenticação
  it('AR08 - GET /perfil sem token retorna 401', async () => {
    const res = await request(app).get('/api/auth/perfil');
    expect(res.status).toBe(401);
  });
});
```

---

### 5.2 `mercado.routes.test.ts`

**Base URL:** `/api/mercado-cupons`

| # | Método | Rota | Cenário | Status Esperado | Prioridade |
|---|--------|------|---------|----------------|------------|
| MR01 | GET | `/meus-cupons` | Sem token → 401 | 401 | 🔴 Crítico |
| MR02 | GET | `/meus-cupons` | Token válido → lista cupons | 200 | 🔴 Crítico |
| MR03 | GET | `/` | Sem token (público) → lista mercado | 200 | 🟡 Alto |
| MR04 | POST | `/oferecer/:id` | Cupom válido → 200 `{ ok: true }` | 200 | 🔴 Crítico |
| MR05 | POST | `/oferecer/:id` | Cupom com < 7 dias → 400 com erro | 400 | 🔴 Crítico |
| MR06 | POST | `/solicitar-troca` | Body inválido → 400 Zod | 400 | 🟡 Alto |
| MR07 | POST | `/solicitar-troca` | Limite mensal atingido → 400 | 400 | 🔴 Crítico |
| MR08 | POST | `/solicitar-troca` | Pontos insuficientes → 400 | 400 | 🔴 Crítico |
| MR09 | PATCH | `/propostas/:id` | Aceitar troca → 200 `{ status: "aceita" }` | 200 | 🔴 Crítico |
| MR10 | PATCH | `/propostas/:id` | Recusar troca → 200 `{ status: "recusada" }` | 200 | 🟡 Alto |
| MR11 | GET | `/historico` | Retorna histórico paginado | 200 | 🟢 Médio |

---

### 5.3 `presentes.routes.test.ts`

**Base URL:** `/api/presentes`

| # | Método | Rota | Cenário | Status Esperado | Prioridade |
|---|--------|------|---------|----------------|------------|
| PR01 | POST | `/cupom` | Bronze tenta presentear → 403 | 403 | 🔴 Crítico |
| PR02 | POST | `/cupom` | Prata+ presenteia com sucesso → 201 | 201 | 🔴 Crítico |
| PR03 | POST | `/cupom` | Cupom indisponível → 400 | 400 | 🔴 Crítico |
| PR04 | POST | `/cupom` | Body sem `canal` → 400 Zod | 400 | 🟡 Alto |
| PR05 | POST | `/produto` | Bronze tenta presentear produto → 403 | 403 | 🔴 Crítico |
| PR06 | POST | `/produto` | Ouro com valor > R$100 → 400 | 400 | 🔴 Crítico |
| PR07 | POST | `/produto` | Produto inativo no carrinho → 400 | 400 | 🟡 Alto |
| PR08 | GET | `/pedidos` | Retorna pedidos do remetente | 200 | 🟢 Médio |

---

### 5.4 `ranking.routes.test.ts`

**Base URL:** `/api/ranking`

| # | Método | Rota | Cenário | Status Esperado | Prioridade |
|---|--------|------|---------|----------------|------------|
| RK01 | GET | `/global` | Rota pública → 200 com array | 200 | 🔴 Crítico |
| RK02 | GET | `/global?limite=5` | Respeita o parâmetro limite | 200 | 🟡 Alto |
| RK03 | GET | `/beneficios` | Pública → retorna 5 níveis | 200 | 🟡 Alto |
| RK04 | GET | `/meu-nivel` | Sem token → 401 | 401 | 🔴 Crítico |
| RK05 | GET | `/meu-nivel` | Token válido → retorna progresso | 200 | 🔴 Crítico |
| RK06 | GET | `/conquistas` | Token válido → lista conquistas com status | 200 | 🟡 Alto |
| RK07 | GET | `/evento-ativo` | Sem evento ativo → body `null` | 200 | 🟢 Médio |

---

### 5.5 `produtos.routes.test.ts`

**Base URL:** `/api/produtos`

| # | Método | Rota | Cenário | Status Esperado | Prioridade |
|---|--------|------|---------|----------------|------------|
| PD01 | GET | `/` | Rota pública → lista produtos ativos | 200 | 🟡 Alto |
| PD02 | GET | `/:id` | ID válido → retorna produto | 200 | 🟡 Alto |
| PD03 | GET | `/:id` | ID inexistente → 404 | 404 | 🟡 Alto |

---

## 6. Testes de Regras de Negócio Críticas

Estes testes cobrem cenários de **fronteira e regressão** que surgem da interação entre módulos.

| # | Regra | Módulo | Prioridade |
|---|-------|--------|------------|
| RN01 | Evento sazonal adiciona `trocas_extras` ao limite do nível corretamente | cupom.service | 🔴 Crítico |
| RN02 | Usuário não pode solicitar troca em cupom que ele mesmo ofertou | cupom.service | 🔴 Crítico |
| RN03 | Progresso percentual nunca ultrapassa 100 (Math.min aplicado) | ranking.service | 🟡 Alto |
| RN04 | Senha nunca é exposta nas respostas de `login` ou `registro` | auth.service | 🔴 Crítico |
| RN05 | CPF duplicado no registro deve retornar erro de constraint | auth.service | 🟡 Alto |
| RN06 | `debitarPontos` salva histórico negativo com tipo `troca_taxa` | cupom.service | 🔴 Crítico |
| RN07 | Cupom com status `em_troca` não pode ser ofertado novamente | cupom.service | 🔴 Crítico |
| RN08 | Missão já concluída não duplica crédito de pontos | gamificacao.service | 🔴 Crítico |
| RN09 | Conquista desbloqueada não é duplicada em chamadas subsequentes | gamificacao.service | 🔴 Crítico |

---

## 7. Cobertura de Código — Metas

| Módulo | Meta de Cobertura |
|--------|-------------------|
| `auth.service.ts` | ≥ 90% |
| `cupom.service.ts` | ≥ 85% |
| `presente.service.ts` | ≥ 85% |
| `ranking.service.ts` | ≥ 80% |
| `gamificacao.service.ts` | ≥ 85% |
| `admin.service.ts` | ≥ 70% |
| Rotas (integração) | ≥ 75% |
| **Total geral** | **≥ 80%** |

Verificar cobertura com:

```bash
npm run test:coverage
```

---

## 8. Comandos para Executar os Testes

```bash
# Instalar dependências de teste
npm install

# Executar todos os testes
npm test

# Executar somente unitários
npm run test:unit

# Executar somente integração
npm run test:integration

# Executar com cobertura
npm run test:coverage

# Modo watch (desenvolvimento TDD)
npm run test:watch

# CI/CD (com flag --forceExit para encerrar após conclusão)
npm run test:ci
```

---

## 9. Ordem de Implementação TDD

Seguindo a metodologia TDD, escrever os testes nesta ordem antes do código:

```
Fase 1 — Núcleo de autenticação
  └─ [RED]  auth.service.test.ts (A01–A09)
  └─ [GREEN] Implementar/ajustar auth.service.ts
  └─ [RED]  auth.routes.test.ts (AR01–AR10)

Fase 2 — Mercado de cupons
  └─ [RED]  cupom.service.test.ts (C01–C13)
  └─ [GREEN] Implementar/ajustar cupom.service.ts
  └─ [RED]  mercado.routes.test.ts (MR01–MR11)

Fase 3 — Presentes
  └─ [RED]  presente.service.test.ts (P01–P11)
  └─ [GREEN] Implementar/ajustar presente.service.ts
  └─ [RED]  presentes.routes.test.ts (PR01–PR08)

Fase 4 — Gamificação
  └─ [RED]  gamificacao.service.test.ts (G01–G06)
  └─ [GREEN] Implementar/ajustar gamificacao.service.ts

Fase 5 — Ranking e Produtos
  └─ [RED]  ranking.service.test.ts (R01–R07)
  └─ [RED]  ranking.routes.test.ts (RK01–RK07)
  └─ [RED]  produtos.routes.test.ts (PD01–PD03)

Fase 6 — Admin
  └─ [RED]  admin.service.test.ts (AD01–AD07)
```

---

## 10. Integração Contínua (CI)

Recomendado adicionar ao pipeline GitHub Actions (`.github/workflows/test.yml`):

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
        working-directory: backend
      - run: npm run test:ci
        working-directory: backend
      - uses: codecov/codecov-action@v4
        with:
          directory: backend/coverage
```

---

*Documento gerado com base no estado do repositório FRIK em 27/05/2026.*  
*Revisão técnica — TDD First conforme metodologia definida.*

---

## 12. Estratégia de Testes de Frontend e Acessibilidade

### 12.1 Testes de Componentes e Renderização Condicional
* **LoginPage:** Validar a renderização do formulário padrão e, condicionalmente, o estado logado caso exista perfil ativo no contexto de autenticação.
* **DashboardPage:** Testar a exibição condicional do banner de eventos sazonais quando ativos e o progresso do nível de fidelidade.
* **Estados de Interface (Loading / Skeleton / Empty):**
  * Validar exibição do Skeleton animado durante a busca de CEP no formulário de endereço de presentes.
  * Validar exibição de telas vazias ilustradas quando o usuário não possuir cupons no mercado.

### 12.2 Testes de Acessibilidade (A11y)
* **Navegação por Teclado:** Validar que elementos acionáveis (botões, inputs e links) recebem foco sequencial por teclado (`Tab`) e exibem contorno visual claro (`--frik-primary`).
* **Rótulos e Atributos ARIA:**
  * Validar que modais de troca e presentes possuem `role="dialog"` e `aria-modal="true"`.
  * Validar que campos de erro de formulário exibem `aria-invalid="true"`.
* **Contraste:** Validar proporção mínima de contraste (WCAG AA) para textos primários e secundários tanto no tema claro quanto escuro.

### 12.3 Testes Responsivos
* **Mobile (até 640px):** Validar a renderização da navbar inferior fixa e colunas únicas de catálogo de produtos.
* **Desktop (acima de 1024px):** Validar a exibição da sidebar lateral de navegação fixa e layouts de grade de três colunas.

### 12.4 Testes de Integração com APIs e MSW (Mock Service Worker)
* Simular respostas da API de Notas Fiscais (NFC-e), validando fluxos de sucesso, erro de nota duplicada e status de `confirmacao_pendente` para atualização opcional do CPF.
* Simular respostas da API de pagamento mockada (PIX e Wallet), verificando a transição de status para `"pago"`.

### 12.5 Testes de Regressão Visual e E2E (Fase Posterior)
* Utilizar ferramentas de Snapshot Testing (Jest Snapshots) para capturar a estrutura HTML dos cards e modais principais, prevenindo alterações acidentais de layout.
* Testes E2E (Playwright) para validar a jornada completa: *Simular Venda no Caixa do Lojista → Notificação em Tempo Real no Painel do Cliente → Resgate no Mercado de Recompensas*.

