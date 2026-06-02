# 🎮 FRIK — Análise de Gamificação & Fidelidade

**Documento:** Revisão técnica e de produto  
**Data:** 27/05/2026  
**Versão analisada:** MVP Backend (v1.0)  
**Autor da análise:** Revisão técnica interna

---

## 📌 Visão Geral do Sistema

O **FRIK** é um sistema de fidelização com gamificação que transforma a experiência de compra em uma jornada progressiva. O cliente acumula pontos, evolui de nível (Bronze → Diamante), troca cupons em um mercado interno, presenteia amigos e compete no ranking global.

```
Compra → Pontos → Nível → Benefícios → Trocas / Presentes → Engajamento
```

---

## ✅ Pontos Fortes

### 1. Mercado de Troca de Cupons — Diferencial Real
O mercado peer-to-peer de cupons entre usuários é um conceito **genuinamente criativo e incomum** no mercado brasileiro de fidelidade. Ele cria uma **economia interna** que faz as pessoas voltarem ao app mesmo sem comprar nada novo. Usuários têm um motivo de retorno além de "acumular pontos".

### 2. Níveis com Regras que Importam
Ao invés de nível ser apenas um título visual, cada nível desbloqueia **funcionalidades reais e perceptíveis**:

| Nível | Trocas/mês | Presentear cupom | Presentear produto | Sala de troca |
|-------|-----------|------------------|--------------------|---------------|
| Bronze | 1 | ❌ | ❌ | ❌ |
| Prata | 3 | ✅ | ❌ | ❌ |
| Ouro | 10 | ✅ | ✅ (até R$ 100) | ❌ |
| Platina | Ilimitado | ✅ | ✅ | ✅ |
| Diamante | Ilimitado | ✅ | ✅ | ✅ |

Isso é **gamificação real** — o usuário sente a diferença entre ser Bronze e Ouro.

### 3. Eventos Sazonais Inteligentes
A tabela `evento_sazonal` com campo `trocas_extras` é simples e eficaz. Dá ao administrador alavancagem para criar **picos de engajamento** (Black Friday, Natal, Semana do Consumidor) sem necessidade de alteração de código.

### 4. Missões com Tipos Variados
O sistema de missões suporta metas por `compras`, `trocas`, `presentes` e `pontos` — diversificando os comportamentos incentivados além do simples "compre mais".

### 5. Arquitetura Limpa e Extensível
A separação entre `entities/`, `services/` e `routes/` está bem executada. O código será fácil de manter e evoluir. A validação com Zod nas rotas é uma boa prática.

### 6. Histórico de Pontos Detalhado
A tabela `historico_pontos` com `tipo`, `referencia_tipo` e `referencia_id` permite total rastreabilidade de onde cada ponto veio — fundamental para transparência com o usuário e auditoria administrativa.

---

## ⚠️ Problemas Identificados

### 🔴 Crítico — Bloqueia o funcionamento da fidelidade

#### 1. Crédito de pontos por compra não está implementado
> **Registrado na spec:** `"Sistema | Creditar pontos após compra | Planejado"`

A tabela `compra` existe, a config `PONTOS_POR_REAL` existe (10 pts/R$), mas **o fluxo que de fato credita pontos ao usuário após uma compra ainda não foi implementado**. Sem isso, o sistema de fidelidade não funciona na prática.

**O que falta:**
- Rota `POST /api/compras` receber o valor da compra
- Calcular `pontos = Math.floor(valor * env.pontosPorReal)`
- Atualizar `usuario.pontos`
- Inserir registro em `historico_pontos`
- Verificar se o usuário subiu de nível automaticamente

#### 2. Conquistas não desbloqueiam automaticamente
> **Registrado na spec:** `"conquistas sem desbloqueio automático"`

Conquistas que não aparecem sozinhas não engajam ninguém. O usuário precisa de **feedback imediato** ao realizar uma ação — é um dos pilares da gamificação (loop de recompensa).

**O que falta:**
- Função `verificarConquistas(usuarioId)` chamada após cada ação relevante
- Inserção automática em `usuario_conquista`
- Notificação ao usuário quando uma conquista é desbloqueada

---

### 🟡 Importante — Reduz o impacto da gamificação

#### 3. Progresso de missões não é rastreado automaticamente
A tabela `usuario_missao` existe, mas **nada atualiza o progresso** quando o usuário realiza uma troca ou envia um presente. Sem isso, missões são apenas dados no banco sem efeito real.

**O que falta:**
- Após cada troca aceita: `incrementarProgressoMissao(usuarioId, 'trocas')`
- Após cada presente enviado: `incrementarProgressoMissao(usuarioId, 'presentes')`
- Após cada compra: `incrementarProgressoMissao(usuarioId, 'compras')`
- Creditar `pontos_recompensa` quando missão for completada

#### 4. Ranking só por pontos totais acumulados
Quem entrou antes sempre vence. Isso **desmotiva novos usuários** de participarem do ranking.

**Sugestão:** Adicionar um ranking mensal separado que reseta todo mês, dando chance igual a todos.

#### 5. Notificações existem no banco mas não são enviadas
A tabela `notificacao` está criada, mas nenhuma rota ou serviço a alimenta. Notificações são fundamentais para **reengajamento de usuários inativos**.

