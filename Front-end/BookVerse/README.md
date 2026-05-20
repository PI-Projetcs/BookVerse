# BookVerse - Front-end (Mobile)

O **BookVerse** é a aplicação mobile do ecossistema BookVerse. Ela cobre catálogo, leitura, discussões, autenticação e o cadastro administrativo de livros, com integração via **Axios** para o back-end em Spring Boot.

## 🚀 Tecnologias Utilizadas

- **React Native** (v0.81) & **Expo** (v54): Framework base para desenvolvimento cross-platform.
- **React Navigation**: Gerenciamento de rotas e navegação.
- **Axios**: Cliente HTTP para consumo de APIs com suporte a interceptors para Refresh Token.
- **Context API**: Gerenciamento de estado global de autenticação.
- **AsyncStorage**: Persistência local segura da sessão do usuário.
- **Jest & React Testing Library**: Conjunto de ferramentas para testes unitários e de integração.
- **Lucide React Native / Expo Vector Icons**: Ícones e interface visual moderna.

## 📂 Estrutura de Pastas

```text
src/
├── __tests__/      # Testes unitários e de integração
├── components/     # Componentes de UI reutilizáveis (Botões, Inputs, Cards)
├── constants/      # Configurações estáticas e temas de cores
├── context/        # Contextos globais (Autenticação)
├── mocks/          # Dados fictícios para desenvolvimento offline
├── navigation/     # Configuração de rotas e navegadores
├── screens/        # Telas da aplicação organizadas por funcionalidade
├── services/       # Camada de comunicação com API e armazenamento local
└── styles/         # Estilizações modulares (StyleSheet)
```

## 🛠️ Instalação e Execução Local

### Pré-requisitos
- Node.js (v18 ou superior)
- Expo Go instalado no dispositivo móvel ou emulador configurado.

### Passos
1. Clone este repositório.
2. Navegue até a pasta: `cd Front-end/BookVerse`.
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Configure as variáveis de ambiente (veja seção de Integração).
5. Inicie o projeto:
   ```bash
   npx expo start
   ```

## 🔗 Integração com o Back-end

A integração é feita via **Axios**. Para configurar o endereço do servidor:

1. Crie um arquivo chamado `.env` (ou utilize variáveis do Expo).
2. Defina a URL base (opcional, o app detecta automaticamente):
   ```text
   EXPO_PUBLIC_API_URL=http://<SEU_IP_LOCAL>:8080
   ```
   *Nota: Se não definir, o app detectará automaticamente o IP da máquina host via Expo Constants.*

### Detecção Automática de API URL
- **Web**: `http://localhost:8080`
- **Android Emulator**: `http://10.0.2.2:8080`
- **Celular Físico**: IP da máquina host detectado automaticamente (ex: `http://192.168.x.x:8080`)

A lógica de fallback está em `src/services/api.js`.

## 📝 Cadastro de Livro

O formulário administrativo de cadastro e edição fica em `src/screens/Admin/RegisterBook.js` e envia os dados para o back-end por meio de `src/services/bookService.js`.

### Campos disponíveis no formulário
- Título
- Autor
- Sobre o autor
- Categoria
- Ano
- Nota
- URL da capa
- Sinopse
- Páginas
- Destaque
- Capítulos

### Como a integração funciona
- O formulário monta o payload em `createAdminBook()` e `updateAdminBook()`.
- O service normaliza os nomes em português para a API (`titulo`, `autor`, `authorBio`, `genero`, `ano`, `sinopse`, `coverUrl`, `paginas`, `destaque`, `chapters`).
- O back-end recebe o `BookDTO`, valida os campos obrigatórios e persiste o livro via JPA.
- A resposta é normalizada de volta para o formato usado pela UI.

### Resumo da persistência
- Front-end: estado local do formulário + validação antes do envio.
- Axios: POST/PUT em `/api/v1/books`.
- Back-end: `BookController` recebe a requisição, `BookService` salva, `BookMapper` converte DTO ↔ entidade, e a entidade `Book` persiste `authorBio` na tabela `books`.

## 📚 Página: Livro do Mês

**Descrição:** apresenta o `HomeBookOfMonth` (capa, título, autor, descrição, membros, data), progresso de leitura do usuário, lista de capítulos ligados à discussão e destaques da comunidade.

