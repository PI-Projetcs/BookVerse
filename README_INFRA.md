
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

