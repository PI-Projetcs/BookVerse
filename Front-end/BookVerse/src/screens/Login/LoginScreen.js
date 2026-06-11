import React, { useEffect, useState } from 'react';
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StatusBar,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { loginUser, registerUser } from '../../services/authService';
import { loginStyles as styles } from '../../styles/loginStyles';

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

// Tela de autenticação com login e cadastro na mesma interface.
// Tecnologias utilizadas: React Native, Expo LinearGradient, Header, useAuth e serviços de auth.
// Objetivo: concentrar entrada de conta e criação de usuário em um fluxo único.
// Observações: a tela prioriza validação local, mensagens claras e alternância por abas.

// Extrai mensagens de erro do backend em formatos diferentes.
// Tecnologias utilizadas: acesso defensivo a objetos e status HTTP.
// Objetivo: transformar respostas inconsistentes em feedback compreensível.
// Observações: o fallback final evita expor erros técnicos ao usuário.
function extractApiErrorMessage(error, fallbackMessage) {
	const data = error?.response?.data;
	const status = Number(error?.response?.status || 0);

	if (typeof data === 'string' && data.trim()) {
		return data;
	}

	if (typeof data?.mensagem === 'string' && data.mensagem.trim()) {
		return data.mensagem;
	}

	if (Array.isArray(data?.errors) && data.errors.length > 0) {
		return String(data.errors[0]);
	}

	if (typeof data?.message === 'string' && data.message.trim()) {
		return data.message;
	}

	if (status === 403) {
		return 'Conta excluída. Entre em contato com o administrador.';
	}

	if (typeof error?.message === 'string' && error.message.trim()) {
		return error.message;
	}

	return fallbackMessage;
}

