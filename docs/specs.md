# Especificações Técnicas de Frontend — Projeto FRIK

Este documento define os padrões visuais, componentes, comportamentos de interface, estados de tela e regras de integração do frontend do sistema **FRIK**.

---

## 1. Padrões de Interface e Design System

### Paleta de Cores e Tipografia
* **Cor Primária:** `#CC9544` (Bronze FRIK / Dourado Premium)
* **Texto Primário:** Neutro de alto contraste (`#FFFFFF` em dark mode / `#1C1B1F` em light mode).
* **Foco Visível:** Contorno de `2px solid #CC9544` com `outline-offset: 2px` para navegação por teclado.
* **Tipografia:** Família de fontes *Inter* ou *Outfit* (Google Fonts) para ar de produto comercial premium.

### Responsividade (Breakpoints)
* **Mobile (até 640px):** Navbar inferior fixo (Início, Mercado, Presentes, Salas, Perfil), grade de coluna única.
* **Tablet (641px a 1024px):** Layout flexível, grades de duas colunas.
* **Desktop (acima de 1024px):** Sidebar lateral fixa de navegação, grades de três ou quatro colunas.

### Acessibilidade (A11y)
* Todos os modais devem conter `role="dialog"`, `aria-modal="true"` e armadilha de foco (focus trap).
* Inputs com `aria-invalid` ativo em caso de erros de validação.
* Navegação por teclado completa em formulários utilizando a tecla `Tab`.

---

## 2. Componentes e Comportamento Visual por Tela

### 2.1 Simulador de Caixa do Lojista (`/simulador-caixa`)
* **Componentes:**
  * Formulário com campo de CPF (com máscara automática `999.999.999-99`).
  * Campo de Valor da Compra (com máscara de moeda `R$ 0,00`).
  * Ações: `[Finalizar e Creditar]` (chamada direta por CPF) e `[Gerar Nota Fiscal (NFC-e)]`.
* **Estados de Tela:**
  * **Loading:** Desabilita botões e exibe um spinner rotativo no botão ativo.
  * **Sucesso:** Exibe extrato da venda simulada com a chave de acesso gerada de 44 dígitos para cópia.

### 2.2 Mercado de Recompensas (`/presentes`)
* **Componentes:**
  * Catálogo de produtos com grid responsivo.
  * Filtro por categorias e barra de pesquisa funcional.
  * Carrinho de Compras flutuante no canto inferior direito com contador de itens.
  * **Checkout Wizard:**
    * Etapa 1: Revisão do Carrinho.
    * Etapa 2: Escolha de Destinatário (`[Resgate Pessoal]` - autopreenche endereço do perfil do usuário; `[Dar de Presente]` - campo autocomplete que busca usuários existentes por e-mail/CPF).
    * Etapa 3: Pagamento Misto (Slider interativo de Pontos vs Reais).
    * Etapa 4: Confirmação e Pagamento (exibe QR Code do PIX simulado e botão para confirmar o pagamento local).
* **Tratamento de Estados Vazios:**
  * Caso o catálogo esteja vazio: mensagem *"Nenhum produto disponível no momento"*.
  * Caso o carrinho esteja vazio: impede avançar para o checkout e exibe aviso instrucional.

### 2.3 Detalhes da Sala de Trocas (`/salas`)
* **Componentes:**
  * Clique em uma sala na lista abre um painel lateral (Drawer) ou modal de detalhes da sala.
  * Exibe: Nome da sala, código de convite, e a lista de membros participantes com seus avatares e níveis.
  * Exibe: Lista de propostas de trocas de cupons criadas especificamente dentro desta sala.

### 2.4 Carteira Digital e KYC (`/perfil`)
* **Componentes:**
  * Card com o saldo da **Carteira Digital** (cashback acumulado em reais).
  * Se `kycStatus` for `"pendente"`, exibe o banner: *"Conta Não Verificada. Complete seu cadastro para resgatar cupons."*
  * **Modal de Validação KYC:**
    * Etapa 1: Digitar/confirmar CPF.
    * Etapa 2: Upload simulado de foto de documento e selfie.
    * Etapa 3: Análise automática simulada (exibe loading de 2 segundos).
    * Etapa 4: Sucesso -> Altera status da conta para `"aprovado"`.

---

## 3. Validações Visuais e Mensagens de Erro

* **CEP:** Ao digitar 8 dígitos no campo CEP, dispara a API do ViaCEP. Enquanto carrega, exibe skeleton nos campos de Rua, Bairro e Cidade. Se falhar, libera digitação manual e exibe toast de aviso.
* **CPF:** Aplica algoritmo real de validação de CPF. Se inválido, o input fica com borda vermelha e exibe texto de ajuda: *"Por favor, informe um CPF válido."*
* **Tratamento de Timeout/Retry:**
  * Se as chamadas HTTP falharem por timeout ou rede, exibe um card de erro centralizado com botão `[Tentar novamente]`.
