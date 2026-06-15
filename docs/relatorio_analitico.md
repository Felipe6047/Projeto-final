# Relatório Analítico de Alinhamento Técnico — Projeto FRIK
**Objetivo:** Alinhamento final de escopo técnico, correções do professor e redefinição das regras de negócios com base nos novos requisitos de Marketplace, Salas de Troca exclusivas para trocas, remoção de KYC e missões dinâmicas.

---

## 1. Nova Definição do Escopo e Ajustes de Regras

Com base nas últimas especificações do projeto, realizamos um refinamento cirúrgico dos requisitos para alinhar as expectativas da banca e simplificar a complexidade onde necessário:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REDEFINIÇÃO DO ESCOPO FRIK                      │
├───────────────────────────────┬────────────────────────────────────────┤
│ Módulo / Fluxo                │ Regra de Negócio Atualizada            │
├───────────────────────────────┼────────────────────────────────────────┤
│ 1. Cadastro de Usuário        │ Acessível via link "Cadastre-se" na    │
│    (Sign-up)                  │ tela de login. Cadastro padrão com     │
│                               │ Nome, E-mail, Senha e CPF opcional.    │
├───────────────────────────────┼────────────────────────────────────────┤
│ 2. Remoção do KYC             │ Cancelada qualquer validação de        │
│                               │ identidade ou selfie. Sem restrições   │
│                               │ de KYC para cupons ou produtos.        │
├───────────────────────────────┼────────────────────────────────────────┤
│ 3. Mercado de Cupons          │ Foco exclusivo em compra com pontos    │
│    (Microsoft Rewards Style)  │ (Templates). Remoção completa do       │
│                               │ mercado secundário (troca global).     │
├───────────────────────────────┼────────────────────────────────────────┤
│ 4. Salas de Troca Exclusivas  │ O único local para trocas (swap) de    │
│    para Troca de Cupons       │ cupons entre membros será dentro de    │
│                               │ salas de troca ativas (/salas).        │
├───────────────────────────────┼────────────────────────────────────────┤
│ 5. Missões Dinâmicas          │ Carregadas via API. Progresso dinâmico │
│                               │ e selo visual "Concluída" ao fechar.   │
└───────────────────────────────┴────────────────────────────────────────┘
```

---

## 2. Detalhamento e Viabilidade por Módulo

### A. Tela de Cadastro integrada ao Login
* **Como funcionará:** A tela `/login` ([LoginPage.tsx](file:///c:/Users/Aluno/Documents/GitHub/Projeto-final/frontend/src/components/pages/LoginPage.tsx)) exibirá um pequeno link *"Ainda não tem conta? Cadastre-se"*. Ao clicar, exibe o formulário de cadastro na mesma interface ou redireciona para a view de criação de conta. O CPF será um campo opcional.
* **Viabilidade:** **Alta.** Fluxo padrão de autenticação que utiliza a rota `POST /api/auth/registro` já existente no backend.

### B. Remoção do Módulo de Verificação de Identidade (KYC)
* **Como funcionará:** Nenhuma tela de perfil exibirá banners ou modais de verificação documental. Todas as validações no backend que bloqueariam ações por falta de KYC serão excluídas do plano de desenvolvimento.
* **Viabilidade:** **Excelente.** Simplifica o banco de dados e reduz o escopo de interfaces, eliminando riscos de bugs visuais na demonstração.

### C. Missões Dinâmicas no Dashboard
* **Como funcionará:**
  * **Backend:** Criar o endpoint `GET /api/ranking/missoes` que consulta as missões ativas na tabela `missao` e junta com o progresso do usuário logado na tabela `usuario_missao`.
  * **Frontend:** A tela de início ([DashboardPage.tsx](file:///c:/Users/Aluno/Documents/GitHub/Projeto-final/frontend/src/components/pages/DashboardPage.tsx)) consumirá essa rota em tempo real. Se o progresso da missão atingir a meta, exibirá um selo/badge dourado escrito **"Concluída"** ao invés de exibir apenas a barra de progresso.
* **Viabilidade:** **Alta.** Utiliza tabelas que já existem no banco e apenas implementa a rota de leitura cliente e a renderização condicional do selo de sucesso.

### D. Novo Mercado de Cupons (Microsoft Rewards Style)
* **Como funcionará:**
  * Na tela `/mercado-cupons` ([MercadoPage.tsx](file:///c:/Users/Aluno/Documents/GitHub/Projeto-final/frontend/src/components/pages/MercadoPage.tsx)), removeremos a seção *"Disponíveis para troca"*.
  * No lugar, exibiremos a lista de **templates de cupons ativos** criados pelo administrador. Cada um terá seu respectivo preço em pontos.
  * O cliente clica em "Resgatar por X pontos", o backend valida o saldo, deduz os pontos e cria o cupom (`CupomUsuario`) na carteira do cliente.
* **Viabilidade:** **Alta.** Amarra a criação do administrador diretamente no consumo do cliente e remove a poluição visual de trocas globais na loja.

### E. Salas de Troca: Correções de Membros e Trocas Funcionais
* **Correção do Bug de Membros:** O endpoint `GET /api/salas/:codigo` será revisado no backend. Utilizaremos o join de relacionamento do TypeORM (`innerJoin("m.usuario", "u")`) e traremos também o nome do nível do membro (`n.nome AS nivel`). Isso garante que todos os membros que entrarem pelo código apareçam listados no painel de detalhes da sala no frontend.
* **Mecânica de Troca Exclusiva na Sala:** 
  * O painel de detalhes da sala no frontend exibirá uma aba: **"Cupons para Troca"**.
  * Ali aparecerão listados os cupons de membros da sala com status `oferecido_troca`.
  * Os membros daquela sala podem solicitar trocas diretamente entre si clicando em "Solicitar Troca" ao lado do cupom do colega, disparando a transação.
* **Viabilidade:** **Alta.** Concentra a mecânica de trocas (swap) nas salas de membros Platina/Diamante, tornando a funcionalidade de salas extremamente relevante para a gamificação.

---

## 3. Conclusão da Avaliação

As novas diretrizes simplificaram a interface (removendo KYC) e organizaram as regras de negócio de forma muito mais limpa: a loja compra cupons do sistema, e as salas privadas trocam cupons entre usuários. 

O projeto está **arquiteturalmente maduro** para suportar esse escopo com total estabilidade. O plano de implementação foi atualizado para servir de guia único.
