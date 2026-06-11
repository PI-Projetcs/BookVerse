// Tela de cadastro de usuários.
// Tecnologias utilizadas: React Native e componentes básicos de layout.
// Objetivo: reservar o ponto de entrada para criação de conta no app.
// Observações: a implementação ainda é um placeholder e deve ganhar formulário real.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Componente placeholder da tela de registro.
// Tecnologias utilizadas: View, Text e StyleSheet.
// Objetivo: sinalizar que o fluxo de cadastro ainda não foi implementado.
// Observações: a tela deve ser substituída por formulário com validação e integração ao backend.
export default function RegisterScreen() {
	// Diretrizes para a implementação futura do formulário.
	// Tecnologias utilizadas: authService, useAuth e validações locais.
	// Objetivo: orientar o cadastro com campos obrigatórios e login automático após sucesso.
	// Observações: seguir o mesmo padrão de mensagens e validação da tela de login.

	return (
		// Estrutura visual mínima enquanto o formulário não é criado.
		// Tecnologias utilizadas: contêiner centralizado e texto informativo.
		// Objetivo: evitar uma tela vazia e comunicar o estado atual do recurso.
		// Observações: a interface é intencionalmente simples para não sugerir funcionalidade pronta.
		<View style={styles.container}>
			<Text style={styles.placeholder}>Tela de cadastro (placeholder)</Text>
			<Text style={styles.hint}>TODO: implementar formulário (ver `LoginScreen` para referência)</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
	placeholder: { color: '#64748b' },
});
