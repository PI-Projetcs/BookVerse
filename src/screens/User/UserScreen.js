import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../components/Header';
import FooterNav from '../../components/FooterNav';
import styles from '../../styles/UserStyles';

export default function UserScreen({ navigation }) {
	const handleLogout = () => {
		if (navigation?.reset) {
			navigation.reset({
				index: 0,
				routes: [{ name: 'Login', params: { initialTab: 'login' } }],
			});
			return;
		}

		navigation?.navigate?.('Login', { initialTab: 'login' });
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="light-content" />
			<View style={styles.container}>
				<Header title="BookVerse" subtitle="Seu perfil" onRightAction={handleLogout} rightActionLabel="Sair" />

				<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
					<View style={styles.card}>
						<Text style={styles.title}>Perfil</Text>
						<Text style={styles.subtitle}>
							Esta tela é um placeholder para conectar a navegação. Aqui você pode exibir dados do usuário (nome, metas,
							histórico, preferências) quando o backend/estado global estiver pronto.
						</Text>

						<View style={styles.row}>
							<View style={styles.chip}>
								<Text style={styles.chipText}>Leituras: 12</Text>
							</View>
							<View style={styles.chip}>
								<Text style={styles.chipText}>Sequência: 5 dias</Text>
							</View>
						</View>

						<TouchableOpacity
							activeOpacity={0.9}
							style={styles.button}
							onPress={() => navigation?.navigate?.('Catalog')}
						>
							<Text style={styles.buttonText}>Ver catálogo</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>

				<FooterNav navigation={navigation} activeKey="perfil" />
			</View>
		</SafeAreaView>
	);
}

