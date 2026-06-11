# Análise da pasta `Login`

## Escopo analisado
- `LoginScreen.js`

## Visão geral
Esta pasta concentra o fluxo de autenticação principal do app. A tela junta login e cadastro em uma única interface com alternância por abas, o que reduz atrito e mantém o usuário dentro do mesmo contexto.

## `LoginScreen.js`
### O que a tela faz bem
- Reúne login e cadastro em uma interface única e clara.
- Faz validação local antes de chamar a API, reduzindo requisições inválidas.
- Traduz erros do backend para mensagens mais legíveis.
- Integra login automático após cadastro com `signIn`.
- Usa áreas de toque amplas e estados visuais razoavelmente consistentes.

### Pontos fortes técnicos
- A função `extractApiErrorMessage` cobre diferentes formatos de resposta do backend.
- A alternância entre abas é simples e previsível.
- O uso de `KeyboardAvoidingView`, `ScrollView` e `SafeAreaView` ajuda na experiência em dispositivos móveis.
- O layout dá suporte a acesso rápido com credenciais de teste, útil para ambiente de desenvolvimento.

### Riscos e limitações
- A tela é longa e concentra muita regra de autenticação em um único componente.
- As regras de validação de email e senha estão inline e podem se repetir em outros fluxos no futuro.
- O bloco de credenciais de teste é útil para desenvolvimento, mas não deveria ir para produção.
- A interface mistura apresentação, validação e integração com serviço em um só nível.

### Leitura funcional
- O usuário pode alternar entre entrar e cadastrar sem sair da tela.
- O fluxo de cadastro já inicia sessão automaticamente, o que melhora a experiência.
- As mensagens de erro são exibidas de forma direta e logo após a ação relevante.

## Conclusão
A pasta `Login` está madura funcionalmente e é uma das partes mais completas do fluxo de entrada. O ponto principal de atenção é organização interna: a tela já tem responsabilidade suficiente para justificar extração de validação e handlers em camadas menores.

## Prioridades de melhoria
1. Extrair validações e handlers para helpers ou hooks específicos.
2. Remover ou proteger melhor as credenciais de teste para ambientes não locais.
3. Padronizar ainda mais os textos de erro e sucesso entre login e cadastro.
