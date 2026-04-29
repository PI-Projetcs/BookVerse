import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ModerateComments() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Moderar Comentários</Text>

      <Text>Comentários pendentes...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, marginBottom: 20 }
});