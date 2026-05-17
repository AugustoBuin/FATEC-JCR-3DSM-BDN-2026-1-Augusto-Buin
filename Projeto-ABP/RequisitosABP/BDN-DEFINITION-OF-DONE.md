# BDN — Definition of Done

**Sistema:** Gestão de Leads — 1000 Valle Multimarcas (MongoDB)
**Disciplina:** Banco de Dados Não Relacional — Prof.ª Lucineide
**Fonte primária:** `BDN-Requisitos do Projeto.pdf`

> Use este arquivo após cada implementação. Cada item é binário e verificável — ou passa ou não passa.

---

## Status Rápido

| Marco | Data | Status |
|-------|------|--------|
| Dia 1 — Leitura + definição de coleções | 04/05/2026 | — |
| Dia 2 — Modelagem (Embedding vs Referencing) | 11/05/2026 | — |
| Dia 3 — Inserção de dados + consultas | 18/05/2026 | — |
| Dia 4 — Aggregations + finalização + apresentação | 25/05/2026 | — |
| Entrega `BDN-Documento-ABP.pdf` | antes do Dia 4 | — |

---

## 1. Coleções Obrigatórias

> Referência: BDN §3.1 + `nosql-structure.json`

### 1.1 `clientes`

| Campo | Tipo | Restrição |
|-------|------|-----------|
| `_id` | UUID / ObjectId | único |
| `name` | String | obrigatório |
| `phone` | String | único, formato: `55` + DDD + 9 dígitos |
| `email` | String | formato válido |
| `cpf` | String | exatamente 11 dígitos |
| `address` | String | — |
| `createdAt` | Date | gerado automaticamente |

```js
// Verificar que a coleção existe e a estrutura está correta
db.clientes.findOne()

// Verificar índice único em phone
db.clientes.getIndexes()

// Verificar volume mínimo
db.clientes.countDocuments() // deve retornar >= 5
```

- [ ] Coleção `clientes` existe no banco
- [ ] Todos os campos da tabela acima presentes em ao menos um documento
- [ ] Campo `phone` tem índice único criado
- [ ] `countDocuments()` retorna 5 ou mais

---

### 1.2 `leads`

| Campo | Tipo | Restrição |
|-------|------|-----------|
| `_id` | UUID / ObjectId | único |
| `clientId` | ObjectId | referência a `clientes._id` (obrigatório) |
| `userId` | ObjectId | referência a `usuarios._id` — atendente responsável |
| `lojaId` | ObjectId | referência a `lojas._id` |
| `source` | String (enum) | `'Facebook' \| 'Instagram' \| 'Mercado Livre' \| 'Webmotors' \| 'WhatsApp' \| 'Visita presencial' \| 'Telefone' \| 'Formulário digital'` |
| `subject` | String | assunto/interesse do cliente |
| `createdAt` | Date | gerado automaticamente |
| `updatedAt` | Date | atualizado em cada mudança |

```js
// Verificar estrutura
db.leads.findOne()

// Verificar índices compostos
db.leads.getIndexes()

// Verificar volume mínimo
db.leads.countDocuments() // deve retornar >= 10

// Verificar que todos os leads têm clientId, userId e lojaId
db.leads.find({
  $or: [
    { clientId: { $exists: false } },
    { userId: { $exists: false } },
    { lojaId: { $exists: false } }
  ]
}) // deve retornar vazio
```

- [ ] Coleção `leads` existe no banco
- [ ] Campos `clientId`, `userId`, `lojaId` presentes e populados em todos os documentos
- [ ] Campo `source` contém apenas valores do enum definido
- [ ] Índices em `userId`, `lojaId` criados
- [ ] `countDocuments()` retorna 10 ou mais

---

### 1.3 `usuarios`

| Campo | Tipo | Restrição |
|-------|------|-----------|
| `_id` | UUID / ObjectId | único |
| `name` | String | obrigatório |
| `email` | String | único, formato válido |
| `role` | String (enum) | `'admin' \| 'gerente geral' \| 'gerente de equipe' \| 'atendente'` |
| `passwordHash` | String | hash bcrypt |
| `createdAt` | Date | gerado automaticamente |
| `updatedAt` | Date | atualizado em cada mudança |

