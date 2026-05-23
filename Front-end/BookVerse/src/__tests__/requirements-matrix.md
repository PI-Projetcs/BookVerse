# Matriz de Requisitos Funcionais x Testes - Front-end

Relatorio consolidado de validacao dos requisitos funcionais do front-end com base na suite de testes automatizados existente.

> Status:
> - **Coberto**: ha teste automatizado cobrindo o requisito diretamente.
> - **Parcial**: ha cobertura indireta ou parcial.
> - **Nao coberto**: nao ha teste automatizado relevante.
> - **Removido**: o requisito nao faz mais parte do projeto.

| ID | Requisito | Status | Testes relacionados | Testes sugeridos |
|---|---|---|---|---|
| RF01 | Cadastro de Usuario | **Coberto** | `authService.workflows.test.js`, `api.authHandling.test.js`, `sessionStorage.test.js` | Nenhum novo teste necessário. |
| RF02 | Login de Usuario | **Coberto** | `authService.workflows.test.js`, `api.authHandling.test.js`, `sessionRoute.test.js` | Nenhum novo teste necessário. |
| RF03 | Recuperacao de senha | **Removido** | Nao aplicavel | Nao aplicavel |
| RF04 | Visualizar Livro do Mes | **Coberto** | `homeService.workflows.test.js` | Nenhum novo teste necessário. |
| RF05 | Visualizar Catalogo de Livros | **Coberto** | `bookService.customerFlows.test.js` | Nenhum novo teste necessário. |
| RF06 | Filtrar Livros | **Coberto** | `bookService.customerFlows.test.js` | Nenhum novo teste necessário. |
| RF07 | Visualizar Detalhes do Livro | **Coberto** | `bookService.customerFlows.test.js` | Nenhum novo teste necessário. |
| RF08 | Avaliar Livro | **Coberto** | `bookService.ratings.test.js` | Nenhum novo teste necessário. |
| RF09 | Participar de Discussoes | **Coberto** | `bookService.customerFlows.test.js` | Nenhum novo teste necessário. |
| RF10 | Gerenciar Perfil | **Coberto** | `profileService.test.js` | Nenhum novo teste necessário. |
| RF11 | Dashboard Administrativo | **Coberto** | `adminService.dashboard.test.js`, `adminService.workflows.test.js` | Nenhum novo teste necessário. |
| RF12 | Gerenciar Membros | **Coberto** | `adminService.workflows.test.js` | Nenhum novo teste necessário. |
| RF13 | Gerenciar Livros | **Coberto** | `bookService.adminCrud.test.js` | Nenhum novo teste necessário. |
| RF14 | Definir Livro do Mes | **Coberto** | `homeService.workflows.test.js` | Nenhum novo teste necessário. |
| RF15 | Moderar Comentarios | **Coberto** | `adminService.workflows.test.js` | Nenhum novo teste necessário. |
| RF16 | Gerenciar Conquistas | **Coberto** | `adminService.achievements.test.js` | Nenhum novo teste necessário. |
| RF17 | Visualizar Conquistas e Progresso do Usuario | **Coberto** | `profileService.test.js` | Nenhum novo teste necessário. |

## Conclusao

Todos os requisitos listados estao cobertos pelos testes indicados, com excecao do RF03, que foi classificado como **Removido** e portanto nao se aplica.

Nao ha requisitos classificados como **Nao coberto** neste levantamento.
