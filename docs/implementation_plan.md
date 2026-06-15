# Plano de Implementação — FRIK
### Baseado em: DOCUMENTO FRIK - ANÁLISE E REQUISITOS PRIORIZADOS (v2, 23KB) + Análise de Campanhas vs Eventos Sazonais

> ⚠️ Este plano foi gerado a partir do arquivo correto: `DOCUMENTO FRIK - ANÁLISE E REQUISITOS PRIORIZADOS.md` (23 KB). Versão anterior usava o arquivo menor e incompleto.

---

## Estado Atual do Projeto (o que já existe)

Antes de listar o que fazer, é importante entender o que **já está implementado** para não retrabalhar:

| Módulo | Situação atual |
|--------|----------------|
| Login | Formulário funcional. **Sem tela de cadastro** — usuários de demo hardcoded |
| Dashboard | Exibe pontos, nível, nota fiscal (NFC-e), missões **estáticas mockadas** |
| Mercado de Cupons | Tem "Meus Cupons" + **"Disponíveis para troca"** (seção a remover) |
| Presentes/Produtos | Fluxo de checkout completo (etapas), "Dar de presente" funcional, **sem "Comprar para mim"** |
| Salas de Troca | Criar sala, entrar com código, listar membros — **bug: novo membro não aparece na lista** |
| Ranking | Só ranking global por pontos. **Sem abas** |
| Admin | CRUD de campanhas, eventos, missões, cupons, produtos — **sem garantia de visibilidade para usuários comuns** |
| Campanhas | Entidade `Campanha.ts` existe. CRUD no admin. **Não exibida para o usuário** |
| Eventos Sazonais | Entidade `EventoSazonal.ts` existe. **Mantidas separadas (correto!)** |
| Missões | Backend completo com `incrementarMissao`, `UsuarioMissao`, notificação ao concluir. **Dashboard usa dados mockados** |
| Conquistas | Backend funcional (`verificarConquistas`). Exibidas no Ranking. **Precisam aparecer também no Perfil** |

---

## BLOCO 1 — ALTA PRIORIDADE

---

### 1.1 Login — Tela de Cadastro com CPF (LOG-01 a LOG-07)

**O que o documento exige:**
- Adicionar link pequeno `Não tem conta? Cadastre-se` abaixo do botão Entrar
- Ao clicar, exibir formulário de cadastro na **mesma tela** (toggle de estado) com os campos:
  - Nome completo
  - E-mail
  - Senha
  - **CPF** (obrigatório, com máscara `999.999.999-99`)
- **Sem envio de foto, sem verificação de e-mail ou SMS** — cadastro direto

**Validação de CPF (LOG-04 / LOG-05 / LOG-06):**
| Situação | Comportamento |
|----------|---------------|
| CPF com formato inválido | Bloquear, exibir: *"CPF inválido. Digite um CPF válido (apenas números)."* |
| CPF já existe no banco | Bloquear, exibir: *"CPF já cadastrado. Faça login ou recupere sua senha."* |
| CPF válido e não cadastrado | Permitir cadastro |

- Ao submeter, chamar `POST /api/auth/register` e fazer login automático
- Remover qualquer referência a "enviar foto" que ainda exista no sistema (LOG-03)

**Arquivos a modificar:**
- `frontend/src/components/pages/LoginPage.tsx` — estado `modo: 'login' | 'cadastro'`, formulário alternativo, validação matemática de CPF via `cpfValido()` (já existe em `lib/validators.ts`)
- `frontend/src/lib/api.ts` — verificar/adicionar função `register(nome, email, senha, cpf)`
- `backend/src/routes/auth.routes.ts` — garantir que o endpoint de registro valida CPF duplicado e retorna erro descritivo

---

### 1.2 Dashboard — Ajustes no Dashboard + Missões Funcionais (HOME-01 a HOME-06)

**HOME-01 — Remover bloco "Escanear Nota Fiscal (NFC-e)" do Dashboard:**

> O bloco de leitura de NFC-e que existe hoje no Dashboard (seção `mb-16` com input de 44 dígitos) deve ser **removido da tela inicial**. Ele se torna parte da página "Registrar Compras".

