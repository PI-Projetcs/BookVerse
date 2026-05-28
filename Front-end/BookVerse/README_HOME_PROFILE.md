# Documentação: Front-End — HomeScreen e ProfileScreen

Este documento explica, no mesmo formato didático do README principal, como as telas **Home** e **Profile** do front-end mobile (BookVerse) consomem a API, quais contratos JSON esperam, os arquivos/ componentes relevantes e exemplos práticos de uso.

---


## 1. Visão geral

Esta documentação foca nas telas de interface do usuário responsáveis pela visão inicial do aplicativo (`HomeScreen`) e pelo painel de usuário (`ProfileScreen`). O objetivo é permitir que um desenvolvedor front-end entenda:

- quais endpoints utilizar;
- como modelar os dados retornados (DTOs/contratos JSON);
- quais componentes reaproveitáveis usar ou implementar;
- fluxos de navegação e de autenticação relevantes.

Stack presumida: React Native (Expo ou CLI), `axios` para HTTP, `React Navigation` para rotas, e `AsyncStorage` ou `SecureStore` para persistência de token.

## 2. Estrutura do front-end relacionada

No workspace front-end, os pontos mais relevantes são:

- `src/screens/` — onde ficam `HomeScreen` e `ProfileScreen`.
- `src/services/` — implementação das chamadas HTTP (`api.js`, `homeService.js`, `userService.js`).
- `src/components/` — componentes UI reutilizáveis (`HeroCard`, `ProgressBar`, `Avatar`).
- `src/context/` — contexto de autenticação (opcional) que guarda `user` e `token`.


---


## 3. Endpoints usados por Home e Profile

Listei abaixo os endpoints primários que as telas consomem, com observações de uso.

- `GET /api/v1/home` — retorna o `HomeDTO` que contém o livro do mês (`item`), lista de `highlights` (`items`) e campo `progress` com dados do usuário.
- `PUT /api/v1/home/progress` — atualiza progresso do usuário (body: `currentPage`, `totalPages`, `weeklyDone`, `weeklyGoal`).
- `POST /api/v1/home/highlights/{id}/like` — registra um "like" no destaque.
- `GET /api/v1/users/me` — retorna dados básicos do usuário autenticado (nome, email, avatar, estatísticas).
- `GET /api/v1/users/me/profile` — versão estendida do perfil (se disponível).
- `PUT /api/v1/users/me` — atualiza campos editáveis do perfil.
- `GET /api/v1/users/me/read-books` — recupera histórico de leitura do usuário.

Exemplos rápidos (terminal):

```bash
curl http://localhost:8080/api/v1/home

curl -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/v1/users/me
```

---


## 4. Contratos / DTOs (exemplos simplificados)

Para manter compatibilidade com o back-end (que usa envelopamento `ApiResponse`), considere que a maioria das respostas vem envolvida em `{ item, items, status, message }`.

Exemplo `HomeDTO` (resposta desembrulhada):

```json
{
  "item": {
    "id": 12,
    "titulo": "O Pequeno Principe",
    "autor": "Antoine de Saint-Exupery",
    "coverUrl": "https://...",
    "destaque": true
  },
  "items": [],
  "progress": {
    "currentPage": 120,
    "totalPages": 600,
    "weeklyDone": 20,
    "weeklyGoal": 30
  }
}
```

Exemplo `UserResponseDTO` (resposta desembrulhada):

```json
{
  "item": {
    "id": 1,
    "nome": "Usuario Teste",
    "email": "user@test.com",
    "avatarUrl": "https://...",
    "stats": { "readCount": 24, "favoritesCount": 6 }
  }
}
```

---


## 5. Serviços (exemplos práticos)

