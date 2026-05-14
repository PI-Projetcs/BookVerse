
## 🔧 Configuração de Rede para Mobile

### Localhost vs IP Real
- **Web (navegador)**: Pode usar `localhost:8080`
- **Celular/Emulador**: DEVE usar o IP real da máquina (ex: `192.168.x.x:8080`)

### Fallback Automático
O app (`src/services/api.js`) tenta automaticamente:
1. **EXPO_PUBLIC_API_URL** (se definida)
2. **Host do Expo** (detectado via Constants.expoConfig.hostUri)
3. **10.0.2.2:8080** (Android Emulator)
4. **localhost:8080** (fallback)

Para testar em celular físico, garanta que:
1. PC e celular estão na mesma rede Wi-Fi
2. Porta 8080 não está bloqueada pelo firewall
3. Backend está rodando: `./mvnw spring-boot:run`

### Explicação das pastas
### assets
Imagens, ícones, logos dos livros etc.

### components -->Componentes reutilizáveis:
Botão
Input
Card de livro
Header
Modal
Comentário

### screens --> Cada tela do app:
Login
Cadastro
Home (Livro do mês)
Catálogo
Detalhes do livro
Discussão
Perfil
Admin

### navigation -->Controle de navegação entre telas (React Navigation)

### services --> Comunicação com o backend (Spring Boot API)
login
livros
comentários
usuários

### context --> Controle de autenticação (JWT, usuário logado)

### styles --> Cores e estilos globais

### utils -->Funções auxiliares



# BookVerse Explicação detalhada
## Estrutura do Projeto (Frontend - React Native)

### assets
Responsável por armazenar arquivos estáticos utilizados na aplicação.
Função:
- Centralizar recursos visuais
- Facilitar manutenção e organização

Exemplos:
- Imagens de livros
- Ícones
- Logos
- Ilustrações

### components

Contém componentes reutilizáveis da interface.
Função:

- Evitar repetição de código
- Padronizar o layout da aplicação
- Facilitar manutenção e reaproveitamento

Exemplos:
- Botões (CustomButton)
- Inputs (TextInput)
- Cards de livros (BookCard)
- Cabeçalhos (Header)
- Modais (Modal)
- Comentários (Comment)

### screens

Representa as telas principais da aplicação.
Função:
- Organizar a interface por páginas
- Controlar a lógica de cada tela

Exemplos:
- Login
- Cadastro
- Home (Livro do mês)
- Catálogo de livros
- Detalhes do livro
- Área de discussão
- Perfil do usuário
- Dashboard administrativo

### navigation
Responsável pelo controle de navegação entre telas.
Função:

- Definir fluxos do app
- Gerenciar rotas
- Controlar acesso (ex: usuário logado ou não)

Exemplo de uso:
- Navegação entre Login → Home
- Separação entre rotas públicas e privadas

### services
Camada responsável pela comunicação com o backend (API).
Função:
- Centralizar chamadas HTTP
- Separar regras de negócio da interface
- Facilitar manutenção e testes

Exemplos:
- authService → login e autenticação
- bookService → dados dos livros
- userService → informações do usuário
- commentService → comentários e discussões

### context
Gerencia estados globais da aplicação.
Função:
- Compartilhar dados entre telas sem precisar passar props
- Controlar autenticação e sessão do usuário

Exemplo:
- Usuário logado
- Token JWT
- Logout global

### styles
Define padrões visuais da aplicação.
Função:
- Padronizar cores, fontes e espaçamentos
- Facilitar consistência visual

Exemplos:
- Paleta de cores
- Tipografia
- Estilos globais

### utils
Funções auxiliares reutilizáveis no sistema.
Função:
- Evitar repetição de lógica
- Isolar funções utilitárias
Exemplos:
- Formatação de datas
- Validação de campos
- Manipulação de strings
- Cálculos simples


### Acessibilidade
hitSlop: Aumenta a área sensível ao toque (importante para pessoas com dificuldades motoras)
accessibilityRole: Define role dos botões ("button")
accessibilityLabel: Descreve o quê faz cada botão (importante para leitores de tela)
accessibilityState: Indica se item está selecionado (em navegação)

### Testes

- Testes de Roteamento (3 testes)
Arquivo: src/__tests__/sessionRoute.test.js

Admin com role "admin" → Roteia para "Admin"
Member com role "member" → Roteia para "Catalog"
Sem role → Roteia para "Login"

- Testes de Storage (2 testes)
Arquivo: src/__tests__/sessionStorage.test.js

Salva e recupera sessão corretamente
Limpa sessão ao fazer logout

- Testes de CRUD de Livros (1 teste)
Arquivo: src/__tests__/bookService.adminCrud.test.js

Admin pode criar, atualizar e deletar livros

- Testes de Workflows Admin (2 testes)
Arquivo: src/__tests__/adminService.workflows.test.js

Mudar papel de membro e aprovar livros
Atualizar status de moderação

- Testes de Componentes - Header (2 testes)
Arquivo: src/__tests__/Header.ui.test.js

Header renderiza corretamente
Botão logout é acessível (tem label, role, hit target)

- Testes de Componentes - Footer (2 testes)
Arquivo: src/__tests__/FooterNav.ui.test.js

NavBar renderiza corretamente
Itens de navegação são acessíveis e indicam estado
