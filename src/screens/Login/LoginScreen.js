import React, { useState } from 'react';
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	SafeAreaView,
	ScrollView,
	StatusBar,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../../components/Header';
import { loginStyles as styles } from '../../styles/loginStyles';

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
