# Roteiro de Apresentação TCC - FRIK

Este é um roteiro sugerido para a apresentação da banca avaliadora. Como vocês são 4 integrantes (Felipe, Isaac, Kamyla, Ryan), o ideal é que cada um fale sobre uma etapa do projeto de forma natural, mostrando o sistema rodando na prática (Live Demo).

## Introdução e Problema (Sugestão: Felipe - 2 a 3 minutos)
* **Abertura:** Apresente a equipe e o objetivo geral (Um sistema de Fidelização e Gamificação).
* **O Problema:** A dificuldade de pequenos e médios negócios (ex: Frik & Geek Store) em reter clientes. Os clientes compram na loja física por impulso, mas migram para e-commerce buscando preço. O cartão fidelidade de papel antigo não engajava.
* **A Solução:** Em vez de dar pontos básicos, criamos uma plataforma de Gamificação com Níveis (Bronze a Diamante) e um inovador Mercado Peer-to-Peer (onde os usuários trocam cupons entre si). 

## Arquitetura e Decisões Técnicas (Sugestão: Isaac - 2 a 3 minutos)
* **Backend:** Node.js, Express, TypeScript. Destacar a importância do TypeScript para evitar erros estruturais.
* **Banco de Dados:** MySQL 8 com TypeORM. Explicar como as transações são seguras e isoladas (quando alguém faz uma compra ou resgata cupom).
* **Frontend:** Next.js (React) com Tailwind CSS. 
* **Segurança:** Uso de JWT (Tokens) para login e bloqueio de rotas, além de hash bcrypt de 10 rounds para senhas.
* **Dificuldade contornada:** Citar a dificuldade inicial de modelagem de dados no TypeORM e como isso foi resolvido para conectar usuários, níveis e missões (Apêndice B do documento).

## Funcionalidades Chave & Gamificação (Sugestão: Kamyla - 3 minutos + Live Demo)
* **Demonstração do Perfil/Missões:** Abra o site. Mostre a barrinha de nível. Explique como o sistema de **Missões Rápidas** funciona (gatilho psicológico de engajamento).
* **A Vitrine/Presentes:** Mostre como as compras geram pontos e o cliente pode resgatar produtos no "Marketplace" de forma intuitiva, com a opção "Revisar Pedido". Mostre a funcionalidade de "Presentear" (como transferir itens sem perder pontos base do ranking).

## Feirão de Trocas, Admin e Conclusão (Sugestão: Ryan - 3 minutos + Live Demo)
* **O Grande Diferencial:** Mostre a tela do **Feirão de Trocas**. Onde usuários podem propor a troca de um cupom por outro.
* **As Restrições por Nível:** Destaque a regra de negócio (ex: Nível Bronze só troca 1x e apenas com outros Bronzes. Platina/Diamante podem criar salas privadas).
* **Painel Admin:** Mostre rapidamente a visão da loja (Cadastrar novos cupons, eventos, segmentar campanhas).
* **Conclusão Comercial:** "Com custo mensal estimado de infraestrutura em menos de mil reais, o aumento de apenas 25% no ticket médio através do aplicativo cobre os gastos facilmente (ROI alcançado no 3º mês)."
* **Agradecimentos à Banca.**

## Dicas para o dia da Apresentação
- **Deixe o Docker/Projeto rodando localmente** antes da banca chegar. 
- **Tenha duas abas logadas:** Uma com o usuário "Cliente" e outra com o usuário "Admin" para não perder tempo fazendo login ao vivo.
- **Não foquem muito em linhas de código na tela.** A banca se interessa mais em ver a arquitetura desenhada e o software funcionando. Se perguntarem algo de código, aí sim mostrem o Visual Studio. Boa sorte, o projeto está incrível!
