# Revisão dos Slides de Apresentação - FRIK

Após análise detalhada do arquivo de apresentação (PDF), foram identificados alguns pontos de atenção que precisam ser corrigidos antes da apresentação final para a banca avaliadora do Senai 2026.

## 1. Alinhamento Tecnológico e de Funcionalidades (O que bate e o que falta)

✅ **O que está perfeito:**
- **O Problema e a Solução:** A dor descrita (cartão de papel que se perde) e a solução (gamificação e níveis) reflete 100% o que construímos no banco de dados e na API.
- **Fluxo do Caixa (Slide 6):** "Digite CPF -> Paga e Confirma -> Recebe pontos". Bate exatamente com o módulo `Simulador de Caixa` que criamos no projeto, onde o lojista bipa/digita o CPF do cliente para gerar os pontos.

⚠️ **O que precisa de atenção/ajuste no discurso:**
- **Sistema de Indicação (Slide 7):** O slide diz *"Ao indicar um amigo, ambos ganham XP"*. No código atual, temos um sistema de **Adicionar Amigos** e **Presentear Amigos** (que rende conquistas e missões), mas não temos um sistema de "link de indicação" que dê pontos automaticamente só por convidar. 
  - *Sugestão:* Mude o texto para *"Presentear amigos: Ao interagir e enviar presentes para amigos, os clientes completam missões e ganham pontos"*, **OU** vocês terão que explicar na banca que a "indicação" é um recurso futuro.

## 2. Tecnologias Faltantes no Slide 8

O slide 8 lista as tecnologias, mas faltam as **principais tecnologias** que sustentam o projeto atual. Vocês devem adicionar (ou mencionar):
- **Frontend:** Falta o ícone do **React** ou **Next.js** (que é o framework que usamos). O slide só mostra HTML/CSS/JS.
- **Backend:** Falta o **Express.js**, que é o servidor web rodando junto com o Node.

## 3. Erros Ortográficos e de Formatação (Revisão Crítica)

Os avaliadores costumam tirar ponto por erros de escrita em TCCs. Corrijam os seguintes textos nos slides:

- **Slide 8 (Tecnologias):**
  - Mude de **Fronte-End** para **Front-end** (ou Frontend).
  - Mude de **Dorcker** para **Docker**.
  - Mude de **Visionamento** para **Versionamento** (ou Controle de Versão).
  - Mude de **Infresturura** para **Infraestrutura**.

- **Slide 9 (Orçamento):**
  - O texto "Banco de dados" está repetido e flutuando no meio do nada do lado direito. Recomendo apagar.
  - A linha **"TOTAL ESTIMADO R$ [___]"** está em branco! Vocês precisam somar os valores. A soma exata dos valores listados é **R$ 9.160,00**.

- **Slide 10 (Fechamento):**
  - Há um pequeno erro gramatical: *"Em resumo nosso proposta e focada..."* 
  - Correção: *"Em resumo **nossa** proposta **é** focada..."*
  - A frase final *"Muito Obrigada Pela Atenção"* está correta caso quem encerre a apresentação seja a Kamyla. Se for um dos meninos ou o grupo todo de forma geral, use *"Muito Obrigado..."*.

---
**Dica para a banca:** Quando forem apresentar o slide 6 (Como funciona), mostrem ou falem da tela de "Registrar Compras" que implementamos, onde o valor da compra é convertido em pontos na hora. Isso vai dar muito peso à apresentação!
