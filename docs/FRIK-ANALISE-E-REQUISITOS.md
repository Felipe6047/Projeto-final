```markdown
# DOCUMENTO FRIK - ANÁLISE E REQUISITOS PRIORIZADOS

## Contexto Geral

O sistema FRIK já possui uma versão inicial funcionando, mas precisa de correções, melhorias e novas funcionalidades conforme solicitado. Abaixo está a lista completa de tudo o que deve ser alterado, implementado ou corrigido, organizado por tela e prioridade.

---

## 1. TELA DE LOGIN / CADASTRO

| ID | Requisito | Prioridade |
|----|-----------|------------|
| LOG-01 | Adicionar uma opção pequena escrita **"Cadastre-se"** na tela de login | 🔥 Alta |
| LOG-02 | O cadastro deve ser simples, **sem necessidade de verificação de identidade** (sem confirmação de e-mail ou SMS) | 🔥 Alta |

**Contexto:** A ideia é reduzir o atrito para novos usuários entrarem no sistema. A verificação de identidade pode ser adicionada depois, mas no MVP não é necessária.

---

## 2. TELA INICIAL (Dashboard)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| HOME-01 | Renomear o botão **"Simulador de Caixa"** para **"Registrar compras"** | 🔥 Alta |
| HOME-02 | Adicionar um bloco de **Missões Ativas** na tela inicial | ⚠️ Média |
| HOME-03 | Missões concluídas devem exibir um **selo de "concluídas"** (ícone de check, texto verde, etc.) | ⚠️ Média |
| HOME-04 | Exibir o progresso de cada missão (ex: "1/3 trocas realizadas") | ⚠️ Média |

**Exemplo do bloco de Missões:**
```
🎯 MISSÕES ATIVAS
├── ✅ Faça 5 compras → 200 pts (CONCLUÍDA)
├── 🔄 Complete 3 trocas esta semana → 100 pts (Progresso: 1/3)
└── ⏳ Presenteie um amigo → 50 pts (Não iniciada)
```

---

## 3. TELA DE MERCADO DE CUPONS

| ID | Requisito | Prioridade |
|----|-----------|------------|
| CUPOM-01 | **Remover completamente** a seção "Oportunidades Disponíveis para troca" | 🔥 Alta |
| CUPOM-02 | Deixar apenas cupons disponíveis para **comprar com pontos** (estilo Microsoft Rewards) | 🔥 Alta |
| CUPOM-03 | Cada cupom deve ter: título, desconto (percentual ou fixo), custo em pontos, validade | 🔥 Alta |

**Exemplo do novo Mercado de Cupons:**
```
MERCADO DE CUPONS - COMPRE COM PONTOS
┌─────────────────────────────────────┐
│ 🏷️ Desconto 10% em qualquer compra  │
│ Custo: 500 pontos                    │
│ Válido até: 30/06/2026               │
│ [Resgatar]                           │
├─────────────────────────────────────┤
│ 🏷️ R$20 off em compras acima de R$100│
│ Custo: 900 pontos                    │
│ Válido até: 15/07/2026               │
│ [Resgatar]                           │
└─────────────────────────────────────┘
```

---

## 4. TELA DE PRODUTOS (antiga "Presentes")

| ID | Requisito | Prioridade |
|----|-----------|------------|
| PROD-01 | **Renomear a aba "Presentes" para "Produtos"** | 🔥 Alta |
| PROD-02 | Adicionar a opção **"Comprar para mim"** ao lado de **"Dar de presente"** | 🔥 Alta |
| PROD-03 | Adicionar mais produtos ao catálogo | ⚠️ Média |
| PROD-04 | Criar uma seção de **Acompanhamento de Entrega** com status | ⚠️ Média |
| PROD-05 | Status de entrega: **"Em retirada" → "Em rota" → "Entregue"** | ⚠️ Média |
| PROD-06 | Calcular **rota e frete** usando APIs (Google Maps ou ViaCEP) | 📌 Baixa |
| PROD-07 | Possibilitar **uso de cupons** no frete | 📌 Baixa |

**Exemplo da tela Produtos:**
```
PRODUTOS

┌─────────────────────────────────────────┐
│ 🎧 Fone Bluetooth                       │
│ R$ 150,00 ou 1.500 pontos               │
│ [Comprar para mim] [Dar de presente]    │
├─────────────────────────────────────────┤
│ ⌚ Smartwatch                            │
│ R$ 300,00 ou 3.000 pontos               │
│ [Comprar para mim] [Dar de presente]    │
└─────────────────────────────────────────┘