---

### 🟢 Melhorias de longo prazo

#### 6. Falta sistema de "streak" (sequência de dias/semanas)
Sequências são um dos mecanismos de retenção mais poderosos da gamificação (referência: Duolingo). Exemplos de aplicação no FRIK:

- *"Comprou 3 semanas seguidas → +50 pontos bônus"*
- *"Realizou uma troca por 2 meses consecutivos → conquista especial"*

**Implementação simples:** adicionar coluna `ultimo_streak_em` e `streak_atual` na tabela `usuario`.

#### 7. Taxa de troca em pontos pode afastar usuários iniciantes
A `TAXA_TROCA_PONTOS` (padrão 50 pts) é cobrada para realizar trocas. Para usuários Bronze com poucos pontos, isso pode ser uma barreira de entrada. Considere isentar Bronze ou tornar a taxa opcional por nível.

#### 8. Bronze sobe para Prata muito rápido (R$ 50)
Com 10 pts por R$ 1, o usuário precisa gastar apenas **R$ 50** para atingir Prata. Isso faz a progressão inicial parecer sem esforço e diminui o valor percebido dos níveis.

---

## 📊 Análise do Sistema de Pontos

### Taxa atual: 10 pts por R$ 1,00

| Produto | Preço em R$ | Preço em Pontos | Gasto necessário |
|---------|------------|-----------------|-----------------|
| Caneca FRIK | R$ 49,90 | 500 pts | R$ 50,00 |
| Kit Café Especial | R$ 89,90 | 900 pts | R$ 90,00 |
| Camiseta Edição Ouro | R$ 129,90 | 1.300 pts | R$ 130,00 |

**Conclusão:** A equivalência pontos ↔ reais está correta (retorno de ~1% em produto, padrão de mercado). O problema não é a taxa, mas a **falta de comunicação do valor** para o usuário.

### Limiares de nível sugeridos (ajuste)

| Nível | Atual (R$ gastos) | Sugerido |
|-------|------------------|---------|
| Prata | R$ 50 | R$ 150 |
| Ouro | R$ 200 | R$ 500 |
| Platina | R$ 500 | R$ 1.500 |
| Diamante | R$ 1.500 | R$ 5.000 |

---

## 🗺️ Roadmap de Melhorias — Priorizado

### 🔴 Fase 1 — Completar o núcleo (bloqueante)

- [ ] **Implementar `POST /api/compras`** — registrar compra e creditar pontos automaticamente
- [ ] **Verificar subida de nível** após crédito de pontos (atualizar `nivel_id` do usuário)
- [ ] **Desbloqueio automático de conquistas** após cada ação relevante

### 🟡 Fase 2 — Fechar o loop de gamificação

- [ ] **Progresso automático de missões** após trocas, presentes e compras
- [ ] **Creditar recompensa da missão** quando `meta_valor` for atingida
- [ ] **Alimentar tabela `notificacao`** em eventos-chave (conquista, subida de nível, missão completa)
- [ ] **Ranking mensal** separado do ranking geral

### 🟢 Fase 3 — Diferenciação e retenção

- [ ] **Sistema de streak** com bônus por consistência
- [ ] **Multiplicadores de pontos** por evento sazonal (`pontos_multiplicador` no `evento_sazonal`)
- [ ] **Isenção de taxa de troca** para nível Bronze
- [ ] **Validade de pontos** — expirar pontos após 12 meses sem compra
- [ ] **Notificação por e-mail** para usuários inativos há 30 dias

---

## 💡 Sugestão de Feature: Multiplicadores de Pontos

Adicionar campo `pontos_multiplicador DECIMAL(3,1) DEFAULT 1.0` na tabela `evento_sazonal`. Durante eventos ativos, aplicar o multiplicador no cálculo:

```typescript
// Antes
const pontos = Math.floor(valorCompra * env.pontosPorReal);

// Depois (com evento sazonal)
const evento = await eventoService.getEventoAtivo();
const multiplicador = evento?.pontosMultiplicador ?? 1.0;
const pontos = Math.floor(valorCompra * env.pontosPorReal * multiplicador);
```

Isso permite campanhas como *"Semana com pontos em dobro!"* sem alterar código.

---

## 📈 Conclusão Geral

| Aspecto | Status | Nota |
|---------|--------|------|
| Conceito e diferenciação | ✅ Excelente | 9/10 |
| Arquitetura do backend | ✅ Sólida | 8/10 |
| Regras de nível | ✅ Bem definidas | 8/10 |
| Loop de recompensa (pontos → ação → feedback) | ⚠️ Incompleto | 4/10 |
| Missões e conquistas funcionais | ⚠️ Estrutura existe, sem automação | 3/10 |
| Retenção de longo prazo | 🔴 Não iniciado | 2/10 |

**O projeto tem uma base sólida e criativa (~60% completo).** As peças estão no banco de dados, mas os gatilhos que as fazem funcionar automaticamente (crédito de pontos, conquistas, progresso de missões) precisam ser implementados para o sistema de gamificação funcionar de verdade.

---

*Documento gerado em 27/05/2026 — revisão técnica do MVP FRIK v1.0*
