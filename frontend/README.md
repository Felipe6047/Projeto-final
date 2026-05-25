# FRIK — Frontend

Interface do **Sistema de Fidelização com Gamificação**, baseada nos layouts Stitch:

- **Tema Elite (claro)** — `elite_loyalty_system` / Hanken Grotesk
- **Tema Aureum (escuro)** — `aureum_elite` / Plus Jakarta Sans

Cores e estilos preservados (`#CC9544` primary-container, `#F2E8DA` cards no light, etc.).

## Rodar

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

Abra **http://localhost:3000**

- Alternar tema: botão **Elite / Aureum** no header
- Login cliente: `/login` — `ana@frik.demo` / `senha123`
- Login admin: `/login` — `admin@frik.demo` / `senha123` → redireciona para `/admin`

## Páginas

| Rota | Layout Stitch |
|------|----------------|
| `/` | dashboard_frik_standardized_light / dark |
| `/mercado-cupons` | mercado_de_cupons_* |
| `/presentes` | enviar_presente_* |
| `/ranking` | ranking_beneficios_* |
| `/login` | Perfil / autenticação |

### Painel administrativo

| Rota | Função |
|------|--------|
| `/admin` | Dashboard (KPIs + segmentação) |
| `/admin/campanhas` | CRUD campanhas |
| `/admin/cupons` | CRUD templates de cupom |
| `/admin/produtos` | CRUD catálogo |
| `/admin/missoes` | CRUD missões |
| `/admin/eventos` | CRUD eventos sazonais |

## API

Configure `NEXT_PUBLIC_API_URL` apontando para o backend (`http://localhost:3333/api`).
