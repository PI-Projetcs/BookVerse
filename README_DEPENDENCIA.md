

## react-navigation/native
**Função:**
É a biblioteca principal de navegação no React Native.
**Por que usar?**
- Permite trocar de telas (Login → Home → Perfil)
- Controla o fluxo do app
Sem isso, o app não consegue mudar de tela corretamente.



## @react-navigation/native-stack
**Função:**
Cria navegação no estilo pilha (stack).
**Por que usar?**
- Funciona como histórico
- Você entra em uma tela
- Pode voltar para a anterior
**Exemplo:**
- Catálogo → Detalhes do Livro → Voltar



## react-native-screens
**Função:**
Melhora o desempenho da navegação.
**Por que usar?**
- Otimiza o uso de memória
- Torna transições mais rápidas
É um suporte interno para o React Navigation.



## react-native-safe-area-context
**Função:**
Garante que o layout respeite áreas seguras do celular.
**Por que usar?**
- Evita que conteúdo fique embaixo do notch
- Evita que conteúdo fique cortado na barra superior/inferior
importante em iPhones e Android modernos.



##  axios
**Função:**
Faz requisições HTTP para o backend (Spring Boot).
**Por que usar?**
- Buscar dados (livros, usuários)
- Enviar dados (login, comentários)
**Exemplo:**
```js
axios.get('/books');
axios.post('/login');
```


## jwt-decode
**Função:**
Decodifica o token JWT.
**Por que usar?**
- Saber quem é o usuário logado
- Ver dados do token (id, nome, perfil)
- Verificar expiração do login
**Exemplo:**
```js
const decoded = jwtDecode(token);
console.log(decoded.userId);
```

## Resumo rápido

| Biblioteca | Função |
| --- | --- |
| React Navigation | Navegação entre telas |
| Native Stack | Controle de histórico de telas |
| Screens | Otimização de performance |
| Safe Area | Ajuste visual para celulares |
| Axios | Comunicação com API |
| JWT Decode | Controle de autenticação |