📦 ACOMPANHAR ENTREGAS
├── Pedido #001 - Fone Bluetooth - Em rota 🚚
├── Pedido #002 - Smartwatch - Entregue ✅
└── Pedido #003 - Camiseta - Em retirada 📦
```

---

## 5. TELA DE SALAS DE TROCA

| ID | Requisito | Prioridade |
|----|-----------|------------|
| TROCA-01 | **Corrigir bug:** quando um usuário entra na sala usando um código, ele deve aparecer na lista de membros | 🔥 Alta |
| TROCA-02 | Atualmente só aparece o criador da sala. O usuário que entrou com código deve ser exibido também | 🔥 Alta |
| TROCA-03 | **Tornar a troca funcional** (aceitar/recusar propostas, transferir cupons entre usuários) | 🔥 Alta |
| TROCA-04 | Remover a aba "Cupom de presente" (não é mais necessária, pois as Salas de Troca já cumprem essa função) | ⚠️ Média |

**Exemplo da Sala de Troca corrigida:**
```
SALA DE TROCA #ABC123

MEMBROS (3)
├── 👑 Admin (Criador) - Platina
├── 👤 JoãoSilva (entrou via código) - Prata
└── 👤 Maria123 (entrou via código) - Bronze

PROPOSTAS DE TROCA
┌─────────────────────────────────────────┐
│ Admin oferece: Cupom 10%                │
│ Quer: Cupom R$20                         │
│ [Aceitar] [Recusar]                      │
└─────────────────────────────────────────┘
```

---

## 6. TELA DE RANKING

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RANK-01 | Repensar o funcionamento do ranking (atualmente é apenas por saldo total) | ⚠️ Média |
| RANK-02 | Implementar **múltiplas abas** no ranking | ⚠️ Média |
| RANK-03 | - **Ranking Geral** (saldo total de pontos - como já existe) | ⚠️ Média |
| RANK-04 | - **Ranking Mensal** (pontos ganhos nos últimos 30 dias) | ⚠️ Média |
| RANK-05 | - **Ranking de Trocas** (quem mais realizou trocas) | ⚠️ Média |
| RANK-06 | - **Ranking de Presentes** (quem mais presenteou outros usuários) | ⚠️ Média |
| RANK-07 | - **Ranking de Conquistas** (quem tem mais badges desbloqueadas) | 📌 Baixa |
| RANK-08 | Em cada aba, mostrar a **posição atual do usuário logado** | ⚠️ Média |

**Exemplo da nova tela de Ranking:**
```
RANKING

[Geral] [Mensal] [Trocas] [Presentes] [Conquistas]

📍 RANKING MENSAL (pontos nos últimos 30 dias)
┌────┬──────────────┬─────────────┬──────────┐
│ #1 │ Ana Souza    │ 2.500 pts   │ 🏆       │
│ #2 │ Carlos Silva │ 2.100 pts   │          │
│ #3 │ Beatriz Lima │ 1.800 pts   │          │
│... │              │             │          │
│ #15│ Você         │ 450 pts     │ 👈       │
└────┴──────────────┴─────────────┴──────────┘
```

---

## 7. TELA DE REGISTRAR COMPRAS (nova funcionalidade)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| COMPRA-01 | Criar botão **"Registrar compras"** (substituindo "Simulador de Caixa") | 🔥 Alta |
| COMPRA-02 | Dentro da funcionalidade, ter uma **simulação de compra** | 🔥 Alta |
| COMPRA-03 | Adicionar **simulação de pagamento** com opções | ⚠️ Média |
| COMPRA-04 | - 💳 Crédito (simulação) | ⚠️ Média |
| COMPRA-05 | - 💳 Débito (simulação) | ⚠️ Média |
| COMPRA-06 | - 📱 Pix (simulação) | ⚠️ Média |

**Exemplo da tela Registrar Compras:**
```
REGISTRAR COMPRAS - SIMULAÇÃO

Produtos no carrinho:
├── Fone Bluetooth - R$ 150,00
├── Capa para celular - R$ 30,00
└── Total: R$ 180,00

Forma de pagamento (simulação):
○ Crédito (simular)
○ Débito (simular)
● Pix (simular)

[Confirmar simulação]

