# Matriz de Requisitos Funcionais x Testes

> Status:
> - **Coberto**: há teste automatizado cobrindo o requisito diretamente.
> - **Parcial**: há cobertura indireta ou parcial.
> - **Não coberto**: não há teste automatizado relevante.

| ID | Requisito | Status | Testes relacionados |
|---|---|---|---|
| RF01 | Cadastro de Usuário | **Coberto** | `AuthenticationControllerTest`, `UserServiceTest` |
| RF02 | Login de Usuário | **Coberto** | `AuthenticationControllerTest` |
| RF04 | Visualizar Livro do Mês | **Coberto** | `BookRepositoryTest`, `BookServiceTest` |
| RF05 | Visualizar Catálogo de Livros | **Coberto** | `BookServiceTest` |
| RF06 | Filtrar Livros | **Coberto** | `BookRepositoryTest`, `BookServiceTest` - filtros por autor, gênero, ano e avaliação |
| RF07 | Visualizar Detalhes do Livro | **Coberto** | `BookServiceTest` |
| RF08 | Avaliar Livro | **Coberto** | `RatingServiceTest` |
| RF09 | Participar de Discussões | **Coberto** | `DiscussionServiceTest`, `CommentServiceTest` |
| RF10 | Gerenciar Perfil | **Coberto** | `UserServiceTest`, `ReadingHistoryServiceTest` |
| RF11 | Dashboard Administrativo | **Coberto** | `DashboardServiceTest`, `AdminControllerTest` |
| RF12 | Gerenciar Membros | **Coberto** | `UserServiceTest` |
| RF13 | Gerenciar Livros | **Coberto** | `BookServiceTest` |
| RF14 | Definir Livro do Mês | **Coberto** | `BookServiceTest` |
| RF15 | Moderar Comentários | **Coberto** | `CommentServiceTest` |


