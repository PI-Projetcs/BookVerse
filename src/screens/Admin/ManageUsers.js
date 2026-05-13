import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ManageUsers() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciar Usuários</Text>
      <Text>Lista de usuários aqui...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, marginBottom: 20 }
});