**Comportamento de capítulos (implementações recentes):**
- Todos os capítulos são exibidos inicialmente sem status definido (campo `status` vazio) e desbloqueados (`state: active`).
- O usuário pode tocar na pílula de status de cada capítulo e escolher `Concluído` ou `Em leitura`.
- As escolhas do usuário são persistidas por usuário no back-end (persistência por `ChapterProgress`).

**Dados carregados de:** `GET /api/v1/home` (ou `/api/home` conforme contrato do backend). A resposta aceita: `HomeViewModel` ou `{ item: HomeViewModel }`.

**Principais componentes:**
- `src/screens/Home/HomeScreen.js` — view do usuário com progresso, capítulos e destaques.
- `src/screens/Admin/BookOfMonth.js` — painel administrativo para definir o livro do mês.
- `src/services/homeService.js` — normalização e chamadas ao backend para `home`, `updateChapterStatus()` e `updateHomeProgress()`.

**Funcionalidades:**
- Exibe livro do mês e meta semanal.
- Lista de capítulos (cada capítulo mostra título, pílula de status e navega para discussão).
- Usuário pode marcar capítulos como `Concluído` ou `Em leitura`.
- Mudanças de status são salvas no servidor via API REST (por usuário).
- Atualiza progresso via `PUT /api/v1/home/progress`.
- Navega para discussões por capítulo (`Discussion`), passando `bookId` e `chapterId`.
- Curtir destaque da comunidade via `POST /api/v1/home/highlights/:id/like`.

**Endpoints relevantes (frontend ↔ backend):**
- `GET /api/v1/home` — obtém `HomeViewModel` com `bookOfMonth`, `progress`, `chapters` e `highlights`.
- `PUT /api/v1/home/progress` — atualiza progresso do usuário.
- `PUT /api/v1/books/{bookId}/chapters/{chapterOrder}/status` — persiste status do capítulo para o usuário autenticado. Body: `{ "status": "Concluído" }` ou `{ "status": "Em leitura" }`.
- `POST /api/v1/chapters/{chapterId}/status` — rota fallback (alguns backends podem expor este formato).
- `POST /api/v1/home/highlights/{id}/like` — curtir destaque.

As rotas acima são consumidas por `src/services/*` usando `Axios` (veja seção de Integração abaixo).

## ⚙️ Boas práticas de integração (Axios / API)

- Use variáveis de ambiente para a URL base (`EXPO_PUBLIC_API_URL`) e para ativar dados mock (`EXPO_PUBLIC_USE_MOCK=true`).
- Padronize endpoints com versão (`/api/v1/...`) ou documente claramente no backend para evitar mismatches.
- Trate erros de rede e mostre mensagens de feedback (`try/catch` já presente em services — propague mensagens úteis para UI quando necessário).
- Documente endpoints e formatos na API (veja `README_BACKEND_CONTRACT.md`).
- Autenticação: `api.js` injeta `Authorization: Bearer <token>` quando a sessão está aplicada; garanta que o backend aceite esse header.

## Persistência dos status de capítulos

- Mecanismo: cada status definido pelo usuário é persistido no back-end usando uma API REST.
- Endpoint principal: `PUT /api/v1/books/{bookId}/chapters/{chapterOrder}/status` com corpo JSON `{ "status": "Concluído" }`, `{ "status": "Em leitura" }` ou `{ "status": "" }` para limpar o status.
- Camada de front-end: `src/services/homeService.js` exporta `updateChapterStatus(bookId, chapterId, status)` que envia a requisição via `Axios` (arquivo `src/services/api.js`). A função aplica lógica de fallback (tenta `PUT` e, se 404, tenta `POST` legacy) e realiza atualização otimista na UI.
- Camada de back-end: a aplicação Spring Boot persiste o status por usuário na entidade `ChapterProgress` (tabela `chapter_progress`) via `ChapterProgressService.updateStatus(...)`. Quando não existe progresso salvo, os capítulos são retornados sem status (campo `status` vazio) e desbloqueados (`state: active`).

Observações:
- Envie o token de autenticação (Bearer) para que o back-end identifique o usuário e persista o status corretamente.
- A opção de limpar o status (`status: ""`) remove a marcação do usuário para aquele capítulo.

