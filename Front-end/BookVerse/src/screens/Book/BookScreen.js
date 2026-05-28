import React, { useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	StatusBar,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BookCard from '../../components/BookCard';
import FooterNav from '../../components/FooterNav';
import { getCatalogBooks } from '../../services/bookService';
import { catalogStyles as styles } from '../../styles/catalogStyles';

const SORT_OPTIONS = [
	{ label: 'Ano', value: 'year' },
	{ label: 'Autor', value: 'author' },
	{ label: 'Avaliação', value: 'rating' },
	{ label: 'Gênero', value: 'genre' },
	{ label: 'Título', value: 'title' },
];
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

/*
 * Tela Catálogo (BookScreen)
 * - Permite pesquisar e ordenar livros usando `getCatalogBooks`.
 * - Exibe resultados em grade com `BookCard` e trata erros comuns de autorização.
 */

// Opções de ordenação apresentadas ao usuário

export default function BookScreen({ navigation }) {
	const insets = useSafeAreaInsets();

	const [searchText, setSearchText] = useState('');
	const [sortBy, setSortBy] = useState('title');
	const [books, setBooks] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	// Busca livros no backend com debounce (350ms). Trata erros HTTP
	// comuns (401 = sessão expirada, 403 = sem permissão) exibindo mensagens
	// amigáveis ao usuário.
	useEffect(() => {
		let isMounted = true;
		const timer = setTimeout(async () => {
			try {
				setIsLoading(true);
				setErrorMessage('');
				const result = await getCatalogBooks({ query: searchText, sortBy });
				if (isMounted) {
					setBooks(result);
				}
			} catch (error) {
				if (isMounted) {
					const statusCode = error?.response?.status;
					if (statusCode === 401) {
						setErrorMessage('Sessao expirada ou login invalido. Entre novamente para ver o catalogo.');
					} else if (statusCode === 403) {
						setErrorMessage('Seu usuario nao tem permissao para listar livros.');
					} else {
						setErrorMessage('Nao foi possivel carregar os livros.');
					}
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}, 350);

		return () => {
			isMounted = false;
			clearTimeout(timer);
		};
	}, [searchText, sortBy]);

	const totalBooksText = useMemo(() => `${books.length} livros`, [books.length]);

	// Navega para a tela de detalhes do livro selecionado. Se a navegação
	// não estiver disponível, exibe um alerta como fallback.
	const handleSelectBook = (book) => {
		if (navigation && typeof navigation.navigate === 'function') {
			navigation.navigate('BookDetails', { id: book?.id });
			return;
		}

		Alert.alert('Livro selecionado', book?.title || 'Livro');
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="light-content" />
			<View style={styles.container}>
				<LinearGradient
					colors={['#6B0F2E', '#0a0f1a', '#003D2B']}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					style={[styles.searchHeader, { paddingTop: insets.top + 8 }]}
				>
					<View style={styles.brandRow}>
						<MaterialCommunityIcons name="book-open-page-variant" size={28} color="#facc15" />
						<Text style={styles.brandTitle}>BookVerse</Text>
					</View>
					<View style={styles.searchContainer}>
						<Ionicons name="search" size={18} color="#64748b" />
						<TextInput
							style={styles.searchInput}
							placeholder="Pesquisar livros..."
							placeholderTextColor="#94a3b8"
							value={searchText}
							onChangeText={setSearchText}
							accessibilityLabel="Pesquisar livros no catálogo"
						/>
					</View>
				</LinearGradient>

				<View style={styles.metaRow}>
					<Text style={styles.totalBooks}>{totalBooksText}</Text>
					<View style={styles.sortRow}>
						{SORT_OPTIONS.map((option) => {
							const isActive = option.value === sortBy;
							return (
								<TouchableOpacity
									key={option.value}
									style={[styles.sortChip, isActive && styles.sortChipActive]}
									onPress={() => setSortBy(option.value)}
									hitSlop={HIT_SLOP}
									accessibilityRole="button"
									accessibilityLabel={`Ordenar livros por ${option.label}`}
									accessibilityState={{ selected: isActive }}
								>
									<Text style={[styles.sortChipText, isActive && styles.sortChipTextActive]}>
										{option.label}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>
				</View>

				<View style={styles.contentArea}>
					{isLoading ? (
						<View style={styles.feedbackContainer}>
							<ActivityIndicator size="large" color="#0f766e" />
							<Text style={styles.feedbackText}>Carregando catálogo...</Text>
						</View>
					) : null}

					{!isLoading && !!errorMessage ? (
						<View style={styles.feedbackContainer}>
							<Text style={styles.errorText}>{errorMessage}</Text>
						</View>
					) : null}

					{!isLoading && !errorMessage ? (
						<FlatList
							data={books}
							numColumns={3}
							keyExtractor={(item, index) => String(item?.id ?? index)}
							columnWrapperStyle={styles.columnWrapper}
							contentContainerStyle={styles.listContent}
							renderItem={({ item }) => <BookCard book={item} onPress={handleSelectBook} />}
							ListEmptyComponent={
								<View style={styles.feedbackContainer}>
									<Text style={styles.feedbackText}>Nenhum livro encontrado.</Text>
								</View>
							}
						/>
					) : null}
				</View>

				<FooterNav navigation={navigation} activeKey="livros" />
			</View>
		</SafeAreaView>
	);
}
