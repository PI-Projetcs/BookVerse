import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function RegisterBook() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastrar Livro</Text>

      <TextInput placeholder="Título" style={styles.input} />
      <TextInput placeholder="Autor" style={styles.input} />
      <TextInput placeholder="Categoria" style={styles.input} />
      <TextInput placeholder="URL da Capa" style={styles.input} />

      <Button title="Salvar" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, marginBottom: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 6 }
});