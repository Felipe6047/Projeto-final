# FRIK — Sistema de Fidelização com Gamificação
## Documento de Requisitos Funcionais e Não Funcionais

**Projeto:** FRIK  
**Tipo:** Sistema Web de Fidelização de Clientes com Gamificação  
**Stack:** Node.js · TypeScript · Express · MySQL 8 · Next.js · JWT  
**Data:** Maio de 2026

---

## 1. Visão Geral do Sistema

O **FRIK** é uma plataforma de fidelização de clientes baseada em gamificação. Os usuários acumulam pontos por meio de compras e missões, evoluem entre níveis de fidelidade (Bronze → Prata → Ouro → Platina → Diamante), trocam cupons com outros clientes, presenteiam amigos e resgatam produtos no marketplace interno.

---

## 2. Requisitos Funcionais (RF)

> Requisitos funcionais descrevem **o que o sistema deve fazer**.

---

### RF01 — Autenticação e Controle de Acesso

- **RF01.1** — O sistema deve permitir que o usuário faça login com e-mail e senha.
- **RF01.2** — O sistema deve autenticar sessões via token JWT com validade configurável.
- **RF01.3** — O sistema deve diferenciar dois papéis de usuário: **cliente** e **admin**.
- **RF01.4** — Rotas administrativas devem ser protegidas e acessíveis apenas a usuários com papel `admin`.
- **RF01.5** — O sistema deve bloquear o acesso de usuários com conta inativa (`ativo = false`).
- **RF01.6** — As senhas devem ser armazenadas com hash bcrypt (custo mínimo de 10 rounds).

---

### RF02 — Gerenciamento de Usuários

- **RF02.1** — Cada usuário deve possuir: nome, e-mail, telefone, CPF, senha, nível de fidelidade, saldo de pontos e papel.
- **RF02.2** — O sistema deve manter um histórico de pontos do usuário, registrando origem e variação a cada movimentação.
- **RF02.3** — O sistema deve associar endereços de entrega ao usuário.
- **RF02.4** — O sistema deve exibir ao cliente seu saldo de pontos, nível atual e progresso para o próximo nível.

---

### RF03 — Níveis de Fidelidade

- **RF03.1** — O sistema deve suportar cinco níveis de fidelidade ordenados: Bronze, Prata, Ouro, Platina e Diamante.
- **RF03.2** — Cada nível deve definir: pontos mínimos para atingi-lo, limite de trocas por mês e permissões de presentear.
- **RF03.3** — O sistema deve atualizar automaticamente o nível do usuário conforme o saldo de pontos acumulado.
- **RF03.4** — Clientes no nível Bronze só podem trocar cupons com outros usuários do mesmo nível.
- **RF03.5** — Clientes nos níveis Ouro e acima podem presentear produtos com valor máximo configurável por nível.
- **RF03.6** — Clientes nos níveis Platina e Diamante podem criar salas de troca.

---

### RF04 — Pontuação e Compras

- **RF04.1** — O sistema deve registrar compras realizadas pelo cliente.
- **RF04.2** — Cada compra deve gerar pontos ao cliente com base em uma taxa de conversão configurável.
- **RF04.3** — O sistema deve registrar todo o histórico de variações de pontos (crédito e débito) com motivo e data.

---

### RF05 — Cupons

- **RF05.1** — O administrador deve poder criar templates de cupons com título, categoria, desconto percentual ou fixo, valor mínimo e prazo de validade.
- **RF05.2** — Cupons devem ser atribuídos a usuários com código único e data de validade.
- **RF05.3** — Um cupom pode ter os estados: disponível, usado, expirado, em oferta de troca, aceito, recusado ou presenteado.
- **RF05.4** — O sistema deve listar os cupons disponíveis do cliente autenticado.
- **RF05.5** — O sistema deve invalidar automaticamente cupons com data de validade expirada.

---

### RF06 — Troca de Cupons

- **RF06.1** — O cliente deve poder oferecer um cupom para troca, especificando o cupom desejado em retorno.
- **RF06.2** — O cliente receptor pode aceitar ou recusar uma proposta de troca.
- **RF06.3** — Ao aceitar a troca, o sistema deve transferir automaticamente os cupons entre os usuários.
- **RF06.4** — O sistema deve controlar o limite de trocas por mês por usuário, conforme seu nível de fidelidade.
- **RF06.5** — Clientes de nível Bronze só podem realizar trocas com outros clientes do mesmo nível.
- **RF06.6** — O sistema deve suportar **Salas de Troca** criadas por usuários Platina/Diamante, permitindo trocas em grupo.
- **RF06.7** — Salas de troca devem ter lista de membros e propostas associadas.

