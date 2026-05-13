import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Admin({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel Admin</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RegisterBook')}>
        <Text style={styles.text}>Cadastrar Livro</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ManageUsers')}>
        <Text style={styles.text}>Gerenciar Usuários</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('BookOfMonth')}>
        <Text style={styles.text}>Livro do Mês</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ModerateComments')}>
        <Text style={styles.text}>Moderar Comentários</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Profile')}>
        <Text style={styles.text}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: '#7a0', padding: 15, marginBottom: 10, borderRadius: 8 },
  text: { color: '#fff', textAlign: 'center' }
});