```js
// Verificar estrutura
db.usuarios.findOne()

// Verificar índice único em email
db.usuarios.getIndexes()

// Verificar volume mínimo
db.usuarios.countDocuments() // deve retornar >= 5

// Verificar que passwordHash nunca é senha em texto plano
// (verificação manual: o campo não deve ter menos de 40 caracteres)
db.usuarios.findOne({}, { passwordHash: 1 })
```

- [ ] Coleção `usuarios` existe no banco
- [ ] Campo `email` tem índice único criado
- [ ] Campo `role` contém apenas valores do enum definido
- [ ] Campo `passwordHash` contém hash (não senha em texto plano)
- [ ] Ao menos um usuário com `role: 'atendente'` e um com `role: 'gerente de equipe'`
- [ ] `countDocuments()` retorna 5 ou mais

---

### 1.4 `negociacoes`

> Coleção standalone — satisfaz o requisito de coleção separada. O array `historico` (embedding) satisfaz o requisito de uso de Embedding.

| Campo | Tipo | Restrição |
|-------|------|-----------|
| `_id` | UUID / ObjectId | único |
| `leadId` | ObjectId | referência a `leads._id` (obrigatório) |
| `importance` | String (enum) | `'frio' \| 'morno' \| 'quente'` |
| `isOpen` | Boolean | `true` = negociação ativa |
| `status` | String (enum) | `'contato inicial' \| 'em negociação' \| 'proposta enviada' \| 'teste drive' \| 'fechado - vendido' \| 'fechado - não vendido'` |
| `historico` | Array (embedded) | ver estrutura abaixo |
| `createdAt` | Date | gerado automaticamente |
| `updatedAt` | Date | atualizado em cada mudança |

**Estrutura de cada item em `historico` (Embedding):**

```js
{
  status: String,       // valor novo de status
  importance: String,   // valor novo de importance
  changedAt: Date,
  changedBy: ObjectId   // referência a usuarios._id
}
```

```js
// Verificar estrutura completa
db.negociacoes.findOne()

// Verificar que historico é um array com ao menos 1 item
db.negociacoes.find({ "historico.0": { $exists: false } }) // deve retornar vazio

// Verificar que só existe 1 negociação ativa por lead
db.negociacoes.aggregate([
  { $match: { isOpen: true } },
  { $group: { _id: "$leadId", total: { $sum: 1 } } },
  { $match: { total: { $gt: 1 } } }
]) // deve retornar vazio — regra de negócio crítica

// Verificar volume mínimo
db.negociacoes.countDocuments() // deve retornar >= 10
```

- [ ] Coleção `negociacoes` existe como coleção standalone (não apenas embutida em `leads`)
- [ ] Campo `leadId` presente e populado em todos os documentos
- [ ] Campo `isOpen` presente e do tipo boolean
- [ ] Array `historico` não está vazio em nenhum documento
- [ ] `status` contém apenas valores do enum definido
- [ ] `importance` contém apenas valores do enum definido
- [ ] Nenhum lead tem mais de uma negociação com `isOpen: true` (verificar com o aggregate acima)
- [ ] Ao menos 1 negociação com `isOpen: false` (negociação encerrada)
- [ ] `countDocuments()` retorna 10 ou mais

---

### 1.5 `logs`

> Equivalente ao `logEventos` do `nosql-structure.json`. O nome da coleção pode ser `logs` ou `logEventos` — o importante é ser consistente.

| Campo | Tipo | Restrição |
|-------|------|-----------|
| `_id` | UUID / ObjectId | único |
| `userId` | ObjectId | referência a `usuarios._id` |
| `eventType` | String | ex: `'lead.created'`, `'negociacao.updated'`, `'login'` |
| `eventPayload` | Object (embedded) | ver estrutura abaixo |
| `createdAt` | Date | gerado automaticamente |

**Estrutura de `eventPayload` (Embedding):**

```js
{
  targetId: ObjectId,   // ID do recurso afetado
  changes: {
    before: { /* campos antes */ },
    after:  { /* campos depois */ }
  }
}
```

