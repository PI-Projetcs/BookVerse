import { StyleSheet, Text, View } from "react-native";
import FooterNav from '../../components/FooterNav';
import { ADMIN_FOOTER_ITEMS } from '../../constants/adminFooterItems';

// Tela simples de perfil do administrador.
// Tecnologias utilizadas: React Native, FooterNav e itens fixos do painel.
// Objetivo: exibir uma visão rápida de identificação e servir como ponto de navegação.
// Observações: os dados são estáticos e funcionam como placeholder de contexto.

// Componente enxuto para mostrar a identidade do admin e manter o footer visível.
// Tecnologias utilizadas: React, View, Text e FooterNav.
// Objetivo: oferecer uma tela de apoio dentro da navegação administrativa.
// Observações: a simplicidade aqui evita distrações desnecessárias ao gestor.
export default function Profile({ navigation }) {
  return (
    <View style={styles.screen}>
      {/* Bloco de identificação do administrador. */}
      {/* Tecnologias utilizadas: Text e contêineres básicos do React Native. */}
      {/* Objetivo: sinalizar rapidamente qual perfil está sendo exibido. */}
      {/* Observações: estes dados podem ser substituídos por conteúdo dinâmico depois. */}
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
