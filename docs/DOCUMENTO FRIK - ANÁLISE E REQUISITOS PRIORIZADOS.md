```markdown
# DOCUMENTO FRIK - ANÁLISE E REQUISITOS PRIORIZADOS

## Contexto Geral

O sistema FRIK já possui uma versão inicial funcionando, mas precisa de correções, melhorias e novas funcionalidades conforme solicitado. Abaixo está a lista completa de tudo o que deve ser alterado, implementado ou corrigido, organizado por tela e prioridade.

---

## 1. TELA DE LOGIN / CADASTRO

| ID | Requisito | Prioridade |
|----|-----------|------------|
| LOG-01 | Adicionar uma opção pequena escrita **"Cadastre-se"** na tela de login | 🔥 Alta |
| LOG-02 | Tela de cadastro deve ter campos: **Nome, E-mail, Senha, CPF** | 🔥 Alta |
| LOG-03 | **Remover completamente** a funcionalidade de "enviar foto" para validação de identidade | 🔥 Alta |
| LOG-04 | No momento do cadastro, o sistema deve **validar o CPF** (formato e se já existe no sistema) | 🔥 Alta |
| LOG-05 | Se o CPF já estiver cadastrado, exibir mensagem de erro: *"CPF já cadastrado. Faça login ou recupere sua senha."* | 🔥 Alta |
| LOG-06 | Se o CPF for inválido (formato errado), exibir mensagem: *"CPF inválido. Digite um CPF válido (apenas números)."* | 🔥 Alta |
| LOG-07 | O cadastro deve ser simples, **sem necessidade de envio de documentos ou fotos** | 🔥 Alta |

**Exemplo da tela de cadastro:**
```
┌─────────────────────────────────────┐
│         CRIAR CONTA - FRIK          │
├─────────────────────────────────────┤
│                                     │
│  Nome completo                      │
│  [ ___________________________ ]    │
│                                     │
│  E-mail                             │
│  [ ___________________________ ]    │
│                                     │
│  Senha                              │
│  [ ___________________________ ]    │
│                                     │
│  CPF (apenas números)               │
│  [ ___________________________ ]    │
│                                     │
│  ✅ O CPF será validado             │
│     automaticamente no cadastro     │
│                                     │
│  [ CADASTRAR ]                      │
│                                     │
│  Já tem conta? Faça login           │
└─────────────────────────────────────┘
```

**Fluxo de validação do CPF:**
| Validação | Ação |
|-----------|------|
| CPF com formato inválido (ex: 111.111.111-11 ou 12345678901 com dígitos errados) | ❌ Bloquear cadastro, exibir erro |
| CPF já existe no banco de dados | ❌ Bloquear cadastro, sugerir login |
| CPF válido e não cadastrado | ✅ Permitir cadastro |

---

## 2. TELA INICIAL (Dashboard)

| ID | Requisito | Prioridade |
|----|-----------|------------|
| HOME-01 | Manter o botão **"Registrar compras"** na tela inicial | 🔥 Alta |
| HOME-02 | Ao clicar no botão, abre um **simulador de compra avulsa** (não relacionado ao catálogo de produtos) | 🔥 Alta |
| HOME-03 | O simulador deve permitir: digitar valor da compra, calcular pontos (ex: R$1 = 1 ponto) e simular pagamento | 🔥 Alta |
| HOME-04 | Adicionar um bloco de **Missões Ativas** na tela inicial | ⚠️ Média |
| HOME-05 | Missões concluídas devem exibir um **selo de "concluídas"** (ícone de check, texto verde, etc.) | ⚠️ Média |
| HOME-06 | Exibir o progresso de cada missão (ex: "1/3 trocas realizadas") | ⚠️ Média |

**Exemplo do bloco de Missões:**
```
🎯 MISSÕES ATIVAS
├── ✅ Faça 5 compras → 200 pts (CONCLUÍDA)
├── 🔄 Complete 3 trocas esta semana → 100 pts (Progresso: 1/3)
└── ⏳ Presenteie um amigo → 50 pts (Não iniciada)
```

**Exemplo do Simulador de Compra (botão Registrar compras):**
```
REGISTRAR COMPRAS - SIMULAÇÃO AVULSA

