import { StyleSheet, Text, View } from "react-native";
import FooterNav from '../../components/FooterNav';
import { ADMIN_FOOTER_ITEMS } from '../../constants/adminFooterItems';

/*
 * Tela de perfil do administrador
 * - Visão rápida das informações do usuário administrador e atalhos do painel.
 * - Esta tela é simples e usada como ponto de navegação dentro do painel Admin.
 */

export default function Profile({ navigation }) {
  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Perfil do Admin</Text>
        <Text>Nome: Admin</Text>
        <Text>Email: admin@email.com</Text>
      </View>

      <FooterNav navigation={navigation} activeKey="admin" items={ADMIN_FOOTER_ITEMS} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f4f6' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, marginBottom: 20 },
});