---

### RF07 — Sistema de Presentes

- **RF07.1** — Clientes dos níveis Prata e acima devem poder presentear cupons a outros usuários.
- **RF07.2** — Clientes dos níveis Ouro e acima devem poder presentear produtos do marketplace.
- **RF07.3** — Presentes de produto devem respeitar o valor máximo configurável por nível.
- **RF07.4** — O sistema deve registrar pedidos de presente com itens, destinatário, endereço e status de entrega.
- **RF07.5** — Presentes devem poder conter múltiplos itens (cupons e/ou produtos).

---

### RF08 — Marketplace / Resgate de Produtos

- **RF08.1** — O sistema deve exibir um catálogo de produtos disponíveis para resgate.
- **RF08.2** — Cada produto deve ter preço em reais e preço em pontos.
- **RF08.3** — O cliente deve poder resgatar produtos utilizando seu saldo de pontos.
- **RF08.4** — O sistema deve controlar o estoque dos produtos e impedir resgates quando esgotado.

---

### RF09 — Missões

- **RF09.1** — O administrador deve poder criar missões com título, descrição, pontos de recompensa, meta e tipo (compras, trocas, presentes ou pontos).
- **RF09.2** — O sistema deve rastrear o progresso do cliente em cada missão.
- **RF09.3** — Ao concluir uma missão, o sistema deve creditar automaticamente os pontos de recompensa ao cliente.
- **RF09.4** — O sistema deve exibir ao cliente suas missões ativas, concluídas e pendentes.

---

### RF10 — Conquistas (Badges)

- **RF10.1** — O sistema deve suportar conquistas (badges) desbloqueáveis por ações específicas, como presentear 5 amigos ou concluir 10 trocas.
- **RF10.2** — Conquistas desbloqueadas devem ser registradas por usuário com data de obtenção.
- **RF10.3** — O sistema deve exibir as conquistas do cliente em seu perfil.

---

### RF11 — Ranking

- **RF11.1** — O sistema deve exibir um ranking de clientes ordenado por saldo de pontos.
- **RF11.2** — O sistema deve indicar a posição atual do cliente autenticado no ranking.

---

### RF12 — Notificações

- **RF12.1** — O sistema deve enviar notificações internas ao usuário para eventos relevantes, como troca recebida, presente recebido e missão concluída.
- **RF12.2** — O sistema deve listar as notificações não lidas do cliente.
- **RF12.3** — O cliente deve poder marcar notificações como lidas.

---

### RF13 — Campanhas e Eventos Sazonais

- **RF13.1** — O administrador deve poder criar campanhas segmentadas por nível de fidelidade e período de vigência.
- **RF13.2** — O administrador deve poder criar eventos sazonais que concedem trocas extras a todos os usuários durante um período.
- **RF13.3** — O sistema deve aplicar automaticamente os benefícios da campanha ou evento durante sua vigência.
- **RF13.4** — O administrador deve poder ativar, editar e desativar campanhas e eventos.

---

### RF14 — Painel Administrativo

- **RF14.1** — O administrador deve ter acesso a um dashboard com métricas gerais do sistema (usuários, trocas, pontos, etc.).
- **RF14.2** — O administrador deve poder visualizar relatórios de segmentação de usuários por nível.
- **RF14.3** — O administrador deve gerenciar (criar, editar, excluir) templates de cupons.
- **RF14.4** — O administrador deve gerenciar (criar, editar, excluir) produtos do marketplace.
- **RF14.5** — O administrador deve gerenciar (criar, editar, excluir) missões.
- **RF14.6** — O administrador deve gerenciar (criar, editar, excluir) campanhas e eventos sazonais.

---

## 3. Requisitos Não Funcionais (RNF)

> Requisitos não funcionais descrevem **como o sistema deve se comportar**.

---

### RNF01 — Segurança

