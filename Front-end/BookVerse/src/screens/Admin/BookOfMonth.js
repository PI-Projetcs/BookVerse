import React, { useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	ScrollView,
	StatusBar,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FooterNav from '../../components/FooterNav';
import Header from '../../components/Header';
import { ADMIN_FOOTER_ITEMS } from '../../constants/adminFooterItems';
import { getAdminBooks } from '../../services/bookService';
import { getHomeViewModel, updateBookOfMonth } from '../../services/homeService';
import { adminBookOfMonthStyles as styles } from '../../styles/adminBookOfMonthStyles';

const COVER_PLACEHOLDER = 'https://placehold.co/180x240/e5e7eb/475569?text=BookV';
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

export default function BookOfMonth({ navigation }) {
	const [books, setBooks] = useState([]);
	const [searchText, setSearchText] = useState('');
	const [currentBookId, setCurrentBookId] = useState(null);
	const [currentBookTitle, setCurrentBookTitle] = useState('Nenhum livro definido');
	const [isLoading, setIsLoading] = useState(true);
	const [isSavingId, setIsSavingId] = useState(null);
	const [errorMessage, setErrorMessage] = useState('');

	const loadData = async () => {
		try {
			setIsLoading(true);
			setErrorMessage('');
			const [adminBooks, homeViewModel] = await Promise.all([getAdminBooks(), getHomeViewModel()]);
			setBooks(adminBooks);
			setCurrentBookId(homeViewModel?.bookOfMonth?.id || null);
			setCurrentBookTitle(homeViewModel?.bookOfMonth?.title || 'Nenhum livro definido');
		} catch (error) {
			setErrorMessage('Não foi possível carregar os livros.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const filteredBooks = useMemo(() => {
		const query = searchText.trim().toLowerCase();
		if (!query) {
			return books;
		}

		return books.filter((book) =>
			[book.title, book.author, book.genre].join(' ').toLowerCase().includes(query)
		);
	}, [books, searchText]);

	const handleSetBookOfMonth = async (book) => {
		try {
			setIsSavingId(book.id);
			const updated = await updateBookOfMonth(book);
			setCurrentBookId(updated?.id || book.id);
			setCurrentBookTitle(updated?.title || book.title);
			Alert.alert('Livro do mês atualizado', 'A tela inicial dos usuários já receberá este livro.');
		} catch (error) {
			Alert.alert('Erro', 'Não foi possível atualizar o livro do mês agora.');
		} finally {
			setIsSavingId(null);
		}
	};

	return (
		<View style={styles.screen}>
			<StatusBar barStyle="light-content" />
			<Header
				title="BookV"
				subtitle="Definir livro do mês"
				onRightAction={() => navigation.navigate('Admin')}
				rightActionLabel="Painel"
				rightActionIcon="grid-outline"
			/>

			<View style={styles.content}>
				<ScrollView contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
					<View style={styles.currentCard}>
						<Text style={styles.currentTitle}>Livro atual</Text>
						<Text style={styles.currentSubtitle}>{currentBookTitle}</Text>
					</View>

					<View style={styles.searchContainer}>
						<Ionicons name="search" size={18} color="#64748b" />
						<TextInput
							value={searchText}
							onChangeText={setSearchText}
							placeholder="Buscar por título, autor ou categoria"
							placeholderTextColor="#94a3b8"
							style={styles.searchInput}
							accessibilityLabel="Buscar candidatos para livro do mês"
						/>
					</View>

					{isLoading ? (
						<View style={styles.feedbackWrap}>
							<ActivityIndicator size="large" color="#0f766e" />
							<Text style={styles.feedbackText}>Carregando livros...</Text>
						</View>
					) : null}

					{!isLoading && !!errorMessage ? (
						<View style={styles.feedbackWrap}>
							<Text style={styles.feedbackText}>{errorMessage}</Text>
						</View>
					) : null}

					{!isLoading && !errorMessage
						? filteredBooks.map((book) => {
								const isCurrent = Number(currentBookId) === Number(book.id);
								return (
									<View key={book.id} style={styles.bookCard}>
										<Image source={{ uri: book.coverUrl || COVER_PLACEHOLDER }} style={styles.cover} />
										<View style={styles.bookInfo}>
											<Text style={styles.bookTitle}>{book.title}</Text>
											<Text style={styles.bookAuthor}>{book.author}</Text>
											<View style={styles.metaRow}>
												<View style={styles.metaChip}>
													<Text style={styles.metaChipText}>{book.genre || 'Geral'}</Text>
												</View>
												<View style={styles.metaChip}>
													<Text style={styles.metaChipText}>{book.year || 'Sem ano'}</Text>
												</View>
											</View>
											<TouchableOpacity
												style={[styles.setButton, isCurrent && styles.setButtonActive]}
												onPress={() => handleSetBookOfMonth(book)}
												disabled={isSavingId === book.id}
												hitSlop={HIT_SLOP}
												accessibilityRole="button"
												accessibilityLabel={isCurrent ? `${book.title} já é o livro do mês` : `Definir ${book.title} como livro do mês`}
												accessibilityState={{ disabled: isSavingId === book.id, selected: isCurrent }}
											>
												{isSavingId === book.id ? (
													<ActivityIndicator size="small" color="#0f766e" />
												) : (
													<>
														<Ionicons
															name={isCurrent ? 'checkmark-circle-outline' : 'star-outline'}
															size={14}
															color="#0f766e"
														/>
														<Text style={styles.setButtonText}>
															{isCurrent ? 'Livro do mês atual' : 'Definir como livro do mês'}
														</Text>
													</>
												)}
											</TouchableOpacity>
										</View>
									</View>
								);
							})
						: null}
				</ScrollView>
			</View>

			<FooterNav navigation={navigation} activeKey="admin" items={ADMIN_FOOTER_ITEMS} />
		</View>
	);
}