`src/services/api.js` — instância axios com interceptor para anexar token:

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({ baseURL: 'http://localhost:8080', headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@bookverse:token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(response => response, async (error) => {
  // tratar 401 globalmente (simples): limpar sessão e redirecionar se necessário
  return Promise.reject(error);
});

export default api;
```

`src/services/homeService.js`:

```javascript
import api from './api';

export function getHomeViewModel() { return api.get('/api/v1/home').then(r => r.data); }
export function updateProgress(progress) { return api.put('/api/v1/home/progress', progress); }
export function likeHighlight(id) { return api.post(`/api/v1/home/highlights/${id}/like`); }
```

`src/services/userService.js`:

```javascript
import api from './api';
export function getMyProfile() { return api.get('/api/v1/users/me').then(r => r.data); }
export function updateProfile(payload) { return api.put('/api/v1/users/me', payload); }
```

---


## 6. Exemplos de telas (padrão React Native)

Os exemplos abaixo são intencionais e simplificados para estudo. Adapte estilos, navegação e tratamento de erros conforme o padrão do seu projeto.

`HomeScreen` (resumo):

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Button } from 'react-native';
import { getHomeViewModel, likeHighlight } from '../services/homeService';
import HeroCard from '../components/HeroCard';
import ProgressBar from '../components/ProgressBar';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [home, setHome] = useState(null);

  useEffect(() => { getHomeViewModel().then(r => setHome(r.item ? r : r)).finally(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator />;
  if (!home) return <Text>Sem dados</Text>;

  return (
    <View style={{ flex:1, padding: 16 }}>
      <HeroCard book={home.item} />
      <ProgressBar progress={home.progress} />

      <Text style={{ marginTop: 12, fontWeight: 'bold' }}>Destaques</Text>
      <FlatList
        data={home.items}
        keyExtractor={i => String(i.id)}
        renderItem={({item}) => (
          <View style={{ marginVertical: 8 }}>
            <Text>{item.titulo}</Text>
            <Button title="Curtir" onPress={() => likeHighlight(item.id)} />
          </View>
        )}
      />
    </View>
  );
}
```

`ProfileScreen` (resumo):

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Button, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMyProfile } from '../services/userService';

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => { getMyProfile().then(r => setProfile(r.item || r)).finally(() => setLoading(false)); }, []);

  if (loading) return <ActivityIndicator />;
  if (!profile) return <Text>Perfil não encontrado</Text>;

  return (
    <View style={{ flex:1, padding: 16 }}>
      <View style={{ alignItems: 'center' }}>
        <Image source={{ uri: profile.avatarUrl }} style={{ width: 96, height: 96, borderRadius: 48 }} />
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{profile.nome}</Text>
        <Text>{profile.email}</Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text>Livros lidos: {profile.stats?.readCount ?? 0}</Text>
        <Text>Favoritos: {profile.stats?.favoritesCount ?? 0}</Text>
      </View>

      <Button title="Editar perfil" onPress={() => navigation.navigate('EditProfile', { profile })} />
      <Button title="Logout" onPress={async () => { await AsyncStorage.removeItem('@bookverse:token'); navigation.replace('Auth'); }} />
    </View>
  );
}
```

---


## 7. Componentes reutilizáveis

- `HeroCard` — exibe capa, título, autor, e ação para abrir detalhe do livro.
- `ProgressBar` — recebe `{ currentPage, totalPages }` e renderiza barra + percentual.
- `Avatar` — imagem do usuário com fallback para iniciais.

Exemplo rápido `ProgressBar`:

```javascript
export default function ProgressBar({ progress }) {
  const percent = Math.round((progress.currentPage / progress.totalPages) * 100 || 0);
  return (
    <View>
      <View style={{ height: 8, backgroundColor: '#eee', borderRadius: 4 }}>
        <View style={{ width: `${percent}%`, height: 8, backgroundColor: '#4caf50', borderRadius: 4 }} />
      </View>
      <Text>{percent}%</Text>
    </View>
  );
}
```

## 8. Mocking e testes rápidos

- Para estudar a UI sem back-end, crie `__mocks__/home.json` e use uma flag de dev para carregar dados locais.
- Testes: `jest` + `@testing-library/react-native`. Mockar `homeService` e `userService` para controlar cenários (carregando, vazio, erro).

## 9. Boas práticas e recomendações

- Centralizar interceptors em `src/services/api.js` para tratar 401 e refresh token.
- Padronizar tratamento de erro nas telas: mostrar `Toast`/`Snackbar` e opções de retry.
- Evitar re-fetchs desnecessários: usar Context para cache parcial do `home`.

## 10. Próximos passos sugeridos

1. Criar mocks de `home` e `profile` em `Front-end/BookVerse/__mocks__/` para facilitar estudo offline.
2. Implementar os componentes `HeroCard`, `Avatar`, `ProgressBar` em `src/components/` com testes unitários.
3. Adicionar exemplos de `curl` e coleção Postman focada em `home` e `users/me` (pode gerar `docs/postman_home_profile.json`).

---

## 11. Perguntas frequentes (rápidas)

- Q: O que o `HomeScreen` deve carregar ao abrir? — R: `GET /api/v1/home` e dados de progresso do usuário.
- Q: Onde guardar o token? — R: `AsyncStorage` (dev) ou `SecureStore` (produção/mobile mais seguro).
- Q: Como evitar erros de lazy-loading? — R: checar `null`/`undefined` antes de renderizar campos aninhados.

---

## 12. Edição de perfil e upload de avatar (detalhes)

Esta seção descreve o contrato e fluxos comuns para editar perfil do usuário e enviar um avatar.

### 12.1 `PUT /api/v1/users/me` — payload sugerido

Corpo JSON (exemplo):

```json
{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "bio": "Leitor ávido de ficção",
  "avatarUrl": "https://..." // opcional: pode ser preenchido após upload
}
```

Validações comuns no back-end:

- `nome`: obrigatório, tamanho mínimo 2, máximo 100.
- `email`: formato válido, único.
- `avatarUrl`: URL pública (opcional) — geralmente gerada após upload.

Resposta esperada: `ApiResponse` com o `item` atualizada do `UserResponseDTO`.

### 12.2 Upload de avatar — opções

Opção A (recomendada): upload separado via multipart para um endpoint dedicado, por ex. `POST /api/v1/users/me/avatar`.

Curl exemplo:

```bash
curl -X POST http://localhost:8080/api/v1/users/me/avatar \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@/caminho/para/avatar.jpg"
```

Reposta típica: `{ item: { avatarUrl: "https://cdn.../avatar.jpg" }, status: 200 }`.

Opção B (alternativa): enviar `avatar` como base64 ou como `avatarUrl` já hospedada no corpo do `PUT /api/v1/users/me`.

### 12.3 Exemplo de serviço para upload (`src/services/userService.js`)

```javascript
import api from './api';

