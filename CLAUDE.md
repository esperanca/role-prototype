# rolê - Guia de Eventos Culturais de São Paulo

Site 11ty para curadoria e divulgação de eventos culturais em São Paulo.

## Stack

- **11ty** (Eleventy) - gerador de site estático
- **Nunjucks** - templates
- **Netlify** - deploy automático via git push

## Estrutura

```
/
├── _data/
│   ├── locais.json       # 23 locais cadastrados (lookup por ID)
│   ├── locaisArray.js    # Converte locais para array (paginação)
│   └── metadata.js       # Metadados do site
├── _config/
│   └── filters.js        # Filtros customizados do 11ty
├── _includes/layouts/
│   ├── base.njk          # Layout base (header, footer)
│   ├── event.njk         # Página de evento
│   ├── local.njk         # Página de local/venue
│   └── home.njk          # Home page
├── content/
│   ├── explore/          # Eventos (.md com frontmatter)
│   ├── index.njk         # Home page
│   ├── explore.njk       # Listagem de eventos
│   ├── locais.njk        # Listagem de locais
│   └── locais-pages.njk  # Gerador de páginas de locais
├── css/
│   └── index.css         # Estilos globais
└── eleventy.config.js    # Configuração do 11ty
```

## Modelos de Dados

### Evento (content/explore/*.md)

```yaml
---
title: "Nome do Evento"
date: 2025-12-15           # Data do evento (ISO)
local_id: "sesc-pinheiros" # Referência ao local
tags: ["teatro", "música"]
heroImage: "https://..."   # URL da imagem
---
Conteúdo em markdown...
```

### Local (_data/locais.json)

```json
{
  "sesc-pinheiros": {
    "id": "sesc-pinheiros",
    "nome": "Sesc Pinheiros",
    "endereco": "Rua Paes Leme, 195",
    "bairro": "Pinheiros",
    "tipo": "centro_cultural",
    "descricao": "...",
    "link": "https://...",
    "acessibilidade": true,
    "criancas": true,
    "ativo": true
  }
}
```

## Filtros Customizados

| Filtro | Uso | Descrição |
|--------|-----|-----------|
| `getLocal` | `local_id \| getLocal(locais)` | Busca dados do local por ID |
| `getEventsByLocal` | `events \| getEventsByLocal(id)` | Filtra eventos por local |
| `filterFutureEvents` | `events \| filterFutureEvents` | Apenas eventos futuros |
| `readableDate` | `date \| readableDate(format)` | Formata data com Luxon |

## URLs

| Rota | Fonte |
|------|-------|
| `/` | content/index.njk |
| `/explore/` | content/explore.njk |
| `/explore/{slug}/` | content/explore/*.md |
| `/locais/` | content/locais.njk |
| `/locais/{id}/` | content/locais-pages.njk |
| `/tags/{tag}/` | content/tag-pages.njk |

## Comandos

```bash
npm run build   # Build para produção
npm run start   # Dev server com hot reload
```

## Próximos Passos (Arquitetura de Curadoria)

1. **Agente Node.js** - Scraper de fontes (Guia Folha, SESC, etc.)
2. **Painel de Curadoria** - Interface para aprovar rascunhos
3. **Fluxo**: Scrape → JSON rascunhos → Curadoria → .md no git → Netlify rebuild
