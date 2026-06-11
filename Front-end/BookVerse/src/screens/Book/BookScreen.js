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

// Opções de ordenação exibidas no topo do catálogo.
// Tecnologias utilizadas: arrays estáticos e renderização de chips.
// Objetivo: permitir trocar rapidamente o critério de organização dos livros.
// Observações: a lista centralizada evita repetir rótulos pelo componente.
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

// Área de toque ampliada para botões de filtros e seleção de livros.
// Tecnologias utilizadas: propriedade hitSlop do React Native.
// Objetivo: melhorar a usabilidade em telas menores ou toques imprecisos.
// Observações: ajuda acessibilidade sem alterar a aparência visual.

// Tela de catálogo de livros.
// Tecnologias utilizadas: React Native, FlatList, SafeAreaView, serviços de catálogo.
// Objetivo: permitir busca, ordenação e navegação para detalhes dos livros.
// Observações: a tela prioriza resposta rápida com debounce e feedback de erro amigável.

// Componente responsável por listar o catálogo e abrir os detalhes do livro.
// Tecnologias utilizadas: React hooks, Ionicons, MaterialCommunityIcons, LinearGradient.
// Objetivo: oferecer uma vitrine navegável com pesquisa e ordenação.
// Observações: o layout em grade melhora a exploração visual do acervo.
export default function BookScreen({ navigation }) {
	const insets = useSafeAreaInsets();

	const [searchText, setSearchText] = useState('');
	const [sortBy, setSortBy] = useState('title');
	const [books, setBooks] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	// Busca o catálogo com debounce para reduzir chamadas enquanto o usuário digita.
	// Tecnologias utilizadas: useEffect, setTimeout, getCatalogBooks, estados locais.
	// Objetivo: carregar livros filtrados por texto e ordenação sem travar a interface.
	// Observações: o tratamento de 401 e 403 evita mensagens genéricas demais.
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

	// Resume a quantidade de itens visíveis no catálogo.
	// Tecnologias utilizadas: useMemo.
	// Objetivo: exibir um contador simples para orientar a leitura da lista.
	// Observações: evita recomputar o texto quando o número de livros não muda.
	const totalBooksText = useMemo(() => `${books.length} livros`, [books.length]);

	// Abre a tela de detalhes do livro selecionado.
	// Tecnologias utilizadas: React Navigation e Alert como fallback.
	// Objetivo: levar o usuário do catálogo para o conteúdo completo do livro.
	// Observações: o fallback evita falha silenciosa caso a navegação não exista.
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
				{/* Cabeçalho com busca e identidade visual do catálogo. */}
				{/* Tecnologias utilizadas: LinearGradient, TextInput, ícones e safe area. */}
				{/* Objetivo: concentrar pesquisa e reforçar a marca do app. */}
				{/* Observações: o padding considera insets para não colidir com a status bar. */}
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

				{/* Linha de contexto com total e opções de ordenação. */}
				{/* Tecnologias utilizadas: useMemo, TouchableOpacity e chips de filtro. */}
				{/* Objetivo: permitir troca rápida do critério de ordenação. */}
				{/* Observações: hitSlop amplia a área tocável em dispositivos menores. */}
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
					{/* Feedback de carregamento, erro e lista principal do catálogo. */}
					{/* Tecnologias utilizadas: ActivityIndicator, FlatList e renderização condicional. */}
					{/* Objetivo: mostrar o estado atual da consulta antes de exibir os livros. */}
					{/* Observações: o estado vazio evita uma tela sem contexto quando não há resultados. */}
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