```js
// Verificar estrutura
db.logs.findOne()

// Verificar volume mínimo
db.logs.countDocuments() // deve retornar >= 10

// Verificar variedade de eventType
db.logs.distinct("eventType") // deve ter ao menos 3 tipos diferentes
```

- [ ] Coleção `logs` (ou `logEventos`) existe no banco
- [ ] Campo `userId` presente e populado em todos os documentos
- [ ] Campo `eventType` tem ao menos 3 valores distintos nos dados inseridos
- [ ] Campo `eventPayload` é um objeto com `targetId` e `changes`
- [ ] `countDocuments()` retorna 10 ou mais

---

### 1.6 `lojas`

| Campo | Tipo | Restrição |
|-------|------|-----------|
| `_id` | UUID / ObjectId | único |
| `name` | String | obrigatório |
| `address` | String | endereço físico da loja |
| `city` | String | cidade |
| `createdAt` | Date | gerado automaticamente |

```js
// Verificar estrutura
db.lojas.findOne()

// Verificar volume mínimo
db.lojas.countDocuments() // deve retornar >= 3
```

- [ ] Coleção `lojas` existe como coleção standalone (distinta de `times`/equipes)
- [ ] Campos `name` e `address` presentes em todos os documentos
- [ ] `countDocuments()` retorna 3 ou mais

---

## 2. Regras de Negócio

> Referência: BDN §3.2

### 2.1 Cada lead vinculado a um cliente

```js
// Todo lead deve ter um clientId que resolve para um documento existente em clientes
db.leads.aggregate([
  {
    $lookup: {
      from: "clientes",
      localField: "clientId",
      foreignField: "_id",
      as: "cliente"
    }
  },
  { $match: { cliente: { $size: 0 } } } // leads sem cliente vinculado
]) // deve retornar vazio
```

- [ ] Nenhum lead existe sem um `clientId` válido
- [ ] O `$lookup` acima retorna 0 documentos

---

### 2.2 Cada lead vinculado a uma loja e a um atendente

```js
// Nenhum lead sem lojaId ou userId
db.leads.find({
  $or: [
    { lojaId: { $exists: false } },
    { userId: { $exists: false } }
  ]
}) // deve retornar vazio

// Verificar que os userId resolvem para usuários com role 'atendente'
db.leads.aggregate([
  {
    $lookup: {
      from: "usuarios",
      localField: "userId",
      foreignField: "_id",
      as: "atendente"
    }
  },
  { $match: { atendente: { $size: 0 } } }
]) // deve retornar vazio
```

- [ ] Todos os leads têm `lojaId` e `userId` populados
- [ ] Todos os `userId` referenciados existem na coleção `usuarios`
- [ ] Todos os `lojaId` referenciados existem na coleção `lojas`

---

### 2.3 Apenas uma negociação ativa por lead

```js
// Verificação da regra mais crítica do sistema
db.negociacoes.aggregate([
  { $match: { isOpen: true } },
  { $group: { _id: "$leadId", total: { $sum: 1 } } },
  { $match: { total: { $gt: 1 } } }
]) // deve retornar vazio — se retornar algo, a regra está violada
```

- [ ] O aggregate acima retorna 0 documentos

---

### 2.4 Histórico de negociação registrado

```js
// Verificar que nenhuma negociação tem historico vazio
db.negociacoes.find({ $or: [
  { historico: { $exists: false } },
  { historico: { $size: 0 } }
] }) // deve retornar vazio

// Verificar que o historico contém o campo changedAt
db.negociacoes.findOne({ "historico.0": { $exists: true } }, { "historico": 1 })
```

- [ ] Todas as negociações têm `historico` com ao menos 1 entrada
- [ ] Cada entrada do `historico` contém `status`, `changedAt`, e `changedBy`

---

### 2.5 Valores de status e importância dentro dos enums definidos

```js
// Verificar status inválidos em negociacoes
const statusValidos = [
  'contato inicial', 'em negociação', 'proposta enviada',
  'teste drive', 'fechado - vendido', 'fechado - não vendido'
]
db.negociacoes.find({ status: { $nin: statusValidos } }) // deve retornar vazio

// Verificar importance inválida
const importanciaValida = ['frio', 'morno', 'quente']
db.negociacoes.find({ importance: { $nin: importanciaValida } }) // deve retornar vazio

// Verificar source inválida em leads
const sourcesValidas = ['Facebook', 'Instagram', 'Mercado Livre', 'Webmotors', 'WhatsApp', 'Visita presencial', 'Telefone', 'Formulário digital']
db.leads.find({ source: { $nin: sourcesValidas } }) // deve retornar vazio
```