- Remover o `<section>` completo de "Escanear Nota Fiscal (NFC-e)" do [DashboardPage.tsx](file:///c:/Users/Aluno/Documents/GitHub/Projeto-final/frontend/src/components/pages/DashboardPage.tsx)
- Remover os estados `chaveNota`, `processando`, `confirmacao` e a função `escanearNota()` do Dashboard (migrar para SimuladorCaixaPage)
- O modal de "Vincular CPF?" também migra junto para a nova página

**HOME-01 — Renomear e tornar visível para todos na sidebar:**
- Renomear o link na sidebar: `"Simulador de Caixa"` → **`"Registrar compras"`**
- **Remover a condição `isAdmin`** que hoje oculta esse link — passar a exibir para **todos os usuários logados**

---

**A página "Registrar Compras" passa a ter DUAS opções — esta é a forma do cliente ganhar pontos:**

```
╔══════════════════════════════════════════════════════╗
║           REGISTRAR COMPRAS                          ║
╠══════════════════════╦═══════════════════════════════╣
║  📄 ESCANEAR NOTA    ║  🛒 SIMULAÇÃO DE COMPRA       ║
║     FISCAL (NFC-e)   ║      AVULSA                   ║
║                      ║                               ║
║  Digite a chave de   ║  Valor da compra:             ║
║  acesso de 44        ║  R$ _______                   ║
║  dígitos para        ║                               ║
║  resgatar pontos     ║  🎯 Pontos a ganhar: ___       ║
║  da sua compra.      ║     (R$1 = 1 ponto)           ║
║                      ║                               ║
║  [_______________]   ║  Forma de pagamento:          ║
║  [Escanear nota]     ║  ○ Crédito  ○ Débito  ⦿ Pix   ║
║                      ║                               ║
║                      ║  [ Confirmar simulação ]      ║
╚══════════════════════╩═══════════════════════════════╝
```

- **Opção 1 — Escanear NFC-e:** toda a lógica atual do Dashboard (input 44 dígitos, modal de vincular CPF, notas de exemplo) migra para cá
- **Opção 2 — Simulação avulsa:** cliente digita qualquer valor → sistema calcula pontos (R$1 = 1 ponto) → escolhe forma de pagamento simulada (Crédito / Débito / Pix) → confirma → **pontos creditados na conta do cliente**
- As duas opções ficam em **abas** ou **dois cards** na mesma tela

**Resumo das responsabilidades após a mudança:**

| Tela | Quem acessa | O que faz |
|------|-------------|-----------|
| **Registrar Compras** (sidebar — todos) | ✅ Todos os usuários | Cliente ganha pontos: NFC-e OU simulação avulsa |
| **Painel Admin → PDV por CPF** | 🔒 Só admin | Lojista credita pontos na conta de um cliente pelo CPF |

> A função de **lojista (creditar pontos por CPF de cliente)** que existia no Simulador de Caixa deve ser movida para o **painel admin** — não faz sentido ficar na tela do cliente.

**Arquivos a modificar:**
- `frontend/src/components/pages/DashboardPage.tsx` — remover seção NFC-e e estados relacionados
- `frontend/src/components/pages/SimuladorCaixaPage.tsx` — renomear título para "Registrar Compras", duas abas/cards (NFC-e + simulação avulsa)
- `frontend/src/components/layout/Sidebar.tsx` — renomear + **remover condição `isAdmin`** para mostrar a todos
- `frontend/src/components/pages/admin/` — receber a funcionalidade PDV por CPF

---

**HOME-04/05/06 — Missões reais com progresso e selo:**
- Remover o array estático de missões mockadas no [DashboardPage.tsx](file:///c:/Users/Aluno/Documents/GitHub/Projeto-final/frontend/src/components/pages/DashboardPage.tsx)
- Criar endpoint público: `GET /api/missoes` (com auth) que retorna:
  ```json
  [
    {
      "id": 1,
      "titulo": "Faça 3 trocas esta semana",
      "pontosRecompensa": 100,
      "tipoMeta": "trocas",
      "metaValor": 3,
      "progresso": 1,
      "concluida": false
    }
  ]
  ```
- Exibir por missão: barra de progresso (`1/3`), pontos a ganhar, **selo ✅ "Concluída"** quando `concluida === true`

**Arquivos a modificar:**
- `backend/src/routes/missoes.routes.ts` (novo) — `GET /` com join `missao + usuario_missao`
- `backend/src/routes/index.ts` — registrar `/api/missoes`
- `frontend/src/lib/api.ts` — `getMissoesAtivas()`
- `frontend/src/components/pages/DashboardPage.tsx` — modal/seção de simulação avulsa + missões reais

---

### 1.3 Mercado de Cupons — Remover Troca, Adicionar Compra com Pontos (CUPOM-01 / 02 / 03)

**O que fazer:**
- Em [MercadoPage.tsx](file:///c:/Users/Aluno/Documents/GitHub/Projeto-final/frontend/src/components/pages/MercadoPage.tsx), **remover completamente** a seção "Disponíveis para troca" (linhas 173–213)
- Substituir por nova seção: **"Compre com pontos"** — estilo Microsoft Rewards
- Cada card de cupom exibe:
  - Ícone/imagem do cupom
  - Título (ex: "Desconto 10% em qualquer compra")
  - Custo em pontos (ex: "500 pontos")
  - Validade
  - Botão **[Resgatar]** — chama `POST /api/mercado/resgatar/:templateId`
- O botão [Resgatar] debita os pontos do usuário e cria um `CupomUsuario` para ele

**Backend:**
- Verificar se o endpoint `POST /api/mercado/resgatar/:templateId` já existe (aparece no plano anterior como previsto)
- Se não existir, criar em `mercado.routes.ts`

**Arquivos a modificar:**
- `frontend/src/components/pages/MercadoPage.tsx` — remover seção de troca, adicionar grid de cupons para comprar
- `frontend/src/lib/api.ts` — adicionar `resgatarCupomComPontos(templateId)`
- `backend/src/routes/mercado.routes.ts` — adicionar rota POST de resgate se ausente

---

### 1.4 Produtos (ex-Presentes) — Fluxo Completo (PROD-01 a PROD-13)

**PROD-01:** Renomear "Presentes" → **"Produtos"** em:
- [Sidebar.tsx](file:///c:/Users/Aluno/Documents/GitHub/Projeto-final/frontend/src/components/layout/Sidebar.tsx)
- [PresentesPage.tsx](file:///c:/Users/Aluno/Documents/GitHub/Projeto-final/frontend/src/components/pages/PresentesPage.tsx) — título e aba interna
- Remover aba **"Cupom de presente"** (substituída pelas Salas de Troca)

**PROD-03/04/05 — Fluxo de compra em 4 etapas:**
```
Produtos → Pagamento → Destinatário → Resumo
```
- Cada produto tem dois botões: **[Comprar para mim]** e **[Dar de presente]**
- **"Comprar para mim"**: `tipoDest = 'pessoal'`, pula etapa Destinatário, usa endereço do próprio perfil → fluxo: `Produtos → Pagamento → Resumo`
- **"Dar de presente"**: `tipoDest = 'presente'`, exibe etapa Destinatário → fluxo completo: `Produtos → Pagamento → Destinatário → Resumo`

**PROD-05 — Simulação de pagamento (dentro do fluxo de Produtos):**
- Na etapa **"Pagamento"** do checkout de Produtos, exibir opções:
  - 💳 Crédito (simulação)
  - 🏦 Débito (simulação)
  - ⚡ Pix (simulação)
- Confirmar pagamento → avança para próxima etapa

**PROD-11/12/13 — Etapa Destinatário: usar lista de Amigos:**
- Na etapa "Destinatário" (fluxo "Dar de presente"), exibir:
  1. Lista de **amigos do usuário** (apenas usuários já cadastrados no banco)
  2. Opção "Digitar destinatário manualmente" (nome + endereço)
- Se o amigo selecionado **já tiver endereço cadastrado** → preencher automaticamente
- Se o amigo **não tiver endereço** → exibir formulário para digitar manualmente

> ⚠️ **Privacidade:** o endereço do amigo só é exibido no contexto de envio de presente — nunca em outro contexto.

**Arquivos a modificar:**
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/pages/PresentesPage.tsx` — renomear, remover aba cupom, dois botões por produto, etapa Destinatário com lista de amigos, simulação de pagamento na etapa Pagamento
- `frontend/src/lib/api.ts` — adicionar `getMeusAmigos()`, `getPerfil(id)` para buscar endereço do amigo

---

### 1.4b Meus Amigos — Nova Funcionalidade (PROD-14 a PROD-17)

**Regra central:** Amigos = **somente usuários já cadastrados no banco de dados do FRIK**. Não há convite por e-mail externo, não há amizade com não-cadastrados.

**O que fazer:**
- Criar seção **"Meus Amigos"** dentro da [PerfilPage.tsx](file:///c:/Users/Aluno/Documents/GitHub/Projeto-final/frontend/src/components/pages/PerfilPage.tsx) (aba ou seção ao final da página)
- O usuário pode **buscar outros usuários** do sistema por:
  - Nome (busca parcial)
  - E-mail
  - CPF
- Campo de busca com autocomplete → retorna apenas usuários cadastrados no banco
- Ao encontrar, botão **[Adicionar amigo]**
- Lista de amigos adicionados exibe: avatar (inicial do nome), nome, nível FRIK, ícone se tem endereço cadastrado (✅ tem endereço / ⚠️ sem endereço)
- Botão **[Remover]** em cada amigo

**Backend necessário:**
- Tabela `amizade` (nova): `{ usuarioId, amigoId, criadoEm }` — relação simples, sem aprovação necessária
- `GET /api/amigos` — listar meus amigos com dados (nome, nível, tem endereço)
- `POST /api/amigos` — adicionar amigo pelo `amigoId`
- `DELETE /api/amigos/:amigoId` — remover amigo
- `GET /api/usuarios/busca?q=...` — buscar usuários do sistema por nome/email/CPF (retorna id, nome, nível — sem dados sensíveis)

**Arquivos a modificar/criar:**
- `backend/src/entities/Amizade.ts` (novo) — entidade de relacionamento
- `backend/src/routes/amigos.routes.ts` (novo) — CRUD de amigos + busca de usuários
- `backend/src/database/migrations/` — nova migration para tabela `amizade`
- `frontend/src/lib/api.ts` — `getMeusAmigos()`, `adicionarAmigo()`, `removerAmigo()`, `buscarUsuarios()`
- `frontend/src/components/pages/PerfilPage.tsx` — seção "Meus Amigos"

---

### 1.5 Salas de Troca — Corrigir Bug de Membros + Trocas Funcionais (TROCA-01 / 02 / 03)

**O que fazer:**

**Bug TROCA-01/02 — Membros não aparecem:**

O problema está em [sala.service.ts](file:///c:/Users/Aluno/Documents/GitHub/Projeto-final/backend/src/services/sala.service.ts): a função `detalheSala()` busca membros via query `SalaTrocaMembro` corretamente, mas o frontend chama `detalheSala()` **imediatamente** após `entrarSala()` sem aguardar a resposta — ou a query pode estar com condição de race.

Correção:
- Em [SalasPage.tsx](file:///c:/Users/Aluno/Documents/GitHub/Projeto-final/frontend/src/components/pages/SalasPage.tsx), após `handleEntrar()` chamar `await entrarSala()`, fazer `await abrirSala(codigo)` para abrir o detalhe já com o usuário incluído
- Verificar se a query de membros no service está fazendo join correto com a tabela `SalaTrocaMembro` para todos os membros (não só o criador)

**TROCA-03 — Trocas funcionais dentro da sala:**

Hoje a sala mostra membros mas não tem fluxo de proposta interna. Adicionar:
- Na sidebar de detalhe da sala, seção **"Propor troca"**:
  - Usuário seleciona um cupom próprio para oferecer
  - Seleciona o membro da sala para quem quer propor
  - Clica em "Enviar proposta"
- O membro destinatário vê na sala (ou por notificação) a proposta com opções **[Aceitar] / [Recusar]**
- Ao aceitar: os cupons são trocados entre os dois usuários (já existe `PropostaTroca` no backend)

**Arquivos a modificar:**
- `frontend/src/components/pages/SalasPage.tsx` — corrigir chamada pós-entrada, adicionar UI de propostas
- `backend/src/services/sala.service.ts` — verificar/corrigir query de membros
- `backend/src/routes/salas.routes.ts` — adicionar rotas para propostas dentro da sala (se necessário)

---

### 1.6 Registrar Compras — Simulação de Compra (COMPRA-01 / 02 / 03 / 04 / 05 / 06)

**O que fazer:**

Renomear [SimuladorCaixaPage.tsx](file:///c:/Users/Aluno/Documents/GitHub/Projeto-final/frontend/src/components/pages/SimuladorCaixaPage.tsx):
- Título da página: **"Registrar Compras"**
- Sidebar: texto muda de "Simulador de Caixa" → "Registrar compras"

Adicionar **simulação de compra** dentro da página:

**Etapa 1 — Montar carrinho:**
- Lista de produtos mockados para adicionar (ex: Fone Bluetooth R$150, Camiseta R$50, Capa R$30)
- Botões `+` e `-` para quantidade
- Total calculado automaticamente

**Etapa 2 — Forma de pagamento (simulação):**
- 3 opções com seleção visual:
  - 💳 Crédito (simular)
  - 🏦 Débito (simular)
  - ⚡ Pix (simular)
- Botão "Confirmar simulação"

**Resultado:**
- Chama o endpoint existente de compra passando o valor total
- Exibe: _"✅ Simulação concluída! Você ganhou X pontos pela compra."_
- Botão "Nova compra" para reiniciar

> A funcionalidade de PDV por CPF (lojista) pode ser mantida como seção secundária na mesma página, com título "PDV — Creditar por CPF".

**Arquivos a modificar:**
- `frontend/src/components/pages/SimuladorCaixaPage.tsx`
- `frontend/src/components/layout/Sidebar.tsx`

---

### 1.7 Admin — Garantir Visibilidade para Usuários Comuns (ADM-01 / ADM-02)

**O que fazer:**

Verificar cada tipo de item criado pelo admin e confirmar que aparece para usuários comuns:

| Item | Rota pública? | Ação necessária |
|------|---------------|-----------------|
| Cupons (templates) | `GET /api/mercado/cupons` | Verificar se retorna templates ativos |
| Produtos | `GET /api/produtos` | Verificar se retorna apenas `ativo = true` |
| Missões | **Não existe rota pública** | Criar `GET /api/missoes` (item 1.2 acima) |
| Campanhas | **Não existe rota pública** | Criar `GET /api/campanhas/ativas` para exibir no dashboard |
| Eventos Sazonais | `GET /api/ranking/evento-ativo` | Já existe — verificar se está sendo exibido |

**Arquivos a modificar:**
- `backend/src/routes/missoes.routes.ts` (novo)
- `backend/src/routes/campanhas.routes.ts` (novo, para exibição pública)
- `frontend/src/components/pages/DashboardPage.tsx` — consumir campanhas ativas se houver

---

## BLOCO 2 — MÉDIA PRIORIDADE

---

### 2.1 Produtos — Acompanhamento de Entrega (PROD-04 / PROD-05)

**O que fazer:**

Adicionar seção **"Meus Pedidos"** na página de Produtos:
- Lista de pedidos do usuário com badge de status:
  - 🟡 **Em retirada** — pedido confirmado, aguardando coleta
  - 🔵 **Em rota** — saiu para entrega
  - ✅ **Entregue** — recebido
- Status simulado: botão "Avançar status" visível apenas em modo demo, ou ciclo automático por tempo

**Backend:**
- A entidade `PedidoPresente.ts` já existe — verificar se tem campo `status`
- Se não tiver os novos status, adicionar ao enum da entidade e na migration

**Arquivos a modificar:**
- `backend/src/entities/PedidoPresente.ts` — adicionar status `em_retirada`, `em_rota`, `entregue`
- `backend/src/routes/presentes.routes.ts` — rota para atualizar status (mock/demo)
- `frontend/src/components/pages/PresentesPage.tsx` — seção de acompanhamento de pedidos

---

### 2.2 Produtos — Mais Produtos no Catálogo (PROD-03)

**O que fazer:**
- No seed do banco (`backend/src/database/seed.ts`), adicionar mais produtos além dos existentes
- Exemplos: Smartwatch, Fone Bluetooth, Camiseta FRIK, Mochila, Voucher de Serviço, etc.
- Cada produto precisa de `preco_reais`, `preco_pontos`, `nome`, `descricao`

**Arquivos a modificar:**
- `backend/src/database/seed.ts`

---

### 2.3 Ranking — Múltiplas Abas (RANK-01 a 08)

**O que fazer:**

Na [RankingPage.tsx](file:///c:/Users/Aluno/Documents/GitHub/Projeto-final/frontend/src/components/pages/RankingPage.tsx), transformar a lista única em **5 abas**:

| Aba | Métrica | Descrição |
|-----|---------|-----------|
| **Geral** | `pontos` total | Já existe (`rankingGlobal`) |
| **Mensal** | Pontos nos últimos 30 dias | Nova query no backend |
| **Trocas** | Qtd de trocas aceitas | Nova query no backend |
| **Presentes** | Qtd de presentes enviados | Nova query no backend |
| **Conquistas** | Qtd de badges desbloqueadas | Nova query no backend |

Em cada aba:
- Top 10 usuários com posição, avatar (inicial do nome), nome, nível, valor
- **Destaque em verde/dourado** para o usuário logado em qualquer posição
- Se o usuário não está no top 10: exibir sua posição no rodapé da lista

**Backend — novas funções em [ranking.service.ts](file:///c:/Users/Aluno/Documents/GitHub/Projeto-final/backend/src/services/ranking.service.ts):**
```ts
rankingMensal(limite)     // SUM(hp.valor) WHERE hp.criadoEm >= NOW() - 30 dias
rankingTrocas(limite)     // COUNT(pt.id) WHERE pt.status = 'aceita'
rankingPresentes(limite)  // COUNT(pc.id) WHERE pc.remetenteId
rankingConquistas(limite) // COUNT(uc.id)
```

**Novas rotas em [ranking.routes.ts](file:///c:/Users/Aluno/Documents/GitHub/Projeto-final/backend/src/routes/ranking.routes.ts):**
```
GET /api/ranking/mensal
GET /api/ranking/trocas
GET /api/ranking/presentes
GET /api/ranking/conquistas
```

**Frontend:**
- `frontend/src/lib/api.ts` — adicionar 4 funções de ranking
- `frontend/src/components/pages/RankingPage.tsx` — sistema de abas + destaque do usuário

---

### 2.4 Missões vs Conquistas — Onde ficam (DUV-04 / DUV-05)

**Decisão definida no documento:**
- **Missões:** temporárias, criadas por admin, dão pontos → exibidas na **tela inicial (Dashboard)**
- **Conquistas:** permanentes, desbloqueadas por ações → exibidas no **Perfil** (vitrine de badges) e como **aba do Ranking**

**O que fazer:**
- Conquistas já aparecem no Ranking — ok
- Adicionar seção de **"Minhas Conquistas"** na [PerfilPage.tsx](file:///c:/Users/Aluno/Documents/GitHub/Projeto-final/frontend/src/components/pages/PerfilPage.tsx):
  - Grid de badges com ícone + nome + descrição
  - Conquistas desbloqueadas: coloridas, com data
  - Conquistas bloqueadas: cinza/transparente com cadeado

**Arquivos a modificar:**
- `frontend/src/components/pages/PerfilPage.tsx`
- `frontend/src/lib/api.ts` — função `getTodasConquistas()` já existe, verificar se está sendo usada no perfil

---

### 2.5 API — ViaCEP (busca de endereço por CEP)

**O que fazer:**
- A `lib/viacep.ts` já existe no projeto (foi implementada anteriormente)
- Garantir que está sendo usada no formulário de endereço da [PresentesPage.tsx](file:///c:/Users/Aluno/Documents/GitHub/Projeto-final/frontend/src/components/pages/PresentesPage.tsx) ao digitar o CEP
- Campo CEP com máscara `99999-999`
- Ao completar 8 dígitos: buscar automaticamente e preencher logradouro, bairro, cidade, estado

---

## BLOCO 3 — BAIXA PRIORIDADE (futuro)

---

### 3.1 Campanhas vs Eventos Sazonais — Manter Separados + Exibir para Usuários

**Decisão:** Manter as duas entidades separadas (já existem `Campanha.ts` e `EventoSazonal.ts`). A razão: os RFs 13.1 e 13.2 têm propósitos distintos.

| | Campanha | Evento Sazonal |
|--|----------|----------------|
| **Quem participa?** | Apenas níveis específicos | Todos os usuários |
| **O que ganha?** | Pontos extras, cupons especiais | Trocas extras |
| **Quando usar?** | Para incentivar comportamento | Em datas comemorativas |

**O que falta implementar:**
- Campanhas ativas visíveis para o usuário no Dashboard (banner ou card informativo)
- Eventos Sazonais já exibem no Dashboard via `GET /api/ranking/evento-ativo`
- A lógica de **trocas extras** do Evento deve ser aplicada dinamicamente ao limite do usuário no backend — verificar se `UsuarioTrocaMes.ts` já incorpora isso

### 3.2 API — Google Maps (frete e rota)

- Calcular frete dinâmico com base no CEP de destino
- Exibir mapa de rota no acompanhamento de entrega
- Depende de chave de API paga — configurar como variável de ambiente

### 3.3 API — OpenAI (recomendações e chatbot)

- Recomendação de produtos/cupons baseada no histórico do usuário
- Chatbot de suporte dentro da plataforma
- Depende de chave de API — configurar como variável de ambiente

### 3.4 Cupons no Frete (PROD-07)

- No checkout de produtos, permitir aplicar um cupom de desconto no valor do frete calculado

---

## Ordem de Execução Recomendada

```
SEMANA 1 — Bugs e Renomeações
├── 1.1  Login: adicionar tela de cadastro
├── 1.5a Salas: corrigir bug de membros (não aparecer na lista)
├── 1.4a Sidebar: renomear "Presentes" → "Produtos" e "Simulador" → "Registrar compras"
└── 1.3  Mercado: remover seção de troca, adicionar compra com pontos

SEMANA 2 — Funcionalidades de Alta Prioridade
├── 1.2  Dashboard: missões reais com progresso e selo
├── 1.6  Registrar Compras: carrinho + simulação de pagamento
├── 1.4b Produtos: botão "Comprar para mim"
└── 1.5b Salas: trocas funcionais com aceitar/recusar

SEMANA 3 — Média Prioridade
├── 2.1  Produtos: acompanhamento de entrega
├── 2.2  Produtos: mais itens no catálogo
├── 2.3  Ranking: múltiplas abas
├── 2.4  Conquistas: seção no Perfil
└── 2.5  ViaCEP: validar integração de CEP

FUTURO — Baixa Prioridade
├── 3.1  Campanhas visíveis para usuários
├── 3.2  Google Maps API
├── 3.3  OpenAI API
└── 3.4  Cupons no frete
```

---

## Resumo de Arquivos por Área

### Backend
| Arquivo | Ação |
|---------|------|
| `src/routes/missoes.routes.ts` | **Criar** — rota pública GET /api/missoes |
| `src/routes/ranking.routes.ts` | **Modificar** — adicionar /mensal, /trocas, /presentes, /conquistas |
| `src/routes/mercado.routes.ts` | **Modificar** — adicionar POST /resgatar/:templateId |
| `src/routes/salas.routes.ts` | **Modificar** — verificar membros, adicionar propostas |
| `src/services/sala.service.ts` | **Modificar** — corrigir query de membros |
| `src/services/ranking.service.ts` | **Modificar** — adicionar 4 novas funções de ranking |
| `src/entities/PedidoPresente.ts` | **Modificar** — adicionar status de entrega |
| `src/database/seed.ts` | **Modificar** — adicionar mais produtos |

### Frontend
| Arquivo | Ação |
|---------|------|
| `src/components/pages/LoginPage.tsx` | **Modificar** — adicionar tela de cadastro |
| `src/components/layout/Sidebar.tsx` | **Modificar** — renomear itens do menu |
| `src/components/pages/DashboardPage.tsx` | **Modificar** — missões reais + progresso |
| `src/components/pages/MercadoPage.tsx` | **Modificar** — remover troca, adicionar compra com pontos |
| `src/components/pages/PresentesPage.tsx` | **Modificar** — renomear, botão "Comprar para mim", remover aba cupom, acompanhamento de entrega |
| `src/components/pages/SalasPage.tsx` | **Modificar** — corrigir bug membros, adicionar propostas |
| `src/components/pages/SimuladorCaixaPage.tsx` | **Modificar** — renomear, adicionar carrinho + pagamento |
| `src/components/pages/RankingPage.tsx` | **Modificar** — múltiplas abas |
| `src/components/pages/PerfilPage.tsx` | **Modificar** — adicionar vitrine de conquistas |
| `src/lib/api.ts` | **Modificar** — adicionar funções para missões, ranking abas, resgatar cupom |
