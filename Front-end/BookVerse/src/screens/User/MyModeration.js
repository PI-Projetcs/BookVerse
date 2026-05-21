import React, { useEffect, useState } from 'react';
import { View, Text, StatusBar, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import FooterNav from '../../components/FooterNav';
import { HEADER_GRADIENT_COLORS } from '../../styles/headerStyles';
import api from '../../services/api';
import { styles as userStyles } from '../../styles/UserStyles';

export default function MyModeration({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/v1/comments/me/moderation');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Falha ao carregar suas moderações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <View style={userStyles.screen}>
      <StatusBar barStyle="light-content" />
      <Header title="BookV" subtitle="Minhas moderações" colors={HEADER_GRADIENT_COLORS} onRightAction={() => navigation.navigate('Profile')} rightActionLabel="Perfil" />
      <View style={userStyles.content}>
        {loading ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator size="large" color="#0f766e" />
          </View>
        ) : error ? (
          <View style={{ padding: 20 }}>
            <Text style={{ color: '#9f1239' }}>{error}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            {items.length === 0 ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Ionicons name="chatbubble-ellipses-outline" size={28} color="#94a3b8" />
                <Text style={{ marginTop: 8, color: '#64748b' }}>Sem moderações recentes.</Text>
              </View>
            ) : items.map((it) => (
              <View key={String(it.id)} style={{ backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
                <Text style={{ fontWeight: '800' }}>{it.bookTitle} - {it.discussionTitle}</Text>
                <Text style={{ color: '#64748b', marginTop: 6 }}>Status: {it.status}</Text>
                <Text style={{ marginTop: 8 }}>{it.text}</Text>
                {it.status === 'rejected' && it.adminFeedback ? (
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
      <FooterNav navigation={navigation} activeKey="perfil" />
    </View>
  );
}
