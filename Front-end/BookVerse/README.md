# BookVerse - Front-end (Mobile)

O **BookVerse** é uma plataforma mobile para amantes de leitura, focada na organização de bibliotecas pessoais, descoberta de novos títulos e interação em comunidades de discussão. Este repositório contém o código-fonte da aplicação mobile desenvolvida com **React Native** e **Expo**.

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
2. Defina a URL base:
   ```text
   EXPO_PUBLIC_API_URL=http://<SEU_IP_LOCAL>:8080/api
   ```
   *Nota: Use o seu IP local em vez de 'localhost' para testar no dispositivo físico.*

### Segurança e Sessão
- O sistema utiliza **Bearer Tokens (JWT)**.
- O `api.js` gerencia automaticamente a renovação do token via `Refresh Token` quando a sessão expira.

## 📈 Sugestões de Melhorias Futuras

1. **Centralização de Estilos**: Migrar cores e tokens de espaçamento repetidos em `src/styles/` para um arquivo de tema centralizado (`src/constants/theme.js`).
2. **TypeScript**: Incrementar a tipagem nos serviços e componentes para maior segurança no desenvolvimento.
3. **Gerenciamento de Cache**: Implementar algo como *React Query* para otimizar o carregamento de dados e reduzir requisições desnecessárias.
4. **Tratamento de Erros Global**: Criar um componente de "Boundary Error" ou Toast dinâmico para erros de rede interceptados.

---
*Projeto desenvolvido para fins acadêmicos - BookVerse 2024.*