- [ ] Nenhum documento em `negociacoes` tem `status` fora do enum
- [ ] Nenhum documento em `negociacoes` tem `importance` fora do enum
- [ ] Nenhum documento em `leads` tem `source` fora do enum

---

## 3. Modelagem — Embedding vs Referencing

> Referência: BDN §3.3 (ponto chave da avaliação)

### 3.1 Embedding (dados acessados sempre juntos, sem lifecycle próprio)

| Localização | Dado embutido | Justificativa |
|-------------|---------------|---------------|
| `negociacoes.historico` | Array de `{ status, importance, changedAt, changedBy }` | O histórico sempre é lido junto com a negociação. Nunca é consultado de forma independente. Embutir elimina joins e melhora a performance de leitura. |
| `logs.eventPayload` | Objeto com `targetId`, `before` e `after` | O payload é parte integral do log. Não tem existência fora do evento que o gerou. |

```js
// Confirmar embedding em negociacoes
db.negociacoes.findOne({}, { historico: 1 })
// Resultado esperado: documento com campo 'historico' contendo array de objetos

// Confirmar embedding em logs
db.logs.findOne({}, { eventPayload: 1 })
// Resultado esperado: documento com campo 'eventPayload' contendo objeto com 'changes'
```

- [ ] `negociacoes.historico` é um array de objetos embutido (não uma coleção separada)
- [ ] `logs.eventPayload` é um objeto embutido (não uma coleção separada)

---

### 3.2 Referencing (entidades com lifecycle próprio ou reusadas em múltiplos documentos)

| Campo | Aponta para | Justificativa |
|-------|-------------|---------------|
| `leads.clientId` | `clientes._id` | Um cliente existe independentemente dos seus leads. Pode ter múltiplos leads. Referenciar evita duplicação dos dados do cliente. |
| `leads.userId` | `usuarios._id` | O atendente existe independentemente dos leads que atende. Um atendente pode atender muitos leads. |
| `leads.lojaId` | `lojas._id` | A loja existe independentemente dos leads gerados nela. |
| `negociacoes.leadId` | `leads._id` | A negociação referencia seu lead de origem. Lead e negociação têm lifecycles separados. |
| `logs.userId` | `usuarios._id` | O usuário que gerou o evento existe independentemente. |

```js
// Verificar que todas as referências de leads resolvem
db.leads.aggregate([
  { $lookup: { from: "clientes", localField: "clientId", foreignField: "_id", as: "c" } },
  { $match: { c: { $size: 0 } } }
]) // vazio = todas as referências resolvem

db.leads.aggregate([
  { $lookup: { from: "usuarios", localField: "userId", foreignField: "_id", as: "u" } },
  { $match: { u: { $size: 0 } } }
]) // vazio

db.leads.aggregate([
  { $lookup: { from: "lojas", localField: "lojaId", foreignField: "_id", as: "l" } },
  { $match: { l: { $size: 0 } } }
]) // vazio

db.negociacoes.aggregate([
  { $lookup: { from: "leads", localField: "leadId", foreignField: "_id", as: "lead" } },
  { $match: { lead: { $size: 0 } } }
]) // vazio
```

- [ ] Todos os `$lookup` acima retornam 0 documentos (nenhuma referência quebrada)
- [ ] Nenhum `clientId`, `userId`, `lojaId`, ou `leadId` é `null` ou ausente

---

## 4. Volume Mínimo de Dados

> Referência: BDN §3.4

| Coleção | Mínimo exigido | Comando de verificação |
|---------|----------------|------------------------|
| `clientes` | 5 | `db.clientes.countDocuments()` |
| `leads` | 10 | `db.leads.countDocuments()` |
| `negociacoes` | 10 | `db.negociacoes.countDocuments()` |
| `usuarios` | 5 | `db.usuarios.countDocuments()` |
| `logs` | 10 | `db.logs.countDocuments()` |
| `lojas` | 3 | `db.lojas.countDocuments()` |

