# EcoRota 101 — API Bun + SQLite

Esta pasta contém a camada de persistência solicitada para o EcoRota 101. O servidor usa **Bun** e o módulo nativo `bun:sqlite`, sem dependências externas para o banco.

## Executar

```bash
bun run bun-server/index.ts
```

Por padrão, a API sobe na porta `3333` e cria o arquivo `ecorota.sqlite` na pasta atual. Para trocar o arquivo do banco, use `ECOROTA_DB=/caminho/arquivo.sqlite`.

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/health` | Verifica se a API e o SQLite estão ativos |
| GET | `/api/occurrences` | Lista ocorrências; aceita `?type=flood`, `waste` ou `power` |
| POST | `/api/occurrences` | Cria uma ocorrência |
| PATCH | `/api/occurrences/:id/confirm` | Adiciona uma confirmação comunitária |

Exemplo de criação:

```bash
curl -X POST http://localhost:3333/api/occurrences \
  -H 'Content-Type: application/json' \
  -d '{"type":"flood","title":"Bueiro transbordando","description":"Água acumulada na esquina","neighborhood":"Pinheiros"}'
```

A interface WebDev roda em seu próprio servidor e mantém uma demonstração offline com `localStorage` para o preview. Em um deploy com proxy reverso, encaminhe `/api` para esta API Bun para ativar a persistência SQLite da interface.
