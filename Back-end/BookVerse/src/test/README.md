# ✅ BookVerse - README de Testes

Este diretório reúne os testes automatizados do projeto BookVerse. A suíte cobre os fluxos principais da API e ajuda a garantir que controllers, services e repositories continuem funcionando após mudanças.

---

## 🎯 Objetivo dos testes

Os testes têm como foco validar:
- Regras de negócio dos services
- Comportamento das rotas REST nos controllers
- Consultas dos repositories
- Configuração básica da aplicação com profile `test`
- Cobertura dos requisitos funcionais do projeto

---

## 🧪 Estrutura da suíte

```text
src/test/
├── java/br/senac/sp/bookverse/
│   ├── BookverseApplicationTest.java
│   ├── RequirementsMatrixTest.java
│   ├── controller/
│   │   ├── AuthenticationControllerTest.java
│   │   └── UsuarioControllerValidacaoTest.java
│   ├── repository/
│   │   └── BookRepositoryTest.java
│   └── service/
│       ├── AchievementServiceTest.java
│       ├── BookServiceTest.java
│       ├── CommentServiceTest.java
│       ├── DashboardServiceTest.java
│       ├── DiscussionServiceTest.java
│       ├── RatingServiceTest.java
│       ├── ReadingHistoryServiceTest.java
│       └── UserServiceTest.java
└── resources/
    ├── application-test.yml
    └── requirements-matrix.md
```

> Observação: o requisito de recuperação de senha (RF03) foi removido do projeto.

---

## 📦 Tecnologias usadas nos testes

- **JUnit 5** - framework de testes
- **Mockito** - mocks e stubs
- **Spring Boot Test** - integração com contexto Spring
- **MockMvc** - testes de controller sem subir servidor real
- **H2** - banco em memória para os testes de persistência
- **spring-security-test** - validação de endpoints protegidos

---

## ▶️ Como executar

Na raiz do projeto:

```bash
.\mvnw.cmd test
```

### Executar apenas um teste
```bash
.\mvnw.cmd test -Dtest=BookServiceTest
```

### Executar uma categoria
```bash
.\mvnw.cmd test -Dtest=*ControllerTest
.\mvnw.cmd test -Dtest=*ServiceTest
.\mvnw.cmd test -Dtest=*RepositoryTest
```

---

## 🗂️ Profile de testes

O projeto usa o arquivo:

```yaml
src/test/resources/application-test.yml
```

Esse profile configura:
- H2 em memória
- `ddl-auto: create-drop`
- Dialect compatível com H2
- Configurações mínimas de mail para não quebrar contexto
- JWT secret específico para testes

---

## ✅ O que cada tipo de teste valida

### 1. `BookverseApplicationTest`
- Verifica se o contexto Spring sobe corretamente

### 2. `AuthenticationControllerTest`
- Valida login e cadastro
- Garante compatibilidade das rotas versionadas

### 3. `BookRepositoryTest`
- Valida consultas personalizadas do repositório de livros

### 4. Tests de service
- Validam regras de negócio e tratamento de exceções
- Cobrem operações como criar, atualizar, listar e remover entidades

### 5. `RequirementsMatrixTest`
- Lê a matriz de requisitos e ajuda a manter a documentação de cobertura alinhada ao código

---

## 📌 Status da cobertura funcional

A matriz atual de testes está documentada em:

```text
src/test/resources/requirements-matrix.md
```

Ela cobre os requisitos RF01, RF02, RF04 até RF15.

---

## 🔎 Boas práticas ao escrever novos testes

- Prefira **testes pequenos e objetivos**
- Use `MockMvc` para controllers
- Use `@DataJpaTest` quando o foco for persistência
- Use `@SpringBootTest` apenas quando precisar validar o contexto completo
- Mantenha os testes independentes entre si
- Evite depender de ordem de execução

---

## ⚠️ Observações importantes

- O arquivo `.env` é carregado explicitamente pelo `application.yml` principal, mas os testes usam o profile `test`.
- O projeto foi ajustado para não depender mais do fluxo de recuperação de senha.
- Se um teste falhar por DDL em H2, verifique `src/test/resources/application-test.yml`.

---

## 🚀 Próximo passo recomendado

Se você adicionar novas features, crie também o teste correspondente e atualize a matriz de requisitos.

Exemplo:
- nova rota em `controller/` → criar teste em `src/test/java/.../controller/`
- nova regra de negócio em `service/` → criar teste em `src/test/java/.../service/`
- nova query → criar teste em `src/test/java/.../repository/`

---

**Última atualização:** 2026-05-10