Valor da compra: R$_________

💰 Pontos a ganhar: ___ pontos

Forma de pagamento (simulação):
○ Crédito
○ Débito
● Pix

[Confirmar simulação]

✅ Simulação concluída! Você ganhou ___ pontos.
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

**ATENÇÃO:** Esta tela é para produtos físicos do marketplace. O fluxo de compra aqui é: Produtos → Pagamento → Destinatário → Resumo.

| ID | Requisito | Prioridade |
|----|-----------|------------|
| PROD-01 | **Renomear a aba "Presentes" para "Produtos"** | 🔥 Alta |
| PROD-02 | Exibir catálogo de produtos físicos com imagem, nome, preço em pontos e preço em reais | 🔥 Alta |
| PROD-03 | Cada produto deve ter opções: **"Comprar para mim"** e **"Dar de presente"** | 🔥 Alta |
| PROD-04 | Fluxo de compra em 4 etapas: **Produtos → Pagamento → Destinatário → Resumo** | 🔥 Alta |
| PROD-05 | Dentro do passo **"Pagamento"**, incluir **simulação de pagamento** com opções: débito, crédito, Pix | 🔥 Alta |
| PROD-06 | Adicionar uma seção de **Acompanhamento de Entregas** dentro da aba Produtos | ⚠️ Média |
| PROD-07 | Status de entrega: **"Em retirada" → "Em rota" → "Entregue"** | ⚠️ Média |
| PROD-08 | Adicionar mais produtos ao catálogo | ⚠️ Média |
| PROD-09 | Calcular **rota e frete** usando APIs (Google Maps ou ViaCEP) | 📌 Baixa |
| PROD-10 | Possibilitar **uso de cupons** no frete | 📌 Baixa |
| PROD-11 | Na etapa **"Destinatário"** do fluxo de "Dar de presente", exibir lista de amigos do usuário | 🔥 Alta |
| PROD-12 | Se o amigo selecionado **já tiver endereço cadastrado** no sistema, o endereço deve ser carregado automaticamente | 🔥 Alta |
| PROD-13 | Se o amigo selecionado **não tiver endereço cadastrado**, exibir formulário para digitar o endereço manualmente | 🔥 Alta |
| PROD-14 | Criar uma **aba/sessão "Meus Amigos"** no sistema (pode ficar dentro do Perfil ou como aba separada) | ⚠️ Média |
| PROD-15 | O usuário deve poder **adicionar amigos** pelo CPF, e-mail ou nome de usuário | ⚠️ Média |
| PROD-16 | Cada amigo na lista deve mostrar: nome, foto (se tiver), e se possui endereço cadastrado ou não | ⚠️ Média |
| PROD-17 | O usuário pode **remover amigos** da sua lista | 📌 Baixa |

**Exemplo da tela Produtos:**
```
PRODUTOS

┌─────────────────────────────────────────┐
│ 👕 Camiseta Edição Ouro                 │
│ Camiseta algodão premium                │
│ 1.300 pts ou R$ 129,90                  │
│ [Comprar para mim] [Dar de presente]    │
├─────────────────────────────────────────┤
│ ☕ Caneca FRIK                           │
│ Caneca personalizada 350ml              │
│ 500 pts ou R$ 49,90                     │
│ [Comprar para mim] [Dar de presente]    │
├─────────────────────────────────────────┤
│ 🍵 Kit Café Especial                     │
│ Seleção de cafés premium                │
│ 900 pts ou R$ 89,90                     │
│ [Comprar para mim] [Dar de presente]    │
└─────────────────────────────────────────┘

[Voltar] [Continuar]

📦 ACOMPANHAR ENTREGAS
├── Pedido #001 - Camiseta - Em rota 🚚
├── Pedido #002 - Caneca - Entregue ✅
└── Pedido #003 - Kit Café - Em retirada 📦
```

**Exemplo do fluxo de compra (4 etapas):**
```
Produto: Camiseta Edição Ouro
1. Produtos ✅ → 2. Pagamento → 3. Destinatário → 4. Resumo

PAGAMENTO (simulação)
Valor: R$ 129,90 ou 1.300 pts
Forma de pagamento:
○ Crédito (simular)
○ Débito (simular)
● Pix (simular)
[Voltar] [Avançar]
```