## ✅ Observações e recomendações rápidas

- Corrigi a navegação para a tela de Discussão garantindo que `bookId` seja passado (corrige capítulos/discussões carregadas incorretamente).
- Verifique se o backend expõe os mesmos caminhos usados no frontend (`/api/v1/home` vs `/api/home`). Se o backend não usar `v1`, alinhe um dos lados.

### Segurança e Sessão
- O sistema utiliza **Bearer Tokens (JWT)**.
- O `api.js` gerencia automaticamente a renovação do token via `Refresh Token` quando a sessão expira.

## 🎨 Layout e UI

- **Admin - Grade de Livros**: 3 colunas por linha com espaçamento consistente.
- **Catálogo - Grade de Livros**: 3 colunas por linha (responsivo).
- **Padronização de Imagens**: Todas as capas de livros usam `resizeMode="contain"` com altura fixa (140px) para evitar cortes e manter apresentação uniforme.

## 📈 Sugestões de Melhorias Futuras

1. **Centralização de Estilos**: Migrar cores e tokens de espaçamento repetidos em `src/styles/` para um arquivo de tema centralizado (`src/constants/theme.js`).
2. **TypeScript**: Incrementar a tipagem nos serviços e componentes para maior segurança no desenvolvimento.
3. **Gerenciamento de Cache**: Implementar algo como *React Query* para otimizar o carregamento de dados e reduzir requisições desnecessárias.
4. **Tratamento de Erros Global**: Criar um componente de "Boundary Error" ou Toast dinâmico para erros de rede interceptados.
5. **Responsividade Avançada**: Implementar grid dinâmica (2 colunas em mobile pequeno, 3 em tablets, 4 em web).

---
*Projeto desenvolvido para fins acadêmicos - BookVerse 2024.*

## 🔐 Fluxo de Login e Validações

- Requisição: `POST /api/v1/auth/login` com payload JSON `{ "email": "user@example.com", "senha": "string" }` (o frontend envia `email` e `password` e o service normaliza para `senha`).
- Validações no Front-end:
   - Formato de email validado via regex (ex: `nome@dominio.ext`).
   - Senha aceita apenas caracteres ASCII imprimíveis (evita emojis/idiomas exóticos no campo de senha).
   - Mensagens de erro são exibidas inline no formulário (não apenas Alerts): formato inválido, campos vazios, caracteres proibidos.
- Validações no Back-end:
   - DTOs de `LoginRequest` e `RegistrationRequest` possuem validação com `@Email`, `@Pattern` e `@Size`.
   - Erros de validação retornam JSON padronizado `{ status, mensagem, exception }`.
- Mensagens de erro específicas do back-end agora retornam:
   - `400` com `mensagem: "Email inválido."` quando o email não existe.
   - `401` com `mensagem: "Senha incorreta."` quando a senha falha na autenticação.
   - `403` com `mensagem: "Conta excluída. Entre em contato com o administrador."` quando a conta está desativada.

## 📌 Configuração do Axios (detalhes)

- Base URL: configurada via `EXPO_PUBLIC_API_URL` ou detectada automaticamente (`src/services/api.js`).
- Interceptors:
   - Request: injeta header `Authorization: Bearer <token>` quando sessão aplicada.
   - Response: intercepta `401` para tentativa de refresh de token; intercepta erros e propaga `response.data` com `mensagem` para o front-end.

## ✅ Como o front-end apresenta erros de login

- Erros de validação do cliente (formato de email inválido, caracteres inválidos na senha) são mostrados abaixo dos campos do formulário.
- Erros retornados pelo servidor são exibidos inline com a mensagem exata enviada no corpo JSON (`mensagem`).

## 🔁 Exemplo de uso (Login via curl)

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"user@test.com","senha":"user123"}'
```

Resposta de sucesso (exemplo):

```json
{
   "accessToken": "<jwt>",
   "refreshToken": "<refresh>",
   "item": { "user": { "id": 1, "name": "User", "email": "user@test.com", "role": "member" } }
}
```

Resposta de erro (exemplo - senha incorreta):

```json
{
   "status": 401,
   "mensagem": "Senha incorreta.",
   "exception": "org.springframework.security.authentication.BadCredentialsException"
}
```
