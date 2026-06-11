import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import FooterNav from '../../components/FooterNav';
import { HEADER_GRADIENT_COLORS } from '../../styles/headerStyles';
import api from '../../services/api';
import { styles as userStyles } from '../../styles/UserStyles';

// Tela de moderações do usuário.
// Tecnologias utilizadas: React Native, API service, Header e FooterNav.
// Objetivo: reunir comentários e avaliações que receberam feedback de moderação.
// Observações: a tela combina duas fontes de dados e mostra o resultado em uma lista única.
export default function MyModeration({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carrega comentários moderados e feedbacks do perfil em paralelo.
  // Tecnologias utilizadas: Promise.all e chamadas HTTP com api.get.
  // Objetivo: consolidar a visão do usuário sobre tudo que foi moderado.
  // Observações: falhas no carregamento exibem mensagem simples e evitam tela quebrada.
  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [commentsRes, profileRes] = await Promise.all([
        api.get('/api/v1/comments/me/moderation'),
        api.get('/api/v1/users/me/profile'),
      ]);

      const comments = (Array.isArray(commentsRes.data) ? commentsRes.data : []).map((item) => ({
        ...item,
        type: 'comment',
      }));
      const profileData = profileRes.data || {};
      const feedbacks = (profileData?.item?.feedbacks || profileData?.feedbacks || [])
        .map((r) => ({
          id: `rating-${r.id}`,
          type: 'rating',
          bookTitle: r.livroTitulo || r.bookTitle || r.livro?.titulo || '',
          discussionTitle: '',
          status: r.status || r.status,
          text: r.descricao || r.review || '',
          adminFeedback: r.adminFeedback || '',
          moderatedAt: r.moderatedAt || null,
        }));

      setItems([...comments, ...feedbacks]);
    } catch (err) {
      setError('Falha ao carregar suas moderações.');
    } finally {
      setLoading(false);
    }
  };

  // Dispara a carga inicial da tela.
  // Tecnologias utilizadas: useEffect.
  // Objetivo: preencher a lista assim que a tela é aberta.
  // Observações: o carregamento único é suficiente porque não há edição local aqui.
  useEffect(() => { load(); }, []);

  return (
    <View style={userStyles.screen}>
      {/* Cabeçalho da área pessoal com atalho para o perfil. */}
      {/* Tecnologias utilizadas: StatusBar, Header e navegação. */}
      {/* Objetivo: contextualizar a tela e permitir retorno ao perfil. */}
      {/* Observações: o gradiente mantém a identidade visual do app. */}
      <StatusBar barStyle="light-content" />
      <Header title="BookV" subtitle="Minhas moderações" colors={HEADER_GRADIENT_COLORS} onRightAction={() => navigation.navigate('Profile')} rightActionLabel="Perfil" />
      <View style={userStyles.content}>
        {/* Estados de carregamento, erro e lista de moderações. */}
        {/* Tecnologias utilizadas: ActivityIndicator, ScrollView e renderização condicional. */}
        {/* Objetivo: mostrar ao usuário o status da consulta antes da lista final. */}
        {/* Observações: o estado vazio evita uma tela sem contexto. */}
        {loading ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator size="large" color="#0f766e" />
          </View>
        ) : error ? (
          <View style={{ padding: 20 }}>
            <Text style={{ color: '#9f1239' }}>{error}</Text>
          </View>
        ) : (
          /* Lista das entradas moderadas com feedback e data quando rejeitado. */
          {/* Tecnologias utilizadas: ScrollView, map e cartões simples. */}
          {/* Objetivo: permitir revisão do que foi publicado, rejeitado ou aprovado. */}
          {/* Observações: feedback do administrador aparece apenas quando disponível. */}
          <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            {items.length === 0 ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Ionicons name="chatbubble-ellipses-outline" size={28} color="#94a3b8" />
                <Text style={{ marginTop: 8, color: '#64748b' }}>Sem moderações recentes.</Text>
              </View>
            ) : items.map((it, index) => (
              <View key={`${it.type || 'item'}-${String(it.id ?? index)}`} style={{ backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
                <Text style={{ fontWeight: '800' }}>{it.bookTitle} - {it.discussionTitle}</Text>
                <Text style={{ color: '#64748b', marginTop: 6 }}>Status: {it.status}</Text>
                <Text style={{ marginTop: 8 }}>{it.text}</Text>
                {it.status === 'rejected' && it.adminFeedback ? (
                  /* Card auxiliar com feedback do administrador para itens rejeitados. */
                  {/* Tecnologias utilizadas: View e textos com destaque visual. */}
                  {/* Objetivo: explicar por que a moderação recusou o conteúdo. */}
                  {/* Observações: a data de moderação ajuda a entender a linha do tempo. */}
                  <View style={{ marginTop: 10, padding: 10, backgroundColor: '#fff7ed', borderRadius: 8, borderWidth: 1, borderColor: '#fdba74' }}>
                    <Text style={{ fontWeight: '800', color: '#9a3412' }}>Feedback do administrador</Text>
                    <Text style={{ marginTop: 6 }}>{it.adminFeedback}</Text>
                    <Text style={{ marginTop: 6, color: '#64748b', fontSize: 12 }}>{it.moderatedAt ? new Date(it.moderatedAt).toLocaleString() : ''}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
      {/* Rodapé persistente da navegação pessoal. */}
      {/* Tecnologias utilizadas: FooterNav. */}
      {/* Objetivo: manter acesso rápido às áreas da conta do usuário. */}
      {/* Observações: activeKey destaca a aba atual de perfil. */}
      <FooterNav navigation={navigation} activeKey="perfil" />
    </View>
  );
}