**Verificação de coerência dos dados:**

```js
// Ao menos 3 sources distintas nos leads
db.leads.distinct("source").length // >= 3

// Ao menos 2 importâncias distintas
db.negociacoes.distinct("importance").length // >= 2

// Ao menos 1 negociação encerrada
db.negociacoes.countDocuments({ isOpen: false }) // >= 1

// Ao menos 1 negociação "fechado - vendido" (para taxa de conversão fazer sentido)
db.negociacoes.countDocuments({ status: "fechado - vendido" }) // >= 1

// Ao menos 2 atendentes diferentes nos leads
db.leads.distinct("userId").length // >= 2
```

- [ ] Todos os `countDocuments()` atingem o mínimo exigido
- [ ] Dados são internamente consistentes (IDs cruzados válidos entre coleções)
- [ ] Há variedade suficiente nos dados para que os dashboards (Seção 6) produzam resultados não-triviais

---

## 5. Consultas Obrigatórias

> Referência: BDN §3.5

### 5.1 `$and` — Leads por origem e status de negociação

```js
// Leads captados via Instagram que ainda estão em negociação ativa
db.leads.find({
  $and: [
    { source: "Instagram" },
    { lojaId: { $exists: true } }
  ]
})
```

- [ ] Query executada sem erro
- [ ] Retorna apenas leads onde AMBAS as condições são verdadeiras
- [ ] Resultado não está vazio (garantir pelo menos 1 lead via Instagram nos dados inseridos)

---

### 5.2 `$or` — Negociações encerradas (qualquer desfecho)

```js
// Negociações que tiveram algum desfecho (vendido ou não vendido)
db.negociacoes.find({
  $or: [
    { status: "fechado - vendido" },
    { status: "fechado - não vendido" }
  ]
})
```

- [ ] Query executada sem erro
- [ ] Retorna negociações com qualquer um dos dois status de fechamento
- [ ] Resultado não está vazio (garantir ao menos 1 negociação fechada nos dados)

---

### 5.3 `$gt` / `$lt` — Negociações criadas em um intervalo de datas

```js
// Negociações criadas entre duas datas (ajustar para datas reais dos dados inseridos)
db.negociacoes.find({
  createdAt: {
    $gt: ISODate("2025-01-01T00:00:00Z"),
    $lt: ISODate("2026-12-31T23:59:59Z")
  }
})
```

- [ ] Query executada sem erro
- [ ] Retorna apenas negociações dentro do intervalo especificado
- [ ] Resultado não está vazio

---

### 5.4 `$exists` — Leads com subject preenchido

```js
// Leads que possuem o campo subject (não todos os leads precisam ter)
db.leads.find({
  subject: { $exists: true }
})
```

- [ ] Query executada sem erro
- [ ] Retorna apenas leads que têm o campo `subject` presente
- [ ] Comportamento diferente de `find({ subject: null })` — demonstrado com um print comparativo

---

### 5.5 Projeção — Dados de contato dos clientes

```js
// Retornar apenas name e email dos clientes, sem _id
db.clientes.find(
  {},
  { name: 1, email: 1, _id: 0 }
)
```

- [ ] Query executada sem erro
- [ ] Resultado contém APENAS os campos `name` e `email`
- [ ] Campo `_id` suprimido explicitamente com `_id: 0`
- [ ] Outros campos (`phone`, `cpf`, `address`) não aparecem no resultado

---

### 5.6 Ordenação (`sort`) — Leads mais recentes primeiro

```js
// Leads ordenados do mais recente para o mais antigo
db.leads.find().sort({ createdAt: -1 })
```

- [ ] Query executada sem erro
- [ ] Resultado está ordenado por `createdAt` em ordem decrescente
- [ ] O primeiro documento tem a data mais recente

---

### 5.7 Paginação (`skip` + `limit`) — Página 2 de leads

```js
// Paginação: 5 leads por página, buscar a página 2 (índice 1)
const PAGE_SIZE = 5
const PAGE = 2
db.leads
  .find()
  .sort({ createdAt: -1 })
  .skip(PAGE_SIZE * (PAGE - 1))  // skip(5)
  .limit(PAGE_SIZE)               // limit(5)
```