**Exemplo da etapa Destinatário (com amigos):**
```
┌─────────────────────────────────────────────────────┐
│ DAR DE PRESENTE - ESCOLHA O DESTINATÁRIO            │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 👥 SEUS AMIGOS                                      │
│                                                     │
│ ○ 👤 Ana Souza                                      │
│   📍 Endereço cadastrado: Rua das Flores, 123 - SP  │
│                                                     │
│ ○ 👤 Carlos Silva                                   │
│   ⚠️ Endereço não cadastrado - será solicitado      │
│                                                     │
│ ○ ➕ Adicionar novo amigo                           │
│                                                     │
├─────────────────────────────────────────────────────┤
│ OU DIGITAR MANUALMENTE:                             │
│                                                     │
│ Nome do destinatário: [___________________]         │
│ CPF: [___________________]                          │
│ Endereço: [___________________]                     │
│ Cidade/UF: [___________________]                    │
│ CEP: [___________________] (buscar via ViaCEP)     │
│                                                     │
│ [Voltar]                          [Avançar]         │
└─────────────────────────────────────────────────────┘
```

**Exemplo da tela "Meus Amigos" (nova aba ou dentro do Perfil):**
```
MEUS AMIGOS

┌─────────────────────────────────────────────────────┐
│ 🔍 Buscar amigo por nome, CPF ou e-mail            │
│ [___________________________] [Adicionar]           │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 👤 Ana Souza                                        │
│ 📧 ana@email.com                                    │
│ 📍 Endereço cadastrado ✅                           │
│ [Remover]                                          │
│                                                     │
│ 👤 Carlos Silva                                     │
│ 📧 carlos@email.com                                 │
│ 📍 Endereço cadastrado ❌                           │
│ [Remover]                                          │
│                                                     │
│ 👤 Beatriz Lima                                     │
│ 📧 beatriz@email.com                                │
│ 📍 Endereço cadastrado ✅                           │
│ [Remover]                                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Fluxo de "Dar de presente" com amigos:**
```
Dar de presente → Selecionar produto → Escolher destinatário
                                            ↓
                              ┌─────────────┴─────────────┐
                              ↓                           ↓
                    Amigo com endereço            Amigo sem endereço
                    cadastrado ✅                  ou não amigo ❌
                              ↓                           ↓
                    Usar endereço                  Digitar endereço
                    automaticamente                 manualmente
                              ↓                           ↓
                              └─────────────┬─────────────┘
                                            ↓
                                    Pagamento → Resumo
