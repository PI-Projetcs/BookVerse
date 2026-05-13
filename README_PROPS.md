# Mapa de Props e Route Params

Este documento resume onde as props sao recebidas/passadas entre componentes e como os parametros de navegacao (`route params`) circulam entre telas no BookVerse.



## Props recebidas (assinatura dos componentes)

- `src/components/Header.js`: `Header({ title, subtitle, colors, onRightAction, rightActionLabel, rightActionIcon })`
- `src/components/FooterNav.js`: `FooterNav({ navigation, activeKey })`
- `src/components/BookCard.js`: `BookCard({ book, onPress })`
- `src/screens/Book/BookScreen.js`: `BookScreen({ navigation })`
- `src/screens/BookDetails/BookDetailsScreen.js`: `BookDetailsScreen({ navigation, route })`
- `src/screens/Login/LoginScreen.js`: `LoginScreen({ navigation, route })`
- `src/screens/Home/HomeScreen.js`: `HomeScreen({ navigation })`
- `src/screens/Discussion/DiscussionScreen.js`: `DiscussionScreen({ navigation, route })`
- `src/screens/User/UserScreen.js`: `UserScreen({ navigation })`

## Props passadas para componentes customizados

- `BookScreen` -> `BookCard`: `book`, `onPress`
- `BookScreen` -> `FooterNav`: `navigation`, `activeKey="livros"`
- `BookDetailsScreen` -> `FooterNav`: `navigation`, `activeKey="livros"`
- `DiscussionScreen` -> `FooterNav`: `navigation`, `activeKey="discussao"`
- `HomeScreen` -> `FooterNav`: `navigation`, `activeKey="inicio"`
- `UserScreen` -> `Header`: `title`, `subtitle`, `onRightAction`, `rightActionLabel`
- `UserScreen` -> `FooterNav`: `navigation`, `activeKey="perfil"`
- `LoginScreen` -> `Header`: sem props explicitas (usa defaults)

## Route params

- `BookScreen` envia `id` para `BookDetails`
- `HomeScreen` envia `id` para `BookDetails`
- `HomeScreen` envia `chapterId` para `Discussion`
- `BookDetailsScreen` le `route?.params?.id`
- `DiscussionScreen` le `route?.params?.chapterId`
- `LoginScreen` le `route?.params?.initialTab`