- [ ] Query executada sem erro
- [ ] Resultado contém no máximo 5 documentos
- [ ] Os documentos retornados são diferentes dos da página 1 (testar `skip(0).limit(5)` para comparar)
- [ ] Com 10 leads inseridos, a página 2 retorna os 5 restantes

---

## 6. Aggregations (Dashboard)

> Referência: BDN §3.6 — Todos os pipelines devem usar `$match`, `$group`, `$sort` e `$project`

### 6.1 Leads por origem

**Pergunta de negócio:** Quais canais geram mais leads?

```js
db.leads.aggregate([
  // Filtrar apenas leads do último ano (ajustar data conforme necessário)
  {
    $match: {
      createdAt: { $gte: ISODate("2025-01-01T00:00:00Z") }
    }
  },
  // Agrupar por origem e contar
  {
    $group: {
      _id: "$source",
      total: { $sum: 1 }
    }
  },
  // Ordenar do canal mais produtivo para o menos
  { $sort: { total: -1 } },
  // Formatar saída
  {
    $project: {
      _id: 0,
      origem: "$_id",
      totalLeads: "$total"
    }
  }
])
```

**Saída esperada:**
```js
[
  { origem: "Instagram", totalLeads: 4 },
  { origem: "WhatsApp", totalLeads: 3 },
  // ...
]
```

- [ ] Pipeline executado sem erro
- [ ] Resultado tem um documento por `source` distinto
- [ ] Resultado está ordenado por `totalLeads` decrescente
- [ ] Saída usa os campos renomeados `origem` e `totalLeads` (não `_id` e `total`)

---

### 6.2 Leads por status de negociação

**Pergunta de negócio:** Como os leads estão distribuídos ao longo do funil?

```js
db.negociacoes.aggregate([
  // Todos os registros (sem filtro de data para ver o funil completo)
  { $match: {} },
  // Agrupar por status
  {
    $group: {
      _id: "$status",
      total: { $sum: 1 }
    }
  },
  { $sort: { total: -1 } },
  {
    $project: {
      _id: 0,
      status: "$_id",
      totalNegociacoes: "$total"
    }
  }
])
```

**Saída esperada:**
```js
[
  { status: "em negociação", totalNegociacoes: 4 },
  { status: "contato inicial", totalNegociacoes: 3 },
  // ...
]
```

- [ ] Pipeline executado sem erro
- [ ] Resultado cobre ao menos 3 status distintos
- [ ] Resultado está ordenado por volume decrescente

---

### 6.3 Taxa de conversão

**Pergunta de negócio:** De todas as negociações encerradas, qual percentual terminou em venda?

**Fórmula:** `(fechado - vendido) ÷ (fechado - vendido + fechado - não vendido) × 100`

```js
db.negociacoes.aggregate([
  // Considerar apenas negociações encerradas
  {
    $match: {
      status: { $in: ["fechado - vendido", "fechado - não vendido"] }
    }
  },
  // Contar total e convertidos
  {
    $group: {
      _id: null,
      totalFinalizados: { $sum: 1 },
      totalConvertidos: {
        $sum: {
          $cond: [{ $eq: ["$status", "fechado - vendido"] }, 1, 0]
        }
      }
    }
  },
  // Calcular e formatar percentual
  {
    $project: {
      _id: 0,
      totalFinalizados: 1,
      totalConvertidos: 1,
      taxaConversaoPercent: {
        $multiply: [
          { $divide: ["$totalConvertidos", "$totalFinalizados"] },
          100
        ]
      }
    }
  }
])
```

**Saída esperada:**
```js
[
  {
    totalFinalizados: 4,
    totalConvertidos: 2,
    taxaConversaoPercent: 50
  }
]
```

- [ ] Pipeline executado sem erro
- [ ] Resultado contém `totalFinalizados`, `totalConvertidos` e `taxaConversaoPercent`
- [ ] `taxaConversaoPercent` é um número entre 0 e 100
- [ ] Com 0 negociações finalizadas nos dados, o resultado retorna array vazio (não erro)

---

### 6.4 Leads por atendente

**Pergunta de negócio:** Qual atendente está gerenciando mais leads?