```

**Regras de negócio:**
| Situação | Comportamento |
|----------|---------------|
| Amigo selecionado tem endereço no sistema | Endereço preenchido automaticamente (campo readonly ou oculto) |
| Amigo selecionado NÃO tem endereço no sistema | Exibir formulário para preencher endereço do destinatário |
| Usuário escolhe "Adicionar novo amigo" | Abre modal/formulário para buscar usuário por CPF/e-mail e adicionar à lista |
| Destinatário não é amigo | Usuário digita nome e endereço manualmente (como já funciona) |

**Validação importante:**
- O sistema **não deve permitir** que o usuário veja o endereço de um amigo se não for no contexto de envio de presente (privacidade)
- O amigo deve consentir em receber presentes? (opcional, pode ser implementado depois)

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

## 7. ADMINISTRADOR

| ID | Requisito | Prioridade |
|----|-----------|------------|
| ADM-01 | Garantir que **tudo que for criado pelo administrador** apareça para os usuários comuns | 🔥 Alta |
| ADM-02 | Isso inclui: cupons, produtos, missões, campanhas, eventos | 🔥 Alta |

---

## 8. MISSÕES vs CONQUISTAS (esclarecimento)

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

## 9. APIs PARA INTEGRAÇÃO

| API | Finalidade | Onde será usada | Prioridade |
|-----|------------|-----------------|------------|
| ViaCEP API | Buscar endereço automaticamente ao digitar CEP | Tela de Produtos (fluxo de compra - etapa Destinatário) | ⚠️ Média |
| Google Maps API | Calcular rota e frete dinâmico | Tela de Produtos (acompanhamento de entregas) | 📌 Baixa |
| OpenAI API | Funcionalidades de IA (recomendações, chatbot) | Futuro | 📌 Baixa |

**Recomendação:** Comece com a **ViaCEP API** (grátis e fácil). Google Maps e OpenAI podem ficar para versões futuras.

---

## 10. RESUMO PRIORIZADO POR TELA

| Tela | O que fazer | Prioridade |
|------|-------------|------------|
| **Login/Cadastro** | Adicionar "Cadastre-se" + campos (nome, email, senha, CPF) + validação de CPF + remover envio de foto | 🔥 Alta |
| **Meus Amigos** | Criar nova aba/funcionalidade para gerenciar amigos (adicionar/remover por CPF/e-mail) | ⚠️ Média |
| **Produtos** | Renomear + fluxo 4 etapas + opção "enviar para amigo" com endereço automático | 🔥 Alta |
| **Tela Inicial** | Botão "Registrar compras" (simulação avulsa) + bloco de missões | 🔥 Alta |
| **Mercado Cupons** | Remover "Oportunidades de Troca" | 🔥 Alta |
| **Salas de Troca** | Corrigir bug membros + tornar troca funcional | 🔥 Alta |
| **Admin** | Garantir visibilidade de itens criados | 🔥 Alta |
| **Ranking** | Múltiplas abas + posição do usuário | ⚠️ Média |
| **APIs** | ViaCEP (endereço) | ⚠️ Média |
| **Conquistas** | Badges + ranking específico | 📌 Baixa |
| **APIs avançadas** | Google Maps + OpenAI | 📌 Baixa |

---

## 11. PRÓXIMOS PASSOS SUGERIDOS

1. Remover funcionalidade de envio de foto para validação de identidade
2. Implementar validação de CPF no cadastro (formato e duplicidade)
3. Adicionar tela de cadastro simples na tela de login (campos: nome, email, senha, CPF)
4. **Criar funcionalidade de "Meus Amigos"** (adicionar/remover/buscar por CPF/e-mail)
5. **Implementar no fluxo de Produtos a opção de enviar para amigo com endereço automático**
6. Corrigir bugs urgentes (sala de troca - membros não aparecem)
7. Renomear itens no menu (Presentes → Produtos)
8. Remover "Oportunidades de Troca" do Mercado de Cupons
9. Implementar botão "Registrar compras" na tela inicial com simulador avulso
10. Implementar aba Produtos com catálogo e fluxo de 4 etapas
11. Adicionar simulação de pagamento dentro do fluxo de Produtos
12. Adicionar seção de Acompanhamento de Entregas na aba Produtos
13. Implementar missões com selo de concluídas na tela inicial
14. Melhorar ranking com múltiplas abas
15. Integrar ViaCEP para busca de endereço
16. Adicionar conquistas (badges) como funcionalidade futura

---

## 12. OBSERVAÇÕES FINAIS

- **Cadastro:** Não terá envio de foto. A validação será feita pelo CPF (formato e se já está cadastrado)
- **Meus Amigos:** Nova funcionalidade para gerenciar amigos e facilitar o envio de presentes
- **Produtos - Dar de presente:** Se o amigo já tiver endereço cadastrado, será preenchido automaticamente
- **Registrar compras (tela inicial):** Simulação de compra avulsa (qualquer valor)
- **Simulação de pagamento (Produtos):** Para resgate de produtos físicos do marketplace
- **Acompanhamento de entregas:** Dentro da aba Produtos
- **Aba "Cupom de presente":** Deve ser removida (substituída pelas Salas de Troca)
- **Missões vs Conquistas:** Funcionalidades separadas
- **Ranking:** Tem tela própria (não mexer na tela inicial)

---

**Documento gerado em:** Junho de 2026
**Projeto:** FRIK - Sistema de Fidelização com Gamificação
```

Pronto! Documento completo com todas as atualizações: cadastro com validação de CPF, funcionalidade de amigos e envio automático de endereço ao presentear. É só copiar e salvar como `.md`! 🚀