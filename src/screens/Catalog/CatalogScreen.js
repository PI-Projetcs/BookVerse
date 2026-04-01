import React, { useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	SafeAreaView,
	StatusBar,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import BookCard from '../../components/BookCard';
import FooterNav from '../../components/FooterNav';
import { getCatalogBooks } from '../../services/bookService';
import { catalogStyles as styles } from '../../styles/catalogStyles';

const SORT_OPTIONS = [
	{ label: 'Titulo', value: 'title' },
	{ label: 'Nota', value: 'rating' },
	{ label: 'Ano', value: 'year' },
];

export default function CatalogScreen({ navigation }) {
	const [searchText, setSearchText] = useState('');
	const [sortBy, setSortBy] = useState('title');
	const [books, setBooks] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

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
					setErrorMessage('Nao foi possivel carregar os livros.');
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
				<Header title="BookVerse" subtitle="Descubra seu proximo livro" />

				<View style={styles.searchContainer}>
					<Ionicons name="search" size={18} color="#64748b" />
					<TextInput
						style={styles.searchInput}
						placeholder="Pesquisar livros..."
						placeholderTextColor="#94a3b8"
						value={searchText}
						onChangeText={setSearchText}
					/>
				</View>

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
							<Text style={styles.feedbackText}>Carregando catalogo...</Text>
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
							numColumns={2}
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
