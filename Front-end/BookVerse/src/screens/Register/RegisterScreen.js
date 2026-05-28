/*
 * Tela de Registro
 * - Formulário de cadastro de novos usuários. Deve validar campos localmente
 *   (email, senha, confirmação) e delegar a criação ao `authService.registerUser`.
 * - Atualmente é um placeholder; implementar campos e lógica de formulário conforme o `LoginScreen`.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RegisterScreen() {
	// Implementação sugerida:
	// - Campos: `name`, `email`, `password`, `passwordConfirmation`.
	// - Validações locais: presença, formato do email, tamanho mínimo da senha,
	//   correspondência entre senha e confirmação.
	// - Fluxo: ao submeter, chamar `registerUser(payload)` e, em caso de sucesso,
	//   reutilizar `signIn(session)` para iniciar sessão automaticamente.
	// - Tratar erros com mensagens amigáveis usando padrão similar ao `LoginScreen`.

	return (
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