- **RNF01.1** — As senhas dos usuários devem ser armazenadas exclusivamente como hash bcrypt com custo mínimo de 10.
- **RNF01.2** — A autenticação deve utilizar tokens JWT assinados com chave secreta configurável via variável de ambiente.
- **RNF01.3** — Todas as rotas que manipulam dados sensíveis devem exigir token JWT válido no cabeçalho `Authorization`.
- **RNF01.4** — As rotas administrativas devem verificar o papel `admin` do usuário autenticado antes de processar a requisição.
- **RNF01.5** — Dados sensíveis como senhas e chaves JWT não devem ser versionados em repositórios Git.
- **RNF01.6** — O sistema deve validar e sanitizar todos os dados de entrada via biblioteca Zod antes de processá-los.

---

### RNF02 — Desempenho

- **RNF02.1** — O sistema deve responder às requisições da API em até **500ms** em condições normais de carga.
- **RNF02.2** — O banco de dados deve utilizar conexão em pool para evitar sobrecarga de conexões simultâneas.
- **RNF02.3** — Consultas ao banco de dados devem utilizar índices nas colunas de busca frequente (e-mail, nível, status).

---

### RNF03 — Disponibilidade e Confiabilidade

- **RNF03.1** — O sistema deve tratar erros de forma centralizada, retornando respostas HTTP padronizadas.
- **RNF03.2** — O servidor deve utilizar nodemon em ambiente de desenvolvimento para reinício automático após falhas.
- **RNF03.3** — O sistema deve registrar em log os erros críticos para facilitar o diagnóstico.

---

### RNF04 — Manutenibilidade

- **RNF04.1** — O código deve ser escrito em **TypeScript** com tipagem estrita habilitada.
- **RNF04.2** — A arquitetura deve separar responsabilidades em camadas: rotas, serviços, entidades e utilitários.
- **RNF04.3** — O esquema do banco de dados deve ser gerenciado por sistema de migrations versionado.
- **RNF04.4** — A API deve ser documentada via **OpenAPI 3 / Swagger UI**, acessível em `/api/docs`.
- **RNF04.5** — O projeto deve incluir testes unitários e de integração com cobertura mínima verificável via Jest.

---

### RNF05 — Usabilidade

- **RNF05.1** — O frontend deve ser responsivo, funcionando adequadamente em dispositivos móveis e desktops.
- **RNF05.2** — O sistema deve oferecer suporte a tema claro e escuro (dark mode).
- **RNF05.3** — Mensagens de erro exibidas ao usuário devem ser claras, em português, e indicar a ação corretiva.
- **RNF05.4** — O tempo de carregamento das páginas principais deve ser inferior a **2 segundos**.

---

### RNF06 — Portabilidade e Configurabilidade

- **RNF06.1** — Todas as configurações sensíveis e de ambiente (host do banco, porta, segredo JWT, etc.) devem ser definidas via arquivo `.env`.
- **RNF06.2** — A taxa de conversão de pontos deve ser configurável via variável de ambiente (`TAXA_TROCA_PONTOS`).
- **RNF06.3** — O sistema deve funcionar em sistemas operacionais Windows, Linux e macOS sem alterações no código.

---

### RNF07 — Escalabilidade

- **RNF07.1** — A API deve ser stateless, permitindo execução em múltiplas instâncias sem compartilhamento de estado em memória.
- **RNF07.2** — O banco de dados deve suportar crescimento do volume de usuários e transações sem refatoração da camada de dados.

---

### RNF08 — Padrões e Conformidade

- **RNF08.1** — A API deve seguir os princípios REST, utilizando os métodos HTTP (GET, POST, PUT, DELETE) de acordo com sua semântica.
- **RNF08.2** — As respostas da API devem seguir um formato JSON padronizado com campos `ok`, `data` e `error`.
- **RNF08.3** — Os códigos de status HTTP devem ser utilizados corretamente: 200, 201, 400, 401, 403, 404 e 500.

---

## 4. Resumo

O projeto FRIK possui ao todo **87 requisitos** levantados a partir da análise do código-fonte:

- **58 Requisitos Funcionais** distribuídos em 14 grupos (RF01 a RF14)
- **29 Requisitos Não Funcionais** distribuídos em 8 grupos (RNF01 a RNF08)

---

*Documento gerado com base na análise do código-fonte do projeto FRIK (backend e frontend).*