// Componente principal da tela de login e cadastro.
// Tecnologias utilizadas: useState, useEffect, Alert, TextInput, React Navigation e AuthContext.
// Objetivo: validar credenciais, autenticar o usuário e registrar novas contas.
// Observações: o fluxo reaproveita a mesma sessão após login ou cadastro bem-sucedido.
export default function LoginScreen({ navigation, route }) {
	const { signIn } = useAuth();
	const initialTab = route?.params?.initialTab === 'register' ? 'register' : 'login';
	const [activeTab, setActiveTab] = useState(initialTab);

	const [showLoginPassword, setShowLoginPassword] = useState(false);
	const [showRegisterPassword, setShowRegisterPassword] = useState(false);
	const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

	const [loginEmail, setLoginEmail] = useState('');
	const [loginPassword, setLoginPassword] = useState('');

	const [loginError, setLoginError] = useState(null);

	const [registerName, setRegisterName] = useState('');
	const [registerEmail, setRegisterEmail] = useState('');
	const [registerPassword, setRegisterPassword] = useState('');
	const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
	const [registerError, setRegisterError] = useState(null);

	// Atalho temporário para navegação de teste.
	// Tecnologias utilizadas: React Navigation e Alert.
	// Objetivo: facilitar depuração durante desenvolvimento local.
	// Observações: o bloco permanece comentado para não interferir no fluxo real.
	// const goTo = (routeName) => {
	// 	if (navigation && typeof navigation.navigate === 'function') {
	// 		navigation.navigate(routeName);
	// 		return;
	// 	}
	// 	Alert.alert('Navegação', `Navegar para: ${routeName}`);
	// };

	useEffect(() => {
		setActiveTab(initialTab);
	}, [initialTab]);

	// Realiza login após validações básicas do formulário.
	// Tecnologias utilizadas: loginUser, signIn, Alert e regex de validação.
	// Objetivo: autenticar o usuário com retorno imediato de erro ou sucesso.
	// Observações: valida email e senha antes de chamar a API para reduzir requisições inválidas.
	const handleLogin = async () => {
		setLoginError(null);

		if (!loginEmail || !loginPassword) {
			setLoginError('Por favor, preencha todos os campos.');
			return;
		}

		const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
		if (!emailPattern.test(loginEmail)) {
			setLoginError('Formato de email inválido.');
			return;
		}

		const passwordAllowed = /^[\x21-\x7E]+$/;
		if (!passwordAllowed.test(loginPassword)) {
			setLoginError('Senha contém caracteres inválidos.');
			return;
		}

		try {
			const session = await loginUser({
				email: loginEmail,
				password: loginPassword,
			});

			await signIn(session);
			Alert.alert(
				'Sucesso',
				session.role === 'admin' ? 'Bem-vindo, Administrador!' : 'Login realizado com sucesso!'
			);
		} catch (error) {
			const msg = extractApiErrorMessage(error, 'Nao foi possivel autenticar com o servidor.');
			setLoginError(msg);
		}
	};

	// Cadastra um novo usuário e inicia a sessão automaticamente.
	// Tecnologias utilizadas: registerUser, signIn, Alert e validações locais.
	// Objetivo: criar conta com confirmação de senha e feedback claro.
	// Observações: a senha precisa seguir regras mínimas antes de ir ao backend.

	const handleRegister = async () => {
		setRegisterError(null);

		if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
			setRegisterError('Por favor, preencha todos os campos.');
			return;
		}

		if (registerPassword !== registerConfirmPassword) {
			Alert.alert('Atenção', 'As senhas não coincidem.');
			return;
		}

		if (registerPassword.length < 6) {
			setRegisterError('A senha deve ter pelo menos 6 caracteres.');
			return;
		}

		const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
		if (!emailPattern.test(registerEmail)) {
			setRegisterError('Formato de email inválido.');
			return;
		}

		const passwordAllowed = /^[\x21-\x7E]+$/;
		if (!passwordAllowed.test(registerPassword)) {
			setRegisterError('Senha contém caracteres inválidos.');
			return;
		}

		try {
			const session = await registerUser({
				name: registerName,
				email: registerEmail,
				password: registerPassword,
				passwordConfirmation: registerConfirmPassword,
			});

			await signIn(session);
			Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
		} catch (error) {
			const msg = extractApiErrorMessage(error, 'Nao foi possivel concluir o cadastro no servidor.');
			setRegisterError(msg);
		}
	};

	// Indica qual formulário está visível na interface.
	// Tecnologias utilizadas: estado derivado simples.
	// Objetivo: simplificar a renderização condicional entre entrar e cadastrar.
	// Observações: o valor muda com a aba e também com a rota inicial.
	const isLogin = activeTab === 'login';

	return (
		<SafeAreaView style={styles.safeArea}>
			{/* Estrutura principal da tela de autenticação. */}
			{/* Tecnologias utilizadas: SafeAreaView, KeyboardAvoidingView e ScrollView. */}
			{/* Objetivo: manter a tela legível e ajustar o conteúdo ao teclado. */}
			{/* Observações: o comportamento do teclado varia por plataforma. */}
			<StatusBar barStyle="light-content" />
			<KeyboardAvoidingView
				style={styles.flex}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<View style={styles.phoneFrame}>
					<Header />

					{/* Área rolável com abas e formulários de acesso. */}
					{/* Tecnologias utilizadas: ScrollView, TouchableOpacity e TextInput. */}
					{/* Objetivo: permitir alternar entre login e cadastro sem sair da página. */}
					{/* Observações: keyboardShouldPersistTaps evita fechamento indevido do teclado. */}
					<ScrollView
						contentContainerStyle={styles.content}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						<View style={styles.tabsContainer}>
							{/* Abas que alternam entre autenticação e cadastro. */}
							{/* Tecnologias utilizadas: TouchableOpacity e estado de seleção. */}
							{/* Objetivo: separar visualmente os dois fluxos da tela. */}
							{/* Observações: accessibilityState ajuda leitores de tela a identificar a aba ativa. */}
							<TouchableOpacity
								style={[styles.tabButton, isLogin && styles.tabButtonActive]}
								onPress={() => setActiveTab('login')}
								hitSlop={HIT_SLOP}
								accessibilityRole="tab"
								accessibilityLabel="Aba Entrar"
								accessibilityState={{ selected: isLogin }}
							>
								<Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Entrar</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.tabButton, !isLogin && styles.tabButtonActive]}
								onPress={() => setActiveTab('register')}
								hitSlop={HIT_SLOP}
								accessibilityRole="tab"
								accessibilityLabel="Aba Cadastrar"
								accessibilityState={{ selected: !isLogin }}
							>
								<Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Cadastrar</Text>
							</TouchableOpacity>
						</View>

						{isLogin ? (
							/* Formulário de entrada com email, senha e ação de login. */
							{/* Tecnologias utilizadas: TextInput, Ionicons, TouchableOpacity e validações locais. */}
							{/* Objetivo: autenticar o usuário e abrir a sessão do app. */}
							{/* Observações: o feedback de erro aparece logo abaixo do email. */}
							<View style={styles.form}>
								<Text style={styles.label}>Email</Text>
								<View style={styles.inputWrapper}>
									<Ionicons name="mail-outline" size={18} color="#6b7280" style={styles.inputIcon} />
									<TextInput
										value={loginEmail}
										onChangeText={setLoginEmail}
										placeholder="seu@email.com"
										keyboardType="email-address"
										autoCapitalize="none"
										style={styles.input}
										accessibilityLabel="Campo de email para login"
									/>
								</View>

								{loginError ? <Text style={{ color: 'red', marginTop: 8 }}>{loginError}</Text> : null}

								<Text style={styles.label}>Senha</Text>
								<View style={styles.inputWrapper}>
									<Ionicons name="lock-closed-outline" size={18} color="#6b7280" style={styles.inputIcon} />
									<TextInput
										value={loginPassword}
										onChangeText={setLoginPassword}
										placeholder="Digite sua senha"
										secureTextEntry={!showLoginPassword}
										style={styles.input}
										accessibilityLabel="Campo de senha para login"
									/>
									<TouchableOpacity
										onPress={() => setShowLoginPassword((prev) => !prev)}
										hitSlop={HIT_SLOP}
										accessibilityRole="button"
										accessibilityLabel={showLoginPassword ? 'Ocultar senha do login' : 'Mostrar senha do login'}
									>
										<Ionicons
											name={showLoginPassword ? 'eye-off-outline' : 'eye-outline'}
											size={18}
											color="#6b7280"
										/>
									</TouchableOpacity>
								</View>

								<TouchableOpacity
									style={styles.buttonTouch}
									onPress={handleLogin}
									hitSlop={HIT_SLOP}
									accessibilityRole="button"
									accessibilityLabel="Entrar na conta"
								>
									<LinearGradient
										colors={['#7D1F3E', '#1e293b', '#065f46']}
										start={{ x: 0, y: 0.5 }}
										end={{ x: 1, y: 0.5 }}
										style={styles.primaryButton}
									>
										<Text style={styles.primaryButtonText}>Entrar</Text>
									</LinearGradient>
								</TouchableOpacity>

								<View style={styles.infoBox}>
									{/* Credenciais de teste para agilizar a validação local. */}
									{/* Tecnologias utilizadas: TouchableOpacity e preenchimento programático de estado. */}
									{/* Objetivo: reduzir atrito durante demonstração e testes manuais. */}
									{/* Observações: em produção, esse bloco deveria ser removido ou ocultado. */}
									<Text style={styles.infoTitle}>Credenciais de teste:</Text>
									<TouchableOpacity 
										onPress={() => {
											setLoginEmail('admin@bookverse.com');
											setLoginPassword('admin123');
										}}
									>
										<Text style={styles.infoText}>Admin: admin@bookverse.com / admin123 (Toque para preencher)</Text>
									</TouchableOpacity>
									<TouchableOpacity 
										onPress={() => {
											setLoginEmail('user@test.com');
											setLoginPassword('user123');
										}}
									>
										<Text style={styles.infoText}>Membro: user@test.com / user123 (Toque para preencher)</Text>
									</TouchableOpacity>
								</View>

							</View>
						) : (
							/* Formulário de cadastro com confirmação de senha e criação de conta. */}
							{/* Tecnologias utilizadas: TextInput, Ionicons, TouchableOpacity e Alert. */}
							{/* Objetivo: registrar um novo usuário com validação mínima de segurança. */}
							{/* Observações: o campo de confirmação ajuda a evitar erro de digitação. */}
							<View style={styles.form}>
								<Text style={styles.label}>Nome completo</Text>
								<View style={styles.inputWrapper}>
									<Ionicons name="person-outline" size={18} color="#6b7280" style={styles.inputIcon} />
									<TextInput
										value={registerName}
										onChangeText={setRegisterName}
										placeholder="Seu nome"
										style={styles.input}
										accessibilityLabel="Campo de nome completo"
									/>
								</View>

								<Text style={styles.label}>Email</Text>
								<View style={styles.inputWrapper}>
									<Ionicons name="mail-outline" size={18} color="#6b7280" style={styles.inputIcon} />
									<TextInput
										value={registerEmail}
										onChangeText={setRegisterEmail}
										placeholder="seu@email.com"
										keyboardType="email-address"
										autoCapitalize="none"
										style={styles.input}
										accessibilityLabel="Campo de email para cadastro"
									/>
								</View>

								<Text style={styles.label}>Senha</Text>
								<View style={styles.inputWrapper}>
									<Ionicons name="lock-closed-outline" size={18} color="#6b7280" style={styles.inputIcon} />
									<TextInput
										value={registerPassword}
										onChangeText={setRegisterPassword}
										placeholder="Minimo 6 caracteres"
										secureTextEntry={!showRegisterPassword}
										style={styles.input}
										accessibilityLabel="Campo de senha para cadastro"
									/>
									<TouchableOpacity
										onPress={() => setShowRegisterPassword((prev) => !prev)}
										hitSlop={HIT_SLOP}
										accessibilityRole="button"
										accessibilityLabel={showRegisterPassword ? 'Ocultar senha do cadastro' : 'Mostrar senha do cadastro'}
									>
										<Ionicons
											name={showRegisterPassword ? 'eye-off-outline' : 'eye-outline'}
											size={18}
											color="#6b7280"
										/>
									</TouchableOpacity>
								</View>

								<Text style={styles.label}>Confirmar senha</Text>
								<View style={styles.inputWrapper}>
									<Ionicons name="lock-closed-outline" size={18} color="#6b7280" style={styles.inputIcon} />
									<TextInput
										value={registerConfirmPassword}
										onChangeText={setRegisterConfirmPassword}
										placeholder="Repita sua senha"
										secureTextEntry={!showRegisterConfirmPassword}
										style={styles.input}
										accessibilityLabel="Campo para confirmar senha"
									/>
									<TouchableOpacity
										onPress={() => setShowRegisterConfirmPassword((prev) => !prev)}
										hitSlop={HIT_SLOP}
										accessibilityRole="button"
										accessibilityLabel={showRegisterConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
									>
										<Ionicons
											name={showRegisterConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
											size={18}
											color="#6b7280"
										/>
									</TouchableOpacity>
								</View>

								<TouchableOpacity
									style={styles.buttonTouch}
									onPress={handleRegister}
									hitSlop={HIT_SLOP}
									accessibilityRole="button"
									accessibilityLabel="Criar conta"
								>
									<LinearGradient
										colors={['#065f46', '#1e293b', '#7D1F3E']}
										start={{ x: 0, y: 0.5 }}
										end={{ x: 1, y: 0.5 }}
										style={styles.secondaryButton}
									>
										<Text style={styles.primaryButtonText}>Criar conta</Text>
									</LinearGradient>
								</TouchableOpacity>
							</View>
						)}
					</ScrollView>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