✅ Simulação concluída! Você ganhou 180 pontos pela compra.
```

---

## 8. ADMINISTRADOR

| ID | Requisito | Prioridade |
|----|-----------|------------|
| ADM-01 | Garantir que **tudo que for criado pelo administrador** apareça para os usuários comuns | 🔥 Alta |
| ADM-02 | Isso inclui: cupons, produtos, missões, campanhas, eventos | 🔥 Alta |

---

## 9. MISSÕES vs CONQUISTAS (esclarecimento)

| Item | Esclarecimento | Decisão |
|------|----------------|---------|
| DUV-01 | Missões e conquistas **não são a mesma coisa**, mas são parecidas | ✅ Manter separado |
| DUV-02 | **Missões (RF09):** temporárias, criadas por admin, recompensam com pontos | ✅ Manter |
| DUV-03 | **Conquistas (RF10):** permanentes, desbloqueáveis por ações específicas, viram badges | ✅ Manter |
| DUV-04 | Missões vão na **tela inicial** (com selo de concluídas) | ✅ Decidido |
| DUV-05 | Conquistas vão no **Perfil** (vitrine de badges) e também no **Ranking de Conquistas** | ✅ Decidido |

**Resumo para o usuário final:**
- **Missões:** "Faça 3 trocas esta semana e ganhe 100 pontos" (temporário, dá pontos)
- **Conquistas:** "Você já presenteou 5 amigos - Badge de Amigo Generoso" (permanente, vira medalha)

---

## 10. APIs PARA INTEGRAÇÃO

| API | Finalidade | Prioridade |
|-----|------------|------------|
| ViaCEP API | Buscar endereço automaticamente ao digitar CEP | ⚠️ Média |
| Google Maps API | Calcular rota e frete dinâmico | 📌 Baixa |
| OpenAI API | Funcionalidades de IA (recomendações, chatbot) | 📌 Baixa |

**Recomendação:** Comece com a **ViaCEP API** (grátis e fácil). Google Maps e OpenAI podem ficar para versões futuras.

---

## 11. RESUMO PRIORIZADO POR TELA

| Tela | O que fazer | Prioridade |
|------|-------------|------------|
| **Login** | Adicionar "Cadastre-se" sem verificação | 🔥 Alta |
| **Tela Inicial** | Renomear botão + adicionar missões com selo | 🔥 Alta |
| **Mercado Cupons** | Remover "Oportunidades de Troca" | 🔥 Alta |
| **Produtos** | Renomear + opções "para mim/para presente" | 🔥 Alta |
| **Salas de Troca** | Corrigir bug membros + tornar troca funcional | 🔥 Alta |
| **Registrar Compras** | Criar simulação de compra e pagamento | 🔥 Alta |
| **Admin** | Garantir visibilidade de itens criados | 🔥 Alta |
| **Ranking** | Múltiplas abas + posição do usuário | ⚠️ Média |
| **Acompanhamento** | Status de entrega (retirada/rota/entregue) | ⚠️ Média |
| **APIs** | ViaCEP (endereço) | ⚠️ Média |
| **Conquistas** | Badges + ranking específico | 📌 Baixa |
| **APIs avançadas** | Google Maps + OpenAI | 📌 Baixa |

---

## 12. STATUS DE IMPLEMENTAÇÃO (MVP Entregue)

### ✅ Implementado no MVP
1. Tela de cadastro simples na página de login (sem verificação de e-mail)
2. Missões ativas na tela inicial com progresso (ex: 1/3) e selo de concluídas
3. Mercado de Cupons apenas com resgate por pontos (sem "oportunidades de troca")
4. Tela de Produtos com opções "Comprar para mim" e "Dar de presente"
5. Salas de Troca com lista de membros corrigida e propostas funcionais (aceitar/recusar)
6. Tela de Registrar Compras com simulação de pagamento (Crédito/Débito/PIX)
7. Painel Admin com CRUD completo de campanhas, cupons, produtos e missões
8. Ranking com múLtiplas abas e posição do usuário logado
9. Conquistas com desbloqueio automático e notificações em tempo real
10. Sistema de Amigos com gestão de endereços e cartões de crédito

### ❌ Fora do escopo do MVP (Versão Futura)
1. Cálculo de rota/frete com Google Maps API
2. Busca automática de CEP com ViaCEP API
3. Ranking específico de Conquistas
4. Envio real de e-mail/WhatsApp/SMS (atualmente simulado por link)
5. Funcionalidades de IA com OpenAI API

---

## 13. OBSERVAÇÕES FINAIS

- A aba "Cupom de presente" foi **removida** e substituída pelas Salas de Troca e pelo sistema de Presentes
- Missões e conquistas são **funcionalidades separadas** e complementares
- O ranking tem tela própria com múLtiplas categorias
- Todos os bugs de alta prioridade foram corrigidos antes da entrega
- O MVP foi entregue com todas as funcionalidades de Alta Prioridade concluídas
- Funcionalidades de prioridade Média relacionadas a APIs externas e entrega física ficam para a Versão 2.0

---

**Documento gerado em:** Junho de 2026
**Projeto:** FRIK - Sistema de Fidelização com Gamificação
```