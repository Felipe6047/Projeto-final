# Relatório de Inspeção de Cibersegurança - OWASP Top 10

Este relatório consolida as vulnerabilidades e melhorias de segurança identificadas durante a auditoria do projeto FRIK, divididas por etapas de profundidade.

---

## Resumo Executivo
A inspeção encontrou um total de **7 vulnerabilidades arquiteturais/técnicas**:
- **Severidade Alta:** 3 (Armazenamento de JWT inseguro, Chaves Hardcoded e Ausência de Rate Limiting)
- **Severidade Média:** 2 (Falta de Helmet/Headers de Segurança, Invalidação de Sessão client-side)
- **Severidade Baixa:** 2 (Logging de erros sem sanitização, Ausência de re-autenticação para deleção de conta)
- **O que está seguro:** Não foram identificados pontos diretos de SQL Injection (o TypeORM parametrizou adequadamente as queries) nem XSS direto (`dangerouslySetInnerHTML` não utilizado no React).

## Top 5 Ações Mais Urgentes
1. **Migrar o armazenamento do JWT:** Remover do `localStorage` (suscetível a XSS) para Cookies do tipo `HttpOnly/Secure/SameSite=Strict`.
2. **Remover segredos fixos:** Retirar senhas e fallbacks do JWT fixos no `env.ts` e no `docker-compose.yml`.
3. **Instalar Rate Limiting:** Adicionar o `express-rate-limit` no Express para impedir ataques de Força Bruta ou DoS.
4. **Configurar Headers de Segurança:** Implementar o middleware `helmet` no backend Express para proteção de Clickjacking e Sniffing de Mimetypes.
5. **Implementar Revogação de Sessão (Logout Blacklist):** Registrar tokens inativados pelo usuário no banco de dados ao fazer logout, impedindo reutilização até a expiração natural.

---

## 1. Etapa Superficial (Configurações e Dependências)

### 1.1 Credenciais Padrão e Segredos Fixos no Repositório
**Localização:** `docker-compose.yml` (linhas 7, 10, 42, 44) e `backend/src/config/env.ts` (linha 21).
**Descrição:** O sistema define valores padrão para senhas de banco de dados (`frik_pass`) e chaves secretas JWT (`frik-docker-jwt-secret-change-in-production`) diretamente no código/docker-compose.
**Evidência:** 
```yaml
JWT_SECRET: ${JWT_SECRET:-frik-docker-jwt-secret-change-in-production}
```
**Impacto Potencial:** Um atacante pode forjar tokens JWT válidos (A04/A02).
**Severidade:** Alta
**Recomendação:** Remover os fallbacks do arquivo `env.ts` e `docker-compose.yml`.
**Referências:** CWE-798: Use of Hard-coded Credentials.

### 1.2 Ausência de Cabeçalhos de Segurança HTTP (Helmet)
**Localização:** `backend/src/app.ts` (App setup).
**Descrição:** O backend em Express não implementa cabeçalhos HTTP de proteção.
**Impacto Potencial:** A aplicação fica vulnerável a ataques de Clickjacking (A02).
**Severidade:** Média
**Recomendação:** Instalar e configurar o pacote `helmet` no `app.ts`.

### 1.3 Ausência de Proteção contra DoS e Força Bruta
**Localização:** `backend/src/app.ts`
**Descrição:** Não há implementação de Rate Limiting para restringir requisições de um único IP.
**Impacto Potencial:** Atacantes podem realizar varreduras automatizadas e causar DoS (A02/A07).
**Severidade:** Alta
**Recomendação:** Instalar o pacote `express-rate-limit`.

### 1.4 Práticas Básicas de Logging de Segurança
**Localização:** `backend/src/middleware/errorHandler.ts`
**Descrição:** Os erros capturados são enviados apenas para o `console.error(err)`. Não há formatação estruturada.
**Impacto Potencial:** PII pode vazar nos logs brutos (A09).
**Severidade:** Baixa
**Recomendação:** Utilizar uma biblioteca de logging estruturado.

---

## 2. Etapa Moderada (Autenticação e Roteamento)