```js
db.leads.aggregate([
  // Todos os leads
  { $match: {} },
  // Agrupar por atendente
  {
    $group: {
      _id: "$userId",
      totalLeads: { $sum: 1 }
    }
  },
  // Buscar nome do atendente
  {
    $lookup: {
      from: "usuarios",
      localField: "_id",
      foreignField: "_id",
      as: "atendente"
    }
  },
  { $sort: { totalLeads: -1 } },
  // Formatar saída (não expor passwordHash)
  {
    $project: {
      _id: 0,
      nomeAtendente: { $arrayElemAt: ["$atendente.name", 0] },
      totalLeads: 1
    }
  }
])
```

**Saída esperada:**
```js
[
  { nomeAtendente: "Carlos Souza", totalLeads: 5 },
  { nomeAtendente: "Ana Lima", totalLeads: 3 },
  // ...
]
```

- [ ] Pipeline executado sem erro
- [ ] Resultado contém o nome do atendente (não o `userId`)
- [ ] `passwordHash` não aparece na saída
- [ ] Resultado ordenado por `totalLeads` decrescente

---

### 6.5 Leads por importância

**Pergunta de negócio:** Qual o perfil de temperatura (frio/morno/quente) da carteira atual?

```js
db.negociacoes.aggregate([
  // Apenas negociações ativas
  { $match: { isOpen: true } },
  // Agrupar por importância
  {
    $group: {
      _id: "$importance",
      total: { $sum: 1 }
    }
  },
  { $sort: { total: -1 } },
  {
    $project: {
      _id: 0,
      importancia: "$_id",
      totalLeads: "$total"
    }
  }
])
```

**Saída esperada:**
```js
[
  { importancia: "quente", totalLeads: 4 },
  { importancia: "morno", totalLeads: 3 },
  { importancia: "frio", totalLeads: 2 }
]
```

- [ ] Pipeline executado sem erro
- [ ] Resultado contém ao menos 2 das 3 importâncias (`frio`, `morno`, `quente`)
- [ ] Resultado ordenado por volume decrescente

---

## 7. Justificativa Escrita

> Referência: BDN §3.7 — obrigatório constar no `BDN-Documento-ABP.pdf`

- [ ] O documento menciona explicitamente onde foi usado **Embedding** (mínimo: `negociacoes.historico`)
- [ ] O documento explica o **porquê** de cada Embedding: dado acessado sempre junto, sem consulta independente
- [ ] O documento menciona explicitamente onde foi usado **Referencing** (mínimo: `leads.clientId`, `leads.userId`, `leads.lojaId`)
- [ ] O documento explica o **porquê** de cada Referencing: entidade com lifecycle próprio, reutilizada por múltiplos documentos, ou evita duplicação de dados
- [ ] O documento discute ao menos **1 decisão que poderia ter ido de qualquer jeito** (ex: "por que `negociacoes` é coleção separada em vez de embedded em `leads`?") e justifica a escolha
- [ ] O documento lista ao menos **2 vantagens concretas do MongoDB** para este domínio vs um banco relacional:
  - ex: schema flexível permite campos opcionais por `source` (WhatsApp pode ter `phoneNumber`, formulário pode ter `formData`)
  - ex: o array `historico` elimina a tabela de auditoria extra necessária no SQL

---

## 8. Qualidade do Script MongoDB

> Referência: BDN §6 + DEV_STANDARDS.md

- [ ] Primeira linha: `use <nome_do_banco>` (ex: `use leads_1000valle`)
- [ ] Seção de índices com `db.<collection>.createIndex()` para cada índice declarado:
  - `db.usuarios.createIndex({ email: 1 }, { unique: true })`
  - `db.clientes.createIndex({ phone: 1 }, { unique: true })`
  - `db.leads.createIndex({ userId: 1 })`
  - `db.leads.createIndex({ lojaId: 1 })`
