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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import FooterNav from '../../components/FooterNav';
import { ADMIN_FOOTER_ITEMS } from '../../constants/adminFooterItems';
import { GENRE_CHIP_STYLES, normalizeGenreKey } from '../../constants/genreThemes';
import { deleteAdminBook, getAdminBooks, updateAdminBookStatus } from '../../services/bookService';
import { adminBooksStyles as styles } from '../../styles/adminBooksStyles';

const COVER_PLACEHOLDER = 'https://placehold.co/180x240/e5e7eb/475569?text=BookV';
const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

// Tela de gestão do catálogo de livros.
// Tecnologias utilizadas: React Native, FlatList, Ionicons, serviços de livros.
// Objetivo: listar, buscar, filtrar e atualizar o estado de publicação dos itens.
// Observações: o estado local espelha o backend para evitar recargas desnecessárias.

// Componente responsável pela manutenção do catálogo no painel admin.
// Tecnologias utilizadas: React, hooks, navegação e camada de serviço do backend.
// Objetivo: permitir edição, exclusão e ativação de livros com feedback imediato.
// Observações: useMemo reduz recomputações nos filtros e nos gêneros exibidos.
export default function AdminBooks({ navigation }) {
	const [books, setBooks] = useState([]);
	const [searchText, setSearchText] = useState('');
	const [genreFilter, setGenreFilter] = useState('Todos');
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	// Carrega a lista administrativa com tratamento de erro e estado de loading.
	// Tecnologias utilizadas: async/await e serviço getAdminBooks.
	// Objetivo: sincronizar a tela com os dados do catálogo exibidos no painel.
	// Observações: o finally garante que o indicador visual seja sempre encerrado.
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

	// Recarrega os dados ao voltar para a tela para evitar estado desatualizado.
	// Tecnologias utilizadas: navigation.addListener e cleanup do efeito.
	// Objetivo: refletir alterações feitas em telas vizinhas como cadastro e edição.
	// Observações: o listener mantém a lista consistente sem depender de navegação manual.
	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', loadBooks);
		return unsubscribe;
	}, [navigation]);

	// Calcula os gêneros disponíveis diretamente a partir dos livros carregados.
	// Tecnologias utilizadas: useMemo, Set e localeCompare.
	// Objetivo: montar filtros dinâmicos sem repetir categorias iguais.
	// Observações: a ordenação em pt-BR melhora a leitura da lista de chips.
	const genreOptions = useMemo(() => {
		const values = Array.from(new Set(books.map((book) => book.genre).filter(Boolean))).sort((a, b) =>
			String(a).localeCompare(String(b), 'pt-BR')
		);
		return ['Todos', ...values];
	}, [books]);

	// Aplica busca textual e filtro de gênero sobre a lista carregada.
	// Tecnologias utilizadas: useMemo, String helpers e Array.filter.
	// Objetivo: reduzir a lista exibida conforme a intenção do administrador.
	// Observações: normaliza o texto para tornar a busca mais tolerante a variações.
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

	// Abre a tela de cadastro em modo de edição com os dados do livro selecionado.
	// Tecnologias utilizadas: React Navigation e passagem de parâmetros.
	// Objetivo: reaproveitar o mesmo formulário para corrigir ou atualizar um item.
	// Observações: o token evita reaproveitamento de parâmetros antigos na navegação.
	const handleEdit = (book) => {
		navigation.navigate('RegisterBook', { bookData: book, editToken: Date.now() });
	};

	// Confirmação destrutiva antes de remover um livro do catálogo.
	// Tecnologias utilizadas: Alert, serviço de exclusão e atualização de estado local.
	// Objetivo: evitar exclusões acidentais com uma etapa explícita de confirmação.
	// Observações: o estado é filtrado localmente após o backend confirmar a remoção.
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

	// Alterna a disponibilidade pública do livro sem abrir outra tela.
	// Tecnologias utilizadas: updateAdminBookStatus e atualização otimista da lista.
	// Objetivo: ativar ou desativar a exibição do livro de forma direta.
	// Observações: o alerta cobre falhas de sincronização com o servidor.
	const handleToggleActive = async (book) => {
		try {
			const updated = await updateAdminBookStatus(book.id, !book.active);
			setBooks((prev) => prev.map((item) => (item.id === book.id ? { ...item, ...updated } : item)));
		} catch (error) {
			Alert.alert('Erro', 'Não foi possível atualizar a disponibilidade do livro.');
		}
	};

	// Renderiza cada card de livro com metadados, status e ações administrativas.
	// Tecnologias utilizadas: FlatList, Image, Ionicons e botões com feedback visual.
	// Objetivo: resumir rapidamente o conteúdo e o estado de cada título.
	// Observações: o card usa chips para leitura rápida e mantém botões com área tocável maior.
	const renderBookCard = ({ item }) => (
		(() => {
			const genreLabel = item.genre || 'Geral';
			const genreTheme = GENRE_CHIP_STYLES[normalizeGenreKey(genreLabel)] || null;
			const genreChipStyle = genreTheme
				? { backgroundColor: genreTheme.backgroundColor, borderColor: genreTheme.borderColor }
				: null;
			const genreTextStyle = genreTheme ? { color: genreTheme.textColor } : null;

			return (
			<View style={[styles.card, item.active === false ? { opacity: 0.72 } : null]}>
			<View style={styles.coverFrame}>
				<Image
					source={{ uri: item.coverUrl || COVER_PLACEHOLDER }}
					style={styles.cover}
					resizeMode="contain"
				/>
			</View>
			<Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
			<Text style={styles.cardAuthor} numberOfLines={1}>{item.author}</Text>
			<View style={styles.cardMeta}>
				<View style={[styles.cardMetaChip, genreChipStyle]}>
					<Text style={[styles.cardMetaChipText, genreTextStyle]} numberOfLines={1}>{genreLabel}</Text>
				</View>
					<View style={[styles.cardMetaChip, item.active === false ? { backgroundColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.35)' } : { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.25)' }]}>
						<Text style={[styles.cardMetaChipText, { color: item.active === false ? '#b91c1c' : '#047857' }]} numberOfLines={1}>
							{item.active === false ? 'Inativo' : 'Ativo'}
						</Text>
					</View>
				<View style={styles.cardMetaChip}>
					<Text style={styles.cardMetaChipText} numberOfLines={1}>{item.year || 'Sem ano'}</Text>
				</View>
				<View style={styles.cardMetaChip}>
					<Text style={styles.cardMetaChipText} numberOfLines={1}>{(item.chapters?.length || 0)} capítulos</Text>
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
					<TouchableOpacity
						style={[styles.cardActionButton, { backgroundColor: item.active === false ? '#ecfdf5' : '#fff1f2' }]}
						activeOpacity={0.85}
						onPress={() => handleToggleActive(item)}
						hitSlop={HIT_SLOP}
						accessibilityRole="button"
						accessibilityLabel={item.active === false ? `Ativar livro ${item.title}` : `Desativar livro ${item.title}`}
					>
						<Ionicons name={item.active === false ? 'checkmark-circle-outline' : 'ban-outline'} size={14} color={item.active === false ? '#047857' : '#b91c1c'} />
						<Text style={[styles.cardActionText, { color: item.active === false ? '#047857' : '#b91c1c' }]}>
							{item.active === false ? 'Ativar' : 'Desativar'}
						</Text>
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
				{/* Área de filtros e estatísticas da lista de livros. */}
				{/* Tecnologias utilizadas: TextInput, TouchableOpacity e chips de gênero. */}
				{/* Objetivo: localizar títulos e refinar a visualização por categoria. */}
				{/* Observações: o contador ajuda a entender rapidamente o recorte atual. */}
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

					<View style={styles.chipRow}>
						{genreOptions.map((option) => {
							const isActive = genreFilter === option;
							return (
								<TouchableOpacity
									key={option}
									style={[styles.chip, isActive && styles.chipActive]}
									onPress={() => setGenreFilter(option)}
									hitSlop={HIT_SLOP}
									accessibilityRole="button"
									accessibilityLabel={`Filtrar livros por ${option}`}
									accessibilityState={{ selected: isActive }}
								>
									<Text style={[styles.chipText, isActive && styles.chipTextActive]}>{option}</Text>
								</TouchableOpacity>
							);
						})}
					</View>
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