# Relatório de Inspeção de Cibersegurança - OWASP Top 10

Este relatório consolida as vulnerabilidades e melhorias de segurança identificadas durante a auditoria do projeto FRIK, divididas por etapas de profundidade.

---

## Resumo Executivo
*(Será preenchido na Etapa 3)*

## Top 5 Ações Mais Urgentes
*(Será preenchido na Etapa 3)*

---

## 1. Etapa Superficial (Configurações e Dependências)

### 1.1 Credenciais Padrão e Segredos Fixos no Repositório
**Localização:** `docker-compose.yml` (linhas 7, 10, 42, 44) e `backend/src/config/env.ts` (linha 21).
**Descrição:** O sistema define valores padrão para senhas de banco de dados (`frik_pass`) e chaves secretas JWT (`frik-docker-jwt-secret-change-in-production`) diretamente no código/docker-compose, o que permite acesso indevido se implementado em produção sem configuração manual.
**Evidência:** 
```yaml
JWT_SECRET: ${JWT_SECRET:-frik-docker-jwt-secret-change-in-production}
MYSQL_PASSWORD: ${MYSQL_PASSWORD:-frik_pass}
```
**Impacto Potencial:** Um atacante pode forjar tokens JWT válidos e acessar contas de usuários/administradores (A04: Cryptographic Failures / A02: Security Misconfiguration).
**Severidade:** Alta
**Recomendação:** Remover os fallbacks do arquivo `env.ts` e `docker-compose.yml`, forçando a quebra da aplicação se as variáveis de ambiente não forem explicitamente fornecidas.
**Referências:** CWE-798: Use of Hard-coded Credentials.

### 1.2 Ausência de Cabeçalhos de Segurança HTTP (Helmet)
**Localização:** `backend/src/app.ts` (App setup).
**Descrição:** O backend em Express não implementa cabeçalhos HTTP de proteção (como HSTS, CSP, X-Frame-Options, X-XSS-Protection). 
**Evidência:** O arquivo `app.ts` apenas faz uso do `cors()` e `express.json()`.
**Impacto Potencial:** A aplicação fica vulnerável a ataques de Clickjacking, MIME Sniffing e falhas na validação do protocolo HTTPS (A02: Security Misconfiguration).
**Severidade:** Média
**Recomendação:** Instalar e configurar o pacote `helmet` no `app.ts`: `app.use(helmet());`
**Referências:** CWE-693: Protection Mechanism Failure.

### 1.3 Ausência de Proteção contra DoS e Força Bruta
**Localização:** `backend/src/app.ts`
**Descrição:** Não há implementação de Rate Limiting para restringir o número de requisições de um único IP, especialmente nas rotas de login.
**Evidência:** Nenhuma dependência como `express-rate-limit` é utilizada em `package.json` ou `app.ts`.
**Impacto Potencial:** Atacantes podem realizar varreduras automatizadas, ataques de força bruta em senhas e causar Negação de Serviço (DoS) sobrecarregando a API (A02/A07).
**Severidade:** Alta
**Recomendação:** Instalar o pacote `express-rate-limit` e aplicá-lo globalmente ou nas rotas de `/api/auth`.
**Referências:** CWE-307: Improper Restriction of Excessive Authentication Attempts.

### 1.4 Práticas Básicas de Logging de Segurança
**Localização:** `backend/src/middleware/errorHandler.ts` (Linha 17).
**Descrição:** Os erros capturados são enviados apenas para o `console.error(err)`. Não há formatação estruturada nem máscara para dados sensíveis.
**Evidência:**
```typescript
console.error(err);
return res.status(500).json({ erro: "Erro interno do servidor" });
```
**Impacto Potencial:** Dados pessoais identificáveis (PII) ou tokens podem vazar nos logs brutos da aplicação se fizerem parte do objeto de erro. Além disso, a falta de log estruturado dificulta a investigação de incidentes (A09: Security Logging and Alerting Failures).
**Severidade:** Baixa
**Recomendação:** Utilizar uma biblioteca de logging estruturado (como Winston ou Pino) e mascarar propriedades sensíveis (senhas, tokens) antes de enviá-las para os logs do servidor.
**Referências:** CWE-532: Insertion of Sensitive Information into Log File.
