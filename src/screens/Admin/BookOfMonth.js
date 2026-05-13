import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function BookOfMonth() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Livro do Mês</Text>

      <Text>Livro atual: Nenhum</Text>

      <Button title="Selecionar Livro" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, marginBottom: 20 }
});