# Como fazer login no Insomnia

O erro `"body_recebido": {}` significa que **nenhum dado foi enviado**.

## Opção 1 — Body JSON (recomendado)

1. Abra **POST Login Cliente**
2. Clique na aba **Body** (não Params!)
3. Selecione **JSON**
4. Cole:

```json
{
  "email": "maria@email.com",
  "senha": "cliente123"
}
```

5. Clique **Send**

## Opção 2 — Params (query string)

1. Aba **Params**
2. Adicione:

| NAME  | VALUE            |
|-------|------------------|
| email | maria@email.com  |
| senha | cliente123       |

3. Clique **Send**

## Depois do login

Copie o `token` da resposta → Environment → cole em `token` → use nas outras rotas.
