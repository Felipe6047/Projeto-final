# Correções do Documento TCC (Baseado nos Feedbacks do Prof. Eduardo)

Abaixo estão os trechos exatos que você deve **copiar e colar** no seu arquivo Word (`.docx`) para substituir os antigos, resolvendo todos os comentários que o professor deixou na lateral.

---

### Correção 1: Capa (Retirar o itálico)
**Onde:** Na folha de rosto, na listagem de Alunos.
**Como deve ficar:**
**Alunos:** Felipe Ferreira dos Santos, Isaac de Azevedo Costa, Kamyla Sousa Santana e Ryan Felipe Coqueiro Oliveira.

---

### Correção 2: Resumo Executivo (Retirar aspas e revisar o texto)
**Onde:** No Resumo Executivo.
**Como deve ficar:**
O sistema resolve um problema que os pequenos e médios negócios, varejos e serviços enfrentam: a dificuldade crescente para reter clientes. As principais funcionalidades desenvolvidas são o sistema de pontos, o mercado de troca de cupons, o sistema de presentes, as regras progressivas por nível, a gamificação avançada e o painel administrativo. 
A stack tecnológica escolhida para o front-end é o framework Next.js; o back-end é desenvolvido em Node.js com o framework Express, TypeScript e TypeORM. O banco de dados relacional escolhido é o MySQL 8. É esperado que o sistema aumente a retenção de clientes e impulsione o ticket médio através do engajamento constante gerado pela gamificação.

---

### Correção 3: Seção 2.1 (Focar no mercado e não em 1 cliente só + tirar espaços duplos)
**Onde:** Em 2.1 Contexto e Problema do Cliente
**Como deve ficar:**
Pequenos e médios comércios varejistas frequentemente enfrentam forte concorrência com grandes e-commerces nacionais. Embora muitas lojas possuam comunidades apaixonadas que frequentam seus espaços físicos (como é o caso de lojas especializadas em jogos de tabuleiro e artigos geek), há uma grande dificuldade em converter esse tráfego e engajamento em vendas recorrentes no ponto de venda local. Os clientes frequentemente utilizam o espaço das lojas para testar produtos, mas acabam finalizando suas compras pela internet em busca de melhores preços. Os programas de fidelidade manuais convencionais adotados pelo mercado (como cartões de papel) mostram-se ineficazes, pois os clientes não veem valor percebido nas recompensas. 
A plataforma FRIK surge para resolver esse gargalo real do varejo (tendo como estudo de caso e validação inicial a Frik & Geek Store Palmas), introduzindo uma economia gamificada com níveis progressivos que premiam o engajamento e um mercado peer-to-peer onde os clientes podem negociar cupons e descontos diretamente, transformando os clientes locais em promotores ativos da loja.

---

### Correção 4: Seção 2.2 (Melhorar o texto e tirar aspas da gamificação / "ranking")
**Onde:** Em 2.2 Objetivo do Sistema
**Como deve ficar:**
O sistema permitirá transformar a experiência de compra do cliente em uma jornada engajadora utilizando mecanismos de gamificação, tais como: sistema de pontuação, progressão por níveis, desbloqueio de conquistas, ranqueamento (ranking) competitivo entre usuários e a troca descentralizada de benefícios. Através dessas mecânicas, o estabelecimento comercial ganha tração na fidelização de clientes e no aumento de seu ticket médio.

---

### Correção 5: Seções 3.1 e Fluxo Lógico (Topologia AWS e S3)
**Onde:** Logo abaixo do **Diagrama de Infraestrutura / Topologia de Rede** (Figura 1) e do **Diagrama de Fluxo Lógico** (Figura 2).
*Como o professor perguntou "Vocês estão utilizando ou utilizarão essa topologia?" e "Vocês estão usando S3", você deve adicionar a seguinte Nota de Esclarecimento abaixo das imagens no Word para não perder pontos:*

**Como deve ficar (adicione este parágrafo abaixo das imagens da Seção 3.1):**
*Nota de Arquitetura:* O diagrama de infraestrutura ilustrado (Figura 1) e o fluxo de upload (Figura 2) representam a **proposta arquitetural de implantação em ambiente de produção** (utilizando nuvem AWS, Load Balancers, instâncias EC2 e buckets S3 para armazenamento de mídias). Contudo, para a fase atual de entrega do MVP (Minimum Viable Product) e homologação do TCC, a topologia em uso opera em uma infraestrutura local conteinerizada (via Docker e Docker Compose). O armazenamento de imagens atualmente é tratado de forma virtualizada por links de CDN estáticos, validando a lógica do sistema sem incorrer nos custos da infraestrutura Cloud (S3/EC2) nesta etapa acadêmica.

---

**Pronto!** Com esses textos você resolve os 5 apontamentos cruciais do professor: tira o itálico do seu grupo, arruma as aspas/português do resumo, generaliza o problema pro mercado de varejo, melhora os espaços, tira as aspas do ranking, e ainda dá uma resposta matadora de engenharia de software sobre porque o desenho usa AWS e S3 mas o projeto do TCC está em Docker local. É só colar no Word!
