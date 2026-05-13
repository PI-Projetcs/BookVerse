import React, { useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Image,
	StatusBar,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import FooterNav from '../../components/FooterNav';
import { ADMIN_FOOTER_ITEMS } from '../../constants/adminFooterItems';
import { GENRE_CHIP_STYLES, normalizeGenreKey } from '../../constants/genreThemes';
import { deleteAdminBook, getAdminBooks } from '../../services/bookService';
import { adminBooksStyles as styles } from '../../styles/adminBooksStyles';

const COVER_PLACEHOLDER = 'https://placehold.co/180x240/e5e7eb/475569?text=BookV';
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

export default function AdminBooks({ navigation }) {
	const [books, setBooks] = useState([]);
	const [searchText, setSearchText] = useState('');
	const [genreFilter, setGenreFilter] = useState('Todos');
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	const loadBooks = async () => {
		try {
			setIsLoading(true);
			setErrorMessage('');
			const items = await getAdminBooks();
			setBooks(items);
		} catch (error) {
			setErrorMessage('Não foi possível carregar os livros cadastrados.');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadBooks();
	}, []);

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', loadBooks);
		return unsubscribe;
	}, [navigation]);

	const genreOptions = useMemo(() => {
		const values = Array.from(new Set(books.map((book) => book.genre).filter(Boolean))).sort((a, b) =>
			String(a).localeCompare(String(b), 'pt-BR')
		);
		return ['Todos', ...values];
	}, [books]);

	const filteredBooks = useMemo(() => {
		const query = searchText.trim().toLowerCase();
		return books.filter((book) => {
			const matchesGenre = genreFilter === 'Todos' || book.genre === genreFilter;
			const matchesQuery = !query || [book.title, book.author, book.genre]
				.join(' ')
				.toLowerCase()
				.includes(query);
			return matchesGenre && matchesQuery;
		});
	}, [books, genreFilter, searchText]);

	const handleEdit = (book) => {
		navigation.navigate('RegisterBook', { bookData: book, editToken: Date.now() });
	};

	const handleDelete = (book) => {
		Alert.alert('Excluir livro', `Deseja excluir "${book?.title || 'este livro'}"?`, [
			{ text: 'Cancelar', style: 'cancel' },
			{
				text: 'Excluir',
				style: 'destructive',
				onPress: async () => {
					try {
						await deleteAdminBook(book.id);
						setBooks((prev) => prev.filter((item) => item.id !== book.id));
					} catch (error) {
						Alert.alert('Erro', 'Não foi possível excluir o livro selecionado.');
					}
				},
			},
		]);
	};

	const renderBookCard = ({ item }) => (
		(() => {
			const genreLabel = item.genre || 'Geral';
			const genreTheme = GENRE_CHIP_STYLES[normalizeGenreKey(genreLabel)] || null;
			const genreChipStyle = genreTheme
				? { backgroundColor: genreTheme.backgroundColor, borderColor: genreTheme.borderColor }
				: null;
			const genreTextStyle = genreTheme ? { color: genreTheme.textColor } : null;

			return (
		<View style={styles.card}>
			<Image source={{ uri: item.coverUrl || COVER_PLACEHOLDER }} style={styles.cover} />
			<Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
			<Text style={styles.cardAuthor} numberOfLines={1}>{item.author}</Text>
			<View style={styles.cardMeta}>
				<View style={[styles.cardMetaChip, genreChipStyle]}>
					<Text style={[styles.cardMetaChipText, genreTextStyle]}>{genreLabel}</Text>
				</View>
				<View style={styles.cardMetaChip}>
					<Text style={styles.cardMetaChipText}>{item.year || 'Sem ano'}</Text>
				</View>
			</View>
			<View style={styles.cardActions}>
				<TouchableOpacity
					style={[styles.cardActionButton, styles.editButton]}
					activeOpacity={0.85}
					onPress={() => handleEdit(item)}
					hitSlop={HIT_SLOP}
					accessibilityRole="button"
					accessibilityLabel={`Editar livro ${item.title}`}
				>
					<Ionicons name="create-outline" size={14} color="#0f766e" />
					<Text style={[styles.cardActionText, { color: '#0f766e' }]}>Editar</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.cardActionButton, styles.deleteButton]}
					activeOpacity={0.85}
					onPress={() => handleDelete(item)}
					hitSlop={HIT_SLOP}
					accessibilityRole="button"
					accessibilityLabel={`Excluir livro ${item.title}`}
				>
					<Ionicons name="trash-outline" size={14} color="#9f1239" />
					<Text style={[styles.cardActionText, { color: '#9f1239' }]}>Excluir</Text>
				</TouchableOpacity>
			</View>
		</View>
			);
		})()
	);

	return (
		<View style={styles.screen}>
			<StatusBar barStyle="light-content" />
			<Header
				title="BookV"
				subtitle="Livros cadastrados"
				onRightAction={() => navigation.navigate('RegisterBook')}
				rightActionLabel="Cadastrar"
				rightActionIcon="add-outline"
			/>

			<View style={styles.content}>
				<View style={styles.filtersWrap}>
					<View style={styles.metaRow}>
						<View>
							<Text style={styles.metaTitle}>Livros</Text>
							<Text style={styles.metaSubtitle}>{filteredBooks.length} livros encontrados</Text>
						</View>
					</View>

					<View style={styles.searchContainer}>
						<Ionicons name="search" size={18} color="#64748b" />
						<TextInput
							value={searchText}
							onChangeText={setSearchText}
							placeholder="Buscar por título, autor ou categoria"
							placeholderTextColor="#94a3b8"
							style={styles.searchInput}
							accessibilityLabel="Buscar livros cadastrados"
						/>
					</View>

					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
						{genreOptions.map((option) => {
							const isActive = genreFilter === option;
							return (
								<TouchableOpacity
									key={option}
									style={[styles.filterChip, isActive && styles.filterChipActive]}
									onPress={() => setGenreFilter(option)}
									hitSlop={HIT_SLOP}
									accessibilityRole="button"
									accessibilityLabel={`Filtrar livros por ${option}`}
									accessibilityState={{ selected: isActive }}
								>
									<Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{option}</Text>
								</TouchableOpacity>
							);
						})}
					</ScrollView>
				</View>

				<View style={styles.contentArea}>
					{isLoading ? (
						<View style={styles.feedbackContainer}>
							<ActivityIndicator size="large" color="#0f766e" />
							<Text style={styles.feedbackText}>Carregando livros...</Text>
						</View>
					) : null}

					{!isLoading && !!errorMessage ? (
						<View style={styles.feedbackContainer}>
							<Text style={styles.errorText}>{errorMessage}</Text>
						</View>
					) : null}

					{!isLoading && !errorMessage ? (
						<FlatList
							data={filteredBooks}
							numColumns={2}
							keyExtractor={(item) => String(item.id)}
							columnWrapperStyle={styles.columnWrapper}
							contentContainerStyle={styles.listContent}
							renderItem={renderBookCard}
							ListEmptyComponent={
								<View style={styles.feedbackContainer}>
									<Ionicons name="library-outline" size={28} color="#94a3b8" />
										<Text style={styles.feedbackText}>Nenhum livro encontrado com esses filtros.</Text>
								</View>
							}
						/>
					) : null}
				</View>
			</View>

			<FooterNav navigation={navigation} activeKey="livros" items={ADMIN_FOOTER_ITEMS} />
		</View>
	);
}