export function uploadAvatar(file) {
  const form = new FormData();
  form.append('file', { uri: file.uri, name: file.name || 'avatar.jpg', type: file.type || 'image/jpeg' });
  return api.post('/api/v1/users/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export function updateProfile(payload) { return api.put('/api/v1/users/me', payload); }
```

Nota: no Android, a URI deve ser compatível com `FormData`; use `expo-image-picker` ou `react-native-image-crop-picker` para obter `uri`, `type` e `name`.

### 12.4 Exemplo: `EditProfileScreen` (fluxo com upload)

```javascript
import React, { useState } from 'react';
import { View, TextInput, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadAvatar, updateProfile } from '../services/userService';

export default function EditProfileScreen({ navigation, route }) {
  const [nome, setNome] = useState(route.params.profile.nome);
  const [email, setEmail] = useState(route.params.profile.email);
  const [avatar, setAvatar] = useState(route.params.profile.avatarUrl);
  const [localFile, setLocalFile] = useState(null);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) { setLocalFile(res.assets[0]); setAvatar(res.assets[0].uri); }
  };

  const onSave = async () => {
    try {
      let avatarUrl = avatar;
      if (localFile) {
        const uploadRes = await uploadAvatar(localFile);
        avatarUrl = uploadRes.data.item.avatarUrl || avatarUrl;
      }
      await updateProfile({ nome, email, avatarUrl });
      navigation.goBack();
    } catch (e) { console.error(e); }
  };

  return (
    <View style={{ padding: 16 }}>
      <Image source={{ uri: avatar }} style={{ width: 96, height: 96, borderRadius: 48 }} />
      <Button title="Escolher foto" onPress={pickImage} />
      <TextInput value={nome} onChangeText={setNome} />
      <TextInput value={email} onChangeText={setEmail} />
      <Button title="Salvar" onPress={onSave} />
    </View>
  );
}
```

### 12.5 Tratamento de erros e UX

- Mostrar feedback de upload (progress indicator) e erros (toast/snackbar).
- Validar campos localmente antes de chamar a API (ex.: email com regex, nome mínimo).
- Em caso de falha no upload, permitir re-tentativa mantendo os dados do formulário.

---

Arquivo formatado seguindo o modelo do README anexo (estrutura numerada, explicações e exemplos práticos).
