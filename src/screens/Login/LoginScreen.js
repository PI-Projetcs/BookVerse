import React, { useState } from 'react';
import {
	Alert,
	Dimensions,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
	const [activeTab, setActiveTab] = useState('login');

	const [showLoginPassword, setShowLoginPassword] = useState(false);
	const [showRegisterPassword, setShowRegisterPassword] = useState(false);
	const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

	const [loginEmail, setLoginEmail] = useState('');
	const [loginPassword, setLoginPassword] = useState('');

	const [registerName, setRegisterName] = useState('');
	const [registerEmail, setRegisterEmail] = useState('');
	const [registerPassword, setRegisterPassword] = useState('');
	const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

	const goTo = (routeName) => {
		if (navigation && typeof navigation.navigate === 'function') {
			navigation.navigate(routeName);
			return;
		}
		Alert.alert('Navegacao', `Navegar para: ${routeName}`);
	};

	const handleLogin = () => {
		if (!loginEmail || !loginPassword) {
			Alert.alert('Atencao', 'Por favor, preencha todos os campos.');
			return;
		}

		if (loginEmail === 'admin@bookverse.com' && loginPassword === 'admin123') {
			Alert.alert('Sucesso', 'Bem-vindo, Administrador!');
			goTo('AdminDashboard');
			return;
		}

		Alert.alert('Sucesso', 'Login realizado com sucesso!');
		goTo('Home');
	};

	const handleRegister = () => {
		if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
			Alert.alert('Atencao', 'Por favor, preencha todos os campos.');
			return;
		}

		if (registerPassword !== registerConfirmPassword) {
			Alert.alert('Atencao', 'As senhas nao coincidem.');
			return;
		}

		if (registerPassword.length < 6) {
			Alert.alert('Atencao', 'A senha deve ter pelo menos 6 caracteres.');
			return;
		}

		Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
		goTo('Home');
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
					<LinearGradient
						colors={['#881337', '#0f172a', '#064e3b']}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						style={styles.header}
					>
						<View style={styles.headerOverlay}>
							<View style={styles.brandRow}>
								<MaterialCommunityIcons name="book-open-page-variant" size={32} color="#facc15" />
								<Text style={styles.brandTitle}>BookVerse</Text>
							</View>
							<Text style={styles.brandSubtitle}>Seu clube do livro digital</Text>
						</View>
					</LinearGradient>

					<ScrollView
						contentContainerStyle={styles.content}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						<View style={styles.tabsContainer}>
							<TouchableOpacity
								style={[styles.tabButton, isLogin && styles.tabButtonActive]}
								onPress={() => setActiveTab('login')}
							>
								<Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Entrar</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.tabButton, !isLogin && styles.tabButtonActive]}
								onPress={() => setActiveTab('register')}
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
									/>
									<TouchableOpacity onPress={() => setShowLoginPassword((prev) => !prev)}>
										<Ionicons
											name={showLoginPassword ? 'eye-off-outline' : 'eye-outline'}
											size={18}
											color="#6b7280"
										/>
									</TouchableOpacity>
								</View>

								<TouchableOpacity style={styles.buttonTouch} onPress={handleLogin}>
									<LinearGradient
										colors={['#9f1239', '#1e293b', '#065f46']}
										start={{ x: 0, y: 0.5 }}
										end={{ x: 1, y: 0.5 }}
										style={styles.primaryButton}
									>
										<Text style={styles.primaryButtonText}>Entrar</Text>
									</LinearGradient>
								</TouchableOpacity>

								<View style={styles.infoBox}>
									<Text style={styles.infoTitle}>Credenciais de teste:</Text>
									<Text style={styles.infoText}>Admin: admin@bookverse.com / admin123</Text>
									<Text style={styles.infoText}>Membro: qualquer email / qualquer senha</Text>
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
									/>
									<TouchableOpacity onPress={() => setShowRegisterPassword((prev) => !prev)}>
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
									/>
									<TouchableOpacity onPress={() => setShowRegisterConfirmPassword((prev) => !prev)}>
										<Ionicons
											name={showRegisterConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
											size={18}
											color="#6b7280"
										/>
									</TouchableOpacity>
								</View>

								<TouchableOpacity style={styles.buttonTouch} onPress={handleRegister}>
									<LinearGradient
										colors={['#065f46', '#1e293b', '#9f1239']}
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

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
		backgroundColor: '#111827',
	},
	phoneFrame: {
		width: Math.min(width - 24, 428),
		height: Math.min(height - 24, 926),
		alignSelf: 'center',
		marginVertical: 12,
		borderRadius: 28,
		backgroundColor: '#f9fafb',
		overflow: 'hidden',
		borderWidth: 8,
		borderColor: '#1f2937',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 18 },
		shadowOpacity: 0.35,
		shadowRadius: 24,
		elevation: 16,
	},
	header: {
		borderBottomWidth: 3,
		borderBottomColor: 'rgba(202, 138, 4, 0.75)',
	},
	headerOverlay: {
		paddingVertical: 24,
		paddingHorizontal: 18,
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
	},
	brandRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 8,
		marginBottom: 6,
	},
	brandTitle: {
		color: '#fefce8',
		fontSize: 30,
		fontWeight: '800',
		letterSpacing: 0.6,
	},
	brandSubtitle: {
		color: 'rgba(253, 230, 138, 0.85)',
		textAlign: 'center',
		fontSize: 12,
	},
	content: {
		paddingHorizontal: 20,
		paddingTop: 24,
		paddingBottom: 32,
	},
	tabsContainer: {
		flexDirection: 'row',
		borderRadius: 10,
		backgroundColor: '#f3f4f6',
		marginBottom: 20,
		padding: 4,
	},
	tabButton: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 10,
		borderRadius: 8,
	},
	tabButtonActive: {
		backgroundColor: '#ffffff',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 3,
		elevation: 1,
	},
	tabText: {
		color: '#4b5563',
		fontWeight: '700',
	},
	tabTextActive: {
		color: '#111827',
	},
	form: {
		gap: 12,
	},
	label: {
		fontWeight: '700',
		color: '#111827',
		fontSize: 14,
		marginBottom: 6,
	},
	inputWrapper: {
		borderWidth: 2,
		borderColor: '#d1d5db',
		borderRadius: 10,
		backgroundColor: '#ffffff',
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10,
		height: 46,
	},
	inputIcon: {
		marginRight: 8,
	},
	input: {
		flex: 1,
		color: '#111827',
		fontSize: 14,
	},
	buttonTouch: {
		marginTop: 12,
		borderRadius: 10,
		overflow: 'hidden',
	},
	primaryButton: {
		borderRadius: 10,
		paddingVertical: 13,
		alignItems: 'center',
	},
	secondaryButton: {
		borderRadius: 10,
		paddingVertical: 13,
		alignItems: 'center',
	},
	primaryButtonText: {
		color: '#fefce8',
		fontWeight: '800',
		fontSize: 15,
	},
	infoBox: {
		marginTop: 16,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: '#fcd34d',
		backgroundColor: '#fffbeb',
		padding: 12,
		gap: 4,
	},
	infoTitle: {
		color: '#92400e',
		fontWeight: '800',
		fontSize: 12,
	},
	infoText: {
		color: '#92400e',
		fontSize: 12,
	},
});
