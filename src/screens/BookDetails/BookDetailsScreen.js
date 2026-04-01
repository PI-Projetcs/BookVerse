import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Image,
	SafeAreaView,
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getBookById } from '../../services/bookService';
import FooterNav from '../../components/FooterNav';
import { bookDetailsStyles as styles } from '../../styles/bookDetailsStyles';

const FALLBACK_COVER = 'https://placehold.co/420x640/0f172a/f8fafc?text=Sem+Capa';

export default function BookDetailsScreen({ navigation, route }) {
	const bookId = route?.params?.id;
	const [book, setBook] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		let isMounted = true;

		const loadDetails = async () => {
			try {
				setIsLoading(true);
				setErrorMessage('');
				const result = await getBookById(bookId);
				if (isMounted) {
					setBook(result || null);
				}
			} catch (error) {
				if (isMounted) {
					setErrorMessage('Nao foi possivel carregar os detalhes do livro.');
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		if (bookId) {
			loadDetails();
		} else {
			setErrorMessage('Livro nao encontrado.');
			setIsLoading(false);
		}

		return () => {
			isMounted = false;
		};
	}, [bookId]);

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="light-content" />

			<LinearGradient
				colors={['#881337', '#0f172a', '#064e3b']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				style={styles.header}
			>
				<View style={styles.headerOverlay}>
					<TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
						<Ionicons name="arrow-back" size={20} color="#fef3c7" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Detalhes do Livro</Text>
				</View>
			</LinearGradient>

			{isLoading ? (
				<View style={styles.centeredContainer}>
					<ActivityIndicator size="large" color="#0f766e" />
					<Text style={styles.feedbackText}>Carregando detalhes...</Text>
				</View>
			) : null}

			{!isLoading && !!errorMessage ? (
				<View style={styles.centeredContainer}>
					<Text style={styles.errorText}>{errorMessage}</Text>
				</View>
			) : null}

			{!isLoading && !errorMessage && book ? (
				<View style={styles.bodyArea}>
					<ScrollView contentContainerStyle={styles.content}>
						<View style={styles.topCard}>
							<Image source={{ uri: book.coverUrl || FALLBACK_COVER }} style={styles.cover} resizeMode="cover" />
							<View style={styles.topInfo}>
								<Text style={styles.title}>{book.title || 'Sem titulo'}</Text>
								<Text style={styles.author}>{book.author || 'Autor nao informado'}</Text>
								<View style={styles.metaChip}>
									<Text style={styles.metaChipText}>{book.genre || 'Geral'}</Text>
								</View>
								<Text style={styles.metaText}>Ano: {book.year || '----'}</Text>
								<View style={styles.ratingRow}>
									<Ionicons name="star" size={16} color="#f59e0b" />
									<Text style={styles.ratingText}>{Number(book.rating || 0).toFixed(1)}</Text>
								</View>
							</View>
						</View>

						<View style={styles.sectionCard}>
							<Text style={styles.sectionTitle}>Sinopse</Text>
							<Text style={styles.sectionText}>{book.synopsis || 'Sem sinopse cadastrada.'}</Text>
						</View>

						<View style={styles.sectionCard}>
							<Text style={styles.sectionTitle}>Sobre o Autor</Text>
							<Text style={styles.sectionText}>{book.authorBio || 'Sem biografia cadastrada.'}</Text>
						</View>
					</ScrollView>
					<FooterNav navigation={navigation} activeKey="livros" />
				</View>
			) : null}
		</SafeAreaView>
	);
}
