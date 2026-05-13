import React from 'react';
import { View, Text, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import FooterNav from '../../components/FooterNav';
import { styles } from '../../styles/UserStyles';
import { HEADER_GRADIENT_COLORS } from '../../styles/headerStyles';
import { useAuth } from '../../context/AuthContext';

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

const UserScreen = ({ navigation }) => {
  const { session, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <Header
        title="BookV"
        subtitle="Perfil"
        colors={HEADER_GRADIENT_COLORS}
        onRightAction={handleLogout}
        rightActionLabel="Sair"
      />

      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          <View style={styles.profileCard}>
            <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb' }]}>
              <Ionicons name="person-outline" size={30} color="#374151" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{session?.name || 'Usuario'}</Text>
              <Text style={styles.profileUsername}>{session?.email || 'Sem email'}</Text>
              {session?.role ? <Text style={styles.profileBio}>Perfil: {session.role}</Text> : null}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Conta</Text>
            <Text style={styles.profileBio}>Este perfil usa apenas dados da sessao e do backend.</Text>
            <TouchableOpacity
              style={[styles.statCard, { marginTop: 12 }]}
              onPress={handleLogout}
              hitSlop={HIT_SLOP}
              accessibilityRole="button"
              accessibilityLabel="Sair da conta"
            >
              <View style={[styles.statIconWrap, { backgroundColor: 'rgba(125,31,62,0.12)' }]}>
                <Ionicons name="log-out-outline" size={16} color="#7D1F3E" />
              </View>
              <Text style={styles.statLabel}>Sair</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 10 }} />
        </ScrollView>
      </View>

      <FooterNav navigation={navigation} activeKey="perfil" />
    </View>
  );
};

export default UserScreen;