- [ ] `db.<collection>.insertMany([...])` para cada coleção, **na ordem correta** (inserir `lojas`, `usuarios`, `clientes` antes de `leads`; inserir `leads` antes de `negociacoes` e `logs`)
- [ ] Os `_id` usados nos `insertMany` são IDs reais que os documentos dependentes referenciam (sem IDs inventados que não existem)
- [ ] Cada query da Seção 5 está no script com um comentário em português explicando o que ela responde
- [ ] Cada pipeline da Seção 6 está no script com um comentário em português explicando a pergunta de negócio
- [ ] Script executa do início ao fim em `mongosh` sem erros (testar com `mongosh --file script.js`)
- [ ] Enum values usados nos dados são exatamente iguais aos declarados (sem maiúsculas divergentes, sem acentos faltando)
- [ ] Nenhuma senha em texto plano nos dados inseridos (usar hashes simulados como `"$2b$10$..."` para fins acadêmicos)

---

## 9. Entrega — `BDN-Documento-ABP.pdf`

> Referência: BDN §6 e instruções de entrega

- [ ] Arquivo nomeado exatamente: `BDN-Documento-ABP.pdf`
- [ ] PDF contém o script MongoDB completo
- [ ] PDF contém prints de **tela inteira** de cada query da Seção 5 sendo executada no `mongosh`
- [ ] PDF contém prints de **tela inteira** de cada pipeline da Seção 6 sendo executado
- [ ] PDF contém o documento de justificativas (Seção 7)
- [ ] Arquivo commitado na pasta `RequisitosABP/` do repositório `FATEC-JCR-3DSM-BDN-2026-1-Augusto-Buin`
- [ ] Link do PDF copiado e colado como comentário no card `BDN-Entrega do Documento` no Kanban da professora
- [ ] Card `BDN-Entrega do Documento` movido para a coluna **Entregue** no Kanban próprio

---

## 10. Apresentação (5–10 min)

> Referência: BDN §8

- [ ] Capaz de navegar pela estrutura de cada coleção e explicar por que cada campo existe
- [ ] Capaz de defender cada escolha de Embedding e Referencing sem consultar anotações
- [ ] Capaz de rodar todas as queries da Seção 5 ao vivo no `mongosh` e explicar o resultado
- [ ] Capaz de rodar todos os pipelines da Seção 6 ao vivo e traduzir o output para linguagem de negócio
- [ ] Capaz de explicar a fórmula da taxa de conversão: `leads vendidos ÷ leads finalizados × 100`
- [ ] Capaz de responder: "Por que MongoDB e não PostgreSQL para este sistema?" com ao menos 2 argumentos técnicos concretos

---

## Apêndice — Verificação Final Rápida

Execute este bloco no `mongosh` para um health check rápido do banco:

```js
// Health check completo — rodar antes de tirar os prints finais
print("=== CONTAGEM DE DOCUMENTOS ===")
print("clientes:    " + db.clientes.countDocuments())
print("leads:       " + db.leads.countDocuments())
print("negociacoes: " + db.negociacoes.countDocuments())
print("usuarios:    " + db.usuarios.countDocuments())
print("logs:        " + db.logs.countDocuments())
print("lojas:       " + db.lojas.countDocuments())

print("\n=== REGRA: UMA NEGOCIAÇÃO ATIVA POR LEAD ===")
const violacoes = db.negociacoes.aggregate([
  { $match: { isOpen: true } },
  { $group: { _id: "$leadId", total: { $sum: 1 } } },
  { $match: { total: { $gt: 1 } } }
]).toArray()
print("Violações encontradas: " + violacoes.length + " (deve ser 0)")

print("\n=== REGRA: NENHUMA REFERÊNCIA QUEBRADA EM LEADS ===")
const semCliente = db.leads.aggregate([
  { $lookup: { from: "clientes", localField: "clientId", foreignField: "_id", as: "c" } },
  { $match: { c: { $size: 0 } } }
]).toArray()
print("Leads sem cliente: " + semCliente.length + " (deve ser 0)")

print("\n=== DIVERSIDADE DOS DADOS ===")
print("Sources distintas: " + db.leads.distinct("source").length + " (deve ser >= 3)")
print("Importâncias distintas: " + db.negociacoes.distinct("importance").length + " (deve ser >= 2)")
print("Negociações encerradas: " + db.negociacoes.countDocuments({ isOpen: false }) + " (deve ser >= 1)")
```

**Resultado esperado:** todos os contadores acima dos mínimos, `violacoes = 0`, `semCliente = 0`.