### 2.1 Armazenamento Inseguro de Token JWT (Local Storage)
**Localização:** `frontend/src/lib/api.ts` (Linha 20).
**Descrição:** O token de autenticação JWT é armazenado no `localStorage` do navegador, tornando-o acessível a qualquer script executado no domínio.
**Evidência:**
```typescript
export function setToken(token: string) {
  localStorage.setItem("frik_token", token);
}
```
**Impacto Potencial:** Se a aplicação frontend sofrer uma injeção de XSS, o atacante poderá roubar o token do usuário facilmente via `localStorage.getItem` e sequestrar a sessão da vítima (A07: Authentication Failures / A05: Injection).
**Severidade:** Alta
**Recomendação:** Migrar o armazenamento do token JWT para Cookies com as flags `HttpOnly`, `Secure` e `SameSite=Strict`. Isso exige modificação na API para enviar o token via cabeçalho `Set-Cookie`.
**Referências:** CWE-312: Cleartext Storage of Sensitive Information.

### 2.2 Sessões não Invalidadas no Servidor (Logout Client-Side)
**Localização:** `frontend/src/context/AuthContext.tsx` (Linha 90) e API de autenticação.
**Descrição:** O processo de logout atual apenas remove o token do `localStorage` no lado do cliente. O servidor não mantém uma "lista negra" (blacklist) de tokens invalidados antes de expirarem (7 dias).
**Evidência:**
```typescript
  const logout = () => {
    clearToken();
    setUser(null);
  };
```
**Impacto Potencial:** Se um token for roubado, o usuário clicar em "Sair" não impede que o atacante continue usando a API até que os 7 dias de expiração passem (A07: Authentication Failures).
**Severidade:** Média
**Recomendação:** Implementar uma tabela de `RevokedTokens` no banco de dados e gravar o token nela ao realizar um POST para `/api/auth/logout`. O middleware de autenticação deve verificar essa lista.
**Referências:** CWE-613: Insufficient Session Expiration.

### 2.3 Ausência de Validação de Re-Autenticação em Ações Sensíveis
**Localização:** `backend/src/routes/admin.routes.ts` e edição de perfis.
**Descrição:** Ações administrativas críticas (ex: exclusão de campanhas ou deleção de contas) não exigem re-autenticação (inserção da senha) ou confirmação de 2FA.
**Impacto Potencial:** Se uma sessão de administrador ou cliente for deixada desbloqueada, outra pessoa no mesmo computador pode causar danos irreversíveis (A01: Broken Access Control).
**Severidade:** Baixa
**Recomendação:** Exigir a senha atual para confirmar ações como `DELETE /auth/me`.
**Referências:** CWE-306: Missing Authentication for Critical Function.

---

## 3. Etapa Profunda (Lógica de Negócios e ORM)

### 3.1 Prevenção Efetiva a SQL Injection
**Localização:** `backend/src/services/*` e Controllers.
**Descrição:** A inspeção focou na análise da montagem de queries SQL via TypeORM. 
**Resultado:** Seguro. A aplicação utiliza adequadamente o `createQueryBuilder` parametrizado. As únicas queries puras (.query()) encontradas estão contidas exclusivamente dentro dos arquivos de migração (`1748265600000-InitialSchema.ts`, etc.), que não recebem input de usuários.
**Severidade:** Mitigado (Não aplicável)
**Referências:** A03:2021-Injection.

### 3.2 Prevenção contra Cross-Site Scripting (XSS)
**Localização:** Frontend (React).
**Descrição:** Buscas profundas no código fonte do frontend não revelaram o uso de métodos arriscados como o `dangerouslySetInnerHTML`.
**Resultado:** Seguro, com ressalva. O React por padrão mitiga injeções XSS escapando as variáveis injetadas no JSX. A ressalva recai sobre a utilização do `localStorage` (item 2.1) que será a maior vítima caso uma biblioteca vulnerável no frontend (A06:2021) possibilite execução de XSS.
**Severidade:** Mitigado por padrão.
**Referências:** A03:2021-Injection.
