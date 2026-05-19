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

export default function LoginScreen({ navigation, route }) {
	const { signIn } = useAuth();
	const initialTab = route?.params?.initialTab === 'register' ? 'register' : 'login';
	const [activeTab, setActiveTab] = useState(initialTab);

	const [showLoginPassword, setShowLoginPassword] = useState(false);
	const [showRegisterPassword, setShowRegisterPassword] = useState(false);
	const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

	const [loginEmail, setLoginEmail] = useState('');
	const [loginPassword, setLoginPassword] = useState('');

	const [registerName, setRegisterName] = useState('');
	const [registerEmail, setRegisterEmail] = useState('');
	const [registerPassword, setRegisterPassword] = useState('');
	const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

	// Navegação de teste - substituir por lógica real de autenticação
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

	const handleLogin = async () => {
		if (!loginEmail || !loginPassword) {
			Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
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
			Alert.alert('Falha no login', extractApiErrorMessage(error, 'Nao foi possivel autenticar com o servidor.'));
		}
	};

	const handleRegister = async () => {
		if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
			Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
			return;
		}

		if (registerPassword !== registerConfirmPassword) {
			Alert.alert('Atenção', 'As senhas não coincidem.');
			return;
		}

		if (registerPassword.length < 6) {
			Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
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
			Alert.alert('Falha no cadastro', extractApiErrorMessage(error, 'Nao foi possivel concluir o cadastro no servidor.'));
		}
	};

	const isLogin = activeTab === 'login';

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="light-content" />
			<KeyboardAvoidingView
				style={styles.flex}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<View style={styles.phoneFrame}>
					<Header />

					<ScrollView
						contentContainerStyle={styles.content}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						<View style={styles.tabsContainer}>
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
