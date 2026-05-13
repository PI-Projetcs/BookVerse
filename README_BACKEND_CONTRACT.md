# Contrato de Dados Para Backend

Este documento resume os dados que o frontend BookVerse consome hoje ou ja esta estruturado para consumir via servicos. A ideia e padronizar o backend com esses nomes de atributos e formatos de resposta.

## Padrao recomendado

- Usar JSON com nomes em `camelCase`
- Preferir respostas com `item` para objeto unico e `items` para listas quando quiser envelopar
- Aceitar ids numericos
- Evitar misturar `snake_case` e `camelCase`

Observacao: hoje o frontend ainda tolera `cover_url` e `author_bio`, mas o ideal e padronizar apenas `coverUrl` e `authorBio`.

## Entidades

### Book

Campos esperados:

- `id`: `number`
- `title`: `string`
- `author`: `string`
- `year`: `number | null`
- `genre`: `string`
- `rating`: `number`
- `coverUrl`: `string`
- `synopsis`: `string`
- `authorBio`: `string`

Usado em:

- [bookverse/src/services/bookService.js](bookverse/src/services/bookService.js)
- [bookverse/src/screens/Book/BookScreen.js](bookverse/src/screens/Book/BookScreen.js)
- [bookverse/src/screens/BookDetails/BookDetailsScreen.js](bookverse/src/screens/BookDetails/BookDetailsScreen.js)

### Chapter

Campos esperados:

- `id`: `number`
- `title`: `string`
- `comments`: `Comment[]`

Usado em:

- [bookverse/src/services/bookService.js](bookverse/src/services/bookService.js)
- [bookverse/src/screens/Discussion/DiscussionScreen.js](bookverse/src/screens/Discussion/DiscussionScreen.js)

### Comment

Campos esperados:

- `id`: `number`
- `author`: `string`
- `date`: `string`
- `text`: `string`
- `likes`: `number`
- `replies`: `number`
- `avatar`: `string`
- `reported`: `boolean`

Usado em:

- [bookverse/src/services/bookService.js](bookverse/src/services/bookService.js)
- [bookverse/src/screens/Discussion/DiscussionScreen.js](bookverse/src/screens/Discussion/DiscussionScreen.js)

### HomeViewModel

O endpoint de Home hoje esta estruturado para devolver um objeto com esta forma:

- `bookOfMonth`: `HomeBookOfMonth`
- `progress`: `ReadingProgress`
- `chapters`: `HomeChapter[]`
- `highlights`: `Highlight[]`

Usado em:

- [bookverse/src/services/homeService.js](bookverse/src/services/homeService.js)
- [bookverse/src/screens/Home/HomeScreen.js](bookverse/src/screens/Home/HomeScreen.js)

### HomeBookOfMonth

Campos esperados:

- `id`: `number`
- `monthLabel`: `string`
- `title`: `string`
- `author`: `string`
- `description`: `string`
- `members`: `number`
- `dateLabel`: `string`
- `coverUrl`: `string`

### ReadingProgress

Campos esperados:

- `currentPage`: `number`
- `totalPages`: `number`
- `weeklyDone`: `number`
- `weeklyGoal`: `number`

### HomeChapter

Campos esperados:

- `id`: `number`
- `title`: `string`
- `status`: `string`
- `state`: `'done' | 'active' | 'locked'`

### Highlight

Campos esperados:

- `id`: `string`
- `text`: `string`
- `author`: `string`
- `likes`: `number`
- `liked`: `boolean`

## Endpoints atuais esperados pelo frontend

### Catalogo de livros

Endpoint:

- `GET /api/books?q=<texto>&sort=<title|rating|year>`

Resposta aceita:

- lista direta de `Book`
- ou `{ items: Book[] }`

### Detalhe de livro

Endpoint:

- `GET /api/books/:bookId`

Resposta aceita:

- objeto `Book`
- ou `{ item: Book }`

### Discussao por livro

Endpoint:

- `GET /api/books/:bookId/discussions`

Resposta aceita:

- lista direta de `Chapter`
- ou `{ chapters: Chapter[] }`

### Adicionar comentario

Endpoint:

- `POST /api/books/:bookId/discussions/:chapterId/comments`

Payload enviado pelo frontend:

```json
{
  "text": "Comentário do usuário",
  "author": "Você"
}
```

Resposta ideal:

- `{ item: Comment }`

### Curtir comentario

Endpoint:

- `POST /api/books/:bookId/discussions/:chapterId/comments/:commentId/like`

Payload enviado:

- sem body obrigatorio hoje

Resposta ideal:

- `{ item: Comment }`

Campos realmente usados no retorno:

- `item.id`
- `item.likes`

### Reportar comentario

Endpoint:

- `POST /api/books/:bookId/discussions/:chapterId/comments/:commentId/report`

Payload enviado:

```json
{
  "reported": true
}
```

Resposta ideal:

- `{ item: Comment }`

Campos realmente usados no retorno:

- `item.id`
- `item.reported`

### Home

Endpoint:

- `GET /api/home`

Resposta aceita:

- objeto `HomeViewModel`
- ou `{ item: HomeViewModel }`

### Atualizar progresso da Home

Endpoint:

- `PUT /api/home/progress`

Payload enviado:

```json
{
  "currentPage": 248,
  "totalPages": 662,
  "weeklyDone": 124,
  "weeklyGoal": 165
}
```

Resposta ideal:

- `ReadingProgress`
- ou `{ item: ReadingProgress }`

### Curtir destaque da Home

Endpoint:

- `POST /api/home/highlights/:highlightId/like`

Payload enviado:

```json
{
  "liked": true
}
```

Resposta ideal:

- `Highlight`
- ou `{ item: Highlight }`

## Parametros de navegacao que viram entrada de backend

Estes params nao sao API, mas acabam definindo as consultas que o frontend faz:

- `BookDetails`: recebe `id`
- `Discussion`: recebe `bookId` e opcionalmente `chapterId`
- `Login/Register`: recebe `initialTab`, mas isso e apenas navegacao local

Referencias:

- [bookverse/App.js](bookverse/App.js)
- [bookverse/src/screens/Book/BookScreen.js](bookverse/src/screens/Book/BookScreen.js)
- [bookverse/src/screens/Home/HomeScreen.js](bookverse/src/screens/Home/HomeScreen.js)

## Autenticacao

Autenticacao ainda nao esta conectada a backend. O frontend atual faz validacao local em [bookverse/src/screens/Login/LoginScreen.js](bookverse/src/screens/Login/LoginScreen.js), e [bookverse/src/services/authService.js](bookverse/src/services/authService.js) ainda esta vazio.

Se quiser padronizar desde ja, a recomendacao minima e:

### Login request

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

### Login response

```json
{
  "item": {
    "user": {
      "id": 1,
      "name": "Rita",
      "email": "user@example.com",
      "role": "member"
    },
    "token": "jwt-ou-token-de-sessao"
  }
}
```

### Register request

```json
{
  "name": "Rita",
  "email": "user@example.com",
  "password": "string",
  "passwordConfirmation": "string"
}
```

### Register response

```json
{
  "item": {
    "user": {
      "id": 1,
      "name": "Rita",
      "email": "user@example.com",
      "role": "member"
    },
    "token": "jwt-ou-token-de-sessao"
  }
}
```

## Resumo rapido para o backend

Se o backend devolver exatamente estes nomes, o frontend fica alinhado:

- `Book`: `id`, `title`, `author`, `year`, `genre`, `rating`, `coverUrl`, `synopsis`, `authorBio`
- `Chapter`: `id`, `title`, `comments`
- `Comment`: `id`, `author`, `date`, `text`, `likes`, `replies`, `avatar`, `reported`
- `HomeBookOfMonth`: `id`, `monthLabel`, `title`, `author`, `description`, `members`, `dateLabel`, `coverUrl`
- `ReadingProgress`: `currentPage`, `totalPages`, `weeklyDone`, `weeklyGoal`
- `HomeChapter`: `id`, `title`, `status`, `state`
- `Highlight`: `id`, `text`, `author`, `likes`, `liked`
- `Auth User`: `id`, `name`, `email`, `role`
