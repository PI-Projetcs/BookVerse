# BookVerse - Back-end (API REST)

O **BookVerse** é o núcleo de processamento e persistência da plataforma, fornecendo uma API REST robusta para o gerenciamento de livros, usuários, discussões e histórico de leitura. Desenvolvido com **Java 17** e **Spring Boot 3**, o sistema segue os princípios de Clean Architecture e Segurança Stateless (JWT).

## 🚀 Tecnologias Utilizadas

- **Java 17 & Spring Boot 3**: Linguagem e framework base.
- **Spring Security & JWT**: Autenticação e autorização baseada em tokens.
- **Spring Data JPA**: Abstração da camada de persistência.
- **MySQL**: Banco de dados relacional para produção.
- **H2 Database**: Banco de dados em memória para testes automatizados.
- **Lombok**: Automação de getters, setters e construtores.
- **SpringDoc OpenAPI (Swagger)**: Documentação interativa da API.
- **Maven**: Gerenciamento de dependências e build.

## 📂 Estrutura de Pastas

```text
src/main/java/br/senac/sp/bookverse/
├── config/       # Configurações de Segurança, CORS e OpenAPI
├── controller/   # Endpoints REST (Exposição da API)
├── dto/          # Objetos de Transferência de Dados (Request/Response)
├── exception/    # Tratamento global de erros e exceções customizadas
├── mapper/       # Conversão entre Entidades e DTOs
├── model/        # Entidades do domínio (JPA Entities)
├── repository/   # Interfaces de acesso ao banco (Spring Data)
├── security/     # Filtros e lógica de autenticação JWT
└── service/      # Regras de negócio e lógica de aplicação
```

## 🛠️ Instalação e Execução Local

### Pré-requisitos
- JDK 17 ou superior.
- MySQL 8.0 instalado e rodando.
- Maven 3.8+.

### Passos
1. Clone o repositório.
2. Configure o banco de dados no arquivo `src/main/resources/.env` ou variáveis de sistema:
   ```properties
   BOOKVERSE_DB_URL=jdbc:mysql://localhost:3306/bookverse
   BOOKVERSE_DB_USERNAME=root
   BOOKVERSE_DB_PASSWORD=sua_senha
   BOOKVERSE_JWT_SECRET=sua_chave_secreta_longa_aqui
   SERVER_PORT=8080
   
4. Execute o build e rode a aplicação:
   ```bash
   ./mvnw spring-boot:run
   ```
5. Acesse a documentação Swagger: `http://localhost:8080/swagger-ui.html`

## 🔗 Integração com o Front-end

A API está configurada para aceitar requisições do front-end através de:
- **CORS**: Configurado dinamicamente via `application.yml`.
- **JSON**: Formato padrão de troca de dados.
- **Security**: Todos os endpoints (exceto Login/Cadastro) exigem o header `Authorization: Bearer <TOKEN>`.

### Principais Endpoints
- `POST /api/v1/auth/login`: Autenticação do usuário.
- `GET /api/v1/books`: Listagem de livros (com filtros).
- `POST /api/v1/books`: Registro de novo livro (Admin).
- `PUT /api/v1/reading-history`: Atualização de progresso de leitura.
- `GET /api/v1/discussions`: Fóruns de discussão por livro.

*Projeto desenvolvido para fins acadêmicos - BookVerse 2026.*
