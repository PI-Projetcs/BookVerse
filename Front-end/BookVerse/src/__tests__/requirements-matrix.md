# Matriz de Requisitos Funcionais x Testes - Front-end

> Status:
> - **Coberto**: ha teste automatizado cobrindo o requisito diretamente.
> - **Parcial**: ha cobertura indireta ou parcial.
> - **Nao coberto**: nao ha teste automatizado relevante.
> - **Removido**: o requisito nao faz mais parte do projeto.

| ID | Requisito | Status | Testes relacionados |
|---|---|---|---|
| RF01 | Cadastro de Usuario | **Coberto** | `authService.workflows.test.js`, `api.authHandling.test.js`, `sessionStorage.test.js` |
| RF02 | Login de Usuario | **Coberto** | `authService.workflows.test.js`, `api.authHandling.test.js`, `sessionRoute.test.js` |
| RF03 | Recuperacao de senha | **Removido** | Nao aplicavel |
| RF04 | Visualizar Livro do Mes | **Coberto** | `homeService.workflows.test.js` |
| RF05 | Visualizar Catalogo de Livros | **Coberto** | `bookService.customerFlows.test.js` |
| RF06 | Filtrar Livros | **Coberto** | `bookService.customerFlows.test.js` |
| RF07 | Visualizar Detalhes do Livro | **Coberto** | `bookService.customerFlows.test.js` |
| RF08 | Avaliar Livro | **Coberto** | `bookService.ratings.test.js` |
| RF09 | Participar de Discussoes | **Coberto** | `bookService.customerFlows.test.js` |
| RF10 | Gerenciar Perfil | **Coberto** | `profileService.test.js` |
| RF11 | Dashboard Administrativo | **Coberto** | `adminService.dashboard.test.js`, `adminService.workflows.test.js` |
| RF12 | Gerenciar Membros | **Coberto** | `adminService.workflows.test.js` |
| RF13 | Gerenciar Livros | **Coberto** | `bookService.adminCrud.test.js` |
| RF14 | Definir Livro do Mes | **Coberto** | `homeService.workflows.test.js` |
| RF15 | Moderar Comentarios | **Coberto** | `adminService.workflows.test.js` |
