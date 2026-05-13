import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FooterNav from '../../components/FooterNav';
import Header from '../../components/Header';
import { ADMIN_FOOTER_ITEMS } from '../../constants/adminFooterItems';
import { useAuth } from '../../context/AuthContext';

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

const quickActions = [
  {
    key: 'register-books',
    label: 'Cadastro de Livros',
    icon: 'book-outline',
    route: 'RegisterBook',
    iconColor: '#ccfbf1',
    iconBackground: '#0f766e',
  },
  {
    key: 'manage-books',
    label: 'Gerenciar Livros',
    icon: 'library-outline',
    route: 'AdminBooks',
    iconColor: '#fef3c7',
    iconBackground: '#C4A12C',
  },
  {
    key: 'members',
    label: 'Gerenciar Membros',
    icon: 'people-outline',
    route: 'ManageUsers',
    iconColor: '#f8fafc',
    iconBackground: '#5E6D3C',
  },
  {
    key: 'month',
    label: 'Livro do Mês',
    icon: 'star-outline',
    route: 'BookOfMonth',
    iconColor: '#fef9c3',
    iconBackground: '#b45309',
  },
  {
    key: 'comments',
    label: 'Moderar Comentários',
    icon: 'chatbox-outline',
    route: 'ModerateComments',
    iconColor: '#fde2e7',
    iconBackground: '#6B1730',
  },
];

export default function Admin({ navigation }) {
  const { signOut } = useAuth();

  const blurFocusedElement = () => {
    if (typeof document === 'undefined') {
      return;
    }

    const focused = document.activeElement;
    if (focused && typeof focused.blur === 'function') {
      focused.blur();
    }
  };

	const handleLogout = async () => {
    blurFocusedElement();
    await signOut();
	};

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <Header
        title="BookV"
        subtitle="Dashboard Admin"
        onRightAction={handleLogout}
        rightActionLabel="Sair"
      />

      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          <View style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>Ações Rápidas</Text>

            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={styles.actionRow}
                activeOpacity={0.88}
				onPress={() => {
					blurFocusedElement();
					navigation.navigate(action.route);
				}}
                hitSlop={HIT_SLOP}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                <View style={styles.actionStart}>
                  <View style={[styles.actionIconWrap, { backgroundColor: action.iconBackground }]}>
                    <Ionicons name={action.icon} size={15} color={action.iconColor} />
                  </View>
                  <Text style={styles.actionText}>{action.label}</Text>
                </View>

                <View style={styles.actionEnd}>
                  <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>

      <FooterNav navigation={navigation} activeKey="admin" items={ADMIN_FOOTER_ITEMS} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  actionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  actionRow: {
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
  },
  actionStart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#202939',
    fontSize: 12,
    fontWeight: '700',
  },
  actionEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomSpacer: {
    height: 4,
  },
});